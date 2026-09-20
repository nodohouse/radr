/**
 * No-show eligibility + recovery plan composition.
 * Grace periods come from policy - never hardcoded in UI.
 */

import type { RecoveryStrategy, WaitlistMatch } from "./types";
import type {
  NoShowPolicy,
  RecoveryPlan,
  RecoveryPlanStep,
  RecoveryTrigger,
  SocialRecoveryPreview,
} from "./liveRecovery";

export type { RecoveryStrategy };

/** Fields needed to compose a plan - before plan/socialPreview are attached. */
export type RecoveryPlanSource = {
  id: string;
  tableLabel: string;
  reservationTime: string;
  waitlistMatches: WaitlistMatch[];
  recommendedStrategy: RecoveryStrategy;
  requiresApproval: boolean;
  expectedWalkInDemand: number;
  minutesToService: number;
  remainingRevenueExposure: number;
  partySize: number;
};

export function isNoShowEligible(
  minutesLate: number,
  policy: NoShowPolicy,
): boolean {
  return minutesLate >= policy.gracePeriodMinutes;
}

export function noShowState(
  minutesLate: number,
  policy: NoShowPolicy,
): "ON_TIME" | "LATE" | "NO_SHOW_PENDING" | "NO_SHOW_ELIGIBLE" {
  if (minutesLate <= 0) return "ON_TIME";
  if (minutesLate < policy.gracePeriodMinutes) return "LATE";
  if (minutesLate === policy.gracePeriodMinutes) return "NO_SHOW_PENDING";
  return "NO_SHOW_ELIGIBLE";
}

function step(
  partial: Omit<RecoveryPlanStep, "status"> & { status?: RecoveryPlanStep["status"] },
): RecoveryPlanStep {
  return { status: "PENDING", ...partial };
}

/**
 * Build the one-tap recovery plan managers approve.
 * Social only escalates when waitlist economics don't clear the table.
 */
export function composeRecoveryPlan(
  opp: RecoveryPlanSource,
  opts?: {
    trigger?: RecoveryTrigger;
    socialPreview?: SocialRecoveryPreview | null;
  },
): RecoveryPlan {
  const trigger = opts?.trigger ?? "CANCELLATION";
  const matches = opp.waitlistMatches.length;
  const social = opts?.socialPreview;
  const steps: RecoveryPlanStep[] = [];

  if (opp.recommendedStrategy === "WALK_IN_HOLD") {
    steps.push(
      step({
        id: "walkin",
        order: 1,
        strategy: "WALK_IN_HOLD",
        label: "Hold for walk-ins",
        detail: `Expected walk-ins ${opp.expectedWalkInDemand} beat promotional recovery`,
        whenLabel: "Now",
        requiresApproval: false,
        status: "READY",
      }),
    );
  } else if (matches > 0) {
    steps.push(
      step({
        id: "waitlist",
        order: 1,
        strategy: "WAITLIST",
        label: `Offer ${matches} waitlist match${matches === 1 ? "" : "es"} now`,
        detail: opp.waitlistMatches[0]
          ? `Best: ${opp.waitlistMatches[0].label} · ${opp.waitlistMatches[0].acceptanceProbabilityPct}% acceptance`
          : "Qualified waitlist demand",
        whenLabel: "Now",
        requiresApproval: opp.requiresApproval,
        status: "READY",
      }),
    );
    steps.push(
      step({
        id: "inventory",
        order: 2,
        strategy: "RESERVATION_INVENTORY",
        label: "If unfilled in 10 min: release broadly",
        detail: "Connected inventory only where write capability exists",
        whenLabel: "+10 min",
        requiresApproval: true,
      }),
    );
    if (social) {
      steps.push(
        step({
          id: "social",
          order: 3,
          strategy: "SOCIAL",
          label: `If still open: ${social.channelName} ${social.format}`,
          detail: `Template · ${social.templateName}`,
          whenLabel: opp.minutesToService > 20 ? "By T−15" : "If still open",
          requiresApproval: true,
        }),
      );
    }
  } else if (social) {
    steps.push(
      step({
        id: "social",
        order: 1,
        strategy: "SOCIAL",
        label: `Publish ${social.channelName} ${social.format}`,
        detail: social.templateName,
        whenLabel: "Now",
        requiresApproval: true,
        status: "READY",
      }),
    );
  }

  const headline =
    trigger === "NO_SHOW"
      ? `${opp.tableLabel} · no-show eligible · recovery plan ready`
      : `${opp.tableLabel} · ${opp.reservationTime} · recovery plan ready`;

  return {
    opportunityId: opp.id,
    headline,
    steps,
    oneTapApprove: true,
    socialEscalation: Boolean(social),
  };
}

/** Primary channel = social now? Strong waitlist → false (do not post yet). */
export function shouldRecommendSocial(opp: RecoveryPlanSource): boolean {
  if (opp.recommendedStrategy === "WALK_IN_HOLD") return false;
  if (opp.remainingRevenueExposure < 150) return false;
  if (opp.partySize < 4 && opp.waitlistMatches.length >= 3) return false;
  const best = opp.waitlistMatches[0]?.acceptanceProbabilityPct ?? 0;
  if (best >= 70 && opp.waitlistMatches.length >= 4) return false;
  return true;
}

/** Prepare social as escalation step even when waitlist is first. */
export function prepareSocialEscalation(opp: RecoveryPlanSource): boolean {
  if (opp.recommendedStrategy === "WALK_IN_HOLD") return false;
  if (opp.remainingRevenueExposure < 100 && opp.partySize < 4) return false;
  return true;
}

export function strategyPriority(): RecoveryStrategy[] {
  return [
    "WAITLIST",
    "RESERVATION_INVENTORY",
    "DIRECT_GUEST",
    "SOCIAL",
    "WALK_IN_HOLD",
  ];
}
