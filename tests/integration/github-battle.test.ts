import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeBattleFlow, getBattleSnapshot } from "@/lib/battle/service";
import { MemoryBattleStore } from "@/lib/storage/battle-store";

describe("GitHub Battle Lifecycle & Storage Integration", () => {
  let mockStore: MemoryBattleStore;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStore = new MemoryBattleStore();
  });

  it("successfully retrieves the prepared offline GitHub demo without network calls", async () => {
    const snapshot = await getBattleSnapshot("gh-torvalds-vs-antirez-legendary", mockStore);
    expect(snapshot).toBeDefined();
    expect(snapshot?.platform).toBe("github");
    expect(snapshot?.player1.handle).toBe("torvalds");
    expect(snapshot?.player2.handle).toBe("antirez");
    expect(snapshot?.verdict.outcome).toBe("win");
    expect(snapshot?.verdict.winnerHandle).toBe("torvalds");
  });

  it("executes full battle flow for GitHub with mocked API and persists snapshot", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);

      if (urlStr.includes("/users/torvalds/repos")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 1,
              name: "linux",
              full_name: "torvalds/linux",
              html_url: "https://github.com/torvalds/linux",
              stargazers_count: 180000,
              forks_count: 55000,
              language: "C",
              fork: false,
              updated_at: "2024-01-01T00:00:00Z",
              created_at: "2011-09-04T00:00:00Z",
            },
            {
              id: 2,
              name: "git",
              full_name: "torvalds/git",
              html_url: "https://github.com/torvalds/git",
              stargazers_count: 53000,
              forks_count: 25000,
              language: "C",
              fork: false,
              updated_at: "2024-01-01T00:00:00Z",
              created_at: "2011-09-04T00:00:00Z",
            },
          ],
        } as Response;
      }

      if (urlStr.includes("/users/torvalds/events/public")) {
        return {
          ok: true,
          status: 200,
          json: async () => Array.from({ length: 60 }, (_, i) => ({
            id: String(i),
            type: "PushEvent",
            created_at: "2024-01-01T00:00:00Z",
          })),
        } as Response;
      }

      if (urlStr.includes("/users/torvalds")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            login: "torvalds",
            name: "Linus Torvalds",
            avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
            public_repos: 35,
            public_gists: 0,
            followers: 210000,
            following: 0,
            created_at: "2011-09-03T15:26:22Z",
          }),
        } as Response;
      }

      if (urlStr.includes("/users/antirez/repos")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 3,
              name: "redis",
              full_name: "antirez/redis",
              html_url: "https://github.com/antirez/redis",
              stargazers_count: 66000,
              forks_count: 23000,
              language: "C",
              fork: false,
              updated_at: "2024-01-01T00:00:00Z",
              created_at: "2009-03-21T00:00:00Z",
            },
          ],
        } as Response;
      }

      if (urlStr.includes("/users/antirez/events/public")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: "2", type: "PushEvent", created_at: "2024-01-01T00:00:00Z" },
          ],
        } as Response;
      }

      if (urlStr.includes("/users/antirez")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            login: "antirez",
            name: "Salvatore Sanfilippo",
            avatar_url: "https://avatars.githubusercontent.com/u/65632?v=4",
            public_repos: 52,
            public_gists: 15,
            followers: 42000,
            following: 1,
            created_at: "2009-03-21T00:00:00Z",
          }),
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });

    const snapshot = await executeBattleFlow({
      u1: "torvalds",
      u2: "antirez",
      platform: "github",
      store: mockStore,
    });

    expect(snapshot.id).toMatch(/^gh-torvalds-vs-antirez-[a-z0-9-]+$/);
    expect(snapshot.platform).toBe("github");
    expect(snapshot.player1.handle).toBe("torvalds");
    expect(snapshot.player2.handle).toBe("antirez");
    expect(snapshot.verdict.outcome).toBe("win");
    expect(snapshot.verdict.winnerHandle).toBe("torvalds");
    expect(snapshot.overlap.dnaPercentage).toBeGreaterThanOrEqual(0);
    expect(snapshot.coverageNote).toContain("Stack DNA");

    // Commentary contradiction guard check
    const commentary = snapshot.commentary;
    expect(commentary.winnerHandle).toBe("torvalds");

    // Storage persistence check
    const persisted = await mockStore.get(snapshot.id);
    expect(persisted).toEqual(snapshot);
  });
});
