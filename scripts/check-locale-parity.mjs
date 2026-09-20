#!/usr/bin/env node
/**
 * Validate that DE/NL/FR/ES locale JSON trees match EN key structure.
 * Usage: node scripts/check-locale-parity.mjs
 * Exit 1 on mismatch.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["de", "nl", "fr", "es"];
const EN_DIR = path.join(root, "locales", "en");

function collectKeys(value, prefix = "") {
  if (Array.isArray(value)) {
    // Arrays: compare length + recurse into first object element shape if objects
    const keys = [`${prefix}[]`];
    if (value.length > 0 && value[0] && typeof value[0] === "object") {
      keys.push(...collectKeys(value[0], `${prefix}[]`));
    }
    return keys;
  }
  if (value && typeof value === "object") {
    return Object.keys(value).flatMap((k) =>
      collectKeys(value[k], prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const namespaces = fs
  .readdirSync(EN_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

let failed = false;
const report = [];

for (const ns of namespaces) {
  const enPath = path.join(EN_DIR, `${ns}.json`);
  const en = loadJson(enPath);
  const enKeys = new Set(collectKeys(en));

  for (const locale of LOCALES) {
    const locPath = path.join(root, "locales", locale, `${ns}.json`);
    if (!fs.existsSync(locPath)) {
      failed = true;
      report.push(`MISSING FILE  ${locale}/${ns}.json`);
      continue;
    }
    const loc = loadJson(locPath);
    const locKeys = new Set(collectKeys(loc));
    const missing = [...enKeys].filter((k) => !locKeys.has(k)).sort();
    const extra = [...locKeys].filter((k) => !enKeys.has(k)).sort();
    if (missing.length || extra.length) {
      failed = true;
      if (missing.length) {
        report.push(
          `MISSING KEYS  ${locale}/${ns}.json → ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ` (+${missing.length - 12})` : ""}`,
        );
      }
      if (extra.length) {
        report.push(
          `EXTRA KEYS    ${locale}/${ns}.json → ${extra.slice(0, 12).join(", ")}${extra.length > 12 ? ` (+${extra.length - 12})` : ""}`,
        );
      }
    }
  }
}

if (failed) {
  console.error("Locale parity check failed:\n");
  for (const line of report) console.error("  " + line);
  process.exit(1);
}

console.log(
  `Locale parity OK · ${namespaces.length} namespaces · locales ${LOCALES.join(", ")}`,
);
