import { defineConfig } from "playwright/test";
/** 100 independent automated sessions: ten hospitality roles × ten input/device variants. */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "marketing-buyer-journeys.spec.ts",
  repeatEach: 10,
  fullyParallel: true,
  workers: 4,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile:
          process.env.RADR_QA_REPORT_PATH || "test-results/release-100.json",
      },
    ],
  ],
  outputDir: process.env.RADR_QA_OUTPUT_DIR || "test-results/release-100",
  use: {
    headless: true,
    actionTimeout: 20000,
    launchOptions: {
      executablePath: process.env.RADR_QA_CHROMIUM_PATH,
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
});
