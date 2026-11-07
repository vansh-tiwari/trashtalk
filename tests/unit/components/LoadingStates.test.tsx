import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLoading from "@/app/loading";
import BattleLoading from "@/app/battle/loading";

describe("Brutalist Loading States (Item 10)", () => {
  it("renders an accessible, brutalist status skeleton in root loading", () => {
    const html = renderToStaticMarkup(<RootLoading />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("TALLYING THE RECEIPTS");
    expect(html).toContain("THE ARENA · STANDBY");
  });

  it("renders battle loading state for seamless route transitions", () => {
    const html = renderToStaticMarkup(<BattleLoading />);
    expect(html).toContain('role="status"');
    expect(html).toContain("TALLYING THE RECEIPTS");
  });
});
