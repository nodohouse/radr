/**
 * Visual polish baselines — screenshots only (no assertions).
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3030 npx playwright test tests/e2e/visual-polish-baselines.spec.ts --project=desktop-1440
 */
import { test, type Page } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "tmp/visual-baselines");
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "430", width: 430, height: 932 },
] as const;

const ROUTES: { id: string; path: string }[] = [
  { id: "cc", path: "/app?stay=1" },
  { id: "decisions", path: "/app/decisions?stay=1" },
  { id: "d1911", path: "/app/decisions/dec_peak_berlin?stay=1" },
  { id: "d7501", path: "/app/decisions/dec_margin_coke_berlin?stay=1" },
  { id: "d8204", path: "/app/decisions/dec_caster_sugar_berlin?stay=1" },
  { id: "value", path: "/app/value?stay=1" },
  { id: "locations", path: "/app/locations?stay=1" },
  { id: "berlin", path: "/app/locations/loc_berlin_mitte?stay=1" },
  { id: "service", path: "/app/service?stay=1" },
  { id: "boh", path: "/app/house?stay=1" },
  { id: "memory", path: "/app/memory?stay=1" },
  { id: "intel", path: "/app/intelligence?stay=1" },
  { id: "menu", path: "/app/intelligence/menu?stay=1" },
  { id: "connections", path: "/app/connections?stay=1" },
  { id: "data-health", path: "/app/data-health?stay=1" },
  { id: "settings", path: "/app/settings?stay=1" },
  { id: "dashboards", path: "/app/dashboards?stay=1" },
];

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

test.describe("Visual baselines", () => {
  test("capture major routes", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await enterRestaurant(page);
    // Primary viewport pack
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ROUTES) {
        // Full matrix only at 1440; others get CC + service + settings
        if (
          vp.name !== "1440" &&
          !["cc", "service", "settings", "berlin", "menu"].includes(route.id)
        ) {
          continue;
        }
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(350);
        const file = path.join(OUT, `${route.id}@${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
      }
    }
  });
});
