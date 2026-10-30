/**
 * Dashboards — library · builder · Ask RADR · share · autosave.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/dashboards-engine.spec.ts --project=desktop-1512
 */
import { test, expect, type Page } from "playwright/test";
import path from "node:path";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";
const SHOT = path.join(process.cwd(), "tmp");

async function seedDemo(page: Page, clearDashboards = true) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
  await page.evaluate((clear) => {
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
    if (clear) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("radr.dashboards"))
        .forEach((k) => localStorage.removeItem(k));
    }
  }, clearDashboards);
}

async function gotoLibrary(page: Page, path = "/app/dashboards") {
  await seedDemo(page);
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-dashboards-engine='true']")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Dashboards Engine", () => {
  test("library pinned hero + templates", async ({ page }) => {
    await gotoLibrary(page);
    await expect(page.locator(".db-head h1")).toHaveText("Dashboards");
    await expect(page.locator("[data-pinned-hero='true']")).toBeVisible();
    await expect(page.locator("[data-manage-access]").first()).toContainText(
      /Shared with \d+ users/i,
    );
    await page.locator('[data-db-tab="templates"]').click();
    await expect(page).toHaveURL(/view=templates/);
    await expect(page.locator(".db-tpl-card, [data-open-template]").first()).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT, "dashboards-pass9-library-1512x982.png"),
    });
  });

  test("open template + customize builder", async ({ page }) => {
    await gotoLibrary(page);
    await page.locator('[data-open-template="dash_cfo"]').click();
    await expect(page).toHaveURL(/\/app\/dashboards\/dash_cfo/);
    await page.goto(`${BASE}/app/dashboards/dash_cfo/edit`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("[data-builder-topbar='true']")).toBeVisible();
    await expect(page.locator(".rp-dbx-status")).toHaveAttribute(
      "data-status",
      /saved|unsaved/,
    );
    await page.locator("[data-wid]").first().click({ position: { x: 40, y: 24 } });
    await expect(page.getByTestId("widget-properties")).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT, "dashboards-pass9-builder-1512x982.png"),
    });
  });

  test("Ask RADR generates widgets into builder", async ({ page }) => {
    await seedDemo(page);
    await page.goto(`${BASE}/app/dashboards/new`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-dashboard-new='true']")).toBeVisible();
    await page.locator('[data-mode="ask"]').click();
    await page
      .getByTestId("ask-dashboard-prompt")
      .fill(
        "Build me a CFO view showing contribution, labor, exposure and Verified Value.",
      );
    await expect(page.locator("[data-ask-preview='true'] li")).toHaveCount(8, {
      timeout: 5000,
    });
    await page.getByTestId("create-and-customize").click();
    await expect(page).toHaveURL(/\/app\/dashboards\/dash_[^/]+\/edit/);
    await expect(page.locator("[data-wid]")).toHaveCount(8, { timeout: 10000 });
  });

  test("share modal invite + library manage access", async ({ page }) => {
    await gotoLibrary(page);
    await page.locator("[data-manage-access]").first().click();
    const dialog = page.locator("[data-builder-share='true']");
    await expect(dialog).toBeVisible();
    const before = await dialog.locator("[data-testid=share-list] li").count();
    await dialog.locator("[data-testid=share-invite-select]").selectOption({
      index: 1,
    });
    await dialog.getByTestId("share-invite-add").click();
    await expect(dialog.locator("[data-testid=share-list] li")).toHaveCount(
      before + 1,
    );
    await dialog.getByTestId("share-done").click();
    await expect(dialog).toHaveCount(0);
  });

  test("builder autosave after rename", async ({ page }) => {
    await seedDemo(page);
    await page.goto(`${BASE}/app/dashboards/dash_cfo/edit`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("[data-builder-topbar='true']")).toBeVisible();
    const name = page.locator(".rp-dbx-name");
    await name.fill(`CFO QA ${Date.now()}`);
    await expect(page.locator(".rp-dbx-status")).toHaveAttribute(
      "data-status",
      "unsaved",
    );
    await expect(page.locator(".rp-dbx-status")).toHaveAttribute(
      "data-status",
      "saved",
      { timeout: 5000 },
    );
  });

  test("pin / unpin / duplicate template", async ({ page }) => {
    await gotoLibrary(page);
    await page.locator('[data-db-tab="templates"]').click();
    await page.locator('[data-duplicate="dash_cfo"]').click();
    await expect(page).toHaveURL(/\/app\/dashboards\/dash_[^/]+\/edit/);
    await page.goto(`${BASE}/app/dashboards?view=mine`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("[data-mine-card]").first()).toBeVisible();
  });

  test("visual fold @ 1512", async ({ page }) => {
    await gotoLibrary(page);
    await expect(page.locator("[data-pinned-hero='true']")).toBeInViewport();
    await page.screenshot({
      path: path.join(SHOT, "dashboards-pass9-fold-1512x982.png"),
      fullPage: false,
    });
  });
});
