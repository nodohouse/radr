import { test, expect } from "playwright/test";

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
for (const width of [390, 820, 1512, 3840])
  test(`value capture at ${width}px stays behind the tablet and pauses off-screen`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/en");
    const stage = page.locator(".rsc-scroll-stage");
    await expect(stage).toHaveAttribute("data-ready", "true");
    const field = page.locator(".rvc-field");
    await stage.scrollIntoViewIfNeeded();
    await expect(field).toHaveAttribute("data-running", "true");
    await expect(field).toHaveAttribute("aria-hidden", "true");
    await expect(field).toHaveCSS("pointer-events", "none");
    const svg = field.locator("svg");
    const before = await svg.evaluate((el: SVGSVGElement) =>
      el.getCurrentTime(),
    );
    await expect
      .poll(() => svg.evaluate((el: SVGSVGElement) => el.getCurrentTime()))
      .toBeGreaterThan(before + 0.1);
    const physicalFont = await field
      .locator(".rvc-amount:visible")
      .first()
      .evaluate(
        (el) =>
          parseFloat(getComputedStyle(el).fontSize) *
          (el as SVGGraphicsElement).getScreenCTM()!.a,
      );
    expect(physicalFont).toBeGreaterThan(15);
    expect(physicalFont).toBeLessThan(26);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await stage.screenshot({
      path: test.info().outputPath(`capture-${width}.png`),
    });
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect(field).toHaveAttribute("data-running", "false");
    await expect
      .poll(() => svg.evaluate((el: SVGSVGElement) => el.animationsPaused()))
      .toBe(true);
    const paused = await svg.evaluate((el: SVGSVGElement) =>
      el.getCurrentTime(),
    );
    await page.waitForTimeout(250);
    expect(
      await svg.evaluate((el: SVGSVGElement) => el.getCurrentTime()),
    ).toBeCloseTo(paused, 1);
    expect(errors).toEqual([]);
  });
test("reduced motion keeps the field still and hides falling amounts", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  const field = page.locator(".rvc-field");
  await expect(field).toHaveAttribute("data-reduced", "true");
  await expect(field.locator(".rvc-signals")).toHaveCSS("display", "none");
  await expect
    .poll(() =>
      field
        .locator("svg")
        .evaluate((el: SVGSVGElement) => el.animationsPaused()),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: /play animation|pause animation/i }),
  ).toHaveCount(0);
});

test("jade capture coincides with each value reaching the interception point", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en");
  const stage = page.locator(".rsc-scroll-stage");
  await expect(stage).toHaveAttribute("data-ready", "true");
  const results = await page
    .locator(".rvc-field svg")
    .evaluate(async (node: SVGSVGElement) => {
      node.pauseAnimations();
      const rows = [];
      for (const signal of node.querySelectorAll(".rvc-signal")) {
        const motion = signal.querySelector("animateMotion")!;
        const duration = parseFloat(motion.getAttribute("dur")!);
        const begin = parseFloat(motion.getAttribute("begin")!);
        let time = duration * 0.64 + begin;
        if (time < 0) time += duration;
        node.setCurrentTime(time);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const path = motion.getAttribute("path")!;
        const match = path.match(/L ([\d.]+) ([\d.]+)/)!;
        const matrix = node
          .getScreenCTM()!
          .inverse()
          .multiply(
            (
              motion.parentElement as unknown as SVGGraphicsElement
            ).getScreenCTM()!,
          );
        rows.push({
          xError: Math.abs(matrix.e - Number(match[1])),
          yError: Math.abs(matrix.f - Number(match[2])),
        });
      }
      node.unpauseAnimations();
      return rows;
    });
  expect(results).toHaveLength(6);
  for (const result of results) {
    expect(result.xError).toBeLessThan(1);
    expect(result.yError).toBeLessThan(1);
  }
});

test("falling values never touch hero copy through a complete desktop cycle", async ({
  page,
}) => {
  for (const width of [1101, 1280, 1366, 1512]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en");
    await expect(page.locator(".rvc-field")).toHaveAttribute(
      "data-running",
      "true",
    );
    await page.evaluate(() => document.fonts.ready);
    const overlaps = await page.evaluate(async () => {
      const svg = document.querySelector<SVGSVGElement>(".rvc-field svg")!;
      svg.pauseAnimations();
      const walker = document.createTreeWalker(
        document.querySelector(".rm-hero-copy")!,
        NodeFilter.SHOW_TEXT,
      );
      const rectangles: DOMRect[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        rectangles.push(...range.getClientRects());
      }
      const collisions: string[] = [];
      for (let time = 0; time < 8; time += 0.25) {
        svg.setCurrentTime(time);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        for (const el of document.querySelectorAll(".rvc-amount")) {
          if (
            +getComputedStyle(el.parentElement!).opacity < 0.25 ||
            getComputedStyle(el).display === "none"
          )
            continue;
          const a = el.getBoundingClientRect();
          if (
            rectangles.some(
              (b) =>
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2,
            )
          )
            collisions.push(el.textContent || "value");
        }
      }
      svg.unpauseAnimations();
      return collisions;
    });
    expect(overlaps, `hero copy at ${width}px`).toEqual([]);
  }
});
