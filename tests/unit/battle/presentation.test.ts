import { describe, it, expect } from "vitest";
import { toBattleViewModel } from "@/lib/battle/presentation";
import { BattleSnapshot } from "@/lib/storage/contracts";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "@/lib/demo/prepared-battles";

describe("Battle Presentation Adapter (toBattleViewModel)", () => {
  const baseDemo = PREPARED_TOURIST_VS_PETR;

  it("formats fully supported win with authoritative stamp and clean metrics", () => {
    const vm = toBattleViewModel(baseDemo);

    expect(vm.outcome).toBe("win");
    expect(vm.winnerHandle).toBe("tourist");
    expect(vm.p1.handle).toBe("tourist");
    expect(vm.p2.handle).toBe("Petr");
    expect(vm.hasAuthoritativeStamp).toBe(true);
    expect(vm.outcomeHeaderLabel).toBe("WINNER DECIDED");
    expect(vm.scoreLabel).toBe("Score");
    expect(vm.warningMessage).toBeNull();
    expect(vm.dnaFormatted).toBe("63%");

    // Verify aligned metric rows
    const ratingRow = vm.metrics.find((m) => m.key === "rating");
    expect(ratingRow).toBeDefined();
    expect(ratingRow?.advantage).toBe("p1");
    expect(ratingRow?.delta).toContain("+");
  });

  it("applies Recorded Result policy when evidence is partial", () => {
    const partialSnapshot: BattleSnapshot = {
      ...baseDemo,
      id: "cf-partial-match",
      overlap: {
        ...baseDemo.overlap,
        isDefinitive: false, // history was capped at 1,000
      },
      verdict: {
        ...baseDemo.verdict,
        scoringVersion: "2.0.0",
      },
    };

    const vm = toBattleViewModel(partialSnapshot);

    expect(vm.evidenceState).toBe("partial");
    expect(vm.hasAuthoritativeStamp).toBe(false);
    expect(vm.outcomeHeaderLabel).toBe("RECORDED RESULT");
    expect(vm.scoreLabel).toBe("Recorded score");
    expect(vm.warningMessage).toContain("Incomplete submission history");
    expect(vm.p1ExclusiveCount).toBeNull(); // exclusives withheld
    expect(vm.p2ExclusiveCount).toBeNull();
  });

  it("applies unrecorded coverage policy to historical v1.0.0 snapshots", () => {
    const legacySnapshot: BattleSnapshot = {
      ...baseDemo,
      id: "cf-v1-legacy",
      overlap: {
        ...baseDemo.overlap,
        isDefinitive: false,
      },
      verdict: {
        ...baseDemo.verdict,
        scoringVersion: "1.0.0",
      },
    };

    const vm = toBattleViewModel(legacySnapshot);

    expect(vm.evidenceState).toBe("unknown");
    expect(vm.hasAuthoritativeStamp).toBe(false);
    expect(vm.outcomeHeaderLabel).toBe("RECORDED RESULT");
    expect(vm.scoreLabel).toBe("Recorded score");
    expect(vm.warningMessage).toContain("Coverage not recorded");
  });

  it("handles draw outcome cleanly without crowning player 1", () => {
    const drawSnapshot: BattleSnapshot = {
      ...baseDemo,
      id: "cf-draw-match",
      verdict: {
        ...baseDemo.verdict,
        outcome: "draw",
        winnerHandle: null,
        loserHandle: null,
        margin: 0,
      },
    };

    const vm = toBattleViewModel(drawSnapshot);

    expect(vm.outcome).toBe("draw");
    expect(vm.winnerHandle).toBeNull();
    expect(vm.winnerLabel).toBe("Draw (No Winner)");
    expect(vm.outcomeHeaderLabel).toBe("HONORABLE DRAW");
    expect(vm.hasAuthoritativeStamp).toBe(false);
  });

  it("handles insufficient data outcome cleanly", () => {
    const insufficientSnapshot: BattleSnapshot = {
      ...baseDemo,
      id: "cf-insufficient-match",
      verdict: {
        ...baseDemo.verdict,
        outcome: "insufficient_data",
        winnerHandle: null,
        loserHandle: null,
      },
    };

    const vm = toBattleViewModel(insufficientSnapshot);

    expect(vm.outcome).toBe("insufficient_data");
    expect(vm.winnerHandle).toBeNull();
    expect(vm.outcomeHeaderLabel).toBe("INSUFFICIENT EVIDENCE");
    expect(vm.warningMessage).toContain("Submission history was unavailable");
  });

  it("formats unrated LeetCode profile with clean subtitle instead of undefined rating", () => {
    const unratedScore = {
      ...baseDemo.player1.score,
      metrics: {
        rating: 0,
        maxRating: 0,
        solvedCount: 412,
        recentAcceptedCount: 25,
        distinctTagsCount: 18,
      },
    };

    const unratedLcSnapshot: BattleSnapshot = {
      ...baseDemo,
      id: "lc-unrated-test",
      platform: "leetcode" as any,
      player1: {
        ...baseDemo.player1,
        handle: "unrated_solver",
        rank: "Unrated",
        score: unratedScore,
      },
      verdict: {
        ...baseDemo.verdict,
        player1Score: unratedScore,
      },
    };

    const vm = toBattleViewModel(unratedLcSnapshot);
    expect(vm.platform).toBe("LeetCode");
    expect(vm.p1.subtitle).toBe("412 solved");
    expect(vm.p1.rank).toBe("Unrated");
  });

  it("formats GitHub profile with GitHub-specific metrics and subtitle", () => {
    const vm = toBattleViewModel(PREPARED_TORVALDS_VS_ANTIREZ);
    expect(vm.platform).toBe("GitHub");
    expect(vm.p1.subtitle).toContain("180,000 stars");
    expect(vm.metrics.some((m) => m.label === "Total Stars")).toBe(true);
    expect(vm.metrics.some((m) => m.label === "Original Repos")).toBe(true);
    expect(vm.metrics.some((m) => m.label === "Current Rating")).toBe(false);
  });
});
