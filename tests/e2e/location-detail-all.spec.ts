/**
 * Every canonical location detail — Overview / Live / Performance / no 404.
 */
import { test, expect, type Page } from "playwright/test";

const RESTAURANT_IDS = [
  "loc_berlin_mitte",
  "loc_berlin_kreuzberg",
  "loc_hamburg_hafen",
  "loc_frankfurt_westend",
  "loc_munich_altstadt",
  "loc_koln_ehrenfeld",
  "loc_dusseldorf_medienhafen",
  "loc_stuttgart_mitte",
];

const HOTEL_IDS = [
  "loc_canal_house",
  "loc_ams_harbour",
  "loc_schiphol_gate",
  "loc_lisbon_alfama",
  "loc_berlin_mitte_hotel",
  "loc_paris_opera",
  "loc_london_clerkenwell",
  "loc_munich_airport",
];

const ALIAS_IDS = [
  "loc_london_shoreditch",
  "loc_paris_marais",
  "loc_frankfurt",
];

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function enterWorld(page: Page, world: "restaurant" | "hotel") {
  await gotoApp(page, "/app/enter");
  await page
    .getByRole("button", {
      name: world === "hotel" ? /Hotel group/i : /Restaurant group/i,
    })
    .click();
  await expect(page).toHaveURL(/\/app/);
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
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({ roleView: "coo", defaultLocationId: "all" }),
    );
  }, world);
}

test.describe("Location detail — all canonical", () => {
  for (const id of RESTAURANT_IDS) {
    test(`restaurant ${id} overview + tabs`, async ({ page }) => {
      await enterWorld(page, "restaurant");
      await gotoApp(page, `/app/locations/${id}`);
      await expect(page.locator("body")).not.toContainText("Location not found");
      await expect(page.locator(".rp-loc-detail")).toHaveAttribute("data-loc", id);
      await expect(page.locator(".rp-loc-cmd-statement")).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator(".rp-loc-cmd-rail")).toBeVisible();
      await expect(page.locator(".rp-loc-bridge")).toBeVisible();

      await page.getByRole("tab", { name: /^Live$/i }).click();
      await expect(page.locator(".rp-loc-live")).toBeVisible({ timeout: 10000 });

      await page.getByRole("tab", { name: /^Performance$/i }).click();
      await expect(page.locator(".rp-loc-perf")).toBeVisible();

      await page.getByRole("tab", { name: /^Overview$/i }).click();
      await expect(page.locator(".rp-loc-cmd-statement")).toBeVisible();

      const overflow = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(overflow.sw).toBeLessThanOrEqual(overflow.cw + 1);
    });
  }

  for (const id of HOTEL_IDS) {
    test(`hotel ${id} resolves`, async ({ page }) => {
      await enterWorld(page, "hotel");
      await gotoApp(page, `/app/locations/${id}`);
      await expect(page.locator("body")).not.toContainText("Location not found");
      await expect(page.locator(".rp-loc-detail")).toHaveAttribute("data-loc", id);
      await expect(page.locator(".rp-loc-cmd-statement")).toBeVisible({
        timeout: 10000,
      });
    });
  }

  for (const id of ALIAS_IDS) {
    test(`alias ${id} never 404`, async ({ page }) => {
      await enterWorld(page, "restaurant");
      await gotoApp(page, `/app/locations/${id}`);
      await expect(page.locator("body")).not.toContainText("Location not found");
      await expect(page.locator(".rp-loc-cmd-statement")).toBeVisible({
        timeout: 10000,
      });
    });
  }
});
