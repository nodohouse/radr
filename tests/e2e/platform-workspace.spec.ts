import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
for (const width of [390, 820, 1512, 3840]) {
  test(`compact passive sneak peek at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/en/product#surfaces");
    const section = page.locator("#surfaces");
    await expect(
      section.locator(
        "button, select, input, form, canvas, [role=tab], [role=tablist], [tabindex]",
      ),
    ).toHaveCount(0);
    await expect(section.getByRole("link")).toHaveCount(1);
    await expect(section.getByRole("link")).toHaveText("Explore the demo");
    await expect(section.locator(".ps-teaser-media")).toHaveAttribute(
      "data-ready",
      "true",
    );
    const figure = section.locator("figure");
    const box = (await figure.boundingBox())!;
    expect(box.height).toBeLessThan(width < 760 ? 340 : 580);
    expect(box.width).toBeLessThan(760);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const layout = await section.evaluate((node) => {
      const a = node.querySelector(".ps-teaser-copy")!.getBoundingClientRect(),
        b = node.querySelector("figure")!.getBoundingClientRect();
      const overlap =
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      const clipped = Array.from(
        node.querySelectorAll<HTMLElement>(".ps-teaser-copy>*,figcaption>*"),
      )
        .filter((n) => n.scrollWidth > n.clientWidth + 2)
        .map((n) => n.textContent);
      return { overlap, clipped };
    });
    expect(layout).toEqual({ overlap: false, clipped: [] });
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await page.screenshot({
      path: test.info().outputPath(`sneak-peek-${width}.png`),
    });
    expect(errors).toEqual([]);
  });
}
test("clicking or dragging the preview cannot navigate or open product UI", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/product#surfaces");
  const frame = page.locator(".ps-teaser-frame");
  await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await frame.scrollIntoViewIfNeeded();
  const url = page.url();
  const before = await frame.getAttribute("data-slide");
  await frame.click({ position: { x: 160, y: 140 } });
  const box = (await frame.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(frame).toHaveAttribute("data-slide", before!);
  expect(page.url()).toBe(url);
  await expect(page.locator(".hb-root,.hw-root,.hb-dialog")).toHaveCount(0);
  await page.locator(".ps-teaser-cta").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(
    page.getByRole("heading", { name: "Choose your operating world" }),
  ).toBeVisible();
});
test("the four-frame sneak peek runs automatically without playback or selector controls", async ({
  page,
}) => {
  await page.goto("/en/product#surfaces");
  const frame = page.locator(".ps-teaser-frame");
  await frame.scrollIntoViewIfNeeded();
  for (const [index, alt] of [
    [0, /Control Center/],
    [1, /hotel exterior/],
    [2, /Restaurant service/],
    [3, /Decisions screen/],
  ] as const) {
    await expect(frame).toHaveAttribute("data-slide", String(index), {
      timeout: 10000,
    });
    await expect(frame.locator(".ps-teaser-current")).toHaveAttribute(
      "alt",
      alt,
    );
  }
  await expect(frame).toHaveAttribute("data-slide", "0", { timeout: 10000 });
  await expect(page.locator("#surfaces button,#surfaces select")).toHaveCount(
    0,
  );
});
test("reduced motion keeps the preview stable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/product#surfaces");
  const frame = page.locator(".ps-teaser-frame");
  await frame.scrollIntoViewIfNeeded();
  await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.waitForTimeout(5000);
  await expect(frame).toHaveAttribute("data-slide", "0");
});
test("the passive preview and demo CTA pass desktop and phone accessibility checks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/product#surfaces");
    await expect(page.locator(".ps-teaser-media")).toHaveAttribute(
      "data-ready",
      "true",
    );
    const r = await new AxeBuilder({ page })
      .include("#surfaces")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      r.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
