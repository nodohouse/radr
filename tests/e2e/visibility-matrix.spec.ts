/**
 * Visibility matrix — first-viewport critical surfaces + no body overflow.
 * Run: PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app npx playwright test tests/e2e/visibility-matrix.spec.ts
 */
import { test, expect } from "@playwright/test";
import {
  assertFullyVisible,
  assertNoBodyHorizontalOverflow,
} from "./visibility-helpers";

const ROUTES: {
  path: string;
  mustSee: string;
  label: string;
}[] = [
  { path: "/app?stay=1", mustSee: "#cc-review-now, .rp-handoff", label: "Control Center" },
  { path: "/app/decisions?band=needs_you", mustSee: "h1, .rp-ledger-head, [data-band]", label: "Decisions" },
  { path: "/app/value", mustSee: ".rp-value, .rp-ccx-command", label: "Value" },
  { path: "/app/service", mustSee: ".rp-service, .rp-smap, [data-map-first]", label: "Service Map" },
  { path: "/app/house", mustSee: ".rp-house, #house-judgment", label: "BOH" },
  { path: "/app/locations", mustSee: ".rp-locations, .rp-loc-estate, .rp-loc-table-scroll", label: "Locations" },
  { path: "/app/intelligence", mustSee: ".rp-intel-hub, .rp-intel-bento", label: "Intelligence" },
  { path: "/app/intelligence/menu", mustSee: ".rp-menu-intel, .rp-menu-ranks", label: "Menu" },
  { path: "/app/memory", mustSee: ".rp-memory-featured, .rp-ccx-queue", label: "Memory" },
  { path: "/app/settings", mustSee: ".rp-settings-nav, .rp-settings-panel", label: "Settings" },
];

for (const route of ROUTES) {
  test(`visibility · ${route.label} · ${route.path}`, async ({ page }, testInfo) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    await assertNoBodyHorizontalOverflow(page);

    const locator = page.locator(route.mustSee).first();
    await expect(locator).toBeVisible({ timeout: 12_000 });

    // First-viewport check only on desktop-ish heights
    const vp = page.viewportSize();
    if (vp && vp.width >= 1024 && vp.height >= 700) {
      await assertFullyVisible(locator);
    }

    await page.screenshot({
      path: `tmp/visibility/${testInfo.project.name}/${route.label.replace(/\s+/g, "-").toLowerCase()}-fold.png`,
      fullPage: false,
    });
  });
}

test("visibility · CC Review Now above fold at 1366×768", async ({ page }) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) !== 1366,
    "1366-only gate",
  );
  await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const review = page.locator("#cc-review-now, .rp-handoff").first();
  await expect(review).toBeVisible();
  await assertFullyVisible(review);
  await assertNoBodyHorizontalOverflow(page);
});
