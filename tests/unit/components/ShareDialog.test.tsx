import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import ShareDialog from "@/components/share/ShareDialog";

describe("ShareDialog Component", () => {
  it("renders accessible modal with title, tabs, preview, and actions when open", () => {
    const html = renderToStaticMarkup(
      <ShareDialog
        snapshot={PREPARED_TOURIST_VS_PETR}
        open={true}
        onClose={() => {}}
      />
    );

    // Accessible title & description
    expect(html).toContain("share this matchup");
    expect(html).toContain("@tourist vs @Petr");
    expect(html).toContain('aria-labelledby="share-dialog-title"');

    // Close button
    expect(html).toContain('aria-label="Close dialog"');

    // Tablist for the three formats
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Landscape (OG)");
    expect(html).toContain("Square (Post)");
    expect(html).toContain("Story (Mobile)");

    // Real /api/og preview image
    expect(html).toContain("/api/og?id=cf-tourist-vs-petr-legendary&amp;format=og");

    // Action buttons
    expect(html).toContain("copy link");
    expect(html).toContain("share to X");
    expect(html).toContain("download PNG");

    // X intent link safety
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("twitter.com/intent/tweet");

    // No AI/model advertising
    expect(html).not.toContain("Gemini");
    expect(html).not.toContain("AI Judge");
    expect(html).not.toContain("AI Roast");
  });

  it("does not render dialog modal when closed", () => {
    const html = renderToStaticMarkup(
      <ShareDialog
        snapshot={PREPARED_TOURIST_VS_PETR}
        open={false}
        onClose={() => {}}
      />
    );

    expect(html).not.toContain("share this matchup");
    expect(html).not.toContain("/api/og?id=cf-tourist-vs-petr-legendary");
  });
});
