import { test, expect } from "@playwright/test";
import { E2E_BATTLE_IDS } from "./fixtures";

test.describe("Share Dialog & Reaction Mechanics", () => {
  test("opens the same share dialog from both launchers and restores focus on close", async ({
    page,
  }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    // Launcher 1: Top header
    const topShareBtn = page.getByRole("button", { name: "share this" }).first();
    await topShareBtn.click();

    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("share this matchup")).toBeVisible();

    // Close via visible close button
    const closeBtn = dialog.getByRole("button", { name: "Close dialog" });
    await closeBtn.click();
    await expect(dialog).toHaveCount(0);

    // Launcher 2: Bottom send strip
    const bottomShareBtn = page.getByRole("button", { name: "send it ↗" });
    await bottomShareBtn.click();
    await expect(dialog).toBeVisible();

    // Close via Escape key
    await dialog.focus();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("format tabs switch card preview URL and download link", async ({ page }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    await page.getByRole("button", { name: "share this" }).first().click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();

    // Initial format is Landscape (OG)
    const img = dialog.locator("img");
    await expect(img).toHaveAttribute("src", new RegExp("format=og"));

    // Switch to Square
    const squareTab = dialog.getByRole("tab", { name: /Square/i });
    await squareTab.click();
    await expect(img).toHaveAttribute("src", new RegExp("format=square"));

    // Switch to Story
    const storyTab = dialog.getByRole("tab", { name: /Story/i });
    await storyTab.click();
    await expect(img).toHaveAttribute("src", new RegExp("format=story"));

    // Check download PNG link format matches
    const downloadLink = dialog.getByRole("link", { name: /download PNG/i });
    await expect(downloadLink).toHaveAttribute("href", new RegExp("format=story&download=true"));
  });

  test("reactions toggle locally with aria-pressed and zero network requests", async ({
    page,
  }) => {
    let networkCallCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/")) {
        networkCallCount++;
      }
    });

    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);
    await page.waitForLoadState("networkidle");
    const baselineCalls = networkCallCount;

    const skullBtn = page.getByRole("button", { name: "Dead laughing" });
    await expect(skullBtn).toHaveAttribute("aria-pressed", "false");

    // Click skull
    await skullBtn.click();
    await expect(skullBtn).toHaveAttribute("aria-pressed", "true");

    // Click again to toggle off
    await skullBtn.click();
    await expect(skullBtn).toHaveAttribute("aria-pressed", "false");

    // Verify ZERO network requests were dispatched by reaction clicks
    expect(networkCallCount).toBe(baselineCalls);
  });
});
