import type { Area, RoleView } from "../types";
import { CONTROLS, OPERATING_MODEL, VALUE } from "./catalog";

export type CommandStatus = "ON COURSE" | "WATCH" | "ATTENTION REQUIRED";
export type TerritoryState = "STABLE" | "WATCH" | "ACTION";
export type TimeRange = "7d" | "30d" | "quarter";

export type TerritoryRailItem = {
  area: Area;
  href: string;
  state: TerritoryState;
  direction: string;
  materiality: string;
};

/** Deterministic executive command state: demo / illustrative */
export const COMMAND = {
  margin: {
    current: 18.4,
    plan: 17.6,
    forecast: 18.1,
    vsPlanPts: 0.8,
    vsPrev7Pts: 0.3,
    heading: "ABOVE PLAN" as const,
  },
  byRange: {
    "7d": {
      vsPlanPts: 0.8,
      vsPrevPts: 0.3,
      current: 18.4,
      plan: 17.6,
      forecast: 18.1,
      exposureOpened: 28_400,
      exposureClosed: 32_100,
      verified: 9_840,
      label: "Last 7 days",
    },
    "30d": {
      vsPlanPts: 0.6,
      vsPrevPts: 0.4,
      current: 18.2,
      plan: 17.6,
      forecast: 18.0,
      exposureOpened: 94_200,
      exposureClosed: 101_600,
      verified: 38_420,
      label: "Last 30 days",
    },
    quarter: {
      vsPlanPts: 0.5,
      vsPrevPts: 0.2,
      current: 18.1,
      plan: 17.6,
      forecast: 17.9,
      exposureOpened: 246_800,
      exposureClosed: 258_400,
      verified: 58_940,
      label: "Quarter",
    },
  },
  territories: [
    {
      area: "buy",
      href: "/app/buy",
      state: "STABLE",
      direction: "+0.1 pts",
      materiality: "Contract adherence holding",
    },
    {
      area: "labor",
      href: "/app/labor",
      state: "WATCH",
      direction: "−0.3 pts",
      materiality: "Demand vs schedule drift",
    },
    {
      area: "sell",
      href: "/app/sell",
      state: "STABLE",
      direction: "+0.2 pts",
      materiality: "Pricing capture improving",
    },
    {
      area: "recover",
      href: "/app/recover",
      state: "ACTION",
      direction: "€4,280 due",
      materiality: "Credit overdue",
    },
  ] satisfies TerritoryRailItem[],
  attentionIds: {
    cfo: ["sig_010", "sig_001", "sig_003"],
    regional: ["sig_010", "sig_001", "sig_003"],
    finance: ["sig_001", "sig_002", "sig_005"],
    coo: ["sig_003", "sig_006", "sig_010"],
    gm: ["sig_010", "sig_003", "sig_004"],
    owner: ["sig_010", "sig_001"],
    fb_operator: ["sig_010", "sig_003", "sig_004"],
  } as Record<RoleView, string[]>,
  sinceYesterday: {
    identified: 8_420,
    resolved: 12_600,
    verified: 4_280,
    controlsActivated: 2,
    /** resolved − identified */
    netUnresolvedDelta: -4_180,
  },
  monitoring: {
    observations: 184,
    deltas: 37,
    signals: 10,
    requireAttention: 3,
    handledInWorkflow: 7,
  },
  coverage: {
    locationsReporting: OPERATING_MODEL.locations,
    locationsTotal: OPERATING_MODEL.locations,
    controlsActive: CONTROLS.filter((c) => c.status === "ACTIVE").length + 43,
    dataCoveragePct: 98,
    lastSync: "2m ago",
  },
  valueLedger: {
    identified: VALUE.identified,
    actioned: VALUE.actioned,
    realized: VALUE.recoveredPreventedCaptured,
    verified: VALUE.verified,
    protected: VALUE.prevented,
  },
  materialExposureAttention: 18_620 + 4_280 + 840,
} as const;

/** Map margin vs plan + territory watch + attention into command status */
export function deriveCommandStatus(opts: {
  vsPlanPts: number;
  territoryStates: TerritoryState[];
  attentionCount: number;
  hasUnownedUrgent: boolean;
}): CommandStatus {
  // Margin below plan or urgent unowned material → escalate
  if (opts.vsPlanPts < 0 || opts.hasUnownedUrgent) {
    return "ATTENTION REQUIRED";
  }
  // Above plan with owned exceptions: still ON COURSE. Attention list carries the work
  // WATCH only when margin barely holds and a territory is ACTION without ownership clarity
  if (opts.vsPlanPts < 0.2 && opts.territoryStates.includes("ACTION")) {
    return "WATCH";
  }
  return "ON COURSE";
}

export function formatPts(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)} pts`;
}

export function formatSignedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

export function formatCompactEuro(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    return `${sign}€${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    const rounded = Math.round(k * 10) / 10;
    const text =
      Number.isInteger(rounded) && rounded >= 100
        ? rounded.toFixed(0)
        : rounded.toFixed(1);
    return `${sign}€${text}k`;
  }
  return `${sign}€${Math.round(abs).toLocaleString("en-IE")}`;
}
