/**
 * Service / House / Settings / History — smoke depth (not full 10/10 matrix).
 */
import { test, expect, type Page } from "playwright/test";
import { clickSettingsNav, gotoSettings } from "./helpers/settings";

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

async function enterHotel(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  // Seed hotel world in session before product surfaces mount (enter click is flaky).
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        roleView: "hotel_gm",
        defaultLocationId: "loc_canal_house",
      }),
    );
    sessionStorage.setItem(
      "radr.scope.v1",
      JSON.stringify({ locationScope: "loc_canal_house" }),
    );
  });
  await page.goto("/app/service?stay=1", { waitUntil: "domcontentloaded" });
}

test.describe("Service / House / Settings / History", () => {
  test("restaurant Service Map · time · mode · D-1911 drawer", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/service?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Floor/i })).toBeVisible();
    await page.getByRole("tab", { name: "NOW" }).click();
    await page.getByRole("tab", { name: "Pressure" }).click();
    await page.getByRole("button", { name: /Table 6/i }).click();
    await expect(page.getByText(/Why RADR recommends waiting/i)).toBeVisible();
    await expect(page.getByText(/WAIT 12 MIN/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /D-1911/i })).toBeVisible();
  });

  test("hotel Service Map · readiness drawer", async ({ page }) => {
    await enterHotel(page);
    await expect(
      page.getByRole("heading", { name: /House readiness/i }),
    ).toBeVisible({ timeout: 20000 });
    await page.getByRole("tab", { name: /Readiness/i }).click();
    await expect(page.getByText(/readiness gap/i).first()).toBeVisible();
  });

  test("Back of House · sugar futures · deliveries · verify", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/house?stay=1", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /House standards/i }),
    ).toBeVisible();
    const row = page.locator('[data-gap-id="gap_sugar_berlin"]');
    await expect(row).toBeVisible();
    for (let i = 0; i < 3; i++) {
      if ((await row.getAttribute("data-open")) === "true") break;
      await row.getByRole("button").click();
      await page.waitForTimeout(150);
    }
    await expect(row).toHaveAttribute("data-open", "true");
    await expect(
      row.locator(".rp-house-futures strong", { hasText: /^Emergency top-up$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Review \/ approve Decision/i }),
    ).toHaveAttribute("href", "/app/decisions/dec_caster_sugar_berlin");
    await expect(page.getByRole("heading", { name: /Deliveries/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Verified outcome/i }),
    ).toBeVisible();
    await expect(page.getByText(/HISTORICAL VERIFIED OUTCOME/i)).toBeVisible();
  });

  test("Settings · search · policies · audit", async ({ page }) => {
    await enterRestaurant(page);
    await gotoSettings(page, "/app/settings?section=policies&stay=1");
    await expect(
      page.getByRole("heading", { name: /Policies/i }),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="delivery_throttle"]'),
    ).toBeVisible();
    const search = page.getByRole("searchbox", { name: /Search settings/i });
    await search.fill("policy");
    await expect(page.locator('[data-settings-id="policies"]')).toBeVisible();
    await search.fill("security");
    await clickSettingsNav(page, "security");
    await expect(page.getByText(/Audit log/i)).toBeVisible();
  });

  test("History calendar cannot advance past DemoClock today", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    const hist = page.locator('[data-mod="history"]');
    await expect(hist).toBeVisible();
    const next = hist.getByRole("button", { name: /Next month/i });
    await expect(next).toBeDisabled();
    const years = await hist.locator('select[data-kind="year"] option').allTextContents();
    expect(years.every((y) => Number(y) <= 2026)).toBe(true);
    expect(years.includes("2027")).toBe(false);
  });
});
