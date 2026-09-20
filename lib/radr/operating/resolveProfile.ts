/**
 * Resolve HospitalityOperatingProfile from location, venue type, or demo vertical.
 */

import {
  BOUTIQUE_HOTEL,
  getProfile,
  PROFILES,
  RESTAURANT_FULL_SERVICE,
  SERVICED_APARTMENTS,
  type HospitalityOperatingProfile,
  type ProfileId,
} from "@/lib/radr/domain/hospitalityOperatingProfile";
import { DEMO_LOCATION_ID } from "@/lib/radr/demoClock";

/** Demo vertical switcher values. */
export type DemoVertical =
  | "restaurant"
  | "boutique_hotel"
  | "serviced_apartments";

const SESSION_VERTICAL_KEY = "radr.demo.vertical";

const VERTICALS: DemoVertical[] = [
  "restaurant",
  "boutique_hotel",
  "serviced_apartments",
];

export function isDemoVertical(raw: string | null | undefined): raw is DemoVertical {
  return VERTICALS.includes(raw as DemoVertical);
}

/** Map onboarding / legacy venueType → profile id. */
export function profileIdFromVenueType(
  venueType: string | null | undefined,
): ProfileId {
  switch (venueType) {
    case "hotel":
      return "boutique_hotel";
    case "bar":
      return "bar";
    case "cafe":
      return "restaurant_full_service";
    case "restaurant":
      return "restaurant_full_service";
    case "serviced_apartments":
    case "aparthotel":
      return "serviced_apartments";
    case "vacation_rental":
      return "vacation_rental";
    case "spa":
      return "spa";
    default:
      return "restaurant_full_service";
  }
}

const LOCATION_PROFILE: Record<string, ProfileId> = {
  loc_ber: "restaurant_full_service",
  loc_ams_canal: "boutique_hotel",
  loc_lis_residences: "serviced_apartments",
};

export function profileIdForLocation(
  locationId: string | null | undefined,
): ProfileId {
  if (!locationId) return "restaurant_full_service";
  return LOCATION_PROFILE[locationId] ?? "restaurant_full_service";
}

export function resolveProfile(input: {
  locationId?: string | null;
  venueType?: string | null;
  demoVertical?: DemoVertical | null;
  operatingProfileId?: string | null;
}): HospitalityOperatingProfile {
  if (input.operatingProfileId) {
    const fromId = getProfile(input.operatingProfileId);
    if (fromId) return fromId;
  }
  if (input.demoVertical === "boutique_hotel") return BOUTIQUE_HOTEL;
  if (input.demoVertical === "serviced_apartments") return SERVICED_APARTMENTS;
  if (input.demoVertical === "restaurant") return RESTAURANT_FULL_SERVICE;
  if (input.locationId) {
    const id = profileIdForLocation(input.locationId);
    return PROFILES[id];
  }
  if (input.venueType) {
    return PROFILES[profileIdFromVenueType(input.venueType)];
  }
  return PROFILES[profileIdForLocation(DEMO_LOCATION_ID)];
}

export function readDemoVertical(): DemoVertical {
  if (typeof window === "undefined") return "restaurant";
  try {
    const raw = sessionStorage.getItem(SESSION_VERTICAL_KEY);
    if (isDemoVertical(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "restaurant";
}

export function writeDemoVertical(vertical: DemoVertical) {
  try {
    sessionStorage.setItem(SESSION_VERTICAL_KEY, vertical);
    window.dispatchEvent(
      new CustomEvent("radr-demo-vertical", { detail: vertical }),
    );
  } catch {
    /* ignore */
  }
}

export const DEMO_VERTICAL_EVENT = "radr-demo-vertical";

/** Map profile id → demo vertical for fixture loaders only. */
export function demoVerticalForProfileId(profileId: string): DemoVertical {
  if (profileId === "boutique_hotel" || profileId === "hotel") {
    return "boutique_hotel";
  }
  if (
    profileId === "serviced_apartments" ||
    profileId === "vacation_rental"
  ) {
    return "serviced_apartments";
  }
  return "restaurant";
}
