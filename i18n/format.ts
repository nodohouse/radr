/**
 * Locale-aware formatting.
 * LANGUAGE ≠ CURRENCY. Always pass an explicit currency for money.
 */

import type { AppLocale } from "./routing";

const BCP47: Record<AppLocale, string> = {
  en: "en-GB",
  de: "de-DE",
  nl: "nl-NL",
  fr: "fr-FR",
  es: "es-ES",
};

export function localeToBcp47(locale: AppLocale | string): string {
  return BCP47[locale as AppLocale] ?? "en-GB";
}

export function formatMoney(
  amount: number,
  locale: AppLocale | string,
  currency: string,
  opts?: { compact?: boolean; maximumFractionDigits?: number },
): string {
  const tag = localeToBcp47(locale);
  if (opts?.compact) {
    // Normalize compact suffix — Node ICU vs browser can disagree on K/k.
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: opts.maximumFractionDigits ?? 1,
    })
      .format(amount)
      .replace(/([0-9])K\b/g, "$1k")
      .replace(/([0-9])M\b/g, "$1m");
  }
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
  }).format(amount);
}

export function formatNumber(
  value: number,
  locale: AppLocale | string,
  opts?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(localeToBcp47(locale), opts).format(value);
}

export function formatDate(
  date: Date | string | number,
  locale: AppLocale | string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(localeToBcp47(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(d);
}

/** Hospitality ops: prefer 24h across European locales. */
export function formatTime(
  date: Date | string | number,
  locale: AppLocale | string,
): string {
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(localeToBcp47(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Demo/marketing compact money. Currency is explicit (default EUR for EU ops demos). */
export function formatCompactCurrency(
  amount: number,
  locale: AppLocale | string,
  currency = "EUR",
): string {
  return formatMoney(amount, locale, currency, { compact: true });
}

export function formatPercent(
  value: number,
  locale: AppLocale | string,
  opts?: { maximumFractionDigits?: number },
): string {
  return new Intl.NumberFormat(localeToBcp47(locale), {
    style: "percent",
    maximumFractionDigits: opts?.maximumFractionDigits ?? 1,
  }).format(value);
}
