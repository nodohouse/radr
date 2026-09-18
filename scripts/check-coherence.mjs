#!/usr/bin/env node
/**
 * Lightweight public-ecosystem coherence checks.
 * Usage: node scripts/check-coherence.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walk(dir, ext = [".ts", ".tsx", ".json", ".md"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next" || ent.name === ".git")
      continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, ext));
    else if (ext.some((e) => ent.name.endsWith(e))) out.push(p);
  }
  return out;
}

// 1) Canonical customer loop present in architecture
{
  const arch = read("lib/radr/intelligence/architecture.ts");
  for (const step of [
    "CONNECT",
    "UNDERSTAND",
    "FUTURES",
    "DECIDE",
    "VERIFY",
    "REMEMBER",
  ]) {
    if (!arch.includes(`"${step}"`)) {
      failures.push(`CUSTOMER_LOOP missing ${step} in architecture.ts`);
    }
  }
  if (!arch.includes("FINDING_DEFINITION")) {
    failures.push("FINDING_DEFINITION missing from architecture.ts");
  }
}

// 2) Platform stages align to customer loop
{
  const plat = read("components/marketing/pages/PlatformPage.tsx");
  for (const bad of ["TRUTH", "REALITY", "LEARNING"]) {
    if (plat.includes(`"${bad}"`)) {
      failures.push(`PlatformPage still uses legacy stage ${bad}`);
    }
  }
  for (const good of [
    "CONNECT",
    "UNDERSTAND",
    "FUTURES",
    "DECIDE",
    "VERIFY",
    "REMEMBER",
  ]) {
    if (!plat.includes(`"${good}"`)) {
      failures.push(`PlatformPage missing stage ${good}`);
    }
  }
}

// 3) Env var consistency
{
  const files = [
    ...walk(path.join(root, "app")),
    ...walk(path.join(root, "docs")),
  ];
  for (const f of files) {
    const txt = fs.readFileSync(f, "utf8");
    if (txt.includes("RADR_API_URL") && !txt.includes("RADR_API_BASE_URL")) {
      // allow comments explaining rename? fail hard on bare RADR_API_URL
    }
    if (/\bRADR_API_URL\b/.test(txt)) {
      failures.push(`Deprecated RADR_API_URL in ${path.relative(root, f)}`);
    }
  }
}

// 4) Deprecated primary category in EN blog
{
  const blog = JSON.parse(read("locales/en/blog.json"));
  const blob = JSON.stringify(blog);
  if (/RADR is Verified Decision Intelligence for hospitality/i.test(blob)) {
    failures.push("Blog still claims Verified Decision Intelligence as primary category");
  }
  if (/Operating Twin/i.test(blob)) {
    failures.push("Blog still uses Operating Twin");
  }
  if (/"title":\s*"Why:/i.test(blob) || /Why: natural language/i.test(blob)) {
    failures.push("Blog still uses Why interface naming");
  }
  if (/Protected value is an action taken/i.test(blob)) {
    failures.push("Verified Value blog still uses incorrect protected-value definition");
  }
  if (!/Operating judgment, written down/i.test(blog.title || "")) {
    failures.push("Blog landing title should be Operating judgment, written down.");
  }
}

// 5) AVAILABLE integrations must not say adapter ships / pending API
{
  const reg = read("lib/integrations/registry.ts");
  const details = read("lib/integrations/providerDetails.ts");
  if (/once the adapter ships/i.test(details)) {
    failures.push("providerDetails still contains 'once the adapter ships'");
  }
  if (/Pending verified API access/i.test(details)) {
    failures.push("providerDetails still contains pending API access language");
  }
  // spot-check available synthetic notes honesty
  if (!/radr-demo-reservations/.test(reg)) {
    failures.push("Demo reservations missing from integration registry");
  }
  if (!/integrationTypeOf/.test(reg)) {
    failures.push("integrationTypeOf missing from registry");
  }
}

// 6) Decision location uniqueness for D-3104
{
  const decisions = read("data/demo/decisions.ts");
  const matches = [...decisions.matchAll(/D-3104[\s\S]{0,400}/g)];
  const cities = new Set();
  for (const m of matches) {
    const loc = m[0].match(/location:\s*"([^"]+)"/);
    if (loc) cities.add(loc[1]);
  }
  // also displayId / id patterns
  if (cities.size > 1) {
    failures.push(`D-3104 has multiple locations: ${[...cities].join(", ")}`);
  }
}

// 7) Terminology file exists
{
  for (const f of [
    "content/terminology.ts",
    "content/blogTaxonomy.ts",
    "data/featureAvailability.ts",
    "lib/economics/metricTypes.ts",
    "data/marketSources.ts",
    "lib/integrations/registry.ts",
    "data/demo/decisions.ts",
  ]) {
    if (!fs.existsSync(path.join(root, f))) {
      failures.push(`Missing registry: ${f}`);
    }
  }
}

// 8) Marketing public surfaces: deprecated primary nouns (light scan)
{
  const scanDirs = [
    path.join(root, "locales", "en"),
    path.join(root, "components", "marketing"),
  ];
  const banned = [
    /AI Operating System/i,
    /Decision OS/i,
    /decision orchestration fabric/i,
    /hospitality cognition layer/i,
    /agentic intelligence mesh/i,
  ];
  for (const dir of scanDirs) {
    for (const f of walk(dir)) {
      const txt = fs.readFileSync(f, "utf8");
      for (const re of banned) {
        if (re.test(txt)) {
          failures.push(`Deprecated term ${re} in ${path.relative(root, f)}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error("Coherence check FAILED:\n");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}

console.log("Coherence check passed.");
