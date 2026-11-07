import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import UserAvatar from "@/components/ui/UserAvatar";

describe("Image Alt Text & Accessibility Audit (Item 9)", () => {
  it("renders descriptive alt text for avatar images", () => {
    const html = renderToStaticMarkup(
      <UserAvatar
        handle="tourist"
        avatarUrl="https://userpic.codeforces.org/422/title/123.jpg"
      />
    );
    expect(html).toContain('<img');
    expect(html).toContain('alt="@tourist"');
  });

  it("provides accessible aria-label on initials fallback", () => {
    const html = renderToStaticMarkup(
      <UserAvatar handle="petr" />
    );
    expect(html).toContain('aria-label="@petr"');
    expect(html).toContain("P");
  });
});
