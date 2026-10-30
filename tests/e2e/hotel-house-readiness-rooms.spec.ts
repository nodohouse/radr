/**
 * Hotel House Readiness — room tile overlap regression.
 * Asserts every visible room number stays inside its tile and ≤16px.
 */
import { test, expect } from "@playwright/test";

test.describe("Hotel House Readiness room tiles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/service", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({
          locationScope: "loc_canal_house",
          period: "today",
          lens: "today",
          serviceTime: "all",
          selectedFindingId: null,
        }),
      );
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          defaultLocationId: "loc_canal_house",
          roleView: "hotel_gm",
          timeFormat: "24h",
        }),
      );
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="house-readiness"]', {
      timeout: 30000,
    });
  });

  test("room numbers never overlap or escape tiles", async ({ page }) => {
    const rooms = page.locator(".hr-room[data-room]");
    const count = await rooms.count();
    expect(count).toBeGreaterThan(20);

    const boxes: { n: string; x: number; y: number; r: number; b: number }[] =
      [];

    for (let i = 0; i < count; i++) {
      const room = rooms.nth(i);
      const tile = await room.boundingBox();
      const num = room.locator(".hr-room-num");
      const numBox = await num.boundingBox();
      const fontSize = await num.evaluate((el) => {
        const s = getComputedStyle(el);
        return parseFloat(s.fontSize);
      });
      const number = (await room.getAttribute("data-room")) ?? "";

      expect(tile, `tile ${number}`).toBeTruthy();
      expect(numBox, `label ${number}`).toBeTruthy();
      expect(fontSize, `font ${number}`).toBeLessThanOrEqual(16);
      expect(fontSize, `font min ${number}`).toBeGreaterThanOrEqual(10);

      // Label inside tile (1px tolerance)
      expect(numBox!.x).toBeGreaterThanOrEqual(tile!.x - 1);
      expect(numBox!.y).toBeGreaterThanOrEqual(tile!.y - 1);
      expect(numBox!.x + numBox!.width).toBeLessThanOrEqual(
        tile!.x + tile!.width + 1,
      );
      expect(numBox!.y + numBox!.height).toBeLessThanOrEqual(
        tile!.y + tile!.height + 1,
      );

      boxes.push({
        n: number,
        x: tile!.x,
        y: tile!.y,
        r: tile!.x + tile!.width,
        b: tile!.y + tile!.height,
      });
    }

    // No two room number centers share nearly identical position (overlap smell)
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const sameRow = Math.abs(a.y - b.y) < 4;
        if (!sameRow) continue;
        const overlap = !(a.r <= b.x + 1 || b.r <= a.x + 1);
        expect(overlap, `${a.n} overlaps ${b.n}`).toBe(false);
      }
    }

    await page.screenshot({
      path: "tmp/hotel-house-readiness-pass4-1512x982.png",
      fullPage: false,
    });
  });

  test("canonical KPIs reconcile", async ({ page }) => {
    await expect(page.getByText("31 / 42").first()).toBeVisible();
    await expect(page.getByText("89%").first()).toBeVisible();
    await expect(page.locator(".hr-kpi[data-tone='neg'] strong")).toHaveText(
      "11",
    );
    await expect(page.getByText("€3,780").first()).toBeVisible();
    await expect(page.getByText("Room 105").first()).toBeVisible();
    await expect(page.locator(".hr-live-pill")).toContainText("14:20");
  });
});
