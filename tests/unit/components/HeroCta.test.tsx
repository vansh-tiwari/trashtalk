import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LandingExperience from "@/components/landing/LandingExperience";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";

describe("Above-the-Fold Primary CTA & Quick Rivalries (Item 2)", () => {
  it("renders an explicit above-the-fold call to action button or anchor", () => {
    const html = renderToStaticMarkup(<LandingExperience demo={PREPARED_TOURIST_VS_PETR} />);
    expect(html).toContain("Fight");
    // Verify above-the-fold quick rivalry CTA pills exist
    expect(html).toContain("Quick Showdowns");
    expect(html).toContain("tourist vs Petr");
    expect(html).toContain("Torvalds vs Antirez");
  });
});
