import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
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
    (window as Window & { dataLayer: unknown[] }).dataLayer = [];
  });
});
for (const vertical of ["restaurant", "hotel", "mixed"] as const) {
  for (const width of [390, 820, 1512, 3840]) {
    test(`${vertical} decision story at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto("/en/value-calculator");
      await page
        .getByRole("button", {
          name:
            vertical === "mixed"
              ? "Mixed hospitality"
              : `Global ${vertical} group`,
          exact: true,
        })
        .click();
      await expect(page.locator(".vc4-bridge")).toBeVisible();
      await expect(page.getByTestId("lens-chart")).toBeVisible();
      await expect(page.locator(".vc4-next")).toContainText("Get the playbook");
      const labor = page
        .getByRole("group", { name: "Explore economic lenses" })
        .getByRole("button", { name: /LABOR/ });
      await labor.click();
      await expect(page.locator(".vc3-category-detail")).toHaveAttribute(
        "data-category",
        "labor",
      );
      await expect(labor).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".vc4-decision-example")).toContainText(
        vertical === "hotel" ? "housekeeping" : "kitchen and service",
      );
      const annual = await labor.innerText();
      await page.getByRole("button", { name: "Monthly", exact: true }).click();
      expect(await labor.innerText()).not.toEqual(annual);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
      expect(
        await page.evaluate(
          () => (window as Window & { dataLayer: unknown[] }).dataLayer,
        ),
      ).toEqual([]);
      await page.locator(".vc4-path--book img").scrollIntoViewIfNeeded();
      await expect(page.locator(".vc4-path--book img")).toHaveJSProperty(
        "complete",
        true,
      );
      if (width === 390 || width === 1512) {
        const scan = await new AxeBuilder({ page })
          .include(".vc3-result")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
      }
      await page.screenshot({
        path: `/tmp/radr-calculator-story-20261112/${vertical}-${width}.png`,
        fullPage: true,
      });
    });
  }
}
test("hotel results preserve context through registration, with no financial data in the URL", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  await page
    .locator(".vc4-bridge")
    .getByRole("link", { name: "Explore the hotel demo" })
    .click();
  await expect(page).toHaveURL(/\/en\/signup\?intent=demo&next=/);
  const url = new URL(page.url());
  expect(url.searchParams.get("next")).toBe("/app/enter?vertical=hotel&go=1");
  await expect(page.locator("main")).toContainText(/hotel/i);
  expect([...url.searchParams.keys()].sort()).toEqual(["intent", "next"]);
});
test("result asset and package paths land on their intended pages", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global restaurant group", exact: true })
    .click();
  await page
    .locator(".vc4-next")
    .getByRole("link", { name: "Get the playbook" })
    .click();
  await expect(page).toHaveURL(/hospitality-decision-playbook#request-report/);
  await expect(page.locator("#request-report")).toBeVisible();
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Mixed hospitality", exact: true })
    .click();
  await page
    .locator(".vc4-next")
    .getByRole("link", { name: "Compare packages" })
    .click();
  await expect(page).toHaveURL(/\/en\/pricing/);
  await expect(page.locator("main")).toContainText("Portfolio");
});

test("next-step measurement requires consent and never contains financial inputs", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  const link = page.locator(".vc4-bridge a");
  await link.evaluate((el) =>
    el.addEventListener("click", (event) => event.preventDefault()),
  );
  await link.click();
  expect(
    await page.evaluate(
      () => (window as Window & { dataLayer: unknown[] }).dataLayer,
    ),
  ).toEqual([]);
  await page.evaluate(() =>
    localStorage.setItem(
      "radr.cookie-preferences.v1",
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: true,
        marketing: false,
        savedAt: new Date().toISOString(),
      }),
    ),
  );
  await link.click();
  expect(
    await page.evaluate(
      () => (window as Window & { dataLayer: unknown[] }).dataLayer,
    ),
  ).toEqual([
    { event: "calculator_next_step", destination: "demo", placement: "brief" },
  ]);
});
