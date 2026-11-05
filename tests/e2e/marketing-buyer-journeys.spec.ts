import { test, expect, type Page } from "playwright/test";
import {
  emptyJourney,
  calculateValueMap,
  type JourneyState,
} from "../../lib/marketing/value-calculator/journey";
import { formatMoneyIntl } from "../../lib/marketing/value-calculator/ranges";

// Ten fictional task-based prospects. Automated usability checks, not real customer research.
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
const prospects = [
  {
    role: "Independent restaurant owner",
    vertical: "restaurant",
    locations: "1",
    revenue: "u2",
    currency: "USD",
    width: 1512,
  },
  {
    role: "Hotel general manager",
    vertical: "hotel",
    locations: "1",
    revenue: "5_10",
    currency: "EUR",
    width: 1920,
  },
  {
    role: "Restaurant group CFO",
    vertical: "restaurant",
    locations: "11_20",
    revenue: "25_50",
    currency: "GBP",
    width: 3840,
  },
  {
    role: "Mixed group COO",
    vertical: "mixed",
    locations: "21_50",
    revenue: "100_250",
    currency: "USD",
    width: 1512,
  },
  {
    role: "Resort operations director",
    vertical: "other",
    other: "resort",
    locations: "2_3",
    revenue: "10_25",
    currency: "AED",
    width: 820,
  },
  {
    role: "Chef and owner",
    vertical: "restaurant",
    locations: "2_3",
    revenue: "2_5",
    currency: "EUR",
    width: 390,
  },
  {
    role: "Hotel revenue manager",
    vertical: "hotel",
    locations: "6_10",
    revenue: "25_50",
    currency: "USD",
    width: 1512,
  },
  {
    role: "Serviced apartment operator",
    vertical: "other",
    other: "apartments",
    locations: "4_5",
    revenue: "5_10",
    currency: "GBP",
    width: 820,
  },
  {
    role: "Multi-venue procurement lead",
    vertical: "mixed",
    locations: "51_100",
    revenue: "250_500",
    currency: "SGD",
    width: 1920,
  },
  {
    role: "Bar group finance director",
    vertical: "other",
    other: "bar",
    locations: "6_10",
    revenue: "10_25",
    currency: "AUD",
    width: 430,
  },
] as const;
test.setTimeout(240000);
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
async function visit(page: Page, path: string) {
  const response = await page.goto(base + "/en" + path);
  expect(response?.status(), path).toBeLessThan(400);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    "overflow " + path,
  ).toBe(false);
}
for (const [index, prospect] of prospects.entries())
  test(`${index + 1}. ${prospect.role}: explore, calculate, compare, read`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) =>
      errors.push(`${page.url()}: ${e.stack || e.message}`),
    );
    await page.setViewportSize({
      width: prospect.width,
      height: prospect.width === 3840 ? 2160 : 1000,
    });
    await visit(page, "");
    await expect(page.locator(".rm-research-grid article")).toHaveCount(3);
    await page.locator(".rm-research").scrollIntoViewIfNeeded();
    await expect(page.locator(".rm-research-track")).toHaveCSS(
      "animation-name",
      "none",
    );
    if (index === 2)
      await page.screenshot({
        path: testInfo.outputPath("homepage-4k.png"),
        fullPage: true,
      });
    await visit(page, "/product");
    const surfaces = page
      .getByRole("tablist", { name: "Explore the product surfaces" })
      .getByRole("tab");
    await surfaces.nth(index).click();
    await expect(surfaces.nth(index)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#surface-preview")).toBeVisible();
    await visit(page, "/solutions");
    const problems = page
      .getByRole("tablist", { name: "Explore economic problems" })
      .getByRole("tab");
    await problems.nth(index % 5).click();
    await expect(problems.nth(index % 5)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await visit(page, "/value-calculator");
    await page
      .getByRole("button", { name: "Build my Value Map", exact: true })
      .click();
    if (index === 0) {
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(
        page.getByText("Choose one to continue.", { exact: true }),
      ).toBeVisible();
    }
    const labels = {
      restaurant: "Restaurant / restaurant group",
      hotel: "Hotel / hotel group",
      mixed: "Mixed hospitality group",
      other: "Other hospitality operation",
    };
    await page
      .getByRole("button", { name: labels[prospect.vertical], exact: true })
      .click();
    if ("other" in prospect)
      await page
        .getByRole("button", {
          name:
            prospect.other === "resort"
              ? "Resort"
              : prospect.other === "bar"
                ? "Bar / club"
                : "Serviced apartments",
          exact: true,
        })
        .click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    if (index === 0) {
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(
        page.getByText("Choose scale and revenue to continue.", {
          exact: true,
        }),
      ).toBeVisible();
    }
    await page
      .getByLabel("Number of locations / properties")
      .selectOption(prospect.locations);
    await page
      .getByLabel("Annual revenue", { exact: true })
      .selectOption(prospect.revenue);
    await page
      .getByLabel("Currency", { exact: true })
      .selectOption(prospect.currency);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const labor = index % 2 === 0 ? "30_34" : "35_39";
    await page.getByLabel("Labor cost %", { exact: true }).selectOption(labor);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const selections: Record<string, string> = {};
    for (const label of [
      "System fragmentation",
      "Performance review",
      "Manual reconciliation",
    ]) {
      const select = page.getByLabel(label, { exact: true });
      const options = await select
        .locator("option")
        .evaluateAll((nodes) =>
          nodes.map((n) => (n as HTMLOptionElement).value).filter(Boolean),
        );
      const value = options[index % options.length];
      await select.selectOption(value);
      selections[label] = value;
    }
    await page
      .getByRole("button", { name: "Build Value Map", exact: true })
      .click();
    await expect(page.locator(".vc-res-tri")).toBeVisible({ timeout: 30000 });
    const journey: JourneyState = {
      ...emptyJourney(),
      vertical: prospect.vertical,
      otherKind: "other" in prospect ? prospect.other : null,
      locationsId: prospect.locations,
      revenueId: prospect.revenue,
      currency: prospect.currency,
      laborId: labor,
      systemsId: selections["System fragmentation"],
      reconcileId: selections["Performance review"],
      manualId: selections["Manual reconciliation"],
    };
    const result = calculateValueMap(journey)!;
    await expect(page.locator(".vc-res-tri")).toContainText(
      formatMoneyIntl(result.total.modeled, prospect.currency),
    );
    await expect(page.locator(".vc-res-value")).toContainText("per year");
    await expect(page.locator("main")).toContainText(/modeled/i);
    await testInfo.attach("modeled-calculation", {
      body: JSON.stringify(
        {
          prospect,
          journey,
          expected: result.total,
          actual: await page.locator(".vc-res-tri").innerText(),
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
    await visit(page, "/pricing");
    await expect(page.locator(".rm-plan-card")).toHaveCount(3);
    await expect(page.locator(".rm-compare-table tbody tr")).toHaveCount(5);
    await page
      .locator("summary")
      .filter({ hasText: "How much does RADR cost?" })
      .click();
    await expect(
      page.getByText(/There is no published monthly rate today/),
    ).toBeVisible();
    await page
      .locator(".rm-plan-card a")
      .nth(index % 3)
      .click();
    await expect(page).toHaveURL(/intent=sales&plan=/);
    await visit(page, "/company");
    await expect(page.locator("main")).toContainText("RADR");
    const article = [
      "restaurant-profitability-beyond-revenue",
      "hotel-distribution-contribution",
      "kitchen-waste-measured-value",
    ][index % 3];
    await visit(page, "/blog/" + article);
    await expect(page.locator(".rr-evidence-sources a")).toHaveCount(2);
    await expect(page.locator(".rr-evidence-model")).toContainText(
      /Illustrative assumptions/,
    );
    if (index === 5)
      await page.screenshot({
        path: testInfo.outputPath("article-mobile.png"),
        fullPage: true,
      });
    await visit(page, "/resources/hospitality-decision-playbook");
    await expect(page.locator("form")).toBeVisible();
    expect(errors).toEqual([]);
  });
