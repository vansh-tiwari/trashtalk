import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LandingExperience from "@/components/landing/LandingExperience";
import { PREPARED_TOURIST_VS_PETR, PREPARED_TORVALDS_VS_ANTIREZ } from "@/lib/demo/prepared-battles";
import * as registry from "@/lib/platforms/registry";

describe("LandingExperience", () => {
  it("renders platform-neutral hero, all four platform selectors, and real Codeforces demo", () => {
    const html = renderToStaticMarkup(
      <LandingExperience demo={PREPARED_TOURIST_VS_PETR} />
    );

    // Brutalist hero copy
    expect(html).toContain("The developer battle arena");
    expect(html).toContain("Where developer profiles go to get roasted.");

    // All four platforms discoverable
    expect(html).toContain("Codeforces");
    expect(html).toContain("LeetCode");
    expect(html).toContain("GitHub");
    expect(html).toContain("CodeChef");

    // Real Codeforces demo link
    expect(html).toContain("/battle/cf-tourist-vs-petr-legendary");
    expect(html).toContain("tourist vs Petr");

    // Process steps
    expect(html).toContain("Three taps to a roast");
    expect(html).toContain("Drop two handles");
    expect(html).toContain("Get roasted");
    expect(html).toContain("Send it to them");

    // Final CTA
    expect(html).not.toContain("Fresh roasts");
    expect(html).toContain("Who’s next?");
  });

  it("renders live LeetCode battle form when selected as initial platform", () => {
    const html = renderToStaticMarkup(
      <LandingExperience demo={PREPARED_TOURIST_VS_PETR} initialPlatform="leetcode" />
    );

    expect(html).toContain('placeholder="neetcode"');
    expect(html).toContain('placeholder="larryny"');
    expect(html).toContain("/battle/lc-neetcode-vs-larryny-legendary");
    expect(html).toContain("neetcode vs larryny");
    expect(html).toContain("Fight");
  });

  it("renders live GitHub battle form when selected as initial platform", () => {
    const html = renderToStaticMarkup(
      <LandingExperience demo={PREPARED_TORVALDS_VS_ANTIREZ} initialPlatform="github" />
    );

    expect(html).toContain('placeholder="torvalds"');
    expect(html).toContain('placeholder="antirez"');
    expect(html).toContain("/battle/gh-torvalds-vs-antirez-legendary");
    expect(html).toContain("torvalds vs antirez");
    expect(html).toContain("Fight");
  });

  it("renders non-live platform preview cleanly when a platform is disabled", () => {
    vi.spyOn(registry, "isBattleEnabled").mockReturnValueOnce(false);
    const html = renderToStaticMarkup(
      <LandingExperience demo={PREPARED_TOURIST_VS_PETR} initialPlatform="github" />
    );

    expect(html).toContain("GitHub is coming later.");
    expect(html).toContain("try Codeforces");
  });
});
