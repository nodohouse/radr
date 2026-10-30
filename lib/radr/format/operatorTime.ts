/**
 * Operator-facing date/time — never raw ISO in product UI.
 */

const ISO_LIKE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

export function isRawIsoTimestamp(value: string): boolean {
  return ISO_LIKE.test(value.trim());
}

/** Format ISO for operators: "Decide by 19:25" or "18 Sep · 19:25". */
export function formatOperatorDeadline(
  value: string,
  mode: "decide_by" | "datetime" = "decide_by",
): string {
  const trimmed = value.trim();
  if (!isRawIsoTimestamp(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  }).format(d);
  if (mode === "decide_by") return `Decide by ${time}`;
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  }).format(d);
  return `${day} · ${time}`;
}
