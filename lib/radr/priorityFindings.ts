/**
 * Overview priority queue: consumes findingIntelligence + venue truth.
 * Detect → Explain → Quantify → Recommend → Verify
 */

import { formatLocationMoney } from "./currency";
import {
  URGENCY_WEIGHT,
  applyFreshnessToConfidence,
  calculateCancellationExposure,
  calculateStaffingRisk,
  calculateSupplierVariance,
  confidenceWeight,
  type DataSourceFreshness,
  type FinancialImpact,
  type FindingConfidence,
  type FindingRecommendation,
  type FindingVerification,
} from "./findingIntelligence";
import { BERLIN_RESERVATION_SUMMARY } from "./reservationDemo";
import {
  BERLIN_TONIGHT_OPS,
  BERLIN_TONIGHT_FORECAST,
} from "./venueProfiles";

export type FindingWorkflowStatus =
  | "NEW"
  | "REVIEWED"
  | "ACTIONED"
  | "MONITORING"
  | "RESOLVED"
  | "DISMISSED";

export type PriorityBand = "ACT NOW" | "TODAY" | "WATCH" | "OPPORTUNITY";

export type TerritoryCode = "BUY" | "LABOR" | "SELL" | "RECOVER";

export type FindingDriver = { label: string; value: string };

export type PriorityFinding = {
  id: string;
  territory: TerritoryCode;
  type: string;
  kind: string;
  title: string;
  headline: string;
  explanation: string;
  timeframe: string;
  when: string;
  summary: string;
  impactEuro: number;
  impactLabel: string;
  recommendShort: string;
  ctaLabel: string;
  priorityBand: PriorityBand;
  priorityScore: number;
  status: FindingWorkflowStatus;
  locationId: string;
  locationName: string;
  what: string;
  whyItMatters: string;
  drivers: FindingDriver[];
  seesRows: FindingDriver[];
  financialImpact: FinancialImpact;
  recommendation: FindingRecommendation;
  confidence: FindingConfidence;
  dataSources: DataSourceFreshness[];
  verification: FindingVerification;
  financialNote?: string;
  primaryAction: {
    kind: "mark" | "open" | "send" | "review";
    label: string;
    href?: string;
  };
  secondaryHref: string;
  secondaryLabel: string;
  actionedNote?: string;
  actionCreated?: boolean;
  eventId?: string;
};

const LOC = "loc_ber";
const money = (n: number) => formatLocationMoney(n, LOC, { compact: true });

const LABOR_CALC = calculateStaffingRisk({
  expectedCovers: BERLIN_TONIGHT_FORECAST.covers,
  capacityCovers: BERLIN_TONIGHT_OPS.peakServiceCapacity,
  revenueAtRisk: 290,
  contributionRate: 105 / 290,
  fohCost: 68,
  bookingLiftPct: BERLIN_TONIGHT_OPS.bookingPaceVsComparable,
  walkInLiftPct: 4.1,
  localEvent: false,
});

const LATE_CANCEL = calculateCancellationExposure({
  reservations: 1,
  covers: 4,
  spendPerCover: BERLIN_TONIGHT_OPS.expectedSpendPerCover,
  rebookingProbability: 90 / 256,
  contributionRate: BERLIN_TONIGHT_OPS.contributionRate,
});

const BUY_CALC = calculateSupplierVariance({
  invoiceTotal: 2840,
  contractedTotal: 2722,
  lines: [
    { label: "Tomatoes", variance: 46 },
    { label: "Olive oil", variance: 38 },
    { label: "Fresh herbs", variance: 34 },
  ],
});

const FRESH_BOOKINGS: DataSourceFreshness = {
  key: "bookings",
  label: "Bookings",
  lastSyncLabel: "2m ago",
  ageMinutes: 2,
};
const FRESH_LABOR: DataSourceFreshness = {
  key: "labor",
  label: "Labor",
  lastSyncLabel: "2m ago",
  ageMinutes: 2,
};
const FRESH_INVOICE: DataSourceFreshness = {
  key: "supplier_invoices",
  label: "Supplier invoices",
  lastSyncLabel: "14m ago",
  ageMinutes: 14,
};

function scoreFinding(
  band: PriorityBand,
  primaryEuro: number,
  confidence: FindingConfidence,
  timeSensitive: boolean,
): number {
  return (
    (URGENCY_WEIGHT[band] ?? 0) +
    Math.min(primaryEuro / 10, 80) +
    confidenceWeight(confidence.level) * 8 +
    (timeSensitive ? 12 : 0)
  );
}

const laborConfidence = applyFreshnessToConfidence(
  {
    level: "HIGH",
    score: 84,
    explanation:
      "Bookings, service curve, and labor schedule agree on peak pressure 19:00-20:30.",
  },
  [FRESH_BOOKINGS, FRESH_LABOR],
);

const lateConfidence = applyFreshnessToConfidence(
  {
    level: "MEDIUM",
    score: 70,
    explanation:
      "Late cancellation replacement is historical. Actual refill may differ tonight.",
  },
  [FRESH_BOOKINGS],
);

const buyConfidence = applyFreshnessToConfidence(
  {
    level: "HIGH",
    score: 94,
    explanation: "Deterministic invoice vs contract comparison on line items.",
  },
  [FRESH_INVOICE],
);

const rs = BERLIN_RESERVATION_SUMMARY;

export const BERLIN_PRIORITY_FINDINGS: PriorityFinding[] = [
  {
    id: "pf_labor_peak",
    territory: "LABOR",
    type: "peak_service_capacity",
    kind: "Peak service capacity",
    title: "Peak service is understaffed",
    headline: "Peak service is understaffed.",
    explanation:
      "19:00-20:30 demand exceeds current FOH (Front of House) capacity, with group arrivals overlapping the peak.",
    timeframe: "Tonight · 19:00-20:30",
    when: "Tonight · 19:00-20:30",
    summary: "19:00-20:30 · +1 FOH (Front of House) recommended",
    impactEuro: LABOR_CALC.revenueAtRisk,
    impactLabel: "Revenue at risk",
    recommendShort: "+1 FOH (Front of House) · 19:15-20:30",
    ctaLabel: "Review & act",
    priorityBand: "ACT NOW",
    priorityScore: scoreFinding(
      "ACT NOW",
      LABOR_CALC.revenueAtRisk,
      laborConfidence,
      true,
    ),
    status: "NEW",
    locationId: LOC,
    locationName: "Berlin Mitte",
    what: "Expected peak demand exceeds current FOH (Front of House) service capacity between 19:00-20:30.",
    whyItMatters:
      "Without coverage, service quality and estimated dinner revenue during the peak are exposed.",
    seesRows: [
      {
        label: "Forecast covers tonight",
        value: String(BERLIN_TONIGHT_FORECAST.covers),
      },
      {
        label: "Booked covers / reservations",
        value: `${rs.bookedCovers} · ${rs.reservationCount} reservations`,
      },
      {
        label: "Peak window",
        value: `${rs.peakWindowLabel} · ${rs.peakCovers} covers`,
      },
      {
        label: "Peak service capacity",
        value: `~${rs.peakCapacity} covers`,
      },
      { label: "Capacity gap", value: `~${rs.peakGap} covers` },
      {
        label: "Section B pressure",
        value: `${BERLIN_TONIGHT_OPS.sectionBPeakCovers} vs ${BERLIN_TONIGHT_OPS.sectionBCapacity} capacity`,
      },
    ],
    drivers: [
      {
        label: "Booking pace",
        value: `+${BERLIN_TONIGHT_OPS.bookingPaceVsComparable}% vs comparable Wednesday`,
      },
      {
        label: "Group arrivals",
        value: `${rs.groupCovers} covers · ${rs.groupBookingCount} groups`,
      },
      {
        label: "Expected additional covers",
        value: `+${rs.expectedAdditionalCovers}`,
      },
      { label: "Service pressure", value: rs.servicePressure },
    ],
    financialImpact: {
      revenueAtRisk: LABOR_CALC.revenueAtRisk,
      contributionAtRisk: LABOR_CALC.contributionAtRisk,
      primaryEuro: LABOR_CALC.revenueAtRisk,
      primaryLabel: "Revenue at risk",
    },
    recommendation: {
      action: "Add +1 FOH (Front of House)",
      detail: "19:15-20:30 · prioritize Section B",
      actionCost: LABOR_CALC.actionCost,
      expectedRevenueProtected: LABOR_CALC.expectedRevenueProtected,
      expectedContributionProtected: LABOR_CALC.expectedContributionProtected,
      expectedNetBenefit: LABOR_CALC.expectedNetBenefit,
    },
    confidence: laborConfidence,
    dataSources: [FRESH_BOOKINGS, FRESH_LABOR],
    verification: {
      status: "IDENTIFIED",
      method:
        "After action, RADR monitors actual covers vs capacity. Predicted revenue is not auto-verified.",
    },
    financialNote:
      "Predictive estimate, not an accounting fact. Verified value requires observed outcome.",
    primaryAction: {
      kind: "mark",
      label: "Add to actions",
      href: "/app/controls",
    },
    secondaryHref: "/app/service",
    secondaryLabel: "View service map",
    eventId: "evt_tonight_peak",
  },
  {
    id: "pf_recover_late",
    territory: "RECOVER",
    type: "cancellation_recovery",
    kind: "Waitlist recovery",
    title: "Late cancellation created recoverable inventory",
    headline: "Late cancellation created recoverable inventory.",
    explanation:
      "4 covers released at 20:00. A 3-person waitlist match is available against Table 14.",
    timeframe: "Yesterday · 20:00",
    when: "Yesterday evening",
    summary: "Waitlist seated · POS closed at €184",
    impactEuro: 184,
    impactLabel: "Verified value",
    recommendShort: "Verified",
    ctaLabel: "View proof",
    priorityBand: "WATCH",
    priorityScore: scoreFinding("WATCH", 184, lateConfidence, false),
    status: "RESOLVED",
    locationId: LOC,
    locationName: "Berlin Mitte",
    what: "A confirmed Table 14 reservation cancelled at 17:42, releasing 4 covers at 20:00.",
    whyItMatters:
      "Released inventory still has demand on the waitlist. Observed POS becomes verified value only after seating.",
    seesRows: [
      { label: "Covers released", value: "4 · Table 14 · 20:00" },
      {
        label: "Original booking value",
        value: money(LATE_CANCEL.originalBookingValue),
      },
      { label: "Waitlist match", value: "3 guests · 19:45-20:15" },
      { label: "Potentially recoverable", value: money(184) },
      {
        label: "All cancellations tonight",
        value: `${rs.cancellationCount} · ${rs.cancelledCovers} covers`,
      },
    ],
    drivers: [
      {
        label: "Cancelled booking value",
        value: money(LATE_CANCEL.originalBookingValue),
      },
      { label: "Waitlist expected spend", value: money(192) },
      { label: "Potentially recoverable", value: money(184) },
    ],
    financialImpact: {
      grossValue: LATE_CANCEL.originalBookingValue,
      revenueAtRisk: 184,
      contributionAtRisk: LATE_CANCEL.contributionExposed,
      recoverableValue: 184,
      primaryEuro: 184,
      primaryLabel: "Potentially recoverable",
    },
    recommendation: {
      action: "Offer released inventory to waitlist",
      detail: "Contact 3-guest waitlist party for Table 14 at 20:00.",
      channels: ["Waitlist", "Direct booking"],
      expectedRevenueProtected: 184,
      expectedContributionProtected: LATE_CANCEL.contributionExposed,
      expectedNetBenefit: 184,
    },
    confidence: lateConfidence,
    dataSources: [FRESH_BOOKINGS],
    verification: {
      status: "IDENTIFIED",
      method:
        "If the waitlist party is seated, RADR links POS close to Table 14. Only observed revenue becomes verified value.",
    },
    financialNote:
      "Potential recoverable uses expected waitlist spend. Verified value requires observed POS.",
    primaryAction: {
      kind: "mark",
      label: "Add to actions",
      href: "/app/controls",
    },
    secondaryHref: "/app/recover",
    secondaryLabel: "View recover board",
  },
  {
    id: "pf_buy_variance",
    territory: "BUY",
    type: "supplier_variance",
    kind: "Supplier variance",
    title: "Produce invoice above agreed pricing",
    headline: "Produce invoice is €118 above agreed pricing.",
    explanation: "Invoice differs from current supplier terms.",
    timeframe: "Today",
    when: "Today",
    summary: "Contracted vs invoiced · review invoice",
    impactEuro: BUY_CALC.recoverableValue,
    impactLabel: "Recoverable / review",
    recommendShort: "Review invoice vs contract",
    ctaLabel: "Review invoice",
    priorityBand: "TODAY",
    priorityScore: scoreFinding(
      "TODAY",
      BUY_CALC.recoverableValue,
      buyConfidence,
      false,
    ),
    status: "NEW",
    locationId: LOC,
    locationName: "Berlin Mitte",
    what: "Invoice total exceeds the contracted total on this produce delivery.",
    whyItMatters:
      "Three line items differ from contracted pricing. Variance is still actionable while the invoice is open.",
    seesRows: [
      {
        label: "Invoice total",
        value: money(BUY_CALC.invoiceTotal),
      },
      {
        label: "Expected contracted total",
        value: money(BUY_CALC.contractedTotal),
      },
      { label: "Variance", value: `+${money(BUY_CALC.variance)}` },
      ...BUY_CALC.lines.map((l) => ({
        label: l.label,
        value: `+${money(l.variance)}`,
      })),
    ],
    drivers: BUY_CALC.lines.map((l) => ({
      label: l.label,
      value: `+${money(l.variance)}`,
    })),
    financialImpact: {
      recoverableValue: BUY_CALC.recoverableValue,
      primaryEuro: BUY_CALC.recoverableValue,
      primaryLabel: "Recoverable / review",
    },
    recommendation: {
      action: "Review invoice against contract",
      detail: "Open reconciliation for the three mismatched lines.",
      expectedNetBenefit: BUY_CALC.recoverableValue,
    },
    confidence: buyConfidence,
    dataSources: [FRESH_INVOICE],
    verification: {
      status: "IDENTIFIED",
      method:
        "Verified when supplier credit or corrected invoice is confirmed in accounting.",
    },
    financialNote:
      "Deterministic invoice/contract variance. Becomes verified value only after recovery evidence.",
    primaryAction: {
      kind: "review",
      label: "Open reconciliation",
      href: "/app/checks",
    },
    secondaryHref: "/app/buy",
    secondaryLabel: "View calculation",
  },
];

export const SINCE_LAST_CHECK = {
  newFindings: 2,
  resolved: 1,
  additionalAtRisk: 95,
  verifiedEuro: 184,
} as const;

export function sortPriorityFindings(
  findings: PriorityFinding[],
): PriorityFinding[] {
  return [...findings].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function priorityFindingsForScope(scope: string): PriorityFinding[] {
  if (scope === "loc_ber" || scope === "all" || scope.startsWith("region_")) {
    return sortPriorityFindings(BERLIN_PRIORITY_FINDINGS);
  }
  return [];
}

export function unresolvedFindings(
  findings: PriorityFinding[],
): PriorityFinding[] {
  return findings.filter(
    (f) => f.status !== "RESOLVED" && f.status !== "DISMISSED",
  );
}

export function valueAtRiskEuro(findings: PriorityFinding[]): number {
  return unresolvedFindings(findings).reduce((sum, f) => sum + f.impactEuro, 0);
}

export function territoryOpenCounts(
  findings: PriorityFinding[],
): Record<TerritoryCode, number> {
  const base: Record<TerritoryCode, number> = {
    BUY: 0,
    LABOR: 0,
    SELL: 0,
    RECOVER: 0,
  };
  for (const f of unresolvedFindings(findings)) {
    base[f.territory] += 1;
  }
  return base;
}

export function formatFindingEuro(n: number): string {
  return formatLocationMoney(n, LOC, { compact: false, cents: true });
}

export function deriveAttentionStatus(findings: PriorityFinding[]): {
  open: number;
  atRisk: number;
  label: string;
  detail: string;
  state: "ok" | "watch" | "risk" | "opportunity";
} {
  const open = unresolvedFindings(findings);
  const atRisk = valueAtRiskEuro(open);
  if (open.length === 0) {
    return {
      open: 0,
      atRisk: 0,
      label: "Operation on plan",
      detail: "No material exceptions",
      state: "ok",
    };
  }
  return {
    open: open.length,
    atRisk,
    label: `${open.length} open`,
    detail: `${formatFindingEuro(atRisk)} at risk`,
    state: "risk",
  };
}
