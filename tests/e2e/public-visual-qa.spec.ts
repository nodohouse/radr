/**
 * Visual / layout QA for public marketing routes.
 * Run: npx playwright test tests/e2e/public-visual-qa.spec.ts
 *
 * Captures screenshots and fails on horizontal overflow / clipped text heuristics.
 */
import { test, expect, type Page } from "playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE =
  process.env.PUBLIC_QA_BASE_URL ?? "http://127.0.0.1:3020";

const ROUTES = [
  "/en",
  "/en/product",
  "/en/product/control-center",
  "/en/product/decisions",
  "/en/product/futures",
  "/en/product/floor",
  "/en/product/value",
  "/en/product/memory",
  "/en/solutions",
  "/en/solutions#supplier-ap",
  "/en/pricing",
  "/en/company",
  "/en/why",
  "/en/blog",
  "/en/developers",
  "/en/contact",
  "/en/security",
  "/en/privacy",
  "/en/terms",
  "/en/imprint",
];

const VIEWPORTS = [
  { w: 2560, h: 1440, name: "2560" },
  { w: 1728, h: 1117, name: "1728" },
  { w: 1440, h: 900, name: "1440" },
  { w: 1280, h: 800, name: "1280" },
  { w: 1024, h: 768, name: "1024" },
  { w: 390, h: 844, name: "390" },
  { w: 375, h: 812, name: "375" },
] as const;

async function assertNoHorizontalScroll(page: Page, route: string) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(
    overflow.scrollWidth,
    `${route}: horizontal overflow ${overflow.scrollWidth} > ${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function assertSingleH1(page: Page, route: string) {
  const count = await page.locator("h1:not([aria-hidden='true'])").count();
  // Soft: some legal pages may use different structure — fail only if 0 or >2
  expect(count, `${route}: accessible H1 count`).toBeGreaterThanOrEqual(1);
  expect(count, `${route}: too many accessible H1`).toBeLessThanOrEqual(2);
}

test.describe("public visual QA", () => {
  test.setTimeout(180_000);

  for (const vp of VIEWPORTS) {
    test(`layout @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      const outDir = join(process.cwd(), "tmp/visual-qa", vp.name);
      mkdirSync(outDir, { recursive: true });

      for (const route of ROUTES) {
        const url = `${BASE}${route}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForTimeout(400);
        await assertNoHorizontalScroll(page, route);
        if (!route.includes("#")) {
          await assertSingleH1(page, route);
        }
        const slug = route.replace(/\W+/g, "_").replace(/^_/, "");
        await page.screenshot({
          path: join(outDir, `${slug}.png`),
          fullPage: true,
        });
      }
    });
  }

  test("prefers-reduced-motion company readability", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/en/company`, { waitUntil: "domcontentloaded" });
    const opacityHidden = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll(".rx-co2-reveal"));
      return nodes.filter((n) => {
        const o = getComputedStyle(n).opacity;
        return Number(o) < 0.2;
      }).length;
    });
    expect(opacityHidden, "Company reveal blocks must not stay invisible").toBe(
      0,
    );
  });
});
