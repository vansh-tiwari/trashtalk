import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_NEETCODE_VS_LARRYNY,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "@/lib/demo/prepared-battles";
import BattleResult from "@/components/battle/BattleResult";
import SavedBattlePage from "@/app/battle/[id]/page";
import type { BattleSnapshot } from "@/lib/storage/contracts";

describe("BattleResult Component (Cool Social Result Hierarchy)", () => {
  it("renders one single short roast, outcome line, and no duplicate commentary paragraphs", () => {
    const html = renderToStaticMarkup(<BattleResult snapshot={PREPARED_TOURIST_VS_PETR} />);

    // Section order check: Scoreboard, Roast, Receipts/Radar, Problems, Send strip
    expect(html).toContain("the receipts.");
    expect(html).toContain("skill check.");
    expect(html).toContain("same problems?");
    expect(html).toContain("group chat’s waiting.");

    // Exactly one short roast displayed in the roast section
    expect(html).toContain("The scoreboard crowns the all-time peak champion.");

    // No long per-player roast essays or separate commentary blocks
    expect(html).not.toContain("4009 peak rating. You&#x27;ve solved problems so fast");
    expect(html).not.toContain("You were winning ACM-ICPC while half of modern competitors");
    expect(html).not.toContain("AI Commentary");
    expect(html).not.toContain("Gemini");
    expect(html).not.toContain("AI judge");

    // Outcome line inside the roast moment
    expect(html).toContain("@tourist takes it · +7");
    expect(html).toContain("savage dev");

    // Rematch control with URLSearchParams including platform=codeforces
    expect(html).toContain("run it back");
    expect(html).toContain("u1=tourist");
    expect(html).toContain("u2=Petr");
    expect(html).toContain("platform=codeforces");
  });

  it("preserves exact handle casing and renders white strip clash in the scoreboard", () => {
    const html = renderToStaticMarkup(<BattleResult snapshot={PREPARED_TOURIST_VS_PETR} />);

    expect(html).toContain("tourist");
    expect(html).toContain("Petr");
    expect(html).toContain("97");
    expect(html).toContain("90");
    expect(html).toContain("3,840");
    expect(html).toContain("3,300");

    // 3-Row structure test IDs and sequential hierarchy
    expect(html).toContain('data-testid="player1-panel"');
    expect(html).toContain('data-testid="scoreboard-clash-slab"');
    expect(html).toContain('data-testid="player2-panel"');
    const p1Idx = html.indexOf('data-testid="player1-panel"');
    const clashIdx = html.indexOf('data-testid="scoreboard-clash-slab"');
    const p2Idx = html.indexOf('data-testid="player2-panel"');
    expect(p1Idx).toBeLessThan(clashIdx);
    expect(clashIdx).toBeLessThan(p2Idx);

    // The old scoreboard punchline duplicate must NOT exist inside the scoreboard
    // (punchline was rendered twice in the old design)
    const matches = html.match(/The scoreboard crowns the all-time peak champion/g);
    expect(matches).toHaveLength(1);
  });

  it("handles a 24-character handle and absent rank/avatar gracefully", () => {
    const longHandleSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-long-handle",
      player1: {
        ...PREPARED_TOURIST_VS_PETR.player1,
        handle: "abcdefghijklmnopqrstuvwx", // 24 chars
        displayName: "abcdefghijklmnopqrstuvwx",
        avatarUrl: undefined,
        rank: undefined,
      },
    };

    const html = renderToStaticMarkup(<BattleResult snapshot={longHandleSnapshot} />);
    expect(html).toContain("abcdefghijklmnopqrstuvwx");
    // Monogram fallback for absent avatar
    expect(html).toContain("AB");
  });

  it("renders draw matchups without winner crown or winner take banner", () => {
    const drawSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-draw",
      verdict: {
        ...PREPARED_TOURIST_VS_PETR.verdict,
        outcome: "draw",
        winnerHandle: null,
        loserHandle: null,
        margin: 0,
      },
    };

    const html = renderToStaticMarkup(<BattleResult snapshot={drawSnapshot} />);
    expect(html).toContain("draw · 0 points apart");
    expect(html).toContain("Same score. Twice the ego.");
    expect(html).not.toContain("takes it");
  });

  it("renders insufficient data matchups truthfully", () => {
    const insufficientSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-insufficient",
      verdict: {
        ...PREPARED_TOURIST_VS_PETR.verdict,
        outcome: "insufficient_data",
        winnerHandle: null,
        loserHandle: null,
        margin: 0,
      },
    };

    const html = renderToStaticMarkup(<BattleResult snapshot={insufficientSnapshot} />);
    expect(html).toContain("not enough data");
    expect(html).toContain("Not enough receipts. No victory lap.");
    expect(html).not.toContain("takes it");
  });

  it("displays coverage note near the result for partial or legacy data", () => {
    const partialSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-partial",
      overlap: {
        ...PREPARED_TOURIST_VS_PETR.overlap,
        isDefinitive: false,
      },
      coverageNote: "Historical limit: Codeforces recent activity window was reached.",
    };

    const html = renderToStaticMarkup(<BattleResult snapshot={partialSnapshot} />);
    expect(html).toContain("Historical limit: Codeforces recent activity window was reached.");
  });

  it("renders LeetCode battle result cleanly without error", () => {
    const html = renderToStaticMarkup(<BattleResult snapshot={PREPARED_NEETCODE_VS_LARRYNY} />);
    expect(html).toContain("neetcode");
    expect(html).toContain("larryny");
    expect(html).toContain("LeetCode");
  });

  it("renders SavedBattlePage for LeetCode prepared battle cleanly", async () => {
    const jsx = await SavedBattlePage({
      params: Promise.resolve({ id: "lc-neetcode-vs-larryny-legendary" }),
    });
    const html = renderToStaticMarkup(jsx);
    expect(html).toContain("neetcode");
    expect(html).toContain("larryny");
  });

  it("renders GitHub battle result with Open Source Showcase and no Same Problems section", () => {
    const html = renderToStaticMarkup(<BattleResult snapshot={PREPARED_TORVALDS_VS_ANTIREZ} />);
    expect(html).toContain("torvalds");
    expect(html).toContain("antirez");
    expect(html).toContain("Open Source Showcase");
    expect(html).toContain("Flagship Projects");
    expect(html).toContain("linux");
    expect(html).toContain("redis");
    expect(html).not.toContain("same problems?");
    expect(html).toContain("Shipping activity · Tech stack");
    expect(html).toContain("Stack &amp; Dossier");

    // Dynamic GitHub Skill Radar labels
    expect(html).toContain("GRAVITY");
    expect(html).toContain("CADENCE");
    expect(html).toContain("REPOS");
    expect(html).toContain("COMMUNITY");
    expect(html).toContain("STACK");
    expect(html).not.toContain("CONTEST");
    expect(html).not.toContain(">GRIT<");

    // Metric comparison tale of the tape header
    expect(html).toContain("OSS RECEIPTS");
  });

  it("renders CP radar with corrected volume and peak labels without typo GIT", () => {
    const html = renderToStaticMarkup(<BattleResult snapshot={PREPARED_TOURIST_VS_PETR} />);
    expect(html).toContain("GRIT");
    expect(html).toContain("PEAK");
    expect(html).toContain("VOLUME");
    expect(html).toContain("VELOCITY");
    expect(html).toContain("BREADTH");
    expect(html).not.toContain(">GIT<");
    expect(html).toContain("TALE OF THE TAPE");
  });
});
