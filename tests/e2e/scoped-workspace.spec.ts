import { test, expect } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        roleView: "hotel_gm",
        defaultLocationId: "loc_canal_house",
      }),
    );
    localStorage.setItem(
      "radr.cookie-preferences.v1",
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: false,
        marketing: false,
        savedAt: new Date().toISOString(),
      }),
    );
  });
});

test("hotel Ask answers guest needs from the selected operating snapshot", async ({
  page,
}) => {
  await page.goto("/app");
  await page.locator(".rp-root[data-context-ready=true]").waitFor();
  await expect(page).toHaveTitle("RADR");
  await page.getByRole("button", { name: "Ask RADR", exact: true }).click();
  await page
    .getByLabel("Ask about your operation", { exact: true })
    .fill("Which arrivals have allergies or special requests?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "guest-reported shellfish allergy",
  );
  await expect(page.getByRole("dialog")).not.toContainText("Choose Soho");
});

test("hotel audit uses hotel events and supports filters and an empty search", async ({
  page,
}) => {
  await page.goto("/app/settings?section=audit");
  const panel = page.locator("[data-settings-audit=true]");
  await expect(panel).toContainText("room-release");
  await expect(panel).not.toContainText(/Berlin|seating-pace/);
  await page.getByLabel("Event type", { exact: true }).selectOption("Policy");
  await expect(panel.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("Find an event", { exact: true }).fill("no-such-event");
  await expect(panel).toContainText("No matching events");
});

test("hotel source review has provider-specific steps and keeps unknown quality unmeasured", async ({
  page,
}) => {
  await page.goto("/app/data-health");
  const workbench = page.getByTestId("hotel-evidence-workbench");
  await expect(workbench).toContainText("Unmeasured");
  await workbench.getByLabel("Find a hotel source").fill("payments");
  await expect(workbench.locator(".he-source-list>button")).toHaveCount(1);
  await workbench.locator(".he-source-list>button").click();
  await expect(workbench.locator(".he-inspector h2")).toHaveText("Stripe");
  await workbench
    .getByRole("button", { name: "Improve readiness", exact: true })
    .click();
  await expect(workbench).toContainText("Payment ID");
  await workbench
    .getByRole("button", { name: "Decision evidence", exact: true })
    .click();
  await expect(workbench.locator(".he-decisions a").first()).toHaveAttribute(
    "href",
    /\/app\/decisions\//,
  );
});
