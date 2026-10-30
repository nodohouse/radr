/**
 * Shared Settings helpers — wait for shell ready, then click by data-settings-id.
 * Avoids cold-load races where Suspense / searchParams sync lags first paint.
 */
import { expect, type Page } from "playwright/test";

export async function waitSettingsReady(page: Page) {
  // Nav items exist only after Suspense resolves (fallback has no data-settings-id).
  await expect(page.locator('[data-settings-id]').first()).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator(".rp-settings-panel")).toBeVisible();
  await expect(page.locator("#settings-panel-title")).toBeVisible();
}

export async function gotoSettings(
  page: Page,
  path = "/app/settings?stay=1",
) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitSettingsReady(page);
}

export async function clickSettingsNav(page: Page, id: string) {
  const nav = page.locator(`[data-settings-id="${id}"]`);
  await expect(nav).toBeVisible();
  await nav.scrollIntoViewIfNeeded();
  await nav.click();
  await expect(nav).toHaveAttribute("data-active", "true", { timeout: 5000 });
  await expect(page.locator("#settings-panel-title")).toBeVisible();
}
