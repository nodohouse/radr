import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import {
  applyFreshnessToConfidence,
  calculateStaffingRisk,
} from "@/lib/radr/calc";
import { scoreFinding } from "../priority";

export function detectStaffingGap(ctx: OperatingContext): Finding | null {
  const calc = calculateStaffingRisk({
    expectedCovers: ctx.forecast.covers,
    capacityCovers: ctx.capacity.peakCapacityCovers,
    revenueAtRisk: ctx.labor.revenueAtRiskIfGap,
    contributionRate: ctx.bookings.contributionRate,
    fohCost: ctx.labor.fohCostPerShift,
    bookingLiftPct: ctx.bookings.bookingPaceVsComparable,
    walkInLiftPct: 4.1,
    localEvent: false,
  });

  if (calc.gap <= 0) return null;

  const freshness = ctx.dataFreshness.filter(
    (s) => s.key === "bookings" || s.key === "labor",
  );
  const confidence = applyFreshnessToConfidence(
    {
      level: "HIGH",
      score: 84,
      explanation:
        "Bookings, service curve, and labor schedule agree on peak pressure.",
    },
    freshness,
  );

  const window = `${ctx.capacity.peakWindowStart}-${ctx.capacity.peakWindowEnd}`;
  const now = `${ctx.businessDate}T16:45:00+02:00`;
  const urgency = "ACT_NOW" as const;
  const primaryValue = calc.revenueAtRisk;

  return {
    id: `fnd_staffing_${ctx.locationId}`,
    organizationId: ctx.organizationId,
    locationId: ctx.locationId,
    locationName: ctx.locationName,
    territory: "LABOR",
    category: "peak_service_capacity",
    subtype: "Peak service capacity",
    title: "Peak service is understaffed",
    summary: `Expected peak demand exceeds current FOH service capacity between ${window}.`,
    explanation:
      "Without coverage, service quality and estimated dinner revenue during the peak are exposed.",
    status: "OPEN",
    urgency,
    priorityScore: scoreFinding({
      urgency,
      primaryValue,
      confidenceBand: confidence.level,
      timeSensitive: true,
      actionable: true,
    }),
    confidenceScore: confidence.score,
    confidenceBand: confidence.level,
    confidenceExplanation: confidence.explanation,
    timeframe: {
      start: `${ctx.businessDate}T${ctx.capacity.peakWindowStart}:00+02:00`,
      end: `${ctx.businessDate}T${ctx.capacity.peakWindowEnd}:00+02:00`,
      label: `Tonight · ${window}`,
    },
    financialImpact: {
      revenueAtRisk: calc.revenueAtRisk,
      contributionAtRisk: calc.contributionAtRisk,
      primaryValue,
      primaryLabel: "Revenue at risk",
      currency: ctx.currency,
    },
    drivers: [
      {
        label: "Booking pace",
        value: `+${ctx.bookings.bookingPaceVsComparable}% vs comparable`,
      },
      {
        label: "Group arrivals",
        value: `${ctx.bookings.groupCovers} covers · ${ctx.bookings.groupBookingCount} groups`,
      },
      {
        label: "Expected additional covers",
        value: `+${ctx.bookings.expectedAdditionalCovers}`,
      },
      {
        label: "Capacity gap",
        value: `~${calc.gap} covers`,
      },
    ],
    recommendation: {
      title: "Add +1 FOH",
      description: "19:15-20:30 · prioritize Section B",
      expectedCost: calc.actionCost,
      expectedRevenueProtected: calc.expectedRevenueProtected,
      expectedContributionProtected: calc.expectedContributionProtected,
      expectedNetBenefit: calc.expectedNetBenefit,
      expectedBenefit: calc.expectedNetBenefit,
    },
    evidence: [
      {
        id: "ev_fc",
        label: "Forecast covers tonight",
        value: String(ctx.forecast.covers),
      },
      {
        id: "ev_booked",
        label: "Booked covers / reservations",
        value: `${ctx.bookings.bookedCovers} · ${ctx.bookings.reservationCount} reservations`,
      },
      {
        id: "ev_cap",
        label: "Peak service capacity",
        value: `~${ctx.capacity.peakCapacityCovers} covers`,
      },
    ],
    sourceIds: freshness.map((s) => s.key),
    dedupeKey: `${ctx.locationId}:LABOR:peak_service_capacity:${window}`,
    presentation: {
      kindLabel: "Peak service capacity",
      headline: "Peak service is understaffed.",
      recommendShort: "+1 FOH · 19:15-20:30",
      ctaLabel: "Review & act",
      financialNote:
        "Predictive estimate, not an accounting fact. Verified value requires observed outcome.",
      primaryAction: {
        kind: "mark",
        label: "Add to actions",
        href: "/app/controls",
      },
      secondaryHref: "/app/service",
      secondaryLabel: "View service map",
      verificationStatus: "IDENTIFIED",
      verificationMethod:
        "After action, RADR monitors actual covers vs capacity. Predicted revenue is not auto-verified.",
      dataSources: freshness,
    },
    createdAt: now,
    updatedAt: now,
  };
}
