import { test, expect } from "playwright/test";

function consent() {
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
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(consent);
});
for (const width of [1512, 3840]) {
  test(`falling signals at ${width}px remain visible and never cross popup text through a full cycle`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.goto("/en");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".rvc-field")).toHaveAttribute(
      "data-sized",
      "true",
    );
    const result = await page.evaluate(async () => {
      const start = performance.now();
      const sources = new Set<string>();
      const errors: string[] = [];
      let frames = 0,
        visibleFrames = 0,
        cards = 0;
      const overlaps = (a: DOMRect, b: DOMRect) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      while (performance.now() - start < 18500) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const popups = Array.from(
          document.querySelectorAll<HTMLElement>(".rsc-capture-card"),
        ).filter((n) => Number(getComputedStyle(n).opacity) > 0.12);
        if (popups.length) cards++;
        let visible = false;
        const rectangles: DOMRect[] = [];
        for (const label of document.querySelectorAll<SVGGElement>(
          ".rvc-label",
        )) {
          const opacity =
            Number(getComputedStyle(label.closest(".rvc-clearance")!).opacity) *
            Number(
              getComputedStyle(label.querySelector(".rvc-value")!).opacity,
            );
          if (opacity < 0.16) continue;
          const rect = label.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          visible = true;
          sources.add(label.closest(".rvc-signal")!.getAttribute("data-tone")!);
          if (
            rect.left < 12 ||
            rect.right > innerWidth - 12 ||
            rect.top < 0 ||
            rect.bottom > innerHeight
          )
            errors.push("clipped signal");
          if (
            popups.some((popup) =>
              overlaps(rect, popup.getBoundingClientRect()),
            )
          )
            errors.push("signal crosses popup");
          if (rectangles.some((other) => overlaps(rect, other)))
            errors.push("signals overlap");
          rectangles.push(rect);
        }
        frames++;
        if (visible) visibleFrames++;
        if (errors.length > 20) break;
      }
      return {
        errors,
        sources: [...sources],
        visibleFraction: visibleFrames / frames,
        cards,
        frames,
      };
    });
    expect(result.errors).toEqual([]);
    expect(result.cards).toBeGreaterThan(5);
    expect(result.sources.length).toBeGreaterThanOrEqual(3);
    expect(result.visibleFraction).toBeGreaterThan(width === 3840 ? 0.6 : 0.4);
    await page.screenshot({
      path: test.info().outputPath(`clarity-${width}.png`),
    });
  });
}

test("a 1920px display at double pixel density keeps crisp, proportional vector lettering", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.addInitScript(consent);
  await page.goto("/en");
  await expect(page.locator(".rvc-field")).toHaveAttribute(
    "data-sized",
    "true",
  );
  const result = await page
    .locator(".rvc-amount")
    .first()
    .evaluate((node) => {
      const matrix = (node as SVGGraphicsElement).getScreenCTM()!;
      return {
        ratio: Math.hypot(matrix.a, matrix.b) / Math.hypot(matrix.c, matrix.d),
        pixelRatio: devicePixelRatio,
        font:
          parseFloat(getComputedStyle(node).fontSize) *
          Math.hypot(matrix.a, matrix.b),
      };
    });
  expect(result.pixelRatio).toBe(2);
  expect(result.ratio).toBeCloseTo(1, 2);
  expect(result.font).toBeGreaterThan(22);
  await page.screenshot({ path: test.info().outputPath("retina-4k.png") });
  await context.close();
});
