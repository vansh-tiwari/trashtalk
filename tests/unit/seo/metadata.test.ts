import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-hanken" }),
}));

import { metadata as rootMetadata } from "@/app/layout";
import { metadata as battleMetadata } from "@/app/battle/layout";
import { metadata as roastMetadata } from "@/app/roast/layout";
import { metadata as evolutionMetadata } from "@/app/evolution/page";

describe("SEO Metadata Configurations (Items 3 & 4)", () => {
  it("defines title template and descriptive default in root layout", () => {
    expect(rootMetadata.title).toBeDefined();
    if (typeof rootMetadata.title === "object" && rootMetadata.title !== null) {
      expect("default" in rootMetadata.title).toBe(true);
      expect("template" in rootMetadata.title).toBe(true);
      expect((rootMetadata.title as { template: string }).template).toContain("%s");
    }
    expect(rootMetadata.description).toBeDefined();
    expect(rootMetadata.description?.length).toBeGreaterThan(30);
  });

  it("exports specific metadata for /battle layout", () => {
    expect(battleMetadata).toBeDefined();
    expect(battleMetadata.title).toBeDefined();
    expect(battleMetadata.description).toBeDefined();
    const titleStr = typeof battleMetadata.title === "string" ? battleMetadata.title : "";
    expect(titleStr.toLowerCase()).toMatch(/battle|matchup|arena/);
  });

  it("exports specific metadata for /roast layout", () => {
    expect(roastMetadata).toBeDefined();
    expect(roastMetadata.title).toBeDefined();
    expect(roastMetadata.description).toBeDefined();
    const titleStr = typeof roastMetadata.title === "string" ? roastMetadata.title : "";
    expect(titleStr.toLowerCase()).toMatch(/roast|solo/);
  });

  it("exports specific metadata for /evolution page", () => {
    expect(evolutionMetadata).toBeDefined();
    expect(evolutionMetadata.title).toBeDefined();
    expect(evolutionMetadata.description).toBeDefined();
    const titleStr = typeof evolutionMetadata.title === "string" ? evolutionMetadata.title : "";
    expect(titleStr.toLowerCase()).toMatch(/evolution|lore|2020/);
  });
});
