/**
 * Launch pass Phase 0 — screenshot + interaction smoke baselines.
 * Artifacts: docs/baselines/2026-10-05/
 *
 * PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
 *   npx playwright test tests/e2e/launch-baseline-capture.spec.ts --project=desktop-1440
 */
import { test, expect, type Page } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "docs/baselines/2026-10-05");

const ROUTES: { id: string; path: string; assert?: RegExp }[] = [
  { id: "cc", path: "/app?stay=1", assert: /Control Center|SITUATION|Revenue/i },
  { id: "decisions", path: "/app/decisions?stay=1", assert: /Decision|Needs/i },
  { id: "d1911", path: "/app/decisions/dec_peak_berlin?stay=1", assert: /D-1911|WAIT|Peak/i },
  { id: "d8204", path: "/app/decisions/dec_caster_sugar_berlin?stay=1", assert: /D-8204|Caster|sugar/i },
  { id: "d4102", path: "/app/decisions/dec_supplier_berlin?stay=1", assert: /D-4102|Supplier|credit/i },
  { id: "dhk1402", path: "/app/decisions/dec_hotel_readiness_canal?stay=1", assert: /D-HK|Readiness|Canal/i },
  { id: "value", path: "/app/value?stay=1", assert: /Verified|TRACE|€/i },
  { id: "house", path: "/app/house?stay=1", assert: /house|Needs|BOH|stock/i },
  { id: "service", path: "/app/service?stay=1", assert: /Floor|Timeline|Recovery|capacity/i },
  { id: "locations", path: "/app/locations?stay=1", assert: /Location|Revenue|Contribution/i },
  { id: "berlin", path: "/app/locations/loc_berlin_mitte?stay=1", assert: /Berlin|Contribution/i },
  { id: "menu", path: "/app/intelligence/menu?stay=1", assert: /Menu|Tuna|contribution/i },
  { id: "intel", path: "/app/intelligence?stay=1", assert: /Intelligence|contribution|question/i },
  { id: "memory", path: "/app/memory?stay=1", assert: /Memory|accurate|Playbook|14\.2/i },
  { id: "connections", path: "/app/connections?stay=1", assert: /Connection|POS|status/i },
  { id: "data-health", path: "/app/data-health?stay=1", assert: /Health|Fresh|source/i },
  { id: "settings", path: "/app/settings?stay=1", assert: /Organization|Settings|Policies/i },
  { id: "dashboards", path: "/app/dashboards?stay=1", assert: /Dashboard/i },
];

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
    { name: "radr_e2e", value: "1", domain: "prep-ten-zeta.vercel.app", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  const restaurant = page.getByRole("button", { name: /Restaurant/i });
  if (await restaurant.isVisible().catch(() => false)) {
    await restaurant.click();
    await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
  }
}

test.describe("Launch baseline freeze", () => {
  test("capture + smoke major routes @1440", async ({ page }) => {
    test.setTimeout(180_000);
    fs.mkdirSync(OUT, { recursive: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterRestaurant(page);

    const manifest: { id: string; path: string; ok: boolean; note?: string }[] =
      [];

    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const body = await page.locator("body").innerText().catch(() => "");
      const ok = route.assert ? route.assert.test(body) : body.length > 40;
      await page.screenshot({
        path: path.join(OUT, `${route.id}@1440.png`),
        fullPage: false,
      });
      manifest.push({
        id: route.id,
        path: route.path,
        ok,
        note: ok ? undefined : "assert miss",
      });
      expect(ok, `${route.id} smoke`).toBe(true);
    }

    // Hotel world → CC smoke
    await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
    const hotel = page.getByRole("button", { name: /Hotel/i });
    if (await hotel.isVisible().catch(() => false)) {
      await hotel.click();
      await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
      await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(OUT, `cc-hotel@1440.png`),
        fullPage: false,
      });
      manifest.push({ id: "cc-hotel", path: "/app?stay=1", ok: true });
    }

    fs.writeFileSync(
      path.join(OUT, "manifest.json"),
      JSON.stringify(
        { capturedAt: new Date().toISOString(), routes: manifest },
        null,
        2,
      ),
    );
  });
});
