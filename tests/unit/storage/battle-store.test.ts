import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { FileBattleStore } from "@/lib/storage/battle-store";
import { BattleSnapshot } from "@/lib/storage/contracts";
import { PlayerScore } from "@/lib/battle/types";

describe("FileBattleStore Security & Containment", () => {
  let tempDir: string;
  let store: FileBattleStore;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "trashtalk-test-store-"));
    store = new FileBattleStore(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it("rejects path traversal attempts such as ../ and encoded separators", async () => {
    // Write a decoy file outside the store directory
    const decoyPath = path.join(tempDir, "..", "decoy-secret.json");
    fs.writeFileSync(decoyPath, JSON.stringify({ secret: "exposed" }), "utf-8");

    try {
      // Direct relative traversal
      const result1 = await store.get("../decoy-secret");
      expect(result1).toBeNull();

      // Deep traversal
      const result2 = await store.get("../../package");
      expect(result2).toBeNull();

      // Backslash traversal
      const result3 = await store.get("..\\decoy-secret");
      expect(result3).toBeNull();

      // Encoded traversal string
      const result4 = await store.get("..%2Fdecoy-secret");
      expect(result4).toBeNull();
    } finally {
      try {
        fs.unlinkSync(decoyPath);
      } catch {
        // ignore
      }
    }
  });

  it("rejects invalid/corrupt or non-snapshot JSON even if present on disk", async () => {
    // Put a harmless arbitrary JSON file inside the store directory
    const foreignFile = path.join(tempDir, "foreign-config.json");
    fs.writeFileSync(foreignFile, JSON.stringify({ name: "my-package", version: "1.0.0" }), "utf-8");

    const result = await store.get("foreign-config");
    expect(result).toBeNull();
  });

  it("stores and retrieves a valid BattleSnapshot within the contained directory", async () => {
    const p1Score: PlayerScore = {
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

    const p2Score: PlayerScore = {
      handle: "bob",
      total: 70,
      axes: {
        algorithmicGrit: 65,
        contestPeak: 75,
        solveVolume: 60,
        recentVelocity: 60,
        topicBreadth: 70,
      },
      metrics: {
        rating: 1900,
        maxRating: 1950,
        solvedCount: 400,
        recentAcceptedCount: 15,
        distinctTagsCount: 12,
      },
    };

    const validSnapshot: BattleSnapshot = {
      id: "cf-alice-vs-bob-123456",
      createdAt: new Date().toISOString(),
      platform: "codeforces",
      persona: "savage_dev",
      player1: {
        handle: "alice",
        displayName: "Alice",
        score: p1Score,
      },
      player2: {
        handle: "bob",
        displayName: "Bob",
        score: p2Score,
      },
      verdict: {
        outcome: "win",
        winnerHandle: "alice",
        loserHandle: "bob",
        isMirrorMatch: false,
        margin: 10,
        reasoning: "Alice dominated on peak and grit.",
        scoringVersion: "1.0.0",
        player1Score: p1Score,
        player2Score: p2Score,
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

    await store.save(validSnapshot);
    const retrieved = await store.get("cf-alice-vs-bob-123456");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe("cf-alice-vs-bob-123456");
    expect(retrieved?.verdict.winnerHandle).toBe("alice");
  });
});
