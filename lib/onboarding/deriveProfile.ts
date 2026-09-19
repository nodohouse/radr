/**
 * Derive HospitalityOperatingProfile id + defaults from onboarding answers.
 */

import type {
  HelpFocus,
  OnboardingRole,
  OnboardingState,
  OperateSubtype,
  OperatingUnitChoice,
} from "@/lib/onboarding/types";
import {
  getProfile,
  type ProfileId,
} from "@/lib/radr/domain/hospitalityOperatingProfile";
import { profileIdFromVenueType } from "@/lib/radr/operating/resolveProfile";

const SUBTYPE_TO_PROFILE: Partial<Record<OperateSubtype, ProfileId>> = {
  full_service_restaurant: "restaurant_full_service",
  fine_dining: "restaurant_full_service",
  casual_dining: "restaurant_full_service",
  qsr: "restaurant_full_service",
  cafe: "restaurant_full_service",
  bakery: "restaurant_full_service",
  bar: "bar",
  cocktail_bar: "bar",
  hotel: "hotel",
  boutique_hotel: "boutique_hotel",
  resort: "resort_mixed",
  hostel: "hotel",
  aparthotel: "serviced_apartments",
  serviced_apartments: "serviced_apartments",
  vacation_rental: "vacation_rental",
  spa: "spa",
  event_venue: "resort_mixed",
  members_club: "resort_mixed",
  other: "restaurant_full_service",
};

export function profileIdFromOnboarding(state: OnboardingState): ProfileId {
  if (state.operatingProfileId) {
    const known = getProfile(state.operatingProfileId);
    if (known) return known.id as ProfileId;
  }
  const subtypes = state.operateSubtypes ?? [];
  if (subtypes.includes("boutique_hotel")) return "boutique_hotel";
  if (subtypes.includes("vacation_rental")) return "vacation_rental";
  if (subtypes.includes("serviced_apartments") || subtypes.includes("aparthotel"))
    return "serviced_apartments";
  if (subtypes.includes("spa")) return "spa";
  if (subtypes.includes("hotel") || subtypes.includes("resort"))
    return subtypes.includes("resort") ? "resort_mixed" : "hotel";
  if (subtypes.includes("bar") || subtypes.includes("cocktail_bar")) return "bar";
  for (const s of subtypes) {
    const mapped = SUBTYPE_TO_PROFILE[s];
    if (mapped) return mapped;
  }
  if (state.venueType) return profileIdFromVenueType(state.venueType);
  return "restaurant_full_service";
}

export function defaultUnitsForProfile(
  profileId: ProfileId,
): OperatingUnitChoice[] {
  switch (profileId) {
    case "boutique_hotel":
    case "hotel":
      return ["ROOMS", "RESTAURANT", "BAR", "HOUSEKEEPING"];
    case "serviced_apartments":
    case "vacation_rental":
      return ["ROOMS", "HOUSEKEEPING"];
    case "spa":
      return ["SPA"];
    case "bar":
      return ["BAR"];
    case "resort_mixed":
      return ["ROOMS", "RESTAURANT", "SPA", "EVENTS", "HOUSEKEEPING"];
    default:
      return ["RESTAURANT", "BAR"];
  }
}

export function recommendedKpis(
  profileId: ProfileId,
  role?: OnboardingRole | null,
): string[] {
  const profile = getProfile(profileId);
  if (!profile) return ["revenue", "contribution"];
  if (role && profile.roleMetricDefaults[role]?.length) {
    return profile.roleMetricDefaults[role]!
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((m) => m.metric);
  }
  if (role === "gm" && profile.roleMetricDefaults.gm) {
    return profile.roleMetricDefaults.gm
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((m) => m.metric);
  }
  if (role === "hotel_gm" && profile.roleMetricDefaults.hotel_gm) {
    return profile.roleMetricDefaults.hotel_gm
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((m) => m.metric);
  }
  return profile.defaultKpis;
}

export function firstInsightFor(
  profileId: ProfileId,
  locationName?: string,
): string {
  const profile = getProfile(profileId);
  const base =
    profile?.firstInsightTemplate ??
    "RADR is ready to watch your operation.";
  if (locationName?.trim()) {
    return `${locationName.trim()}: ${base}`;
  }
  return base;
}

export function mapHelpToKpis(help: HelpFocus[]): string[] {
  const out: string[] = [];
  for (const h of help) {
    switch (h) {
      case "occupancy":
        out.push("occupancy", "adr", "revpar");
        break;
      case "room_readiness":
      case "turnaround":
        out.push("room_readiness", "arrivals");
        break;
      case "labor_waste":
        out.push("labor", "labor_pct");
        break;
      case "cancellations":
      case "recover_inventory":
        out.push("cancellation_exposure", "verified_value");
        break;
      case "direct_bookings":
      case "ota_dependency":
        out.push("direct_share", "distribution_cost");
        break;
      case "guest_experience":
        out.push("guest_issues");
        break;
      case "profitability":
      case "contribution":
        out.push("contribution", "revenue");
        break;
      case "menu_profitability":
      case "food_waste":
        out.push("food_cost", "covers");
        break;
      default:
        break;
    }
  }
  return [...new Set(out)];
}
