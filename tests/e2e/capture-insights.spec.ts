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

for (const width of [390, 820, 1101, 1512, 3840]) {
  test(`captured insights at ${width}px stay readable in free corners and match the falling signals`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width,
      height: width === 3840 ? 2160 : width === 390 ? 844 : 1100,
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/en");
    const stage = page.locator(".rsc-scroll-stage");
    await expect(stage).toHaveAttribute("data-ready", "true");
    if (width === 390) {
      const start = await stage.evaluate((n) =>
        Math.max(
          0,
          n.getBoundingClientRect().top + scrollY - innerHeight * 0.3,
        ),
      );
      await page.evaluate((y) => scrollTo(0, y), start + 210);
      await expect(stage).toHaveAttribute("data-face", "back");
    }
    const layer = page.locator(".rsc-capture-layer");
    await expect(layer).toHaveAttribute("aria-hidden", "true");
    await expect(layer).toHaveCSS("pointer-events", "none");
    const slots: string[] = [];
    for (const id of [
      "allergy",
      "service",
      "reservation",
      "supplier",
      "readiness",
      "channel",
    ]) {
      const card = layer.locator(`[data-signal="${id}"]`);
      await expect(card).toHaveCSS("opacity", "1", { timeout: 25000 });
      const tone = await card.getAttribute("data-tone");
      await expect(
        page.locator(`.rvc-signal[data-signal="${id}"]`),
      ).toHaveAttribute("data-tone", tone!);
      const measurement = await card.evaluate((n) => {
        const r = n.getBoundingClientRect();
        const overlap = (b: DOMRect) =>
          r.left < b.right &&
          r.right > b.left &&
          r.top < b.bottom &&
          r.bottom > b.top;
        const stage = n.closest(".rsc-scroll-stage")!;
        const face = stage.getAttribute("data-face");
        const screen = stage
          .querySelector(`.rsc-face-${face} .rsc-screen`)!
          .getBoundingClientRect();
        const protectedNodes = document.querySelectorAll(
          ".rm-hero-copy, .rx-nav, .rm-loop, .rsc-full-demo",
        );
        const svg = stage.querySelector(".rvc-field svg") as SVGSVGElement;
        return {
          clipped:
            n.scrollWidth > n.clientWidth + 1 ||
            n.scrollHeight > n.clientHeight + 1,
          collision:
            overlap(screen) ||
            Array.from(protectedNodes).some((el) =>
              overlap(el.getBoundingClientRect()),
            ),
          inViewport:
            r.left >= 0 &&
            r.top >= 0 &&
            r.right <= innerWidth &&
            r.bottom <= innerHeight,
          time: svg.getCurrentTime(),
          slot: n.getAttribute("data-slot"),
        };
      });
      expect(measurement.clipped).toBe(false);
      expect(measurement.collision).toBe(false);
      expect(measurement.inViewport).toBe(true);
      const captureAt = {
        allergy: 1,
        service: 4,
        reservation: 7,
        supplier: 10,
        readiness: 13,
        channel: 16,
      }[id]!;
      expect((measurement.time - captureAt + 18) % 18).toBeLessThan(1.6);
      slots.push(measurement.slot!);
      if (id === "allergy") {
        await expect(card).toContainText("Shellfish allergy");
        await expect(card).toContainText("Room 310 · Arrival 15:20");
        await page.screenshot({
          path: test.info().outputPath(`caught-${width}.png`),
        });
      }
      if (id === "service")
        await expect(card).toContainText("$620 exposed tonight");
      if (id === "reservation") await expect(card).toContainText("Table 8");
      if (id === "readiness")
        await expect(card).toContainText("Ready target 14:58");
      await expect(card).toHaveCount(0);
    }
    expect(new Set(slots).size).toBeGreaterThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("offscreen catches pause and reduced motion shows one stable guest note", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en");
  await expect(page.locator('[data-signal="allergy"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator(".rsc-capture-layer")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator(".rsc-capture-card")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".rsc-capture-static")).toContainText(
    "Shellfish allergy",
  );
  await expect(page.locator(".rsc-capture-layer")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator(".rsc-capture-card")).toHaveCount(0);
  expect(
    await page
      .locator(".rsc-capture-static")
      .evaluate((n) => n.getAnimations().length),
  ).toBe(0);
});
