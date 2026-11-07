import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/privacy/page";
import Footer from "@/components/Footer";

describe("Transparent Brutalist Privacy Policy Page (Item 11)", () => {
  it("exports specific SEO metadata for /privacy", () => {
    expect(privacyMetadata).toBeDefined();
    expect(privacyMetadata.title).toContain("Privacy");
    expect(privacyMetadata.description).toBeDefined();
  });

  it("renders key privacy commitments and transparency principles", () => {
    const html = renderToStaticMarkup(<PrivacyPage />);
    expect(html).toContain("The Receipts on Privacy");
    expect(html).toContain("100% Public APIs Only");
    expect(html).toContain("Zero Tracking Cookies");
    expect(html).toContain("Immutable Snapshots");
    expect(html).toContain("Right to Unlist");
  });

  it("links to the privacy policy page from Footer", () => {
    const footerHtml = renderToStaticMarkup(<Footer />);
    expect(footerHtml).toContain('href="/privacy"');
    expect(footerHtml).toContain("Privacy");
  });
});
