import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
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
for (const [width, height] of [
  [390, 844],
  [820, 1180],
  [1366, 768],
  [1512, 982],
  [3840, 2160],
] as const) {
  test(`pricing inclusions are visible without interaction at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/en/pricing");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    const navBottom = await page
      .locator(".rx-nav")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    const titleTop = await page
      .locator("#pricing-title")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThan(navBottom);
    const heads = await page.locator(".rm-plan-top h3").evaluateAll((nodes) =>
      nodes.map((el) => ({
        text: el.textContent,
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
      })),
    );
    expect(heads.map((h) => h.text)).toEqual(["Core", "Expand", "Portfolio"]);
    for (const h of width > 760 ? heads : heads.slice(0, 1)) {
      expect(h.top).toBeGreaterThan(navBottom);
      expect(h.bottom).toBeLessThan(height);
    }
    await expect(page.locator(".rm-plan-card details")).toHaveCount(0);
    for (const card of await page.locator(".rm-plan-card").all()) {
      await expect(card.locator(".rm-plan-inclusions-label")).toHaveText(
        "What’s included",
      );
      await expect(card.locator(".rm-plan-highlights li")).toHaveCount(3);
      for (const item of await card.locator(".rm-plan-highlights li").all()) {
        await expect(item).toBeVisible();
      }
    }
    if (width >= 1100) {
      const bottoms = await page
        .locator(".rm-plan-card > a")
        .evaluateAll((nodes) =>
          nodes.map((el) => el.getBoundingClientRect().bottom),
        );
      for (const bottom of bottoms) expect(bottom).toBeLessThan(height);
      expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(2);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    await page.screenshot({
      path: test.info().outputPath(`pricing-first-screen-${width}.png`),
    });
    if ([390, 1512].includes(width)) {
      const scan = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
test("all package inclusions are permanently displayed with their plan actions", async ({
  page,
}) => {
  await page.goto("/en/pricing");
  for (const [i, name] of ["Core", "Expand", "Portfolio"].entries()) {
    const card = page.locator(".rm-plan-card").nth(i);
    await expect(card.locator("summary, details")).toHaveCount(0);
    await expect(card.locator(".rm-plan-highlights li")).toHaveCount(3);
    await expect(card.locator(".rm-plan-highlights")).toBeVisible();
    await expect(
      card.getByRole("link", { name: `Preview ${name}` }),
    ).toHaveAttribute("href", /signup\?intent=workspace&plan=/);
    await expect(card.locator(".rm-plan-audience")).toBeVisible();
  }
  await expect(page.locator(".rm-compare-table tbody tr")).toHaveCount(10);
});
test("supporting tools open on demand and preserve their purpose", async ({
  page,
}) => {
  await page.goto("/en/pricing");
  await expect(page.locator(".br-plan-fit")).toBeHidden();
  await expect(page.locator(".rm-price-quote")).toBeHidden();
  await page.locator(".rm-price-tool-fit > summary").click();
  await page.getByLabel("Number of operating locations").fill("4");
  await expect(page.locator(".br-plan-fit-answer")).toContainText(
    "Expand fits 4 locations",
  );
  await page.locator(".br-plan-fit-answer a").click();
  await expect(page).toHaveURL(/#plan-expand$/);
  await page.locator(".rm-price-tool-setup > summary").click();
  await expect(page.locator(".rm-price-quote")).toBeVisible();
  await expect(page.locator(".rm-price-quote h2")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await page
    .locator(".rm-price-hero")
    .getByRole("link", { name: "Compare all features" })
    .click();
  await expect(page).toHaveURL(/#compare$/);
  await expect(page.locator(".rm-compare-table")).toBeVisible();
  const scan = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

test("clicking Pricing from a scrolled page lands directly on the packages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/en/company");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page
    .locator(".rx-nav")
    .getByRole("link", { name: "Pricing", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/pricing$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  const bottoms = await page
    .locator(".rm-plan-card > a")
    .evaluateAll((nodes) =>
      nodes.map((el) => el.getBoundingClientRect().bottom),
    );
  expect(bottoms).toHaveLength(3);
  for (const bottom of bottoms) expect(bottom).toBeLessThan(768);
});
