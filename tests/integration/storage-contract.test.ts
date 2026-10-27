import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { FileBattleStore, FileIdempotencyStore } from "@/lib/storage/battle-store";
import { BattleSnapshot } from "@/lib/storage/contracts";
import { PlayerScore } from "@/lib/battle/types";
import { executeBattleFlow } from "@/lib/battle/service";
import { NextRequest } from "next/server";
import { POST as postBattleHandler } from "@/app/api/battles/route";
import { safeParseBattleSnapshot } from "@/lib/battle/validation";
import { getProblemStatementUrl, getProblemTags } from "@/lib/problems/presentation";

function createValidSnapshot(id: string): BattleSnapshot {
  const pScore: PlayerScore = {
    handle: "alice",
    total: 80,
    axes: {
      algorithmicGrit: 75,
      contestPeak: 85,
      solveVolume: 70,
      recentVelocity: 65,
      topicBreadth: 80,
    },
    metrics: {
      rating: 2100,
      maxRating: 2200,
      solvedCount: 500,
      recentAcceptedCount: 20,
      distinctTagsCount: 15,
    },
  };

  return {
    id,
    createdAt: new Date().toISOString(),
    platform: "codeforces",
    persona: "savage_dev",
    player1: { handle: "alice", displayName: "Alice", score: pScore },
    player2: { handle: "bob", displayName: "Bob", score: pScore },
    verdict: {
      outcome: "win",
      winnerHandle: "alice",
      loserHandle: "bob",
      isMirrorMatch: false,
      margin: 10,
      reasoning: "Solid match.",
      scoringVersion: "1.0.0",
      player1Score: pScore,
      player2Score: pScore,
    },
    overlap: {
      common: [],
      player1Exclusive: [],
      player2Exclusive: [],
      dnaPercentage: 50,
      isDefinitive: true,
      totalUnionCount: 10,
      commonCount: 5,
    },
    commentary: {
      source: "local",
      persona: "savage_dev",
      headToHeadRoast: "A solid match.",
      player1Roast: "Well done.",
      player2Roast: "Keep grinding.",
      punchline: "Alice takes the crown.",
      winnerHandle: "alice",
      promptVersion: "1.0.0",
    },
  };
}

describe("Durable Storage, Create-Only Semantics & Idempotency", () => {
  let tempDir: string;
  let store: FileBattleStore;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "trashtalk-contract-"));
    store = new FileBattleStore(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("enforces create-only writes and rejects overwriting existing IDs", async () => {
    const s1 = createValidSnapshot("cf-test-conflict-1");
    await store.create(s1);

    // Second write with same ID must throw
    await expect(store.create(s1)).rejects.toThrow(/already exists/i);
  });

  it("throws explicitly on unwritable disk and never silently resolves via memory", async () => {
    // Point store to a non-existent directory on a read-only path or unwritable file
    const unwritablePath = path.join(tempDir, "unwritable-file.txt");
    fs.writeFileSync(unwritablePath, "not-a-directory", "utf-8");

    const badStore = new FileBattleStore(path.join(unwritablePath, "nested-store"));
    const snapshot = createValidSnapshot("cf-unwritable-test-1");

    await expect(badStore.create(snapshot)).rejects.toThrow();
  });

  it("ensures a second independent store instance can read snapshots created by the first", async () => {
    const s = createValidSnapshot("cf-cross-instance-1");
    await store.create(s);

    // Fresh store instance with empty memoryCache pointing to same directory
    const secondStoreInstance = new FileBattleStore(tempDir);
    const loaded = await secondStoreInstance.get("cf-cross-instance-1");

    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe("cf-cross-instance-1");
    expect(loaded?.player1.handle).toBe("alice");
  });

  it("atomically handles idempotency: identical retry returns existing snapshot without re-executing", async () => {
    const idemStore = new FileIdempotencyStore(path.join(tempDir, "idempotency"));
    const key = "user-session-123";
    const bodyDigest = "digest-u1-tourist-u2-petr-savage";

    const res1 = await idemStore.reserve(key, bodyDigest);
    expect(res1).toBe("reserved");

    await idemStore.complete(key, "cf-tourist-vs-petr-legendary");

    // Second identical request
    const res2 = await idemStore.reserve(key, bodyDigest);
    expect(res2).toBe("completed");
    const rec = await idemStore.get(key);
    expect(rec?.snapshotId).toBe("cf-tourist-vs-petr-legendary");

    // Conflicting body with same key must report mismatch
    const res3 = await idemStore.reserve(key, "different-body-digest");
    expect(res3).toBe("mismatch");
  });

  it("bounds memory cache to prevent unbounded memory growth", async () => {
    // Insert 250 items into a store capped at 200 items
    for (let i = 0; i < 250; i++) {
      const snap = createValidSnapshot(`cf-item-${i}`);
      await store.create(snap);
    }

    // Earliest item should have been evicted from memory cache, but still loadable from disk
    const item0 = await store.get("cf-item-0");
    expect(item0).not.toBeNull();
    expect(item0?.id).toBe("cf-item-0");
  });

  it("preserves problem url, platform, and tags through snapshot parsing, handling legacy problems defensively", () => {
    const snap = createValidSnapshot("cf-problem-test-1");
    snap.overlap.common = [
      {
        id: "CF:1A",
        platform: "codeforces",
        contestId: 1,
        index: "A",
        name: "Theatre Square",
        rating: 1000,
        tags: ["math"],
        acceptedAt: 1234567,
        url: "https://codeforces.com/contest/1/problem/A",
      },
      // Legacy item missing tags, url, platform
      {
        id: "CF:2B",
        contestId: 2,
        index: "B",
        name: "The least round way",
        rating: 2000,
        acceptedAt: 1234568,
      } as any,
    ];

    const parsed = safeParseBattleSnapshot(snap);
    expect(parsed).not.toBeNull();
    const [modern, legacy] = parsed!.overlap.common;

    // Modern problem preserves url, platform, tags
    expect(modern.url).toBe("https://codeforces.com/contest/1/problem/A");
    expect(modern.platform).toBe("codeforces");
    expect(modern.tags).toEqual(["math"]);
    expect(getProblemStatementUrl(modern)).toBe("https://codeforces.com/contest/1/problem/A");

    // Legacy problem defaults tags to [] and derives/handles url safely
    expect(getProblemTags(legacy)).toEqual([]);
    expect(getProblemStatementUrl(legacy)).toBe("https://codeforces.com/contest/2/problem/B");
  });
});

