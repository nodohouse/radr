import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import { matchWaitlistToReleasedCovers } from "@/lib/radr/reservations/waitlistRecovery";
import { scoreFinding } from "../priority";

/** Standalone recovery opportunity (also folded into cancellation finding via drivers). */
export function detectWaitlistRecoveryOpportunity(
  ctx: OperatingContext,
): Finding | null {
  const late = ctx.bookings.lateCancellations;
  if (late.covers <= 0) return null;
  const match = matchWaitlistToReleasedCovers(ctx.waitlist, late.covers);
  if (!match || !match.expectedValue) return null;

  // Prefer a single SELL finding; engine will dedupe if both fire with same key family.
  // This rule uses a dedicated key only when cancellation rule did not run.
  const now = `${ctx.businessDate}T18:00:00+02:00`;
  const urgency = "ACT_NOW" as const;
  const primaryValue = match.expectedValue;

  return {
    id: `fnd_waitlist_${ctx.locationId}`,
    organizationId: ctx.organizationId,
    locationId: ctx.locationId,
    locationName: ctx.locationName,
    territory: "RECOVER",
    category: "waitlist_recovery",
    subtype: "Waitlist recovery",
    title: "Waitlist can recover cancelled inventory",
    summary: `${match.partySize}-person waitlist party matches released inventory.`,
    explanation: `Potential recoverable value ${primaryValue} ${ctx.currency} if seated against late cancellation.`,
    status: "OPEN",
    urgency,
    priorityScore: scoreFinding({
      urgency,
      primaryValue,
      confidenceBand: "MEDIUM",
      timeSensitive: true,
      actionable: true,
    }),
    confidenceScore: 72,
    confidenceBand: "MEDIUM",
    confidenceExplanation:
      "Match is scored on party size, requested time, and expected spend. Not guaranteed until seated.",
    timeframe: {
      start: match.requestedServiceTime,
      end: match.requestedServiceTime,
      label: "Tonight",
    },
    financialImpact: {
      recoverableValue: primaryValue,
      primaryValue,
      primaryLabel: "Recoverable value",
      currency: ctx.currency,
    },
    drivers: [
      {
        label: "Released covers",
        value: String(late.covers),
      },
      {
        label: "Waitlist party",
        value: `${match.partySize} · ${match.id}`,
      },
    ],
    recommendation: {
      title: "Match waitlist",
      description: `Seat ${match.id} against released inventory.`,
      expectedNetBenefit: primaryValue,
      expectedBenefit: primaryValue,
    },
    evidence: [
      {
        id: "ev_wl",
        label: "Waitlist expected value",
        value: String(primaryValue),
      },
    ],
    sourceIds: ["bookings"],
    // Same service window as cancellation → merge into one operational finding when both fire
    dedupeKey: `${ctx.locationId}:SELL:cancellation_exposure:${ctx.businessDate}`,
    presentation: {
      kindLabel: "Waitlist recovery",
      headline: "Waitlist can recover cancelled inventory.",
      recommendShort: "Match waitlist →",
      ctaLabel: "Match waitlist",
      primaryAction: {
        kind: "open",
        label: "Open service map",
        href: "/app/service",
      },
      secondaryHref: "/app/recover",
      secondaryLabel: "View RECOVER",
      verificationStatus: "IDENTIFIED",
      verificationMethod:
        "Verified when party is seated and POS closes against the released slot.",
      dataSources: ctx.dataFreshness.filter((s) => s.key === "bookings"),
    },
    createdAt: now,
    updatedAt: now,
  };
}
