import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
test.beforeEach(async ({ page }) => {
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
test("homepage closing feature exposes real practical tools and the gated request page", async ({
  page,
}) => {
  await page.goto(base + "/en");
  const section = page.locator("#hospitality-playbook");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toContainText("An evidence scorecard");
  await expect(section).toContainText("A worksheet you can use tomorrow");
  await expect(section).toContainText("Your first 30 days");
  await expect(section).toContainText("16 pages");
  await expect(section.locator("img")).toHaveCount(3);
  await expect(section.locator("a.rm-button")).toHaveAttribute(
    "href",
    "/en/resources/hospitality-decision-playbook",
  );
  await section.locator("a.rm-button").click();
  await expect(page.locator("h1")).toContainText("Decision Playbook");
  await expect(page.locator("#request-report")).toBeAttached();
  expect(
    (await page.request.get(base + "/api/reports/download")).status(),
  ).toBe(403);
});
test("book opens and turns, pauses on request and stops when offscreen without layout jumps", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "/en");
  const figure = page.locator(".rpb-figure");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-running", "true");
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const first = await page
    .locator(".rpb-cover")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(1800);
  const second = await page
    .locator(".rpb-cover")
    .evaluate((e) => getComputedStyle(e).transform);
  expect(first).not.toBe(second);
  await figure.getByRole("button", { name: "Pause book animation" }).click();
  await expect(figure).toHaveAttribute("data-running", "false");
  const paused = await page
    .locator(".rpb-cover")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(400);
  expect(
    await page
      .locator(".rpb-cover")
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe(paused);
  await figure.getByRole("button", { name: "Resume book animation" }).click();
  await expect(figure).toHaveAttribute("data-running", "true");
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    height,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await expect(figure).toHaveAttribute("data-running", "false");
});
test("reduced motion keeps an open static spread, with actual pages loaded", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "/en");
  const figure = page.locator(".rpb-figure");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-running", "false");
  expect(
    await page
      .locator(".rpb-cover")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  await expect(figure.getByRole("button")).toHaveCount(0);
  await expect
    .poll(() =>
      figure
        .locator("img")
        .evaluateAll((es) =>
          es.every(
            (e) =>
              (e as HTMLImageElement).complete &&
              (e as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
});
test("phone feature stays readable and report book points to its own form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/en");
  await page.locator("#hospitality-playbook").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await page.goto(base + "/en/resources/hospitality-decision-playbook");
  await page.locator(".rpb-stage").click();
  await expect(page.locator("#request-report")).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
});
test("fully open pages remain inside the book stage on desktop and phone", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 982 });
    await page.goto(base + "/en");
    const figure = page.locator(".rpb-figure");
    await expect(figure).toHaveAttribute("data-ready", "true");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveAttribute("data-running", "true");
    await figure.evaluate((e) =>
      e.getAnimations({ subtree: true }).forEach((a) => {
        a.pause();
        a.currentTime = 5000;
      }),
    );
    const stage = await figure.locator(".rpb-stage").boundingBox();
    for (const selector of [".rpb-cover-inside", ".rpb-worksheet"]) {
      const leaf = await figure.locator(selector).boundingBox();
      expect(leaf!.x).toBeGreaterThanOrEqual(stage!.x);
      expect(leaf!.y).toBeGreaterThanOrEqual(stage!.y);
      expect(leaf!.x + leaf!.width).toBeLessThanOrEqual(
        stage!.x + stage!.width,
      );
      expect(leaf!.y + leaf!.height).toBeLessThanOrEqual(
        stage!.y + stage!.height,
      );
    }
  }
});
