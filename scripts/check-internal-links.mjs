#!/usr/bin/env node
/**
 * Scan marketing surfaces for internal href patterns and optionally
 * smoke-check them against a running server.
 *
 * Usage:
 *   node scripts/check-internal-links.mjs
 *   BASE_URL=http://127.0.0.1:3036 node scripts/check-internal-links.mjs
 *   LIST_PATHS=1 node scripts/check-internal-links.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = [
  path.join(root, "app", "[locale]"),
  path.join(root, "components", "marketing"),
];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");

const HREF_RE =
  /(?:href\s*=\s*(?:\{\s*(?:`([^`]*?)`|'([^']*?)'|"([^"]*?)")\s*\}|"([^"]*?)"|'([^']*?)')|href\s*:\s*(?:`([^`]*?)`|'([^']*?)'|"([^"]*?)"))/g;

const flags = [];
const paths = new Set();

/** Known non-locale stems that must resolve without /en */
const NON_LOCALIZED = new Set([
  "/app",
  "/api",
  "/home",
  "/scan",
  "/sources",
  "/cases",
  "/money",
  "/controls",
  "/documents",
  "/onboarding",
  "/dev",
  "/mockups",
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full);
      continue;
    }
    if (!EXT.has(path.extname(entry.name))) continue;
    scanFile(full);
  }
}

function noteHref(rel, line, href) {
  if (!href) return;

  if (href === "#" || href.startsWith("#")) {
    if (href === "#") {
      flags.push({ severity: "warn", rel, line, href, note: "empty hash href" });
    }
    if (href.includes("sol-buy")) {
      flags.push({
        severity: "error",
        rel,
        line,
        href,
        note: "legacy #sol-buy; Solutions uses #buy",
      });
    }
    return;
  }

  if (!href.startsWith("/")) return;
  // Skip unresolved template literals from source scan
  if (href.includes("${")) return;

  const bare = href.split(/[?#]/)[0];
  paths.add(bare);

  if (bare === "/how") {
    flags.push({
      severity: "warn",
      rel,
      line,
      href,
      note: "/how redirects; prefer /product",
    });
  }

  if (href.includes("#sol-buy")) {
    flags.push({
      severity: "error",
      rel,
      line,
      href,
      note: "legacy #sol-buy; Solutions uses #buy",
    });
  }
}

function scanFile(filePath) {
  const rel = path.relative(root, filePath);
  const text = fs.readFileSync(filePath, "utf8");
  let m;
  HREF_RE.lastIndex = 0;
  while ((m = HREF_RE.exec(text))) {
    const href =
      m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6] ?? m[7] ?? m[8] ?? "";
    const line = text.slice(0, m.index).split("\n").length;
    noteHref(rel, line, href);
  }
}

async function smokeCheck() {
  if (!BASE_URL) return [];
  const failures = [];
  const stems = [...paths].sort();
  // Always include critical nav destinations
  for (const required of [
    "/",
    "/solutions",
    "/product",
    "/pricing",
    "/company",
    "/contact",
    "/industries",
    "/security",
    "/app",
    "/login",
    "/signup",
  ]) {
    paths.add(required);
  }

  for (const bare of [...paths].sort()) {
    if (bare.startsWith("/api")) continue;
    const isNonLoc = [...NON_LOCALIZED].some(
      (p) => bare === p || bare.startsWith(`${p}/`),
    );
    const url = isNonLoc
      ? `${BASE_URL}${bare}`
      : `${BASE_URL}/en${bare === "/" ? "" : bare}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
      });
      const code = res.status;
      const ok =
        (code >= 200 && code < 400) || code === 307 || code === 308;
      if (!ok) {
        failures.push({ url, code });
      }
    } catch (err) {
      failures.push({ url, code: 0, err: String(err) });
    }
  }
  return failures;
}

for (const dir of SCAN_DIRS) walk(dir);

console.log("RADR internal link check");
console.log(
  `Scanned: ${SCAN_DIRS.map((d) => path.relative(root, d)).join(", ")}`,
);
console.log(`Unique internal path stems: ${paths.size}`);
console.log("");

if (flags.length === 0) {
  console.log('No flagged patterns (href="#", /how, #sol-buy).');
} else {
  console.log(`Flags (${flags.length}):`);
  for (const f of flags) {
    console.log(`  [${f.severity}] ${f.rel}:${f.line}  ${f.href}  · ${f.note}`);
  }
}

if (process.env.LIST_PATHS === "1") {
  console.log("");
  console.log("Unique paths:");
  for (const p of [...paths].sort()) console.log(`  ${p}`);
}

const failures = await smokeCheck();
if (BASE_URL) {
  console.log("");
  console.log(`Smoke against ${BASE_URL}:`);
  if (failures.length === 0) {
    console.log("  All checked paths returned 2xx/3xx.");
  } else {
    console.log(`  Failures (${failures.length}):`);
    for (const f of failures) {
      console.log(`    ${f.code}  ${f.url}${f.err ? `  ${f.err}` : ""}`);
    }
  }
}

console.log("");
console.log("Done. Run: node scripts/check-internal-links.mjs");
process.exit(failures.length > 0 ? 1 : 0);
