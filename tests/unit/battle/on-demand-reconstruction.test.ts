import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBattleSnapshot } from "@/lib/battle/service";
import { MemoryBattleStore } from "@/lib/storage/battle-store";

describe("On-Demand Serverless Battle Reconstruction", () => {
  let mockStore: MemoryBattleStore;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStore = new MemoryBattleStore();
  });

  it("reconstructs missing GitHub battle snapshot on-demand when absent from store (Vercel serverless behavior)", async () => {
    const battleId = "gh-alice-vs-bob-a1b2c3d4e5f6";

    // 1. Verify snapshot is completely absent from the store initially
    const initialGet = await mockStore.get(battleId);
    expect(initialGet).toBeNull();

    // 2. Mock GitHub API responses for alice and bob
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);

      if (urlStr.includes("/users/alice/repos")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 1,
              name: "project-a",
              full_name: "alice/project-a",
              html_url: "https://github.com/alice/project-a",
              stargazers_count: 500,
              forks_count: 50,
              language: "TypeScript",
              fork: false,
              updated_at: new Date().toISOString(),
              created_at: "2023-01-01T00:00:00Z",
            },
          ],
        } as Response;
      }

      if (urlStr.includes("/users/alice")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            login: "alice",
            name: "Alice Dev",
            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
            public_repos: 5,
            followers: 120,
            following: 30,
            bio: "Building cool stuff",
            created_at: "2020-01-01T00:00:00Z",
          }),
        } as Response;
      }

      if (urlStr.includes("/users/bob/repos")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 2,
              name: "project-b",
              full_name: "bob/project-b",
              html_url: "https://github.com/bob/project-b",
              stargazers_count: 100,
              forks_count: 10,
              language: "Python",
              fork: false,
              updated_at: new Date().toISOString(),
              created_at: "2023-01-01T00:00:00Z",
            },
          ],
        } as Response;
      }

      if (urlStr.includes("/users/bob")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            login: "bob",
            name: "Bob Builder",
            avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
            public_repos: 3,
            followers: 40,
            following: 10,
            bio: "Coding all day",
            created_at: "2021-01-01T00:00:00Z",
          }),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: "Not found" }),
      } as Response;
    });

    // 3. getBattleSnapshot must reconstruct on-demand instead of returning null
    const snapshot = await getBattleSnapshot(battleId, mockStore);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.id).toBe(battleId);
    expect(snapshot?.platform).toBe("github");
    expect(snapshot?.player1.handle.toLowerCase()).toBe("alice");
    expect(snapshot?.player2.handle.toLowerCase()).toBe("bob");
    expect(snapshot?.verdict.outcome).toBe("win");
    expect(snapshot?.verdict.winnerHandle.toLowerCase()).toBe("alice");

    // 4. Verify snapshot is now safely cached in store for subsequent requests
    const cached = await mockStore.get(battleId);
    expect(cached).not.toBeNull();
    expect(cached?.id).toBe(battleId);
  });

  it("deduplicates concurrent on-demand reconstruction calls without create-only collision", async () => {
    const battleId = "gh-alice-vs-bob-a1b2c3d4e5f6";

    const [snap1, snap2] = await Promise.all([
      getBattleSnapshot(battleId, mockStore),
      getBattleSnapshot(battleId, mockStore),
    ]);

    expect(snap1).not.toBeNull();
    expect(snap2).not.toBeNull();
    expect(snap1?.id).toBe(battleId);
    expect(snap2?.id).toBe(battleId);
  });
});
