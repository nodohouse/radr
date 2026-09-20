/**
 * Live Revenue Recovery - reservation states, no-show policy, plans, social, templates.
 * Extends CancellationOpportunity without collapsing distinct states.
 */

export type ReservationLiveState =
  | "BOOKED"
  | "CONFIRMED"
  | "ARRIVING"
  | "CHECKED_IN"
  | "SEATED"
  | "DELAYED"
  | "CANCELLED"
  | "NO_SHOW_PENDING"
  | "NO_SHOW"
  | "RELEASED"
  | "RECOVERY_ACTIVE"
  | "REBOOKED"
  | "EXPIRED";

export type RecoveryTrigger = "CANCELLATION" | "NO_SHOW" | "RELEASED_EARLY";

/** Configurable - never hardcode a single grace period in UI. */
export type NoShowPolicy = {
  organizationId: string;
  locationId: string;
  serviceId?: string;
  /** Minutes after reservation time before NO_SHOW_PENDING → eligible */
  gracePeriodMinutes: number;
  autoReleaseAfterGrace: boolean;
  automationLevel: "MANUAL" | "ASSISTED" | "AUTOMATED";
};

export type RecoveryPlanStep = {
  id: string;
  order: number;
  strategy: "WAITLIST" | "RESERVATION_INVENTORY" | "DIRECT_GUEST" | "SOCIAL" | "WALK_IN_HOLD";
  label: string;
  detail: string;
  /** Minutes from plan start, or absolute clock label */
  whenLabel: string;
  requiresApproval: boolean;
  status: "PENDING" | "READY" | "DONE" | "SKIPPED";
};

export type RecoveryPlan = {
  opportunityId: string;
  headline: string;
  steps: RecoveryPlanStep[];
  oneTapApprove: boolean;
  socialEscalation: boolean;
};

export type SocialChannelId =
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "whatsapp"
  | "sms"
  | "email";

export type SocialChannelProvider = {
  id: SocialChannelId;
  name: string;
  connected: boolean;
  lastSyncLabel: string | null;
  canPublishPost: boolean;
  canPublishStory: boolean;
  canPublishVideo: boolean;
  canSchedule: boolean;
  canSendMessage: boolean;
  canAttachBookingLink: boolean;
  canTrackClicks: boolean;
  supportsDraftOnly: boolean;
  requiresApproval: boolean;
  notes?: string;
};

export type BrandVoicePreset =
  | "MINIMAL"
  | "PREMIUM"
  | "WARM"
  | "ENERGETIC";

export type RecoveryTemplateType =
  | "LAST_TABLE_TONIGHT"
  | "NO_SHOW_OPENING"
  | "TERRACE_OPEN"
  | "PRIVATE_ROOM"
  | "CHEF_COUNTER"
  | "BRUNCH_SLOT"
  | "TASTING_MENU"
  | "LAST_MINUTE_EVENT"
  | "BAR_SEATS"
  | "LUNCH_OPENING";

export type StoryVisualStyle =
  | "candlelit"
  | "terrace"
  | "linen"
  | "chef"
  | "bar";

export type RecoveryTemplate = {
  id: string;
  organizationId: string;
  locationId: string | null;
  name: string;
  templateType: RecoveryTemplateType;
  supportedChannels: SocialChannelId[];
  brandVoice: BrandVoicePreset;
  /** Visual treatment for Instagram Story mockups */
  storyVisual: StoryVisualStyle;
  copyStructure: string;
  /** Variables like {{time}} {{partySize}} {{location}} {{bookingLink}} */
  variables: string[];
  assetRules: string;
  ctaStyle: string;
  favorite: boolean;
  lockedByBrand: boolean;
  automationEligible: boolean;
  approvalRequired: boolean;
  timesUsed: number;
  bookings: number;
  fillRatePct: number;
  avgFillMinutes: number;
  verifiedRecoveredRevenue: number;
};

export type SocialRecoveryPreview = {
  channelId: SocialChannelId;
  channelName: string;
  format: "story" | "feed" | "message" | "post";
  templateId: string;
  templateName: string;
  storyVisual: StoryVisualStyle;
  copy: string;
  assetLabel: string;
  bookingLinkLabel: string;
  historicalFillRatePct: number;
  expectedFillMinutes: number;
  requiresApproval: true;
  why: string[];
};

export type LiveRecoveryEventKind =
  | "cancellation_detected"
  | "no_show_pending"
  | "no_show_eligible"
  | "waitlist_offered"
  | "social_published"
  | "recovered"
  | "expired"
  | "other";

export type LiveRecoveryEvent = {
  id: string;
  at: string;
  kind: LiveRecoveryEventKind;
  label: string;
  opportunityId?: string;
  tone: "attention" | "watch" | "ready" | "neutral";
};

/**
 * Perishable inventory types across hospitality.
 * Tables/seats first; rooms/units/slots are additive.
 */
export type PerishableInventoryType =
  | "table"
  | "private_room"
  | "terrace"
  | "chef_counter"
  | "bar_seat"
  | "tasting_slot"
  | "brunch_slot"
  | "event_capacity"
  | "experience"
  | "room_night"
  | "unit_night"
  | "treatment_slot"
  | "event_slot";

export type PerishableInventoryOpportunity = {
  id: string;
  inventoryType: PerishableInventoryType;
  availableFrom: string;
  expiresAt: string;
  capacity: number;
  expectedValue: number;
  expectedContribution: number;
  recommendedChannel: string;
  recommendedAction: string;
  status: "OPEN" | "ACTIVE" | "FILLED" | "EXPIRED";
};

export type RecoveryConfig = {
  noShow: NoShowPolicy;
  maxSocialPostsPerDay: number;
  minSocialRecoveryValue: number;
  minSocialPartySize: number;
  socialCooldownMinutes: number;
  socialPostsToday: number;
  defaultBrandVoice: BrandVoicePreset;
};

export type SocialRecoveryRoi = {
  posts: number;
  tablesFilled: number;
  recoveryRatePct: number;
  verifiedRecoveredRevenue: number;
  verifiedContribution: number;
  avgRecoveryMinutes: number;
  topChannel: string;
  topTemplate: string;
};
