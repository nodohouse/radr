/**
 * Operating Canvas contracts - RADR product UX Phase 1.
 *
 * Lens ≠ Territory.
 * - Lens = decision perspective (OPERATE | MONEY | RISK | SERVICE)
 * - Territory = BUY | LABOR | SELL | RECOVER domain
 *
 * DEMO: /app reads client fixtures + finding engines.
 * LIVE (future): same shape; sources swap to org APIs - do not invent numbers in UI.
 */

import type { ServiceTimeKey } from "@/lib/radr/floorModel";
import type { MoneyKind, ValueState } from "@/lib/radr/valueSemantics";

/** Decision perspective over the same operation. */
export const OPERATING_LENSES = ["operate", "money", "risk", "service"] as const;
export type OperatingLens = (typeof OPERATING_LENSES)[number];

export const LENS_LABEL: Record<OperatingLens, string> = {
  operate: "Operate",
  money: "Money",
  risk: "Risk",
  service: "Service",
};

/**
 * Service-time scrubber keys - 15-minute resolution from open service through close.
 * Extends floor ServiceTimeKey with quarter-hours + CLOSE.
 */
function buildOperatingServiceTimes() {
  const slots: string[] = ["now"];
  for (let h = 18; h <= 21; h++) {
    for (const m of [0, 15, 30, 45] as const) {
      if (h === 21 && m > 0) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  slots.push("close");
  return slots as [
    "now",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
    "19:00",
    "19:15",
    "19:30",
    "19:45",
    "20:00",
    "20:15",
    "20:30",
    "20:45",
    "21:00",
    "close",
  ];
}

export const OPERATING_SERVICE_TIMES = buildOperatingServiceTimes();
export type OperatingServiceTime = (typeof OPERATING_SERVICE_TIMES)[number];

export type TimeFormatPref = "12h" | "24h";

const FLOOR_TIME_ANCHORS: ServiceTimeKey[] = [
  "now",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

function minutesFromMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Major labeled ticks on the scrubber (minor :15/:30/:45 stay unmarked). */
export function isMajorServiceTime(t: OperatingServiceTime): boolean {
  return (
    t === "now" ||
    t === "close" ||
    t === "18:00" ||
    t === "19:00" ||
    t === "20:00" ||
    t === "21:00"
  );
}

export function formatServiceClock(
  hhmm: string,
  format: TimeFormatPref = "12h",
): string {
  const [hs, ms] = hhmm.split(":");
  const h24 = Number(hs);
  const m = Number(ms);
  if (!Number.isFinite(h24) || !Number.isFinite(m)) return hhmm;
  if (format === "24h") {
    return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatServiceTimeLabel(
  t: OperatingServiceTime,
  format: TimeFormatPref = "12h",
): string {
  if (t === "now") return "Now";
  if (t === "close") return "Close";
  return formatServiceClock(t, format);
}

/** @deprecated Prefer formatServiceTimeLabel - kept for call sites that need a static map. */
export const SERVICE_TIME_LABEL: Record<OperatingServiceTime, string> =
  Object.fromEntries(
    OPERATING_SERVICE_TIMES.map((t) => [t, formatServiceTimeLabel(t, "24h")]),
  ) as Record<OperatingServiceTime, string>;

/** Map canvas time → nearest floor ServiceTimeKey (demo floor has hourly snapshots). */
export function toFloorServiceTime(
  t: OperatingServiceTime,
): ServiceTimeKey {
  if (t === "now") return "now";
  if (t === "close") return "21:00";
  const target = minutesFromMidnight(t);
  let best: ServiceTimeKey = "18:00";
  let bestDist = Infinity;
  for (const anchor of FLOOR_TIME_ANCHORS) {
    if (anchor === "now") continue;
    const d = Math.abs(minutesFromMidnight(anchor) - target);
    if (d < bestDist) {
      best = anchor;
      bestDist = d;
    }
  }
  return best;
}

export type OperatingCanvasContext = {
  lens: OperatingLens;
  serviceTime: OperatingServiceTime;
  selectedFindingId: string | null;
};

export const DEFAULT_CANVAS: OperatingCanvasContext = {
  lens: "operate",
  serviceTime: "now",
  selectedFindingId: null,
};

/** Product money vocabulary - map kinds to operator language. Never synonym-swap. */
export const MONEY_VOCAB: Record<
  MoneyKind,
  { short: string; long: string }
> = {
  exposure: { short: "At risk", long: "Value at risk" },
  recoverable: { short: "Recoverable", long: "Recoverable value" },
  opportunity: { short: "Upside", long: "Identified upside" },
  verified: { short: "Verified", long: "Verified value" },
  forecast: { short: "Forecast", long: "Forecast value (not verified)" },
};

export function moneyVocabLabel(
  kind: MoneyKind,
  style: "short" | "long" = "short",
): string {
  return MONEY_VOCAB[kind][style];
}

/** Prepared / actionable value uses ValueState PREPARED. */
export function valueStateVocab(state: ValueState): string {
  switch (state) {
    case "IDENTIFIED":
      return "Identified";
    case "EXPECTED":
      return "Expected";
    case "PREPARED":
    case "ACTIONABLE":
      return "Actionable";
    case "ACTIONED":
      return "Actioned";
    case "OBSERVED":
    case "PENDING_VERIFICATION":
      return "Pending verification";
    case "VERIFIED":
      return "Verified";
    case "DISMISSED":
      return "Dismissed";
    case "EXPIRED":
      return "Expired";
    default:
      return state;
  }
}

/** What each Lens emphasizes when data exists (DEMO snapshot / findings). */
export const LENS_EMPHASIS: Record<
  OperatingLens,
  { focus: string; empty: string; metricHints: string[] }
> = {
  operate: {
    focus: "Reservations, covers, staffing, turns",
    empty: "No operating exceptions for this scope.",
    metricHints: ["covers", "staffing", "turns", "occupancy"],
  },
  money: {
    focus: "Revenue, margin, labor cost, recoverable, exposure",
    empty: "No material money exceptions for this scope.",
    metricHints: ["revenue", "margin", "exposure", "verified"],
  },
  risk: {
    focus: "Cancellations, staffing gaps, discrepancies, uncertainty",
    empty: "No elevated risk signals for this scope.",
    metricHints: ["cancellations", "staffing_gap", "confidence"],
  },
  service: {
    focus: "Occupancy, service pressure, turn times, table load",
    empty: "Service is within expected pressure.",
    metricHints: ["occupancy", "pressure", "waitlist", "turns"],
  },
};

/**
 * Capability matrix - honesty contract for UI authors.
 * DEMO = client fixtures. REAL = production API. VISUAL = presentation only.
 */
export const CANVAS_FIELD_SOURCES = {
  locationScope: { demo: "sessionStorage + store", live: "org membership" },
  period: { demo: "sessionStorage + store", live: "operator preference" },
  lens: { demo: "sessionStorage + URL", live: "same (client preference)" },
  serviceTime: { demo: "sessionStorage + URL + floor moments", live: "POS/reservation clock" },
  findings: { demo: "findings engine + scenarios", live: "DB findings (not wired)" },
  verifiedValue: { demo: "scenario ledger", live: "verifications table (not wired)" },
  askNumbers: { demo: "tool adapters over demo", live: "same tools + live adapters" },
} as const;

/** Future backend contracts - documented only; do not fake in UI. */
export const FUTURE_BACKEND_CONTRACTS = [
  "GET/POST /api/findings - persist finding lifecycle",
  "GET/POST /api/actions - prepare / approve / execute with audit",
  "GET /api/operating-snapshot - org-scoped normalized model",
  "GET /api/service-floor - live table + reservation moments",
] as const;

export function isOperatingLens(v: unknown): v is OperatingLens {
  return (
    typeof v === "string" &&
    (OPERATING_LENSES as readonly string[]).includes(v)
  );
}

export function isOperatingServiceTime(v: unknown): v is OperatingServiceTime {
  return (
    typeof v === "string" &&
    (OPERATING_SERVICE_TIMES as readonly string[]).includes(v)
  );
}

export function parseCanvasFromSearchParams(
  params: URLSearchParams,
): Partial<OperatingCanvasContext> {
  const out: Partial<OperatingCanvasContext> = {};
  const lens = params.get("lens");
  if (isOperatingLens(lens)) out.lens = lens;
  const t = params.get("t");
  if (isOperatingServiceTime(t)) out.serviceTime = t;
  const finding = params.get("finding");
  if (finding && finding.length > 0 && finding.length < 80) {
    out.selectedFindingId = finding;
  }
  return out;
}

export function writeCanvasSearchParams(
  params: URLSearchParams,
  canvas: OperatingCanvasContext,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (canvas.lens === DEFAULT_CANVAS.lens) next.delete("lens");
  else next.set("lens", canvas.lens);
  if (canvas.serviceTime === DEFAULT_CANVAS.serviceTime) next.delete("t");
  else next.set("t", canvas.serviceTime);
  if (!canvas.selectedFindingId) next.delete("finding");
  else next.set("finding", canvas.selectedFindingId);
  return next;
}
