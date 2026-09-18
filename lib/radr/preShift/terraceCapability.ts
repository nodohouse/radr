/**
 * Outdoor / terrace capability - location-specific, not assumed.
 * A basement cocktail bar does not get terrace weather intelligence.
 */

import { getVenueProfile, type VenueProfile } from "@/lib/radr/venueProfiles";

export type OutdoorCapability = {
  hasOutdoor: boolean;
  /** Weather elasticity - sunny ≠ more guests for every concept. */
  weatherElastic: boolean;
  kind: "terrace" | "garden" | "patio" | "courtyard" | "none";
  seats: number;
  label: string;
};

const OUTDOOR_SECTION_IDS = new Set([
  "terrace",
  "garden",
  "patio",
  "courtyard",
]);

/** Indoor-named outdoor sections that are NOT weather-elastic (e.g. mezzanine). */
const NON_ELASTIC_SECTION_IDS = new Set(["mezzanine"]);

export function outdoorCapabilityForVenue(
  locationId: string,
): OutdoorCapability {
  const profile = getVenueProfile(locationId);
  return outdoorCapabilityFromProfile(profile);
}

export function outdoorCapabilityFromProfile(
  profile: VenueProfile,
): OutdoorCapability {
  const outdoor = profile.sections.find(
    (s) =>
      OUTDOOR_SECTION_IDS.has(s.id) ||
      /terrace|garden|patio|courtyard/i.test(s.name),
  );
  if (!outdoor || NON_ELASTIC_SECTION_IDS.has(outdoor.id)) {
    return {
      hasOutdoor: false,
      weatherElastic: false,
      kind: "none",
      seats: 0,
      label: "No outdoor seating",
    };
  }

  // Name overrides id - e.g. section id "terrace" but labeled Mezzanine (indoor).
  if (/mezzanine|indoor/i.test(outdoor.name)) {
    return {
      hasOutdoor: false,
      weatherElastic: false,
      kind: "none",
      seats: 0,
      label: outdoor.name,
    };
  }

  const kind = (OUTDOOR_SECTION_IDS.has(outdoor.id)
    ? outdoor.id
    : "terrace") as OutdoorCapability["kind"];

  return {
    hasOutdoor: true,
    weatherElastic: true,
    kind: kind === "none" ? "terrace" : kind,
    seats: outdoor.seats,
    label: outdoor.name,
  };
}

/** Comparable warm-dry dinner nights at Berlin Mitte - location-learned. */
export type TerraceCorrelationNight = {
  dateLabel: string;
  tempC: number;
  rainPct: number;
  terraceCovers: number;
  vsTypical: number;
};

export const BERLIN_DINNER_TERRACE_CORRELATION = {
  locationId: "loc_ber",
  service: "Dinner",
  sampleSize: 19,
  /** Median lift vs cool/wet comparable Wednesdays. */
  warmDryLiftPct: 22,
  typicalTerraceCoversCoolWet: 32,
  typicalTerraceCoversWarmDry: 46,
  incrementalCovers: 14,
  /** Explicit economics for demo (not derived inventively elsewhere). */
  incrementalRevenue: 812,
  incrementalContribution: 496,
  fohCost: 96,
  netContribution: 400,
  nights: [
    { dateLabel: "Wed 6 Aug", tempC: 24, rainPct: 8, terraceCovers: 48, vsTypical: 16 },
    { dateLabel: "Wed 30 Jul", tempC: 23, rainPct: 5, terraceCovers: 45, vsTypical: 13 },
    { dateLabel: "Thu 24 Jul", tempC: 21, rainPct: 12, terraceCovers: 44, vsTypical: 12 },
    { dateLabel: "Wed 16 Jul", tempC: 22, rainPct: 10, terraceCovers: 47, vsTypical: 15 },
    { dateLabel: "Wed 9 Jul", tempC: 19, rainPct: 55, terraceCovers: 28, vsTypical: -4 },
  ] as TerraceCorrelationNight[],
} as const;
