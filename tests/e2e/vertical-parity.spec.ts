/**
 * Vertical parity — restaurant vs hotel demo orgs.
 *
 * PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
 *   npx playwright test tests/e2e/vertical-parity.spec.ts --project=desktop-1440
 */
import { test, expect, type Page } from "playwright/test";

async function seedOrg(page: Page, vertical: "restaurant" | "hotel") {
  await page.evaluate((v) => {
    const orgId =
      v === "hotel" ? "org_northstar_hotels" : "org_northstar_restaurants";
    const loc = v === "hotel" ? "loc_canal_house" : "loc_ber";
    const role = v === "hotel" ? "hotel_gm" : "gm";
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: v, orgId }),
    );
    sessionStorage.setItem(
      "radr.scope.v1",
      JSON.stringify({
        locationScope: loc,
        period: "today",
        lens: "operate",
        serviceTime: "now",
        selectedFindingId: null,
      }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: loc,
        roleView: role,
        timeFormat: "12h",
      }),
    );
    window.dispatchEvent(
      new CustomEvent("radr-demo-org", {
        detail: { vertical: v, orgId },
      }),
    );
  }, vertical);
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function gotoApp(page: Page, path = "/app") {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).not.toContainText("Application error");
  await seedOrg(page, "restaurant");
}

test.describe("Vertical parity", () => {
  test("restaurant CC retains service language", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/app?stay=1");
    await expect(page.locator(".rp-cc4-root")).toHaveAttribute(
      "data-vertical",
      "restaurant",
    );
    await expect(page.getByText(/Revenue is ahead/i).first()).toBeVisible();
    await expect(page.locator(".rp-menupulse").first()).toBeVisible();
    await expect(page.locator(".rp-cock-hotel")).toHaveCount(0);
  });

  test("hotel org recomposes CC", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/app?stay=1");
    await seedOrg(page, "hotel");
    await expect(page.locator(".rp-cc4-root")).toHaveAttribute(
      "data-vertical",
      "hotel",
    );
    await expect(page.locator(".rp-cock-hotel").first()).toBeVisible();
    await expect(
      page.getByText(/CHECK-IN IS ON TRACK|ROOM READINESS/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/Room readiness|Occupancy/i).first()).toBeVisible();
    await expect(page.locator(".rp-menupulse")).toHaveCount(0);
  });

  test("hotel readiness Decision peek without reflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/app?stay=1");
    await seedOrg(page, "hotel");
    const before = await page.evaluate(() => {
      const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    await page.locator(".rp-cock-tl-dec").click();
    await expect(page.locator(".rp-peek-panel")).toBeVisible();
    await expect(page.getByText(/REASSIGN 2 ATTENDANTS/i).first()).toBeVisible();
    const mid = await page.evaluate(() => {
      const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    expect(mid).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(page.locator(".rp-peek-panel")).toHaveCount(0);
  });

  test("settings exposes demo org switcher", async ({ page }) => {
    await gotoApp(page, "/app/settings");
    await page.locator('[data-settings-id="organization"]').click();
    await expect(
      page.getByRole("radio", { name: /Northstar Hotels/i }).first(),
    ).toBeVisible();
    await page.getByRole("radio", { name: /Northstar Hotels/i }).first().click();
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".rp-cock-hotel").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
