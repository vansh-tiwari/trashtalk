import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ScoreBreakdown from "@/components/battle/ScoreBreakdown";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "@/lib/demo/prepared-battles";

describe("ScoreBreakdown Component", () => {
  it("renders Codeforces battle without serializing function objects into the DOM", () => {
    const s = PREPARED_TOURIST_VS_PETR;
    const html = renderToStaticMarkup(
      <ScoreBreakdown
        p1Score={s.player1.score}
        p2Score={s.player2.score}
        p1Handle={s.player1.handle}
        p2Handle={s.player2.handle}
        outcome={s.verdict.outcome}
        winnerHandle={s.verdict.winnerHandle}
        margin={s.verdict.margin}
        platform={s.platform}
      />
    );

    // Verify axis labels render as human strings
    expect(html).toContain("Algorithmic Grit");
    expect(html).toContain("Contest Peak");
    expect(html).toContain("Solve Volume");
    expect(html).toContain("Recent Velocity");
    expect(html).toContain("Topic Breadth");

    // Critical: Never serialize function representations into JSX/HTML
    expect(html).not.toContain("(platform) =>");
    expect(html).not.toContain("=>");
    expect(html).not.toContain("[object Function]");

    // Narrative section check
    expect(html).toContain("Why this match was decided:");
    expect(html).toContain(`@${s.verdict.winnerHandle} won by +${s.verdict.margin} points.`);
  });

  it("renders GitHub battle with custom axis labels and clean narrative", () => {
    const s = PREPARED_TORVALDS_VS_ANTIREZ;
    const html = renderToStaticMarkup(
      <ScoreBreakdown
        p1Score={s.player1.score}
        p2Score={s.player2.score}
        p1Handle={s.player1.handle}
        p2Handle={s.player2.handle}
        outcome={s.verdict.outcome}
        winnerHandle={s.verdict.winnerHandle}
        margin={s.verdict.margin}
        platform={s.platform}
      />
    );

    expect(html).toContain("Star Gravity");
    expect(html).toContain("Shipping Cadence");
    expect(html).toContain("Repo Depth");
    expect(html).toContain("Community Footprint");
    expect(html).toContain("Tech Stack Breadth");

    // Never serialize functions
    expect(html).not.toContain("(platform) =>");
    expect(html).not.toContain("=>");

    expect(html).toContain("Why this match was decided:");
  });

  it("renders tie matches with clean counter-advantage narrative", () => {
    const p1Score = {
      handle: "alpha",
      total: 85,
      axes: {
        algorithmicGrit: 90,
        contestPeak: 80,
        solveVolume: 85,
        recentVelocity: 85,
        topicBreadth: 85,
      },
      metrics: {
        rating: 2000,
        maxRating: 2100,
        solvedCount: 500,
        recentAcceptedCount: 50,
        distinctTagsCount: 20,
      },
    };
    const p2Score = {
      handle: "beta",
      total: 85,
      axes: {
        algorithmicGrit: 80,
        contestPeak: 90,
        solveVolume: 85,
        recentVelocity: 85,
        topicBreadth: 85,
      },
      metrics: {
        rating: 2000,
        maxRating: 2200,
        solvedCount: 500,
        recentAcceptedCount: 50,
        distinctTagsCount: 20,
      },
    };

    const html = renderToStaticMarkup(
      <ScoreBreakdown
        p1Score={p1Score}
        p2Score={p2Score}
        p1Handle="alpha"
        p2Handle="beta"
        outcome="draw"
        winnerHandle={null}
        margin={0}
        platform="codeforces"
      />
    );

    expect(html).toContain("Why this ended in a tie:");
    expect(html).toContain("@alpha held an advantage in Algorithmic Grit");
    expect(html).toContain("@beta countered with an advantage in Contest Peak");
    expect(html).not.toContain("(platform) =>");
  });
});
