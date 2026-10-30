/**
 * Public interaction crawl — discover every <a>, button, role=button.
 * Usage: PUBLIC_QA_BASE_URL=http://127.0.0.1:3060 node scripts/public-interaction-crawl.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PUBLIC_QA_BASE_URL ?? "http://127.0.0.1:3060";

const SEED = [
  "/en",
  "/en/product",
  "/en/product/control-center",
  "/en/product/decisions",
  "/en/product/futures",
  "/en/product/futures?example=D-1911",
  "/en/product/value",
  "/en/product/memory",
  "/en/product/connections",
  "/en/product/floor",
  "/en/solutions",
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
  "/en/login",
  "/en/signup",
];

const AUTH_PROBES = [
  "/app",
  "/app/decisions/dec_peak_berlin",
  "/app/memory",
  "/app/connections",
  "/app/lab/control-center",
  "/app/enter",
];

function classifyHref(href) {
  if (!href) return { kind: "none", ok: true };
  if (href.startsWith("mailto:") || href.startsWith("tel:"))
    return { kind: "external-ok", ok: true };
  if (href.startsWith("javascript:"))
    return { kind: "js-protocol", ok: false, note: "javascript: URL" };
  if (href.startsWith("http") && !href.includes("127.0.0.1") && !href.includes("localhost") && !href.includes("prep-ten-zeta") && !href.includes("vercel.app") && !href.includes("radrup"))
    return { kind: "external", ok: true };
  try {
    const u = new URL(href, BASE);
    const path = u.pathname + u.search;
    if (path === "/app" || path.startsWith("/app/")) {
      // Only ok if behind signup/login with intent
      return {
        kind: "app-leak",
        ok: false,
        note: `Direct /app link: ${path}`,
      };
    }
    if (path.includes("/signup") && (u.searchParams.get("intent") === "demo" || u.searchParams.has("next"))) {
      const next = u.searchParams.get("next") || "";
      if (next && !next.startsWith("/app") && !next.startsWith("/onboarding") && !next.startsWith("/select-org")) {
        return { kind: "bad-next", ok: false, note: `Unsafe next=${next}` };
      }
      return { kind: "demo-gate", ok: true };
    }
    if (!path.startsWith("/en") && !path.startsWith("/de") && path !== "/") {
      // locale-less internal may rewrite
      return { kind: "internal", ok: true };
    }
    return { kind: "public", ok: true };
  } catch {
    return { kind: "invalid", ok: false, note: "Unparseable href" };
  }
}

async function collectInteractive(page, route) {
  return page.evaluate((pageRoute) => {
    const items = [];
    const nodes = document.querySelectorAll(
      "a[href], button, [role='button'], summary",
    );
    for (const el of nodes) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const label =
        (el.getAttribute("aria-label") ||
          el.innerText ||
          el.getAttribute("title") ||
          el.getAttribute("href") ||
          el.tagName)
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 120);
      const href =
        el instanceof HTMLAnchorElement
          ? el.getAttribute("href")
          : el.getAttribute("href") || null;
      items.push({
        page: pageRoute,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
        label: label || "(empty)",
        href,
      });
    }
    return items;
  }, route);
}

const rows = [];
const pageStatus = [];
let failCount = 0;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const route of SEED) {
  const url = `${BASE}${route}`;
  let status = "PASS";
  let notes = [];
  try {
    const res = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const code = res?.status() ?? 0;
    if (code >= 400) {
      status = "FAIL";
      notes.push(`HTTP ${code}`);
    }
    const body = await page.locator("body").innerText().catch(() => "");
    if (/Internal (Server )?Error|Application error/i.test(body)) {
      status = "FAIL";
      notes.push("Internal Error in body");
    }
    if (route.includes("futures")) {
      const bg = await page.evaluate(() => {
        const el = document.querySelector(".rx-fut-pub") || document.body;
        return getComputedStyle(el).backgroundColor;
      });
      notes.push(`bg:${bg}`);
      if (!/WAIT 12/i.test(body) && !/Wait 12/i.test(body)) {
        status = "FAIL";
        notes.push("Missing WAIT 12 Futures hero");
      }
      // Fail if dark product chrome dominates
      const dark = await page.locator(".rx-fut-pub").count();
      if (dark === 0) notes.push("warn: .rx-fut-pub missing");
    }
    if (route.includes("product/value")) {
      if (!/€6\.80|6\.80/.test(body) || !/€7\.45|7\.45/.test(body)) {
        status = "FAIL";
        notes.push("Missing contract/invoice rates");
      }
      if (!/273/.test(body)) {
        status = "FAIL";
        notes.push("Missing €273");
      }
    }

    const interactive = await collectInteractive(page, route);
    for (const item of interactive) {
      const cls = classifyHref(item.href);
      const rowStatus = cls.ok ? "PASS" : "FAIL";
      if (!cls.ok) failCount++;
      rows.push({
        ...item,
        expected:
          cls.kind === "app-leak"
            ? "signup gate — never direct /app"
            : "public or demo-gate",
        actual: item.href || "(action)",
        kind: cls.kind,
        status: rowStatus,
        note: cls.note || "",
      });
    }
  } catch (e) {
    status = "FAIL";
    notes.push(String(e?.message || e));
  }
  if (status === "FAIL") failCount++;
  pageStatus.push({ route, status, notes: notes.join("; ") });
  console.log(`${status} ${route} ${notes.join("; ")}`);
}

// Auth boundary probes (signed out)
for (const route of AUTH_PROBES) {
  try {
    const res = await page.goto(`${BASE}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    const finalUrl = page.url();
    const status =
      /\/(en\/)?(signup|login)/.test(finalUrl) ? "PASS" : "FAIL";
    if (status === "FAIL") failCount++;
    pageStatus.push({
      route,
      status,
      notes: `final=${finalUrl}; http=${res?.status() ?? "?"}`,
    });
    console.log(`${status} AUTH ${route} → ${finalUrl}`);
    rows.push({
      page: route,
      tag: "auth-probe",
      role: null,
      label: `GET ${route}`,
      href: route,
      expected: "signup/login boundary",
      actual: finalUrl,
      kind: "auth",
      status,
      note: "",
    });
  } catch (e) {
    failCount++;
    pageStatus.push({
      route,
      status: "FAIL",
      notes: String(e?.message || e),
    });
    console.log(`FAIL AUTH ${route} ${e?.message || e}`);
  }
}

await browser.close();

const outDir = join(process.cwd(), "tmp");
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, "public-interaction-crawl.json");
writeFileSync(
  jsonPath,
  JSON.stringify({ base: BASE, failCount, pageStatus, rows }, null, 2),
);

const leakFails = rows.filter((r) => r.kind === "app-leak" && r.status === "FAIL");
console.log(`\nTOTAL interactive rows: ${rows.length}`);
console.log(`FAILS: ${failCount}`);
console.log(`APP LEAKS: ${leakFails.length}`);
for (const l of leakFails.slice(0, 20)) {
  console.log(`  LEAK ${l.page} · ${l.label} · ${l.href}`);
}
console.log(`Wrote ${jsonPath}`);
process.exit(failCount > 0 ? 1 : 0);
