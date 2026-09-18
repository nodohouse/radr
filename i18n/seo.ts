import type { Metadata } from "next";
import { routing, type AppLocale } from "./routing";

const SITE_URL = "https://radrup.com";

function localizedPath(locale: string, path: string): string {
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const suffix = normalized === "/" ? "" : normalized;
  return `/${locale}${suffix}`;
}

/**
 * Build canonical + hreflang alternates for a public path.
 * All locales are prefixed (`/en`, `/de`, …). `path` is unprefixed (`/` or `/pricing`).
 */
export function buildAlternates(path: string): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {
    "x-default": `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`,
  };

  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}${localizedPath(locale, path)}`;
  }

  return {
    canonical: `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`,
    languages,
  };
}

/** Locale-aware canonical + languages for generateMetadata. */
export function buildAlternatesForLocale(
  locale: string,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const base = buildAlternates(path);
  const safe =
    (routing.locales as readonly string[]).includes(locale)
      ? (locale as AppLocale)
      : routing.defaultLocale;

  return {
    ...base,
    canonical: `${SITE_URL}${localizedPath(safe, path)}`,
  };
}
