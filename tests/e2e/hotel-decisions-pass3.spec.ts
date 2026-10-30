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
  await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible();
  await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Hotel Decisions PASS 3 — table interaction", () => {
  test("tabs · search · driver · status · sort · row select", async ({
    page,
  }) => {
    await openHotelDecisions(page);

    // Canonical flagship values
    await expect(page.getByText("+€1,840").first()).toBeVisible();
    await expect(page.getByText("81%").first()).toBeVisible();
    await expect(page.getByText(/€180k/)).toHaveCount(0);

    // Needs your judgment tab
    await page.getByRole("tab", { name: /Needs your judgment/i }).click();
    await expect(page.getByText(/Protect VIP arrivals/i)).toBeVisible();
    await expect(page.getByText(/Resolve maintenance blocks/i)).toHaveCount(0);

    // In motion tab
    await page.getByRole("tab", { name: /In motion/i }).click();
    await expect(page.getByText(/Resolve maintenance blocks/i)).toBeVisible();
    await expect(page.getByText(/Reassign 2 housekeepers/i)).toHaveCount(0);

    // Resolved tab
    await page.getByRole("tab", { name: /Resolved/i }).click();
    await expect(page.getByText(/Upgrade high-value arrivals/i)).toBeVisible();

    // Back to all + search
    await page.getByRole("tab", { name: /All Decisions/i }).click();
    const search = page.getByRole("searchbox", {
      name: /Search decisions in ledger/i,
    });
    await search.fill("housekeeping");
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible();
    await expect(page.getByText(/Close OTA discount inventory/i)).toHaveCount(0);

    await search.fill("");
    await page.getByLabel("Driver filter").selectOption("channel");
    await expect(page.getByText(/Close OTA discount inventory/i)).toBeVisible();
    await expect(page.getByText(/Reassign 2 housekeepers/i)).toHaveCount(0);

    await page.getByRole("button", { name: /Reset filters/i }).first().click();
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible();

    // Status filter → resolved only
    await page.getByLabel("Status filter").selectOption("resolved");
    await expect(page.getByText(/OTA mix rebalance/i)).toBeVisible();
    await expect(page.locator(".rd-section[data-tone=judgment]")).toHaveCount(0);

    await page.getByRole("button", { name: /Reset filters/i }).first().click();

    // Row select updates inspector
    await page.getByText(/Protect VIP arrivals/i).first().click();
    await expect(
      page.locator(".rd-inspector").getByRole("heading", {
        name: /Protect VIP arrivals/i,
      }),
    ).toBeVisible();
    await expect(
      page.locator(".rd-inspector .rd-insp-kpi.is-value").getByText("+€720"),
    ).toBeVisible();

    // Sort highest value
    await page.getByLabel("Sort decisions").selectOption("value");
    const firstJudgmentTitle = page
      .locator(".rd-section[data-tone=judgment] .rd-dec-title")
      .first();
    await expect(firstJudgmentTitle).toHaveText(/Reassign 2 housekeepers/i);
  });
});
