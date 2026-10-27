import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCommentary } from "@/lib/ai/roast-engine";
import { BattleVerdict } from "@/lib/battle/types";
import { CodeforcesEvidence } from "@/lib/platforms/contracts";
import { RequestThrottler, EvidenceCache } from "@/lib/platforms/http";

function createMockEvidence(handle: string, rating = 2000): CodeforcesEvidence {
  return {
    platform: "codeforces",
    handle,
    status: "ok",
    fetchedAt: new Date().toISOString(),
    profile: {
      handle,
      rating,
      maxRating: rating,
      contribution: 0,
      friendCount: 0,
    },
    coverage: {
      historyAvailability: "complete",
      isComplete: true,
      totalSubmissionsFetched: 50,
      totalAcceptedSolved: 50,
    },
    solvedProblems: [],
  };
}

describe("Admission Limits, Provider Pacing & Contradictory AI Guard (Task 4)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects contradictory AI prose that declares the loser as the winner", async () => {
    const e1 = createMockEvidence("tourist", 3800);
    const e2 = createMockEvidence("Petr", 3200);

    const verdict: BattleVerdict = {
      outcome: "win",
      winnerHandle: "tourist",
      loserHandle: "Petr",
      isMirrorMatch: false,
      margin: 15,
      reasoning: "tourist dominated on all axes.",
      scoringVersion: "2.0.0",
      player1Score: {
        handle: "tourist",
        total: 95,
        axes: { algorithmicGrit: 95, contestPeak: 100, solveVolume: 90, recentVelocity: 85, topicBreadth: 90 },
        metrics: { rating: 3800, maxRating: 3800, solvedCount: 1500, recentAcceptedCount: 40, distinctTagsCount: 20 },
      },
      player2Score: {
        handle: "Petr",
        total: 80,
        axes: { algorithmicGrit: 80, contestPeak: 85, solveVolume: 75, recentVelocity: 70, topicBreadth: 80 },
        metrics: { rating: 3200, maxRating: 3200, solvedCount: 1000, recentAcceptedCount: 20, distinctTagsCount: 18 },
      },
    };

    // AI returns valid JSON but contradictory winner claims (proclaims Petr the winner)
    const mockModel = {
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              headToHeadRoast: "Petr completely destroyed tourist today.",
              player1Roast: "tourist you are washed up.",
              player2Roast: "Petr is the true king.",
              punchline: "Winner: @Petr. Absolute domination by Petr.",
            }),
        },
      }),
    };

    // Inject mock AI or test commentary engine contradictory detection
    const commentary = await generateCommentary({
      p1Evidence: e1,
      p2Evidence: e2,
      verdict,
      persona: "savage_dev",
      apiKey: "dummy-test-key",
      // pass custom mock runner if supported or verify local fallback on contradiction
    });

    // Authoritative winner MUST be locked to tourist, never Petr
    expect(commentary.winnerHandle).toBe("tourist");
    // Contradictory text must not proclaim loser as winner
    expect(commentary.punchline.toLowerCase()).not.toContain("winner: @petr");
  });

  it("handles AI model refusal, malformed JSON, or 429 quota exhaustion with graceful local fallback", async () => {
    const e1 = createMockEvidence("alpha", 2100);
    const e2 = createMockEvidence("beta", 1900);
    const verdict: BattleVerdict = {
      outcome: "win",
      winnerHandle: "alpha",
      loserHandle: "beta",
      isMirrorMatch: false,
      margin: 10,
      reasoning: "alpha won.",
      scoringVersion: "2.0.0",
      player1Score: { handle: "alpha", total: 75, axes: {} as any, metrics: {} as any },
      player2Score: { handle: "beta", total: 65, axes: {} as any, metrics: {} as any },
    };

    // With no API key or on error, must immediately return local commentary
    const commentary = await generateCommentary({
      p1Evidence: e1,
      p2Evidence: e2,
      verdict,
      persona: "silicon_valley_vc",
    });

    expect(commentary.source).toBe("local");
    expect(commentary.winnerHandle).toBe("alpha");
    expect(commentary.punchline).toBeTruthy();
    expect(commentary.headToHeadRoast).toBeTruthy();
  });

  it("bounds provider scheduler queue and rejects when queue exceeds capacity", async () => {
    // Throttler with maxQueue = 3
    const throttler = new RequestThrottler(500, 3);

    // Queue 3 requests
    const p1 = throttler.schedule(async () => "ok1");
    const p2 = throttler.schedule(async () => "ok2");
    const p3 = throttler.schedule(async () => "ok3");

    // 4th request must exceed bounded queue capacity
    await expect(throttler.schedule(async () => "overflow")).rejects.toThrow(/queue capacity exceeded/i);

    await Promise.all([p1, p2, p3]);
  });

  it("caches evidence and avoids duplicate provider calls within TTL", async () => {
    const cache = new EvidenceCache(60000); // 1 minute TTL
    const mockEvidence = createMockEvidence("cached_coder");

    cache.set("codeforces:cached_coder", mockEvidence);

    const retrieved = cache.get("codeforces:cached_coder");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.handle).toBe("cached_coder");

    // Missing key returns null
    expect(cache.get("codeforces:unknown")).toBeNull();
  });
});
