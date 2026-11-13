import { expect, test } from "playwright/test";

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
test("ambient radar rotates behind the tablet without taking over scrolling or clicks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [390, 820, 1512, 3840]) {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.goto("/en");
    await page.locator(".rsc-scroll-stage").scrollIntoViewIfNeeded();
    const field = page.locator(".rvc-field");
    await expect(field).toHaveAttribute("data-running", "true");
    const beam = page.locator(".rvc-radar-sweep");
    await expect(beam).toBeVisible();
    const before = await beam.evaluate(
      (el) => (el as SVGGraphicsElement).getCTM()!.a,
    );
    await expect
      .poll(async () =>
        Math.abs(
          (await beam.evaluate(
            (el) => (el as SVGGraphicsElement).getCTM()!.a,
          )) - before,
        ),
      )
      .toBeGreaterThan(0.02);
    await expect(field).toHaveCSS("pointer-events", "none");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    await page
      .locator('.rm-hero-copy a[href$="/demo"]')
      .scrollIntoViewIfNeeded();
    const hits = await page
      .locator('.rm-hero-copy a[href$="/demo"]')
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return hit === el || el.contains(hit);
      });
    expect(hits).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`radar-${width}.png`),
    });
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect(field).toHaveAttribute("data-running", "false");
    await expect
      .poll(() =>
        field
          .locator("svg")
          .evaluate((el: SVGSVGElement) => el.animationsPaused()),
      )
      .toBe(true);
    const frozen = await beam.evaluate(
      (el) => (el as SVGGraphicsElement).getCTM()!.a,
    );
    await page.waitForTimeout(250);
    expect(
      await beam.evaluate((el) => (el as SVGGraphicsElement).getCTM()!.a),
    ).toBeCloseTo(frozen, 4);
  }
  expect(errors).toEqual([]);
});
test("reduced motion retains quiet rings without a moving beam or playback controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".rvc-radar-grid")).toBeVisible();
  await expect(page.locator(".rvc-radar-sweep")).toBeHidden();
  await expect(page.locator(".rvc-field")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(
    page.getByRole("button", { name: /play animation|pause animation/i }),
  ).toHaveCount(0);
});
