import { describe, it, expect } from "vitest";
import { generateGithubLocalRoast, buildGithubRoastPrompt } from "@/lib/ai/github-roaster";
import { GithubEvidence } from "@/lib/platforms/contracts";
import { BattleVerdict } from "@/lib/battle/types";

describe("GitHub Brutalist Roaster & Contradiction Guard", () => {
  const p1Evidence: GithubEvidence = {
    platform: "github",
    handle: "torvalds",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "torvalds",
      publicRepos: 10,
      publicGists: 0,
      followers: 210000,
      following: 0,
      createdAt: "2011-09-03T15:26:22Z",
      totalStars: 180000,
      totalForks: 50000,
      languages: [{ name: "C", repoCount: 8 }],
      topRepos: [],
    },
    recentContributions: 80,
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 10, totalAcceptedSolved: 10 },
  };

  const p2Evidence: GithubEvidence = {
    platform: "github",
    handle: "junior_coder",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "junior_coder",
      publicRepos: 25,
      publicGists: 1,
      followers: 5,
      following: 120,
      createdAt: "2024-01-01T00:00:00Z",
      totalStars: 2,
      totalForks: 0,
      languages: [{ name: "JavaScript", repoCount: 25 }],
      topRepos: [],
    },
    recentContributions: 5,
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 25, totalAcceptedSolved: 25 },
  };

  const verdict: BattleVerdict = {
    outcome: "win",
    winnerHandle: "torvalds",
    loserHandle: "junior_coder",
    isMirrorMatch: false,
    margin: 55,
    reasoning: "Linus dominated across Star Gravity and Community Footprint.",
    scoringVersion: "2.0.0",
    player1Score: {
      handle: "torvalds",
      total: 85,
      axes: { algorithmicGrit: 100, contestPeak: 100, solveVolume: 40, recentVelocity: 100, topicBreadth: 30 },
      metrics: { rating: 180000, maxRating: 180000, solvedCount: 10, recentAcceptedCount: 80, distinctTagsCount: 1 },
    },
    player2Score: {
      handle: "junior_coder",
      total: 30,
      axes: { algorithmicGrit: 5, contestPeak: 10, solveVolume: 60, recentVelocity: 5, topicBreadth: 15 },
      metrics: { rating: 2, maxRating: 2, solvedCount: 25, recentAcceptedCount: 5, distinctTagsCount: 1 },
    },
  };

  it("generates local commentary that hails the declared winner and roasts the loser", () => {
    const commentary = generateGithubLocalRoast({
      p1Evidence,
      p2Evidence,
      verdict,
      persona: "savage_dev",
    });

    expect(commentary.winnerHandle).toBe("torvalds");
    expect(commentary.headToHeadRoast).toContain("torvalds");
    expect(commentary.punchline).toContain("torvalds");
    expect(commentary.punchline.toLowerCase()).not.toContain("winner: @junior_coder");
    expect(commentary.player2Roast).toContain("junior_coder");
  });

  it("builds a structured Gemini AI prompt containing GitHub metrics", () => {
    const prompt = buildGithubRoastPrompt({
      p1Evidence,
      p2Evidence,
      verdict,
      persona: "silicon_valley_vc",
    });

    expect(prompt).toContain("torvalds");
    expect(prompt).toContain("junior_coder");
    expect(prompt).toContain("180000"); // stars
    expect(prompt).toContain("WINNER: torvalds");
    expect(prompt).toContain("CONTRADICTION GUARD");
  });

  it("handles draw verdicts appropriately", () => {
    const drawVerdict: BattleVerdict = {
      ...verdict,
      outcome: "draw",
      winnerHandle: null,
      loserHandle: null,
      margin: 0,
    };

    const commentary = generateGithubLocalRoast({
      p1Evidence,
      p2Evidence,
      verdict: drawVerdict,
      persona: "savage_dev",
    });

    expect(commentary.winnerHandle).toBeNull();
    expect(commentary.headToHeadRoast.toLowerCase()).toContain("deadlock");
    expect(commentary.punchline).toContain("DRAW");
  });
});
