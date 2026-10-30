/**
 * Locations portfolio — scope, identity, estate learning.
 * Restaurant overview uses Locations engine (`[data-locations-engine]`).
 * Hotel detail routes retain legacy location pages.
 */
import { test, expect, type Page } from "playwright/test";

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function enterWorld(page: Page, world: "restaurant" | "hotel") {
  await gotoApp(page, "/app/enter");
  const label = world === "hotel" ? /Hotel group/i : /Restaurant group/i;
  await page.getByRole("button", { name: label }).click().catch(() => {});
  await page.evaluate((w) => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: w,
        orgId:
          w === "hotel"
            ? "org_northstar_hotels"
            : "org_northstar_restaurants",
      }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
  }, world);
}

async function setRoleScope(
  page: Page,
  role: string,
  locationScope: string,
) {
  await page.evaluate(
    ({ role, locationScope }) => {
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          roleView: role,
          defaultLocationId: locationScope === "all" ? "all" : locationScope,
        }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({ locationScope }),
      );
    },
    { role, locationScope },
  );
}

test.describe("Locations portfolio", () => {
  test("COO sees all restaurant locations — count matches rows", async ({
    page,
  }) => {
    await enterWorld(page, "restaurant");
    await setRoleScope(page, "coo", "all");
    await gotoApp(page, "/app/locations");
    await expect(page.locator("[data-locations-engine='true']")).toBeVisible({
      timeout: 10000,
    });
    const rows = page.locator(".le-table tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBe(8);
    await expect(page.getByText(/8/)).toBeVisible();
    await expect(page.getByText(/need attention/i).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Soho · New York");
    await expect(page.locator("body")).toContainText("Kreuzberg");
    await expect(page.locator("body")).toContainText("Hamburg");
    await expect(page.locator("body")).toContainText("Frankfurt");
    await expect(page.locator("body")).not.toContainText("Canal House");
    await expect(page.locator(".le-chart")).toBeVisible();
    await expect(page.locator(".le-bottom")).toBeVisible();
  });

  test("no horizontal overflow at key viewports", async ({ page }) => {
    await enterWorld(page, "restaurant");
    await setRoleScope(page, "coo", "all");
    const viewports = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 430, height: 932 },
    ];
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await gotoApp(page, "/app/locations");
      await expect(page.locator("[data-locations-engine='true']")).toBeVisible({
        timeout: 10000,
      });
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });
      expect(
        overflow.scrollWidth,
        `overflow at ${vp.width}x${vp.height}`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  });

  test("GM sees Berlin only", async ({ page }) => {
    await enterWorld(page, "restaurant");
    await setRoleScope(page, "gm", "loc_berlin_mitte");
    await gotoApp(page, "/app/locations");
    await expect(page.locator("[data-locations-engine='true']")).toBeVisible({
      timeout: 10000,
    });
    expect(await page.locator(".le-table tbody tr").count()).toBe(1);
    await expect(page.locator("body")).toContainText("Soho · New York");
  });

  test("row select + Kreuzberg detail resolves", async ({ page }) => {
    await enterWorld(page, "restaurant");
    await setRoleScope(page, "cfo", "all");
    await gotoApp(page, "/app/locations");
    await expect(page.locator(".le-table tbody tr")).toHaveCount(8, {
      timeout: 10000,
    });
    await page
      .locator(".le-table tbody tr")
      .filter({ hasText: /Kreuzberg/i })
      .first()
      .click();
    await expect(page).toHaveURL(/location=/);
    await expect(page.locator(".le-drawer")).toBeVisible();
    await gotoApp(page, "/app/locations/loc_berlin_kreuzberg");
    await expect(page.locator("body")).not.toContainText("Location not found");
    await expect(
      page.getByRole("heading", { name: /Berlin Kreuzberg|Kreuzberg/i }).first(),
    ).toBeVisible();
  });

  test("hotel portfolio list loads without restaurant Kreuzberg", async ({
    page,
  }) => {
    await enterWorld(page, "hotel");
    await setRoleScope(page, "coo", "all");
    await gotoApp(page, "/app/locations");
    await expect(page.locator("[data-locations-engine='true']")).toBeVisible({
      timeout: 10000,
    });
    const n = await page.locator(".le-table tbody tr").count();
    expect(n).toBeGreaterThanOrEqual(5);
    await expect(page.locator("body")).not.toContainText("Kreuzberg");
  });

  test("hotel property detail has demand DNA + pace", async ({ page }) => {
    await enterWorld(page, "hotel");
    await setRoleScope(page, "hotel_gm", "loc_canal_house");
    await gotoApp(page, "/app/locations/loc_canal_house");
    await expect(page.locator("body")).not.toContainText("Location not found");
    await expect(page.getByText(/Demand profile|Property DNA/i).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Booking pace/i).first()).toBeVisible();
  });
});
