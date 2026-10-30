import { expect, test, type Page } from "playwright/test";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3111";

async function enterRestaurant(page: Page) {
  await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/);
}

test.describe("Restaurant GM Control Center", () => {
  test("Soho · New York · grill constraint · D-1911 seating hold @ 1512×982", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await enterRestaurant(page);
    await page.goto(`${BASE}/app?stay=1`, { waitUntil: "networkidle" });

    const root = page.getByTestId("restaurant-gm-cc");
    await expect(root).toBeVisible();

    // P0 — never Canal House under Restaurants
    await expect(page.getByRole("button", { name: /Scope/i })).toContainText(
      /Soho · New York/i,
    );
    await expect(page.locator("body")).not.toContainText(
      /Restaurants\s*\/\s*Canal House/i,
    );

    await expect(page.getByRole("heading", { name: /GM Control Center/i })).toBeVisible();
    await expect(root).toContainText("€18,420");
    await expect(root).toContainText("€6,870");
    await expect(root).toContainText("124");
    await expect(root).toContainText("€148");
    await expect(root).toContainText("26.1%");
    await expect(root).toContainText(/93% booked capacity/i);
    await expect(root).not.toContainText("112 / 12");

    await expect(page.getByTestId("gm-cc-conclusion")).toContainText(
      /Dinner is ahead/i,
    );
    await expect(page.getByTestId("gm-cc-conclusion")).toContainText(
      /Grill becomes the constraint at 20:10/i,
    );

    const decision = page.getByTestId("gm-cc-decision");
    await expect(decision).toContainText(/Hold next seating wave for 12 min/i);
    await expect(decision).not.toContainText(/Add 1 FOH/i);
    await expect(decision).toContainText("$620");
    await expect(decision).toContainText("82%");
    await expect(decision).toContainText("19:59");

    await expect(page.getByTestId("gm-cc-needs-you")).toContainText(
      /Peak capacity collision/i,
    );
    await expect(page.getByTestId("gm-cc-needs-you")).not.toContainText(
      /labor plan for late service/i,
    );

    await expect(page.getByTestId("gm-cc-verified")).toContainText("€3,793");

    const shot = path.join(
      process.cwd(),
      "tmp/restaurant-gm-cc-premium-1512x982.png",
    );
    await page.screenshot({ path: shot, fullPage: false });

    await page.getByTestId("gm-cc-why-now").click();
    await expect(page.getByTestId("gm-cc-why-panel")).toContainText(/Kitchen load/i);
    await page.getByTestId("gm-cc-pulse").hover({ position: { x: 400, y: 120 } });
  });
});
