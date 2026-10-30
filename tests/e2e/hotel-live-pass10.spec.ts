import { expect, test, type Page } from "playwright/test";
import path from "node:path";

async function openHotelLive(page: Page, qs = "") {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: "loc_canal_house",
        roleView: "gm",
        timeFormat: "24h",
      }),
    );
  });
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto(`/app/live${qs}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-page=hotel-live]")).toBeVisible({
    timeout: 20000,
  });
}

test.describe("Hotel Live PASS 7–8 + 10–11", () => {
  test("Guests · Staff · Incidents · Estate daylight", async ({ page }) => {
    test.setTimeout(90_000);
    await openHotelLive(page);

    await expect
      .poll(() => new URL(page.url()).searchParams.get("level"))
      .toBe("property");

    const modes = page.getByLabel("Live modes");
    const levels = page.getByLabel("Live level");

    // Close room inspector so mode panels can show
    await page.getByRole("button", { name: "Close inspector" }).click();

    // PASS 7–8 — mode depth
    await modes.getByRole("tab", { name: "Guests" }).click();
    await expect(page.getByRole("heading", { name: "Guests" })).toBeVisible();
    await expect(page.getByText(/VIP/i).first()).toBeVisible();

    await modes.getByRole("tab", { name: "Incidents" }).click();
    await expect(page.getByRole("heading", { name: "Incidents" })).toBeVisible();
    await expect(page.getByText(/OUT OF ORDER/i).first()).toBeVisible();

    await modes.getByRole("tab", { name: "Staff" }).click();
    await expect(page.getByText(/no personal location tracking/i)).toBeVisible();
    await expect(page.getByText(/Under-capacity/i).first()).toBeVisible();

    await page.screenshot({
      path: path.join("tmp", "hotel-live-pass8-staff-1512x982.png"),
      fullPage: false,
    });

    // PASS 10 — Estate daylight
    await levels.getByRole("tab", { name: "Estate" }).click();
    await expect(page.locator("[data-level=estate]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Northstar Hotels" })).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("level"))
      .toBe("estate");
    await expect(
      page.getByRole("button", { name: /Canal House, Amsterdam/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter Property" })).toBeVisible();
    await expect(page.locator(".hl-inspector").getByRole("heading", { name: "Canal House" })).toBeVisible();

    await page.screenshot({
      path: path.join("tmp", "hotel-live-pass10-estate-1512x982.png"),
      fullPage: false,
    });

    await page.getByRole("button", { name: "Enter Property" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("level"))
      .toBe("property");
    await expect(page.getByRole("heading", { name: /Canal House/i })).toBeVisible();
    await expect(page.getByText("Arrival wave")).toBeInViewport();

    // PASS 11 — property Rooms fold
    await page.getByLabel("Live modes").getByRole("tab", { name: "Rooms" }).click();
    await page.screenshot({
      path: path.join("tmp", "hotel-live-pass11-rooms-1512x982.png"),
      fullPage: false,
    });
  });
});
