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
test("native scroll reveals the readable reverse face and returns to the front without changing page height", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [3840, 1920, 1512, 820, 390]) {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 982 });
    await page.goto(base + "/en");
    const stage = page.locator(".rsc-scroll-stage");
    await expect(stage).toHaveAttribute("data-ready", "true");
    await page.evaluate(() => document.fonts.ready);
    await expect(stage).toHaveAttribute("data-face", "front");
    await expect(
      page.getByText("Scroll to see the other side", { exact: true }),
    ).toHaveCount(0);
    const peek = page.locator(".rsc-operation-peek");
    await expect(peek).toContainText("Hotel · Room 310");
    await expect(peek).toContainText("Shellfish allergy");
    await expect(peek).toContainText("Incoming guest · 15:20");
    const before = await stage.evaluate((n) => ({
      height: document.documentElement.scrollHeight,
      start: Math.max(
        0,
        n.getBoundingClientRect().top + scrollY - innerHeight * 0.3,
      ),
    }));
    await page.evaluate((y) => scrollTo(0, y), before.start + 210);
    await expect(stage).toHaveAttribute("data-face", "back");
    await expect
      .poll(() =>
        stage.evaluate(
          (n) =>
            new DOMMatrixReadOnly(
              getComputedStyle(n.querySelector(".rsc-flip-rig")!).transform,
            ).m11,
        ),
      )
      .toBeLessThan(-0.95);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(before.height);
    // The completed reveal must be readable below the fixed navigation.
    expect(
      await stage.evaluate(
        (n) =>
          n.querySelector(".rsc-face-back")!.getBoundingClientRect().top -
          document.querySelector(".rx-nav")!.getBoundingClientRect().bottom,
      ),
    ).toBeGreaterThan(12);
    await expect
      .poll(() => peek.evaluate((n) => Number(getComputedStyle(n).opacity)))
      .toBeLessThan(0.01);
    await expect(page.locator(".rsc-face-front")).toHaveAttribute("inert", "");
    await expect(page.locator(".rsc-face-back")).not.toHaveAttribute(
      "inert",
      "",
    );
    expect(
      await stage.evaluate(
        (n) =>
          document.querySelector(".rm-loop")!.getBoundingClientRect().top -
          n.querySelector(".rsc-face-back")!.getBoundingClientRect().bottom,
      ),
    ).toBeGreaterThan(12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    await page.evaluate(() => scrollTo(0, 0));
    await expect(stage).toHaveAttribute("data-face", "front");
    await expect(page.locator(".rsc-face-back")).toHaveAttribute("inert", "");
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(before.height);
  }
});
test("reduced motion provides an instant operating-view alternative and uses the actual product demo data", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "/en");
  await page.getByRole("button", { name: "Show the operating view" }).click();
  const back = page.locator(".rsc-face-back");
  await expect(page.locator(".rsc-scroll-stage")).toHaveAttribute(
    "data-face",
    "back",
  );
  await expect(back).toContainText("Every arrival, considered.");
  await expect(back.locator(".rhl-inspector")).toContainText("Room 310");
  await expect(back.locator(".rhl-inspector")).toContainText(
    "Shellfish allergy",
  );
  await expect(back.locator(".rhl-inspector")).toContainText("15:20");
  await back.getByRole("button", { name: "Restaurant", exact: true }).click();
  await expect(back).toContainText("Every table, understood.");
  await back
    .getByRole("button", { name: "Table 6, Turning", exact: true })
    .click();
  await expect(back.locator(".rhl-inspector")).toContainText("Table 6");
  await expect(back.locator(".rhl-inspector")).toContainText("$262 paid");
  await back.getByRole("button", { name: "Operations", exact: true }).click();
  await expect(back.locator(".rso-stations")).toContainText("96%");
  await expect(back.locator(".rso-stations")).toContainText("78%");
  await expect(back.locator(".rso-stations")).toContainText("94%");
  expect(
    await back
      .locator(".rso-load-track i")
      .first()
      .evaluate((n) => getComputedStyle(n).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Show decision view" }).click();
  await expect(page.locator(".rsc-scroll-stage")).toHaveAttribute(
    "data-face",
    "front",
  );
});
