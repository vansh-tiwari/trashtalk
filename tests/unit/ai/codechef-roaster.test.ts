import { describe, it, expect } from "vitest";
import { generateLocalCommentary } from "@/lib/ai/local-roaster";
import { selectShortRoast } from "@/lib/battle/short-roast";
import { CodechefEvidence } from "@/lib/platforms/contracts";
import { BattleSnapshot } from "@/lib/storage/contracts";
import { BattleVerdict } from "@/lib/battle/types";

function createMockCodechefEvidence(
  handle: string,
  stars: number,
  division: 1 | 2 | 3 | 4,
  rating: number,
  totalSolved: number
): CodechefEvidence {
  return {
    platform: "codechef",
    handle,
    status: "ok",
    fetchedAt: new Date().toISOString(),
    profile: {
      handle,
      rating,
      highestRating: rating + 50,
      stars,
      starString: `${stars}★`,
      division,
      contestsParticipated: 30,
      totalSolved,
      listedSolvedCount: 20,
    },
    coverage: {
      historyAvailability: "complete",
      isComplete: false,
      totalSubmissionsFetched: 20,
      totalAcceptedSolved: totalSolved,
    },
  };
}

describe("CodeChef Roasting Engine & Commentary", () => {
  const p1 = createMockCodechefEvidence("master_chef", 6, 1, 2350, 800);
  const p2 = createMockCodechefEvidence("line_cook", 2, 3, 1500, 80);

  const verdict: BattleVerdict = {
    outcome: "win",
    winnerHandle: "master_chef",
    loserHandle: "line_cook",
    isMirrorMatch: false,
    margin: 35,
    reasoning: "@master_chef outperformed @line_cook across all axes.",
    scoringVersion: "2.0.0",
    player1Score: {
      handle: "master_chef",
      total: 82,
      axes: { algorithmicGrit: 85, contestPeak: 80, solveVolume: 80, recentVelocity: 80, topicBreadth: 75 },
      metrics: { rating: 2350, maxRating: 2400, solvedCount: 800, recentAcceptedCount: 30, distinctTagsCount: 15 },
    },
    player2Score: {
      handle: "line_cook",
      total: 47,
      axes: { algorithmicGrit: 25, contestPeak: 45, solveVolume: 40, recentVelocity: 30, topicBreadth: 35 },
      metrics: { rating: 1500, maxRating: 1550, solvedCount: 80, recentAcceptedCount: 5, distinctTagsCount: 5 },
    },
  };

  it("generates flavorful CodeChef commentary with kitchen & star puns", () => {
    const commentary = generateLocalCommentary({
      p1Evidence: p1,
      p2Evidence: p2,
      verdict,
      persona: "savage_dev",
      platform: "codechef",
    });

    expect(commentary.headToHeadRoast.length).toBeGreaterThan(20);
    expect(commentary.player1Roast.length).toBeGreaterThan(20);
    expect(commentary.player2Roast.length).toBeGreaterThan(20);
    expect(commentary.punchline.length).toBeGreaterThan(10);

    // Contradiction guard: Commentary must NOT claim loser won
    expect(commentary.headToHeadRoast.toLowerCase()).toContain("master_chef");
    expect(commentary.headToHeadRoast.toLowerCase()).not.toContain("line_cook won");
  });

  it("selects punchy CodeChef winner-to-loser short roast", () => {
    const snapshot: BattleSnapshot = {
      id: "cc-master_chef-vs-line_cook-test",
      createdAt: new Date().toISOString(),
      platform: "codechef",
      persona: "savage_dev",
      player1: {
        handle: "master_chef",
        displayName: "master_chef",
        score: verdict.player1Score,
      },
      player2: {
        handle: "line_cook",
        displayName: "line_cook",
        score: verdict.player2Score,
      },
      verdict,
      overlap: {
        commonCount: 0,
        totalUnionCount: 20,
        dnaPercentage: 10,
        isDefinitive: true,
        common: [],
        player1Exclusive: [],
        player2Exclusive: [],
      },
      commentary: {
        source: "local",
        persona: "savage_dev",
        headToHeadRoast: "@master_chef cooked @line_cook.",
        player1Roast: "6★ master.",
        player2Roast: "2★ line cook.",
        punchline: "Winner: @master_chef - Cooked to a crisp: served @line_cook a 5-star masterclass.",
        winnerHandle: "master_chef",
        promptVersion: "2.0.0",
      },
    };

    const shortRoast = selectShortRoast(snapshot);
    expect(shortRoast).toBeDefined();
    expect(shortRoast.length).toBeGreaterThan(15);
    expect(shortRoast.toLowerCase()).toContain("line_cook");
  });
});
