/**
 * Lab Control Center — shared operating state.
 * Seeds: service (Wait-12) · recover (credit sealed) · margin-response (two-site Expected)
 */

import { CANON_PEAK, CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";
import {
  PEAK_SERVICE_CLOCK,
  peakDecisionWindowMinutes,
} from "@/lib/radr/decision/demos/peakClock";

export type LabMode = "live" | "why" | "futures" | "context" | "approved";
export type LabFuture = "seat_now" | "wait_12" | "hard_stop";
export type LabSeed = "service" | "recover" | "margin-response";
export type LabNode =
  | "floor"
  | "kitchen"
  | "inbound"
  | "walkins"
  | "delivery"
  | "kds"
  | "turns"
  | "econ"
  | "deadline"
  | null;

export function isFinanceSeed(seed: LabSeed): boolean {
  return seed === "recover" || seed === "margin-response";
}

export function parseLabSeed(
  param: string | null | undefined,
): LabSeed {
  if (param === "recover") return "recover";
  if (param === "margin-response") return "margin-response";
  return "service";
}

export type LabState = {
  mode: LabMode;
  selectedFuture: LabFuture;
  selectedNode: LabNode;
  operatorContext: "none" | "vip";
  whyStep: number;
  seed: LabSeed;
};

export const LAB_TIMES = ["18:42", "18:50", "19:00", "19:15", "19:30"] as const;

export const LAB_INITIAL: LabState = {
  mode: "live",
  selectedFuture: "wait_12",
  selectedNode: null,
  operatorContext: "none",
  whyStep: 0,
  seed: "service",
};

export type LabDerived = {
  seed: LabSeed;
  floorPct: number;
  kitchenPct: number;
  ticketMin: number;
  turnRisk: number;
  contribution: number;
  inbound: number;
  walkins: number;
  deliveryPct: number;
  decisionLabel: string;
  decisionSub: string;
  recommended: LabFuture;
  decisionId: string;
  displayId: string;
  deadlineLabel: string;
  clockLabel: string;
  moneyGrade: "Expected" | "Verified";
  moneyMeta: string;
  actions: { system: string; title: string; detail: string }[];
};

export function deriveLab(state: LabState): LabDerived {
  if (state.seed === "recover") {
    return deriveRecover(state);
  }
  if (state.seed === "margin-response") {
    return deriveTwoSite(state);
  }
  return deriveService(state);
}

/** Two-site unit price gap — Expected only until sealed. */
function deriveTwoSite(state: LabState): LabDerived {
  const f = state.selectedFuture;
  let contribution = 410;
  let decisionLabel = "TWO-SITE UNIT PRICE GAP";
  let decisionSub =
    "Bluefin oil · Mitte €7.45/L vs Prenzlauer Berg €6.80/L · Expected";
  const moneyGrade: "Expected" | "Verified" = "Expected";
  const moneyMeta = "No seal · Expected until CM + doc_ref";
  const recommended: LabFuture = "wait_12";

  if (f === "seat_now") {
    contribution = 0;
    decisionLabel = "ABSORB THE GAP";
    decisionSub = "Variance stays on screen · cash never recovers";
  } else if (f === "hard_stop") {
    contribution = 0;
    decisionLabel = "SWITCH SUPPLIER NOW";
    decisionSub = "Wrong first lever — settle the price gap first";
  }

  return {
    seed: "margin-response",
    floorPct: 78,
    kitchenPct: 92,
    ticketMin: 14,
    turnRisk: 9,
    contribution,
    inbound: 38,
    walkins: 2,
    deliveryPct: 31,
    decisionLabel,
    decisionSub,
    recommended,
    decisionId: "dec_two_site_oil",
    displayId: "D-4108",
    deadlineLabel: "This week",
    clockLabel: "Expected · Trace",
    moneyGrade,
    moneyMeta,
    actions: [
      {
        system: "AP",
        title: "Match both invoices to contract",
        detail: "INV-88421 · INV-88502 · CTR-OIL-2026",
      },
      {
        system: "Trace",
        title: "Open Expected lineage",
        detail: "Incomplete until credit_memo applied + doc_ref",
      },
      {
        system: "Policy",
        title: "Draft credit / price correction",
        detail: "Ask · never auto short-pay / auto-remit",
      },
    ],
  };
}

function deriveRecover(state: LabState): LabDerived {
  const f = state.selectedFuture;
  // Sales demo default: sealed Verified credit → Trace → stop
  let contribution = 273;
  let decisionLabel = "AP CREDIT APPLIED";
  let decisionSub =
    "INV-88421 · CM-44102 applied · Trace sealed · Finance can match AP";
  let moneyGrade: "Expected" | "Verified" = "Verified";
  let moneyMeta = "applied_amount · sealed Trace";
  const recommended: LabFuture = "wait_12";

  if (f === "seat_now") {
    contribution = 0;
    decisionLabel = "LEAVE UNAPPLIED";
    decisionSub = "Credit stays on screen · cash never lands";
    moneyGrade = "Expected";
    moneyMeta = "No seal · not Verified";
  } else if (f === "hard_stop") {
    contribution = 0;
    decisionLabel = "REPRICE MENU NOW";
    decisionSub = "Does not resolve AP credit · wrong lever";
    moneyGrade = "Expected";
    moneyMeta = "Not a Recover Trace";
  }

  const project = state.mode === "futures" || state.mode === "approved";
  if (!project && f !== "wait_12") {
    contribution = 273;
    decisionLabel = "AP CREDIT APPLIED";
    decisionSub =
      "INV-88421 · CM-44102 applied · Trace sealed · Finance can match AP";
    moneyGrade = "Verified";
    moneyMeta = "applied_amount · sealed Trace";
  }

  return {
    seed: "recover",
    floorPct: 78,
    kitchenPct: 92,
    ticketMin: 14,
    turnRisk: 9,
    contribution,
    inbound: 38,
    walkins: 2,
    deliveryPct: 31,
    decisionLabel,
    decisionSub,
    recommended,
    decisionId: CANON_SUPPLIER.id,
    displayId: CANON_SUPPLIER.displayId,
    deadlineLabel: "Sealed",
    clockLabel: "Trace → stop",
    moneyGrade,
    moneyMeta,
    actions: [
      {
        system: "AP",
        title: "Credit memo applied",
        detail: "CM-44102 · applied_to INV-88421 · doc_ref AP-POST-991",
      },
      {
        system: "Trace",
        title: "Open sealed lineage",
        detail: "invoice_line → evidence → finding → CM → Verified €273",
      },
      {
        system: "Policy",
        title: "Draft next credit request",
        detail: "Ask · never auto short-pay / auto-remit",
      },
    ],
  };
}

function deriveService(state: LabState): LabDerived {
  const vip = state.operatorContext === "vip";
  const f = state.selectedFuture;

  const live = {
    floorPct: 78,
    kitchenPct: 92,
    ticketMin: 14,
    turnRisk: 9,
    inbound: 38,
    walkins: 2,
    deliveryPct: 31,
  };

  let kitchenPct = live.kitchenPct;
  let ticketMin = live.ticketMin;
  let turnRisk = live.turnRisk;
  let contribution = 0;
  let decisionLabel = "WAIT 12 MINUTES";
  let decisionSub = "Hold walk-ins · throttle delivery · feature fast dish";
  let recommended: LabFuture = "wait_12";

  if (f === "seat_now") {
    kitchenPct = 97;
    ticketMin = 18;
    turnRisk = 14;
    contribution = 0;
  } else if (f === "hard_stop") {
    kitchenPct = 88;
    ticketMin = 13;
    turnRisk = 4;
    contribution = 180;
  } else {
    kitchenPct = vip ? 93 : 90;
    ticketMin = vip ? 15 : 14;
    turnRisk = vip ? 7 : 5;
    contribution = vip ? 540 : 620;
  }

  if (vip) {
    recommended = "wait_12";
    decisionLabel = "SEAT VIP · HOLD SECOND";
    decisionSub =
      "VIP by 18:50 · hold second walk-in · maintain delivery throttle";
  } else {
    decisionLabel = "WAIT 12 MINUTES";
    decisionSub =
      "Hold 2 walk-ins · throttle 25m · feature high €/min · resume 18:54";
  }

  const project =
    state.mode === "futures" || state.mode === "approved";

  if (!project) {
    kitchenPct = live.kitchenPct;
    ticketMin = live.ticketMin;
    turnRisk = live.turnRisk;
    contribution = vip ? 540 : 620;
  }

  const actions = vip
    ? [
        {
          system: "FLOOR",
          title: "Seat VIP by 18:50",
          detail: "Hold second walk-in party",
        },
        {
          system: "DELIVERY",
          title: "Throttle 25 minutes",
          detail: "Intake cap until kitchen clears",
        },
        {
          system: "MENU",
          title: "Feature faster high-€/min dish",
          detail: "Protect cold-station minutes",
        },
      ]
    : [
        {
          system: "FLOOR",
          title: "Hold next walk-in table",
          detail: `Resume ${PEAK_SERVICE_CLOCK.resumeLabel}`,
        },
        {
          system: "DELIVERY",
          title: "Throttle 25 minutes",
          detail: "Prepared · not written back",
        },
        {
          system: "MENU",
          title: "Feature faster high-€/min dish",
          detail: "Peak window only",
        },
      ];

  return {
    seed: "service",
    ...live,
    kitchenPct,
    ticketMin,
    turnRisk,
    contribution,
    decisionLabel,
    decisionSub,
    recommended,
    decisionId: CANON_PEAK.id,
    displayId: CANON_PEAK.displayId,
    deadlineLabel: PEAK_SERVICE_CLOCK.deadlineLabel,
    clockLabel: `${peakDecisionWindowMinutes()} min`,
    moneyGrade: "Expected",
    moneyMeta: "Incremental vs seat-now · tonight",
    actions,
  };
}

export const LAB_CANON = {
  id: CANON_PEAK.displayId,
  decisionId: CANON_PEAK.id,
  property: CANON_PEAK.property,
  now: PEAK_SERVICE_CLOCK.nowLabel,
  deadline: PEAK_SERVICE_CLOCK.deadlineLabel,
  waitMinutes: PEAK_SERVICE_CLOCK.waitMinutes,
  euro: CANON_PEAK.expectedProtectedEuro,
  baseline: "vs seat-now",
};
