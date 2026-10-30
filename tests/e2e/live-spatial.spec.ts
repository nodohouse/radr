import { test, expect } from "playwright/test";

const LIVE = "/app/live?stay=1";

test.describe("RADR Live Spatial", () => {
  test("venue world loads and Kitchen opens inspector + preview", async ({
    page,
  }) => {
    await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    await expect(page.getByTestId("ls-root")).toBeVisible();
    await expect(page.getByTestId("ls-venue-canvas")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("ls-brief")).toContainText("Kitchen");

    await page
      .getByTestId("ls-venue-canvas")
      .getByRole("button", { name: "Kitchen" })
      .click();
    await expect(page).toHaveURL(/zone=kitchen/);
    await expect(page.getByTestId("ls-inspector")).toBeVisible();
    await expect(page.getByTestId("ls-inspector")).toContainText("Hot Line");

    await page.getByTestId("ls-preview-impact").click();
    await expect(page.getByText("SIMULATED").first()).toBeVisible({
      timeout: 3000,
    });

    await page.getByTestId("ls-compare-futures").click();
    await expect(page.getByTestId("ls-compare")).toBeVisible();

    await expect(page.getByTestId("ls-review-decision")).toHaveAttribute(
      "href",
      /\/app\/decisions\//,
    );
  });

  test("estate enter venue and horizon rewrite", async ({ page }) => {
    await page.goto(`${LIVE}&level=estate`);
    await expect(page.getByTestId("ls-estate")).toBeVisible();
    await page
      .getByTestId("ls-estate-loc_frankfurt_westend")
      .click({ force: true });
    await expect(page.getByTestId("ls-estate-focus")).toBeVisible();
    await expect(page.getByTestId("ls-estate-focus")).toContainText("$2,800");
    await page.getByTestId("ls-enter-venue").click({ force: true });
    await expect(page.getByTestId("ls-venue-canvas")).toBeVisible({
      timeout: 10000,
    });

    await page.getByTestId("ls-horizon-30").click();
    await expect(page.getByTestId("ls-brief")).toContainText("FORECAST");
  });

  test("all estate locations selectable", async ({ page }) => {
    await page.goto(`${LIVE}&level=estate`);
    const sites = [
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
    ];
    for (const id of sites) {
      await page.getByTestId(`ls-estate-${id}`).click({ force: true });
      await expect(page.getByTestId("ls-estate-focus")).toBeVisible();
    }
  });

  test("GM CFO lens and What Changed", async ({ page }) => {
    await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    await page.getByTestId("ls-persona-cfo").click();
    await expect(page.getByTestId("ls-venue-canvas")).toBeVisible();
    await page.getByTestId("ls-lens-fin").click();
    await expect(page.getByTestId("ls-lens-fin")).toHaveAttribute(
      "data-active",
      "true",
    );

    await page.getByTestId("ls-level-estate").click({ force: true });
    await expect(page.getByTestId("ls-estate")).toBeVisible({ timeout: 8000 });

    // Prefer inspector CTA when a site is selected (duplicate top CTA removed)
    const enter = page.getByTestId("ls-enter-venue");
    if (await enter.count()) {
      await enter.click();
    } else {
      await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    }
    await expect(page.getByTestId("ls-venue-canvas")).toBeVisible({
      timeout: 10000,
    });

    await page.getByTestId("ls-event-e2").click();
    await expect(page).toHaveURL(/zone=kitchen/);
  });

  test("deep link and escape ladder", async ({ page }) => {
    await page.goto(
      `${LIVE}&level=venue&location=nyc-soho&zone=kitchen&station=hot`,
    );
    await expect(page.getByTestId("ls-inspector")).toContainText("Hot");
    await page.getByTestId("ls-root").click({ position: { x: 8, y: 8 } });
    await page.keyboard.press("Escape");
    await expect(page).not.toHaveURL(/station=hot/);
    await page.keyboard.press("Escape");
    await expect(page).not.toHaveURL(/zone=kitchen/);
  });

  test("all zones clickable", async ({ page }) => {
    await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    const canvas = page.getByTestId("ls-venue-canvas");
    for (const name of [
      "Main Dining",
      "Kitchen",
      "Bar",
      "Terrace",
      "Delivery",
      "Entrance",
    ]) {
      await canvas.getByRole("button", { name }).click();
      await expect(page.getByTestId("ls-inspector")).toBeVisible();
      await page.getByTestId("ls-insp-close").click();
    }
  });

  test("horizon scrub and back forward", async ({ page }) => {
    await page.goto(`${LIVE}&level=venue&location=nyc-soho`);
    await page.getByTestId("ls-horizon-60").click();
    await expect(page).toHaveURL(/horizon=60/);
    await page.getByTestId("ls-horizon-120").click();
    await expect(page).toHaveURL(/horizon=120/);
    await page.goBack();
    await expect(page).toHaveURL(/horizon=60/, { timeout: 10000 });
    await page.goForward();
    await expect(page).toHaveURL(/horizon=120/, { timeout: 10000 });
  });

  test("kitchen station and table", async ({ page }) => {
    await page.goto(
      `${LIVE}&level=venue&location=nyc-soho&zone=kitchen&station=hot`,
    );
    await expect(page.getByTestId("ls-inspector")).toContainText("Hot");
    await expect(page.getByTestId("ls-inspector")).toContainText("42/hr");

    await page.goto(
      `${LIVE}&level=venue&location=nyc-soho&zone=main&table=t14`,
    );
    await expect(page.getByTestId("ls-inspector")).toContainText(/Table 14/i);
    await expect(page.getByTestId("ls-inspector")).toContainText(/HIGH/i);
  });
});
