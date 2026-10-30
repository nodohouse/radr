/**
 * Visual cohesion smoke — marketing mineral light on /app shell.
 * Interaction only; no business-logic assertions.
 */
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/app?stay=1",
  "/app/service",
  "/app/decisions",
  "/app/locations",
  "/app/settings",
] as const;

test.describe("Visual cohesion smoke", () => {
  for (const route of ROUTES) {
    test(`shell mineral light · ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const shell = page.locator(".rp-shell-v2").first();
      await expect(shell).toBeVisible({ timeout: 15_000 });

      const bg = await shell.evaluate((el) =>
        getComputedStyle(el).backgroundColor,
      );
      // #f7faf8 ≈ rgb(247, 250, 248)
      expect(bg).toMatch(/rgb\(\s*247,\s*250,\s*248\s*\)/);

      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2,
      );
      expect(overflowX).toBe(false);
    });
  }

  test("Ask RADR opens and closes", async ({ page }) => {
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    const ask = page.getByRole("button", { name: /Ask RADR/i }).first();
    await expect(ask).toBeVisible();
    await ask.click();
    await expect(page.locator(".rp-ask-panel")).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(page.locator(".rp-ask-panel")).toHaveCount(0);
  });

  test("Service tabs switch without run-on", async ({ page }) => {
    await page.goto("/app/service", { waitUntil: "domcontentloaded" });
    const tabs = page.locator(".rp-svc-tabs [role='tab']");
    if ((await tabs.count()) < 2) {
      test.skip();
      return;
    }
    await tabs.nth(1).click();
    const viewline = page.locator(".rp-svc-viewline");
    await expect(viewline).toBeVisible();
    const text = (await viewline.innerText()).replace(/\s+/g, " ");
    // Question must not glue to tab labels
    expect(text.toLowerCase()).not.toMatch(/floortimeline|timelinerecovery/);
  });
});
