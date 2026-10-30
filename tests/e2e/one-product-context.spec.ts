/**
 * One-product context persistence — GM Soho → Decisions keeps shell context.
 */
import { expect, test, type Page } from "playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3111";

async function enterRestaurant(page: Page) {
  await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/);
}

test.describe("One product context", () => {
  test("CC → Decisions preserves Soho · New York · GM; AppShell stays", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await enterRestaurant(page);
    await page.goto(`${BASE}/app?stay=1`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("restaurant-gm-cc")).toBeVisible();
    await expect(page.getByRole("button", { name: /Scope/i })).toContainText(
      /Soho · New York/i,
    );

    await page.getByTestId("gm-cc-needs-you-view-all").click();
    await page.waitForURL(/\/app\/decisions/);

    // Canonical shell — not legacy Financials nav
    await expect(page.locator(".rd-nav")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/People & Labor/i);
    await expect(page.getByRole("button", { name: /Scope/i })).toContainText(
      /Soho · New York/i,
    );
    await expect(page.locator("body")).toContainText(/Peak capacity collision|D-1911|Hold next seating/i);
  });

  test("deep link D-1911 restores restaurant context", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/app/decisions/dec_peak_berlin?stay=1`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("body")).toContainText(/Peak|seating|D-1911/i);
    // Scope should resolve to Berlin (not Canal House)
    await expect(page.locator("body")).not.toContainText(
      /Restaurants\s*\/\s*Canal House/i,
    );
  });

  test("legacy /app/control-center redirects to /app", async ({ page }) => {
    await enterRestaurant(page);
    await page.goto(`${BASE}/app/control-center?industry=restaurants`, {
      waitUntil: "networkidle",
    });
    await page.waitForURL(/\/app(\?|$)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/app(\?|$)/);
    expect(page.url()).not.toMatch(/\/app\/control-center/);
  });

  test("refresh Decision detail keeps restaurant world", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/app/decisions/dec_peak_berlin?stay=1`, {
      waitUntil: "networkidle",
    });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText(/Peak|seating|D-1911/i);
    await expect(page.locator("body")).not.toContainText(
      /Restaurants\s*\/\s*Canal House/i,
    );
  });

  test("back from Decisions returns to Control Center", async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await enterRestaurant(page);
    await page.goto(`${BASE}/app?stay=1`, { waitUntil: "networkidle" });
    await page.getByTestId("gm-cc-needs-you-view-all").click();
    await page.waitForURL(/\/app\/decisions/);
    await page.goBack();
    await page.waitForURL(/\/app(\?|$)/);
    await expect(page.getByTestId("restaurant-gm-cc")).toBeVisible();
  });

  test("OTA alias deep link resolves to Record", async ({ page }) => {
    await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Hotel group/i }).click();
    await page.waitForURL(/\/app/);
    await page.goto(`${BASE}/app/decisions/dec_hotel_ota_close_canal?stay=1`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("body")).not.toContainText(/Decision not found/i);
  });

  test("Reports uses product shell (visual follow-up body OK)", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto(`${BASE}/app/reports?stay=1`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-page='reports']")).toHaveAttribute(
      "data-visual",
      "follow-up",
    );
    // Canonical rail present (not legacy Financials nav)
    await expect(page.locator("body")).not.toContainText(/People & Labor/i);
  });
});
