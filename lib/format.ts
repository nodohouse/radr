/** Locale-aware money formatting. Prefer integer minor units when available. */

export function formatMoney(
  amount: number,
  currency = "EUR",
  options?: { cents?: boolean },
): string {
  const showCents = options?.cents ?? !Number.isInteger(amount);
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
    maximumFractionDigits: showCents ? 2 : 0,
    minimumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function formatMoneyFromMinor(
  minorUnits: number,
  currency = "EUR",
): string {
  return formatMoney(minorUnits / 100, currency, { cents: true });
}

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Reading",
  PROCESSED: "Checked",
  FAILED: "Failed",
  UNKNOWN: "Unclassified",
  REQUIRES_REVIEW: "Requires review",
  CONFIRMED: "Confirmed",
  IN_RESOLUTION: "In resolution",
  OVERDUE: "Overdue",
  VERIFIED: "Verified",
  RESOLVED: "Resolved",
  MATCHED: "Matched",
  DISMISSED: "Dismissed",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ").toLowerCase();
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
