import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RoastLanguageToggle from "@/components/battle/RoastLanguageToggle";

describe("RoastLanguageToggle Component", () => {
  it("renders regional label and ENGLISH button with correct pressed states", () => {
    const html = renderToStaticMarkup(
      <RoastLanguageToggle
        languageMode="regional"
        onToggle={() => {}}
        regionalLabel="ESPAÑOL"
      />
    );

    expect(html).toContain("ESPAÑOL");
    expect(html).toContain("ENGLISH");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("renders correctly when english is active", () => {
    const html = renderToStaticMarkup(
      <RoastLanguageToggle
        languageMode="english"
        onToggle={() => {}}
        regionalLabel="TELUGLISH"
      />
    );

    expect(html).toContain("TELUGLISH");
    expect(html).toContain("ENGLISH");
  });
});
