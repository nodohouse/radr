/**
 * P1 closeout — Menu rank tracks + Location metric rail.
 */
import { test, expect, type Page } from "playwright/test";

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

test.describe("P1 menu + location metrics", () => {
  test("Menu Intelligence · sold once · station separate from state", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/intelligence/menu?stay=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: /Menu economics/i }),
    ).toBeVisible();
    const row = page.locator(".rp-menu-rank-row").first();
    await expect(row).toBeVisible();
    await expect(row.locator(".rp-menu-rank-sold")).toHaveCount(1);
    const soldText = await row.locator(".rp-menu-rank-sold").innerText();
    expect(soldText).toMatch(/^\d+ sold$/);
    // No doubled "80 sold 80 sold" in the row accessible name.
    const name = await row.getAttribute("aria-label").catch(() => null);
    const body = await row.innerText();
    const soldMatches = body.match(/\d+ sold/g) ?? [];
    expect(soldMatches.length).toBe(1);
    await expect(row.locator(".rp-menu-rank-station")).toBeVisible();
    await expect(row.locator(".rp-menu-rank-state")).toBeVisible();
    const station = await row.locator(".rp-menu-rank-station").innerText();
    const state = await row.locator(".rp-menu-rank-state").innerText();
    expect(station).not.toMatch(new RegExp(state, "i"));
    expect(body).not.toMatch(/Cold station#/i);
    void name;
  });

  test("Location detail · Revenue value and delta are separate metrics", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/locations/loc_berlin_mitte?stay=1", {
      waitUntil: "domcontentloaded",
    });
    const rail = page.locator(".rp-loc-cmd-rail");
    await expect(rail).toBeVisible();
    const rev = rail.locator(".rp-loc-cmd-metric").filter({
      has: page.locator(".rp-metric-label", { hasText: /^Revenue$/i }),
    });
    const valueEl = rev.locator(".rp-metric-value");
    const deltaEl = rev.locator(".rp-metric-delta");
    await expect(valueEl).toBeVisible();
    await expect(deltaEl).toBeVisible();
    const value = await valueEl.innerText();
    const delta = await deltaEl.innerText();
    expect(value).toMatch(/€/);
    expect(value).not.toMatch(/%/);
    expect(delta).toMatch(/%/);
    expect(delta).not.toMatch(/€[\d]/);
    // Distinct boxes — not one concatenated text node.
    const valueBox = await valueEl.boundingBox();
    const deltaBox = await deltaEl.boundingBox();
    expect(valueBox && deltaBox).toBeTruthy();
    if (valueBox && deltaBox) {
      expect(deltaBox.y).toBeGreaterThanOrEqual(valueBox.y + valueBox.height - 2);
    }
  });
});
