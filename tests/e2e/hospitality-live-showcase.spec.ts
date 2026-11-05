import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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
async function reverse(page: import("playwright/test").Page) {
  await page.goto(base + "/en");
  await page
    .getByRole("button", { name: "Show the operating view", exact: true })
    .click();
  return page.locator(".rsc-face-back");
}
test("restaurant cards expose current needs, orders, return history and a separate next reservation", async ({
  page,
}) => {
  const back = await reverse(page);
  const detail = back.locator(".rhl-inspector");
  await expect(detail).toContainText("Morgan party");
  await expect(detail).toContainText("Returning · 5 visits");
  await expect(detail.locator(".rhl-safety")).toContainText("Sesame allergy");
  await expect(detail).toContainText("Anniversary");
  await expect(detail).toContainText("$236 ordered");
  await expect(detail).toContainText("Burrata");
  await expect(detail.locator(".rhl-next")).toContainText("20:15");
  await expect(detail.locator(".rhl-next")).toContainText("Peanuts allergy");
  await expect(detail.locator(".rhl-next")).toContainText("Birthday");
  await back
    .getByRole("button", { name: "Table 6, Turning", exact: true })
    .click();
  await expect(detail).toContainText("$262 paid");
  await expect(detail.locator(".rhl-safety")).toContainText(
    "No allergies reported",
  );
  await expect(detail.locator(".rhl-next")).toContainText(
    "Allergies not confirmed",
  );
  await expect(detail.locator(".rhl-next")).toContainText("High chair");
});
test("hotel switch updates the workspace and room-bound incoming requirements", async ({
  page,
}) => {
  const back = await reverse(page);
  await back.getByRole("button", { name: "Hotel", exact: true }).click();
  await expect(back.locator(".rsc-top-location")).toContainText("Mercer House");
  const detail = back.locator(".rhl-inspector");
  await expect(detail).toContainText("Michael Tan");
  await expect(detail.locator(".rhl-safety")).toContainText(
    "Shellfish allergy",
  );
  await expect(detail.locator(".rhl-safety")).toContainText("Incoming guest");
  await expect(detail).toContainText("Birthday stay");
  await expect(detail).toContainText("Feather-free bedding");
  await expect(detail).toContainText("Quiet room");
  await expect(detail).toContainText("15:20");
  await expect(detail).toContainText("K. Silva");
  await back.locator(".rhl-object").nth(1).click();
  await expect(detail.locator(".rhl-safety")).toContainText(
    "Allergies not confirmed",
  );
  await expect(detail).not.toContainText("Shellfish");
  await expect(detail).not.toContainText("Birthday stay");
});
test("all critical guest detail fits inside both tablet views at desktop, tablet and phone sizes", async ({
  page,
}) => {
  for (const width of [1512, 820, 390, 360]) {
    await page.setViewportSize({ width, height: 982 });
    const back = await reverse(page);
    for (const kind of ["Restaurant", "Hotel"]) {
      await back.getByRole("button", { name: kind, exact: true }).click();
      await expect(back.locator(".rhl-scene")).toHaveAttribute(
        "data-hospitality",
        kind.toLowerCase(),
      );
      const sizes = await back
        .locator(".rhl-inspector")
        .evaluate((e) => ({ h: e.clientHeight, scroll: e.scrollHeight }));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.h + 1);
      expect(
        await back
          .locator(".rsc-stage")
          .evaluate((e) => e.scrollHeight > e.clientHeight + 1),
      ).toBe(false);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
    }
  }
});
test("the visible reverse face cycles automatically through restaurant and hotel without playback buttons", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "/en");
  const stage = page.locator(".rsc-scroll-stage");
  await expect(stage).toHaveAttribute("data-ready", "true");
  const start = await stage.evaluate((n) =>
    Math.max(0, n.getBoundingClientRect().top + scrollY - innerHeight * 0.3),
  );
  await page.evaluate((y) => scrollTo(0, y), start + 240);
  await expect(stage).toHaveAttribute("data-face", "back");
  const back = page.locator(".rsc-face-back");
  await expect(back.locator(".rsc-tablet")).toHaveAttribute(
    "data-running",
    "true",
  );
  await expect(back.locator(".rhl-scene")).toHaveAttribute(
    "data-hospitality",
    "hotel",
    { timeout: 10000 },
  );
  await expect(
    back.getByRole("button", { name: /pause|resume|play animation/i }),
  ).toHaveCount(0);
});
