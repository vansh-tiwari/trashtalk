import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LandingExperience from "@/components/landing/LandingExperience";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";

describe("Above-the-Fold Primary CTA & Clean Hero", () => {
  it("renders an explicit above-the-fold Fight call to action without One click username clutter", () => {
    const html = renderToStaticMarkup(<LandingExperience demo={PREPARED_TOURIST_VS_PETR} />);
    expect(html).toContain("Fight");
    expect(html).not.toContain("One click");
    expect(html).toContain("tourist vs Petr");
  });
});
