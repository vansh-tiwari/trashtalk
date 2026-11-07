import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound from "@/app/not-found";

describe("Brutalist Fight-Night 404 Page (Item 1)", () => {
  it("renders the 404 status badge and monumental headline", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("404 · TKO");
    expect(html).toContain("KNOCKED OUT OF THE RING");
  });

  it("provides primary navigation CTA back to the arena", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain('href="/"');
    expect(html).toContain("back to the arena");
  });

  it("offers quick demo battle links", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("tourist vs Petr");
    expect(html).toContain("cf-tourist-vs-petr-legendary");
    expect(html).toContain("Torvalds vs Antirez");
  });
});
