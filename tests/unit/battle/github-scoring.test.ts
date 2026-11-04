import { describe, it, expect } from "vitest";
import {
  computeGithubPlayerAxes,
  calculateGithubCompositeScore,
  scoreGithubBattle,
} from "@/lib/battle/github-scoring";
import { GithubEvidence } from "@/lib/platforms/contracts";

describe("GitHub 5-Axis Scoring Engine", () => {
  const player1: GithubEvidence = {
    platform: "github",
    handle: "torvalds",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "torvalds",
      displayName: "Linus Torvalds",
      publicRepos: 10,
      publicGists: 0,
      followers: 215000,
      following: 0,
      createdAt: "2011-09-03T15:26:22Z",
      totalStars: 180000,
      totalForks: 53000,
      languages: [
        { name: "C", repoCount: 5 },
        { name: "Makefile", repoCount: 2 },
        { name: "Perl", repoCount: 1 },
      ],
      topRepos: [],
    },
    recentContributions: 80,
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 10, totalAcceptedSolved: 10 },
  };

  const player2: GithubEvidence = {
    platform: "github",
    handle: "antirez",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "antirez",
      displayName: "Salvatore Sanfilippo",
      publicRepos: 50,
      publicGists: 15,
      followers: 42000,
      following: 4,
      createdAt: "2009-03-21T00:00:00Z",
      totalStars: 85000,
      totalForks: 26000,
      languages: [
        { name: "C", repoCount: 30 },
        { name: "Tcl", repoCount: 5 },
        { name: "Python", repoCount: 4 },
        { name: "Ruby", repoCount: 2 },
        { name: "JavaScript", repoCount: 1 },
      ],
      topRepos: [],
    },
    recentContributions: 45,
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 50, totalAcceptedSolved: 50 },
  };

  it("calculates 5 core axes correctly for a high-impact profile", () => {
    const axes = computeGithubPlayerAxes(player1);
    expect(axes.grit).toBe(100); // 180,000 stars -> capped at 100
    expect(axes.peak).toBe(100); // 80 events >= 60 -> 100
    expect(axes.volume).toBe(40); // 10 repos / 25 * 100 = 40
    expect(axes.velocity).toBe(100); // 215,000 followers >= 150 -> 100
    expect(axes.breadth).toBe(43); // 3 languages / 7 * 100 = ~43
  });

  it("computes weighted composite score correctly", () => {
    const axes = computeGithubPlayerAxes(player1);
    const score = calculateGithubCompositeScore(axes);
    // 0.30*100 + 0.25*100 + 0.20*40 + 0.15*100 + 0.10*43
    // = 30 + 25 + 8 + 15 + 4.3 = 82.3 -> 82
    expect(score).toBe(82);
  });

  it("scores a complete battle and identifies the correct winner and margins", () => {
    const verdict = scoreGithubBattle(player1, player2);
    expect(verdict.outcome).toBe("win");
    expect(verdict.winnerHandle).toBe("antirez");
    expect(verdict.loserHandle).toBe("torvalds");
    expect(verdict.margin).toBeGreaterThan(0);
    expect(verdict.player1Score.total).toBe(82);
    expect(verdict.player2Score.total).toBe(91);
  });

  it("gracefully handles brand new empty GitHub profiles without NaN", () => {
    const emptyPlayer: GithubEvidence = {
      platform: "github",
      handle: "newbie",
      status: "ok",
      fetchedAt: "2026-10-28T00:00:00Z",
      profile: {
        handle: "newbie",
        publicRepos: 0,
        publicGists: 0,
        followers: 0,
        following: 0,
        createdAt: "2026-10-28T00:00:00Z",
        totalStars: 0,
        totalForks: 0,
        languages: [],
        topRepos: [],
      },
      recentContributions: 0,
      coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
    };

    const axes = computeGithubPlayerAxes(emptyPlayer);
    expect(axes.grit).toBe(0);
    expect(axes.peak).toBe(0);
    expect(axes.volume).toBe(0);
    expect(axes.velocity).toBe(0);
    expect(axes.breadth).toBe(0);

    const score = calculateGithubCompositeScore(axes);
    expect(score).toBe(0);
    expect(isNaN(score)).toBe(false);
  });
});
