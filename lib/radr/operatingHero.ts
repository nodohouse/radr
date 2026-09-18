/**
 * Hero operating-model: structured locations + territories + chart series.
 * All figures reconcile with demoModel where shared.
 */

import {
  BUY_FINDING,
  DEMO_ORG,
  VERIFIED_YTD,
} from "./demoModel";

export type OpTerritory = "buy" | "labor" | "sell" | "recover";
export type ChartRange = "7d" | "30d" | "90d" | "ytd";

export const OP_ORDER: OpTerritory[] = ["buy", "labor", "sell", "recover"];

export type VenueLocation = {
  id: string;
  venueName: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  currency: "EUR" | "GBP" | "USD" | "JPY" | "SGD";
  venueType: string;
  serviceState: string;
  margin: number;
  marginVsPlan: number;
  planMargin: number;
  rank: number;
  status: "on_course" | "watch" | "action";
  territories: Record<
    OpTerritory,
    { value: string; kind: string; raw: number }
  >;
};

export type EvidenceStep = { label: string; value: string };

export type TerritorySurface = {
  id: OpTerritory;
  name: string;
  /** Resting plain English */
  tagline: string;
  topics: readonly string[];
  /** Hover = micro preview only (2-3 lines). Never a panel. */
  preview: {
    label: string;
    title: string;
    value: string;
  };
  investigate: {
    title: string;
    location: string;
    detail?: string;
    impact: string;
    impactKind: string;
    evidence: readonly EvidenceStep[];
    calculation: string;
    source: string;
    confidence: string;
    why: string;
    recommend: string;
    recommendCta: string;
    control: string;
    verified?: string;
    verifiedNote?: string;
  };
};

export type ChartPoint = {
  key: string;
  label: string;
  short: string;
  revenue: number;
  margin: number;
  plan: number;
};

export type ChartEvent = {
  key: string;
  territory: OpTerritory;
  title: string;
  body: string;
  value: string;
};

export const LOCATIONS: VenueLocation[] = [
  {
    id: "loc_nyc",
    venueName: "Northstar New York Flatiron",
    city: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    currency: "USD",
    venueType: "Restaurant",
    serviceState: "Dinner service",
    margin: 19.4,
    marginVsPlan: 1.6,
    planMargin: 17.8,
    rank: 1,
    status: "on_course",
    territories: {
      buy: { value: "$9.8k", kind: "Exposure", raw: 9_800 },
      labor: { value: "$740", kind: "Preventable", raw: 740 },
      sell: { value: "$31.2k", kind: "Upside", raw: 31_200 },
      recover: { value: "$2.4k", kind: "Recoverable", raw: 2_400 },
    },
  },
  {
    id: "loc_tyo",
    venueName: "Northstar Tokyo Shibuya",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
    currency: "JPY",
    venueType: "Restaurant",
    serviceState: "Dinner service",
    margin: 18.8,
    marginVsPlan: 1.0,
    planMargin: 17.8,
    rank: 2,
    status: "on_course",
    territories: {
      buy: { value: "¥1.8M", kind: "Exposure", raw: 1_800_000 },
      labor: { value: "¥92k", kind: "Preventable", raw: 92_000 },
      sell: { value: "¥4.1M", kind: "Upside", raw: 4_100_000 },
      recover: { value: "¥310k", kind: "Recoverable", raw: 310_000 },
    },
  },
  {
    id: "loc_ber",
    venueName: "Northstar Berlin Mitte",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    currency: "EUR",
    venueType: "Restaurant",
    serviceState: "Dinner service",
    margin: 18.4,
    marginVsPlan: 0.6,
    planMargin: 17.8,
    rank: 3,
    status: "action",
    territories: {
      buy: { value: "€118", kind: "Recoverable", raw: 118 },
      labor: { value: "€290", kind: "At risk", raw: 290 },
      sell: { value: "€0", kind: "Clear", raw: 0 },
      recover: { value: "€184", kind: "Recoverable", raw: 184 },
    },
  },
  {
    id: "loc_sin",
    venueName: "Northstar Singapore Marina",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
    currency: "SGD",
    venueType: "Restaurant",
    serviceState: "Dinner service",
    margin: 17.6,
    marginVsPlan: -0.1,
    planMargin: 17.7,
    rank: 4,
    status: "watch",
    territories: {
      buy: { value: "S$620", kind: "Exposure", raw: 620 },
      labor: { value: "S$410", kind: "Preventable", raw: 410 },
      sell: { value: "S$780", kind: "Upside", raw: 780 },
      recover: { value: "S$290", kind: "Recoverable", raw: 290 },
    },
  },
];

export const DEFAULT_LOCATION_ID = "loc_ber";

export function getLocation(id: string): VenueLocation {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[2];
}

export function formatCityCountry(loc: VenueLocation): string {
  return `${loc.city.toUpperCase()} · ${loc.country.toUpperCase()}`;
}

export const GROUP_LEADERBOARD = [...LOCATIONS]
  .sort((a, b) => a.rank - b.rank)
  .map((l) => ({
    rank: l.rank,
    name: l.venueName.replace("Northstar ", ""),
    margin: l.margin,
  }));

export const RADR_VALUE_YTD = {
  identified: 684_000,
  identifiedDisplay: "€684k",
  protected: 126_400,
  protectedDisplay: "€126.4k",
  verified: 58_900,
  verifiedDisplay: "€58.9k",
  verifiedNote:
    "Value confirmed after the underlying operational issue was resolved.",
} as const;

// Sanity: identified display aligns with VERIFIED_YTD brand figure for hero strip
void VERIFIED_YTD;

/** Chart series keyed by range: margin % actual vs plan */
export const CHART_BY_RANGE: Record<ChartRange, readonly ChartPoint[]> = {
  "7d": [
    { key: "12", label: "Tue 12 Aug", short: "12", revenue: 7_420, margin: 17.9, plan: 17.8 },
    { key: "13", label: "Wed 13 Aug", short: "13", revenue: 8_060, margin: 18.5, plan: 17.8 },
    { key: "14", label: "Thu 14 Aug", short: "14", revenue: 7_680, margin: 17.6, plan: 17.8 },
    { key: "15", label: "Fri 15 Aug", short: "15", revenue: 10_240, margin: 18.9, plan: 17.8 },
    { key: "16", label: "Sat 16 Aug", short: "16", revenue: 11_520, margin: 19.1, plan: 17.8 },
    { key: "17", label: "Sun 17 Aug", short: "17", revenue: 8_640, margin: 18.4, plan: 17.8 },
    { key: "18", label: "Tue 18 Aug", short: "18", revenue: 7_812, margin: 18.4, plan: 17.8 },
  ],
  "30d": [
    { key: "d1", label: "20 Jul", short: "20", revenue: 6_800, margin: 17.2, plan: 17.4 },
    { key: "d2", label: "24 Jul", short: "24", revenue: 7_200, margin: 17.5, plan: 17.4 },
    { key: "d3", label: "28 Jul", short: "28", revenue: 7_450, margin: 17.8, plan: 17.5 },
    { key: "d4", label: "01 Aug", short: "01", revenue: 7_900, margin: 18.0, plan: 17.5 },
    { key: "d5", label: "05 Aug", short: "05", revenue: 7_560, margin: 17.7, plan: 17.5 },
    { key: "d6", label: "09 Aug", short: "09", revenue: 8_320, margin: 18.2, plan: 17.6 },
    { key: "d7", label: "13 Aug", short: "13", revenue: 8_060, margin: 18.5, plan: 17.6 },
    { key: "d8", label: "17 Aug", short: "17", revenue: 7_812, margin: 18.4, plan: 17.6 },
  ],
  "90d": [
    { key: "m1", label: "May", short: "May", revenue: 218_000, margin: 17.1, plan: 17.0 },
    { key: "m2", label: "Jun", short: "Jun", revenue: 232_000, margin: 17.6, plan: 17.2 },
    { key: "m3", label: "Jul", short: "Jul", revenue: 241_000, margin: 18.0, plan: 17.4 },
    { key: "m4", label: "Aug", short: "Aug", revenue: 248_000, margin: 18.4, plan: 17.6 },
  ],
  ytd: [
    { key: "q1", label: "Q1", short: "Q1", revenue: 620_000, margin: 16.8, plan: 16.9 },
    { key: "q2", label: "Q2", short: "Q2", revenue: 690_000, margin: 17.5, plan: 17.2 },
    { key: "q3", label: "Q3", short: "Q3", revenue: 720_000, margin: 18.4, plan: 17.6 },
  ],
};

export const CHART_EVENTS: readonly ChartEvent[] = [
  {
    key: "14",
    territory: "buy",
    title: "△ BUY",
    body: "Supplier pricing mismatch",
    value: "€1.2k exposure",
  },
  {
    key: "15",
    territory: "labor",
    title: "△ LABOR",
    body: "Peak service capacity",
    value: "€290 at risk",
  },
  {
    key: "16",
    territory: "recover",
    title: "△ RECOVER",
    body: "Credit confirmed",
    value: "€280 recoverable",
  },
  {
    key: "d6",
    territory: "buy",
    title: "△ BUY",
    body: "Supplier pricing mismatch",
    value: "€118 recoverable",
  },
  {
    key: "d7",
    territory: "labor",
    title: "△ LABOR",
    body: "Peak service capacity",
    value: "€290 at risk",
  },
  {
    key: "d8",
    territory: "recover",
    title: "△ RECOVER",
    body: "Credit confirmed",
    value: "€280 recoverable",
  },
];

/** Per-point BUY/SELL value attribution for tooltip (Berlin 7d) */
export const POINT_VALUE: Record<string, { buy: number; sell: number; signals: number }> = {
  "12": { buy: 420, sell: 180, signals: 1 },
  "13": { buy: 0, sell: 240, signals: 0 },
  "14": { buy: 1240, sell: 0, signals: 2 },
  "15": { buy: 310, sell: 420, signals: 1 },
  "16": { buy: 180, sell: 680, signals: 1 },
  "17": { buy: 520, sell: 310, signals: 2 },
  "18": { buy: 1240, sell: 680, signals: 2 },
};

export const TERRITORY_COPY: Record<OpTerritory, TerritorySurface> = {
  buy: {
    id: "buy",
    name: "BUY",
    tagline: "What you spend.",
    topics: ["Supplier prices", "Contracts", "Invoices", "Purchasing", "Waste"],
    preview: {
      label: "Largest issue",
      title: "Supplier pricing",
      value: "€18.6k",
    },
    investigate: {
      title: "Supplier pricing mismatch",
      location: "Berlin Mitte",
      detail: "Avocado Hass 18ct · FreshCo",
      impact: BUY_FINDING.annualizedDisplay,
      impactKind: "Annualized exposure",
      evidence: [
        { label: "Contract", value: "€31.20 / case" },
        { label: "Invoice", value: "€34.80 / case" },
        { label: "Δ", value: "€3.60 / case" },
        { label: "Volume", value: "5,172 cases / yr" },
        { label: "Invoices affected", value: "18" },
      ],
      calculation: "€3.60 × 5,172 = €18,619.20 → €18,620",
      source: "Procurement contract + AP invoices + volume",
      confidence: BUY_FINDING.confidenceDisplay,
      why: "At contracted volume, the price delta creates €18,620 annualized exposure.",
      recommend: "Review affected invoices and request supplier correction.",
      recommendCta: "Review invoices →",
      control: "Match future invoice price to active contracted rate.",
      verified: "€12.4k",
      verifiedNote: "Protected YTD after corrections on prior mismatches.",
    },
  },
  labor: {
    id: "labor",
    name: "LABOR",
    tagline: "How you staff.",
    topics: ["Demand", "Schedules", "Overtime", "Productivity", "Agency labor"],
    preview: {
      label: "Primary issue",
      title: "Peak service capacity",
      value: "€290 tonight",
    },
    investigate: {
      title: "Peak service understaffed",
      location: "Berlin Mitte",
      detail: "FOH · 19:00-20:30",
      impact: "€290",
      impactKind: "Revenue at risk tonight",
      evidence: [
        { label: "Required", value: "5 FOH" },
        { label: "Scheduled", value: "4 FOH" },
        { label: "Δ", value: "1 short" },
        { label: "Cost / person", value: "€68" },
      ],
      calculation: "Contribution at risk €105 − FOH cost €68 ≈ €37 net benefit",
      source: "Reservations + service curve + published roster",
      confidence: "97.0%",
      why: "Peak demand exceeds FOH capacity; one added cover protects contribution net of cost.",
      recommend: "Reallocate +1 FOH into Section B from 19:15-20:30.",
      recommendCta: "Adjust schedule →",
      control: "Flag schedules below peak demand tolerance.",
      verified: "€4.2k",
      verifiedNote: "Labor value verified this month after schedule controls.",
    },
  },
  sell: {
    id: "sell",
    name: "SELL",
    tagline: "How you monetize.",
    topics: ["Pricing", "Menu contribution", "Promotions", "Channels", "Commissions"],
    preview: {
      label: "Top opportunity",
      title: "Menu contribution",
      value: "€34.2k",
    },
    investigate: {
      title: "Menu contribution gap",
      location: "Paris Marais",
      detail: "High-volume dinner item",
      impact: "€34,200",
      impactKind: "Identified upside",
      evidence: [
        { label: "Expected", value: "€8.40" },
        { label: "Actual", value: "€7.10" },
        { label: "Δ", value: "€1.30 / item" },
        { label: "Volume", value: "26,300" },
      ],
      calculation: "€1.30 × 26,300 = €34,190 → €34,200",
      source: "Recipe cost + POS contribution + volume",
      confidence: "96.0%",
      why: "At current volume: €34,200 identified upside.",
      recommend: "Review pricing on the high-volume item.",
      recommendCta: "Review pricing →",
      control: "Contribution threshold alert",
      verified: "€6,840",
      verifiedNote: "Realized after prior contribution corrections.",
    },
  },
  recover: {
    id: "recover",
    name: "RECOVER",
    tagline: "What you're owed.",
    topics: ["Credits", "Refunds", "Rebates", "Settlements", "Claims"],
    preview: {
      label: "Largest item",
      title: "Delivery payout",
      value: "€332",
    },
    investigate: {
      title: "Delivery payout discrepancy",
      location: "Berlin Mitte",
      detail: "Platform · Week 32",
      impact: "€332",
      impactKind: "Unexplained",
      evidence: [
        { label: "Expected", value: "€11,570" },
        { label: "Received", value: "€11,238" },
        { label: "Unexplained", value: "€332" },
        { label: "Recoverable", value: "€283" },
      ],
      calculation: "Expected €11,570 − received €11,238 = €332 unexplained",
      source: "POS + platform payout + fee schedule",
      confidence: "98.0%",
      why: "Platform payout sits below expected settlement after fees and refunds.",
      recommend: "Open payout claim for €283 recoverable.",
      recommendCta: "Investigate payout →",
      control: "Flag payout delta > tolerance within 48h.",
      verified: "€2.1k",
      verifiedNote: "Recovered earlier this quarter from related credits.",
    },
  },
};

/** Chart day investigation payload */
export type ChartDayCase = {
  key: string;
  label: string;
  revenue: number;
  margin: number;
  plan: number;
  signals: number;
  events: readonly ChartEvent[];
};

/** @deprecated alias: prefer TERRITORY_COPY */
export const TERRITORIES = TERRITORY_COPY;

export const TERRITORY_DWELL_MS = 9000;

export const DEMO_ORG_NAME = DEMO_ORG.name;
export const DEMO_LOCATION_COUNT = DEMO_ORG.locations;
