import { test, expect } from "@playwright/test";
import { E2E_BATTLE_IDS } from "./fixtures";
import path from "node:path";

const EVIDENCE_DIR = path.resolve(process.cwd(), "docs/review-evidence/2026-10-26-fight-night");

test.describe("Motion Choreography & Production Quality", () => {
  test("animates score counter to truthful final values on battle result", async ({ page }) => {
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    // Wait for the scoreboard score digits container
    const scoreDigits = page.locator('[data-testid="scoreboard-score-digits"]');
    await expect(scoreDigits.first()).toBeVisible();

    // Eventually both digits must settle to their exact canonical scores: 97 and 90
    await expect(scoreDigits.first()).toHaveText("97", { timeout: 4000 });
    await expect(scoreDigits.nth(1)).toHaveText("90", { timeout: 4000 });

    // Winner stamp and central VS slab are present
    const winnerStamp = page.getByText("+7 ↗");
    await expect(winnerStamp).toBeVisible();

    const vsSlab = page.getByText("VS", { exact: true });
    await expect(vsSlab).toBeVisible();
  });

  test("honors reduced motion preference with immediate final values", async ({ page }, testInfo) => {
    // Only run this test in reduced-motion or check if reduced motion is enabled
    if (testInfo.project.use.contextOptions?.reducedMotion === "reduce") {
      await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

      const scoreDigits = page.locator('[data-testid="scoreboard-score-digits"]');
      // In reduced motion, scores are immediate on mount
      await expect(scoreDigits.first()).toHaveText("97");
      await expect(scoreDigits.nth(1)).toHaveText("90");

      // Winner stamp is immediately visible
      await expect(page.getByText("+7 ↗")).toBeVisible();

      // Pause toggle shows disabled state with reduced motion title
      const pauseToggle = page.getByRole("button", { name: /motion/i });
      await expect(pauseToggle).toBeDisabled();

      // Capture reduced motion evidence screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, "reduced-motion-result.png"),
        fullPage: true,
      });
    } else {
      test.skip();
    }
  });

  test("toggles motion pause and preserves state across sessions", async ({ page }, testInfo) => {
    if (testInfo.project.use.contextOptions?.reducedMotion === "reduce") {
      test.skip();
      return;
    }

    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    const pauseBtn = page.getByRole("button", { name: "Pause motion" });
    await expect(pauseBtn).toBeVisible();
    await expect(pauseBtn).toHaveAttribute("aria-pressed", "false");

    // Click pause
    await pauseBtn.click();
    await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Resume motion" })).toHaveAttribute("aria-pressed", "true");

    // Check sessionStorage
    const stored = await page.evaluate(() => sessionStorage.getItem("trashtalk:motion-paused"));
    expect(stored).toBe("true");

    // Capture paused state evidence
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "paused-state.png"),
    });

    // Click resume
    const resumeBtn = page.getByRole("button", { name: "Resume motion" });
    await resumeBtn.click();
    await expect(page.getByRole("button", { name: "Pause motion" })).toBeVisible();

    const storedAfter = await page.evaluate(() => sessionStorage.getItem("trashtalk:motion-paused"));
    expect(storedAfter).toBe("false");
  });

  test("problem filters do not replay score counter animation", async ({ page }, testInfo) => {
    if (testInfo.project.use.contextOptions?.reducedMotion === "reduce") {
      test.skip();
      return;
    }

    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);

    const scoreDigits = page.locator('[data-testid="scoreboard-score-digits"]');
    await expect(scoreDigits.first()).toHaveText("97", { timeout: 3000 });

    // Filter problems by searching
    const searchInput = page.getByLabel(/filter problems/i);
    await searchInput.fill("Tree");

    // Verify scores stayed at final values without resetting to lower start value
    expect(await scoreDigits.first().innerText()).toBe("97");
    expect(await scoreDigits.nth(1).innerText()).toBe("90");
  });

  test("captures settled breakpoints screenshots and progression frames", async ({ page }, testInfo) => {
    // Only capture breakpoints in desktop project
    if (testInfo.project.name !== "desktop-1440") {
      return;
    }

    // 1. Landing 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "desktop-landing-1440.png"),
      fullPage: true,
    });

    // 2. Landing 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "tablet-landing-768.png"),
      fullPage: true,
    });

    // 3. Landing 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "phone-landing-390.png"),
      fullPage: true,
    });

    // 4. Landing 320x640
    await page.setViewportSize({ width: 320, height: 640 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "phone-landing-320.png"),
      fullPage: true,
    });

    // 5. Result 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "desktop-result-1440.png"),
      fullPage: true,
    });

    // 6. Result 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "tablet-result-768.png"),
      fullPage: true,
    });

    // 7. Result 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "phone-result-390.png"),
      fullPage: true,
    });

    // 8. Result 320x640
    await page.setViewportSize({ width: 320, height: 640 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "phone-result-320.png"),
      fullPage: true,
    });

    // 9. Intro Progression frames on Result page
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/battle/${E2E_BATTLE_IDS.demo}`);
    // +350ms frame
    await page.waitForTimeout(350);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "intro-frame-350ms.png"),
    });

    // +900ms frame
    await page.waitForTimeout(550);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "intro-frame-900ms.png"),
    });

    // +1800ms settled frame
    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, "intro-frame-settled.png"),
    });
  });
});
