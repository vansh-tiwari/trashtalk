import { describe, it, expect } from "vitest";
import { compareSolved } from "@/lib/battle/overlap";
import { SolvedProblem } from "@/lib/platforms/contracts";

function createMockProblem(id: string, rating = 1000): SolvedProblem {
  return {
    id,
    platform: "codeforces",
    index: "A",
    name: `Problem ${id}`,
    rating,
    tags: ["implementation"],
    acceptedAt: 1600000000,
    url: `https://codeforces.com/problem/${id}`,
  };
}

describe("Problem Overlap & DNA Computation", () => {
  it("calculates exact intersection, exclusives, and Jaccard DNA correctly", () => {
    // Player 1 solved: P1, P2
    // Player 2 solved: P2, P3
    // Intersection: P2 (count 1)
    // Union: P1, P2, P3 (count 3)
    // DNA: 1 / 3 * 100 = 33%
    const p1 = [createMockProblem("CF:1A", 1000), createMockProblem("CF:2A", 1400)];
    const p2 = [createMockProblem("CF:2A", 1400), createMockProblem("CF:3A", 1800)];

    const result = compareSolved(p1, p2, true, true);

    expect(result.common).toHaveLength(1);
    expect(result.common[0].id).toBe("CF:2A");

    expect(result.player1Exclusive).toHaveLength(1);
    expect(result.player1Exclusive[0].id).toBe("CF:1A");

    expect(result.player2Exclusive).toHaveLength(1);
    expect(result.player2Exclusive[0].id).toBe("CF:3A");

    expect(result.dnaPercentage).toBe(33);
    expect(result.isDefinitive).toBe(true);
  });

  it("returns N/A (null) DNA when both players have zero solved problems", () => {
    const result = compareSolved([], [], true, true);
    expect(result.common).toHaveLength(0);
    expect(result.dnaPercentage).toBeNull();
    expect(result.isDefinitive).toBe(true);
  });

  it("returns 0% DNA when one player solved problems and the other solved none", () => {
    const p1 = [createMockProblem("CF:1A", 1000)];
    const result = compareSolved(p1, [], true, true);
    expect(result.common).toHaveLength(0);
    expect(result.dnaPercentage).toBe(0);
  });

  it("withholds definitive DNA when history coverage is partial", () => {
    const p1 = [createMockProblem("CF:1A", 1000)];
    const p2 = [createMockProblem("CF:2A", 1200)];

    const result = compareSolved(p1, p2, false, true); // p1 is partial
    expect(result.isDefinitive).toBe(false);
    expect(result.dnaPercentage).toBeNull(); // Withheld because cannot prove exclusivity
  });

  it("sorts exclusives and common problems by problem rating descending", () => {
    const p1 = [
      createMockProblem("CF:1A", 800),
      createMockProblem("CF:2A", 2400),
      createMockProblem("CF:3A", 1600),
    ];
    const result = compareSolved(p1, [], true, true);

    expect(result.player1Exclusive.map((p) => p.rating)).toEqual([2400, 1600, 800]);
  });

  it("computes tag cosine similarity when provided tag distributions", () => {
    const t1 = [
      { tagName: "DP", tagSlug: "dp", problemsSolved: 20 },
      { tagName: "Graph", tagSlug: "graph", problemsSolved: 10 },
      { tagName: "Tree", tagSlug: "tree", problemsSolved: 0 },
    ];
    const t2 = [
      { tagName: "DP", tagSlug: "dp", problemsSolved: 10 },
      { tagName: "Graph", tagSlug: "graph", problemsSolved: 5 },
      { tagName: "Tree", tagSlug: "tree", problemsSolved: 15 },
    ];

    // Dot product = 20*10 + 10*5 + 0*15 = 250
    // Mag1 = sqrt(400 + 100) = sqrt(500) ≈ 22.36
    // Mag2 = sqrt(100 + 25 + 225) = sqrt(350) ≈ 18.71
    // Cosine = 250 / (22.36 * 18.71) ≈ 250 / 418.33 ≈ 59.76% -> 60%
    const p1 = [createMockProblem("LC:p1")];
    const p2 = [createMockProblem("LC:p2")]; // 0 common problems

    const result = compareSolved(p1, p2, false, false, t1, t2);
    expect(result.commonCount).toBe(0);
    expect(result.dnaPercentage).toBe(60);
  });
});
