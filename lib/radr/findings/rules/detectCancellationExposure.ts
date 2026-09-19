import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import {
  applyFreshnessToConfidence,
  calculateCancellationExposure,
} from "@/lib/radr/calc";
import { scoreFinding } from "../priority";
import { matchWaitlistToReleasedCovers } from "@/lib/radr/reservations/waitlistRecovery";

export function detectCancellationExposure(
  ctx: OperatingContext,
): Finding | null {
  const late = ctx.bookings.lateCancellations;
  if (late.covers <= 0) return null;

  const calc = calculateCancellationExposure({
    reservations: late.reservations,
    covers: late.covers,
    spendPerCover: ctx.bookings.expectedSpendPerCover,
    rebookingProbability: late.rebookingProbability,
    contributionRate: ctx.bookings.contributionRate,
  });

  const match = matchWaitlistToReleasedCovers(ctx.waitlist, late.covers);
  const freshness = ctx.dataFreshness.filter((s) => s.key === "bookings");
  const confidence = applyFreshnessToConfidence(
    {
      level: "MEDIUM",
      score: 70,
      explanation:
        "Late cancellation replacement is historical. Actual refill may differ tonight.",
    },
    freshness,
  );

  const now = `${ctx.businessDate}T18:00:00+02:00`;
  const urgency = match ? ("ACT_NOW" as const) : ("TODAY" as const);
  const primaryValue = calc.revenueExposed;
  const recoverable = match?.expectedValue ?? 0;

  return {
    id: `fnd_cancel_${ctx.locationId}`,
    organizationId: ctx.organizationId,
    locationId: ctx.locationId,
    locationName: ctx.locationName,
    territory: "SELL",
    category: "cancellation_exposure",
    subtype: "Late cancellation",
    title: "Late cancellation exposure",
    summary: `${late.covers} covers released with ${calc.originalBookingValue} ${ctx.currency} booking value still exposed after natural rebook.`,
    explanation: match
      ? `Waitlist demand can recover part of released inventory (${recoverable} ${ctx.currency} expected).`
      : "No strong waitlist match on released inventory; exposure remains until walk-in or rebook.",
    status: "OPEN",
    urgency,
    priorityScore: scoreFinding({
      urgency,
      primaryValue,
      confidenceBand: confidence.level,
      timeSensitive: true,
      actionable: Boolean(match),
    }),
    confidenceScore: confidence.score,
    confidenceBand: confidence.level,
    confidenceExplanation: confidence.explanation,
    timeframe: {
      start: now,
      end: `${ctx.businessDate}T23:00:00+02:00`,
      label: "Tonight",
    },
    financialImpact: {
      grossValue: calc.originalBookingValue,
      bookingValue: calc.originalBookingValue,
      revenueAtRisk: calc.revenueExposed,
      contributionAtRisk: calc.contributionExposed,
      recoverableValue: recoverable || undefined,
      primaryValue,
      primaryLabel: "Revenue exposed",
      currency: ctx.currency,
    },
    drivers: [
      {
        label: "Late cancellations",
        value: `${late.reservations} · ${late.covers} covers`,
      },
      {
        label: "Natural rebook expected",
        value: String(calc.expectedNaturalRecovery),
      },
      ...(match
        ? [
            {
              label: "Waitlist match",
              value: `${match.partySize} guests · ${match.expectedValue ?? 0} ${ctx.currency}`,
            },
          ]
        : []),
    ],
    recommendation: {
      title: match ? "Match waitlist" : "Review released inventory",
      description: match
        ? `Seat waitlist party ${match.id} against cancelled covers.`
        : "Monitor walk-ins and remaining waitlist for refill.",
      expectedNetBenefit: recoverable || calc.revenueExposed,
      expectedBenefit: recoverable || calc.revenueExposed,
    },
    evidence: [
      {
        id: "ev_gross",
        label: "Original booking value",
        value: String(calc.originalBookingValue),
      },
      {
        id: "ev_exposed",
        label: "Revenue exposed",
        value: String(calc.revenueExposed),
      },
    ],
    sourceIds: freshness.map((s) => s.key),
    dedupeKey: `${ctx.locationId}:SELL:cancellation_exposure:${ctx.businessDate}`,
    presentation: {
      kindLabel: "Late cancellation",
      headline: "Late cancellation still exposed.",
      recommendShort: match ? "Match waitlist →" : "Review inventory →",
      ctaLabel: "Review & act",
      primaryAction: {
        kind: "open",
        label: "Open service map",
        href: "/app/service",
      },
      secondaryHref: "/app/sell",
      secondaryLabel: "View SELL",
      verificationStatus: "IDENTIFIED",
      verificationMethod:
        "Verified when waitlist party is seated and POS closes against released inventory.",
      dataSources: freshness,
    },
    createdAt: now,
    updatedAt: now,
  };
}
