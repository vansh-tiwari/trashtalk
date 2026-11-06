import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PlatformAvailability from "@/components/platforms/PlatformAvailability";

describe("PlatformAvailability", () => {
  it("renders non-live platform states without form or submit button", () => {
    const html = renderToStaticMarkup(
      <PlatformAvailability platform="github" onChooseCodeforces={vi.fn()} />
    );

    expect(html).toContain("GitHub is coming later.");
    expect(html).toContain("coming later");
    expect(html).toContain("try Codeforces");
    expect(html).toContain("repositories");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("settle it");
  });

  it("renders GitHub coming later state honestly", () => {
    const ghHtml = renderToStaticMarkup(
      <PlatformAvailability platform="github" onChooseCodeforces={vi.fn()} />
    );
    expect(ghHtml).toContain("GitHub is coming later.");
    expect(ghHtml).toContain("coming later");
    expect(ghHtml).toContain("repositories");
  });
});
