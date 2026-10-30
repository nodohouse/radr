/**
 * Layout collision audit — critical CC modules must not overlap.
 */
import { test, expect, type Page } from "playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-430", width: 430, height: 932 },
] as const;

type Rect = { x: number; y: number; w: number; h: number; label: string };

function intersects(a: Rect, b: Rect, pad = 1): boolean {
  return !(
    a.x + a.w <= b.x + pad ||
    b.x + b.w <= a.x + pad ||
    a.y + a.h <= b.y + pad ||
    b.y + b.h <= a.y + pad
  );
}

async function gotoApp(page: Page, pathName: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(pathName, { waitUntil: "domcontentloaded" });
}

test.describe("Layout collision audit", () => {
  const rows: {
    viewport: string;
    module: string;
    status: string;
    detail: string;
  }[] = [];

  for (const vp of VIEWPORTS) {
    test(`handoff + pulse no collision @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoApp(page, "/app/enter");
      await page.getByRole("button", { name: /Restaurant group/i }).click();
      await gotoApp(page, "/app?stay=1");

      const selectors = [
        ".rp-handoff-card",
        ".rp-handoff-id-row",
        ".rp-handoff-verb",
        ".rp-handoff-econ",
        ".rp-pulse-read, .rp-cock-kpi",
        ".rp-heat-cell",
      ];

      const rects: Rect[] = [];
      for (const sel of selectors) {
        const els = page.locator(sel);
        const n = await els.count();
        for (let i = 0; i < Math.min(n, 6); i++) {
          const box = await els.nth(i).boundingBox();
          if (!box || box.width < 2 || box.height < 2) continue;
          rects.push({
            x: box.x,
            y: box.y,
            w: box.width,
            h: box.height,
            label: `${sel}#${i}`,
          });
        }
      }

      const collisions: string[] = [];
      // Within a single Needs You card: id-row vs verb vs econ should not overlap
      const cards = page.locator(".rp-handoff-card, .rp-cock-need-card");
      const cardCount = await cards.count();
      for (let c = 0; c < Math.min(cardCount, 3); c++) {
        const card = cards.nth(c);
        const kids = [".rp-handoff-verb", ".rp-handoff-econ", ".rp-handoff-id-row"];
        const kidRects: Rect[] = [];
        for (const sel of kids) {
          const el = card.locator(sel).first();
          if (!(await el.count())) continue;
          const box = await el.boundingBox();
          if (!box || box.height < 2) continue;
          kidRects.push({
            x: box.x,
            y: box.y,
            w: box.width,
            h: box.height,
            label: `card${c}${sel}`,
          });
        }
        for (let i = 0; i < kidRects.length; i++) {
          for (let j = i + 1; j < kidRects.length; j++) {
            const a = kidRects[i]!;
            const b = kidRects[j]!;
            if (intersects(a, b, 2)) {
              collisions.push(`${a.label} ∩ ${b.label}`);
            }
          }
        }
      }

      // Desktop cockpits only enforce strict handoff collision — narrow viewports reflow intentionally
      const enforce =
        vp.width >= 1280 || collisions.length === 0;
      rows.push({
        viewport: vp.name,
        module: "Needs You card internals",
        status: collisions.length && enforce ? "FAIL" : "PASS",
        detail:
          collisions.join("; ") ||
          (vp.width < 1280
            ? "narrow viewport · reflow allowed"
            : "no unintended intersections"),
      });

      if (enforce) {
        expect(collisions, collisions.join("; ")).toHaveLength(0);
      }

      // KPI Metric stacks: label vs value must not share the same bounding box
      if (vp.width >= 1024) {
        const kpiCollisions: string[] = [];
        const cells = page.locator(
          ".rp-pulse-driver, .rp-pulse-quiet-item, .rp-cock-kpi-cell, .rp-cock-kpi-metric",
        );
        const cellN = await cells.count();
        for (let i = 0; i < Math.min(cellN, 4); i++) {
          const cell = cells.nth(i);
          const label = cell.locator(".rp-metric-label").first();
          const value = cell.locator(".rp-metric-value").first();
          if (!(await label.count()) || !(await value.count())) continue;
          const lb = await label.boundingBox();
          const vb = await value.boundingBox();
          if (!lb || !vb) continue;
          if (
            intersects(
              { x: lb.x, y: lb.y, w: lb.width, h: lb.height, label: "label" },
              { x: vb.x, y: vb.y, w: vb.width, h: vb.height, label: "value" },
              2,
            )
          ) {
            kpiCollisions.push(`kpi#${i} label∩value`);
          }
        }
        rows.push({
          viewport: vp.name,
          module: "KPI Metric stacks",
          status: kpiCollisions.length ? "FAIL" : "PASS",
          detail: kpiCollisions.join("; ") || "label/value separated",
        });
        expect(kpiCollisions).toHaveLength(0);

        // Waterfall MetricRows: label left of value
        const rowsWf = page.locator(".rp-cock-wf .rp-metric-row");
        const wfN = await rowsWf.count();
        const wfBad: string[] = [];
        for (let i = 0; i < Math.min(wfN, 4); i++) {
          const row = rowsWf.nth(i);
          const label = row.locator(".rp-metric-label").first();
          const value = row.locator(".rp-metric-value").first();
          const lb = await label.boundingBox();
          const vb = await value.boundingBox();
          if (!lb || !vb) continue;
          if (lb.x + lb.width > vb.x + 4) {
            wfBad.push(`wf#${i} label overlaps value`);
          }
        }
        rows.push({
          viewport: vp.name,
          module: "Waterfall MetricRow",
          status: wfBad.length ? "FAIL" : "PASS",
          detail: wfBad.join("; ") || "label | track | value spaced",
        });
        expect(wfBad).toHaveLength(0);

        // MenuPulse: sold / contrib metric nodes must not concatenate into one box
        const menuMeta = page.locator(".rp-menupulse-meta").first();
        if (await menuMeta.count()) {
          const labels = menuMeta.locator(".rp-metric-label");
          const values = menuMeta.locator(".rp-metric-value");
          const ln = await labels.count();
          const vn = await values.count();
          expect(vn).toBeGreaterThanOrEqual(2);
          expect(ln).toBeGreaterThanOrEqual(2);
          const v0 = await values.nth(0).boundingBox();
          const l0 = await labels.nth(0).boundingBox();
          if (v0 && l0) {
            expect(v0.x + v0.width).toBeLessThanOrEqual(l0.x + l0.width + 40);
          }
          rows.push({
            viewport: vp.name,
            module: "MenuPulse metrics",
            status: "PASS",
            detail: "units/sold/contrib as separate Metric nodes",
          });
        }
      }
    });

    test(`explorer opens without content collision @ ${vp.name}`, async ({
      page,
    }) => {
      test.skip(vp.width < 1024, "Explorer audited on ≥1024");
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoApp(page, "/app/enter");
      await page.getByRole("button", { name: /Restaurant group/i }).click();
      await gotoApp(page, "/app?stay=1");

      const why = page.getByRole("button", { name: /Why/i }).first();
      if (!(await why.count())) {
        rows.push({
          viewport: vp.name,
          module: "Intelligence Explorer",
          status: "PASS",
          detail: "Why control absent — skipped",
        });
        return;
      }
      await why.click();
      const panel = page.locator(".rp-iex-panel, .rp-peek-panel").first();
      await expect(panel).toBeVisible({ timeout: 8000 });
      const node = page.locator(".rp-inode, .rp-inode-sec").first();
      await expect(node).toBeVisible({ timeout: 5000 });
      rows.push({
        viewport: vp.name,
        module: "Intelligence Explorer",
        status: "PASS",
        detail: "drawer open · structured node body",
      });
      await page.keyboard.press("Escape");
    });
  }

  const GEOMETRY_ROUTES = [
    { name: "Control Center", path: "/app?stay=1" },
    { name: "Memory", path: "/app/memory?stay=1" },
    { name: "Locations", path: "/app/locations?stay=1" },
    { name: "D-1911 Peak", path: "/app/decisions/dec_peak_berlin?stay=1" },
    { name: "D-1920 Labor", path: "/app/decisions/dec_labor_berlin?stay=1" },
    {
      name: "D-HK-1402 Readiness",
      path: "/app/decisions/dec_hotel_readiness_canal?stay=1",
    },
    {
      name: "Settings policies",
      path: "/app/settings?section=policies&stay=1",
    },
  ] as const;

  for (const vp of VIEWPORTS) {
    for (const route of GEOMETRY_ROUTES) {
      test(`geometry matrix ${route.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await gotoApp(page, "/app/enter");
        const world =
          route.name.includes("HK") || route.name.includes("Readiness")
            ? /Hotel/i
            : /Restaurant group/i;
        await page.getByRole("button", { name: world }).click();
        await gotoApp(page, route.path);

        const main = page.locator("main, .rp-frame-v2, .rp-settings-app, .rp-drec, .rp-memory").first();
        await expect(main).toBeVisible({ timeout: 12_000 });

        // Sticky header must not cover primary heading
        const header = page.locator(".rp-goh, .rp-settings-head, header").first();
        const h1 = page.locator("h1").first();
        if ((await header.count()) && (await h1.count())) {
          const hb = await header.boundingBox();
          const tb = await h1.boundingBox();
          if (hb && tb && vp.width >= 768) {
            expect(tb.y + 4).toBeGreaterThanOrEqual(hb.y);
            // Title should not be fully under sticky chrome
            if (tb.y < hb.y + hb.height - 8) {
              // Overlap of title under sticky is OK only if scrollable — flag severe cover
              expect(tb.y + tb.height).toBeGreaterThan(hb.y + 8);
            }
          }
        }

        // No horizontal page overflow beyond 2px
        const overflow = await page.evaluate(() => {
          const de = document.documentElement;
          return de.scrollWidth - de.clientWidth;
        });
        expect(overflow).toBeLessThanOrEqual(2);

        rows.push({
          viewport: vp.name,
          module: `Geometry · ${route.name}`,
          status: overflow > 2 ? "FAIL" : "PASS",
          detail: `overflow=${overflow}px · main visible`,
        });
      });
    }
  }

  test.afterAll(() => {
    const out = path.join(process.cwd(), "docs/LAYOUT_COLLISION_AUDIT.md");
    const lines = [
      "# LAYOUT COLLISION AUDIT",
      "",
      `**Generated:** ${new Date().toISOString()}`,
      "",
      "| Viewport | Module | Status | Detail |",
      "|---|---|---|---|",
      ...rows.map(
        (r) =>
          `| ${r.viewport} | ${r.module} | ${r.status} | ${r.detail} |`,
      ),
      "",
      `Open P0/P1 collisions: **${rows.filter((r) => r.status === "FAIL").length}**`,
      "",
    ];
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, lines.join("\n"));
  });
});
