import { test, expect } from "@playwright/test";

test.describe("Landing Page & Platform Neutrality", () => {
  test("displays all four platform selectors with truthful availability labels", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify brand
    await expect(page.getByRole("link", { name: "trashtalk home" })).toBeVisible();

    // Verify platform tabs and availability badges
    const codeforcesBtn = page.getByRole("tab", { name: /Codeforces/i });
    const leetcodeBtn = page.getByRole("tab", { name: /LeetCode/i });
    const githubBtn = page.getByRole("tab", { name: /GitHub/i });
    const codechefBtn = page.getByRole("tab", { name: /CodeChef/i });

    await expect(codeforcesBtn).toBeVisible();
    await expect(leetcodeBtn).toBeVisible();
    await expect(githubBtn).toBeVisible();
    await expect(codechefBtn).toBeVisible();

    // Check status labels
    await expect(codeforcesBtn).toContainText("live");
    await expect(leetcodeBtn).toContainText("up next");
    await expect(githubBtn).toContainText("coming later");
    await expect(codechefBtn).toContainText("coming later");
  });

  test("shows honest preview states for upcoming platforms and zero battle API calls on switch", async ({
    page,
  }) => {
    let battlePostCount = 0;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes("/api/battles")) {
        battlePostCount++;
      }
    });

    await page.goto("/");

    // Initial state: Codeforces form is mounted
    await expect(page.getByRole("button", { name: /settle it/i })).toBeVisible();

    // Switch to LeetCode
    await page.getByRole("tab", { name: /LeetCode/i }).click();
    await expect(page.locator("text=LeetCode is up next.")).toBeVisible();
    await expect(page.getByRole("button", { name: /try Codeforces/i }).first()).toBeVisible();
    // Battle form is not mounted in LeetCode preview
    await expect(page.getByRole("button", { name: /settle it/i })).toHaveCount(0);

    // Switch to GitHub
    await page.getByRole("tab", { name: /GitHub/i }).click();
    await expect(page.locator("text=GitHub is coming later.")).toBeVisible();

    // Switch to CodeChef
    await page.getByRole("tab", { name: /CodeChef/i }).click();
    await expect(page.locator("text=CodeChef is coming later.")).toBeVisible();

    // Clicking 'try Codeforces' restores Codeforces form
    await page.getByRole("button", { name: /try Codeforces/i }).first().click();
    await expect(page.getByRole("button", { name: /settle it/i })).toBeVisible();

    // Verify ZERO battle POST calls occurred during platform browsing
    expect(battlePostCount).toBe(0);
  });

  test("renders without horizontal overflow across desktop, tablet, and mobile viewports", async ({
    page,
  }) => {
    const viewports = [
      { width: 1440, height: 900, name: "desktop" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 390, height: 844, name: "mobile" },
      { width: 320, height: 568, name: "small-mobile" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);

      // Save screenshot for desktop and mobile review evidence
      if (vp.name === "desktop" || vp.name === "mobile") {
        await page.screenshot({
          path: `docs/review-evidence/2026-10-26-cool-social/${vp.name}-landing.png`,
          fullPage: true,
        });
      }
    }
  });

  test("at 390x844 mobile viewport, platform selector and first handle input are visible above the fold", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const selector = page.getByRole("tablist", { name: "Supported and upcoming platforms" });
    const youInput = page.locator("#you");

    await expect(selector).toBeVisible();
    await expect(youInput).toBeVisible();

    const selectorBox = await selector.boundingBox();
    const handleBox = await youInput.boundingBox();

    expect(selectorBox).not.toBeNull();
    expect(handleBox).not.toBeNull();

    if (selectorBox && handleBox) {
      // Both must be visible within 844px without scrolling
      expect(selectorBox.y + selectorBox.height).toBeLessThan(844);
      expect(handleBox.y + handleBox.height).toBeLessThan(844);
    }
  });
});
