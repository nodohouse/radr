/**
 * Demo visual series for Overview live intelligence.
 * Static after render: animate only on mount / value change.
 *
 * Exposure SoT (Berlin Overview):
 * Labor €290 + Buy €118 = €408 current exposure.
 * Verified recover €184 is excluded.
 */

import { CANONICAL_EVENTS } from "@/lib/radr/canonicalDemo";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";

export type TrendEvent = {
  territory: "BUY" | "LABOR" | "SELL" | "RECOVER";
  label: string;
  deltaEuro: number;
};

export type TrendPoint = {
  t: string;
  value: number;
  event?: TrendEvent;
};

const EXPOSURE =
  CANONICAL_EVENTS.laborAtRisk + CANONICAL_EVENTS.buyRecoverable;

/** Berlin Mitte: unresolved exposure through the afternoon. Ends at €408. */
export const RISK_TREND_24H: TrendPoint[] = [
  { t: "08:00", value: 0 },
  {
    t: "10:00",
    value: CANONICAL_EVENTS.buyRecoverable,
    event: {
      territory: "BUY",
      label: "Supplier variance detected",
      deltaEuro: CANONICAL_EVENTS.buyRecoverable,
    },
  },
  { t: "12:00", value: CANONICAL_EVENTS.buyRecoverable },
  { t: "14:00", value: CANONICAL_EVENTS.buyRecoverable },
  {
    t: "16:00",
    value: CANONICAL_EVENTS.laborAtRisk,
    event: {
      territory: "LABOR",
      label: "Peak staffing risk elevated",
      deltaEuro:
        CANONICAL_EVENTS.laborAtRisk - CANONICAL_EVENTS.buyRecoverable,
    },
  },
  {
    t: "17:30",
    value: EXPOSURE,
    event: {
      territory: "LABOR",
      label: "Dinner peak approaching",
      deltaEuro: CANONICAL_EVENTS.buyRecoverable,
    },
  },
];

/** Location concentration of current exposure (sums to €408). */
export const EXPOSURE_BY_LOCATION = [
  { id: "loc_ber", name: "Berlin Mitte", euro: EXPOSURE },
] as const;

/** 7-day sparkline series for Daily Pulse (ending yesterday). */
export const PULSE_SPARKS = {
  revenue: [7200, 7450, 7100, 7680, 7900, 7520, 7812],
  margin: [17.6, 17.9, 18.1, 18.0, 18.3, 18.2, 18.4],
  covers: [108, 115, 102, 118, 125, 112, 122],
  avgSpend: [61, 62, 63, 63.5, 64, 63.8, 64],
  labor: [33.4, 33.1, 32.9, 33.0, 32.8, 32.7, 32.6],
} as const;

export const LABOR_CAPACITY_SERIES = [
  { t: "18:00", demand: 28, capacity: 36 },
  { t: "18:30", demand: 34, capacity: 36 },
  { t: "19:00", demand: 42, capacity: 36 },
  { t: "19:30", demand: 48, capacity: 36 },
  { t: "20:00", demand: 44, capacity: 36 },
  { t: "20:30", demand: 38, capacity: 36 },
  { t: "21:00", demand: 30, capacity: 36 },
] as const;

/** Canonical Table 14 potential vs verified - not a second open cancel story. */
export function sellCancelDecomp() {
  const s = getCancellationRecoveryScenario();
  return {
    bookingValue: s.reservation.expectedBookingValueMajor,
    expectedRebook: s.potentialRecoverableMajor,
    atRisk: s.verification?.verifiedValue ?? s.pos.observedRevenueMajor,
    potential: s.potentialRecoverableMajor,
    verified: s.verification?.verifiedValue ?? s.pos.observedRevenueMajor,
  };
}

/** Static snapshot aligned to Table 14 potential / verified. */
export const SELL_CANCEL_DECOMP = {
  bookingValue: 256,
  expectedRebook: CANONICAL_EVENTS.cancellationPotential,
  atRisk: CANONICAL_EVENTS.cancellationObservedVerified,
} as const;

/** Line deltas must sum to buyRecoverable (€118). */
export const BUY_INVOICE_COMPARE = {
  contracted: 1368,
  invoice: 1368 + CANONICAL_EVENTS.buyRecoverable,
  delta: CANONICAL_EVENTS.buyRecoverable,
  lineItems: [
    { label: "Heirloom tomatoes", delta: 42 },
    { label: "Herb mix", delta: 31 },
    { label: "Citrus crate", delta: 45 },
  ],
} as const;

/**
 * RADR value loop under executive exposure.
 * Identified = current unresolved exposure (€408).
 * Verified = observed Table 14 POS (€184).
 */
export function valueFlowTotals() {
  return {
    identified: EXPOSURE,
    actionable: EXPOSURE,
    recoverable: CANONICAL_EVENTS.buyRecoverable,
    verified: CANONICAL_EVENTS.cancellationObservedVerified,
  };
}

export const VALUE_FLOW = {
  identified: EXPOSURE,
  actionable: EXPOSURE,
  recoverable: CANONICAL_EVENTS.buyRecoverable,
  verified: CANONICAL_EVENTS.cancellationObservedVerified,
} as const;

export const VALUE_FLOW_TIPS = {
  identified: "All material exposure currently under management.",
  actionable: "Issues with a clear recommended next step.",
  recoverable: "Value that can still be protected or recovered today.",
  verified: "Observed and attributed value in the current period.",
} as const;

export const SINCE_CHECK_TIMELINE = [
  { t: "09:02", label: "Supplier variance detected", territory: "BUY" as const },
  {
    t: "09:41",
    label: "Cancellation created recoverable inventory",
    territory: "RECOVER" as const,
  },
  { t: "10:04", label: "Labor risk increased", territory: "LABOR" as const },
  {
    t: "10:18",
    label: "Previous finding resolved",
    territory: "RECOVER" as const,
  },
] as const;
