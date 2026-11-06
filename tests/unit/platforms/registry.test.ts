import { describe, it, expect } from "vitest";
import {
  PLATFORM_ORDER,
  PLATFORM_REGISTRY,
  getPlatformConfig,
  parsePlatform,
  isBattleEnabled,
} from "@/lib/platforms/registry";

describe("Platform Registry & Availability", () => {
  it("maintains the required platform order with correct labels and statuses", () => {
    expect(PLATFORM_ORDER).toEqual(["codeforces", "leetcode", "github", "codechef"]);

    expect(PLATFORM_REGISTRY.codeforces.label).toBe("Codeforces");
    expect(PLATFORM_REGISTRY.codeforces.status).toBe("live");
    expect(PLATFORM_REGISTRY.codeforces.availabilityLabel).toBe("live");

    expect(PLATFORM_REGISTRY.leetcode.label).toBe("LeetCode");
    expect(PLATFORM_REGISTRY.leetcode.status).toBe("live");
    expect(PLATFORM_REGISTRY.leetcode.availabilityLabel).toBe("live");

    expect(PLATFORM_REGISTRY.github.label).toBe("GitHub");
    expect(PLATFORM_REGISTRY.github.status).toBe("live");
    expect(PLATFORM_REGISTRY.github.availabilityLabel).toBe("live");

    expect(PLATFORM_REGISTRY.codechef.label).toBe("CodeChef");
    expect(PLATFORM_REGISTRY.codechef.status).toBe("live");
    expect(PLATFORM_REGISTRY.codechef.availabilityLabel).toBe("live");
  });

  it("designates Codeforces, LeetCode, CodeChef, and GitHub as live for battle creation", () => {
    expect(isBattleEnabled("codeforces")).toBe(true);
    expect(isBattleEnabled("leetcode")).toBe(true);
    expect(isBattleEnabled("github")).toBe(true);
    expect(isBattleEnabled("codechef")).toBe(true);
  });

  it("contains spec palette, emphasis, and layout metadata for all entries", () => {
    for (const id of PLATFORM_ORDER) {
      const config = getPlatformConfig(id);
      expect(config.id).toBe(id);
      expect(config.theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.theme.accentHover).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.theme.player1Surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.theme.player1Ink).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.theme.player2Surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.theme.player2Ink).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.emphasis.length).toBeGreaterThan(0);
      expect(["contest", "solving", "repositories"]).toContain(config.layout);
    }

    // Codeforces specific theme check
    const cf = getPlatformConfig("codeforces");
    expect(cf.theme.accent).toBe("#304BFF");
    expect(cf.theme.accentHover).toBe("#243ACB");
    expect(cf.theme.accentInk).toBe("#FFFFFF");
    expect(cf.theme.player1Surface).toBe("#304BFF");
    expect(cf.theme.player1Ink).toBe("#FFFFFF");
    expect(cf.theme.player1Chart).toBe("#304BFF");
    expect(cf.theme.player2Surface).toBe("#FF5A2A");
    expect(cf.theme.player2Ink).toBe("#111214");
    expect(cf.theme.player2Chart).toBe("#BE3815");
    expect(cf.layout).toBe("contest");

    // LeetCode specific theme check
    const lc = getPlatformConfig("leetcode");
    expect(lc.theme.accent).toBe("#FFCA3A");
    expect(lc.theme.accentHover).toBe("#E9B323");
    expect(lc.theme.accentInk).toBe("#111214");
    expect(lc.theme.player1Surface).toBe("#FFCA3A");
    expect(lc.theme.player1Ink).toBe("#111214");
    expect(lc.theme.player1Chart).toBe("#946800");
    expect(lc.theme.player2Surface).toBe("#273442");
    expect(lc.theme.player2Ink).toBe("#FFFFFF");
    expect(lc.theme.player2Chart).toBe("#273442");
    expect(lc.layout).toBe("solving");
  });

  it("satisfies WCAG contrast requirements (>= 4.5:1 text, >= 3:1 chart on paper)", () => {
    function getLuminance(hex: string): number {
      const clean = hex.replace("#", "");
      const r = parseInt(clean.slice(0, 2), 16) / 255;
      const g = parseInt(clean.slice(2, 4), 16) / 255;
      const b = parseInt(clean.slice(4, 6), 16) / 255;
      const toLinear = (c: number) =>
        c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }

    function getContrast(hex1: string, hex2: string): number {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    const canvas = "#F4F4F0";

    for (const id of PLATFORM_ORDER) {
      const theme = getPlatformConfig(id).theme;
      // Text contrast >= 4.5:1
      expect(getContrast(theme.player1Ink, theme.player1Surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrast(theme.player2Ink, theme.player2Surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrast(theme.accentInk, theme.accent)).toBeGreaterThanOrEqual(4.5);
      // Essential graphics / chart on canvas >= 3.0:1
      expect(getContrast(theme.player1Chart, canvas)).toBeGreaterThanOrEqual(3.0);
      expect(getContrast(theme.player2Chart, canvas)).toBeGreaterThanOrEqual(3.0);
    }
  });

  it("parses query values and defaults unknown, missing, or array values safely to codeforces", () => {
    expect(parsePlatform("codeforces")).toBe("codeforces");
    expect(parsePlatform("leetcode")).toBe("leetcode");
    expect(parsePlatform("github")).toBe("github");
    expect(parsePlatform("codechef")).toBe("codechef");

    expect(parsePlatform("unknown")).toBe("codeforces");
    expect(parsePlatform("")).toBe("codeforces");
    expect(parsePlatform(null)).toBe("codeforces");
    expect(parsePlatform(undefined)).toBe("codeforces");
    expect(parsePlatform(["leetcode", "github"])).toBe("codeforces");
    expect(parsePlatform({ platform: "leetcode" })).toBe("codeforces");
  });
});
