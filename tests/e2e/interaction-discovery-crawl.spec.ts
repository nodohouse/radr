/**
 * Discovery interaction crawler — finds interactive elements dynamically.
 * Writes INTERACTION_AUDIT.md at repo root.
 *
 *   npx playwright test tests/e2e/interaction-discovery-crawl.spec.ts --project=desktop-1440
 */
import { test, expect, type Page, type Locator } from "playwright/test";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "tmp/interaction-audit");
const MD = join(process.cwd(), "INTERACTION_AUDIT.md");

type Status = "PASS" | "FAIL" | "SKIP";
type Severity = "P0" | "P1" | "P2" | "";

type Row = {
  route: string;
  element: string;
  expected: string;
  actual: string;
  status: Status;
  severity: Severity;
  screenshot: string;
  fix: string;
};

const rows: Row[] = [];

function writeRow(row: Row) {
  rows.push(row);
  appendFileSync(
    MD,
    `| ${row.route} | ${row.element.replace(/\|/g, "/")} | ${row.expected.replace(/\|/g, "/")} | ${row.actual.replace(/\|/g, "/")} | ${row.status} | ${row.severity || "—"} | ${row.screenshot || "—"} | ${row.fix.replace(/\|/g, "/")} |\n`,
  );
}

const SEED_ROUTES = [
  "/app?stay=1",
  "/app/decisions?stay=1",
  "/app/decisions/dec_peak_berlin?stay=1",
  "/app/service?stay=1",
  "/app/house?stay=1",
  "/app/intelligence?stay=1",
  "/app/intelligence/menu?stay=1",
  "/app/memory?stay=1",
  "/app/value?stay=1",
  "/app/locations?stay=1",
  "/app/locations/loc_berlin_mitte?stay=1",
  "/app/compare?locations=loc_hamburg_hafen,loc_berlin_mitte&transfer=xfer_wine_hamburg&stay=1",
  "/app/connections?stay=1",
  "/app/data-health?stay=1",
  "/app/settings?stay=1",
  "/app/dashboards?stay=1",
];

const PRIMARY_NAV = [
  { label: "Center", href: "/app" },
  { label: "Decisions", href: "/app/decisions" },
  { label: "Service", href: "/app/service" },
  { label: "BOH", href: "/app/house" },
  { label: "Intelligence", href: "/app/intelligence" },
  { label: "Memory", href: "/app/memory" },
  { label: "Value", href: "/app/value" },
  { label: "Locations", href: "/app/locations" },
];

async function pageHealthy(page: Page) {
  const body = await page.locator("body").innerText().catch(() => "");
  expect(body).not.toMatch(/Application error|Internal Server Error/i);
  expect(body).not.toMatch(/Loading comparison…/);
  const stuck = await page.getByText("Comparison did not finish loading").count();
  expect(stuck).toBe(0);
}

async function discoverInteractives(page: Page): Promise<Locator[]> {
  // Content only — shell chrome tested separately to avoid overlay traps.
  const root = page.locator(".rp-content-v2").first();
  const sel =
    "a[href], button:not([disabled]), [role='button']:not([aria-disabled='true']), [role='tab'], select, summary";
  const all = root.locator(sel);
  const n = await all.count();
  const out: Locator[] = [];
  for (let i = 0; i < Math.min(n, 40); i++) {
    const el = all.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.width < 4 || box.height < 4) continue;
    out.push(el);
  }
  return out;
}

async function dismissOverlays(page: Page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(80);
  await page.keyboard.press("Escape").catch(() => {});
}

test.describe("interaction discovery crawl", () => {
  test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(
      MD,
      `# INTERACTION_AUDIT

Generated: ${new Date().toISOString()}
Base: ${process.env.PRODUCT_QA_BASE_URL ?? "local"}

| ROUTE | ELEMENT | EXPECTED | ACTUAL | STATUS | SEVERITY | SCREENSHOT | FIX |
|---|---|---|---|---|---|---|---|
`,
    );
  });

  test.afterAll(() => {
    const fail = rows.filter((r) => r.status === "FAIL");
    const p0 = fail.filter((r) => r.severity === "P0").length;
    const p1 = fail.filter((r) => r.severity === "P1").length;
    appendFileSync(
      MD,
      `\n## Summary\n\nTotal: ${rows.length} · Pass: ${rows.filter((r) => r.status === "PASS").length} · Fail: ${fail.length}\n\nP0: **${p0}** · P1: **${p1}**\n\nRelease gate: P0 = 0 and P1 = 0.\n`,
    );
  });

  test("primary nav + More menu work", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await dismissOverlays(page);

    for (const item of PRIMARY_NAV) {
      const link = page.locator("nav[aria-label='Primary'] a", {
        hasText: item.label,
      }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      await link.click();
      await page.waitForTimeout(400);
      await dismissOverlays(page);
      const path = new URL(page.url()).pathname.replace(/\/$/, "") || "/app";
      const expected = item.href.replace(/\/$/, "") || "/app";
      const ok =
        path === expected ||
        (expected !== "/app" && path.startsWith(`${expected}/`));
      const shot = join(OUT, `nav-${item.label}-${testInfo.project.name}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      writeRow({
        route: page.url(),
        element: `Primary · ${item.label}`,
        expected: `navigate to ${item.href}`,
        actual: ok ? "navigated" : page.url(),
        status: ok ? "PASS" : "FAIL",
        severity: ok ? "" : "P0",
        screenshot: shot,
        fix: ok ? "" : "Fix nav href / active routing",
      });
      expect(ok).toBe(true);
      await pageHealthy(page);
    }

    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await dismissOverlays(page);
    const more = page.locator(".rp-goh-more-btn").first();
    await expect(more).toBeVisible();
    await more.click();
    const panel = page.locator(".rp-goh-more-panel");
    await expect(panel).toBeVisible();
    for (const label of ["Connections", "Data Health", "Settings", "Dashboards"]) {
      const item = panel.getByRole("menuitem", { name: new RegExp(label, "i") });
      const count = await item.count();
      writeRow({
        route: "/app",
        element: `More · ${label}`,
        expected: "menuitem present",
        actual: count ? "present" : "missing",
        status: count ? "PASS" : "FAIL",
        severity: count ? "" : "P0",
        screenshot: "",
        fix: count ? "" : "Add to HEADER_MORE_NAV",
      });
      expect(count).toBeGreaterThan(0);
    }
    const healthCopy = await panel.locator(".rp-goh-more-item[data-tone]").count();
    writeRow({
      route: "/app",
      element: "More · Data Health state",
      expected: "degraded/stale state shown",
      actual: healthCopy ? "state present" : "no tone state",
      status: healthCopy ? "PASS" : "FAIL",
      severity: healthCopy ? "" : "P1",
      screenshot: "",
      fix: healthCopy ? "" : "Surface dataHealthSummaryForRole in More row",
    });

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  });

  test("compare wine transfer never infinite-loads", async ({ page }) => {
    await page.goto(
      "/app/compare?locations=loc_hamburg_hafen,loc_berlin_mitte&transfer=xfer_wine_hamburg&stay=1",
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.getByText("Loading comparison…")).toHaveCount(0, {
      timeout: 12_000,
    });
    await expect(page.getByText(/Wine attach/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("link", { name: /Create test Decision/i }),
    ).toBeVisible();
    writeRow({
      route: "/app/compare?transfer=xfer_wine_hamburg",
      element: "Wine transfer brief",
      expected: "resolves with Create test Decision",
      actual: "resolved",
      status: "PASS",
      severity: "",
      screenshot: "",
      fix: "",
    });
  });

  test("discover + click interactives on major routes", async ({ page }, testInfo) => {
    test.setTimeout(360_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const route of SEED_ROUTES) {
      const consoleErrors: string[] = [];
      const onErr = (e: Error) => consoleErrors.push(e.message);
      page.on("pageerror", onErr);

      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(300);
      await dismissOverlays(page);
      try {
        await pageHealthy(page);
      } catch (e) {
        const shot = join(
          OUT,
          `fail-${route.replace(/[/?=&]/g, "_")}.png`,
        );
        await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
        writeRow({
          route,
          element: "page",
          expected: "healthy render",
          actual: String(e).slice(0, 120),
          status: "FAIL",
          severity: "P0",
          screenshot: shot,
          fix: "Fix render / infinite loading",
        });
        page.off("pageerror", onErr);
        continue;
      }

      const els = await discoverInteractives(page);
      let clicked = 0;
      for (const el of els) {
        if (clicked >= 10) break;
        const tag = await el
          .evaluate((n) => {
            const t = (n as HTMLElement).tagName.toLowerCase();
            const role = n.getAttribute("role") || "";
            const text = (n.textContent || "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 40);
            const href = n.getAttribute("href") || "";
            return `${t}${role ? `[${role}]` : ""} ${text}${href ? ` → ${href}` : ""}`;
          })
          .catch(() => "unknown");

        if (/sign out|delete|logout/i.test(tag)) continue;
        if (tag.includes("→ http")) continue;

        const before = page.url();
        try {
          await el.click({ timeout: 2_000 });
          await page.waitForTimeout(150);
          await dismissOverlays(page);
          if (consoleErrors.length) {
            writeRow({
              route,
              element: tag,
              expected: "no exception",
              actual: consoleErrors[0]!.slice(0, 100),
              status: "FAIL",
              severity: "P0",
              screenshot: "",
              fix: "Fix click handler exception",
            });
            consoleErrors.length = 0;
          } else {
            writeRow({
              route,
              element: tag,
              expected: "UI responds",
              actual:
                page.url() !== before
                  ? `nav ${page.url()}`
                  : "state change / no crash",
              status: "PASS",
              severity: "",
              screenshot: "",
              fix: "",
            });
          }
          clicked++;
          const seedPath = route.split("?")[0]!;
          if (!page.url().includes(seedPath)) {
            await page.goto(route, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(150);
            await dismissOverlays(page);
          }
        } catch {
          await dismissOverlays(page);
          writeRow({
            route,
            element: tag,
            expected: "clickable",
            actual: "click failed / covered",
            status: "SKIP",
            severity: "",
            screenshot: "",
            fix: "Inspect overlay / disabled reason",
          });
        }
      }

      const shot = join(
        OUT,
        `${testInfo.project.name}-${route.replace(/[/?=&]/g, "_")}.png`,
      );
      await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
      writeRow({
        route,
        element: "page screenshot",
        expected: "capture",
        actual: "saved",
        status: "PASS",
        severity: "",
        screenshot: shot,
        fix: "",
      });
      page.off("pageerror", onErr);
    }
  });
});
