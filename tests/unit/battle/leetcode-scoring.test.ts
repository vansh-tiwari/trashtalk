import { describe, it, expect } from "vitest";
import { computeLeetcodePlayerAxes, scoreLeetcodeBattle } from "@/lib/battle/scoring";
import { LeetcodeEvidence } from "@/lib/platforms/contracts";

function createMockLeetcodeEvidence(overrides: Partial<LeetcodeEvidence> = {}): LeetcodeEvidence {
  return {
    platform: "leetcode",
    handle: "test_coder",
    status: "ok",
    fetchedAt: new Date().toISOString(),
    profile: {
      handle: "test_coder",
      totalSolved: 300,
      easySolved: 100,
      mediumSolved: 150,
      hardSolved: 50,
      contestsAttended: 10,
      rating: 1950,
      maxRating: 2100,
      rank: "Knight",
    },
    tagStats: [
      { tagName: "Dynamic Programming", tagSlug: "dp", problemsSolved: 20 },
      { tagName: "Graph", tagSlug: "graph", problemsSolved: 15 },
      { tagName: "Binary Search", tagSlug: "bs", problemsSolved: 10 },
      { tagName: "Tree", tagSlug: "tree", problemsSolved: 25 },
      { tagName: "Array", tagSlug: "array", problemsSolved: 50 },
    ],
    recent180dSubmissions: 100,
    recent180dActiveDays: 30,
    coverage: {
      historyAvailability: "complete",
      isComplete: true,
      isCompleteSolveList: false,
      solveListLimit: 20,
      totalSubmissionsFetched: 10,
      totalAcceptedSolved: 300,
    },
    ...overrides,
  };
}

describe("LeetCode 5-Axis Algorithmic Scoring", () => {
  it("never penalizes high-volume grinders for solving extra Easy problems on Algorithmic Grit", () => {
    // User A: 50 Hard, 200 Medium, 0 Easy
    const userA = createMockLeetcodeEvidence({
      handle: "userA",
      profile: {
        handle: "userA",
        totalSolved: 250,
        easySolved: 0,
        mediumSolved: 200,
        hardSolved: 50,
        contestsAttended: 0,
      },
    });

    // User B: 50 Hard, 200 Medium, 600 Easy (exact same Hard/Medium + 600 extra problems)
    const userB = createMockLeetcodeEvidence({
      handle: "userB",
      profile: {
        handle: "userB",
        totalSolved: 850,
        easySolved: 600,
        mediumSolved: 200,
        hardSolved: 50,
        contestsAttended: 0,
      },
    });

    const scoreA = computeLeetcodePlayerAxes(userA);
    const scoreB = computeLeetcodePlayerAxes(userB);

    // User B should NOT have lower grit than User A
    expect(scoreB.axes.algorithmicGrit).toBeGreaterThanOrEqual(scoreA.axes.algorithmicGrit);
    // User B should have significantly higher solve volume
    expect(scoreB.axes.solveVolume).toBeGreaterThan(scoreA.axes.solveVolume);
  });

  it("strictly caps unrated users at <= 40 on Contest Peak so they never outscore contest participants", () => {
    // Unrated user with huge solve counts (100 Hards, 400 Mediums)
    const unratedTitan = createMockLeetcodeEvidence({
      handle: "unrated_titan",
      profile: {
        handle: "unrated_titan",
        totalSolved: 1000,
        easySolved: 500,
        mediumSolved: 400,
        hardSolved: 100,
        contestsAttended: 0, // Unrated!
      },
    });

    // Modest contest competitor (attended 5 contests, rating 1650)
    const ratedCompetitor = createMockLeetcodeEvidence({
      handle: "rated_competitor",
      profile: {
        handle: "rated_competitor",
        totalSolved: 200,
        easySolved: 100,
        mediumSolved: 90,
        hardSolved: 10,
        contestsAttended: 5,
        rating: 1650,
        maxRating: 1650,
      },
    });

    const unratedScore = computeLeetcodePlayerAxes(unratedTitan);
    const ratedScore = computeLeetcodePlayerAxes(ratedCompetitor);

    // Unrated peak must be strictly <= 40
    expect(unratedScore.axes.contestPeak).toBeLessThanOrEqual(40);
    // Rated competitor with 1650 rating should score higher than the unrated cap on Contest Peak
    expect(ratedScore.axes.contestPeak).toBeGreaterThan(unratedScore.axes.contestPeak);
  });

  it("calculates 180-day velocity from calendar active days and submissions", () => {
    // Active daily coder: 60 active days and 200 submissions in 180 days -> max 100 pts
    const activeCoder = createMockLeetcodeEvidence({
      recent180dActiveDays: 60,
      recent180dSubmissions: 200,
    });
    const score = computeLeetcodePlayerAxes(activeCoder);
    expect(score.axes.recentVelocity).toBe(100);

    // Moderate coder: 30 active days (30 pts) and 50 submissions (10 pts) -> 40 pts
    const modCoder = createMockLeetcodeEvidence({
      recent180dActiveDays: 30,
      recent180dSubmissions: 50,
    });
    const modScore = computeLeetcodePlayerAxes(modCoder);
    expect(modScore.axes.recentVelocity).toBe(40);
  });

  it("filters Topic Breadth tags by requiring at least 3 solves per tag", () => {
    const evidence = createMockLeetcodeEvidence({
      tagStats: [
        { tagName: "Array", tagSlug: "array", problemsSolved: 10 },   // qualified
        { tagName: "String", tagSlug: "string", problemsSolved: 5 },   // qualified
        { tagName: "DP", tagSlug: "dp", problemsSolved: 1 },           // NOT qualified (< 3)
        { tagName: "Graph", tagSlug: "graph", problemsSolved: 2 },     // NOT qualified (< 3)
      ],
    });

    const score = computeLeetcodePlayerAxes(evidence);
    // 2 qualified tags / 25 * 100 = 8 pts
    expect(score.axes.topicBreadth).toBe(8);
  });

  it("strictly enforces 5-axis weights: 30% Grit, 25% Contest, 20% Volume, 15% Velocity, 10% Breadth", () => {
    const evidence = createMockLeetcodeEvidence();
    const score = computeLeetcodePlayerAxes(evidence);

    const calculatedTotal = Math.round(
      score.axes.algorithmicGrit * 0.3 +
      score.axes.contestPeak * 0.25 +
      score.axes.solveVolume * 0.2 +
      score.axes.recentVelocity * 0.15 +
      score.axes.topicBreadth * 0.1
    );

    expect(score.total).toBe(calculatedTotal);
  });

  it("handles mirror matches and draws accurately", () => {
    const p1 = createMockLeetcodeEvidence({ handle: "alice" });
    const p2Mirror = createMockLeetcodeEvidence({ handle: "alice" });

    const verdict = scoreLeetcodeBattle(p1, p2Mirror);
    expect(verdict.outcome).toBe("draw");
    expect(verdict.isMirrorMatch).toBe(true);
    expect(verdict.winnerHandle).toBeNull();
  });
});
