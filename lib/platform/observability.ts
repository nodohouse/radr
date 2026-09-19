/**
 * Observability helpers - structured logs without secrets/PII.
 */

export type LogLevel = "info" | "warn" | "error";

export type StructuredLog = {
  level: LogLevel;
  event: string;
  organizationId?: string;
  locationId?: string;
  requestId?: string;
  durationMs?: number;
  meta?: Record<string, string | number | boolean | null>;
};

const SENSITIVE = /password|secret|token|authorization|cookie|email|phone|pan/i;

export function sanitizeMeta(
  meta: Record<string, unknown> = {},
): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE.test(k)) {
      out[k] = "[redacted]";
      continue;
    }
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      out[k] = v;
    } else {
      out[k] = "[omitted]";
    }
  }
  return out;
}

export function logEvent(entry: StructuredLog): void {
  const line = {
    ...entry,
    meta: entry.meta ? sanitizeMeta(entry.meta) : undefined,
    ts: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(line));
}
