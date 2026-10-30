/**
 * Locations Portfolio Operating Intelligence.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/locations-engine.spec.ts --project=desktop-1512
 */
import { test, expect, type Page } from "playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";

async function gotoLocations(page: Page, path = "/app/locations") {
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
    sessionStorage.setItem(
      "radr.scope.v1",
      JSON.stringify({ locationScope: "all" }),
    );
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-locations-engine='true']")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Locations Engine", () => {
  test("overview portfolio chart + 8 rows + MTD", async ({ page }) => {
    await gotoLocations(page);
    await expect(page.locator(".le-page-head h1")).toHaveText("Locations");
    await expect(page.getByText(/Portfolio · MTD/i)).toBeVisible();
    await expect(page.locator(".le-table tbody tr")).toHaveCount(8);
    await expect(page.getByText(/Soho · New York/i).first()).toBeVisible();
    await expect(page.getByText(/Hamburg Hafen/i).first()).toBeVisible();
    await expect(page.locator("#le-att-h")).toBeVisible();
    await expect(page.locator("#le-opp-h")).toBeVisible();
    await expect(page.locator("#le-health-h")).toBeVisible();
  });

  test("bubble click selects location and opens drawer", async ({ page }) => {
    await gotoLocations(page);
    await page.locator(".le-bubble").first().click();
    await expect(page).toHaveURL(/location=/);
    await expect(page.locator(".le-drawer")).toBeVisible();
    await expect(page.getByText(/Why it matters/i)).toBeVisible();
  });

  test("table sort updates URL and insight", async ({ page }) => {
    await gotoLocations(page);
    await page
      .getByLabel("Sort by")
      .getByRole("button", { name: /^Exposure$/i })
      .click();
    await expect(page).toHaveURL(/sort=exposure/);
    await page
      .getByLabel("Sort by")
      .getByRole("button", { name: /^Revenue$/i })
      .click();
    await expect(page).toHaveURL(/sort=revenue/);
  });

  test("search filters rows", async ({ page }) => {
    await gotoLocations(page);
    await page.getByLabel("Search locations").fill("Hamburg");
    await expect(page.locator(".le-table tbody tr")).toHaveCount(1);
    await expect(page.getByText(/Hamburg Hafen/i).first()).toBeVisible();
  });

  test("View diagnosis and recommended actions", async ({ page }) => {
    await gotoLocations(page);
    await page.getByRole("button", { name: /View recommended actions/i }).click();
    await expect(
      page.getByRole("dialog", { name: /Recommended actions/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Close$/i }).click();
    await page.getByRole("link", { name: /View diagnosis/i }).first().click();
    await expect(page).toHaveURL(/intelligence/);
  });

  test("Performance / Exposure / Profitability / Watchlist views", async ({
    page,
  }) => {
    await gotoLocations(page, "/app/locations?view=performance");
    await expect(page.locator("[data-locations-view='performance']")).toBeVisible();
    await expect(page.getByText(/Where contribution is created/i)).toBeVisible();

    await page
      .getByRole("navigation", { name: /Locations perspective/i })
      .getByRole("button", { name: /^Exposure$/i })
      .click();
    await expect(page).toHaveURL(/view=exposure/);
    await expect(page.locator("[data-locations-view='exposure']")).toBeVisible();
    await expect(page.getByText(/Gross exposure/i)).toBeVisible();

    await page
      .getByRole("navigation", { name: /Locations perspective/i })
      .getByRole("button", { name: /^Profitability$/i })
      .click();
    await expect(
      page.locator("[data-locations-view='profitability']"),
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: /Locations perspective/i })
      .getByRole("button", { name: /^Watchlist$/i })
      .click();
    await expect(page.locator("[data-locations-view='watchlist']")).toBeVisible();
  });

  test("portfolio health filter and deep link refresh", async ({ page }) => {
    await gotoLocations(page);
    await page
      .locator(".le-health-legend button")
      .filter({ hasText: /On track/i })
      .click();
    const n = await page.locator(".le-table tbody tr").count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(8);

    await gotoLocations(
      page,
      "/app/locations?view=exposure&location=berlin-mitte&sort=exposure",
    );
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/view=exposure/);
    await expect(page).toHaveURL(/location=berlin-mitte/);
  });

  test("row action menu links", async ({ page }) => {
    await gotoLocations(page);
    await page.getByRole("button", { name: /Actions for Soho · New York/i }).click();
    await expect(
      page.getByRole("menuitem", { name: /Open location/i }),
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /View Value/i })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /View Memory/i }),
    ).toBeVisible();
  });
});
