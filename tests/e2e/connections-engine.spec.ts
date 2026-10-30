/**
 * Connections — data coverage + trust + decision dependency.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/connections-engine.spec.ts --project=desktop-1512
 */
import { test, expect, type Page } from "playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";

async function gotoConnections(page: Page, path = "/app/connections") {
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
  await expect(page.locator("[data-connections-engine='true']")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Connections Engine", () => {
  test("overview summary + table + rail", async ({ page }) => {
    await gotoConnections(page);
    await expect(page.locator(".ce-page-head h1")).toHaveText("Connections");
    await expect(page.getByText(/Data Health →/i).first()).toBeVisible();
    const summary = page.locator(".ce-summary strong");
    await expect(summary.nth(0)).toHaveText("8");
    await expect(summary.nth(1)).toHaveText("2");
    await expect(summary.nth(2)).toHaveText("13");
    await expect(summary.nth(3)).toHaveText("84%");
    await expect(page.getByText(/System health & coverage/i)).toBeVisible();
    await expect(page.getByText(/^Xero$/i).first()).toBeVisible();
    await expect(page.getByText(/^Deliverect$/i).first()).toBeVisible();
    await expect(page.locator(".ce-rail-card")).toHaveCount(4);
    await expect(page.getByText(/RADR sees/i)).toBeVisible();
    await expect(page.getByText(/Coverage by category/i)).toBeVisible();
    await expect(page.getByText(/What RADR unlocks/i)).toBeVisible();
    await expect(page.getByText(/Coverage gaps/i)).toBeVisible();
    await expect(page.getByText(/Available integrations/i)).toBeVisible();
  });

  test("category filter updates URL and table", async ({ page }) => {
    await gotoConnections(page);
    await page.getByRole("button", { name: "Accounting", exact: true }).click();
    await expect(page).toHaveURL(/category=accounting/);
    await expect(page.getByText(/^Xero$/i).first()).toBeVisible();
    await expect(page.getByText(/^Lightspeed$/i)).toHaveCount(0);
  });

  test("search finds refunds systems in catalog", async ({ page }) => {
    await gotoConnections(page);
    await page.getByLabel("Search connections").fill("refunds");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/search=refunds/);
    await page.getByRole("button", { name: /View all integrations/i }).click();
    await expect(page.locator('[data-conn-id="uber-eats"]')).toBeVisible();
  });

  test("attention filter and need-attention rail", async ({ page }) => {
    await gotoConnections(page);
    await page
      .locator(".ce-summary button")
      .filter({ hasText: "Need attention" })
      .click();
    await expect(page).toHaveURL(/status=attention/);
    await expect(page.getByText(/^Xero$/i).first()).toBeVisible();
    await expect(page.getByText(/^Deliverect$/i).first()).toBeVisible();
    await page.locator(".ce-att-list button").first().click();
    await expect(page.locator("[data-connections-drawer='true']")).toBeVisible();
  });

  test("row opens drawer with confidence + Data Health", async ({ page }) => {
    await gotoConnections(page, "/app/connections?system=xero");
    const drawer = page.locator("[data-connections-drawer='true']");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { name: /Decision confidence impact/i })).toBeVisible();
    await expect(drawer.getByText(/92% → 68%/)).toBeVisible();
    await expect(
      drawer.locator(".ce-conf-list a", { hasText: "D-4102" }),
    ).toBeVisible();
    await expect(
      drawer.getByRole("link", { name: /View Data Health/i }).first(),
    ).toBeVisible();
    await drawer.getByRole("button", { name: "Close" }).click();
    await expect(drawer).toHaveCount(0);
  });

  test("Decision dependency links", async ({ page }) => {
    await gotoConnections(page);
    await page.getByRole("link", { name: "D-4102" }).first().click();
    await expect(page).toHaveURL(/\/app\/decisions\//);
  });

  test("coverage donut filters category", async ({ page }) => {
    await gotoConnections(page);
    await page
      .locator(".ce-cov-legend button")
      .filter({ hasText: "Workforce" })
      .click();
    await expect(page).toHaveURL(/category=workforce/);
  });

  test("setup / request / notify modal", async ({ page }) => {
    await gotoConnections(page);
    await page.getByRole("button", { name: /Set up →/i }).first().click();
    const modal = page.locator("[data-connections-setup='true']");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Authentication/i)).toBeVisible();
    await modal.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(modal).toHaveCount(0);
  });

  test("deep link + browser back", async ({ page }) => {
    await gotoConnections(page);
    await page
      .locator(".ce-cats")
      .getByRole("button", { name: "Delivery", exact: true })
      .click();
    await expect(page).toHaveURL(/category=delivery/);
    await expect(page.getByText(/^Deliverect$/i).first()).toBeVisible();
    await page
      .locator(".ce-cats")
      .getByRole("button", { name: "All", exact: true })
      .click();
    await expect(page).not.toHaveURL(/category=delivery/);
    await page.goBack();
    await expect(page).toHaveURL(/category=delivery/);
  });

  test("View Data Health from stale impact", async ({ page }) => {
    await gotoConnections(page);
    await page
      .locator(".ce-impact a")
      .filter({ hasText: /View Data Health/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/app\/data-health/);
  });
});
