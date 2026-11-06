import { describe, it, expect } from "vitest";
import { buildBattleCopy } from "@/lib/battle/copy";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import type { BattleSnapshot } from "@/lib/storage/contracts";

describe("buildBattleCopy", () => {
  const baseDemo = PREPARED_TOURIST_VS_PETR;

  it("builds complete truthful copy for supported win", () => {
    const copy = buildBattleCopy(baseDemo);

    expect(copy.platformId).toBe("codeforces");
    expect(copy.platformLabel).toBe("Codeforces");
    expect(copy.outcomeLine).toBe("@tourist takes it · +7");
    expect(copy.roastText).toBe("The scoreboard crowns the all-time peak champion.");
    expect(copy.scoreLabel).toBe("Score");
    expect(copy.coverageNote).toBeNull();
    expect(copy.isSample).toBe(true); // Since baseDemo has ID "cf-tourist-vs-petr-legendary"
    expect(copy.canonicalPath).toBe("/battle/cf-tourist-vs-petr-legendary");
  });

  it("identifies non-demo battles as isSample: false", () => {
    const nonDemo: BattleSnapshot = {
      ...baseDemo,
      id: "cf-real-battle-12345",
    };
    const copy = buildBattleCopy(nonDemo);
    expect(copy.isSample).toBe(false);
    expect(copy.canonicalPath).toBe("/battle/cf-real-battle-12345");
  });

  it("builds outcomeLine and coverageNote for draw", () => {
    const drawSnap: BattleSnapshot = {
      ...baseDemo,
      id: "cf-draw-test",
      verdict: {
        ...baseDemo.verdict,
        outcome: "draw",
        winnerHandle: null,
        loserHandle: null,
        margin: 0,
      },
    };
    const copy = buildBattleCopy(drawSnap);

    expect(copy.outcomeLine).toBe("draw · 0 points apart");
    expect(copy.roastText).toBe("Same score. Twice the ego.");
  });

  it("builds outcomeLine for mirror match", () => {
    const mirrorSnap: BattleSnapshot = {
      ...baseDemo,
      id: "cf-mirror-test",
      verdict: {
        ...baseDemo.verdict,
        isMirrorMatch: true,
      },
    };
    const copy = buildBattleCopy(mirrorSnap);

    expect(copy.outcomeLine).toBe("mirror match");
    expect(copy.roastText).toBe("Your toughest rival? Still you.");
  });

  it("builds outcomeLine and coverageNote for insufficient evidence", () => {
    const insuffSnap: BattleSnapshot = {
      ...baseDemo,
      id: "cf-insuff-test",
      verdict: {
        ...baseDemo.verdict,
        outcome: "insufficient_data",
        winnerHandle: null,
        loserHandle: null,
      },
    };
    const copy = buildBattleCopy(insuffSnap);

    expect(copy.outcomeLine).toBe("not enough data");
    expect(copy.roastText).toBe("Not enough receipts. No victory lap.");
    expect(copy.scoreLabel).toBe("Score");
    expect(copy.coverageNote).toBe("insufficient evidence");
  });

  it("builds outcomeLine and coverageNote for partial recorded win", () => {
    const partialSnap: BattleSnapshot = {
      ...baseDemo,
      id: "cf-partial-test",
      overlap: {
        ...baseDemo.overlap,
        isDefinitive: false,
      },
      verdict: {
        ...baseDemo.verdict,
        outcome: "win",
        scoringVersion: "2.0.0",
      },
    };
    const copy = buildBattleCopy(partialSnap);

    expect(copy.outcomeLine).toBe("recorded result: @tourist");
    expect(copy.roastText).toBe("Big claims. Limited receipts.");
    expect(copy.scoreLabel).toBe("Recorded score");
    expect(copy.coverageNote).toBe("partial history");
  });

  it("builds coverageNote for historical v1 unknown coverage", () => {
    const legacySnap: BattleSnapshot = {
      ...baseDemo,
      id: "cf-legacy-test",
      overlap: {
        ...baseDemo.overlap,
        isDefinitive: false,
      },
      verdict: {
        ...baseDemo.verdict,
        outcome: "win",
        scoringVersion: "1.0.0",
      },
    };
    const copy = buildBattleCopy(legacySnap);

    expect(copy.outcomeLine).toBe("recorded result: @tourist");
    expect(copy.roastText).toBe("Big claims. Limited receipts.");
    expect(copy.coverageNote).toBe("coverage unavailable");
  });
});
