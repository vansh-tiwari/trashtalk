import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getPlatformCssVariables } from "@/lib/platforms/theme";
import { PlatformTheme } from "@/components/platforms/PlatformTheme";
import { PLATFORM_ORDER } from "@/lib/platforms/registry";

describe("Platform Theme & CSS Variables", () => {
  it("generates pure, serializable CSS variables for each registered platform", () => {
    for (const platform of PLATFORM_ORDER) {
      const vars = getPlatformCssVariables(platform);
      expect(typeof vars).toBe("object");
      expect(vars["--platform-accent"]).toBeDefined();
      expect(vars["--platform-accent-hover"]).toBeDefined();
      expect(vars["--platform-player1-surface"]).toBeDefined();
      expect(vars["--platform-player1-ink"]).toBeDefined();
      expect(vars["--platform-player2-surface"]).toBeDefined();
      expect(vars["--platform-player2-ink"]).toBeDefined();
      expect(vars["--player-one"]).toBeDefined();
      expect(vars["--player-two"]).toBeDefined();
      // Ensure values are hex or valid color strings, not undefined
      for (const [key, val] of Object.entries(vars)) {
        expect(key.startsWith("--")).toBe(true);
        expect(typeof val).toBe("string");
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns Codeforces brand and player surface colors correctly", () => {
    const cfVars = getPlatformCssVariables("codeforces");
    expect(cfVars["--platform-accent"]).toBe("#304BFF");
    expect(cfVars["--platform-player1-surface"]).toBe("#304BFF");
    expect(cfVars["--platform-player2-surface"]).toBe("#FF5A2A");
  });

  it("PlatformTheme component renders children and applies style variables", () => {
    const html = renderToStaticMarkup(
      <PlatformTheme platform="codeforces" className="test-theme-wrapper">
        <span>Child content</span>
      </PlatformTheme>
    );
    expect(html).toContain("Child content");
    expect(html).toContain("test-theme-wrapper");
    expect(html).toContain("--platform-accent:#304BFF");
    expect(html).toContain("data-platform=\"codeforces\"");
  });
});
