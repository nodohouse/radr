import { expect, test, type Page } from "playwright/test";

async function openHotelDecisions(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
  });
  await page.goto("/app/decisions?decision=dec_hotel_readiness_canal", {
    waitUntil: "networkidle",
  });
  await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Hotel Decisions PASS 5 — Compare Futures", () => {
  test("three futures · select B · no restaurant-scale numbers", async ({
    page,
  }) => {
    await openHotelDecisions(page);

    const futures = page.locator(".rd-hotel-futures");
    await expect(futures).toBeVisible();
    await expect(futures).toContainText(/Future A · Do nothing/i);
    await expect(futures).toContainText(/Future B · Reassign 1/i);
    await expect(futures).toContainText(/Future C · Reassign 2/i);
    await expect(futures).toContainText(/Recommended/i);
    await expect(futures).toContainText("31 / 42");
    await expect(futures).toContainText("35 / 42");
    await expect(futures).toContainText("€1,840");
    await expect(futures).toContainText("€360");
    await expect(futures).toContainText(/up to €1,480/i);
    await expect(futures).toContainText(/Decide by/);
    await expect(futures).toContainText(/14:40/);
    await expect(page.locator("body")).not.toContainText("€180k");

    // Choose Future B
    await futures
      .locator("article")
      .filter({ hasText: /Future B/i })
      .getByRole("button", { name: /Choose this future/i })
      .click();
    await expect(page.locator(".rd-toast")).toContainText(/Selected/i);
    await expect(
      futures.locator("article").filter({ hasText: /Future B/i }),
    ).toHaveAttribute("data-selected", "true");

    // Re-select recommended C
    await futures
      .locator("article")
      .filter({ hasText: /Future C/i })
      .getByRole("button", { name: /Choose this future|Selected/i })
      .click();
    await expect(
      futures.locator("article").filter({ hasText: /Future C/i }),
    ).toHaveAttribute("data-selected", "true");
  });
});
