import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /motion\.spec\.ts/,
  timeout: 45000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  outputDir: "./docs/review-evidence/2026-10-26-fight-night/videos",
  use: {
    baseURL: "http://127.0.0.1:3101",
    video: "on",
    trace: "off",
  },
  projects: [
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "phone-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
    {
      name: "reduced-motion-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        contextOptions: {
          reducedMotion: "reduce",
        },
      },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
