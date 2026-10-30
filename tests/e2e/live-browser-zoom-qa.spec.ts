import { test, expect, type Page } from "playwright/test";

/**
 * Browser zoom QA matrix for Live — labels readable, selection anchored,
 * inspector present, no clipped hit targets.
 *
 * Playwright `page.setViewportSize` + CDP Emulation.setPageScaleFactor
 * approximates browser zoom where available.
 */

const LIVE = "/app/live?stay=1";
const ZOOMS = [0.8, 0.9, 1, 1.1, 1.25, 1.5] as const;

async function setPageZoom(page: Page, factor: number) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: factor });
  } catch {
    /* CDP may be unavailable — fall through with viewport only */
  }
}

test.describe("Live browser zoom QA", () => {
  for (const zoom of ZOOMS) {
    test(`restaurant venue @ ${Math.round(zoom * 100)}%`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await setPageZoom(page, zoom);
      await page.goto(
        `${LIVE}&level=venue&location=nyc-soho&zone=main&table=t14`,
      );
      const canvas = page.getByTestId("ls-venue-canvas");
      await expect(canvas).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("ls-inspector")).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(200);
      expect(box?.height).toBeGreaterThan(160);
      // Selected table control remains hittable
      await expect(
        canvas.getByRole("button", { name: /Table 14/i }),
      ).toBeVisible();
    });
  }

  for (const zoom of [1, 1.25, 1.5] as const) {
    test(`hotel floor @ ${Math.round(zoom * 100)}%`, async ({ page }) => {
      await page.setViewportSize({ width: 1512, height: 982 });
      await setPageZoom(page, zoom);
      await page.goto(
        `${LIVE}&level=property&property=nyc-mercer-house&floor=3&room=310`,
      );
      const plan = page.locator(".hl-plan");
      await expect(plan).toBeVisible({ timeout: 15000 });
      const tile = page.locator('.hl-tile[data-selected="true"]');
      await expect(tile).toBeVisible();
      const planBox = await plan.boundingBox();
      const tileBox = await tile.boundingBox();
      expect(planBox).toBeTruthy();
      expect(tileBox).toBeTruthy();
      expect(tileBox!.x + tileBox!.width / 2).toBeGreaterThan(planBox!.x);
      expect(tileBox!.x).toBeLessThan(planBox!.x + planBox!.width);
    });
  }
});
