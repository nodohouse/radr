import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
const surfaces = [
  "Control Center",
  "Live",
  "Decisions",
  "Operations",
  "Back of House",
  "Intelligence",
  "Value",
  "Memory",
  "Data Health",
  "Connections",
];
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
  test(`image showcase is aligned at ${width}px and contains no product controls`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1200 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/en/product?surface=live#surfaces");
    const gallery = page.locator(".psw-gallery");
    await expect(gallery).toHaveAttribute("data-slide", "1");
    await expect
      .poll(() =>
        page
          .locator(".psw-gallery-current")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await expect(
      page.locator(
        ".psw-workspace canvas, .psw-workspace .hw-root, .psw-workspace .hb-root, .psw-workspace form",
      ),
    ).toHaveCount(0);
    await expect(
      page.locator(".psw-gallery button, .psw-gallery input, .psw-gallery a"),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const clipped = await page.locator(".psw-workspace").evaluate((node) =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          ".psw-panel-head>*, .psw-gallery-caption>*, .psw-panel-footer>*",
        ),
      )
        .filter((el) => el.scrollWidth > el.clientWidth + 2)
        .map((el) => el.textContent),
    );
    expect(clipped).toEqual([]);
    await expect(page.locator(".psw-gallery-media")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await gallery.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: test.info().outputPath(`gallery-${width}.png`),
    });
    expect(errors).toEqual([]);
  });
test("all ten selectors change images only and keep URL and keyboard aligned", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en/product#surfaces");
  const tabs = page
    .getByRole("tablist", { name: "Choose a product preview" })
    .getByRole("tab");
  await expect(tabs).toHaveCount(10);
  for (const name of surfaces) {
    const tab = tabs.filter({ hasText: name });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".psw-panel-head>span")).toHaveText(name);
    await expect
      .poll(() =>
        page
          .locator(".psw-gallery-current")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
  }
  await tabs.first().click();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: "Live", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/surface=live/);
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(page.locator(".psw-workspace canvas")).toHaveCount(0);
});
test("the visible showcase advances automatically without playback buttons", async ({
  page,
}) => {
  await page.goto("/en/product?surface=live#surfaces");
  const gallery = page.locator(".psw-gallery");
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute("data-slide", "1");
  await expect(gallery).toHaveAttribute("data-slide", "2", { timeout: 10000 });
  await expect(page.locator(".psw-gallery-current")).toHaveAttribute(
    "alt",
    /shellfish allergy/,
  );
  await expect(gallery).toHaveAttribute("data-slide", "3", { timeout: 10000 });
  await expect(page.locator(".psw-gallery-current")).toHaveAttribute(
    "alt",
    /Restaurant service/,
  );
  await expect(
    page.getByRole("button", { name: /pause|play slideshow|stop animation/i }),
  ).toHaveCount(0);
});
test("reduced motion keeps images stable and phone selectors remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/product?surface=live#surfaces");
  const select = page.getByLabel("Choose a product surface");
  for (const name of surfaces) {
    await select.selectOption({ label: name });
    await expect(page.locator(".psw-panel-head>span")).toHaveText(name);
  }
  const before = await page.locator(".psw-gallery").getAttribute("data-slide");
  await page.waitForTimeout(6600);
  await expect(page.locator(".psw-gallery")).toHaveAttribute(
    "data-slide",
    before!,
  );
});
test("gallery clicks do not perform product actions and the CTA goes to signup", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(request.url());
  });
  await page.goto("/en/product?surface=live#surfaces");
  const gallery = page.locator(".psw-gallery");
  await gallery.click({ position: { x: 200, y: 200 } });
  await expect(page.locator(".hb-dialog, .hb-root, .hw-root")).toHaveCount(0);
  expect(writes).toEqual([]);
  const cta = page.locator(".psw-panel-footer a");
  await expect(cta).toHaveAttribute("href", /signup\?intent=demo/);
  await cta.click();
  await expect(page).toHaveURL(/signup\?intent=demo/);
  expect(new URL(page.url()).searchParams.get("next")).toBe("/app/enter");
});
test("image previews remain available without WebGL and pass accessibility checks", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (
        this: HTMLCanvasElement,
        type: string,
        options?: unknown,
      ) {
        return type.includes("webgl")
          ? null
          : Reflect.apply(original, this, [type, options]);
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/product?surface=live#surfaces");
    await expect
      .poll(() =>
        page
          .locator(".psw-gallery-current")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    const results = await new AxeBuilder({ page })
      .include("#surfaces")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
for (const world of ["hotel", "restaurant"])
  test(`public ${world} choice leads to signup before demo entry`, async ({
    page,
  }) => {
    await page.goto("/en/demo");
    await page
      .getByRole("button", {
        name: world === "hotel" ? "Hotel group" : "Restaurant group",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/en\/signup\?/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(
      `/app/enter?vertical=${world}&go=1`,
    );
    expect(
      await page.evaluate(() => sessionStorage.getItem("radr.demoEntered.v1")),
    ).toBeNull();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
