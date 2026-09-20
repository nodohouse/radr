/**
 * Daily operating intelligence: pulse, tonight, forward week, calendar context.
 * Canonical for Control Center Overview + Product marketing preview.
 * Demo clock: Wednesday 19 August 2026.
 */

import type { CancellationCluster } from "./cancellationModel";
import {
  formatAtRiskEuro,
  unrecoveredFromGross,
} from "./cancellationModel";
import { DEMO_AS_OF_ISO, DEMO_CLOCK_LABELS } from "./demoClock";
import { berlinTerraceOpportunity, BERLIN_TERRACE_WEATHER } from "./weather/calc";

export const DEMO_CLOCK = {
  today: new Date(DEMO_AS_OF_ISO),
  todayLabel: DEMO_CLOCK_LABELS.todayLabel,
  todayShort: DEMO_CLOCK_LABELS.todayShort,
  yesterdayLabel: DEMO_CLOCK_LABELS.yesterdayLabel,
  yesterdayShort: DEMO_CLOCK_LABELS.yesterdayShort,
} as const;

/** Closed trading day: primary Daily Pulse */
export const DAILY_PULSE = {
  locationId: "loc_ber",
  locationName: "Berlin Mitte",
  periodLabel: "Yesterday",
  periodDate: "Tuesday, 18 August",
  revenue: 7_812,
  revenueDisplay: "€7,812",
  revenueYoY: 6.2,
  revenueVsForecast: 3.1,
  margin: 18.4,
  covers: 122,
  revenuePerCover: 64.03,
  revenuePerCoverDisplay: "€64",
  laborPct: 32.6,
  marginVsPlanPts: 0.6,
  laborVsPlanPts: -0.4,
  interpretation: {
    tone: "strong" as const,
    title: "Stronger than expected",
    body: "Dinner revenue finished €234 above forecast, driven by covers and average spend.",
  },
  why: {
    covers: 4.2,
    avgSpend: 2.1,
    mix: 0.4,
  },
} as const;

/** Live day / tonight: booking → economic expectation */
export const TONIGHT = {
  label: "Tonight",
  dateLabel: "Wednesday, 19 August",
  bookedCovers: 118,
  expectedOccupancy: 84,
  vsComparable: 9.3,
  comparableLabel: "vs comparable Wednesday",
  expectedRevenue: 9_088,
  expectedRevenueDisplay: "€9.1k",
  expectedMargin: 19.0,
  signal: {
    territory: "LABOR" as const,
    title: "Peak service capacity",
    body: "Bookings are up 9.3% vs comparable Wednesday; peak FOH capacity is tight 19:00-20:30.",
    exposure: 290,
    exposureDisplay: "€290",
    recommend: "+1 FOH 19:15-20:30",
  },
} as const;

export type DaySignalKind =
  | "demand"
  | "staffing"
  | "plan"
  | "event"
  | "cancellation"
  | "opportunity";

export type DayFinding = {
  territory: "BUY" | "LABOR" | "SELL" | "RECOVER";
  /** e.g. STAFFING RISK */
  kind: string;
  /** One-line situation for collapsed view */
  body: string;
  what: string;
  why: string[];
  /** Only when estimable: never invent */
  impact?: string;
  /** Short action chip, e.g. +1 FOH */
  recommendLabel?: string;
  recommend: string;
  href: string;
};

export type ForwardDay = {
  key: string;
  dow: string;
  dateLabel: string;
  fullLabel: string;
  revenue: number;
  revenueDisplay: string;
  covers: number;
  margin: number;
  signal: null | {
    kind: DaySignalKind;
    label: string;
    detail: string;
    territory?: "BUY" | "LABOR" | "SELL" | "RECOVER";
  };
  /** Compact secondary line on the day cell: only when material. */
  secondary?: string;
  drivers?: { label: string; direction: "up" | "down" | "flat" | "event" }[];
  confidence?: "HIGH" | "MEDIUM";
  /** Plain-language read before metrics */
  summary?: {
    headline: string;
    body: string;
  };
  /** Benchmarks so numbers mean something */
  context?: {
    coversVsTypical?: { delta: number; label: string };
    coversVsPlanPct?: number;
    revenueVsTypical?: { deltaEuro: number; label: string };
    revenueVsPlanPct?: number;
    marginVsPlanPts?: number;
    confidenceWhy?: string;
  };
  /** On-demand provenance for forecast revenue */
  revenueBreakdown?: {
    currentlyBooked: number;
    expectedAdditional: number;
    expectedWalkIns: number;
    signals: string[];
  };
  cancellations?: CancellationCluster;
  findings?: DayFinding[];
};

/** Saturday late cluster: venue-scale (Berlin 72 seats). */
const SAT_CANCEL_REPLACEMENT = 0.62;
const SAT_CANCEL: CancellationCluster = {
  reservations: 3,
  covers: 8,
  grossBookingValue: 512,
  expectedUnrecovered: unrecoveredFromGross(512, SAT_CANCEL_REPLACEMENT),
  estimatedMarginImpact: 68,
  leadClass: "late",
  replacementProbability: SAT_CANCEL_REPLACEMENT,
  primaryTerritory: "SELL",
  secondaryTerritories: ["LABOR"],
};

export const GROUP_MARGIN_AVG = 17.7;

/** Next 7 days: Berlin Mitte venue scale (~€64 spend / cover). */
export const FORWARD_WEEK: ForwardDay[] = [
  {
    key: "2026-08-19",
    dow: "WED",
    dateLabel: "19 Aug",
    fullLabel: "Wednesday 19 Aug",
    revenue: 9_088,
    revenueDisplay: "€9.1k",
    covers: 142,
    margin: 19.0,
    signal: {
      kind: "staffing",
      label: "Staffing risk",
      detail: "Demand ahead of labor plan 19:00-20:30.",
      territory: "LABOR",
    },
    confidence: "HIGH",
    summary: {
      headline: "Staffing risk tonight",
      body: "Bookings are ahead of the labor plan for the dinner peak. Revenue outlook remains on track if coverage is corrected.",
    },
    context: {
      coversVsTypical: { delta: 22, label: "vs typical Wednesday" },
      coversVsPlanPct: 9,
      revenueVsTypical: { deltaEuro: 1_280, label: "vs typical Wednesday" },
      revenueVsPlanPct: 9,
      marginVsPlanPts: 0.5,
      confidenceWhy: "Live bookings strongly support the forecast",
    },
  },
  {
    key: "2026-08-20",
    dow: "THU",
    dateLabel: "20 Aug",
    fullLabel: "Thursday 20 Aug",
    revenue: 7_680,
    revenueDisplay: "€7.7k",
    covers: 120,
    margin: 18.2,
    signal: {
      kind: "opportunity",
      label: "Terrace demand elevated",
      detail: "Warm dry lunch weather vs current terrace plan.",
      territory: "SELL",
    },
    secondary: `+${berlinTerraceOpportunity().additionalExpectedCovers} projected covers · €${berlinTerraceOpportunity().grossOpportunity} opportunity`,
    drivers: [
      { label: "Weather", direction: "up" },
      { label: "Terrace demand", direction: "up" },
      { label: "Labor plan", direction: "flat" },
    ],
    confidence: "MEDIUM",
    summary: {
      headline: "Weather-sensitive lunch",
      body: "Warm, dry conditions are expected to lift terrace demand above the current plan between 13:00 and 15:00.",
    },
    context: {
      coversVsTypical: { delta: 14, label: "vs terrace plan" },
      coversVsPlanPct: 12,
      revenueVsTypical: { deltaEuro: berlinTerraceOpportunity().grossOpportunity, label: "weather opportunity (estimate)" },
      revenueVsPlanPct: 5,
      marginVsPlanPts: 0.2,
      confidenceWhy: "Forecast + comparable warm dry Thursdays - correlation, not certainty",
    },
    findings: [
      {
        territory: "SELL",
        kind: "Terrace demand",
        body: "Warm dry lunch weather vs current terrace and FOH plan.",
        what: "Terrace demand likely exceeds the Thursday lunch operating plan.",
        why: [
          `Forecast warm and dry · comparable Thursdays +${BERLIN_TERRACE_WEATHER.comparableWarmDryLiftPct}% terrace covers.`,
          berlinTerraceOpportunity().calc,
          berlinTerraceOpportunity().netCalc,
        ],
        impact: `Gross €${berlinTerraceOpportunity().grossOpportunity} · net €${berlinTerraceOpportunity().netOpportunity} after FOH cost · estimate, not verified.`,
        recommendLabel: "+1 FOH",
        recommend: `Full terrace +1 FOH ${BERLIN_TERRACE_WEATHER.peakStart}-${BERLIN_TERRACE_WEATHER.peakEnd}`,
        href: `/app/findings/fnd_weather_terrace_loc_ber`,
      },
    ],
  },
  {
    key: "2026-08-21",
    dow: "FRI",
    dateLabel: "21 Aug",
    fullLabel: "Friday 21 Aug",
    revenue: 10_560,
    revenueDisplay: "€10.6k",
    covers: 165,
    margin: 19.1,
    signal: {
      kind: "demand",
      label: "High demand",
      detail: "Bookings +12% vs typical Friday.",
      territory: "SELL",
    },
    drivers: [
      { label: "Bookings", direction: "up" },
      { label: "Historical", direction: "up" },
      { label: "Average spend", direction: "flat" },
    ],
    confidence: "HIGH",
    summary: {
      headline: "High demand expected",
      body: "Friday bookings are above a typical Friday. Revenue and covers are both tracking ahead of plan.",
    },
    context: {
      coversVsTypical: { delta: 18, label: "vs typical Friday" },
      coversVsPlanPct: 12,
      revenueVsTypical: { deltaEuro: 1_150, label: "vs typical Friday" },
      revenueVsPlanPct: 12,
      marginVsPlanPts: 0.6,
      confidenceWhy: "Bookings + historical demand strongly agree",
    },
  },
  {
    key: "2026-08-22",
    dow: "SAT",
    dateLabel: "22 Aug",
    fullLabel: "Saturday 22 Aug",
    revenue: 11_840,
    revenueDisplay: "€11.8k",
    covers: 185,
    margin: 19.2,
    signal: {
      kind: "staffing",
      label: "Staffing risk",
      detail: "Expected demand exceeds current staffing plan.",
      territory: "LABOR",
    },
    secondary: `3 late cancels · ${formatAtRiskEuro(SAT_CANCEL.expectedUnrecovered)} at risk`,
    drivers: [
      { label: "Bookings", direction: "up" },
      { label: "Covers", direction: "up" },
      { label: "Cancellations", direction: "up" },
      { label: "Avg spend", direction: "flat" },
      { label: "Local event", direction: "event" },
    ],
    confidence: "HIGH",
    summary: {
      headline: "High demand expected",
      body: "Saturday is tracking above normal demand. RADR expects 185 covers and €11.8k revenue, but the current staffing plan is below expected demand.",
    },
    context: {
      coversVsTypical: { delta: 20, label: "vs typical Saturday" },
      coversVsPlanPct: 8,
      revenueVsTypical: { deltaEuro: 1_280, label: "vs typical Saturday" },
      revenueVsPlanPct: 10,
      marginVsPlanPts: 0.8,
      confidenceWhy: "Bookings + historical demand strongly agree",
    },
    revenueBreakdown: {
      currentlyBooked: 8_960,
      expectedAdditional: 1_920,
      expectedWalkIns: 960,
      signals: ["Booking system", "POS history", "Local demand model"],
    },
    cancellations: SAT_CANCEL,
    findings: [
      {
        territory: "LABOR",
        kind: "Staffing risk",
        body: "Demand is forecast above the current staffing plan between 18:00-22:00.",
        what: "Expected demand between 18:00-22:00 exceeds the current staffing plan.",
        why: [
          "Bookings are +11% vs typical Saturday.",
          "A nearby event is increasing expected demand.",
          "Current FOH staffing remains at normal Saturday levels.",
        ],
        impact: `Protect approximately ${formatAtRiskEuro(SAT_CANCEL.estimatedMarginImpact)} of contribution at risk from understaffing during the peak.`,
        recommendLabel: "+1 FOH",
        recommend: "Add +1 FOH from 18:00-22:00",
        href: "/app/labor",
      },
      {
        territory: "SELL",
        kind: "Late cancellations",
        body: `3 cancellations removed 8 covers. ${formatAtRiskEuro(SAT_CANCEL.expectedUnrecovered)} is currently expected to remain unrecovered.`,
        what: "A late cancellation cluster removed 8 covers from Saturday demand.",
        why: [
          `${SAT_CANCEL.reservations} reservations cancelled with late lead time.`,
          `${formatAtRiskEuro(SAT_CANCEL.grossBookingValue)} booking value was affected.`,
          "Replacement demand is only partially expected to refill those tables.",
        ],
        impact: `${formatAtRiskEuro(SAT_CANCEL.expectedUnrecovered)} revenue currently at risk · not verified value.`,
        recommendLabel: "Release inventory",
        recommend: "Release inventory · increase channel exposure",
        href: "/app/sell",
      },
    ],
  },
  {
    key: "2026-08-23",
    dow: "SUN",
    dateLabel: "23 Aug",
    fullLabel: "Sunday 23 Aug",
    revenue: 8_640,
    revenueDisplay: "€8.6k",
    covers: 135,
    margin: 18.6,
    signal: {
      kind: "plan",
      label: "On plan",
      detail: "Sunday pattern holds.",
    },
    confidence: "MEDIUM",
  },
  {
    key: "2026-08-24",
    dow: "MON",
    dateLabel: "24 Aug",
    fullLabel: "Monday 24 Aug",
    revenue: 6_080,
    revenueDisplay: "€6.1k",
    covers: 95,
    margin: 17.9,
    signal: null,
    confidence: "MEDIUM",
  },
  {
    key: "2026-08-25",
    dow: "TUE",
    dateLabel: "25 Aug",
    fullLabel: "Tuesday 25 Aug",
    revenue: 6_400,
    revenueDisplay: "€6.4k",
    covers: 100,
    margin: 18.1,
    signal: {
      kind: "opportunity",
      label: "Opportunity",
      detail: "Soft Tuesday: room to push covers via channel mix.",
      territory: "SELL",
    },
    confidence: "MEDIUM",
  },
];

/** System status for glance: financial consequence first. */
export function deriveGlanceStatus(scope: string): {
  label: string;
  detail?: string;
  state: "ok" | "watch" | "risk" | "opportunity";
} {
  if (scope === "loc_ber" || scope === "all" || scope.startsWith("region_")) {
    return {
      label: "3 items need attention",
      detail: `${formatAtRiskEuro(SAT_CANCEL.expectedUnrecovered)} value at risk`,
      state: "risk",
    };
  }
  return {
    label: "Operation on plan",
    detail: "No material exceptions detected",
    state: "ok",
  };
}

/** Calendar / event intelligence: surface only when material */
export const CALENDAR_CONTEXT = [
  {
    key: "2026-08-22",
    label: "Berlin late-summer terrace peak",
    kind: "seasonality" as const,
    effect: "+11% expected demand vs typical Saturday",
  },
  {
    key: "2026-08-15",
    label: "Comparable Saturday 2025",
    kind: "yoy" as const,
    effect: "YoY baseline for seasonal compare",
  },
  {
    key: "2026-08-22",
    label: "Late cancellation cluster",
    kind: "demand" as const,
    effect: `${formatAtRiskEuro(SAT_CANCEL.expectedUnrecovered)} expected unrecovered after replacement`,
  },
] as const;

/** Group snapshot: reporting currency EUR; leaders in local daily scale. */
export const GROUP_TODAY = {
  locations: 12,
  revenue: 168_400,
  revenueDisplay: "€168k",
  vsForecast: 4.2,
  reportingCurrency: "EUR" as const,
  leaders: [
    { id: "loc_nyc", name: "New York Flatiron", revenue: 16_820, currency: "USD" as const, vsForecast: 7.2, margin: 19.4, rank: 1 },
    { id: "loc_tyo", name: "Tokyo Shibuya", revenue: 13_640, currency: "JPY" as const, vsForecast: 4.1, margin: 18.8, rank: 2 },
    { id: "loc_ber", name: "Berlin Mitte", revenue: 9_088, currency: "EUR" as const, vsForecast: 6.1, margin: 18.4, rank: 3 },
    { id: "loc_sin", name: "Singapore Marina", revenue: 11_260, currency: "SGD" as const, vsForecast: 2.4, margin: 17.6, rank: 4 },
    { id: "loc_lon", name: "London Soho", revenue: 12_240, currency: "GBP" as const, vsForecast: -1.2, margin: 17.9, rank: 5 },
  ],
} as const;

/** Rank decomposition for Berlin Mitte */
export const LOCATION_RANK_WHY = {
  locationId: "loc_ber",
  overall: 3,
  of: 12,
  factors: [
    { label: "Revenue", rank: 5 },
    { label: "Margin", rank: 2 },
    { label: "Labor efficiency", rank: 4 },
    { label: "YoY growth", rank: 3 },
  ],
} as const;
