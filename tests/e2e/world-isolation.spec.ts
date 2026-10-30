/**
 * E2E: World isolation — restaurant and hotel never mix.
 * Starts at /app/enter, selects each world, asserts entity absence.
 */
import { test, expect, type Page } from "playwright/test";

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    {
      name: "radr_e2e",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "radr_e2e",
      value: "1",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test.describe("World isolation", () => {
  test("enter is shell-free", async ({ page }) => {
    await gotoApp(page, "/app/enter");
    await expect(
      page.getByRole("heading", { name: /Choose your operating world/i }),
    ).toBeVisible();
    await expect(page.locator(".rp-shell-v2 .rp-main-v2")).toHaveCount(0);
    await expect(page.locator(".rgw-root")).toBeVisible();
  });

  test("restaurant world excludes hotel entities", async ({ page }) => {
    await gotoApp(page, "/app/enter");
    await page.getByRole("button", { name: /Restaurant group/i }).click();
    await expect(page).toHaveURL(/\/app/);

    await expect(page.locator("body")).not.toContainText("Canal House");
    await expect(page.locator("body")).not.toContainText("D-H-9201");
    await expect(page.locator("body")).not.toContainText("RevPAR");

    await expect(
      page.getByText(/Menu|Kitchen|Contribution|Needs you/i).first(),
    ).toBeVisible({ timeout: 8000 });

    for (const path of [
      "/app/decisions",
      "/app/value",
      "/app/locations",
      "/app/memory",
      "/app/intelligence",
      "/app/connections",
    ]) {
      await gotoApp(page, path);
      await expect(page.locator("body")).not.toContainText("D-H-9201");
      await expect(page.locator("body")).not.toContainText("Canal House");
    }
  });

  test("hotel world excludes restaurant peak decisions", async ({ page }) => {
    await gotoApp(page, "/app/enter");
    await page.getByRole("button", { name: /Hotel group/i }).click();
    await expect(page).toHaveURL(/\/app/);

    await expect(page.locator("body")).not.toContainText("Menu Pulse");
    await expect(page.locator("body")).not.toContainText("D-1911");
    await expect(page.locator("body")).not.toContainText("D-7501");

    await expect(
      page.getByText(/D-H-9201|Occupancy|RevPAR|Canal House/i).first(),
    ).toBeVisible({ timeout: 8000 });

    for (const path of [
      "/app/decisions",
      "/app/value",
      "/app/locations",
      "/app/memory",
      "/app/intelligence",
    ]) {
      await gotoApp(page, path);
      await expect(page.locator("body")).not.toContainText("D-1911");
      await expect(page.locator("body")).not.toContainText("Menu Pulse");
    }
  });

  test("hotel Decision deep link sets hotel org", async ({ page }) => {
    await gotoApp(page, "/app/enter");
    await page.getByRole("button", { name: /Restaurant group/i }).click();
    await gotoApp(page, "/app/decisions/dec_hotel_readiness_canal");
    await expect(
      page.getByText(/D-H-9201|Reassign 2 housekeepers/i).first(),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/Northstar Hotels|Hotels/i).first(),
    ).toBeVisible({
      timeout: 8000,
    });
  });

  test("D-2201 futures are hotel distribution options", async ({ page }) => {
    await gotoApp(page, "/app/enter");
    await page.getByRole("button", { name: /Hotel group/i }).click();
    await gotoApp(page, "/app/decisions/dec_ota_canal");
    await expect(page.locator("body")).not.toContainText("Seat now");
    await expect(page.locator("body")).not.toContainText("Wait 12");
    await expect(page.locator("body")).not.toContainText("Throttle delivery");
    await expect(
      page.getByText(/Hold|Release|OTA|direct|premium/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
