import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProblemExplorer from "@/components/problems/ProblemExplorer";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import type { OverlapResult } from "@/lib/battle/types";

describe("ProblemExplorer Component (Truthful Overlap & Cool Social Explorer)", () => {
  it("renders definitive overlap with DNA percentage, segmented DNA bar, and correct counts", () => {
    const html = renderToStaticMarkup(
      <ProblemExplorer
        overlap={PREPARED_TOURIST_VS_PETR.overlap}
        p1Handle="tourist"
        p2Handle="Petr"
      />
    );

    // Section header and DNA
    expect(html).toContain("same problems?");
    expect(html).toContain("63");
    expect(html).toContain("shared DNA");

    // DNA Segmented bar (2 only tourist, 5 shared, 1 only Petr)
    expect(html).toContain("dna-bar");
    expect(html).toContain("5 shared");

    // Tabs
    expect(html).toContain('role="tablist"');
    expect(html).toContain("both");
    expect(html).toContain("only tourist");
    expect(html).toContain("only Petr");
  });

  it("truthfully handles partial overlap data without fake 0% DNA or blank exclusive tables", () => {
    const partialOverlap: OverlapResult = {
      common: PREPARED_TOURIST_VS_PETR.overlap.common,
      player1Exclusive: [],
      player2Exclusive: [],
      dnaPercentage: null,
      isDefinitive: false,
      totalUnionCount: 5,
      commonCount: 5,
    };

    const html = renderToStaticMarkup(
      <ProblemExplorer
        overlap={partialOverlap}
        p1Handle="tourist"
        p2Handle="Petr"
      />
    );

    // DNA percentage is unavailable, not fake 0%
    expect(html).not.toContain("0% shared DNA");
    expect(html).toContain("DNA unavailable");

    // The unified DNA bar remains visible as the tab switcher
    expect(html).toContain("dna-bar");
    expect(html).toContain("5 SHARED");

    // Exclusive counts indicate unavailable
    expect(html).toContain("UNAVAILABLE");
  });

  it("renders plain text instead of unsafe or missing statement links", () => {
    const overlapWithUnsafeLink: OverlapResult = {
      common: [
        {
          id: "CF:9999Z",
          name: "Unsafe Problem Link",
          contestId: 9999,
          index: "Z",
          rating: 2400,
          tags: ["graphs"],
          url: "javascript:evil()", // unsafe
          platform: "codeforces",
          acceptedAt: 1600000000,
        },
      ],
      player1Exclusive: [],
      player2Exclusive: [],
      dnaPercentage: 100,
      isDefinitive: true,
      totalUnionCount: 1,
      commonCount: 1,
    };

    const html = renderToStaticMarkup(
      <ProblemExplorer
        overlap={overlapWithUnsafeLink}
        p1Handle="tourist"
        p2Handle="Petr"
      />
    );

    expect(html).toContain("Unsafe Problem Link");
    expect(html).not.toContain('href="javascript:evil()"');
  });

  it("renders unrated when a problem has no rating", () => {
    const overlapUnrated: OverlapResult = {
      common: [
        {
          id: "CF:100A",
          name: "Unrated Problem",
          contestId: 100,
          index: "A",
          rating: undefined,
          tags: [],
          url: "https://codeforces.com/contest/100/problem/A",
          platform: "codeforces",
          acceptedAt: 1600000000,
        },
      ],
      player1Exclusive: [],
      player2Exclusive: [],
      dnaPercentage: 100,
      isDefinitive: true,
      totalUnionCount: 1,
      commonCount: 1,
    };

    const html = renderToStaticMarkup(
      <ProblemExplorer
        overlap={overlapUnrated}
        p1Handle="tourist"
        p2Handle="Petr"
      />
    );

    expect(html).toContain("Unrated Problem");
    expect(html).toContain("unrated");
  });

  it("renders 'LAST 20 SOLVES ANALYZED' badge and attribution notice when platform is leetcode", () => {
    const leetcodeOverlap: OverlapResult = {
      common: [
        { id: "LC:two-sum", name: "Two Sum", platform: "leetcode", index: "two-sum", tags: ["array"], url: "https://leetcode.com/problems/two-sum/", acceptedAt: 1700000000 },
      ],
      player1Exclusive: [
        { id: "LC:lru-cache", name: "LRU Cache", platform: "leetcode", index: "lru-cache", tags: ["design"], url: "https://leetcode.com/problems/lru-cache/", acceptedAt: 1700000100 },
      ],
      player2Exclusive: [
        { id: "LC:median", name: "Median", platform: "leetcode", index: "median", tags: ["binary-search"], url: "https://leetcode.com/problems/median/", acceptedAt: 1700000200 },
      ],
      dnaPercentage: 33,
      isDefinitive: false,
      totalUnionCount: 3,
      commonCount: 1,
    };

    const html = renderToStaticMarkup(
      <ProblemExplorer
        overlap={leetcodeOverlap}
        p1Handle="neetcode"
        p2Handle="larryny"
        platform="leetcode"
      />
    );

    expect(html).toContain("LAST 20 SOLVES ANALYZED");
    expect(html).toContain("LeetCode public API returns up to 20 recent accepted solves");
    expect(html).toContain("dna-bar");
    expect(html).toContain("id=\"tab-p1\"");
    expect(html).toContain("id=\"tab-common\"");
    expect(html).toContain("id=\"tab-p2\"");
  });

  it("conditionally shows filter bar only when problems count > 5", () => {
    // 5 problems: filters should NOT be rendered
    const fiveOverlap: OverlapResult = {
      common: Array.from({ length: 5 }, (_, i) => ({
        id: `CF:${i + 1}A`,
        name: `Problem ${i + 1}`,
        platform: "codeforces",
        index: "A",
        tags: ["math"],
        url: `https://codeforces.com/contest/1/problem/${i + 1}A`,
        acceptedAt: 1600000000 + i * 100,
      })),
      player1Exclusive: [],
      player2Exclusive: [],
      dnaPercentage: 100,
      isDefinitive: true,
      totalUnionCount: 5,
      commonCount: 5,
    };

    const htmlFive = renderToStaticMarkup(
      <ProblemExplorer overlap={fiveOverlap} p1Handle="p1" p2Handle="p2" />
    );
    expect(htmlFive).not.toContain("find a problem by name");

    // 6 problems: filters SHOULD be rendered
    const sixOverlap: OverlapResult = {
      ...fiveOverlap,
      common: [
        ...fiveOverlap.common,
        {
          id: "CF:6A",
          name: "Problem 6",
          platform: "codeforces",
          index: "A",
          tags: ["math"],
          url: "https://codeforces.com/contest/1/problem/6A",
          acceptedAt: 1600000600,
        },
      ],
      totalUnionCount: 6,
      commonCount: 6,
    };

    const htmlSix = renderToStaticMarkup(
      <ProblemExplorer overlap={sixOverlap} p1Handle="p1" p2Handle="p2" />
    );
    expect(htmlSix).toContain("find a problem by name");
  });
});
