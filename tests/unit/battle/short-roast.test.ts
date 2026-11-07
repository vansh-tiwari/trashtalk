import { describe, it, expect } from "vitest";
import { selectShortRoast } from "@/lib/battle/short-roast";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import type { BattleSnapshot } from "@/lib/storage/contracts";

describe("selectShortRoast", () => {
  const baseDemo = PREPARED_TOURIST_VS_PETR;

  it("selects valid punchline for supported win and strips matching winner prefix", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: "Winner: @tourist. The scoreboard has spoken, and it was not kind.",
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("The scoreboard has spoken, and it was not kind.");
    expect(roast.toLowerCase()).not.toContain("winner:");
  });

  it("handles punchline with handle containing dots and hyphens without corrupting text", () => {
    const dotHandleSnap: BattleSnapshot = {
      ...baseDemo,
      player1: {
        ...baseDemo.player1,
        handle: "john.doe-pro",
        score: { ...baseDemo.player1.score, handle: "john.doe-pro" },
      },
      verdict: {
        ...baseDemo.verdict,
        winnerHandle: "john.doe-pro",
        loserHandle: "Petr",
      },
      commentary: {
        ...baseDemo.commentary,
        winnerHandle: "john.doe-pro",
        punchline: "Winner: @john.doe-pro - Left nothing on the table.",
      },
    };

    const roast = selectShortRoast(dotHandleSnap);
    expect(roast).toBe("Left nothing on the table.");
  });

  it("preserves punchline without winner prefix if already clean", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: "Petr brought the legacy. Tourist brought the receipts.",
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("Petr brought the legacy. Tourist brought the receipts.");
  });

  it("falls back to deterministic roast when punchline exceeds 24 words", () => {
    const longWords = Array(25).fill("word").join(" ");
    const snap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: `Winner: @tourist. ${longWords}`,
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("@Petr, the scoreboard would like a word.");
  });

  it("falls back to deterministic roast when punchline exceeds 160 Unicode code points", () => {
    // 165 emojis/chars
    const longText = "🔥".repeat(161);
    const snap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: longText,
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("@Petr, the scoreboard would like a word.");
  });

  it("falls back to deterministic roast when punchline is empty or whitespace", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: "   ",
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("@Petr, the scoreboard would like a word.");
  });

  it("falls back when punchline claims contrary winner", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      verdict: {
        ...baseDemo.verdict,
        winnerHandle: "tourist",
        loserHandle: "Petr",
      },
      commentary: {
        ...baseDemo.commentary,
        punchline: "Winner: @Petr. Absolute domination.",
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("@Petr, the scoreboard would like a word.");
  });

  it("uses exact fallback for draw: 'Same score. Twice the ego.'", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      verdict: {
        ...baseDemo.verdict,
        outcome: "draw",
        winnerHandle: null,
        loserHandle: null,
      },
      commentary: {
        ...baseDemo.commentary,
        punchline: "DRAW: some old line",
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("Same score. Twice the ego.");
  });

  it("uses exact fallback for mirror match: 'Your toughest rival? Still you.'", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      verdict: {
        ...baseDemo.verdict,
        isMirrorMatch: true,
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("Your toughest rival? Still you.");
  });

  it("uses exact fallback for insufficient data: 'Not enough receipts. No victory lap.'", () => {
    const snap: BattleSnapshot = {
      ...baseDemo,
      verdict: {
        ...baseDemo.verdict,
        outcome: "insufficient_data",
        winnerHandle: null,
        loserHandle: null,
      },
    };

    const roast = selectShortRoast(snap);
    expect(roast).toBe("Not enough receipts. No victory lap.");
  });

  it("uses exact fallback for partial/unknown recorded win when punchline is empty: 'Big claims. Limited receipts.'", () => {
    const partialSnap: BattleSnapshot = {
      ...baseDemo,
      commentary: {
        ...baseDemo.commentary,
        punchline: "",
      },
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

    const roast = selectShortRoast(partialSnap);
    expect(roast).toBe("Big claims. Limited receipts.");
  });

  it("uses verified punchline for partial matches when punchline is present and valid", () => {
    const partialWithRoast: BattleSnapshot = {
      ...baseDemo,
      overlap: {
        ...baseDemo.overlap,
        isDefinitive: false,
      },
      commentary: {
        ...baseDemo.commentary,
        punchline: "Winner: @tourist. Clean AC on all test cases.",
      },
    };

    const roast = selectShortRoast(partialWithRoast);
    expect(roast).toBe("Clean AC on all test cases.");
  });

  it("never mutates the input snapshot", () => {
    const snapshotCopy = JSON.parse(JSON.stringify(baseDemo));
    selectShortRoast(baseDemo);
    expect(baseDemo).toEqual(snapshotCopy);
  });
});
