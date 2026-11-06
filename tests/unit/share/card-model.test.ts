import { describe, it, expect } from "vitest";
import {
  CARD_DIMENSIONS,
  buildBattleCardModel,
  type BattleCardModel,
} from "@/lib/share/card-model";
import { buildBattleCopy } from "@/lib/battle/copy";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import type { BattleSnapshot } from "@/lib/storage/contracts";

describe("BattleCardModel & CARD_DIMENSIONS", () => {
  it("defines exact dimensions for all three card formats", () => {
    expect(CARD_DIMENSIONS.og).toEqual({ width: 1200, height: 630 });
    expect(CARD_DIMENSIONS.square).toEqual({ width: 1080, height: 1080 });
    expect(CARD_DIMENSIONS.story).toEqual({ width: 1080, height: 1920 });
  });

  it("builds exact card model matching buildBattleCopy for supported sample match", () => {
    const origin = "https://trashtalk.dev";
    const model = buildBattleCardModel(PREPARED_TOURIST_VS_PETR, origin);
    const expectedCopy = buildBattleCopy(PREPARED_TOURIST_VS_PETR);

    expect(model.copy).toEqual(expectedCopy);
    expect(model.player1).toEqual({
      handle: "tourist",
      initials: "TO",
      score: 97,
    });
    expect(model.player2).toEqual({
      handle: "Petr",
      initials: "PE",
      score: 90,
    });
    expect(model.platform.id).toBe("codeforces");
    expect(model.canonicalUrl).toBe(
      "https://trashtalk.dev/battle/cf-tourist-vs-petr-legendary"
    );
    expect(typeof model.formattedDate).toBe("string");
  });

  it("builds consistent card copy for draw, mirror, insufficient, and partial fixtures", () => {
    const origin = "https://trashtalk.dev";

    // 1. Draw fixture
    const drawSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-draw",
      player1: {
        ...PREPARED_TOURIST_VS_PETR.player1,
        score: { ...PREPARED_TOURIST_VS_PETR.player1.score, total: 85 },
      },
      player2: {
        ...PREPARED_TOURIST_VS_PETR.player2,
        score: { ...PREPARED_TOURIST_VS_PETR.player2.score, total: 85 },
      },
      verdict: {
        ...PREPARED_TOURIST_VS_PETR.verdict,
        outcome: "draw",
        winnerHandle: null,
        loserHandle: null,
        margin: 0,
        player1Score: { ...PREPARED_TOURIST_VS_PETR.verdict.player1Score, total: 85 },
        player2Score: { ...PREPARED_TOURIST_VS_PETR.verdict.player2Score, total: 85 },
      },
    };
    const drawModel = buildBattleCardModel(drawSnapshot, origin);
    expect(drawModel.copy).toEqual(buildBattleCopy(drawSnapshot));
    expect(drawModel.copy.outcomeLine).toBe("draw · 0 points apart");
    expect(drawModel.player1.score).toBe(85);
    expect(drawModel.player2.score).toBe(85);
    expect(drawModel.copy.roastText).toBe("Same score. Twice the ego.");
    expect(drawModel.platform.theme.player1Surface).toBe("#304BFF");
    expect(drawModel.platform.theme.player2Surface).toBe("#FF5A2A");

    // 2. Mirror fixture
    const mirrorSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-mirror",
      player2: { ...PREPARED_TOURIST_VS_PETR.player1 },
      verdict: {
        ...PREPARED_TOURIST_VS_PETR.verdict,
        isMirrorMatch: true,
      },
    };
    const mirrorModel = buildBattleCardModel(mirrorSnapshot, origin);
    expect(mirrorModel.copy).toEqual(buildBattleCopy(mirrorSnapshot));
    expect(mirrorModel.copy.outcomeLine).toBe("mirror match");
    expect(mirrorModel.copy.roastText).toBe("Your toughest rival? Still you.");
    expect(mirrorModel.platform.theme).toBeDefined();

    // 3. Insufficient data fixture
    const insufficientSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-insufficient",
      verdict: {
        ...PREPARED_TOURIST_VS_PETR.verdict,
        outcome: "insufficient_data",
        winnerHandle: null,
        loserHandle: null,
      },
    };
    const insufficientModel = buildBattleCardModel(insufficientSnapshot, origin);
    expect(insufficientModel.copy).toEqual(buildBattleCopy(insufficientSnapshot));
    expect(insufficientModel.copy.outcomeLine).toBe("not enough data");
    expect(insufficientModel.player1.score).toBe(insufficientSnapshot.player1.score.total);
    expect(insufficientModel.player2.score).toBe(insufficientSnapshot.player2.score.total);
    expect(insufficientModel.copy.roastText).toBe("Not enough receipts. No victory lap.");
    expect(insufficientModel.platform.theme.accent).toBe("#304BFF");

    // 4. Partial fixture (non-definitive)
    const partialSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-partial",
      overlap: {
        ...PREPARED_TOURIST_VS_PETR.overlap,
        isDefinitive: false,
      },
    };
    const partialModel = buildBattleCardModel(partialSnapshot, origin);
    expect(partialModel.copy).toEqual(buildBattleCopy(partialSnapshot));
    expect(partialModel.copy.outcomeLine).toContain("recorded result");
    expect(partialModel.platform.theme).toBeDefined();
  });

  it("does not mutate the input snapshot", () => {
    const clone = JSON.parse(JSON.stringify(PREPARED_TOURIST_VS_PETR));
    buildBattleCardModel(clone, "https://trashtalk.dev");
    expect(clone).toEqual(PREPARED_TOURIST_VS_PETR);
  });

  it("handles invalid createdAt dates gracefully with fallback date string", () => {
    const invalidDateSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      createdAt: "not-a-real-date",
    };
    const model = buildBattleCardModel(invalidDateSnapshot, "https://trashtalk.dev");
    expect(model.formattedDate.toLowerCase()).toContain("recorded");
  });

  it("handles 24-character handles correctly without throwing or truncating handle string", () => {
    const longHandleSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      player1: {
        ...PREPARED_TOURIST_VS_PETR.player1,
        handle: "abcdefghijklmnopqrstuvwx", // 24 chars
      },
    };
    const model = buildBattleCardModel(longHandleSnapshot, "https://trashtalk.dev");
    expect(model.player1.handle).toBe("abcdefghijklmnopqrstuvwx");
    expect(model.player1.initials).toBe("AB");
  });

  it("guarantees English roast is used for cards even when snapshot commentary is in a regional language", () => {
    const regionalSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      commentary: {
        source: "local",
        persona: "savage_dev",
        headToHeadRoast: "Bhai 400 Easy solves karke bhi hawa nikal gayi.",
        player1Roast: "Mummy ke account se star karwaya tha.",
        player2Roast: "Pretest 2 pe TLE kha liya.",
        punchline: "Winner: @tourist. Loser ko bolo resume me 'Hardworking' likhna band kare.",
        winnerHandle: "tourist",
        promptVersion: "2.0.0",
      },
      englishCommentary: {
        source: "local",
        persona: "savage_dev",
        headToHeadRoast: "Algorithmic masterclass.",
        player1Roast: "Clean execution.",
        player2Roast: "Stuck on brute force.",
        punchline: "Winner: @tourist. The scoreboard would like a word.",
        winnerHandle: "tourist",
        promptVersion: "2.0.0",
      },
      regionInfo: {
        countryCode: "IN",
        languageCode: "hi",
        languageName: "Hinglish",
        toggleLabel: "HINGLISH",
        isEnglishDefault: false,
      },
    };

    const model = buildBattleCardModel(regionalSnapshot, "https://trashtalk.dev");
    expect(model.copy.roastText).toBe("The scoreboard would like a word.");
    expect(model.copy.roastText).not.toContain("Hardworking");
  });
});
