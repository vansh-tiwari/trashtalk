import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchLeetcodeEvidence } from "@/lib/platforms/leetcode";
import { LEETCODE_GRAPHQL_HEADERS } from "@/lib/platforms/http";

describe("LeetCode Adapter Evidence Fetching", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles a non-existent user with status: not_found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          matchedUser: null,
        },
      }),
    } as Response);

    const result = await fetchLeetcodeEvidence("non_existent_lc_user_123");
    expect(result.status).toBe("not_found");
    expect(result.profile).toBeUndefined();
    expect(result.solvedProblems).toBeUndefined();
  });

  it("handles HTTP 429 rate limit cleanly", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response);

    const result = await fetchLeetcodeEvidence("throttled_user");
    expect(result.status).toBe("rate_limited");
    expect(result.error).toContain("rate limit");
  });

  it("parses combined GraphQL payload with correct headers, attended contests, calendar, and deduplicated recent ACs", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const daySec = 86400;

    // Calendar: 3 days in the last 180 days, 1 day older than 180 days
    const submissionCalendar = JSON.stringify({
      [String(nowSec - 10 * daySec)]: 5,
      [String(nowSec - 20 * daySec)]: 3,
      [String(nowSec - 30 * daySec)]: 2,
      [String(nowSec - 200 * daySec)]: 10, // older than 180 days
    });

    let capturedUrl = "";
    let capturedOptions: RequestInit | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (url, options) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            matchedUser: {
              username: "neetcode",
              profile: {
                realName: "Navdeep Singh",
                userAvatar: "https://assets.leetcode.com/users/neetcode/avatar.jpg",
                ranking: 15420,
                reputation: 840,
              },
              submitStatsGlobal: {
                acSubmissionNum: [
                  { difficulty: "All", count: 720 },
                  { difficulty: "Easy", count: 255 },
                  { difficulty: "Medium", count: 380 },
                  { difficulty: "Hard", count: 85 },
                ],
              },
              tagProblemCounts: {
                advanced: [
                  { tagName: "Dynamic Programming", tagSlug: "dynamic-programming", problemsSolved: 45 },
                  { tagName: "Graph", tagSlug: "graph", problemsSolved: 30 },
                ],
                intermediate: [
                  { tagName: "Tree", tagSlug: "tree", problemsSolved: 60 },
                  { tagName: "Binary Search", tagSlug: "binary-search", problemsSolved: 25 },
                ],
                fundamental: [
                  { tagName: "Array", tagSlug: "array", problemsSolved: 120 },
                  { tagName: "String", tagSlug: "string", problemsSolved: 90 },
                ],
              },
              userCalendar: {
                submissionCalendar,
              },
            },
            userContestRanking: {
              attendedContestsCount: 15,
              rating: 2154.6,
              globalRanking: 1204,
              topPercentage: 2.1,
              badge: {
                name: "Knight",
              },
            },
            userContestRankingHistory: [
              // Unattended contest with default 1500 rating - must be ignored!
              { attended: false, rating: 1500, ranking: 0, contest: { title: "Contest 1", startTime: 1600000000 } },
              // Attended contests
              { attended: true, rating: 1820.4, ranking: 450, contest: { title: "Contest 2", startTime: 1610000000 } },
              { attended: true, rating: 2210.8, ranking: 112, contest: { title: "Contest 3", startTime: 1620000000 } },
              { attended: true, rating: 2154.6, ranking: 210, contest: { title: "Contest 4", startTime: 1630000000 } },
            ],
            recentAcSubmissionList: [
              // Repeated submission for two-sum (newer timestamp)
              { id: "101", title: "Two Sum", titleSlug: "two-sum", timestamp: String(nowSec - 100) },
              // Older submission for two-sum
              { id: "100", title: "Two Sum", titleSlug: "two-sum", timestamp: String(nowSec - 500) },
              // Distinct problem
              { id: "102", title: "Add Two Numbers", titleSlug: "add-two-numbers", timestamp: String(nowSec - 200) },
            ],
          },
        }),
      } as Response;
    });

    const result = await fetchLeetcodeEvidence("neetcode");

    // 1. Check HTTP request & headers
    expect(capturedUrl).toBe("https://leetcode.com/graphql");
    const headers = capturedOptions?.headers as Record<string, string>;
    expect(headers["Origin"]).toBe(LEETCODE_GRAPHQL_HEADERS.Origin);
    expect(headers["Referer"]).toBe(LEETCODE_GRAPHQL_HEADERS.Referer);
    expect(headers["User-Agent"]).toBe(LEETCODE_GRAPHQL_HEADERS["User-Agent"]);

    // 2. Check profile parsing
    expect(result.status).toBe("ok");
    expect(result.platform).toBe("leetcode");
    expect(result.handle).toBe("neetcode");
    expect(result.profile?.realName).toBe("Navdeep Singh");
    expect(result.profile?.totalSolved).toBe(720);
    expect(result.profile?.easySolved).toBe(255);
    expect(result.profile?.mediumSolved).toBe(380);
    expect(result.profile?.hardSolved).toBe(85);
    expect(result.profile?.rating).toBe(2155);
    expect(result.profile?.maxRating).toBe(2211); // Peak from attended contests
    expect(result.profile?.rank).toBe("Knight");
    expect(result.profile?.contestsAttended).toBe(15);

    // 3. Check 180-day calendar calculation
    expect(result.recent180dSubmissions).toBe(10); // 5 + 3 + 2 (ignoring the 200-day-old 10)
    expect(result.recent180dActiveDays).toBe(3);

    // 4. Check recent AC deduplication (2 unique problems from 3 submissions)
    expect(result.solvedProblems?.length).toBe(2);
    expect(result.solvedProblems?.[0].id).toBe("LC:two-sum");
    expect(result.solvedProblems?.[0].acceptedAt).toBe(nowSec - 100);
    expect(result.solvedProblems?.[1].id).toBe("LC:add-two-numbers");

    // 5. Check coverage metadata
    expect(result.coverage.isCompleteSolveList).toBe(false);
    expect(result.coverage.solveListLimit).toBe(20);

    // 6. Check tag stats flattening
    expect(result.tagStats?.length).toBe(6);
    expect(result.tagStats?.find((t) => t.tagSlug === "dynamic-programming")?.problemsSolved).toBe(45);
  });

  it("leaves rating and maxRating undefined for unrated users with zero attended contests", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          matchedUser: {
            username: "unrated_solver",
            profile: {
              realName: "Solver",
              ranking: 50000,
              reputation: 10,
            },
            submitStatsGlobal: {
              acSubmissionNum: [
                { difficulty: "All", count: 120 },
                { difficulty: "Easy", count: 60 },
                { difficulty: "Medium", count: 50 },
                { difficulty: "Hard", count: 10 },
              ],
            },
            tagProblemCounts: { advanced: [], intermediate: [], fundamental: [] },
            userCalendar: { submissionCalendar: "{}" },
          },
          userContestRanking: null,
          userContestRankingHistory: [
            // Has unattended entries with default 1500 rating
            { attended: false, rating: 1500, ranking: 0, contest: { title: "Contest 1", startTime: 1600000000 } },
          ],
          recentAcSubmissionList: [],
        },
      }),
    } as Response);

    const result = await fetchLeetcodeEvidence("unrated_solver");
    expect(result.status).toBe("ok");
    expect(result.profile?.rating).toBeUndefined();
    expect(result.profile?.maxRating).toBeUndefined();
    expect(result.profile?.rank).toBe("Unrated");
    expect(result.profile?.contestsAttended).toBe(0);
  });
});
