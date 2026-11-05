import { describe, it, expect } from "vitest";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_NEETCODE_VS_LARRYNY,
  PREPARED_AKULSAREEN_VS_GENNADY,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "@/lib/demo/prepared-battles";

describe("Prepared Demo Battles", () => {
  it("includes all 4 legendary demo matchups across platforms", () => {
    expect(PREPARED_TOURIST_VS_PETR.platform).toBe("codeforces");
    expect(PREPARED_NEETCODE_VS_LARRYNY.platform).toBe("leetcode");
    expect(PREPARED_AKULSAREEN_VS_GENNADY.platform).toBe("codechef");

    // GitHub Legendary Matchup
    expect(PREPARED_TORVALDS_VS_ANTIREZ).toBeDefined();
    expect(PREPARED_TORVALDS_VS_ANTIREZ.platform).toBe("github");
    expect(PREPARED_TORVALDS_VS_ANTIREZ.id).toBe("gh-torvalds-vs-antirez-legendary");
    expect(PREPARED_TORVALDS_VS_ANTIREZ.player1.handle).toBe("torvalds");
    expect(PREPARED_TORVALDS_VS_ANTIREZ.player2.handle).toBe("antirez");
    expect(PREPARED_TORVALDS_VS_ANTIREZ.verdict.winnerHandle).toBeDefined();
    expect(PREPARED_TORVALDS_VS_ANTIREZ.overlap.player1Exclusive.length).toBeGreaterThan(0);
    expect(PREPARED_TORVALDS_VS_ANTIREZ.commentary.punchline).toContain("Winner:");
  });
});
