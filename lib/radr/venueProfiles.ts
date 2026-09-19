/**
 * Venue profiles: single source of truth for demo hospitality economics.
 * Capacity, currency, and typical ranges drive pulse / reservations / floor.
 */

export type CurrencyCode = "EUR" | "GBP" | "USD" | "JPY" | "SGD" | "AED" | "AUD";

export type VenueProfile = {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  currency: CurrencyCode;
  locale: string;
  concept: string;
  seats: number;
  typicalSpendPerCover: number;
  spendRange: { min: number; max: number };
  typicalWeekdayCovers: { min: number; max: number };
  typicalWeekendCovers: { min: number; max: number };
  strongDayCovers: number;
  sections: { id: string; name: string; seats: number }[];
};

export const GROUP_REPORTING_CURRENCY: CurrencyCode = "EUR";

export const VENUE_PROFILES: Record<string, VenueProfile> = {
  loc_ber: {
    id: "loc_ber",
    name: "Berlin Mitte",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    currency: "EUR",
    locale: "de-DE",
    concept: "Casual-upmarket dinner-led restaurant",
    seats: 72,
    typicalSpendPerCover: 64,
    spendRange: { min: 58, max: 70 },
    typicalWeekdayCovers: { min: 95, max: 135 },
    typicalWeekendCovers: { min: 145, max: 190 },
    strongDayCovers: 200,
    sections: [
      { id: "main", name: "Main Dining", seats: 42 },
      { id: "bar", name: "Bar", seats: 12 },
      { id: "terrace", name: "Terrace", seats: 18 },
    ],
  },
  loc_ber_kreuz: {
    id: "loc_ber_kreuz",
    name: "Berlin Kreuzberg",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    currency: "EUR",
    locale: "de-DE",
    concept: "Neighborhood dinner house",
    seats: 64,
    typicalSpendPerCover: 58,
    spendRange: { min: 52, max: 66 },
    typicalWeekdayCovers: { min: 85, max: 120 },
    typicalWeekendCovers: { min: 130, max: 165 },
    strongDayCovers: 180,
    sections: [
      { id: "main", name: "Main Dining", seats: 40 },
      { id: "bar", name: "Bar", seats: 10 },
      { id: "terrace", name: "Courtyard", seats: 14 },
    ],
  },
  loc_nyc: {
    id: "loc_nyc",
    name: "New York Flatiron",
    city: "New York",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    locale: "en-US",
    concept: "High-velocity urban dinner destination",
    seats: 88,
    typicalSpendPerCover: 78,
    spendRange: { min: 68, max: 92 },
    typicalWeekdayCovers: { min: 140, max: 190 },
    typicalWeekendCovers: { min: 190, max: 240 },
    strongDayCovers: 260,
    sections: [
      { id: "main", name: "Main Dining", seats: 52 },
      { id: "bar", name: "Bar", seats: 16 },
      { id: "terrace", name: "Mezzanine", seats: 20 },
    ],
  },
  loc_nyc_wvill: {
    id: "loc_nyc_wvill",
    name: "New York West Village",
    city: "New York",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    locale: "en-US",
    concept: "Intimate neighborhood restaurant",
    seats: 62,
    typicalSpendPerCover: 84,
    spendRange: { min: 74, max: 98 },
    typicalWeekdayCovers: { min: 95, max: 130 },
    typicalWeekendCovers: { min: 140, max: 175 },
    strongDayCovers: 190,
    sections: [
      { id: "main", name: "Dining Room", seats: 40 },
      { id: "bar", name: "Bar", seats: 10 },
      { id: "terrace", name: "Garden", seats: 12 },
    ],
  },
  loc_sf: {
    id: "loc_sf",
    name: "San Francisco Hayes",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    locale: "en-US",
    concept: "Pre-theatre and neighborhood dining",
    seats: 70,
    typicalSpendPerCover: 72,
    spendRange: { min: 64, max: 84 },
    typicalWeekdayCovers: { min: 100, max: 140 },
    typicalWeekendCovers: { min: 145, max: 185 },
    strongDayCovers: 200,
    sections: [
      { id: "main", name: "Main Dining", seats: 44 },
      { id: "bar", name: "Bar", seats: 12 },
      { id: "terrace", name: "Patio", seats: 14 },
    ],
  },
  loc_tyo: {
    id: "loc_tyo",
    name: "Tokyo Shibuya",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    currency: "JPY",
    locale: "ja-JP",
    concept: "Dense urban dinner and late service",
    seats: 76,
    typicalSpendPerCover: 8200,
    spendRange: { min: 7200, max: 9800 },
    typicalWeekdayCovers: { min: 120, max: 165 },
    typicalWeekendCovers: { min: 165, max: 210 },
    strongDayCovers: 230,
    sections: [
      { id: "main", name: "Main Floor", seats: 46 },
      { id: "bar", name: "Counter", seats: 14 },
      { id: "terrace", name: "Private", seats: 16 },
    ],
  },
  loc_sin: {
    id: "loc_sin",
    name: "Singapore Marina",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    currency: "SGD",
    locale: "en-SG",
    concept: "Waterfront destination dining",
    seats: 80,
    typicalSpendPerCover: 92,
    spendRange: { min: 80, max: 110 },
    typicalWeekdayCovers: { min: 110, max: 150 },
    typicalWeekendCovers: { min: 155, max: 195 },
    strongDayCovers: 215,
    sections: [
      { id: "main", name: "Main Dining", seats: 48 },
      { id: "bar", name: "Bar", seats: 14 },
      { id: "terrace", name: "Waterfront", seats: 18 },
    ],
  },
  loc_dxb: {
    id: "loc_dxb",
    name: "Dubai Marina",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    currency: "AED",
    locale: "en-AE",
    concept: "Marina destination restaurant",
    seats: 96,
    typicalSpendPerCover: 210,
    spendRange: { min: 180, max: 250 },
    typicalWeekdayCovers: { min: 130, max: 180 },
    typicalWeekendCovers: { min: 180, max: 230 },
    strongDayCovers: 250,
    sections: [
      { id: "main", name: "Main Dining", seats: 56 },
      { id: "bar", name: "Lounge", seats: 18 },
      { id: "terrace", name: "Marina Terrace", seats: 22 },
    ],
  },
  loc_syd: {
    id: "loc_syd",
    name: "Sydney Surry Hills",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    currency: "AUD",
    locale: "en-AU",
    concept: "Neighborhood dinner house",
    seats: 68,
    typicalSpendPerCover: 76,
    spendRange: { min: 66, max: 88 },
    typicalWeekdayCovers: { min: 95, max: 135 },
    typicalWeekendCovers: { min: 140, max: 180 },
    strongDayCovers: 195,
    sections: [
      { id: "main", name: "Dining Room", seats: 42 },
      { id: "bar", name: "Bar", seats: 12 },
      { id: "terrace", name: "Courtyard", seats: 14 },
    ],
  },
  loc_ams: {
    id: "loc_ams",
    name: "Amsterdam Central",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    currency: "EUR",
    locale: "nl-NL",
    concept: "High-traffic casual dining",
    seats: 95,
    typicalSpendPerCover: 67,
    spendRange: { min: 60, max: 75 },
    typicalWeekdayCovers: { min: 130, max: 180 },
    typicalWeekendCovers: { min: 180, max: 220 },
    strongDayCovers: 250,
    sections: [
      { id: "main", name: "Main Dining", seats: 55 },
      { id: "bar", name: "Bar", seats: 15 },
      { id: "terrace", name: "Canal Terrace", seats: 25 },
    ],
  },
  loc_lon: {
    id: "loc_lon",
    name: "London Soho",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    currency: "GBP",
    locale: "en-GB",
    concept: "Urban dinner destination",
    seats: 84,
    typicalSpendPerCover: 72,
    spendRange: { min: 65, max: 85 },
    typicalWeekdayCovers: { min: 120, max: 160 },
    typicalWeekendCovers: { min: 160, max: 190 },
    strongDayCovers: 210,
    sections: [
      { id: "main", name: "Main Dining", seats: 50 },
      { id: "bar", name: "Bar", seats: 14 },
      { id: "terrace", name: "Alcove", seats: 20 },
    ],
  },
  loc_par: {
    id: "loc_par",
    name: "Paris Marais",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    currency: "EUR",
    locale: "fr-FR",
    concept: "Intimate upmarket dining",
    seats: 58,
    typicalSpendPerCover: 82,
    spendRange: { min: 74, max: 92 },
    typicalWeekdayCovers: { min: 80, max: 110 },
    typicalWeekendCovers: { min: 110, max: 140 },
    strongDayCovers: 155,
    sections: [
      { id: "main", name: "Salle", seats: 40 },
      { id: "bar", name: "Bar", seats: 8 },
      { id: "terrace", name: "Terrasse", seats: 10 },
    ],
  },
};

export function getVenueProfile(locationId: string): VenueProfile {
  return VENUE_PROFILES[locationId] ?? VENUE_PROFILES.loc_ber;
}

export function venueSeatTotal(profile: VenueProfile): number {
  return profile.sections.reduce((s, sec) => s + sec.seats, 0);
}

/** Berlin Mitte: yesterday closed day (coherent demo). */
export const BERLIN_YESTERDAY = {
  locationId: "loc_ber",
  revenue: 7_812,
  covers: 122,
  avgSpend: 64.03,
  margin: 18.4,
  laborPct: 32.6,
  revenueYoY: 6.2,
  revenueVsForecast: 3.1,
  marginVsPlanPts: 0.6,
  laborVsPlanPts: -0.4,
} as const;

/** Berlin Mitte: tonight operating scenario. */
export const BERLIN_TONIGHT_OPS = {
  locationId: "loc_ber",
  reservationCount: 46,
  bookedCovers: 118,
  expectedAdditionalCovers: 24,
  expectedSpendPerCover: 64,
  expectedOccupancyPct: 84,
  bookingPaceVsComparable: 9.3,
  bookingPaceVsForecast: 6,
  pctOfFinalDemandBooked: 83,
  contributionRate: 0.334,
  peakWindow: { start: "19:00", end: "20:30" } as const,
  /** Peak service capacity (FOH cover-equivalent), not seat count */
  peakServiceCapacity: 66,
  sectionBCapacity: 28,
  sectionBPeakCovers: 34,
} as const;

export function forecastCovers(
  booked: number,
  expectedAdditional: number,
): number {
  return booked + expectedAdditional;
}

export function forecastRevenue(
  covers: number,
  spendPerCover: number,
): number {
  return Math.round(covers * spendPerCover);
}

export const BERLIN_TONIGHT_FORECAST = {
  covers: forecastCovers(
    BERLIN_TONIGHT_OPS.bookedCovers,
    BERLIN_TONIGHT_OPS.expectedAdditionalCovers,
  ),
  revenue: forecastRevenue(
    forecastCovers(
      BERLIN_TONIGHT_OPS.bookedCovers,
      BERLIN_TONIGHT_OPS.expectedAdditionalCovers,
    ),
    BERLIN_TONIGHT_OPS.expectedSpendPerCover,
  ),
  margin: 19.0,
} as const;
