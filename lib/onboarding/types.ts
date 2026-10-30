/**
 * Onboarding state shape persisted on organizations.onboarding (jsonb).
 *
 * Supports:
 * - first_value path (TIME TO FIRST DECISION) — default for new workspaces
 * - legacy questionnaire path (?legacy=1 / older rows)
 */

import type {
  DecisionClassGoal,
  EvidenceMethod,
  FirstDecisionOutcome,
  FirstValueStep,
  IndustryKind,
  OnboardingMilestone,
  OnboardingMilestones,
  OnboardingStage,
  RoleLens,
} from "@/lib/onboarding/firstValue";
import {
  DEFAULT_FIRST_VALUE,
  STAGE_FOR_STEP,
} from "@/lib/onboarding/firstValue";

export type LocationBand =
  | "1"
  | "2-5"
  | "6-20"
  | "21-50"
  | "50+"
  | "51-100"
  | "100+";

/** Legacy single venue picker — still accepted for older rows. */
export type VenueType =
  | "restaurant"
  | "bar"
  | "hotel"
  | "cafe"
  | "other"
  | "boutique_hotel"
  | "serviced_apartments"
  | "vacation_rental"
  | "spa";

export type OperateFamily =
  | "food_beverage"
  | "accommodation"
  | "experience"
  | "mixed";

export type OperateSubtype =
  | "full_service_restaurant"
  | "fine_dining"
  | "casual_dining"
  | "qsr"
  | "cafe"
  | "bakery"
  | "bar"
  | "cocktail_bar"
  | "hotel"
  | "boutique_hotel"
  | "resort"
  | "hostel"
  | "aparthotel"
  | "serviced_apartments"
  | "vacation_rental"
  | "spa"
  | "event_venue"
  | "members_club"
  | "other";

export type OperatingUnitChoice =
  | "ROOMS"
  | "RESTAURANT"
  | "BAR"
  | "BREAKFAST"
  | "SPA"
  | "EVENTS"
  | "HOUSEKEEPING"
  | "CAFE"
  | "DELIVERY";

export type OnboardingRole =
  | "owner"
  | "ceo"
  | "cfo"
  | "coo"
  | "gm"
  | "hotel_gm"
  | "fb_director"
  | "restaurant_manager"
  | "chef"
  | "revenue_manager"
  | "housekeeping_manager"
  | "front_desk"
  | "finance"
  | "other"
  | RoleLens;

export type HelpFocus =
  | "profitability"
  | "labor_waste"
  | "occupancy"
  | "contribution"
  | "supplier_leakage"
  | "guest_experience"
  | "cancellations"
  | "recover_inventory"
  | "direct_bookings"
  | "ota_dependency"
  | "menu_profitability"
  | "food_waste"
  | "room_readiness"
  | "turnaround"
  | "ancillary"
  | "forecasting"
  | "multi_location"
  | "accounting_close";

export type OnboardingStep =
  | FirstValueStep
  | "operate"
  | "units"
  | "role"
  | "priorities"
  | "kpis"
  | "system"
  | "insight"
  | "building"
  | "choose"
  | "connect"
  | "done"
  | "operation";

/** Canonical first-value progressive path. */
export const PRIMARY_ONBOARDING_STEPS = [
  "welcome",
  "who",
  "organization",
  "location",
  "goal",
  "evidence",
  "upload",
  "data_health",
  "analyzing",
  "reveal",
  "complete",
] as const satisfies readonly OnboardingStep[];

/** @deprecated legacy questionnaire path */
export const LEGACY_ONBOARDING_STEPS = [
  "organization",
  "operate",
  "location",
  "units",
  "role",
  "priorities",
  "system",
  "insight",
] as const satisfies readonly OnboardingStep[];

export const DEMO_SYSTEM_ID = "demo";

export function canEnterInsightStep(
  pendingSystem: string | null | undefined,
): boolean {
  return Boolean(pendingSystem && pendingSystem.length > 0);
}

export type OnboardingState = {
  path?: "first_value" | "legacy";
  step: OnboardingStep;
  stage?: OnboardingStage;
  milestones?: OnboardingMilestones;
  organizationName?: string;
  locationBand?: LocationBand;
  hqCity?: string;
  hqCountry?: string;
  currency?: string;
  timezone?: string;
  locationName?: string;
  locationCity?: string;
  locationCountry?: string;
  venueType?: VenueType;
  operateFamilies?: OperateFamily[];
  operateSubtypes?: OperateSubtype[];
  operatingUnits?: OperatingUnitChoice[];
  roomCount?: number;
  seatCount?: number;
  role?: OnboardingRole;
  roleLens?: RoleLens;
  fullName?: string;
  industry?: IndustryKind;
  reportingCurrency?: string;
  locationTimezone?: string;
  localCurrency?: string;
  decisionClass?: DecisionClassGoal;
  evidenceMethod?: EvidenceMethod;
  contractDocumentId?: string;
  invoiceDocumentId?: string;
  materialityThresholdMinor?: number;
  firstDecision?: FirstDecisionOutcome;
  helpFocus?: HelpFocus[];
  selectedKpis?: string[];
  operatingProfileId?: string;
  demoEnabled?: boolean;
  tourDismissed?: boolean;
  checklistDismissed?: boolean;
  firstWelcomeSeen?: boolean;
  pendingSystem?: string;
  pendingSystemLabel?: string;
  startedAt?: string;
  completedAt?: string;
};

export const DEFAULT_ONBOARDING: OnboardingState = {
  path: "first_value",
  step: "welcome",
  stage: "your_organization",
  milestones: {},
  materialityThresholdMinor: 10000,
};

export function isFirstValuePath(state: OnboardingState): boolean {
  if (state.path === "legacy") return false;
  if (state.path === "first_value") return true;
  const legacySteps = new Set([
    "operate",
    "units",
    "priorities",
    "kpis",
    "system",
    "insight",
    "building",
    "choose",
    "connect",
  ]);
  return !legacySteps.has(state.step);
}

export function withStep(
  state: OnboardingState,
  step: FirstValueStep,
): OnboardingState {
  return {
    ...state,
    path: "first_value",
    step,
    stage: STAGE_FOR_STEP[step],
  };
}

export function ensureMilestone(
  state: OnboardingState,
  milestone: OnboardingMilestone,
  at = new Date().toISOString(),
): OnboardingState {
  const milestones = { ...(state.milestones ?? {}) };
  if (milestones[milestone]) return state;
  milestones[milestone] = at;
  return { ...state, milestones };
}

export type WorkspaceBrand = {
  orgName: string;
  locationName: string;
  city?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  demo: boolean;
  operatingProfileId?: string;
};

export { DEFAULT_FIRST_VALUE };
