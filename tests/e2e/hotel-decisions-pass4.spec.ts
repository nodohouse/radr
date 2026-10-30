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

test.describe("Hotel Decisions PASS 4 — actions", () => {
  test("approve · progress · request changes · decline", async ({ page }) => {
    await openHotelDecisions(page);

    // Approve with confirmation
    await page.getByRole("button", { name: "Approve Decision" }).click();
    const approveDialog = page.getByRole("dialog", { name: /Approve decision/i });
    await expect(approveDialog).toBeVisible();
    await expect(approveDialog).toContainText(/1,840/);
    await approveDialog.getByRole("button", { name: "Approve", exact: true }).click();

    await expect(
      page.locator(".rd-inspector .rd-status-badge"),
    ).toContainText(/In motion/i);
    await expect(page.locator(".rd-inspector")).toContainText(/0%/);
    await expect(page.locator(".rd-toast")).toContainText(/Approved/i);

    // Advance progress through HK stages
    await page.getByRole("button", { name: "Advance progress" }).click();
    await expect(page.locator(".rd-inspector")).toContainText(/25%/);
    await expect(page.locator(".rd-toast")).toContainText(/notified/i);

    await page.getByRole("button", { name: "Advance progress" }).click();
    await expect(page.locator(".rd-inspector")).toContainText(/50%/);

    // Reset via reload for request-changes / decline on a fresh judgment
    await page.reload({ waitUntil: "networkidle" });
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
      );
    });
    await page.goto("/app/decisions?decision=dec_hotel_readiness_canal", {
      waitUntil: "networkidle",
    });
    await expect(page.getByText(/Reassign 2 housekeepers/i).first()).toBeVisible();

    // Request changes · staffing 1 preview
    await page.getByRole("button", { name: /Request changes/i }).click();
    await expect(
      page.getByRole("dialog", { name: /Request changes/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: "1", exact: true }).click();
    await expect(page.locator(".rd-staffing-preview")).toContainText("33 / 42");
    await expect(page.locator(".rd-staffing-preview")).toContainText("€820");
    await page.getByRole("button", { name: /Apply changes/i }).click();
    await expect(page.locator(".rd-toast")).toContainText(/Changes applied/i);

    // Decline VIP
    await page.getByText(/Protect VIP arrivals/i).first().click();
    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Decline Decision/i }).click();
    await expect(
      page.getByRole("dialog", { name: /Decline decision/i }),
    ).toBeVisible();
    await page.getByLabel("Decline reason").selectOption("staff");
    await page.getByRole("button", { name: "Decline Decision" }).click();
    await expect(page.locator(".rd-toast")).toContainText(/Declined/i);
    await expect(page.getByText(/Protect VIP arrivals/i)).toHaveCount(0);
  });
});
