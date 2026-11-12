import { test, expect } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    localStorage.setItem(
      "radr.cookie-preferences.v1",
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: false,
        marketing: false,
        savedAt: new Date().toISOString(),
      }),
    ),
  );
});

test("every Platform deep link shows the requested passive preview", async ({
  page,
}) => {
  for (const surface of [
    "control",
    "live",
    "decisions",
    "operations",
    "house",
    "intelligence",
    "value",
    "memory",
    "health",
    "connections",
  ]) {
    await page.goto(`/en/product?surface=${surface}#surfaces`);
    await expect(page.locator(".ps-teaser-frame")).toHaveAttribute(
      "data-surface",
      surface,
    );
    await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await expect(
      page.locator("#surfaces button,#surfaces select,#surfaces canvas"),
    ).toHaveCount(0);
    await expect(page.locator(".ps-teaser-cta")).toHaveAttribute(
      "href",
      "/en/demo",
    );
  }
});

test("desktop menu changes an existing Platform preview and routes a solution to its context", async ({
  page,
}) => {
  await page.goto("/en/product?surface=health#surfaces");
  await expect(page.locator(".ps-teaser-frame")).toHaveAttribute(
    "data-surface",
    "health",
  );
  await expect(page.locator(".rx-nav")).toHaveAttribute("data-ready", "true");
  await page.locator(".rx-nav").getByRole("link", { name: "Platform", exact: true }).hover();
  await page.locator('.rx-nav-panel a[href*="surface=connections"]').click();
  await expect(page.locator(".ps-teaser-frame")).toHaveAttribute(
    "data-surface",
    "connections",
  );
  await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.locator(".rx-nav").getByRole("link", { name: "Solutions", exact: true }).hover();
  await page.locator('.rx-nav-panel a[href*="leak=recon"]').first().click();
  await expect(
    page.locator('.rx30-leak-nav button[data-on="true"]'),
  ).toContainText("Reconciliation");
  await expect(page).toHaveURL(/leak=recon#value-leaks/);
});

test("homepage entry, hotel context and pricing scope remain clear", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(
    page
      .locator(".rm-hero-copy")
      .getByRole("link", { name: "Explore the demo", exact: false }),
  ).toHaveAttribute("href", "/en/demo");
  await expect(page.locator(".rm-home-hotel")).toContainText("Demo property");
  await page.locator(".rm-home-hotel a").click();
  await expect(page.locator(".ps-teaser-frame")).toHaveAttribute(
    "data-surface",
    "live",
  );
  await page.goto("/en/pricing");
  await expect(
    page.locator('.rm-plan-card[data-featured="true"] h3'),
  ).toHaveText("14-day free trial");
  await expect(page.locator(".rm-plan-highlights")).toHaveCount(3);
  await expect(page.locator(".rm-compare-table tbody tr")).toHaveCount(10);
  await expect(
    page.locator(".rm-plan-card").first().getByRole("link"),
  ).toHaveAttribute("href", /signup/);
});
