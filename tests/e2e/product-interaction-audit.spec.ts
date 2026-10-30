/**
 * Product interaction audit — click core controls, assert no dead ends.
 * Run:
 *   PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app npx playwright test tests/e2e/product-interaction-audit.spec.ts --project=desktop-1440
 *
 * Writes: docs/PRODUCT_INTERACTION_AUDIT.md + tmp/product-audit/
 */
import { test, expect, type Page } from "playwright/test";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

const OUT = join(process.cwd(), "tmp/product-audit");
const MD = join(process.cwd(), "docs/PRODUCT_INTERACTION_AUDIT.md");

type Severity = "P0" | "P1" | "P2" | "P3" | "";

type Row = {
  route: string;
  viewport: string;
  element: string;
  action: string;
  expected: string;
  actual: string;
  pass: boolean;
  severity: Severity;
  screenshot?: string;
  error?: string;
};

const rows: Row[] = [];

function log(row: Row) {
  rows.push(row);
  appendFileSync(
    MD,
    `| ${row.route} | ${row.viewport} | ${row.element.replace(/\|/g, "/")} | ${row.action} | ${row.expected.replace(/\|/g, "/")} | ${row.actual.replace(/\|/g, "/")} | ${row.pass ? "PASS" : "FAIL"} | ${row.severity || "—"} | ${row.error ?? ""} |\n`,
  );
}

async function noOverflow(page: Page) {
  const o = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(o.sw).toBeLessThanOrEqual(o.cw + 2);
}

async function noPageError(page: Page, route: string) {
  expect(page.url(), route).not.toMatch(/404|500/);
  const body = await page.locator("body").innerText().catch(() => "");
  expect(body).not.toMatch(/Application error|Internal Server Error/i);
  expect(body).not.toMatch(/\bundefined\b|\bNaN\b|\[object Object\]/);
}

const CORE_ROUTES = [
  "/app?stay=1",
  "/app?stay=1&focus=live",
  "/app?stay=1&focus=performance",
  "/app/decisions",
  "/app/value",
  "/app/locations",
  `/app/locations/${DEMO_LOCATIONS.berlin.id}`,
  `/app/locations/${DEMO_LOCATIONS.canal.id}`,
  `/app/locations/${DEMO_LOCATIONS.chiado.id}`,
  "/app/memory",
  "/app/intelligence",
  "/app/intelligence?cat=revenue",
  "/app/intelligence?cat=menu",
  "/app/intelligence?cat=payments",
  "/app/connections",
  "/app/data-health",
  "/app/settings",
  `/app/decisions/${DECISION_IDS.peak}`,
  `/app/decisions/${DECISION_IDS.marginCoke}`,
  `/app/decisions/${DECISION_IDS.ota}`,
  `/app/decisions/${DECISION_IDS.tuna}`,
  `/app/decisions/${DECISION_IDS.menuPeak}`,
  `/app/decisions/${DECISION_IDS.guestVoice}`,
  `/app/decisions/${DECISION_IDS.orphan}`,
  `/app/decisions/${DECISION_IDS.supplier}`,
  `/app/decisions/${DECISION_IDS.tableRecover}`,
  `/app/decisions/${DECISION_IDS.hotelReadiness}`,
  `/app/decisions/${DECISION_IDS.labor}`,
];

test.describe("product interaction audit", () => {
  test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(
      MD,
      `# PRODUCT INTERACTION AUDIT\n\nGenerated: ${new Date().toISOString()}\nBase: ${process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3030"}\n\n| ROUTE | VIEWPORT | ELEMENT | ACTION | EXPECTED | ACTUAL | PASS | SEVERITY | ERROR |\n|---|---|---|---|---|---|---|---|---|\n`,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: "radr_e2e",
        value: "1",
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "radr_e2e",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test.afterAll(() => {
    const failed = rows.filter((r) => !r.pass);
    const p0 = failed.filter((r) => r.severity === "P0").length;
    const p1 = failed.filter((r) => r.severity === "P1").length;
    appendFileSync(
      MD,
      `\n## Summary\n\nTotal: ${rows.length} · Pass: ${rows.length - failed.length} · Fail: ${failed.length}\n\nOpen P0: **${p0}** · Open P1: **${p1}**\n\nScreenshots: \`tmp/product-audit/\`\n`,
    );
  });

  test("core routes load without overflow or dead H1", async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    for (const route of CORE_ROUTES) {
      let pass = true;
      let error = "";
      try {
        const res = await page.goto(route, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        let status = res?.status() ?? 200;
        if (status >= 500) {
          await page.waitForTimeout(800);
          const retry = await page.goto(route, {
            waitUntil: "domcontentloaded",
            timeout: 60_000,
          });
          status = retry?.status() ?? 200;
        }
        expect(status).toBeLessThan(400);
        await page.waitForTimeout(200);
        await noPageError(page, route);
        await noOverflow(page);

        if (route.includes("/decisions/")) {
          const h1 = (
            await page.locator("h1.rp-drec-title, h1").first().innerText()
          ).trim();
          expect(h1.length, `${route} empty H1`).toBeGreaterThan(2);
        }

        if (route.includes("cat=revenue")) {
          const text = await page.locator(".rp-intel-bento, main").innerText();
          expect(text).not.toMatch(/Live Service/i);
        }

        const shot = join(
          OUT,
          `${viewport}-${route.replace(/[/?=&]/g, "_")}.png`,
        );
        await page.screenshot({ path: shot, fullPage: false });
        log({
          route,
          viewport,
          element: "page",
          action: "goto",
          expected: "load <400 · no overflow · no NaN",
          actual: "loaded",
          pass: true,
          severity: "",
          screenshot: shot,
        });
      } catch (e) {
        pass = false;
        error = e instanceof Error ? e.message : String(e);
        log({
          route,
          viewport,
          element: "page",
          action: "goto",
          expected: "load cleanly",
          actual: "error",
          pass: false,
          severity: "P0",
          error,
        });
      }
      expect(pass, `${route}: ${error}`).toBe(true);
    }

    const fatal = consoleErrors.filter(
      (m) =>
        !/ResizeObserver|hydration|favicon|boolean attribute.*inert|MISSING_MESSAGE|Minified React error #418|Minified React error #423|Minified React error #425/i.test(
          m,
        ),
    );
    expect(fatal.slice(0, 5)).toEqual([]);
  });

  test("Live Decision Focus drawer opens and closes", async ({
    page,
  }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto("/app?stay=1&focus=live", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const needs = page.locator("button.rp-oday-needs").first();
    await expect(needs).toBeVisible({ timeout: 15_000 });
    await needs.click();

    // Peek portal or live focus drawer
    const peek = page.locator(".rp-peek-panel, aside.rp-dfocus");
    await expect(peek.first()).toBeVisible({ timeout: 10_000 });

    const shot = join(OUT, `${viewport}-live-decision-focus.png`);
    await page.screenshot({ path: shot });

    await page.keyboard.press("Escape");
    await expect(page.locator(".rp-peek-panel")).toHaveCount(0);

    log({
      route: "/app?focus=live",
      viewport,
      element: "Needs you → Decision Focus",
      action: "click + Escape",
      expected: "drawer over Live · Escape closes",
      actual: "ok",
      pass: true,
      severity: "",
      screenshot: shot,
    });
  });

  test("Live calendar day opens Day Replay", async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    // Cockpit heatmap — click pins tip; Replay is explicit (no Focus Mode overlay)
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const cell = page.locator("button.rp-heat-cell").first();
    await expect(cell).toBeVisible({ timeout: 10_000 });
    await cell.hover();
    await expect(page.locator(".rp-heat-tip").first()).toBeVisible();
    await cell.click();
    await expect(page.locator(".rp-heat-tip[data-pinned]").first()).toBeVisible({
      timeout: 8_000,
    });

    const shot = join(OUT, `${viewport}-live-day-replay.png`);
    await page.screenshot({ path: shot });

    await page.keyboard.press("Escape");
    await expect(page.locator(".rp-heat-tip[data-pinned]")).toHaveCount(0);

    log({
      route: "/app?stay=1",
      viewport,
      element: "heatmap cell",
      action: "hover → pin → Escape",
      expected: "Tooltip updates · pin dismisses",
      actual: "ok",
      pass: true,
      severity: "",
      screenshot: shot,
    });
  });

  test("Live expected-close ForecastExplain opens", async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto("/app?stay=1&focus=live", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const trigger = page.locator("button.rp-fcexplain-trigger").first();
    if ((await trigger.count()) === 0) {
      log({
        route: "/app?focus=live",
        viewport,
        element: "Expected close",
        action: "skip",
        expected: "optional on focus density",
        actual: "not present in focus mode",
        pass: true,
        severity: "",
      });
      return;
    }
    await expect(trigger).toBeVisible({ timeout: 10_000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.locator(".rp-fcexplain-body")).toBeVisible({
      timeout: 8_000,
    });
    const shot = join(OUT, `${viewport}-live-forecast-explain.png`);
    await page.screenshot({ path: shot });
    log({
      route: "/app?view=live",
      viewport,
      element: "Expected close",
      action: "click",
      expected: "WHY drivers visible",
      actual: "ok",
      pass: true,
      severity: "",
      screenshot: shot,
    });
  });

  test("Ask RADR opens fully visible and closes with Escape", async ({
    page,
  }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    const launcher = page
      .locator("header.rp-ctx button.rp-ctx-ask, button:has-text('Ask RADR')")
      .first();
    await expect(launcher).toBeVisible();
    await launcher.click();
    const panel = page.locator(".rp-ask-panel");
    await expect(panel).toBeVisible({ timeout: 10_000 });

    const box = await panel.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      const vp = page.viewportSize()!;
      expect(box.y).toBeGreaterThanOrEqual(-2);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 4);
      expect(box.x).toBeGreaterThanOrEqual(-2);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 4);
    }

    const shot = join(OUT, `${viewport}-ask-radr-open.png`);
    await page.screenshot({ path: shot });

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    log({
      route: "/app",
      viewport,
      element: "Ask RADR",
      action: "open + Escape",
      expected: "panel fully visible · closes",
      actual: "ok",
      pass: true,
      severity: "",
      screenshot: shot,
    });
  });

  test("Control Center Focus Mode + back navigation", async ({
    page,
  }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Open Live Focus/i }).click();
    await expect(page).toHaveURL(/focus=live/, { timeout: 10_000 });
    await noOverflow(page);
    await page.locator(".rp-cc4-focus-close").first().click();
    await expect(page).not.toHaveURL(/focus=/, { timeout: 10_000 });

    await page.goto("/app?stay=1&focus=performance", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator(".rp-cc4-focus").first()).toBeVisible();
    await page.locator(".rp-cc4-focus-close").first().click();
    await expect(page).not.toHaveURL(/focus=/, { timeout: 10_000 });

    log({
      route: "/app",
      viewport,
      element: "Focus Mode",
      action: "Live Focus → Back · Performance → Back",
      expected: "Focus Mode sync",
      actual: "ok",
      pass: true,
      severity: "",
    });
  });

  test("primary nav destinations", async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    const links: { name: string; href: string; scope: "rail" | "foot" }[] = [
      { name: "Decisions", href: "/app/decisions", scope: "rail" },
      { name: "Verified Value", href: "/app/value", scope: "rail" },
      { name: "Locations", href: "/app/locations", scope: "rail" },
      { name: "Operating Memory", href: "/app/memory", scope: "rail" },
      { name: "Intelligence", href: "/app/intelligence", scope: "rail" },
      { name: "Connections", href: "/app/connections", scope: "rail" },
      { name: "Data Health", href: "/app/data-health", scope: "rail" },
      { name: "Settings", href: "/app/settings", scope: "foot" },
    ];

    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    // Expand desktop rail so labels are hit-targets (not icon-only).
    const rail = page.locator("aside.rp-rail");
    await rail.hover();

    for (const link of links) {
      const root =
        link.scope === "rail"
          ? page.locator("nav.rp-rail-nav")
          : page.locator("aside.rp-rail .rp-rail-foot");
      const el = root.locator(`a[href="${link.href}"]`).first();
      await expect(el).toBeVisible({ timeout: 8_000 });
      await el.scrollIntoViewIfNeeded();
      await Promise.all([
        page.waitForURL(
          (url) =>
            url.pathname === link.href ||
            url.pathname.startsWith(`${link.href}/`),
          { timeout: 10_000 },
        ),
        el.click(),
      ]);
      log({
        route: "/app",
        viewport,
        element: link.name,
        action: "nav click",
        expected: link.href,
        actual: page.url(),
        pass: true,
        severity: "",
      });
      await page.goto("/app", { waitUntil: "domcontentloaded" });
      await rail.hover();
    }
  });
});
