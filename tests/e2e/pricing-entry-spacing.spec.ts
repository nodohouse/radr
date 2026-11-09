import { test, expect } from "playwright/test";
for (const width of [390, 820, 1512, 3840])
  test(`pricing context clears fixed navigation at ${width}px`, async ({
    page,
  }) => {
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
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.goto("/en/pricing?from=demo&vertical=hotel");
    const banner = page.locator(".rm-demo-return");
    await expect(banner).toBeVisible();
    const nav = (await page.locator(".rx-nav").boundingBox())!,
      box = (await banner.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(nav.y + nav.height + 12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: test.info().outputPath(`pricing-entry-${width}.png`),
      fullPage: false,
    });
  });
