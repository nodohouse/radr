import { expect, test, type Page } from "playwright/test";

async function openAs(page: Page, roleView: string) {
  await page.addInitScript((role) => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: "loc_canal_house",
        roleView: role,
        timeFormat: "24h",
      }),
    );
  }, roleView);
  await page.goto("/app/decisions", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible({
    timeout: 20000,
  });
  // Wait for hotel industry hydrate + persona lens defaults
  await expect(page.locator("[data-industry=hotels]")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByLabel("Driver filter")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Hotel Decisions PASS 7 — personas", () => {
  test("Housekeeping · Revenue · CFO lenses", async ({ page }) => {
    test.setTimeout(90_000);

    // Housekeeping — driver filter housekeeping
    await openAs(page, "housekeeping_manager");
    await expect(page.getByLabel("Driver filter")).toHaveValue("housekeeping", {
      timeout: 15000,
    });
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible();
    await expect(page.getByText(/Close OTA discount inventory/i)).toHaveCount(0);
    await expect(page.getByLabel("Persona focus")).toContainText("Reassignment");

    // Revenue — channel filter
    await openAs(page, "revenue_manager");
    await expect(page.getByLabel("Driver filter")).toHaveValue("channel", {
      timeout: 15000,
    });
    await expect(
      page.getByText(/Close OTA discount inventory/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/Reassign 2 housekeepers/i)).toHaveCount(0);

    // CFO — all drivers, value sort
    await openAs(page, "cfo");
    await expect(page.getByLabel("Driver filter")).toHaveValue("all", {
      timeout: 15000,
    });
    await expect(page.getByLabel("Sort decisions")).toHaveValue("value");
    await expect(page.getByLabel("Persona focus")).toContainText("Verified Value");
    await expect(page.locator("body")).not.toContainText("€180k");
  });
});
