/**
 * Local-currency formatting for the product.
 * Location UI = local currency. Group reporting = explicit conversion label.
 */

import { DEMO_FX_TO_USD } from "./demo/estateRegistry";
import type { CurrencyCode } from "./venueProfiles";
import { GROUP_REPORTING_CURRENCY, getVenueProfile } from "./venueProfiles";

/** Demo FX → USD reporting (group reporting currency). Legacy name kept. */
export const DEMO_FX_TO_EUR: Record<CurrencyCode, number> = DEMO_FX_TO_USD;

export function formatCurrency(
  value: number,
  currency: CurrencyCode,
  opts?: { compact?: boolean; locale?: string; cents?: boolean },
): string {
  // Default: full money with cents. Compact only when explicitly requested.
  const compact = opts?.compact ?? false;
  const locale = opts?.locale ?? "en-IE";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";

  if (compact && abs >= 1000) {
    const k = abs / 1000;
    const body =
      abs >= 10_000
        ? `${Math.round(k)}k`
        : `${k.toFixed(1).replace(/\.0$/, "")}k`;
    const symbol =
      currency === "GBP"
        ? "£"
        : currency === "USD" ||
            currency === "SGD" ||
            currency === "AUD" ||
            currency === "HKD" ||
            currency === "MXN" ||
            currency === "BRL"
          ? "$"
          : currency === "JPY"
            ? "¥"
            : currency === "AED"
              ? "AED "
              : currency === "ZAR"
                ? "R"
                : "€";
    if (currency === "AED") return `${sign}${symbol}${body}`;
    if (currency === "JPY") return `${sign}${symbol}${body}`;
    if (currency === "ZAR") return `${sign}${symbol}${body}`;
    if (currency === "HKD") return `${sign}HK${symbol}${body}`;
    if (currency === "MXN") return `${sign}MX${symbol}${body}`;
    if (currency === "BRL") return `${sign}R${symbol}${body}`;
    if (currency === "SGD") return `${sign}S${symbol}${body}`;
    if (currency === "AUD") return `${sign}A${symbol}${body}`;
    return `${sign}${symbol}${body}`;
  }

  // Always show cents unless caller opts out (legacy) or uses compact.
  const showCents = opts?.cents ?? true;
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: showCents ? 2 : 0,
    minimumFractionDigits: showCents ? 2 : 0,
  }).format(abs);

  // Product convention: EUR with European locales → €1.020,00 (symbol first)
  if (
    currency === "EUR" &&
    (locale.startsWith("de") || locale.startsWith("nl") || locale.startsWith("fr") || locale.startsWith("es") || locale.startsWith("it"))
  ) {
    const digits = new Intl.NumberFormat(locale, {
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    }).format(abs);
    return `${sign}€${digits}`;
  }

  return sign + formatted;
}

export function formatVenueCurrency(
  value: number,
  locationId: string,
  opts?: { compact?: boolean; cents?: boolean },
): string {
  const profile = getVenueProfile(locationId);
  return formatCurrency(value, profile.currency, {
    compact: opts?.compact,
    locale: profile.locale,
    cents: opts?.cents,
  });
}

/** Alias used across product surfaces. */
export function formatLocationMoney(
  value: number,
  locationId: string,
  opts?: { compact?: boolean; cents?: boolean },
): string {
  return formatVenueCurrency(value, locationId, opts);
}

export function convertCurrency(
  value: number,
  from: CurrencyCode,
  to: CurrencyCode = GROUP_REPORTING_CURRENCY,
): number {
  if (from === to) return Math.round(value);
  const inReporting = value * DEMO_FX_TO_EUR[from];
  return Math.round(inReporting / DEMO_FX_TO_EUR[to]);
}

export function dualCurrencyLabel(
  value: number,
  locationId: string,
): { local: string; reporting: string; reportingCurrency: CurrencyCode } {
  const profile = getVenueProfile(locationId);
  const local = formatCurrency(value, profile.currency, {
    locale: profile.locale,
  });
  if (profile.currency === GROUP_REPORTING_CURRENCY) {
    return {
      local,
      reporting: local,
      reportingCurrency: GROUP_REPORTING_CURRENCY,
    };
  }
  const converted = convertCurrency(value, profile.currency);
  return {
    local,
    reporting: formatCurrency(converted, GROUP_REPORTING_CURRENCY),
    reportingCurrency: GROUP_REPORTING_CURRENCY,
  };
}
