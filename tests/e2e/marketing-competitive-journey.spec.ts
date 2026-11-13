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
  await page
    .locator(".rx-nav")
    .getByRole("link", { name: "Platform", exact: true })
    .hover();
  await page.locator('.rx-nav-panel a[href*="surface=connections"]').click();
  await expect(page.locator(".ps-teaser-frame")).toHaveAttribute(
    "data-surface",
    "connections",
  );
  await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page
    .locator(".rx-nav")
    .getByRole("link", { name: "Solutions", exact: true })
    .hover();
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
  ).toHaveText("Expand");
  await expect(page.locator(".rm-plan-highlights")).toHaveCount(3);
  await expect(page.locator(".rm-compare-table tbody tr")).toHaveCount(10);
  await expect(
    page.locator(".rm-plan-card").first().getByRole("link"),
  ).toHaveAttribute("href", /checkout/);
});

test("standard packages publish annual commitment prices and keep setup self-guided", async ({
  page,
}) => {
  await page.goto("/en/pricing");
  await expect(page.locator("main")).not.toContainText(/free trial|14.day/i);
  await expect(page.locator(".rm-plan-card h3")).toHaveText([
    "Core",
    "Expand",
    "Enterprise",
  ]);
  await expect(page.locator(".rm-price-quote")).toContainText(
    "Guided setup, without a setup fee",
  );
  await expect(page.locator(".rm-price-quote")).toContainText(
    "Usage allowances confirmed before purchase",
  );
  await expect(page.locator(".rm-plan-price strong")).toHaveText([
    "€249",
    "From €398",
    "Contact sales",
  ]);
  await expect(page.locator(".rm-availability")).toContainText(
    "Two ways to pay. One 12-month commitment.",
  );
  await expect(
    page.locator(
      ".rm-price-hero a[href*='contact'],.rm-plan-card a[href*='contact']",
    ),
  ).toHaveCount(1);
  const demo = page.locator(".rm-price-hero").getByRole("link", {
    name: "Explore the free demo",
  });
  await expect(demo).toHaveAttribute("href", "/en/demo");
  for (const [index, id] of ["start", "expand"].entries()) {
    await expect(
      page.locator(".rm-plan-card").nth(index).getByRole("link"),
    ).toHaveAttribute(
      "href",
      `/en/checkout?plan=${id}&billing=annual&locations=${id === "start" ? 1 : 2}`,
    );
  }
  for (const [question, answer] of [
    [
      "How do yearly and monthly payments compare?",
      "Monthly instalments do not mean a cancel-anytime monthly contract",
    ],
    ["Is there a separate setup fee?", "included in Core and Expand"],
    [
      "Do I need a sales call or an onboarding specialist?",
      "Your team owns its data and reviews proposed actions",
    ],
    [
      "Do you take a percentage of our savings?",
      "No percentage of modeled or expected savings",
    ],
  ]) {
    const detail = page.locator("details").filter({
      has: page.locator("summary", { hasText: question }),
    });
    await detail.locator("summary").click();
    await expect(detail.locator("p")).toBeVisible();
    await expect(detail.locator("p")).toContainText(answer);
  }
  await demo.click();
  await expect(page).toHaveURL(/\/en\/demo$/);
  await page.getByRole("button", { name: "Hotel group", exact: true }).click();
  await expect(page).toHaveURL(/signup\?intent=demo/);
  await expect(page.locator(".ob-registration-plan")).toHaveCount(0);
  await expect(
    page.getByLabel("Choose your demo", { exact: true }),
  ).toHaveValue("hotel");
});
