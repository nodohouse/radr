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

test.describe("Hotel Live PASS 3–6", () => {
  test("URL · actions · scrub · housekeeping", async ({ page }) => {
    test.setTimeout(120_000);
    await openHotelLive(page);

    // PASS 3 — URL seed + room/floor
    await expect
      .poll(() => new URL(page.url()).searchParams.get("property"))
      .toBe("nyc-mercer-house");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("floor"))
      .toBe("3");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("room"))
      .toBe("310");

    await page.getByRole("button", { name: /^F2/ }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("floor"))
      .toBe("2");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("room"))
      .toBeNull();

    await page.getByRole("button", { name: /^F3/ }).click();
    await page.getByRole("button", { name: /Room 310,/ }).click();
    await expect(page.getByRole("heading", { name: "Room 310" })).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("room"))
      .toBe("310");

    // PASS 4 — Prioritize (does not mark Ready)
    await page.getByRole("button", { name: "Prioritize Room" }).click();
    await expect(
      page.getByRole("heading", { name: /Prioritize Room 310/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Prioritize", exact: true }).click();
    await expect(page.getByText(/prioritized/i).first()).toBeVisible();
    await expect(page.getByText("DIRTY").first()).toBeVisible();

    await page.getByRole("button", { name: "Reassign Staff" }).click();
    await expect(page.getByRole("heading", { name: "Reassign staff" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    // PASS 5 — time scrub
    await page
      .locator(".hl-wave .hl-scrub")
      .getByRole("button", { name: "+60" })
      .click();
    await expect(page.getByText(/FORECAST/i).first()).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("time"))
      .toBe("+60");
    await page
      .locator(".hl-wave .hl-scrub")
      .getByRole("button", { name: "NOW", exact: true })
      .click();
    await expect(page.getByText(/LIVE · 14:20/i).first()).toBeVisible();

    // PASS 6 — Housekeeping mode changes value
    await page.getByLabel("Live modes").getByRole("tab", { name: "Housekeeping" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("mode"))
      .toBe("housekeeping");
    await expect(page.getByText(/Housekeeping load/i)).toBeVisible();
    await expect(page.getByText(/cleaning/i).first()).toBeVisible();

    await page.getByLabel("Live modes").getByRole("tab", { name: "Arrivals" }).click();
    await expect(page.getByText(/Arrival readiness/i)).toBeVisible();

    await page.getByLabel("Live modes").getByRole("tab", { name: "Staff" }).click();
    await expect(page.getByText("Housekeeping").first()).toBeVisible();
    await expect(page.getByText(/available/i).first()).toBeVisible();

    await page.getByLabel("Live modes").getByRole("tab", { name: "Rooms" }).click();
    await page.getByRole("button", { name: /Room 310,/ }).click();
    await page.getByRole("button", { name: "Preview Impact" }).click();
    await expect(page.getByText("€360").first()).toBeVisible();
    await page.getByRole("button", { name: "Exit simulation" }).click();

    await page.screenshot({
      path: path.join("tmp", "hotel-live-pass6-1512x982.png"),
      fullPage: false,
    });
  });

  test("refresh preserves selection", async ({ page }) => {
    await openHotelLive(
      page,
      "?level=property&property=nyc-mercer-house&floor=3&room=310",
    );
    await expect(page.getByRole("heading", { name: "Room 310" })).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Room 310" })).toBeVisible({
      timeout: 20000,
    });
    await expect
      .poll(() => new URL(page.url()).searchParams.get("room"))
      .toBe("310");
  });
});
