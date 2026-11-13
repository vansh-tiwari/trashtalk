import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-hanken" }),
}));

import RootLayout from "@/app/layout";
import ArenaAnalytics from "@/components/analytics/ArenaAnalytics";
import { trackArenaEvent } from "@/lib/analytics/client";
import { renderToStaticMarkup } from "react-dom/server";

describe("Privacy-Friendly Analytics Integration (Item 12)", () => {
  it("renders RootLayout with child content and Vercel analytics support cleanly", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div id="test-content">Battle Arena Content</div>
      </RootLayout>
    );

    expect(html).toContain("Battle Arena Content");
    expect(html).toContain("TrashTalk");
  });

  it("renders Google Analytics 4 script tags when gaId is configured", () => {
    const html = renderToStaticMarkup(<ArenaAnalytics gaId="G-ARENA2026" />);
    expect(html).toContain("https://www.googletagmanager.com/gtag/js?id=G-ARENA2026");
    expect(html).toContain("G-ARENA2026");
  });

  it("no-ops safely on the server when trackArenaEvent is called", () => {
    expect(() =>
      trackArenaEvent("battle_created", { platform: "codeforces", mode: "battle" })
    ).not.toThrow();
  });
});

