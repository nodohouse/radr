import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
test.setTimeout(240000);
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
test("pricing makes all three proposed scopes visible and keeps sales intent", async ({
  page,
}) => {
  await page.goto(base + "/en/pricing");
  await expect(page.locator(".rm-plan-card")).toHaveCount(3);
  await expect(page.locator(".rm-plan-card h3")).toHaveText([
    "Recovery Pilot",
    "Expand",
    "Enterprise",
  ]);
  for (const card of await page.locator(".rm-plan-card").all()) {
    await expect(card).toContainText("Custom quote");
    await expect(card.locator("a")).toHaveAttribute(
      "href",
      /\/en\/contact\?intent=sales&plan=/,
    );
  }
  await expect(page.locator(".rm-availability")).toContainText(
    "not production-ready",
  );
  await expect(page.locator(".rm-compare-table tbody tr")).toHaveCount(5);
  const question = page
    .locator("summary")
    .filter({ hasText: "How much does RADR cost?" });
  await question.click();
  await expect(
    page.getByText(/There is no published monthly rate today/),
  ).toBeVisible();
  await page.locator(".rm-plan-card a").first().click();
  await expect(page).toHaveURL(/\/en\/contact\?intent=sales&plan=start/);
  await expect(page.locator("main")).toBeVisible();
});
test("platform walkthrough distinguishes a recommendation from completed-service proof", async ({
  page,
}) => {
  await page.goto(base + "/en/product");
  await page.locator(".rm-story-steps button").nth(3).click();
  await expect(page.locator(".rm-story-content")).toContainText("+$620");
  await expect(page.locator(".rm-story-content")).toContainText(
    "82% confidence",
  );
  await page.locator(".rm-story-steps button").nth(4).click();
  await expect(page.locator(".rm-story-content")).toContainText(
    "No external execution",
  );
  await page.locator(".rm-story-steps button").nth(5).click();
  await expect(page.locator(".rm-story-content")).toContainText("$590");
  await expect(page.locator(".rm-story-content")).toContainText(
    "separate completed-service",
  );
});
test("every platform surface responds and keyboard selection follows focus", async ({
  page,
}) => {
  await page.goto(base + "/en/product");
  const tabs = page
    .getByRole("tablist", { name: "Explore the product surfaces" })
    .getByRole("tab");
  for (let i = 0; i < 10; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#surface-preview")).toHaveAttribute(
      "aria-labelledby",
      (await tabs.nth(i).getAttribute("id")) || "",
    );
    await expect(page.locator("#surface-preview")).toBeVisible();
  }
  await tabs.first().focus();
  await tabs.first().click();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/surface=live/);
});
test("solutions problem tabs support mouse and keyboard", async ({ page }) => {
  await page.goto(base + "/en/solutions");
  const tabs = page
    .getByRole("tablist", { name: "Explore economic problems" })
    .getByRole("tab");
  for (let i = 0; i < 5; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#leak-preview")).toBeVisible();
  }
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
});
test("calculator cannot skip required inputs and sample results stay modeled", async ({
  page,
}) => {
  await page.goto(base + "/en/value-calculator");
  await page.getByRole("button", { name: "Build my Value Map" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByText("Choose one to continue.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".vc2-choices").first()).toBeVisible();
  await page.goto(base + "/en/value-calculator");
  await page
    .getByRole("button", { name: "Global restaurant group", exact: true })
    .click();
  await expect(page.locator("main")).toContainText(/Verified Value/, {
    timeout: 30000,
  });
  await expect(page.locator("main")).toContainText(/modeled/i);
});
