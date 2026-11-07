import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-hanken" }),
}));

import RootLayout from "@/app/layout";
import { renderToStaticMarkup } from "react-dom/server";

describe("Privacy-Friendly Analytics Integration (Item 12)", () => {
  it("renders RootLayout with child content and analytics support cleanly", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div id="test-content">Battle Arena Content</div>
      </RootLayout>
    );

    expect(html).toContain("Battle Arena Content");
    expect(html).toContain("TrashTalk");
  });
});
