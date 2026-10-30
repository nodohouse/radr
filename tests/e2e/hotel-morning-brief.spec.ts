import { expect, test } from "playwright/test";
import path from "node:path";

test.describe("Hotel Morning Brief — Canal House", () => {
  test("mockup fold · forecast readiness · Amsterdam event @ 1512×982", async ({
    page,
  }) => {
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
    await page.goto("/app/dashboards/dash_hotel_morning_brief", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator('[data-dash="morning-brief"]')).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByRole("heading", { name: /^Morning Brief$/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Elena · Hotel General Manager · Canal House/i),
    ).toBeVisible();
    await expect(page.getByText("Last updated 10:37")).toBeVisible();

    await expect(page.getByText("89%").first()).toBeVisible();
    await expect(page.getByText("€248").first()).toBeVisible();
    await expect(page.getByText("€221").first()).toBeVisible();
    await expect(page.getByText("Forecast for 14:20")).toBeVisible();
    await expect(page.getByText("31/42").first()).toBeVisible();
    await expect(page.getByText("IJ LIVE HALL")).toBeVisible();
    await expect(page.getByText("€6,710").first()).toBeVisible();
    await expect(page.getByText("D-H-9201")).toBeVisible();

    // No Berlin / restaurant leakage
    await expect(page.getByText(/Columbiahalle/i)).toHaveCount(0);
    await expect(page.getByText(/walk-ins/i)).toHaveCount(0);
    await expect(page.getByText("€3,793")).toHaveCount(0);
    await expect(page.getByText("Alex · CFO")).toHaveCount(0);

    for (const id of [
      "hotel_occ_adr_revpar",
      "room_readiness",
      "hotel_pickup",
      "event_context",
      "needs_you",
      "verified_value_trend",
    ]) {
      await expect(page.locator(`[data-widget="${id}"]`)).toBeVisible();
    }

    // Single Open per widget (no duplicate header Open)
    const opens = page.locator(".hgm-open");
    await expect(opens).toHaveCount(6);

    await page.getByRole("link", { name: /Reassign 2 housekeepers/i }).click();
    await expect(page).toHaveURL(/\/app\/decisions\//);

    await page.goto("/app/dashboards/dash_hotel_morning_brief", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator('[data-dash="morning-brief"]')).toBeVisible();

    await page.screenshot({
      path: path.join("tmp", "hotel-morning-brief-pass2-1512x982.png"),
      fullPage: false,
    });
  });
});
