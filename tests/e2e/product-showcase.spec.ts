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
    tablet.getByRole("tab", { name: "Decisions", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
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
    for (const name of ["Control Center", "Decisions", "Futures", "Value"]) {
      await page
        .locator(".rsc-tablet")
        .getByRole("tab", { name, exact: true })
        .click();
      const size = await page
        .locator(".rsc-tablet")
        .evaluate((n) => ({
          height: n.getBoundingClientRect().height,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          clipped:
            n.querySelector(".rsc-stage")!.scrollHeight >
            n.querySelector(".rsc-stage")!.clientHeight + 1,
        }));
      expect(size.overflow).toBe(false);
      expect(size.clipped).toBe(false);
      heights.push(size.height);
    }
    expect(new Set(heights).size).toBe(1);
  }
});
test("tour advances automatically, then manual interaction stops it stealing focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto(base + "/en");
  const tablet = page.locator(".rsc-tablet");
  await expect(tablet).toHaveAttribute("data-running", "true");
  await page.clock.runFor(7100);
  await expect(
    tablet.getByRole("tab", { name: "Decisions", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await tablet
    .getByRole("tab", { name: "Control Center", exact: true })
    .click();
  await page.clock.runFor(15000);
  await expect(
    tablet.getByRole("tab", { name: "Control Center", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    tablet.getByRole("button", { name: "Play product tour" }),
  ).toBeVisible();
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
    .getByRole("tab", { name: "Control Center", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    tablet.getByRole("tab", { name: "Decisions", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    tablet.getByRole("tab", { name: "Value", exact: true }),
  ).toBeFocused();
});
