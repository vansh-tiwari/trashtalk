import { describe, it, expect } from "vitest";
import { computeGithubOverlap } from "@/lib/battle/github-overlap";
import { GithubEvidence } from "@/lib/platforms/contracts";

describe("GitHub Tech Stack DNA Overlap", () => {
  const p1: GithubEvidence = {
    platform: "github",
    handle: "torvalds",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "torvalds",
      publicRepos: 2,
      publicGists: 0,
      followers: 200000,
      following: 0,
      createdAt: "2011-09-03T15:26:22Z",
      totalStars: 180000,
      totalForks: 50000,
      languages: [
        { name: "C", repoCount: 8 },
        { name: "Makefile", repoCount: 2 },
      ],
      topRepos: [],
    },
    solvedProblems: [
      {
        id: "GH:linux",
        platform: "github",
        index: "linux",
        name: "linux",
        rating: 180000,
        difficulty: "Hard",
        tags: ["C", "original"],
        acceptedAt: 1700000000,
        url: "https://github.com/torvalds/linux",
      },
      {
        id: "GH:git",
        platform: "github",
        index: "git",
        name: "git",
        rating: 50000,
        difficulty: "Hard",
        tags: ["C", "original"],
        acceptedAt: 1600000000,
        url: "https://github.com/torvalds/git",
      },
    ],
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 2, totalAcceptedSolved: 2 },
  };

  const p2: GithubEvidence = {
    platform: "github",
    handle: "antirez",
    status: "ok",
    fetchedAt: "2026-10-28T00:00:00Z",
    profile: {
      handle: "antirez",
      publicRepos: 2,
      publicGists: 0,
      followers: 40000,
      following: 0,
      createdAt: "2009-03-21T00:00:00Z",
      totalStars: 65000,
      totalForks: 23000,
      languages: [
        { name: "C", repoCount: 15 },
        { name: "Tcl", repoCount: 3 },
      ],
      topRepos: [],
    },
    solvedProblems: [
      {
        id: "GH:redis",
        platform: "github",
        index: "redis",
        name: "redis",
        rating: 65000,
        difficulty: "Hard",
        tags: ["C", "original"],
        acceptedAt: 1700000000,
        url: "https://github.com/antirez/redis",
      },
    ],
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: 2, totalAcceptedSolved: 2 },
  };

  it("calculates high tech stack DNA similarity when both developers share primary languages", () => {
    const overlap = computeGithubOverlap(p1, p2);
    expect(overlap.isDefinitive).toBe(true);
    // Both heavily write C -> high cosine similarity (> 85%)
    expect(overlap.dnaPercentage).not.toBeNull();
    expect(overlap.dnaPercentage!).toBeGreaterThan(85);
  });

  it("sorts exclusive projects by stars descending", () => {
    const overlap = computeGithubOverlap(p1, p2);
    expect(overlap.player1Exclusive).toHaveLength(2);
    expect(overlap.player1Exclusive[0].name).toBe("linux"); // 180,000 stars
    expect(overlap.player1Exclusive[1].name).toBe("git"); // 50,000 stars

    expect(overlap.player2Exclusive).toHaveLength(1);
    expect(overlap.player2Exclusive[0].name).toBe("redis"); // 65,000 stars
  });

  it("returns low or 0 DNA percentage when languages are disjoint", () => {
    const disjointP2: GithubEvidence = {
      ...p2,
      profile: {
        ...p2.profile!,
        languages: [{ name: "Haskell", repoCount: 10 }],
      },
    };

    const overlap = computeGithubOverlap(p1, disjointP2);
    expect(overlap.dnaPercentage).toBe(0);
  });
});
