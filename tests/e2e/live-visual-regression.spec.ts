import { test, expect } from "playwright/test";

/**
 * Live visual / alignment regression gates.
 * Set RADR_VISUAL=1 to also write/compare screenshots.
 */

const LIVE = "/app/live?stay=1";
const VISUAL = process.env.RADR_VISUAL === "1";

test.describe("Live visual regression", () => {
  test("restaurant venue · table selection preserves canvas", async ({
    page,
  }) => {
    await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    const canvas = page.getByTestId("ls-venue-canvas");
    await expect(canvas).toBeVisible({ timeout: 15000 });
    const before = await canvas.boundingBox();
    expect(before?.width).toBeGreaterThan(400);

    await canvas.getByRole("button", { name: /Table 14/i }).click();
    await expect(page).toHaveURL(/table=t14/);
    const after = await canvas.boundingBox();
    expect(after?.width).toBeCloseTo(before!.width, 0);
    expect(after?.height).toBeCloseTo(before!.height, 0);

    if (VISUAL) {
      await expect(page.getByTestId("ls-root")).toHaveScreenshot(
        "restaurant-table-selected.png",
        { maxDiffPixelRatio: 0.04 },
      );
    }
  });

  test("restaurant estate reconciles to 10 registry locations", async ({
    page,
  }) => {
    await page.goto(`${LIVE}&level=estate`);
    await expect(page.getByTestId("ls-estate")).toBeVisible();
    await expect(page.locator(".ls-estate-sub")).toContainText("10 locations");
    for (const id of [
      "loc_berlin_mitte",
      "loc_berlin_kreuzberg",
      "loc_hamburg_hafen",
      "loc_munich_altstadt",
      "loc_koln_ehrenfeld",
      "loc_dusseldorf_medienhafen",
      "loc_stuttgart_mitte",
      "loc_hk_central",
      "loc_sydney_surry",
      "loc_frankfurt_westend",
    ]) {
      await expect(page.getByTestId(`ls-estate-${id}`)).toBeVisible();
    }
  });

  test("hotel floor · room hitbox stays on tile after zoom", async ({
    page,
  }) => {
    await page.goto(
      `${LIVE}&level=property&property=nyc-mercer-house&floor=3&room=310`,
    );
    const plan = page.locator(".hl-plan");
    await expect(plan).toBeVisible({ timeout: 15000 });
    const tile = page.locator('.hl-tile[data-selected="true"]');
    await expect(tile).toBeVisible();
    const box1 = await tile.boundingBox();
    await page.getByRole("button", { name: "Zoom in" }).click();
    await page.getByRole("button", { name: "Zoom in" }).click();
    const box2 = await tile.boundingBox();
    expect(box1).toBeTruthy();
    expect(box2).toBeTruthy();
    // Selected tile remains in the plan viewport (no drift off-canvas)
    const planBox = await plan.boundingBox();
    expect(box2!.x).toBeGreaterThan(planBox!.x - 40);
    expect(box2!.x + box2!.width).toBeLessThan(planBox!.x + planBox!.width + 40);

    if (VISUAL) {
      await expect(plan).toHaveScreenshot("hotel-floor-zoomed.png", {
        maxDiffPixelRatio: 0.05,
      });
    }
  });

  test("debugGeometry paints restaurant anchors", async ({ page }) => {
    await page.goto(
      `${LIVE}&level=venue&location=nyc-soho&zone=main&debugGeometry=1`,
    );
    await expect(page.getByTestId("ls-venue-canvas")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(".ls-debug-geometry")).toBeVisible();
  });
});
