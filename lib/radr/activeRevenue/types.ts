/**
 * Active Revenue Intelligence - types.
 * RECOVER perishable inventory · GROW relevant hospitality · VERIFY outcomes.
 */

import type {
  LiveRecoveryEvent,
  RecoveryConfig,
  RecoveryPlan,
  RecoveryTemplate,
  ReservationLiveState,
  RecoveryTrigger,
  SocialChannelProvider,
  SocialRecoveryPreview,
  SocialRecoveryRoi,
  PerishableInventoryOpportunity,
} from "./liveRecovery";

export type * from "./liveRecovery";

export type RecoveryStatus =
  | "DETECTED"
  | "WAITLIST"
  | "RELEASED"
  | "PROMOTED"
  | "REBOOKED"
  | "EXPIRED"
  | "VERIFIED"
  | "NO_SHOW_PENDING"
  | "RECOVERY_ACTIVE";

export type RecoveryStrategy =
  | "WAITLIST"
  | "RESERVATION_INVENTORY"
  | "DIRECT_GUEST"
  | "SOCIAL"
  | "WALK_IN_HOLD";

export type AutomationLevel = "MANUAL" | "ASSISTED" | "AUTOMATED";

export type WaitlistMatch = {
  id: string;
  partySize: number;
  requestedFrom: string;
  requestedTo: string;
  returningGuest: boolean;
  acceptanceProbabilityPct: number;
  label: string;
};

/**
 * Abstraction - do not claim provider write capability that is not shipped.
 */
export type ReservationInventoryProvider = {
  id: string;
  name: string;
  canReleaseInventory: boolean;
  canOfferWaitlist: boolean;
  canCreateHold: boolean;
  canUpdateAvailability: boolean;
  canTrackRebooking: boolean;
  status: "available" | "partner_access" | "planned";
};

export type CancellationOpportunity = {
  id: string;
  organizationId: string;
  locationId: string;
  locationName: string;
  reservationId: string;
  tableId: string;
  tableLabel: string;
  serviceId: string;

  reservationTime: string;
  cancelledAt: string | null;
  partySize: number;

  trigger: RecoveryTrigger;
  reservationState: ReservationLiveState;
  /** Minutes late - used for no-show grace (policy-driven). */
  minutesLate?: number;

  originalExpectedRevenue: number;
  originalExpectedContribution: number;
  depositAmount: number;
  cancellationFee: number;
  remainingRevenueExposure: number;

  replacementProbabilityPct: number;
  waitlistMatches: WaitlistMatch[];
  expectedWalkInDemand: number;

  recoveryDeadline: string;
  minutesToService: number;

  recommendedStrategy: RecoveryStrategy;
  strategyWhy: string[];
  automationLevel: AutomationLevel;
  requiresApproval: boolean;

  status: RecoveryStatus;
  recoveryChannel?: RecoveryStrategy;
  rebookedReservationId?: string;

  /** Control Center attention lane */
  attentionPhase?: "NEEDS_YOU" | "HANDLING" | "HANDLED";

  replacementActualSpend?: number;
  verifiedRecoveredValue?: number;
  verifiedContribution?: number;
  recoveredInMinutes?: number;

  plan: RecoveryPlan;
  socialPreview: SocialRecoveryPreview | null;

  evidenceHref: string;
  actionHref: string;
};

export type GuestOpportunityType =
  | "APERITIF"
  | "WINE"
  | "PAIRING"
  | "PREMIUM_MENU"
  | "SHARING_STARTER"
  | "SIDE"
  | "DESSERT"
  | "AFTER_DINNER_DRINK"
  | "CELEBRATION_ADD_ON"
  | "PRIVATE_DINING"
  | "NEXT_RESERVATION";

export type GuestOpportunityTiming =
  | "arrival"
  | "menu_selection"
  | "main_order"
  | "after_mains"
  | "after_dessert"
  | "departure";

export type GuestOpportunityStatus =
  | "SUGGESTED"
  | "SHOWN"
  | "ACKNOWLEDGED"
  | "OFFERED"
  | "ACCEPTED"
  | "DECLINED"
  | "PURCHASED"
  | "VERIFIED";

export type GuestOpportunity = {
  id: string;
  guestId: string | null;
  guestLabel: string | null;
  reservationId: string;
  tableId: string;
  tableLabel: string;
  locationId: string;
  serviceId: string;

  opportunityType: GuestOpportunityType;
  suggestion: string;
  reason: string[];
  recommendedTiming: GuestOpportunityTiming;
  timingLabel: string;

  occasionLabel?: string;
  returningGuest?: boolean;

  expectedIncrementalRevenue: number;
  expectedIncrementalContribution: number;
  confidence: "high" | "medium" | "low";

  safetyClear: boolean;
  inventoryAvailable: boolean;

  status: GuestOpportunityStatus;
};

export type RecoveryChannelPerf = {
  channel: RecoveryStrategy;
  label: string;
  attempts: number;
  fillRatePct: number;
  avgRecoveryMinutes: number;
  verifiedRevenue: number;
};

export type GuestOpportunityPerf = {
  opportunityType: GuestOpportunityType;
  label: string;
  relevantTables: number;
  offered: number;
  accepted: number;
  verifiedIncrementalContribution: number;
};

export type ActiveRevenueRollup = {
  tonightPotential: number;
  recoveryCount: number;
  guestOpportunityCount: number;
  monthCancellationAtRisk: number;
  monthCancellationRecovered: number;
  monthRecoveryRatePct: number;
  monthGuestVerified: number;
  monthCombinedVerified: number;
};

export type ActiveRevenueBrief = {
  organizationId: string;
  locationId: string;
  locationName: string;
  serviceLabel: string;
  businessDate: string;
  asOf: string;
  illustrative: boolean;
  currency: "EUR";

  recoveries: CancellationOpportunity[];
  guestOpportunities: GuestOpportunity[];
  fohPrompts: GuestOpportunity[];
  rollup: ActiveRevenueRollup;
  channelPerformance: RecoveryChannelPerf[];
  opportunityPerformance: GuestOpportunityPerf[];
  inventoryProviders: ReservationInventoryProvider[];

  config: RecoveryConfig;
  socialProviders: SocialChannelProvider[];
  templates: RecoveryTemplate[];
  liveEvents: LiveRecoveryEvent[];
  socialRoi: SocialRecoveryRoi;
  perishableInventory: PerishableInventoryOpportunity[];
};
