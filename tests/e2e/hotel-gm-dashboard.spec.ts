import { expect, test } from "playwright/test";
import path from "node:path";

test.describe("Hotel GM Dashboard — Canal House", () => {
  test("mockup fold · canonical numbers @ 1512×982", async ({ page }) => {
    test.setTimeout(90_000);

    await page.addInitScript(() => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
      );
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          defaultLocationId: "loc_canal_house",
          roleView: "hotel_gm",
          timeFormat: "24h",
        }),
      );
      for (const k of Object.keys(localStorage)) {
        if (k.includes("dashboard")) localStorage.removeItem(k);
      }
    });

    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto("/app/dashboards/dash_hotel_gm", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator('[data-dash="hotel-gm"]')).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByRole("heading", { name: /Hotel General Manager/i }),
    ).toBeVisible();
    await expect(page.getByText(/Mercer House · New York · GM/i)).toBeVisible();
    await expect(page.getByText("89%").first()).toBeVisible();
    await expect(page.getByText("€248").first()).toBeVisible();
    await expect(page.getByText("€221").first()).toBeVisible();
    await expect(page.getByText("31/42").first()).toBeVisible();
    await expect(page.getByText("€6,710").first()).toBeVisible();
    await expect(page.getByText("D-2201").first()).toBeVisible();
    await expect(page.getByText("D-H-9201")).toBeVisible();
    await expect(page.getByRole("button", { name: /Pinned/i })).toBeVisible();
    await expect(page.getByTestId("dashboard-edit")).toBeVisible();

    // All six skins present
    for (const id of [
      "hotel_occ_adr_revpar",
      "room_readiness",
      "hotel_pickup",
      "hotel_channel_mix",
      "needs_you",
      "verified_value_trend",
    ]) {
      await expect(page.locator(`[data-widget="${id}"]`)).toBeVisible();
    }

    // No restaurant CFO leakage
    await expect(page.getByText("Alex · CFO")).toHaveCount(0);
    await expect(page.getByText("€3,793")).toHaveCount(0);

    // Needs-you Decision opens canonical path
    await page
      .getByRole("link", { name: /Reassign 2 housekeepers/i })
      .click();
    await expect(page).toHaveURL(/\/app\/decisions\//);

    await page.goto("/app/dashboards/dash_hotel_gm", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator('[data-dash="hotel-gm"]')).toBeVisible();

    await page.screenshot({
      path: path.join("tmp", "hotel-gm-dashboard-pass2-1512x982.png"),
      fullPage: false,
    });
  });
});
