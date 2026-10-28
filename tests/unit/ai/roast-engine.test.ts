import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateCommentary } from "@/lib/ai/roast-engine";
import { BattleVerdict } from "@/lib/battle/types";
import { CodeforcesEvidence } from "@/lib/platforms/contracts";

function createEvidenceStub(handle: string, rating: number, solvedCount: number): CodeforcesEvidence {
  return {
    platform: "codeforces",
    handle,
    status: "ok",
    fetchedAt: new Date().toISOString(),
    profile: {
      handle,
      rating,
      maxRating: rating,
      rank: rating > 3000 ? "legendary grandmaster" : "expert",
      contribution: 10,
      friendCount: 50,
    },
    solvedProblems: Array.from({ length: solvedCount }).map((_, i) => ({
      id: `CF:${i}:A`,
      platform: "codeforces",
      index: "A",
      name: `Problem ${i}`,
      rating: 1200,
      tags: ["math"],
      acceptedAt: 1600000000,
      url: `https://codeforces.com/problem/${i}`,
    })),
    coverage: { historyAvailability: "complete", isComplete: true, totalSubmissionsFetched: solvedCount, totalAcceptedSolved: solvedCount },
  };
}

describe("Reliable Persona Commentary Engine", () => {
  const p1 = createEvidenceStub("tourist", 3800, 1000);
  const p2 = createEvidenceStub("petr", 3500, 800);

  const mockVerdict: BattleVerdict = {
    outcome: "win",
    winnerHandle: "tourist",
    loserHandle: "petr",
    isMirrorMatch: false,
    margin: 15,
    reasoning: "tourist outperformed petr in Contest Peak and Algorithmic Grit.",
    scoringVersion: "1.0.0",
    player1Score: {
      handle: "tourist",
      total: 95,
      axes: { algorithmicGrit: 100, contestPeak: 100, solveVolume: 100, recentVelocity: 80, topicBreadth: 90 },
      metrics: { rating: 3800, maxRating: 3800, solvedCount: 1000, recentAcceptedCount: 80, distinctTagsCount: 20 },
    },
    player2Score: {
      handle: "petr",
      total: 80,
      axes: { algorithmicGrit: 90, contestPeak: 90, solveVolume: 80, recentVelocity: 60, topicBreadth: 80 },
      metrics: { rating: 3500, maxRating: 3500, solvedCount: 800, recentAcceptedCount: 50, distinctTagsCount: 18 },
    },
  };

  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("produces valid local commentary when no API key is provided", async () => {
    const result = await generateCommentary({
      p1Evidence: p1,
      p2Evidence: p2,
      verdict: mockVerdict,
      persona: "savage_dev",
    });

    expect(result.source).toBe("local");
    expect(result.persona).toBe("savage_dev");
    expect(result.winnerHandle).toBe("tourist"); // Locked to verdict
    expect(result.headToHeadRoast).toBeTruthy();
    expect(result.player1Roast).toContain("tourist");
    expect(result.player2Roast).toContain("petr");
  });

  it("supports all 4 distinct personas in local mode", async () => {
    const personas = ["savage_dev", "silicon_valley_vc", "ufc_announcer", "hype_man"] as const;

    for (const persona of personas) {
      const result = await generateCommentary({
        p1Evidence: p1,
        p2Evidence: p2,
        verdict: mockVerdict,
        persona,
      });

      expect(result.persona).toBe(persona);
      expect(result.winnerHandle).toBe("tourist");
      expect(result.headToHeadRoast.length).toBeGreaterThan(20);
    }
  });

  it("remains locked to the verdict: changing persona never changes the winner", async () => {
    const vcResult = await generateCommentary({
      p1Evidence: p1,
      p2Evidence: p2,
      verdict: mockVerdict,
      persona: "silicon_valley_vc",
    });

    const announcerResult = await generateCommentary({
      p1Evidence: p1,
      p2Evidence: p2,
      verdict: mockVerdict,
      persona: "ufc_announcer",
    });

    expect(vcResult.winnerHandle).toBe(mockVerdict.winnerHandle);
    expect(announcerResult.winnerHandle).toBe(mockVerdict.winnerHandle);
  });

  it("handles draws accurately without inventing a fake winner", async () => {
    const drawVerdict: BattleVerdict = {
      ...mockVerdict,
      outcome: "draw",
      winnerHandle: null,
      loserHandle: null,
      margin: 0,
      reasoning: "Tied scores",
    };

    const result = await generateCommentary({
      p1Evidence: p1,
      p2Evidence: p2,
      verdict: drawVerdict,
      persona: "savage_dev",
    });

    expect(result.winnerHandle).toBeNull();
    expect(result.punchline.toLowerCase()).toContain("draw");
  });
});
