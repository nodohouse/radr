/**
 * Onboarding state shape persisted on organizations.onboarding (jsonb).
 * Teaches RADR the hospitality operating model before integrations.
 */

export type LocationBand = "1" | "2-5" | "6-20" | "21-50" | "50+";

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
  | "other";

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
  | "welcome"
  | "organization"
  | "operate"
  | "location"
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
  /** Legacy steps kept for persisted rows */
  | "operation";

/** Canonical 8-step progressive path (welcome/building/kpis optional). */
export const PRIMARY_ONBOARDING_STEPS = [
  "organization",
  "operate",
  "location",
  "units",
  "role",
  "priorities",
  "system",
  "insight",
] as const satisfies readonly OnboardingStep[];

/** Connect step must resolve before insight — demo counts as a system choice. */
export const DEMO_SYSTEM_ID = "demo";

export function canEnterInsightStep(pendingSystem: string | null | undefined): boolean {
  return Boolean(pendingSystem && pendingSystem.length > 0);
}

export type OnboardingState = {
  step: OnboardingStep;
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
  /** Multi-select families from “What do you operate?” */
  operateFamilies?: OperateFamily[];
  operateSubtypes?: OperateSubtype[];
  operatingUnits?: OperatingUnitChoice[];
  roomCount?: number;
  seatCount?: number;
  role?: OnboardingRole;
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
  step: "welcome",
};

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
