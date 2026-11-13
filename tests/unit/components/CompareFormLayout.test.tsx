import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "node-html-parser";
import CompareForm from "@/components/compare/CompareForm";
import * as registry from "@/lib/platforms/registry";

describe("CompareForm Layout", () => {
  it("hides One click (.try) usernames by default and isolates .form-strip-container when showQuickTry is enabled", () => {
    const defaultHtml = renderToStaticMarkup(<CompareForm platform="codeforces" />);
    const defaultRoot = parse(defaultHtml);
    expect(defaultRoot.querySelector(".try")).toBeNull();

    const html = renderToStaticMarkup(<CompareForm platform="codeforces" showQuickTry={true} />);
    const root = parse(html);

    const form = root.querySelector("form");
    expect(form).not.toBeNull();
    // Form should not be the strip container itself
    expect(form?.classList.contains("form-strip-container")).toBe(false);

    const stripContainer = form?.querySelector(".form-strip-container");
    expect(stripContainer).not.toBeNull();

    // Inside stripContainer: platform-chips and bar
    expect(stripContainer?.querySelector(".platform-chips")).not.toBeNull();
    expect(stripContainer?.querySelector(".bar")).not.toBeNull();

    // .try should NOT be inside .form-strip-container
    expect(stripContainer?.querySelector(".try")).toBeNull();

    // .try should be directly under form or outside the stripContainer when showQuickTry is true
    const tryElem = form?.querySelector(".try");
    expect(tryElem).not.toBeNull();
  });

  it("isolates .form-strip-container for non-live platform previews", () => {
    vi.spyOn(registry, "isBattleEnabled").mockReturnValueOnce(false);
    const html = renderToStaticMarkup(<CompareForm platform="github" />);
    const root = parse(html);

    const form = root.querySelector("form");
    const stripContainer = form?.querySelector(".form-strip-container");
    expect(stripContainer).not.toBeNull();

    // Inside stripContainer: platform-chips and platform-preview-panel
    expect(stripContainer?.querySelector(".platform-chips")).not.toBeNull();
    expect(stripContainer?.querySelector(".platform-preview-panel")).not.toBeNull();

    // .try should NOT be inside .form-strip-container
    expect(stripContainer?.querySelector(".try")).toBeNull();
  });

  it("renders accessible inputs, the VS divider, and Fight button within .bar", () => {
    const html = renderToStaticMarkup(<CompareForm platform="codeforces" />);
    const root = parse(html);

    const bar = root.querySelector(".bar");
    expect(bar).not.toBeNull();

    const u1Input = bar?.querySelector('input[id="you"]');
    const u2Input = bar?.querySelector('input[id="rival"]');
    const vs = bar?.querySelector(".vsm");
    const fightBtn = bar?.querySelector('button[type="submit"]');

    expect(u1Input).not.toBeNull();
    expect(u2Input).not.toBeNull();
    expect(vs?.text.trim()).toBe("vs");
    expect(fightBtn?.text).toContain("Fight");
  });
});
