import { defineConfig } from "playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3030";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tmp/playwright-report" }]],
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-1512", use: { viewport: { width: 1512, height: 982 } } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1366", use: { viewport: { width: 1366, height: 768 } } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } },
    { name: "laptop-1024", use: { viewport: { width: 1024, height: 768 } } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 } } },
    {
      name: "mobile-430",
      use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true },
    },
    {
      name: "mobile-390",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
