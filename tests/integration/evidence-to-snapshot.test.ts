import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCodeforcesEvidence } from "@/lib/platforms/codeforces";
import { compareSolved } from "@/lib/battle/overlap";
import { scoreCodeforcesBattle } from "@/lib/battle/scoring";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import { CodeforcesEvidence, SolvedProblem } from "@/lib/platforms/contracts";

describe("Evidence Correctness, Scoring & Prepared Demos (Task 3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles user.status HTTP 429/500 or API failure by marking history as unavailable rather than complete empty history", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.includes("user.info")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "OK",
            result: [{ handle: "throttled_coder", rating: 1800, maxRating: 1900 }],
          }),
        } as Response;
      }
      if (url.includes("user.status")) {
        // Mock HTTP 429 rate limit or 500 error on status
        return {
          ok: false,
          status: 429,
          json: async () => ({ status: "FAILED", comment: "Rate limit exceeded" }),
        } as Response;
      }
      return { ok: true, json: async () => ({ status: "OK", result: [] }) } as Response;
    });

    const evidence = await fetchCodeforcesEvidence("throttled_coder");
    expect(evidence.status).toBe("partial"); // Profile ok, but submission history unavailable
    expect(evidence.coverage.historyAvailability).toBe("unavailable");
    expect(evidence.coverage.isComplete).toBe(false);
  });

  it("withholds definitive exclusives and DNA when submission history is partial/incomplete", () => {
    const p1Solves: SolvedProblem[] = [
      { id: "CF:1A", platform: "codeforces", index: "A", name: "P1", rating: 1000, tags: [], acceptedAt: 1000, url: "" },
      { id: "CF:1B", platform: "codeforces", index: "B", name: "P2", rating: 1200, tags: [], acceptedAt: 1000, url: "" },
    ];
    const p2Solves: SolvedProblem[] = [
      { id: "CF:1A", platform: "codeforces", index: "A", name: "P1", rating: 1000, tags: [], acceptedAt: 1000, url: "" },
      { id: "CF:2C", platform: "codeforces", index: "C", name: "P3", rating: 1400, tags: [], acceptedAt: 1000, url: "" },
    ];

    // Partial coverage (e.g. 1000-submission ceiling reached)
    const result = compareSolved(p1Solves, p2Solves, false, true);

    expect(result.isDefinitive).toBe(false);
    expect(result.dnaPercentage).toBeNull();
    // Common problems are true observed facts and remain visible
    expect(result.commonCount).toBe(1);
    expect(result.common[0].id).toBe("CF:1A");
    // Observed exclusives are retained for exploration, while definitive status and DNA percentage are withheld
    expect(result.player1Exclusive).toHaveLength(1);
    expect(result.player2Exclusive).toHaveLength(1);
  });

  it("decouples Algorithmic Grit from Contest Peak using rated problem depth", () => {
    // Both players have identical maxRating of 2400
    const mockEvidenceBase = (handle: string, maxRating: number, problemRatings: number[]): CodeforcesEvidence => ({
      platform: "codeforces",
      handle,
      status: "ok",
      fetchedAt: new Date().toISOString(),
      profile: {
        handle,
        rating: 2300,
        maxRating,
        contribution: 0,
        friendCount: 0,
      },
      coverage: {
        historyAvailability: "complete",
        isComplete: true,
        totalSubmissionsFetched: problemRatings.length,
        totalAcceptedSolved: problemRatings.length,
      },
      solvedProblems: problemRatings.map((rating, idx) => ({
        id: `CF:${idx}A`,
        platform: "codeforces",
        index: "A",
        name: `Problem ${idx}`,
        rating,
        tags: ["math", "dp"],
        acceptedAt: 1600000000 + idx,
        url: "",
      })),
    });

    // Player A solved hard 3000-difficulty problems
    const playerA = mockEvidenceBase("elite_solver", 2400, [3200, 3100, 3000, 2900, 2800]);
    // Player B only solved 1000-difficulty problems
    const playerB = mockEvidenceBase("speed_coder", 2400, [1000, 1100, 900, 800, 1000]);

    const verdict = scoreCodeforcesBattle(playerA, playerB);

    // Peak rating is identical
    expect(verdict.player1Score.axes.contestPeak).toBe(verdict.player2Score.axes.contestPeak);
    // But Algorithmic Grit must reflect problem depth difference
    expect(verdict.player1Score.axes.algorithmicGrit).toBeGreaterThan(
      verdict.player2Score.axes.algorithmicGrit + 25
    );
    expect(verdict.scoringVersion).toBe("2.0.0");
  });

  it("verifies prepared demo consistency: 5/8 DNA is exactly 63%, avatars differ, and scoringVersion is 2.0.0", () => {
    const demo = PREPARED_TOURIST_VS_PETR;

    // 5 common out of 8 total union: 5/8 = 62.5% -> rounded is 63%
    expect(demo.overlap.commonCount).toBe(5);
    expect(demo.overlap.totalUnionCount).toBe(8);
    expect(demo.overlap.dnaPercentage).toBe(63);

    // Avatars must not be identical copies
    expect(demo.player1.avatarUrl).not.toBe(demo.player2.avatarUrl);

    // Scoring version
    expect(demo.verdict.scoringVersion).toBe("2.0.0");
  });
});
