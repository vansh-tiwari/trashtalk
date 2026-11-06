import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeBattleFlow, getBattleSnapshot } from "@/lib/battle/service";
import { MemoryBattleStore } from "@/lib/storage/battle-store";
import { PREPARED_NEETCODE_VS_LARRYNY } from "@/lib/demo/prepared-battles";

describe("LeetCode Battle Lifecycle & Storage Integration", () => {
  let mockStore: MemoryBattleStore;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStore = new MemoryBattleStore();
  });

  it("successfully retrieves the prepared offline LeetCode demo without network calls", async () => {
    const snapshot = await getBattleSnapshot("lc-neetcode-vs-larryny-legendary", mockStore);
    expect(snapshot).toBeDefined();
    expect(snapshot?.platform).toBe("leetcode");
    expect(snapshot?.player1.handle).toBe("neetcode");
    expect(snapshot?.player2.handle).toBe("larryny");
    expect(snapshot?.verdict.outcome).toBe("win");
    expect(snapshot?.verdict.winnerHandle).toBe("larryny");
  });

  it("executes full battle flow for LeetCode with mocked GraphQL and persists snapshot", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url, options) => {
      const body = JSON.parse(options?.body as string);
      const username = body.variables?.username;

      if (username === "neetcode") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              matchedUser: {
                username: "neetcode",
                profile: { realName: "Navdeep", ranking: 15000, reputation: 800 },
                submitStatsGlobal: {
                  acSubmissionNum: [
                    { difficulty: "All", count: 720 },
                    { difficulty: "Easy", count: 255 },
                    { difficulty: "Medium", count: 380 },
                    { difficulty: "Hard", count: 85 },
                  ],
                },
                tagProblemCounts: {
                  fundamental: [{ tagName: "Array", tagSlug: "array", problemsSolved: 100 }],
                  intermediate: [{ tagName: "Tree", tagSlug: "tree", problemsSolved: 50 }],
                  advanced: [{ tagName: "DP", tagSlug: "dp", problemsSolved: 30 }],
                },
                userCalendar: { submissionCalendar: JSON.stringify({ "1700000000": 5 }) },
              },
              userContestRanking: null,
              userContestRankingHistory: [],
              recentAcSubmissionList: [
                { id: "1", title: "Two Sum", titleSlug: "two-sum", timestamp: "1700000000" },
                { id: "2", title: "LRU Cache", titleSlug: "lru-cache", timestamp: "1700000100" },
              ],
            },
          }),
        } as Response;
      }

      if (username === "larryny") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              matchedUser: {
                username: "larryny",
                profile: { realName: "Larry", ranking: 500, reputation: 5000 },
                submitStatsGlobal: {
                  acSubmissionNum: [
                    { difficulty: "All", count: 1850 },
                    { difficulty: "Easy", count: 640 },
                    { difficulty: "Medium", count: 950 },
                    { difficulty: "Hard", count: 260 },
                  ],
                },
                tagProblemCounts: {
                  fundamental: [{ tagName: "Array", tagSlug: "array", problemsSolved: 200 }],
                  intermediate: [{ tagName: "Tree", tagSlug: "tree", problemsSolved: 150 }],
                  advanced: [{ tagName: "DP", tagSlug: "dp", problemsSolved: 120 }],
                },
                userCalendar: { submissionCalendar: JSON.stringify({ "1700000000": 10 }) },
              },
              userContestRanking: {
                attendedContestsCount: 45,
                rating: 2420,
                globalRanking: 320,
                badge: { name: "Guardian" },
              },
              userContestRankingHistory: [
                { attended: true, rating: 2450, ranking: 50, contest: { title: "C1", startTime: 1700000000 } },
              ],
              recentAcSubmissionList: [
                { id: "3", title: "Two Sum", titleSlug: "two-sum", timestamp: "1700000200" },
                { id: "4", title: "Median of Two Sorted Arrays", titleSlug: "median-of-two-sorted-arrays", timestamp: "1700000300" },
              ],
            },
          }),
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });

    const snapshot = await executeBattleFlow({
      u1: "neetcode",
      u2: "larryny",
      platform: "leetcode",
      store: mockStore,
    });

    expect(snapshot.id).toMatch(/^lc-neetcode-vs-larryny-[a-z0-9-]+$/);
    expect(snapshot.platform).toBe("leetcode");
    expect(snapshot.player1.handle).toBe("neetcode");
    expect(snapshot.player2.handle).toBe("larryny");
    expect(snapshot.verdict.outcome).toBe("win");
    expect(snapshot.verdict.winnerHandle).toBe("larryny");
    expect(snapshot.overlap.commonCount).toBe(1);
    expect(snapshot.overlap.common[0].name).toBe("Two Sum");
    expect(snapshot.coverageNote).toContain("Problem overlap computed from last 20 public AC submissions");

    // Commentary contradiction guard check
    const commentary = snapshot.commentary;
    expect(commentary.winnerHandle).toBe("larryny");
    expect(commentary.headToHeadRoast.toLowerCase()).not.toContain("winner: @neetcode");

    // Storage persistence check
    const persisted = await mockStore.get(snapshot.id);
    expect(persisted).toEqual(snapshot);
  });
});
