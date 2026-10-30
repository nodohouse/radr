/**
 * Settings governance engine.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/settings-engine.spec.ts --project=desktop-1512
 */
import { test, expect, type Page } from "playwright/test";
import path from "node:path";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";
const SHOT = path.join(process.cwd(), "tmp");

async function gotoSettings(page: Page, section = "organization") {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: "restaurant",
        orgId: "org_northstar_restaurants",
      }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({ roleView: "cfo", defaultLocationId: "all" }),
    );
    Object.keys(localStorage)
      .filter((k) => k.startsWith("radr.demoSettings"))
      .forEach((k) => localStorage.removeItem(k));
  });
  await page.goto(`${BASE}/app/settings?section=${section}&stay=1`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("[data-settings-engine='true']")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Settings Engine", () => {
  test("organization overview", async ({ page }) => {
    await gotoSettings(page, "organization");
    await expect(page.locator(".se-head h1")).toHaveText("Settings");
    await expect(page.locator("[data-settings-nav-item]")).toHaveCount(12);
    await expect(page.locator("[data-summary-card]")).toHaveCount(4);
    await expect(page.getByTestId("org-name")).toHaveValue(
      "Northstar Restaurants",
    );
    await page.screenshot({
      path: path.join(SHOT, "settings-pass9-organization-1512x982.png"),
    });
  });

  test("locations override + context + forecasting", async ({ page }) => {
    await gotoSettings(page, "locations");
    await expect(page.locator("[data-settings-locations]")).toBeVisible();
    await page.locator('[data-location-row="loc_berlin_mitte"]').click();
    await page.getByTestId("loc-currency").selectOption("GBP");
    await page.locator('[data-settings-nav-item="context"]').click();
    await expect(page.locator("[data-settings-context]")).toBeVisible();
    await page.locator('[data-settings-nav-item="forecasting"]').click();
    await expect(page.getByTestId("fc-compare")).toHaveValue("plan");
  });

  test("users access + policies deep link", async ({ page }) => {
    await gotoSettings(page, "access");
    await expect(page.locator("[data-settings-access]")).toBeVisible();
    await expect(page.locator("[data-user-row]").first()).toBeVisible();
    await page.goto(
      `${BASE}/app/settings?section=policies&policy=delivery_throttle&stay=1`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator("[data-settings-policies]")).toBeVisible();
    await expect(
      page.locator('[data-policy-card="delivery_throttle"]'),
    ).toHaveAttribute("data-active", "true");
  });

  test("autonomy confirmation + notifications", async ({ page }) => {
    await gotoSettings(page, "autonomy");
    page.once("dialog", (d) => d.dismiss());
    await page.getByTestId("autonomy-delivery").selectOption("auto");
    await page.locator('[data-settings-nav-item="notifications"]').click();
    await expect(page.locator("[data-settings-notifications]")).toBeVisible();
    await page.getByTestId("notify-quietHoursEnabled").click();
  });

  test("integrations + audit + search", async ({ page }) => {
    await gotoSettings(page, "integrations");
    await expect(page.locator("[data-settings-integrations]")).toBeVisible();
    await page.locator('[data-settings-nav-item="audit"]').click();
    await expect(page.locator("[data-settings-audit]")).toBeVisible();
    await page.getByTestId("settings-search").fill("forecast");
    await expect(
      page.locator('[data-settings-nav-item="forecasting"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-settings-nav-item="organization"]'),
    ).toHaveCount(0);
  });
});
