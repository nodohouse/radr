/**
 * Canonical money formatter for RADR product surfaces.
 * Always shows two decimal places unless compact chart shorthand is requested.
 */

import type { CurrencyCode } from "./venueProfiles";
import { formatCurrency, formatVenueCurrency } from "./currency";

export type FormatMoneyInput = {
  amount: number;
  currency?: CurrencyCode;
  locale?: string;
  /** Compact shorthand (€1.2k) - charts / dense badges only. Default false. */
  compact?: boolean;
  locationId?: string;
};

/**
 * Display money with cents. Locale-aware. Prefer this over ad-hoc formatters.
 */
export function formatMoney(input: FormatMoneyInput): string {
  const {
    amount,
    currency = "EUR",
    locale,
    compact = false,
    locationId,
  } = input;

  if (locationId) {
    return formatVenueCurrency(amount, locationId, {
      compact,
      cents: !compact,
    });
  }

  return formatCurrency(amount, currency, {
    compact,
    locale,
    cents: !compact,
  });
}

/** Berlin / EUR convenience for demo surfaces. */
export function formatEuro(amount: number, opts?: { compact?: boolean }): string {
  return formatMoney({
    amount,
    currency: "EUR",
    locale: "de-DE",
    compact: opts?.compact ?? false,
  });
}
