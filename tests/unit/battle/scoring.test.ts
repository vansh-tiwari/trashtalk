import { describe, it, expect } from "vitest";
import { scoreCodeforcesBattle } from "@/lib/battle/scoring";
import { CodeforcesEvidence } from "@/lib/platforms/contracts";

function createMockEvidence(
  handle: string,
  rating: number,
  solvedCount: number,
  status: CodeforcesEvidence["status"] = "ok"
): CodeforcesEvidence {
  return {
    platform: "codeforces",
    handle,
    status,
    fetchedAt: new Date().toISOString(),
    profile:
      status === "ok"
        ? {
            handle,
            displayName: handle,
            rating,
            maxRating: rating + 100,
            rank: rating > 3000 ? "legendary grandmaster" : "expert",
            contribution: 10,
            friendCount: 50,
          }
        : undefined,
    contestHistory: [
      {
        contestId: 1,
        contestName: "Round #1",
        rank: 10,
        oldRating: 1500,
        newRating: rating,
        ratingUpdateTimeSeconds: 1600000000,
      },
    ],
    solvedProblems: Array.from({ length: solvedCount }).map((_, i) => ({
      id: `CF:${i}:A`,
      platform: "codeforces",
      index: "A",
      name: `Problem ${i}`,
      rating: 1200 + (i % 10) * 100,
      tags: i % 2 === 0 ? ["dp", "graphs"] : ["math"],
      acceptedAt: 1600000000 + i * 100,
      url: `https://codeforces.com/problem/${i}`,
    })),
    coverage: {
      historyAvailability: "complete",
      isComplete: true,
      totalSubmissionsFetched: solvedCount,
      totalAcceptedSolved: solvedCount,
    },
  };
}

describe("Deterministic Battle Scoring Engine", () => {
  it("determines clear winner with truthful scores and explanation", () => {
    const p1 = createMockEvidence("legend", 3500, 800);
    const p2 = createMockEvidence("novice", 1300, 50);

    const result = scoreCodeforcesBattle(p1, p2);

    expect(result.outcome).toBe("win");
    expect(result.winnerHandle).toBe("legend");
    expect(result.loserHandle).toBe("novice");
    expect(result.player1Score.total).toBeGreaterThan(result.player2Score.total);
    expect(result.reasoning).toContain("Contest Peak");
  });

  it("is position-invariant: swapping players preserves the winner", () => {
    const p1 = createMockEvidence("coderA", 2400, 500);
    const p2 = createMockEvidence("coderB", 1800, 200);

    const normal = scoreCodeforcesBattle(p1, p2);
    const swapped = scoreCodeforcesBattle(p2, p1);

    expect(normal.winnerHandle).toBe("coderA");
    expect(swapped.winnerHandle).toBe("coderA");
  });

  it("declares a draw when scores are tied", () => {
    const p1 = createMockEvidence("twin1", 2000, 300);
    const p2 = createMockEvidence("twin2", 2000, 300);

    const result = scoreCodeforcesBattle(p1, p2);

    expect(result.outcome).toBe("draw");
    expect(result.winnerHandle).toBeNull();
  });

  it("handles mirror matches (comparing user with themselves)", () => {
    const p1 = createMockEvidence("same_guy", 2100, 400);
    const p2 = createMockEvidence("same_guy", 2100, 400);

    const result = scoreCodeforcesBattle(p1, p2);

    expect(result.isMirrorMatch).toBe(true);
    expect(result.outcome).toBe("draw");
  });

  it("returns insufficient_data if either profile is not found or unavailable", () => {
    const p1 = createMockEvidence("valid_user", 2000, 300);
    const p2 = createMockEvidence("missing_user", 0, 0, "not_found");

    const result = scoreCodeforcesBattle(p1, p2);

    expect(result.outcome).toBe("insufficient_data");
    expect(result.winnerHandle).toBeNull();
    expect(result.error).toContain("missing_user");
  });
});
