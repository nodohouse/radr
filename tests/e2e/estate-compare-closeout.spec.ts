import { test, expect } from "@playwright/test";

/**
 * Estate compare must resolve — never stay on "Loading comparison…".
 */
test.describe("Estate compare closeout", () => {
  test("Hamburg → Berlin compare resolves evidence", async ({ page }) => {
    await page.goto(
      "/app/compare?locations=loc_hamburg_hafen,loc_berlin_mitte&stay=1",
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.getByText("Loading comparison…")).toHaveCount(0, {
      timeout: 15_000,
    });
    // Either full compare workspace or structured error — never infinite load.
    const body = page.locator("main, .rp-compare, .rp-frame-v2").first();
    await expect(body).toBeVisible();
    await expect(page.getByText(/Hamburg/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Berlin/i).first()).toBeVisible();
  });

  test("Wine transfer brief resolves + Decision CTA", async ({ page }) => {
    await page.goto(
      "/app/compare?locations=loc_hamburg_hafen,loc_berlin_mitte&transfer=xfer_wine_hamburg&stay=1",
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.getByText("Loading comparison…")).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByText(/Wine attach/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("link", { name: /Create test Decision/i }),
    ).toBeVisible();
  });
});
