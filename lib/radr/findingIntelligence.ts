/**
 * RADR finding intelligence calculations.
 * Demo/mock: replace with API outputs later.
 * Detect → Explain → Quantify → Recommend → Verify
 */

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type DataSourceKey =
  | "pos"
  | "bookings"
  | "labor"
  | "supplier_invoices"
  | "accounting"
  | "local_demand";

export type DataSourceFreshness = {
  key: DataSourceKey;
  label: string;
  lastSyncLabel: string;
  /** Minutes since sync: architecture for confidence decay */
  ageMinutes: number;
};

export type FinancialImpact = {
  /** Gross booking / invoice / demand value before recovery logic */
  grossValue?: number;
  revenueAtRisk?: number;
  contributionAtRisk?: number;
  recoverableValue?: number;
  avoidableCost?: number;
  /** Primary display number for collapsed row */
  primaryEuro: number;
  primaryLabel: string;
};

export type FindingRecommendation = {
  action: string;
  detail: string;
  actionCost?: number;
  expectedRevenueProtected?: number;
  expectedContributionProtected?: number;
  expectedNetBenefit?: number;
  channels?: string[];
};

export type FindingConfidence = {
  level: ConfidenceLevel;
  score: number;
  explanation: string;
};

export type FindingVerification = {
  status: "IDENTIFIED" | "MONITORING" | "VERIFIED" | "NOT_APPLICABLE";
  method: string;
  verifiedValue?: number;
};

/** Contribution estimate from revenue using demo margin rate. */
export function estimateContribution(
  revenue: number,
  contributionRate: number,
): number {
  return Math.round(revenue * contributionRate);
}

export function calculateExpectedNetBenefit(
  expectedContributionProtected: number,
  actionCost: number,
): number {
  return expectedContributionProtected - actionCost;
}

export type StaffingRiskInput = {
  expectedCovers: number;
  capacityCovers: number;
  revenueAtRisk: number;
  contributionRate: number;
  fohCost: number;
  bookingLiftPct: number;
  walkInLiftPct: number;
  localEvent: boolean;
};

export function calculateStaffingRisk(input: StaffingRiskInput) {
  const gap = Math.max(0, input.expectedCovers - input.capacityCovers);
  const contributionAtRisk = estimateContribution(
    input.revenueAtRisk,
    input.contributionRate,
  );
  const expectedNetBenefit = calculateExpectedNetBenefit(
    contributionAtRisk,
    input.fohCost,
  );
  return {
    expectedCovers: input.expectedCovers,
    capacityCovers: input.capacityCovers,
    gap,
    revenueAtRisk: input.revenueAtRisk,
    contributionAtRisk,
    actionCost: input.fohCost,
    expectedRevenueProtected: input.revenueAtRisk,
    expectedContributionProtected: contributionAtRisk,
    expectedNetBenefit,
    drivers: [
      {
        label: "Bookings",
        value: `+${input.bookingLiftPct.toFixed(1)}% vs forecast`,
      },
      {
        label: "Expected walk-ins",
        value: `+${input.walkInLiftPct.toFixed(1)}%`,
      },
      {
        label: "Local event",
        value: input.localEvent ? "Detected nearby" : "None",
      },
    ],
  };
}

export type CancellationExposureInput = {
  reservations: number;
  covers: number;
  spendPerCover: number;
  /** 0-1 historical rebooking probability */
  rebookingProbability: number;
  contributionRate: number;
};

export function calculateCancellationExposure(input: CancellationExposureInput) {
  const originalBookingValue = Math.round(input.covers * input.spendPerCover);
  const expectedNaturalRecovery = Math.round(
    originalBookingValue * input.rebookingProbability,
  );
  const revenueExposed = Math.max(
    0,
    originalBookingValue - expectedNaturalRecovery,
  );
  const contributionExposed = estimateContribution(
    revenueExposed,
    input.contributionRate,
  );
  return {
    reservations: input.reservations,
    covers: input.covers,
    originalBookingValue,
    rebookingProbability: input.rebookingProbability,
    expectedNaturalRecovery,
    revenueExposed,
    contributionExposed,
  };
}

export type SupplierLineVariance = {
  label: string;
  variance: number;
};

export type SupplierVarianceInput = {
  invoiceTotal: number;
  contractedTotal: number;
  lines: SupplierLineVariance[];
};

export function calculateSupplierVariance(input: SupplierVarianceInput) {
  const variance = Math.round(input.invoiceTotal - input.contractedTotal);
  const lineSum = input.lines.reduce((s, l) => s + l.variance, 0);
  return {
    invoiceTotal: input.invoiceTotal,
    contractedTotal: input.contractedTotal,
    variance,
    lines: input.lines,
    lineSum,
    recoverableValue: Math.max(0, variance),
  };
}

/** Urgency band weights for sorting */
export const URGENCY_WEIGHT: Record<string, number> = {
  "ACT NOW": 100,
  TODAY: 70,
  WATCH: 40,
  OPPORTUNITY: 20,
};

export function confidenceWeight(level: ConfidenceLevel): number {
  if (level === "HIGH") return 3;
  if (level === "MEDIUM") return 2;
  return 1;
}

/**
 * Reduce confidence when critical sources are stale.
 * Architecture hook: demo uses ageMinutes thresholds.
 */
export function applyFreshnessToConfidence(
  base: FindingConfidence,
  sources: DataSourceFreshness[],
  staleAfterMinutes = 120,
): FindingConfidence {
  const stale = sources.filter((s) => s.ageMinutes > staleAfterMinutes);
  if (!stale.length) return base;
  if (base.level === "HIGH") {
    return {
      level: "MEDIUM",
      score: Math.max(55, base.score - 15),
      explanation: `${base.explanation} Some sources are stale (${stale.map((s) => s.label).join(", ")}).`,
    };
  }
  if (base.level === "MEDIUM") {
    return {
      level: "LOW",
      score: Math.max(40, base.score - 15),
      explanation: `${base.explanation} Critical sources are stale.`,
    };
  }
  return base;
}
