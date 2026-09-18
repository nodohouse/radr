import { defineRouting } from "next-intl/routing";

export const locales = ["en", "de", "nl", "fr", "es"] as const;
export type AppLocale = (typeof locales)[number];

export const localeNames: Record<AppLocale, string> = {
  en: "English",
  de: "Deutsch",
  nl: "Nederlands",
  fr: "Français",
  es: "Español",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  /**
   * Always prefix locales (`/en`, `/de`, …).
   * `as-needed` (unprefixed EN) relies on middleware rewrites that some
   * `next start` builds leak as `307 Location: /` → ERR_TOO_MANY_REDIRECTS.
   */
  localePrefix: "always",
  localeCookie: {
    name: "radr_locale",
    maxAge: 60 * 60 * 24 * 365,
  },
  localeDetection: true,
});

/** Paths that stay outside locale routing (product demo, auth-gated app, APIs). */
export const NON_LOCALIZED_PREFIXES = [
  "/api",
  "/app",
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
] as const;

export function isNonLocalizedPath(pathname: string): boolean {
  return NON_LOCALIZED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
