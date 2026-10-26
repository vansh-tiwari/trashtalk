import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCodeforcesEvidence } from "@/lib/platforms/codeforces";

describe("Codeforces Adapter Evidence Fetching", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles a non-existent user with status: not_found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        status: "FAILED",
        comment: "handles: User not found",
      }),
    } as unknown as Response);

    const result = await fetchCodeforcesEvidence("non_existent_user_xyz123");
    expect(result.status).toBe("not_found");
    expect(result.profile).toBeUndefined();
    expect(result.solvedProblems).toBeUndefined();
  });

  it("deduplicates accepted submissions and retains earliest acceptedAt timestamp", async () => {
    // 1. user.info mock
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          result: [
            {
              handle: "tourist",
              rating: 3840,
              maxRating: 4009,
              rank: "legendary grandmaster",
              maxRank: "tourist",
              contribution: 111,
              friendOfCount: 91494,
              titlePhoto: "https://userpic.codeforces.org/title.jpg",
            },
          ],
        }),
      } as unknown as Response)
      // 2. user.status (submissions) mock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          result: [
            // Later submission for problem 1A (accepted)
            {
              id: 102,
              contestId: 1,
              creationTimeSeconds: 1600000500,
              problem: { contestId: 1, index: "A", name: "Theatre Square", rating: 1000, tags: ["math"] },
              verdict: "OK",
            },
            // Earlier submission for problem 1A (accepted)
            {
              id: 101,
              contestId: 1,
              creationTimeSeconds: 1600000100,
              problem: { contestId: 1, index: "A", name: "Theatre Square", rating: 1000, tags: ["math"] },
              verdict: "OK",
            },
            // Rejected submission for problem 4C
            {
              id: 103,
              contestId: 4,
              creationTimeSeconds: 1600000200,
              problem: { contestId: 4, index: "C", name: "Registration System", rating: 1300, tags: ["hashing"] },
              verdict: "WRONG_ANSWER",
            },
          ],
        }),
      } as unknown as Response)
      // 3. user.rating (contest history) mock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          result: [
            {
              contestId: 1,
              contestName: "Codeforces Beta Round #1",
              rank: 1,
              oldRating: 1500,
              newRating: 1750,
              ratingUpdateTimeSeconds: 1266000000,
            },
          ],
        }),
      } as unknown as Response);

    const result = await fetchCodeforcesEvidence("tourist");

    expect(result.status).toBe("ok");
    expect(result.handle).toBe("tourist");
    expect(result.profile?.rating).toBe(3840);

    // Problem 1A should appear once, despite 2 accepted submissions
    expect(result.solvedProblems).toHaveLength(1);
    const prob1A = result.solvedProblems![0];
    expect(prob1A.id).toBe("CF:1A");
    expect(prob1A.acceptedAt).toBe(1600000100); // Retained earliest timestamp
    expect(prob1A.name).toBe("Theatre Square");
    expect(prob1A.url).toBe("https://codeforces.com/contest/1/problem/A");
  });

  it("identifies partial coverage when maxSubmissions limit is reached", async () => {
    // Generate 10 mock submissions
    const mockSubs = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      contestId: 100 + i,
      creationTimeSeconds: 1600000000 + i,
      problem: { contestId: 100 + i, index: "A", name: `Problem ${i}`, rating: 1200, tags: [] },
      verdict: "OK",
    }));

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          result: [{ handle: "active_coder", rating: 1600 }],
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: "OK",
          result: mockSubs,
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: "OK", result: [] }),
      } as unknown as Response);

    // If maxSubmissions is 10 and we got 10, coverage is marked incomplete (partial)
    const result = await fetchCodeforcesEvidence("active_coder", { maxSubmissions: 10 });
    expect(result.status).toBe("ok");
    expect(result.coverage.isComplete).toBe(false);
  });

  it("handles rate limiting gracefully with status: rate_limited", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({ status: "FAILED", comment: "Call limit exceeded" }),
    } as unknown as Response);

    const result = await fetchCodeforcesEvidence("some_user");
    expect(result.status).toBe("rate_limited");
  });
});
