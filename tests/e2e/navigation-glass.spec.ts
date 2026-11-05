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
test("desktop dropdowns stay below the bar and descriptions never intersect titles", async ({
  page,
}) => {
  for (const [width, height, locale] of [
    [1512, 982, "en"],
    [1130, 700, "de"],
    [1280, 600, "en"],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto(base + "/" + locale);
    await expect(page.locator('.rx-nav[data-ready="true"]')).toBeVisible();
    await page.mouse.move(0, height - 2);
    const barLayout = await page.evaluate(() => {
      const brand = document
        .querySelector(".rx-nav-bar > .rx-nav-brand")!
        .getBoundingClientRect();
      const right = document
        .querySelector(".rx-nav-right")!
        .getBoundingClientRect();
      const links = [
        ...document.querySelectorAll(".rx-nav-center .rx-nav-link"),
      ].map((n) => n.getBoundingClientRect());
      return links.every(
        (r) => r.left >= brand.right + 8 && r.right <= right.left - 8,
      );
    });
    expect(barLayout).toBe(true);
    for (const id of ["platform", "solutions", "company"]) {
      await page.locator("#" + id + "-trigger").hover();
      const panel = page.locator('.rx-nav-panel[data-menu="' + id + '"]');
      await expect(panel).toBeVisible();
      const layout = () =>
        panel.evaluate((n) => {
          const r = n.getBoundingClientRect(),
            bar = document
              .querySelector(".rx-nav-bar")!
              .getBoundingClientRect();
          const items = [...n.querySelectorAll(".rx-np-item")];
          return {
            below: r.top >= bar.bottom + 8,
            inside:
              r.left >= 0 &&
              r.right <= innerWidth + 1 &&
              r.bottom <= innerHeight + 1,
            overlap: items.filter((item) => {
              const title = item.querySelector("strong"),
                desc = item.querySelector("span:not(.rx-np-item-signal)");
              return (
                title &&
                desc &&
                title.getBoundingClientRect().bottom >
                  desc.getBoundingClientRect().top + 1
              );
            }).length,
          };
        });
      await expect
        .poll(layout)
        .toEqual({ below: true, inside: true, overlap: 0 });
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    }
  }
});
test("keyboard can enter a dropdown and Escape restores its trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + "/en");
  await expect(page.locator('.rx-nav[data-ready="true"]')).toBeVisible();
  const trigger = page.locator("#platform-trigger");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".rx-nav-panel .rx-np-item").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".rx-nav-panel")).toBeHidden();
  await expect(trigger).toBeFocused();
});
test("compact navigation keeps focus inside, exposes every platform link, and restores focus", async ({
  page,
}) => {
  for (const width of [1120, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + "/en");
    await expect(page.locator('.rx-nav[data-ready="true"]')).toBeVisible();
    const menu = page.locator(".rx-nav-menu");
    await expect(menu).toBeVisible();
    await expect(page.locator(".rx-nav-center")).toBeHidden();
    await menu.click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("button", { name: "Close", exact: true }),
    ).toBeFocused();
    await drawer
      .getByRole("button", { name: "Expand Platform", exact: true })
      .click();
    await expect(
      drawer.locator(".rx-nav-acc-body").first().getByRole("link"),
    ).toHaveCount(17);
    const links = drawer.getByRole("link");
    await links.last().focus();
    await links.last().scrollIntoViewIfNeeded();
    const closeBounds = await drawer
      .getByRole("button", { name: "Close", exact: true })
      .boundingBox();
    expect(closeBounds!.y).toBeGreaterThanOrEqual(0);
    expect(closeBounds!.y + closeBounds!.height).toBeLessThan(844);
    await page.keyboard.press("Tab");
    await expect(drawer.locator("a[href], button").first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
});
