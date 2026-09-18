import { demoAsOfMs } from "@/lib/radr/demoClock";

export type SyncHealthStatus =
  | "CONNECTED"
  | "SYNCING"
  | "HEALTHY"
  | "STALE"
  | "ERROR"
  | "DISCONNECTED";

export type DataSourceHealth = {
  sourceKey: string;
  label: string;
  status: SyncHealthStatus;
  lastSuccessfulSync: string | null;
  lastAttempt: string | null;
  latencyMs?: number;
  recordsProcessed?: number;
  errorSummary?: string;
  ageMinutes: number;
};

export type DataHealthReport = {
  locationId: string;
  overall: SyncHealthStatus;
  sources: DataSourceHealth[];
  /** Multiplier 0-1 applied to finding confidence scores */
  confidenceMultiplier: number;
  userMessage: string | null;
};

export function ageMinutesSince(iso: string | null, now = Date.now()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
}

export function statusFromAge(
  ageMinutes: number,
  staleAfter = 30,
  errorAfter = 480,
): SyncHealthStatus {
  if (!Number.isFinite(ageMinutes)) return "DISCONNECTED";
  if (ageMinutes > errorAfter) return "ERROR";
  if (ageMinutes > staleAfter) return "STALE";
  return "HEALTHY";
}

export function buildDataHealthReport(
  locationId: string,
  sources: Array<{
    sourceKey: string;
    label: string;
    lastSuccessfulSync: string | null;
    lastAttempt: string | null;
    latencyMs?: number;
    recordsProcessed?: number;
    errorSummary?: string;
    ageMinutes?: number;
  }>,
  now = Date.now(),
): DataHealthReport {
  const normalized: DataSourceHealth[] = sources.map((s) => {
    const age = s.ageMinutes ?? ageMinutesSince(s.lastSuccessfulSync, now);
    const status = statusFromAge(age);
    return {
      sourceKey: s.sourceKey,
      label: s.label,
      lastSuccessfulSync: s.lastSuccessfulSync,
      lastAttempt: s.lastAttempt,
      latencyMs: s.latencyMs,
      recordsProcessed: s.recordsProcessed,
      errorSummary: s.errorSummary,
      ageMinutes: age,
      status,
    };
  });

  const worst = normalized.reduce<SyncHealthStatus>((acc, s) => {
    const rank = { HEALTHY: 0, CONNECTED: 0, SYNCING: 1, STALE: 2, ERROR: 3, DISCONNECTED: 4 };
    return rank[s.status] > rank[acc] ? s.status : acc;
  }, "HEALTHY");

  const staleCount = normalized.filter(
    (s) => s.status === "STALE" || s.status === "ERROR" || s.status === "DISCONNECTED",
  ).length;

  const confidenceMultiplier =
    staleCount === 0 ? 1 : Math.max(0.55, 1 - staleCount * 0.15);

  let userMessage: string | null = null;
  const delayed = normalized.find(
    (s) => s.status === "STALE" || s.status === "ERROR",
  );
  if (delayed) {
    userMessage = `${delayed.label.toUpperCase()} DATA DELAYED. Last successful sync: ${delayed.ageMinutes} minutes ago. Forecast confidence reduced.`;
  }

  return {
    locationId,
    overall: worst,
    sources: normalized,
    confidenceMultiplier,
    userMessage,
  };
}

/** Demo health for Berlin - ages relative to the demo clock. */
export function demoDataHealth(locationId = "loc_ber"): DataHealthReport {
  const now = demoAsOfMs();
  return buildDataHealthReport(
    locationId,
    [
      {
        sourceKey: "bookings",
        label: "Bookings",
        lastSuccessfulSync: new Date(now - 2 * 60_000).toISOString(),
        lastAttempt: new Date(now - 2 * 60_000).toISOString(),
        latencyMs: 180,
        recordsProcessed: 46,
      },
      {
        sourceKey: "pos",
        label: "POS",
        lastSuccessfulSync: new Date(now - 4 * 60_000).toISOString(),
        lastAttempt: new Date(now - 4 * 60_000).toISOString(),
        latencyMs: 220,
        recordsProcessed: 128,
      },
      {
        sourceKey: "labor",
        label: "Labor",
        lastSuccessfulSync: new Date(now - 4 * 60 * 60_000).toISOString(),
        lastAttempt: new Date(now - 4 * 60 * 60_000).toISOString(),
      },
    ],
    now,
  );
}
