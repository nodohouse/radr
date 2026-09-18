#!/usr/bin/env node
/**
 * Product route crawl QA — visits ProductNav + MobileTabBar + Explore depth links.
 * Asserts light ProductShell (Service dark), no legacy prep-app shell, 200 OK.
 * Screenshots → .tmp/review/route-qa/
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3050 node scripts/qa-product-routes.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3050").replace(
  /\/$/,
  "",
);
const OUT = join(process.cwd(), ".tmp/review/route-qa");

const ROUTES = [
  { path: "/app", theme: "light" },
  { path: "/app/findings", theme: "light" },
  { path: "/app/controls", theme: "light" },
  { path: "/app/locations", theme: "light" },
  { path: "/app/service", theme: "light" },
  { path: "/app/forecast", theme: "light" },
  { path: "/app/value", theme: "light" },
  { path: "/app/data", theme: "light" },
  { path: "/app/settings", theme: "light" },
  { path: "/app/buy", theme: "light" },
  { path: "/app/labor", theme: "light" },
  { path: "/app/sell", theme: "light" },
  { path: "/app/recover", theme: "light" },
  { path: "/app/checks", theme: "light" },
  { path: "/app/glossary", theme: "light" },
];

const REDIRECTS = [
  { from: "/home", toIncludes: "/app" },
  { from: "/cases", toIncludes: "/app/findings" },
  { from: "/money", toIncludes: "/app/value" },
  { from: "/sources", toIncludes: "/app/data" },
  { from: "/app/performance", toIncludes: "/app/forecast" },
  { from: "/app/team", toIncludes: "/app/settings" },
  { from: "/app/signals", toIncludes: "/app/findings" },
];

function slug(path) {
  return path.replace(/^\//, "").replace(/\//g, "__") || "root";
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures = [];

  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`;
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      failures.push(`${route.path}: HTTP ${status}`);
      continue;
    }

    const check = await page.evaluate(() => {
      const root = document.querySelector(".rp-root");
      const prep = document.querySelector(".prep-app");
      const theme = root?.getAttribute("data-theme") || null;
      return {
        hasRoot: Boolean(root),
        hasPrep: Boolean(prep),
        theme,
      };
    });

    if (!check.hasRoot) failures.push(`${route.path}: missing .rp-root`);
    if (check.hasPrep) failures.push(`${route.path}: legacy .prep-app present`);
    if (check.theme !== route.theme) {
      failures.push(
        `${route.path}: expected data-theme=${route.theme}, got ${check.theme}`,
      );
    }

    const shot = join(OUT, `${slug(route.path)}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(`ok ${route.path} theme=${check.theme} → ${shot}`);
  }

  for (const r of REDIRECTS) {
    const res = await page.goto(`${BASE}${r.from}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const finalUrl = page.url();
    if (!finalUrl.includes(r.toIncludes)) {
      failures.push(
        `redirect ${r.from}: expected ${r.toIncludes}, got ${finalUrl} (status ${res?.status()})`,
      );
    } else {
      console.log(`ok redirect ${r.from} → ${finalUrl}`);
    }
  }

  // Mobile tab bar presence on a light route
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  const tabs = await page.evaluate(() => {
    const nav = document.querySelector(".rp-mobile-tabs");
    if (!nav) return null;
    return Array.from(nav.querySelectorAll("a")).map((a) => ({
      href: a.getAttribute("href"),
      label: a.textContent?.trim(),
    }));
  });
  if (!tabs || tabs.length < 4) {
    failures.push("mobile tabs missing or incomplete on /app");
  } else {
    const labels = tabs.map((t) => t.label).join(" · ");
    console.log(`ok mobile tabs: ${labels}`);
    await page.screenshot({
      path: join(OUT, "mobile__app.png"),
      fullPage: false,
    });
  }

  const report = {
    base: BASE,
    at: new Date().toISOString(),
    failures,
    ok: failures.length === 0,
  };
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

  await browser.close();

  if (failures.length) {
    console.error("\nFAIL");
    for (const f of failures) console.error(` - ${f}`);
    process.exit(1);
  }
  console.log("\nPASS route crawl");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
