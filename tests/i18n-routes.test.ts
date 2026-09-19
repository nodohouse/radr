import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { locales, routing } from "@/i18n/routing";
import { buildAlternates, buildAlternatesForLocale } from "@/i18n/seo";

const root = path.resolve(__dirname, "..");
const PUBLIC_PATHS = [
  "/",
  "/how",
  "/solutions",
  "/pricing",
  "/product",
  "/why",
  "/approach",
  "/company",
  "/customers",
  "/security",
  "/contact",
  "/developers",
  "/developers/api",
  "/developers/webhooks",
  "/developers/connectors",
  "/developers/quickstart",
] as const;

const NAMESPACES = [
  "common",
  "navigation",
  "homepage",
  "product",
  "solutions",
  "how",
  "pricing",
  "company",
  "developers",
  "auth",
  "onboarding",
  "legal",
  "errors",
  "meta",
] as const;

function collectKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    const keys = [`${prefix}[]`];
    if (value.length > 0 && value[0] && typeof value[0] === "object") {
      keys.push(...collectKeys(value[0], `${prefix}[]`));
    }
    return keys;
  }
  if (value && typeof value === "object") {
    return Object.keys(value as object).flatMap((k) =>
      collectKeys((value as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("i18n routing config", () => {
  it("exposes five locales with English default and always prefix", () => {
    expect(locales).toEqual(["en", "de", "nl", "fr", "es"]);
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localePrefix).toBe("always");
  });

  it("maps public marketing paths to locale-aware alternates", () => {
    for (const pathName of PUBLIC_PATHS) {
      const alts = buildAlternates(pathName);
      expect(alts.languages).toBeDefined();
      const languages = alts.languages as Record<string, string>;
      expect(languages["x-default"]).toMatch(/^https:\/\/radrup\.com\/en/);
      expect(languages.en).toBe(languages["x-default"]);
      expect(languages.de).toContain("/de");
      expect(languages.nl).toContain("/nl");
      expect(languages.fr).toContain("/fr");
      expect(languages.es).toContain("/es");

      const deCanon = buildAlternatesForLocale("de", pathName);
      if (pathName === "/") {
        expect(deCanon.canonical).toBe("https://radrup.com/de");
      } else {
        expect(deCanon.canonical).toBe(`https://radrup.com/de${pathName}`);
      }

      const enCanon = buildAlternatesForLocale("en", pathName);
      if (pathName === "/") {
        expect(enCanon.canonical).toBe("https://radrup.com/en");
      } else {
        expect(enCanon.canonical).toBe(`https://radrup.com/en${pathName}`);
      }
    }
  });
});

describe("locale message parity", () => {
  it("keeps DE/NL/FR/ES key trees aligned with EN for every namespace", () => {
    for (const ns of NAMESPACES) {
      const en = JSON.parse(
        fs.readFileSync(path.join(root, "locales", "en", `${ns}.json`), "utf8"),
      );
      const enKeys = new Set(collectKeys(en));
      for (const locale of ["de", "nl", "fr", "es"] as const) {
        const locPath = path.join(root, "locales", locale, `${ns}.json`);
        expect(fs.existsSync(locPath), `missing ${locale}/${ns}.json`).toBe(true);
        const loc = JSON.parse(fs.readFileSync(locPath, "utf8"));
        const locKeys = new Set(collectKeys(loc));
        const missing = [...enKeys].filter((k) => !locKeys.has(k));
        const extra = [...locKeys].filter((k) => !enKeys.has(k));
        expect(missing, `${locale}/${ns} missing`).toEqual([]);
        expect(extra, `${locale}/${ns} extra`).toEqual([]);
      }
    }
  });
});
