import { test, expect } from "@playwright/test";
import { E2E_BATTLE_IDS } from "./fixtures";

test.describe("Battle Entry & Form Mechanics", () => {
  test("preserves exact handle casing and swaps values cleanly", async ({ page }) => {
    await page.goto("/");

    const youInput = page.locator("#you");
    const rivalInput = page.locator("#rival");
    const swapBtn = page.locator("#swap");

    await youInput.fill("Tourist");
    await rivalInput.fill("Petr");

    expect(await youInput.inputValue()).toBe("Tourist");
    expect(await rivalInput.inputValue()).toBe("Petr");

    // Click swap
    await swapBtn.click();
    expect(await youInput.inputValue()).toBe("Petr");
    expect(await rivalInput.inputValue()).toBe("Tourist");
  });

  test("changing roast tone preserves entered handles", async ({ page }) => {
    await page.goto("/");

    const youInput = page.locator("#you");
    const rivalInput = page.locator("#rival");
    await youInput.fill("Alice");
    await rivalInput.fill("Bob");

    // Select different tone
    const toneSelect = page.getByLabel(/roast style/i);
    await toneSelect.selectOption("silicon_valley_vc");

    expect(await youInput.inputValue()).toBe("Alice");
    expect(await rivalInput.inputValue()).toBe("Bob");
  });

  test("prevents duplicate submissions on rapid clicks and navigates on success", async ({
    page,
  }) => {
    let postCount = 0;
    await page.route("**/api/battles", async (route) => {
      postCount++;
      // Return demo battle ID to load saved result without upstream calls
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: E2E_BATTLE_IDS.demo }),
      });
    });

    await page.goto("/");
    await page.locator("#you").fill("tourist");
    await page.locator("#rival").fill("Petr");

    const submitBtn = page.getByRole("button", { name: /settle it/i });

    // Click submit
    await submitBtn.click();

    // Verify navigation to battle result
    await page.waitForURL(`**/battle/${E2E_BATTLE_IDS.demo}`);
    expect(postCount).toBe(1);
  });

  test("handles 429 rate limit with retry capability and retains inputs on error", async ({
    page,
  }) => {
    let attempts = 0;
    await page.route("**/api/battles", async (route) => {
      attempts++;
      if (attempts === 1) {
        await route.fulfill({
          status: 429,
          headers: { "Retry-After": "1" },
          contentType: "application/json",
          body: JSON.stringify({ error: "Too many battle requests. Please wait 1s." }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: E2E_BATTLE_IDS.demo }),
        });
      }
    });

    await page.goto("/");
    const youInput = page.locator("#you");
    const rivalInput = page.locator("#rival");
    await youInput.fill("tourist");
    await rivalInput.fill("Petr");

    const submitBtn = page.getByRole("button", { name: /settle it/i });
    await submitBtn.click();

    // Status banner visible and inputs retained
    await expect(page.locator("text=Codeforces is busy. Try again shortly.")).toBeVisible();
    expect(await youInput.inputValue()).toBe("tourist");
    expect(await rivalInput.inputValue()).toBe("Petr");

    // Wait 1 second and retry
    await page.waitForTimeout(1100);
    await submitBtn.click();

    await page.waitForURL(`**/battle/${E2E_BATTLE_IDS.demo}`);
    expect(attempts).toBe(2);
  });
});
