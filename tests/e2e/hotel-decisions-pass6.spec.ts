import { expect, test, type Page } from "playwright/test";

async function hotelSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
  });
}

test.describe("Hotel Decisions PASS 6 — cross-product", () => {
  test("CC → Decisions · House → Decisions · Connected links", async ({
    page,
  }) => {
    await hotelSession(page);

    // Control Center Active Decision → Decisions ledger
    await page.goto("/app?stay=1", { waitUntil: "networkidle" });
    await expect(page.getByText(/REASSIGN 2 HOUSEKEEPERS/i).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("81%").first()).toBeVisible();
    await page.getByRole("link", { name: /Review decision/i }).click();
    await expect(page).toHaveURL(/\/app\/decisions/);
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.locator(".rd-inspector .rd-insp-kpi.is-value"),
    ).toContainText("1,840");
    await expect(page.locator(".rd-inspector")).toContainText("81%");

    // Connected panel
    const connected = page.locator(".rd-cross-links");
    await expect(connected).toBeVisible();
    await expect(connected).toContainText(/View analysis/i);
    await expect(connected).toContainText(/View policy/i);
    await expect(connected).toContainText(/Data Health/i);
    await expect(connected).toContainText(/GM approval/i);

    // Policy deep-link
    await connected.getByRole("link", { name: /View policy/i }).click();
    await expect(page).toHaveURL(/\/app\/settings/);
    await expect(page).toHaveURL(/policy=housekeeping_reassign/);

    // House Readiness Apply → same Decision
    await page.goto("/app/service", { waitUntil: "networkidle" });
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/€1,840/).first()).toBeVisible();
    await expect(page.getByText(/81%/)).toBeVisible();
    await page.getByRole("button", { name: /Apply suggestion/i }).click();
    await page.getByRole("link", { name: /Open Decision/i }).click();
    await expect(page).toHaveURL(/decision=dec_hotel_readiness_canal/);
    await expect(page.locator("body")).not.toContainText("€180k");
  });
});
