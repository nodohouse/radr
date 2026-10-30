/**
 * Visual polish — collision geometry + Command Stage smoke (no data assertions beyond presence).
 */
import { test, expect, type Page } from "playwright/test";
import { gotoSettings } from "./helpers/settings";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "430", width: 430, height: 932 },
] as const;

const CRITICAL = [
  "/app?stay=1",
  "/app/service?stay=1",
  "/app/house?stay=1",
  "/app/intelligence/menu?stay=1",
  "/app/locations/loc_berlin_mitte?stay=1",
  "/app/settings?section=policies&stay=1",
  "/app/decisions/dec_peak_berlin?stay=1",
] as const;

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

async function countOverlaps(page: Page): Promise<number> {
  return page.evaluate(() => {
    const selectors = [
      "[data-stage='command']",
      ".rp-cock-mod",
      ".rp-smap-head",
      ".rp-smap-toolbar",
      ".rp-smap-layout > *",
      ".rp-smap-drawer",
      ".rp-settings-nav",
      ".rp-settings-panel",
      ".rp-menu-rank-row",
      ".rp-loc-cmd-rail",
      ".rp-drec-econ-hero",
    ];
    const nodes: HTMLElement[] = [];
    for (const sel of selectors) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 12 || r.height < 12) return;
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return;
        nodes.push(el);
      });
    }
    let hits = 0;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!.getBoundingClientRect();
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i]!.contains(nodes[j]!) || nodes[j]!.contains(nodes[i]!)) {
          continue;
        }
        const b = nodes[j]!.getBoundingClientRect();
        const ox = Math.max(
          0,
          Math.min(a.right, b.right) - Math.max(a.left, b.left),
        );
        const oy = Math.max(
          0,
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
        );
        if (ox > 12 && oy > 12) hits += 1;
      }
    }
    return hits;
  });
}

test.describe("Visual polish gate", () => {
  for (const vp of VIEWPORTS) {
    test(`no critical overlaps @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await enterRestaurant(page);
      for (const path of CRITICAL) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(200);
        const hits = await countOverlaps(page);
        expect(hits, `overlaps on ${path} @ ${vp.name}`).toBe(0);
      }
    });
  }

  test("Command Stage present · judgment dominant · 146 line · REVIEW NOW", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-stage="command"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /3 need your judgment/i }),
    ).toBeVisible();
    await expect(page.getByText(/146\s+evaluated/i)).toBeVisible();
    await expect(page.getByText(/141\s+cleared/i)).toBeVisible();
    await expect(page.getByText(/REVIEW NOW/i)).toBeVisible();
    // Canonical Decision IDs still present on CC
    await expect(page.getByText(/D-1911/i).first()).toBeVisible();
  });

  test("Service Map · table number + state · zones · D-1911", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/service?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Floor/i })).toBeVisible();
    await expect(page.locator(".rp-smap-table-num").first()).toBeVisible();
    await expect(page.locator(".rp-smap-table-state").first()).toBeVisible();
    await page.getByRole("button", { name: /Table 6/i }).click();
    await expect(page.getByText(/WAIT 12 MIN/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /D-1911/i })).toBeVisible();
  });

  test("Settings stays boring · no Command Stage", async ({ page }) => {
    await enterRestaurant(page);
    await gotoSettings(page, "/app/settings?stay=1");
    await expect(page.locator('[data-stage="command"]')).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Configuration/i }),
    ).toBeVisible();
  });

  test("Service Map · readable zone density + inbound wave (no overlaps)", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/service?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Floor/i })).toBeVisible();
    // Full English density lives in HTML legend (not colliding SVG labels)
    await expect(
      page.locator(".rp-smap-zone-legend").getByText(/Dense · peak collision/i),
    ).toBeVisible();
    await expect(
      page.locator(".rp-smap-zone-legend").getByText(/Moderate · VIP hold/i),
    ).toBeVisible();
    await expect(
      page.locator(".rp-smap-zone-legend").getByText(/Soft · weather risk/i),
    ).toBeVisible();
    await expect(
      page.locator(".rp-smap-inbound-wave").getByText(/Peak pressure inbound/i),
    ).toBeVisible();
    // SVG floor keeps short zone names only
    await expect(page.locator(".rp-smap-zone-t").first()).toBeVisible();
  });
});