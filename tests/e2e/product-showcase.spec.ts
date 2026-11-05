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
test("tablet review leads through evidence, futures and a qualified demo outcome without navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "/en");
  const tablet = page.locator(".rsc-tablet");
  await tablet.getByRole("button", { name: "Review the decision" }).click();
  await expect(
    tablet.getByRole("button", { name: "Decisions", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(tablet).toContainText(
    "Synthetic evidence, not a live prediction.",
  );
  await tablet.getByRole("button", { name: "Compare the two futures" }).click();
  await expect(tablet).toContainText("No action is executed.");
  await tablet
    .getByRole("button", { name: "See the illustrative outcome" })
    .click();
  await expect(tablet).toContainText("$590");
  await expect(tablet).toContainText("not evidence of customer results");
  await expect(page).toHaveURL(base + "/en");
  await expect(
    tablet.getByRole("link", { name: "Explore the interactive demo" }),
  ).toHaveAttribute("href", "/en/demo");
});
test("every scene fits and keeps the same tablet height on desktop, tablet and phone", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1512, 820, 390]) {
    await page.setViewportSize({ width, height: 982 });
    await page.goto(base + "/en");
    const heights: number[] = [];
    for (const name of [
      "Control Center",
      "Decisions",
      "Intelligence",
      "Value",
    ]) {
      await page
        .locator(".rsc-tablet")
        .getByRole("button", { name, exact: true })
        .click();
      const size = await page.locator(".rsc-tablet").evaluate((n) => ({
        height: n.getBoundingClientRect().height,
        width: n.getBoundingClientRect().width,
        railLeft:
          n.querySelector(".rsc-sidebar")!.getBoundingClientRect().right <=
          n.querySelector(".rsc-stage")!.getBoundingClientRect().left + 1,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clipped:
          n.querySelector(".rsc-stage")!.scrollHeight >
          n.querySelector(".rsc-stage")!.clientHeight + 1,
      }));
      expect(size.width).toBeGreaterThan(size.height);
      expect(size.railLeft).toBe(true);
      expect(size.overflow).toBe(false);
      expect(size.clipped).toBe(false);
      heights.push(size.height);
    }
    expect(new Set(heights).size).toBe(1);
  }
});
test("tour continuously advances while hovered and after manual navigation, with no playback UI", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto(base + "/en");
  const tablet = page.locator(".rsc-tablet");
  await expect(tablet).toHaveAttribute("data-running", "true");
  await expect(tablet.locator(".rsc-play, .rsc-demo")).toHaveCount(0);
  await expect(tablet).not.toContainText("19:48");
  await page.clock.runFor(4300);
  await expect(
    tablet.getByRole("button", { name: "Decisions", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await tablet.hover();
  await page.clock.runFor(4300);
  await expect(
    tablet.getByRole("button", { name: "Intelligence", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await tablet
    .getByRole("button", { name: "Control Center", exact: true })
    .click();
  await page.clock.runFor(4300);
  await expect(
    tablet.getByRole("button", { name: "Decisions", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(tablet).toHaveAttribute("data-running", "true");
});
test("reduced motion leaves graph stationary and tabs support arrow-key navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "/en");
  const tablet = page.locator(".rsc-tablet");
  await expect(tablet).not.toHaveAttribute("data-running", "true");
  expect(
    await tablet
      .locator(".rsc-line")
      .evaluate((n) => getComputedStyle(n).animationName),
  ).toBe("none");
  await tablet
    .getByRole("button", { name: "Control Center", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    tablet.getByRole("button", { name: "Decisions", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    tablet.getByRole("button", { name: "Value", exact: true }),
  ).toBeFocused();
});
