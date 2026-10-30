/**
 * DemoEstateRegistry — canonical global demo estate (restaurants + hotels).
 *
 * SSOT for portfolio composition, labels, timezone, currency, region.
 * Hero deterministic IDs are preserved (`loc_berlin_mitte`, `loc_canal_house`)
 * but display as New York — see docs/GLOBAL_ESTATE_MIGRATION_AUDIT.md.
 *
 * Do not invent parallel location arrays in product surfaces.
 */

import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type DemoEstateRegion =
  | "AMERICAS"
  | "EUROPE"
  | "MIDDLE_EAST"
  | "APAC"
  | "AFRICA";

export type DemoEstateCurrency =
  | "USD"
  | "GBP"
  | "EUR"
  | "AED"
  | "SGD"
  | "JPY"
  | "HKD"
  | "AUD"
  | "MXN"
  | "BRL"
  | "ZAR";

export type DemoEstateEntity = {
  id: string;
  slug: string;
  /** Short label in switchers: "Soho" / "Mercer House" */
  name: string;
  /** Portfolio / header: "Soho · New York" */
  displayName: string;
  city: string;
  country: string;
  countryCode: string;
  region: DemoEstateRegion;
  timezone: string;
  currency: DemoEstateCurrency;
  locale: string;
  vertical: DemoVerticalFamily;
  archetype: string;
  /** Optional public image path */
  image?: string;
  coordinates?: { lat: number; lng: number };
  hero?: boolean;
  sortOrder: number;
};

export const GROUP_REPORTING_CURRENCY_CODE: DemoEstateCurrency = "USD";
export const GROUP_REPORTING_LABEL = "Group reporting · USD";

/** Deterministic demo FX → USD (no live rates). */
export const DEMO_FX_TO_USD: Record<DemoEstateCurrency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AED: 0.27,
  SGD: 0.74,
  JPY: 0.0067,
  HKD: 0.128,
  AUD: 0.66,
  MXN: 0.058,
  BRL: 0.18,
  ZAR: 0.055,
};

export const RESTAURANT_ESTATE: DemoEstateEntity[] = [
  {
    id: "loc_berlin_mitte",
    slug: "nyc-soho",
    name: "Soho",
    displayName: "Soho · New York",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "AMERICAS",
    timezone: "America/New_York",
    currency: "USD",
    locale: "en-US",
    vertical: "restaurant",
    archetype: "high_volume_delivery_peak",
    image: "/demo/facilities/radr-restaurant-atmosphere.jpg",
    coordinates: { lat: 40.7233, lng: -74.003 },
    hero: true,
    sortOrder: 1,
  },
  {
    id: "loc_berlin_kreuzberg",
    slug: "la-west-hollywood",
    name: "West Hollywood",
    displayName: "West Hollywood · Los Angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    region: "AMERICAS",
    timezone: "America/Los_Angeles",
    currency: "USD",
    locale: "en-US",
    vertical: "restaurant",
    archetype: "delivery_refund",
    image: "/demo/facilities/berlin-dining.jpg",
    coordinates: { lat: 34.0901, lng: -118.3617 },
    sortOrder: 2,
  },
  {
    id: "loc_munich_altstadt",
    slug: "london-soho",
    name: "Soho",
    displayName: "Soho · London",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "EUROPE",
    timezone: "Europe/London",
    currency: "GBP",
    locale: "en-GB",
    vertical: "restaurant",
    archetype: "labor_heavy",
    image: "/demo/facilities/berlin-bar.jpg",
    coordinates: { lat: 51.5136, lng: -0.1365 },
    sortOrder: 3,
  },
  {
    id: "loc_koln_ehrenfeld",
    slug: "dubai-difc",
    name: "DIFC",
    displayName: "DIFC · Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "MIDDLE_EAST",
    timezone: "Asia/Dubai",
    currency: "AED",
    locale: "en-AE",
    vertical: "restaurant",
    archetype: "discount_spend",
    image: "/demo/facilities/berlin-terrace.jpg",
    coordinates: { lat: 25.214, lng: 55.2796 },
    sortOrder: 4,
  },
  {
    id: "loc_dusseldorf_medienhafen",
    slug: "singapore-tanjong-pagar",
    name: "Tanjong Pagar",
    displayName: "Tanjong Pagar · Singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "APAC",
    timezone: "Asia/Singapore",
    currency: "SGD",
    locale: "en-SG",
    vertical: "restaurant",
    archetype: "premium_mix",
    image: "/demo/facilities/berlin-dining.jpg",
    coordinates: { lat: 1.2764, lng: 103.845 },
    sortOrder: 5,
  },
  {
    id: "loc_stuttgart_mitte",
    slug: "tokyo-shibuya",
    name: "Shibuya",
    displayName: "Shibuya · Tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "APAC",
    timezone: "Asia/Tokyo",
    currency: "JPY",
    locale: "ja-JP",
    vertical: "restaurant",
    archetype: "stable",
    image: "/demo/facilities/berlin-bar.jpg",
    coordinates: { lat: 35.6595, lng: 139.7004 },
    sortOrder: 6,
  },
  {
    id: "loc_hk_central",
    slug: "hong-kong-central",
    name: "Central",
    displayName: "Central · Hong Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
    region: "APAC",
    timezone: "Asia/Hong_Kong",
    currency: "HKD",
    locale: "en-HK",
    vertical: "restaurant",
    archetype: "premium_attach",
    image: "/demo/facilities/berlin-terrace.jpg",
    coordinates: { lat: 22.2819, lng: 114.1589 },
    sortOrder: 7,
  },
  {
    id: "loc_sydney_surry",
    slug: "sydney-surry-hills",
    name: "Surry Hills",
    displayName: "Surry Hills · Sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "APAC",
    timezone: "Australia/Sydney",
    currency: "AUD",
    locale: "en-AU",
    vertical: "restaurant",
    archetype: "premium_attach",
    image: "/demo/facilities/berlin-dining.jpg",
    coordinates: { lat: -33.8831, lng: 151.2111 },
    sortOrder: 8,
  },
  {
    id: "loc_hamburg_hafen",
    slug: "mexico-city-roma-norte",
    name: "Roma Norte",
    displayName: "Roma Norte · Mexico City",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    region: "AMERICAS",
    timezone: "America/Mexico_City",
    currency: "MXN",
    locale: "es-MX",
    vertical: "restaurant",
    archetype: "premium_attach",
    image: "/demo/facilities/berlin-terrace.jpg",
    coordinates: { lat: 19.4194, lng: -99.163 },
    sortOrder: 9,
  },
  {
    id: "loc_frankfurt_westend",
    slug: "sao-paulo-jardins",
    name: "Jardins",
    displayName: "Jardins · São Paulo",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    region: "AMERICAS",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    locale: "pt-BR",
    vertical: "restaurant",
    archetype: "procurement_shock",
    image: "/demo/facilities/berlin-bar.jpg",
    coordinates: { lat: -23.5717, lng: -46.6705 },
    sortOrder: 10,
  },
];

export const HOTEL_ESTATE: DemoEstateEntity[] = [
  {
    id: "loc_canal_house",
    slug: "nyc-mercer-house",
    name: "Mercer House",
    displayName: "Mercer House · New York",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "AMERICAS",
    timezone: "America/New_York",
    currency: "USD",
    locale: "en-US",
    vertical: "hotel",
    archetype: "boutique_city",
    image: "/demo/facilities/canal-deluxe-king.jpg",
    coordinates: { lat: 40.7074, lng: -74.0113 },
    hero: true,
    sortOrder: 1,
  },
  {
    id: "loc_ams_harbour",
    slug: "la-sunset-house",
    name: "Sunset House",
    displayName: "Sunset House · Los Angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    region: "AMERICAS",
    timezone: "America/Los_Angeles",
    currency: "USD",
    locale: "en-US",
    vertical: "hotel",
    archetype: "larger_urban",
    image: "/demo/facilities/canal-suite.jpg",
    coordinates: { lat: 34.0901, lng: -118.385 },
    sortOrder: 2,
  },
  {
    id: "loc_lisbon_alfama",
    slug: "london-shoreditch-house",
    name: "Shoreditch House",
    displayName: "Shoreditch House · London",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "EUROPE",
    timezone: "Europe/London",
    currency: "GBP",
    locale: "en-GB",
    vertical: "hotel",
    archetype: "leisure",
    image: "/demo/facilities/lisbon-onebed.jpg",
    coordinates: { lat: 51.5246, lng: -0.078 },
    sortOrder: 3,
  },
  {
    id: "loc_berlin_mitte_hotel",
    slug: "dubai-downtown-house",
    name: "Downtown House",
    displayName: "Downtown House · Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "MIDDLE_EAST",
    timezone: "Asia/Dubai",
    currency: "AED",
    locale: "en-AE",
    vertical: "hotel",
    archetype: "high_ota",
    image: "/demo/facilities/canal-classic-queen.jpg",
    coordinates: { lat: 25.1972, lng: 55.2744 },
    sortOrder: 4,
  },
  {
    id: "loc_paris_opera",
    slug: "singapore-marina-house",
    name: "Marina House",
    displayName: "Marina House · Singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "APAC",
    timezone: "Asia/Singapore",
    currency: "SGD",
    locale: "en-SG",
    vertical: "hotel",
    archetype: "strong_direct",
    image: "/demo/facilities/canal-deluxe-king.jpg",
    coordinates: { lat: 1.2834, lng: 103.8607 },
    sortOrder: 5,
  },
  {
    id: "loc_london_clerkenwell",
    slug: "tokyo-shinjuku-house",
    name: "Shinjuku House",
    displayName: "Shinjuku House · Tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "APAC",
    timezone: "Asia/Tokyo",
    currency: "JPY",
    locale: "ja-JP",
    vertical: "hotel",
    archetype: "boutique_city",
    image: "/demo/facilities/canal-suite.jpg",
    coordinates: { lat: 35.6938, lng: 139.7034 },
    sortOrder: 6,
  },
  {
    id: "loc_munich_airport",
    slug: "hong-kong-harbour-house",
    name: "Harbour House",
    displayName: "Harbour House · Hong Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
    region: "APAC",
    timezone: "Asia/Hong_Kong",
    currency: "HKD",
    locale: "en-HK",
    vertical: "hotel",
    archetype: "airport_business",
    image: "/demo/facilities/lisbon-studio.jpg",
    coordinates: { lat: 22.2855, lng: 114.1577 },
    sortOrder: 7,
  },
  {
    id: "loc_sydney_surry_hotel",
    slug: "sydney-surry-house",
    name: "Surry House",
    displayName: "Surry House · Sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "APAC",
    timezone: "Australia/Sydney",
    currency: "AUD",
    locale: "en-AU",
    vertical: "hotel",
    archetype: "leisure",
    image: "/demo/facilities/canal-deluxe-king.jpg",
    coordinates: { lat: -33.8831, lng: 151.2111 },
    sortOrder: 8,
  },
  {
    id: "loc_schiphol_gate",
    slug: "mexico-city-polanco-house",
    name: "Polanco House",
    displayName: "Polanco House · Mexico City",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    region: "AMERICAS",
    timezone: "America/Mexico_City",
    currency: "MXN",
    locale: "es-MX",
    vertical: "hotel",
    archetype: "airport_business",
    image: "/demo/facilities/canal-classic-queen.jpg",
    coordinates: { lat: 19.433, lng: -99.196 },
    sortOrder: 9,
  },
  {
    id: "loc_cape_town_waterfront",
    slug: "cape-town-waterfront-house",
    name: "Waterfront House",
    displayName: "Waterfront House · Cape Town",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    region: "AFRICA",
    timezone: "Africa/Johannesburg",
    currency: "ZAR",
    locale: "en-ZA",
    vertical: "hotel",
    archetype: "leisure",
    image: "/demo/facilities/canal-suite.jpg",
    coordinates: { lat: -33.9036, lng: 18.4202 },
    sortOrder: 10,
  },
];

export const DemoEstateRegistry = {
  restaurant: { locations: RESTAURANT_ESTATE },
  hotel: { properties: HOTEL_ESTATE },
} as const;

const BY_ID: Map<string, DemoEstateEntity> = new Map(
  [...RESTAURANT_ESTATE, ...HOTEL_ESTATE].map((e) => [e.id, e]),
);

export function getEstateEntity(id: string): DemoEstateEntity | undefined {
  return BY_ID.get(id);
}

export function estateForVertical(
  vertical: DemoVerticalFamily,
): DemoEstateEntity[] {
  return vertical === "hotel" ? HOTEL_ESTATE : RESTAURANT_ESTATE;
}

export function estateHeroId(vertical: DemoVerticalFamily): string {
  const list = estateForVertical(vertical);
  return list.find((e) => e.hero)?.id ?? list[0]!.id;
}

export function estateCityLine(
  vertical: DemoVerticalFamily,
  featured = 6,
): { cities: string[]; extra: number } {
  const list = estateForVertical(vertical);
  const cities = list.slice(0, featured).map((e) => e.city);
  return { cities, extra: Math.max(0, list.length - featured) };
}

export function estateCount(vertical: DemoVerticalFamily): number {
  return estateForVertical(vertical).length;
}
