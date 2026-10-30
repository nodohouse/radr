/**
 * Hotel Decision actions — approve / request changes / decline / progress.
 * Deterministic previews for Canal House D-H-9201 (no invented economics).
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";

export const HOTEL_READINESS_ID = DECISION_IDS.hotelReadiness;

export type HkStaffing = 1 | 2 | 3;

export type HkStaffingPreview = {
  workers: HkStaffing;
  ready: string;
  atRisk: number;
  avgDelayMin: number;
  exposureEuro: number;
  protectedEuro: number;
  confidence: number;
  recommended: boolean;
  summary: string;
};

/** Deterministic staffing forks for Reassign housekeepers (aligned with futures). */
export function hkStaffingPreview(workers: HkStaffing): HkStaffingPreview {
  switch (workers) {
    case 1:
      return {
        workers: 1,
        ready: "33 / 42",
        atRisk: 5,
        avgDelayMin: 14,
        exposureEuro: 1020,
        protectedEuro: 820,
        confidence: 78,
        recommended: false,
        summary: "Partial recovery · Floor 3 still behind peak arrivals.",
      };
    case 3:
      return {
        workers: 3,
        ready: "36 / 42",
        atRisk: 2,
        avgDelayMin: 6,
        exposureEuro: 240,
        protectedEuro: 1600,
        confidence: 74,
        recommended: false,
        summary: "More coverage · higher labor opportunity cost · policy may require approval.",
      };
    case 2:
    default:
      return {
        workers: 2,
        ready: "35 / 42",
        atRisk: 3,
        avgDelayMin: 8,
        exposureEuro: 360,
        protectedEuro: 1480,
        confidence: 81,
        recommended: true,
        summary: "Recommended · recovers readiness gap before 15:00–15:40 wave.",
      };
  }
}

export type ProgressStage = {
  pct: number;
  label: string;
};

/** Housekeeping reassignment progress meaning (spec §79). */
export const HK_REASSIGN_STAGES: ProgressStage[] = [
  { pct: 0, label: "Approved · awaiting notify" },
  { pct: 25, label: "Workers notified" },
  { pct: 50, label: "Reassignment acknowledged" },
  { pct: 75, label: "Priority rooms underway" },
  { pct: 100, label: "Execution complete · verifying" },
];

export function nextHkProgress(current: number): number {
  const stages = HK_REASSIGN_STAGES.map((s) => s.pct);
  const idx = stages.findIndex((p) => p > current);
  return idx === -1 ? 100 : stages[idx]!;
}

export function hkProgressLabel(pct: number): string {
  const stage =
    [...HK_REASSIGN_STAGES].reverse().find((s) => pct >= s.pct) ??
    HK_REASSIGN_STAGES[0]!;
  return stage.label;
}

export type DeclineReason =
  | "context"
  | "staff"
  | "guest"
  | "other";

export const DECLINE_REASONS: { id: DeclineReason; label: string }[] = [
  { id: "context", label: "Operational context differs" },
  { id: "staff", label: "Staff unavailable" },
  { id: "guest", label: "Guest priority changed" },
  { id: "other", label: "Other" },
];

export type ChangeScopeOption =
  | "staffing"
  | "exclude_floor"
  | "delay"
  | "guardrail"
  | "comment";

export const CHANGE_SCOPE_OPTIONS: { id: ChangeScopeOption; label: string }[] = [
  { id: "staffing", label: "Adjust staffing amount" },
  { id: "exclude_floor", label: "Exclude floor" },
  { id: "delay", label: "Delay execution" },
  { id: "guardrail", label: "Add guardrail" },
  { id: "comment", label: "Comment only" },
];

export function formatEuro(n: number): string {
  return `€${n.toLocaleString("en-IE")}`;
}

/** Shared DecisionFuture grammar (hotel adapter). */
export type HotelDecisionFuture = {
  id: string;
  label: string;
  recommended: boolean;
  actions: string[];
  operational: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
  financial: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
  guest: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
  expectedValueEuro: number;
  exposureEuro: number;
  risk: string;
  confidence: number;
  /** Optional staffing fork for readiness Decision. */
  staffing?: HkStaffing | 0;
};

/**
 * D-H-9201 Compare Futures — deterministic, property-scale.
 * Do not invent full recovery; Future C leaves €360 residual exposure.
 */
export function readinessFutures(): HotelDecisionFuture[] {
  const a = {
    ready: "31 / 42",
    atRisk: 7,
    delay: 22,
    exposure: 1840,
    protected: 0,
  };
  const b = hkStaffingPreview(1);
  const c = hkStaffingPreview(2);

  return [
    {
      id: "future_a_nothing",
      label: "Future A · Do nothing",
      recommended: false,
      staffing: 0,
      actions: ["Keep current floor allocation"],
      operational: [
        { label: "Ready", value: a.ready, tone: "neg" },
        { label: "At risk", value: `${a.atRisk} rooms`, tone: "neg" },
        { label: "Avg delay", value: `${a.delay}m`, tone: "neg" },
      ],
      financial: [
        { label: "Exposure", value: formatEuro(a.exposure), tone: "neg" },
        { label: "Protected", value: formatEuro(0), tone: "neutral" },
      ],
      guest: [
        { label: "Check-in risk", value: "High · Floor 3 wave", tone: "neg" },
        { label: "Satisfaction", value: "Material delay risk", tone: "neg" },
      ],
      expectedValueEuro: 0,
      exposureEuro: a.exposure,
      risk: "7 rooms miss arrival-ready window",
      confidence: 90,
    },
    {
      id: "future_b_one",
      label: "Future B · Reassign 1 housekeeper",
      recommended: false,
      staffing: 1,
      actions: ["Move 1 attendant from Floor 1 → Floor 3"],
      operational: [
        { label: "Ready", value: b.ready, tone: "neutral" },
        { label: "At risk", value: `${b.atRisk} rooms`, tone: "neg" },
        { label: "Avg delay", value: `${b.avgDelayMin}m`, tone: "neutral" },
      ],
      financial: [
        { label: "Exposure left", value: formatEuro(b.exposureEuro), tone: "neg" },
        {
          label: "Protected",
          value: formatEuro(b.protectedEuro),
          tone: "pos",
        },
      ],
      guest: [
        { label: "Check-in risk", value: "Medium", tone: "neutral" },
        { label: "Satisfaction", value: "Partial recovery", tone: "neutral" },
      ],
      expectedValueEuro: b.protectedEuro,
      exposureEuro: b.exposureEuro,
      risk: "Floor 3 still behind peak 15:00–15:40 arrivals",
      confidence: b.confidence,
    },
    {
      id: "future_c_two",
      label: "Future C · Reassign 2 housekeepers",
      recommended: true,
      staffing: 2,
      actions: [
        "Move 2 attendants from Floors 1–2 → Floor 3",
        "Prioritize at-risk + VIP rooms",
      ],
      operational: [
        { label: "Ready", value: c.ready, tone: "pos" },
        { label: "At risk", value: `${c.atRisk} rooms`, tone: "pos" },
        { label: "Avg delay", value: `${c.avgDelayMin}m`, tone: "pos" },
      ],
      financial: [
        {
          label: "Exposure left",
          value: formatEuro(c.exposureEuro),
          tone: "pos",
        },
        {
          label: "Protected",
          value: `up to ${formatEuro(c.protectedEuro)}`,
          tone: "pos",
        },
      ],
      guest: [
        { label: "Check-in risk", value: "Low", tone: "pos" },
        { label: "Satisfaction", value: "No material impact", tone: "pos" },
      ],
      expectedValueEuro: c.protectedEuro,
      exposureEuro: c.exposureEuro,
      risk: "Residual 3 rooms · not full recovery",
      confidence: c.confidence,
    },
  ];
}

/** Cost of waiting — qualitative unless model supports precision. */
export function readinessCostOfWaiting(): {
  decideBy: string;
  note: string;
} {
  return {
    decideBy: "14:40",
    note: "Readiness recovery window narrows after 14:40. Every delay reduces recoverable rooms before the 15:00 arrival wave.",
  };
}

export function futureById(id: string): HotelDecisionFuture | undefined {
  return readinessFutures().find((f) => f.id === id);
}
