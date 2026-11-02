import { describe, it, expect } from "vitest";
import {
  computeCodechefPlayerAxes,
  scoreCodechefBattle,
  scoreBattle,
} from "@/lib/battle/scoring";
import { CodechefEvidence } from "@/lib/platforms/contracts";

function createMockCodechefEvidence(
  handle: string,
  options: {
    rating?: number;
    highestRating?: number;
    stars?: number;
    division?: 1 | 2 | 3 | 4 | null;
    totalSolved?: number;
    contestsParticipated?: number;
    recentSolves?: number;
    status?: CodechefEvidence["status"];
  } = {}
): CodechefEvidence {
  const rating = "rating" in options ? options.rating : 2100;
  const highestRating = "highestRating" in options ? options.highestRating : 2260;
  const stars = "stars" in options ? options.stars : 5;
  const division = "division" in options ? options.division : 1;
  const totalSolved = ("totalSolved" in options ? options.totalSolved : 350) ?? 0;
  const contestsParticipated = "contestsParticipated" in options ? (options.contestsParticipated ?? 0) : 50;
  const recentSolves = "recentSolves" in options ? (options.recentSolves ?? 0) : 20;
  const status = options.status ?? "ok";

  return {
    platform: "codechef",
    handle,
    status,
    fetchedAt: new Date().toISOString(),
    profile:
      status === "ok"
        ? {
            handle,
            displayName: handle,
            rating,
            highestRating,
            stars,
            starString: `${stars}★`,
            division,
            globalRank: 500,
            countryRank: 400,
            contestsParticipated,
            totalSolved,
            listedSolvedCount: 15,
          }
        : undefined,
    contestHistory: Array.from({ length: Math.min(10, contestsParticipated) }).map((_, i) => ({
      contestId: i + 1,
      contestName: `Starters ${i + 1}`,
      rank: 50 + i * 10,
      oldRating: (rating || 1500) - 20,
      newRating: rating || 1500,
      ratingUpdateTimeSeconds: Math.floor(Date.now() / 1000) - i * 86400 * 10,
    })),
    solvedProblems: Array.from({ length: 15 }).map((_, i) => ({
      id: `CC:PROB_${i}`,
      platform: "codechef",
      index: `PROB_${i}`,
      name: `Problem ${i}`,
      tags: [],
      acceptedAt: Math.floor(Date.now() / 1000) - i * 86400,
      url: `https://www.codechef.com/problems/PROB_${i}`,
    })),
    recent180dSubmissions: recentSolves,
    recent180dActiveDays: Math.min(10, recentSolves),
    coverage: {
      historyAvailability: "complete",
      isComplete: false,
      isCompleteSolveList: false,
      totalSubmissionsFetched: 15,
      totalAcceptedSolved: totalSolved,
    },
  };
}

describe("CodeChef 5-Axis Algorithmic Scoring Engine", () => {
  it("enforces strict 30/25/20/15/10 mathematical weights", () => {
    const evidence = createMockCodechefEvidence("akulsareen", {
      rating: 2103,
      highestRating: 2260,
      stars: 5,
      division: 1,
      totalSolved: 359,
      recentSolves: 25,
    });

    const score = computeCodechefPlayerAxes(evidence);
    const expectedWeighted = Math.round(
      score.axes.algorithmicGrit * 0.3 +
      score.axes.contestPeak * 0.25 +
      score.axes.solveVolume * 0.2 +
      score.axes.recentVelocity * 0.15 +
      score.axes.topicBreadth * 0.1
    );

    expect(score.total).toBe(expectedWeighted);
  });

  it("calibrates Algorithmic Grit higher for 7★ Div 1 than 5★ and 2★", () => {
    const elite = computeCodechefPlayerAxes(
      createMockCodechefEvidence("gennady", {
        rating: 2800,
        highestRating: 3100,
        stars: 7,
        division: 1,
        totalSolved: 1200,
      })
    );

    const pro = computeCodechefPlayerAxes(
      createMockCodechefEvidence("akulsareen", {
        rating: 2103,
        highestRating: 2260,
        stars: 5,
        division: 1,
        totalSolved: 359,
      })
    );

    const rookie = computeCodechefPlayerAxes(
      createMockCodechefEvidence("rookie", {
        rating: 1450,
        highestRating: 1500,
        stars: 2,
        division: 3,
        totalSolved: 50,
      })
    );

    expect(elite.axes.algorithmicGrit).toBeGreaterThan(pro.axes.algorithmicGrit);
    expect(pro.axes.algorithmicGrit).toBeGreaterThan(rookie.axes.algorithmicGrit);
    expect(elite.axes.algorithmicGrit).toBeGreaterThanOrEqual(90);
  });

  it("evaluates Contest Peak against 3200 CodeChef ceiling", () => {
    const peakUser = computeCodechefPlayerAxes(
      createMockCodechefEvidence("champ", {
        rating: 2500,
        highestRating: 3200,
      })
    );
    expect(peakUser.axes.contestPeak).toBe(100);

    const halfUser = computeCodechefPlayerAxes(
      createMockCodechefEvidence("half", {
        rating: 1600,
        highestRating: 1600,
      })
    );
    expect(halfUser.axes.contestPeak).toBe(50);
  });

  it("scores authoritative totalSolved for Solve Volume, not listed rows", () => {
    const evidence = createMockCodechefEvidence("volume_coder", {
      totalSolved: 1000,
    });
    // Listed solves in mock is 15, but totalSolved is 1000
    const score = computeCodechefPlayerAxes(evidence);
    expect(score.axes.solveVolume).toBe(100);
    expect(score.metrics.solvedCount).toBe(1000);
  });

  it("handles unrated users gracefully without NaN or negative numbers", () => {
    const unrated = computeCodechefPlayerAxes(
      createMockCodechefEvidence("fresh_coder", {
        rating: undefined,
        highestRating: undefined,
        stars: undefined,
        division: null,
        totalSolved: 0,
        contestsParticipated: 0,
        recentSolves: 0,
      })
    );

    expect(unrated.total).toBeGreaterThanOrEqual(0);
    expect(unrated.axes.contestPeak).toBe(0);
    expect(unrated.axes.solveVolume).toBe(0);
    expect(unrated.metrics.rating).toBe(0);
  });

  it("determines definitive winner in scoreCodechefBattle and scoreBattle dispatcher", () => {
    const p1 = createMockCodechefEvidence("master", {
      rating: 2300,
      highestRating: 2400,
      stars: 6,
      division: 1,
      totalSolved: 600,
    });
    const p2 = createMockCodechefEvidence("novice", {
      rating: 1350,
      highestRating: 1400,
      stars: 1,
      division: 4,
      totalSolved: 30,
    });

    const verdict = scoreCodechefBattle(p1, p2);
    expect(verdict.outcome).toBe("win");
    expect(verdict.winnerHandle).toBe("master");
    expect(verdict.loserHandle).toBe("novice");
    expect(verdict.margin).toBeGreaterThan(20);

    // Also via scoreBattle dispatcher
    const dispatchVerdict = scoreBattle("codechef", p1, p2);
    expect(dispatchVerdict.winnerHandle).toBe("master");
  });

  it("returns insufficient_data when one of the players is not found", () => {
    const p1 = createMockCodechefEvidence("valid_user");
    const p2 = createMockCodechefEvidence("missing_user", { status: "not_found" });

    const verdict = scoreCodechefBattle(p1, p2);
    expect(verdict.outcome).toBe("insufficient_data");
    expect(verdict.winnerHandle).toBeNull();
  });
});
