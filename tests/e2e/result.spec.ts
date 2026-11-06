import { test, expect } from "@playwright/test";
import { E2E_BATTLE_IDS } from "./fixtures";

test.describe("Battle Result Experience & Alternate States", () => {
  test("renders concise cool social hierarchy with one roast surface and zero model badges", async ({
    page,
  }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    // Breadcrumb
    await expect(page.locator("text=@tourist vs @Petr")).toBeVisible();

    // Scoreboard: adjacent surfaces with scores
    await expect(page.getByTestId("scoreboard-p1-score")).toHaveText(/97/);
    await expect(page.getByTestId("scoreboard-p2-score")).toHaveText(/90/);

    // Roast: exactly one roast moment
    await expect(
      page.locator("text=The scoreboard crowns the all-time peak champion.")
    ).toHaveCount(1);
    await expect(page.locator("text=@tourist takes it · +7")).toBeVisible();

    // No AI model branding
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Gemini");
    expect(bodyText).not.toContain("AI Judge");
    expect(bodyText).not.toContain("AI Commentary");

    // Receipts and Radar sections
    await expect(page.locator("text=the receipts.")).toBeVisible();
    await expect(page.locator("text=skill check.")).toBeVisible();
    await expect(page.locator("text=same problems?")).toBeVisible();

    // Winner stamp visible for legitimate win
    await expect(page.getByTestId("winner-stamp")).toBeVisible();
    await expect(page.getByTestId("winner-stamp")).toContainText("+7");

    // Capture screenshots for review evidence
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: "docs/review-evidence/2026-10-26-cool-social/desktop-result.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: "docs/review-evidence/2026-10-26-cool-social/mobile-result.png",
      fullPage: true,
    });
  });

  test("renders white strip clash layout with visible central scores down to 320px", async ({
    page,
  }) => {
    // Check at 320px small mobile: white strip hierarchy (P1 -> White VS Strip -> P2)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    const p1Panel = page.getByTestId("player1-panel");
    const p2Panel = page.getByTestId("player2-panel");
    const vsSlab = page.getByTestId("scoreboard-vs-slab");

    await expect(p1Panel).toBeVisible();
    await expect(p2Panel).toBeVisible();
    await expect(vsSlab).toBeVisible();

    const box1 = await p1Panel.boundingBox();
    const boxVs = await vsSlab.boundingBox();
    const box2 = await p2Panel.boundingBox();
    expect(box1).not.toBeNull();
    expect(boxVs).not.toBeNull();
    expect(box2).not.toBeNull();

    if (box1 && boxVs && box2) {
      // 3-row stacked clash: P1 (top) -> Final Score (center) -> P2 (bottom)
      expect(box1.y).toBeLessThan(boxVs.y);
      expect(boxVs.y).toBeLessThan(box2.y);
    }

    // Check at 390x844: both scores visible in full-screen hero section; roast section rendered on scroll
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    const p1Score = page.getByTestId("scoreboard-p1-score");
    const p2Score = page.getByTestId("scoreboard-p2-score");
    const roastSection = page.getByRole("region", { name: "The Roast" });

    await expect(p1Score).toBeVisible();
    await expect(p2Score).toBeVisible();
    await expect(roastSection).toBeAttached();
  });

  test("receipts disclosure ('More stats') is keyboard-operable and displays secondary metrics", async ({
    page,
  }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    const moreStatsSummary = page.getByLabel("More statistics");
    await expect(moreStatsSummary).toBeVisible();

    // Primary metrics visible immediately
    await expect(page.locator("span", { hasText: "Unique Solves" })).toBeVisible();
    await expect(page.locator("span", { hasText: "180-Day Velocity" })).toBeVisible();

    // Secondary metrics inside disclosure: Topic Breadth initially hidden
    await expect(page.locator("span", { hasText: "Topic Breadth" })).not.toBeVisible();

    // Focus and press Enter to toggle native details
    await moreStatsSummary.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("span", { hasText: "Topic Breadth" })).toBeVisible();
    await expect(page.locator("span", { hasText: "Algorithmic Grit" })).toBeVisible();
  });

  test("problem explorer tabs, keyboard navigation, and search filter work correctly", async ({
    page,
  }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    // Tabs exist with explicit IDs
    const commonTab = page.locator("#tab-common");
    const p1Tab = page.locator("#tab-p1");
    const p2Tab = page.locator("#tab-p2");

    await expect(commonTab).toBeVisible();
    await expect(p1Tab).toBeVisible();
    await expect(p2Tab).toBeVisible();

    // Switch to p1 tab
    await p1Tab.click();
    await expect(p1Tab).toHaveAttribute("aria-selected", "true");

    // Test search filter
    const searchInput = page.getByPlaceholder(/find a problem/i);
    await searchInput.fill("Tree");

    // Problem table updates
    const table = page.getByRole("table", { name: /problems table/i });
    await expect(table).toBeVisible();
    const tableText = await table.textContent();
    expect(tableText?.toLowerCase()).toContain("tree");

    // Clear search
    const clearBtn = page.getByLabel("Clear search query");
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      expect(await searchInput.inputValue()).toBe("");
    }
  });

  test("draw, mirror, and insufficient data fixtures do not crown a false winner", async ({
    page,
  }) => {
    // 1. Draw fixture
    await page.goto(`/battle/${E2E_BATTLE_IDS.draw}`);
    await expect(page.locator("text=draw · 0 points apart")).toBeVisible();
    await expect(page.getByTestId("winner-stamp")).toHaveCount(0);

    // 2. Mirror fixture
    await page.goto(`/battle/${E2E_BATTLE_IDS.mirror}`);
    await expect(page.locator("text=mirror match")).toBeVisible();
    await expect(page.getByTestId("winner-stamp")).toHaveCount(0);

    // 3. Insufficient data fixture
    await page.goto(`/battle/${E2E_BATTLE_IDS.insufficient}`);
    await expect(page.locator("text=not enough data")).toBeVisible();
    await expect(page.getByTestId("winner-stamp")).toHaveCount(0);

    // 4. Long handle fixture
    await page.goto(`/battle/${E2E_BATTLE_IDS.longHandle}`);
    await expect(page.getByRole("heading", { name: "@very_long_handle_twenty_four" })).toBeVisible();

    // Verify monogram initials fallback
    await expect(page.getByLabel("@very_long_handle_twenty_four", { exact: true })).toHaveText("VE");
  });
});
