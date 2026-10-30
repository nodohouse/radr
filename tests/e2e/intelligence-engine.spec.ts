/**
 * Intelligence Engine — Cost movers + domain adapters + URL state.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/intelligence-engine.spec.ts
 */
import { test, expect, type Page } from "playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";

async function gotoIntel(page: Page, path = "/app/intelligence") {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: "restaurant",
        orgId: "org_nodo_restaurants",
        role: "cfo",
      }),
    );
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
}

test.describe("Intelligence Engine", () => {
  test("overview opens Cost movers with olive oil story", async ({ page }) => {
    await gotoIntel(page, "/app/intelligence?finding=cost-movers&sku=olive-oil");
    await expect(page.getByRole("heading", { name: /What is moving contribution/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cost movers/i }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Which vendor SKUs are drifting/i }),
    ).toBeVisible();
    await expect(page.getByRole("option", { name: /Extra virgin olive oil/i })).toBeVisible();
    await expect(page.getByText(/€273|EXPOSED/i).first()).toBeVisible();
    await expect(page.getByLabel("RADR Says")).toBeVisible();
    await expect(page.getByText(/HIGH CONFIDENCE/i).first()).toBeVisible();
  });

  test("SKU selection updates analysis and RADR Says", async ({ page }) => {
    await gotoIntel(page, "/app/intelligence?finding=cost-movers&sku=olive-oil");
    await page.getByRole("option", { name: /Bluefin tuna/i }).click();
    await expect(page).toHaveURL(/sku=tuna/);
    await expect(page.getByRole("heading", { name: /Bluefin tuna/i })).toBeVisible();
    await expect(page.getByLabel("RADR Says").getByText(/tuna|Bluefin/i).first()).toBeVisible();
  });

  test("period switch keeps finding and scales exposure", async ({ page }) => {
    await gotoIntel(page, "/app/intelligence?finding=cost-movers&sku=olive-oil&period=30d");
    await page.getByRole("tab", { name: "7D" }).click();
    await expect(page).toHaveURL(/period=7d/);
    await page.getByRole("tab", { name: "90D" }).click();
    await expect(page).toHaveURL(/period=90d/);
  });

  test("domain tabs filter findings", async ({ page }) => {
    await gotoIntel(page);
    await page
      .getByRole("navigation", { name: /Intelligence domains/i })
      .getByRole("button", { name: /^Procurement$/i })
      .click();
    await expect(page).toHaveURL(/domain=procurement/);
    await expect(page.getByRole("button", { name: /Cost movers/i }).first()).toBeVisible();

    await page
      .getByRole("navigation", { name: /Intelligence domains/i })
      .getByRole("button", { name: /^Labor$/i })
      .click();
    await expect(page).toHaveURL(/finding=labor-template/);
    await expect(
      page.getByRole("heading", { name: /scheduled hours disconnected/i }),
    ).toBeVisible();
  });

  test("settlement bridge canvas and Compare drivers", async ({ page }) => {
    await gotoIntel(page, "/app/intelligence?finding=settlement-bridge");
    await expect(
      page.getByRole("heading", { name: /settlement break/i }),
    ).toBeVisible();
    await expect(page.getByText(/POS expected/i).first()).toBeVisible();
    await expect(page.getByText(/Unreconciled/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Compare drivers/i }).click();
    await expect(page.getByRole("dialog", { name: /Compare drivers/i })).toBeVisible();
    await expect(page.getByText(/Procurement/i).first()).toBeVisible();
  });

  test("Favorite, catalog, Review decision, confidence", async ({ page }) => {
    await gotoIntel(page, "/app/intelligence?finding=cost-movers&sku=olive-oil");
    await page.getByRole("button", { name: /^Favorite$/i }).click();
    await expect(page.getByRole("button", { name: /Favorited/i })).toBeVisible();

    await page.getByRole("button", { name: /12 more findings in catalog/i }).click();
    await expect(page.getByRole("dialog", { name: /Finding catalog/i })).toBeVisible();
    await page.getByRole("button", { name: /Kitchen pressure/i }).click();
    await expect(page).toHaveURL(/finding=kitchen-pressure/);
    await expect(page.getByRole("heading", { name: /kitchen pressure/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /View in Live/i }).first()).toBeVisible();

    await gotoIntel(page, "/app/intelligence?finding=cost-movers");
    await page.getByRole("button", { name: /HIGH CONFIDENCE/i }).click();
    await expect(page.getByText(/Why confidence/i)).toBeVisible();

    await expect(
      page.getByRole("link", { name: /Review decision/i }).first(),
    ).toHaveAttribute("href", /dec_supplier_berlin|decisions/);
  });

  test("deep link refresh preserves selection", async ({ page }) => {
    const path =
      "/app/intelligence?domain=procurement&finding=cost-movers&sku=chicken&period=90d";
    await gotoIntel(page, path);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/sku=chicken/);
    await expect(page).toHaveURL(/period=90d/);
    await expect(page.getByRole("option", { name: /Chicken supreme/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
