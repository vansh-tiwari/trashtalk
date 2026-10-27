import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeBattleFlow, getBattleSnapshot } from "@/lib/battle/service";
import { memoryBattleStore, defaultBattleStore } from "@/lib/storage/battle-store";
import { GET as getBattleHandler } from "@/app/api/battles/[id]/route";
import { POST as postBattleHandler } from "@/app/api/battles/route";
import { NextRequest } from "next/server";

describe("Battle Lifecycle & Snapshot Persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the pre-seeded instant demo battle immediately from default store", async () => {
    const demo = await defaultBattleStore.get("cf-tourist-vs-petr-legendary");
    expect(demo).not.toBeNull();
    expect(demo?.id).toBe("cf-tourist-vs-petr-legendary");
    expect(demo?.player1.handle).toBe("tourist");
    expect(demo?.player2.handle).toBe("Petr");
    expect(demo?.verdict.outcome).toBe("win");
    expect(demo?.overlap.commonCount).toBeGreaterThan(0);
    expect(demo?.commentary.headToHeadRoast).toBeTruthy();
  });

  it("serves the pre-seeded instant demo via the API route with immutable headers", async () => {
    const req = new NextRequest("http://localhost:3000/api/battles/cf-tourist-vs-petr-legendary");
    const res = await getBattleHandler(req, {
      params: Promise.resolve({ id: "cf-tourist-vs-petr-legendary" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("cf-tourist-vs-petr-legendary");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
  });

  it("returns 404 for unknown battle ids in API route", async () => {
    const req = new NextRequest("http://localhost:3000/api/battles/non-existent-id");
    const res = await getBattleHandler(req, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Battle snapshot not found");
  });

  it("returns 400 when creating battle with missing handles", async () => {
    const req = new NextRequest("http://localhost:3000/api/battles", {
      method: "POST",
      body: JSON.stringify({ u1: "tourist" }), // missing u2
    });

    const res = await postBattleHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("required");
  });

  it("creates an immutable snapshot with canonical ID and retrieves it without re-fetching", async () => {
    // Route mock requests by URL
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("user.info?handles=alpha")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "OK",
            result: [{ handle: "alpha", rating: 2200, maxRating: 2300, rank: "master" }],
          }),
        } as Response;
      }
      if (url.includes("user.info?handles=beta")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "OK",
            result: [{ handle: "beta", rating: 1700, maxRating: 1800, rank: "expert" }],
          }),
        } as Response;
      }
      if (url.includes("user.status")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "OK",
            result: [
              {
                id: 1,
                contestId: 10,
                creationTimeSeconds: 1600000000,
                problem: { contestId: 10, index: "A", name: "P1", rating: 1200, tags: ["dp"] },
                verdict: "OK",
              },
            ],
          }),
        } as Response;
      }
      if (url.includes("user.rating")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "OK", result: [] }),
        } as Response;
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({ status: "FAILED", comment: "Not found" }),
      } as Response;
    });

    const snapshot = await executeBattleFlow({
      u1: "alpha",
      u2: "beta",
      persona: "savage_dev",
      store: memoryBattleStore,
    });

    expect(snapshot.id).toBeTruthy();
    expect(snapshot.verdict.winnerHandle).toBe("alpha");
    expect(snapshot.overlap.commonCount).toBe(1);

    // Fetch snapshot directly from store using canonical ID
    const retrieved = await getBattleSnapshot(snapshot.id, memoryBattleStore);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(snapshot.id);
    expect(retrieved?.verdict.winnerHandle).toBe("alpha");
    expect(retrieved?.commentary.headToHeadRoast).toBe(snapshot.commentary.headToHeadRoast);
  });

  it("fails to create battle when a player is not found", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("user.info?handles=valid_player")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "OK",
            result: [{ handle: "valid_player", rating: 1500 }],
          }),
        } as Response;
      }
      return {
        ok: false,
        status: 400,
        json: async () => ({ status: "FAILED", comment: "handles: User not found" }),
      } as Response;
    });

    await expect(
      executeBattleFlow({
        u1: "non_existent_player",
        u2: "valid_player",
        store: memoryBattleStore,
      })
    ).rejects.toThrow('User "non_existent_player" not found on Codeforces.');
  });
});
