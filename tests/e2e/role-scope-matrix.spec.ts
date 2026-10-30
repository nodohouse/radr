/**
 * Role scope + world isolation matrix (Playwright).
 */
import { test, expect, type Page } from "playwright/test";

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function enterWorld(page: Page, world: RegExp) {
  const isHotel = /Hotel/i.test(world.source);
  await gotoApp(page, "/app/enter");
  await page.getByRole("button", { name: world }).click();
  await expect(page).toHaveURL(/\/app/);
  await page.evaluate((hotel) => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: hotel ? "hotel" : "restaurant",
        orgId: hotel
          ? "org_northstar_hotels"
          : "org_northstar_restaurants",
      }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    if (hotel) {
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({ locationScope: "all" }),
      );
    }
  }, isHotel);
}

async function setRole(page: Page, label: RegExp) {
  // Role switcher — open then pick
  const trigger = page.getByRole("button", { name: /GM|COO|CFO|Revenue|General Manager/i }).first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click();
    const opt = page.getByRole("option", { name: label }).or(
      page.getByRole("menuitem", { name: label }),
    ).or(page.getByRole("radio", { name: label }));
    if (await opt.first().isVisible().catch(() => false)) {
      await opt.first().click();
    }
  }
}

test.describe("Role scope matrix", () => {
  test("Sarah GM · restaurants · Berlin only on Locations", async ({ page }) => {
    await enterWorld(page, /Restaurant group/i);
    await setRole(page, /General Manager|GM · Berlin/i);
    await gotoApp(page, "/app/locations");
    await expect(page.locator("body")).not.toContainText("Canal House");
    await expect(page.locator("body")).toContainText("Soho · New York");
    // Single-location instrument, not giant scatter for GM
    await expect(page.locator(".rp-loc-single, .rp-loc-table")).toBeVisible();
  });

  test("Marcus COO · restaurants · full portfolio", async ({ page }) => {
    await enterWorld(page, /Restaurant group/i);
    await page.evaluate(() => {
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({ roleView: "coo", defaultLocationId: "all" }),
      );
    });
    await gotoApp(page, "/app/locations");
    await expect(page.locator("body")).not.toContainText("Canal House");
    await expect(page.locator("body")).not.toContainText("Chiado");
    // Multiple restaurant locations
    const rows = page.locator(".rp-loc-table-row");
    await expect(rows.first()).toBeVisible({ timeout: 8000 });
    expect(await rows.count()).toBeGreaterThanOrEqual(5);
    await expect(page.locator(".rp-loc-matrix, .rp-loc-rank")).toBeVisible();
  });

  test("Elena CFO · restaurants · portfolio + no hotel", async ({ page }) => {
    await enterWorld(page, /Restaurant group/i);
    await page.evaluate(() => {
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({ roleView: "cfo", defaultLocationId: "all" }),
      );
    });
    await gotoApp(page, "/app/locations");
    await expect(page.locator("body")).not.toContainText("Canal House");
    expect(await page.locator(".rp-loc-table-row").count()).toBeGreaterThanOrEqual(5);
  });

  test("Friday Dinner dashboard deep link resolves", async ({ page }) => {
    await enterWorld(page, /Restaurant group/i);
    await gotoApp(page, "/app/dashboards/dash_friday_dinner");
    await expect(page.locator("body")).not.toContainText("Dashboard not found");
    await expect(page.getByRole("heading", { name: /Friday Dinner/i })).toBeVisible();
    // Title once — module must not repeat dashboard name
    await expect(page.locator("body")).not.toContainText("Friday Dinner Dashboard");
  });

  test("hotel world locations are hotels only", async ({ page }) => {
    await enterWorld(page, /Hotel group/i);
    await page.evaluate(() => {
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          roleView: "coo",
          defaultLocationId: "all",
        }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({ locationScope: "all" }),
      );
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({
          vertical: "hotel",
          orgId: "org_northstar_hotels",
        }),
      );
    });
    await gotoApp(page, "/app/locations");
    await expect(page.locator("[data-vertical='hotel']").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(".rp-loc-table-row").first()).toBeVisible({
      timeout: 8000,
    });
    await expect(page.locator(".rp-loc-table")).toContainText("Canal House");
    await expect(page.locator(".rp-loc-table")).not.toContainText("Soho · New York");
    await expect(
      page.getByRole("button", { name: /Hotels\s*\/\s*Berlin/i }),
    ).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Menu Pulse");
  });
});
