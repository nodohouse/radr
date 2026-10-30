/**
 * Hotel demand intelligence — seasonal fingerprints, events, pace, DNA.
 * Deterministic demo fixtures; architecture ready for live PMS + event feeds.
 *
 * Guardrail: never claim causation. Use OBSERVED / ESTIMATED / INFERRED.
 */

import { NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";
import { getHotelBookingPaceReport } from "@/lib/radr/demo/hotelBookingPace";
import type { TransferVerdict } from "@/lib/radr/product/portfolioEconomics";

export type HotelScoreMetric =
  | "contribution"
  | "revpar"
  | "adr"
  | "occupancy"
  | "net_revpar"
  | "direct_share"
  | "revenue";

export type EvidenceKind = "OBSERVED" | "ESTIMATED" | "INFERRED";

export type ExternalEventCategory =
  | "CONCERT"
  | "CONFERENCE"
  | "TRADE_FAIR"
  | "SPORT"
  | "FESTIVAL"
  | "HOLIDAY"
  | "SCHOOL_BREAK"
  | "CITY";

export type ExternalEvent = {
  eventId: string;
  name: string;
  city: string;
  startDate: string;
  endDate: string;
  category: ExternalEventCategory;
  venue: string;
  expectedAttendance: number | null;
  distanceKm: number;
  source: string;
  /** Materiality gate — low = suppressed from UI */
  materiality: "high" | "mid" | "low";
};

export type EventAttribution = {
  eventId: string;
  locationId: string;
  baselineOccPct: number;
  observedOccPct: number;
  adrUpliftEuro: number;
  pickupUpliftPct: number;
  directSharePp: number;
  /** Estimated event-associated room contribution */
  estimatedUpliftEuro: number;
  upliftRangePp: [number, number];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidenceKind: EvidenceKind;
  explanation: string;
  relatedDecisionId: string | null;
};

export type EventImpactProfile = {
  category: ExternalEventCategory;
  typicalLeadDays: [number, number];
  typicalOccUpliftPp: number;
  typicalAdrResponseEuro: number;
  cancelBehavior: string;
  channelNote: string;
  losNote: string;
};

export type SeasonalMonth = {
  month: number; // 1–12
  label: string;
  baseline: number;
  currentYear: number;
  priorYear: number;
};

export type PeakPeriod = {
  kind: "PEAK" | "SHOULDER" | "LOW" | "EVENT" | "WEEKLY";
  label: string;
  detail: string;
};

export type PropertyDemandDna = {
  locationId: string;
  strongest: string;
  bookingWindowDays: [number, number];
  eventSensitivity: "HIGH" | "MID" | "LOW";
  directPropensity: "HIGH" | "MID" | "LOW";
  corporateWeekday: "HIGH" | "MID" | "LOW";
  cancellationNote: string;
  roomCount: number;
  priceLevel: "value" | "mid" | "premium";
};

export type ComingUpOpportunity = {
  eventId: string;
  locationId: string;
  name: string;
  daysAway: number;
  historicalPickupPct: number;
  historicalAdrEuro: number;
  historicalDirectPp: number;
  paceVsCurvePct: number;
  needsDecision: boolean;
  futures: string[];
  decisionHint: string | null;
  relatedDecisionId: string | null;
};

export type HotelPropertyScorecard = {
  locationId: string;
  label: string;
  roomRevenue: number;
  occupancyPct: number;
  adr: number;
  revpar: number;
  netRevpar: number;
  contribution: number;
  contributionPlan: number;
  directSharePct: number;
  otaSharePct: number;
  channelFees: number;
  cancellations: number;
  noShows: number;
  upsellRevenue: number;
  ancillaryRevenue: number;
  housekeepingCost: number;
  readinessMisses: number;
  verified: number;
  exposure: number;
  vsExpectationPct: number;
};

export type HotelDemandBundle = {
  locationId: string;
  fingerprint: SeasonalMonth[];
  fingerprintMetric: "occupancy" | "adr" | "revpar" | "contribution";
  peaks: PeakPeriod[];
  peakExplanation: string | null;
  dna: PropertyDemandDna;
  attributions: EventAttribution[];
  comingUp: ComingUpOpportunity[];
  monthlyHeat: { month: number; label: string; tone: "ahead" | "behind" | "flat"; magnitude: number }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Canonical external event library — materiality-filtered at query time. */
export const HOTEL_EXTERNAL_EVENTS: ExternalEvent[] = [
  {
    eventId: "evt_design_week_ams",
    name: "Dutch Design Week",
    city: "New York",
    startDate: "2026-06-12",
    endDate: "2026-06-16",
    category: "CITY",
    venue: "Citywide",
    expectedAttendance: 350_000,
    distanceKm: 0.8,
    source: "city_calendar",
    materiality: "high",
  },
  {
    eventId: "evt_ade_2026",
    name: "Amsterdam Dance Event",
    city: "New York",
    startDate: "2026-10-14",
    endDate: "2026-10-18",
    category: "FESTIVAL",
    venue: "Citywide venues",
    expectedAttendance: 400_000,
    distanceKm: 1.2,
    source: "ticketmaster",
    materiality: "high",
  },
  {
    eventId: "evt_rai_tech",
    name: "RAI Tech Summit",
    city: "New York",
    startDate: "2026-09-28",
    endDate: "2026-09-30",
    category: "CONFERENCE",
    venue: "RAI Amsterdam",
    expectedAttendance: 18_000,
    distanceKm: 4.5,
    source: "conference_feed",
    materiality: "mid",
  },
  {
    eventId: "evt_ajax_derby",
    name: "Ajax derby",
    city: "New York",
    startDate: "2026-10-04",
    endDate: "2026-10-04",
    category: "SPORT",
    venue: "Johan Cruijff Arena",
    expectedAttendance: 54_000,
    distanceKm: 6.2,
    source: "stadium",
    materiality: "mid",
  },
  {
    eventId: "evt_small_club",
    name: "Club night · Paradiso",
    city: "New York",
    startDate: "2026-09-26",
    endDate: "2026-09-26",
    category: "CONCERT",
    venue: "Paradiso",
    expectedAttendance: 700,
    distanceKm: 18,
    source: "ticketmaster",
    materiality: "low", // suppressed
  },
  {
    eventId: "evt_lisbon_web",
    name: "Web Summit",
    city: "Lisbon",
    startDate: "2026-11-09",
    endDate: "2026-11-12",
    category: "CONFERENCE",
    venue: "FIL",
    expectedAttendance: 70_000,
    distanceKm: 2.1,
    source: "conference_feed",
    materiality: "high",
  },
  {
    eventId: "evt_berlin_fashion",
    name: "Berlin Fashion Week",
    city: "New York",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    category: "FESTIVAL",
    venue: "Citywide",
    expectedAttendance: 80_000,
    distanceKm: 1.0,
    source: "city_calendar",
    materiality: "high",
  },
];

export const EVENT_IMPACT_PROFILES: EventImpactProfile[] = [
  {
    category: "FESTIVAL",
    typicalLeadDays: [21, 45],
    typicalOccUpliftPp: 12,
    typicalAdrResponseEuro: 24,
    cancelBehavior: "Slightly elevated 7–10d out",
    channelNote: "Direct share often +3–6pp",
    losNote: "LOS +0.3 nights leisure",
  },
  {
    category: "CONFERENCE",
    typicalLeadDays: [30, 60],
    typicalOccUpliftPp: 8,
    typicalAdrResponseEuro: 14,
    cancelBehavior: "Corporate cancels firm until 14d",
    channelNote: "GDS / corporate heavy",
    losNote: "Weekday-weighted · 2–3 night LOS",
  },
  {
    category: "CONCERT",
    typicalLeadDays: [7, 21],
    typicalOccUpliftPp: 6,
    typicalAdrResponseEuro: 18,
    cancelBehavior: "Late pickup · short LOS",
    channelNote: "OTA-heavy unless held direct",
    losNote: "1–2 nights",
  },
  {
    category: "CITY",
    typicalLeadDays: [14, 40],
    typicalOccUpliftPp: 10,
    typicalAdrResponseEuro: 22,
    cancelBehavior: "Stable",
    channelNote: "Direct propensity rises",
    losNote: "Weekend stretch",
  },
  {
    category: "SPORT",
    typicalLeadDays: [5, 14],
    typicalOccUpliftPp: 4,
    typicalAdrResponseEuro: 12,
    cancelBehavior: "Volatile within 72h",
    channelNote: "OTA + packages",
    losNote: "1 night dominant",
  },
];

function archetypeCurve(
  archetype: string,
): { baseline: number[]; current: number[] } {
  // Per-property demand — NOT one group-wide peak
  if (archetype === "boutique_city" || archetype === "strong_direct") {
    // Late spring / summer peak
    return {
      baseline: [62, 64, 70, 76, 84, 90, 92, 88, 78, 72, 68, 74],
      current: [61, 65, 72, 78, 86, 94, 93, 89, 80, 74, 70, 76],
    };
  }
  if (archetype === "airport_business") {
    // Corporate Sep–Nov + steady summer
    return {
      baseline: [70, 72, 74, 76, 78, 80, 78, 76, 84, 86, 88, 72],
      current: [69, 71, 75, 77, 79, 81, 77, 75, 86, 88, 90, 73],
    };
  }
  if (archetype === "leisure") {
    // Summer + Nov conference
    return {
      baseline: [55, 58, 65, 72, 80, 88, 90, 86, 70, 68, 82, 75],
      current: [54, 57, 66, 74, 82, 90, 91, 87, 71, 69, 86, 78],
    };
  }
  if (archetype === "high_ota") {
    // Winter event + fashion summer
    return {
      baseline: [68, 70, 72, 74, 78, 82, 88, 80, 74, 72, 76, 84],
      current: [67, 71, 73, 75, 79, 84, 92, 81, 75, 73, 78, 86],
    };
  }
  // larger_urban — shoulder-strong
  return {
    baseline: [66, 68, 72, 76, 80, 84, 86, 84, 80, 76, 74, 70],
    current: [65, 69, 73, 77, 81, 85, 87, 85, 81, 77, 75, 72],
  };
}

function buildFingerprint(
  locationId: string,
  archetype: string,
  metric: "occupancy" | "adr" | "revpar" | "contribution" = "occupancy",
): SeasonalMonth[] {
  const curve = archetypeCurve(archetype);
  const h = hash(locationId);
  const scale =
    metric === "adr"
      ? 1.8
      : metric === "revpar"
        ? 1.4
        : metric === "contribution"
          ? 0.45
          : 1;
  return MONTHS.map((label, i) => {
    const base = curve.baseline[i]! * scale;
    const cur = curve.current[i]! * scale;
    const prior = (curve.baseline[i]! - 1 + (h % 3) * 0.3) * scale;
    return {
      month: i + 1,
      label,
      baseline: Math.round(base * 10) / 10,
      currentYear: Math.round(cur * 10) / 10,
      priorYear: Math.round(prior * 10) / 10,
    };
  });
}

function peaksFor(archetype: string, label: string): PeakPeriod[] {
  if (archetype === "airport_business") {
    return [
      {
        kind: "PEAK",
        label: "Structural peak · Sep–Nov",
        detail: "Corporate Tue–Thu · highest RevPAR weeks W38–W46",
      },
      {
        kind: "SHOULDER",
        label: "Shoulder · Apr–Jun",
        detail: "Leisure mix rises · weekday ADR softens",
      },
      {
        kind: "LOW",
        label: "Low · mid-December–January",
        detail: "Corporate pause · opportunistic packages",
      },
      {
        kind: "WEEKLY",
        label: "Weekly peak · Tue–Thu",
        detail: "Business arrivals · Friday soft",
      },
    ];
  }
  if (archetype === "high_ota" || label.includes("Mitte")) {
    return [
      {
        kind: "PEAK",
        label: "Structural peak · Jul + Dec",
        detail: "Fashion Week + December ADR strength",
      },
      {
        kind: "EVENT",
        label: "Event peaks · Fashion / concerts",
        detail: "Short lead · OTA-heavy unless held",
      },
      {
        kind: "LOW",
        label: "Low · Feb–Mar",
        detail: "Occupancy soft · rate discipline",
      },
    ];
  }
  if (archetype === "leisure") {
    return [
      {
        kind: "PEAK",
        label: "Structural peak · Jun–Aug",
        detail: "Leisure season · highest occupancy",
      },
      {
        kind: "EVENT",
        label: "Event peak · Web Summit Nov",
        detail: "Conference overlay on shoulder",
      },
      {
        kind: "LOW",
        label: "Low · Jan–Feb",
        detail: "Tourism trough",
      },
    ];
  }
  // boutique / harbour — Canal House style
  return [
    {
      kind: "PEAK",
      label: "Structural peak · May–July",
      detail: "Highest RevPAR weeks W24–W27",
    },
    {
      kind: "EVENT",
      label: "Event peaks · Design Week / ADE",
      detail: "Citywide demand · direct propensity high",
    },
    {
      kind: "SHOULDER",
      label: "Shoulder · Sep–Oct",
      detail: "Still strong weekends · weekday gap",
    },
    {
      kind: "LOW",
      label: "Winter opportunity · December",
      detail: "ADR strong · occupancy below potential",
    },
    {
      kind: "WEEKLY",
      label: "Weekly peak · Fri–Sat",
      detail: "Leisure weekend stretch",
    },
  ];
}

function dnaFor(
  locationId: string,
  archetype: string,
  name: string,
): PropertyDemandDna {
  const boutique = archetype === "boutique_city" || archetype === "strong_direct";
  const airport = archetype === "airport_business";
  return {
    locationId,
    strongest: airport
      ? "corporate Tue–Thu · Sep–Nov"
      : boutique
        ? "late spring / summer weekends"
        : archetype === "leisure"
          ? "summer leisure + Nov conference"
          : "summer + event overlays",
    bookingWindowDays: airport ? [14, 28] : boutique ? [28, 42] : [21, 35],
    eventSensitivity: airport ? "LOW" : boutique ? "HIGH" : "MID",
    directPropensity:
      archetype === "strong_direct" || boutique
        ? "HIGH"
        : archetype === "high_ota"
          ? "LOW"
          : "MID",
    corporateWeekday: airport ? "HIGH" : boutique ? "LOW" : "MID",
    cancellationNote: airport
      ? "Corporate firm until 14d · leisure volatile 7d"
      : "Higher cancellation risk 7–14 days out",
    roomCount: boutique ? 48 : airport ? 120 : archetype === "larger_urban" ? 96 : 64,
    priceLevel: boutique || archetype === "strong_direct" ? "premium" : "mid",
  };
}

/** Material events only — suppress low-materiality noise. */
export function materialEventsForCity(city: string): ExternalEvent[] {
  return HOTEL_EXTERNAL_EVENTS.filter(
    (e) =>
      e.city === city &&
      e.materiality !== "low" &&
      e.distanceKm <= 12,
  );
}

export function attributionFor(
  locationId: string,
  eventId: string,
): EventAttribution | null {
  if (eventId === "evt_design_week_ams" && locationId === "loc_canal_house") {
    return {
      eventId,
      locationId,
      baselineOccPct: 78,
      observedOccPct: 94,
      adrUpliftEuro: 31,
      pickupUpliftPct: 18,
      directSharePp: 6,
      estimatedUpliftEuro: 18_400,
      upliftRangePp: [11, 15],
      confidence: "HIGH",
      evidenceKind: "ESTIMATED",
      explanation:
        "Bookings were 18% above comparable non-event weeks. The event is estimated to explain 11–15pp of the uplift — similar weekdays, comparable lead time, local demand signal.",
      relatedDecisionId: null,
    };
  }
  if (eventId === "evt_ade_2026" && locationId === "loc_canal_house") {
    return {
      eventId,
      locationId,
      baselineOccPct: 76,
      observedOccPct: 0, // upcoming
      adrUpliftEuro: 24,
      pickupUpliftPct: 13,
      directSharePp: 4,
      estimatedUpliftEuro: 12_200,
      upliftRangePp: [8, 12],
      confidence: "MEDIUM",
      evidenceKind: "INFERRED",
      explanation:
        "Historical ADE weeks at Canal House show +13% pickup and +€24 ADR. Current pace is 7% behind the comparable event curve.",
      relatedDecisionId: "dec_hotel_ota",
    };
  }
  return null;
}

/** Property sensitivity to the same event — not group-wide. */
export function eventSensitivityMatrix(
  eventId: string,
): { locationId: string; label: string; pickupPct: number }[] {
  if (eventId !== "evt_ade_2026" && eventId !== "evt_design_week_ams") return [];
  return [
    { locationId: "loc_canal_house", label: "Mercer House · New York", pickupPct: 24 },
    { locationId: "loc_ams_harbour", label: "Harbour", pickupPct: 11 },
    { locationId: "loc_schiphol_gate", label: "Schiphol Gate", pickupPct: 3 },
  ];
}

export function comingUpForProperty(locationId: string): ComingUpOpportunity[] {
  const seed = NORTHSTAR_HOTELS.locations.find((l) => l.id === locationId);
  if (!seed) return [];
  const events = materialEventsForCity(seed.city).filter(
    (e) => e.startDate >= "2026-09-25",
  );
  return events.slice(0, 2).map((e) => {
    const isCanalAde =
      locationId === "loc_canal_house" && e.eventId === "evt_ade_2026";
    const behind = isCanalAde ? -7 : -2 + (hash(locationId + e.eventId) % 5);
    return {
      eventId: e.eventId,
      locationId,
      name: e.name,
      daysAway: Math.max(
        1,
        Math.round(
          (new Date(e.startDate).getTime() -
            new Date("2026-09-24").getTime()) /
            86_400_000,
        ),
      ),
      historicalPickupPct: isCanalAde ? 13 : 6 + (hash(e.eventId) % 8),
      historicalAdrEuro: isCanalAde ? 24 : 10 + (hash(e.eventId) % 12),
      historicalDirectPp: isCanalAde ? 4 : 1 + (hash(locationId) % 3),
      paceVsCurvePct: behind,
      needsDecision: isCanalAde || behind <= -5,
      futures: isCanalAde
        ? [
            "Hold rate",
            "Increase rate",
            "Protect direct inventory",
            "Release OTA",
            "Create package",
            "No action",
          ]
        : ["Watch pace", "No action"],
      decisionHint: isCanalAde
        ? "HOLD PREMIUM ROOMS DIRECT 48H — 11 premium remaining · direct pickup firm"
        : null,
      relatedDecisionId: isCanalAde ? "dec_hotel_ota" : null,
    };
  });
}

export function getHotelDemandBundle(locationId: string): HotelDemandBundle | null {
  const seed = NORTHSTAR_HOTELS.locations.find((l) => l.id === locationId);
  if (!seed) return null;
  const fingerprint = buildFingerprint(locationId, seed.archetype, "occupancy");
  const peaks = peaksFor(seed.archetype, seed.name);
  const peakExplanation =
    locationId === "loc_canal_house"
      ? "W24–W27 peak drivers (estimated): city events +7.2pp occ · leisure season +5.4pp · weekend ADR +€18 · direct mix +4pp. Uncertainty band ±2.1pp."
      : null;

  const events = materialEventsForCity(seed.city);
  const attributions = events
    .map((e) => attributionFor(locationId, e.eventId))
    .filter((a): a is EventAttribution => a != null);

  const monthlyHeat = fingerprint.map((m) => {
    const delta = m.currentYear - m.baseline;
    return {
      month: m.month,
      label: m.label,
      tone: (delta > 1.5 ? "ahead" : delta < -1.5 ? "behind" : "flat") as
        | "ahead"
        | "behind"
        | "flat",
      magnitude: Math.min(1, Math.abs(delta) / 8),
    };
  });

  return {
    locationId,
    fingerprint,
    fingerprintMetric: "occupancy",
    peaks,
    peakExplanation,
    dna: dnaFor(locationId, seed.archetype, seed.name),
    attributions,
    comingUp: comingUpForProperty(locationId),
    monthlyHeat,
  };
}

export function hotelScorecardFromEconomics(input: {
  locationId: string;
  label: string;
  revenue: number;
  contribution: number;
  contributionPlan: number;
  occupancyPct: number;
  adr: number;
  revpar: number;
  directSharePct: number;
  otaSharePct: number;
  channelFees: number;
  cancellations: number;
  readinessMisses: number;
  verified: number;
  exposure: number;
}): HotelPropertyScorecard {
  const h = hash(input.locationId);
  const netRevpar = Math.round(input.revpar * (1 - input.channelFees / Math.max(1, input.revenue)));
  const vsPlan =
    ((input.contribution - input.contributionPlan) /
      Math.max(1, input.contributionPlan)) *
    100;
  return {
    locationId: input.locationId,
    label: input.label,
    roomRevenue: input.revenue,
    occupancyPct: input.occupancyPct,
    adr: input.adr,
    revpar: input.revpar,
    netRevpar,
    contribution: input.contribution,
    contributionPlan: input.contributionPlan,
    directSharePct: input.directSharePct,
    otaSharePct: input.otaSharePct,
    channelFees: input.channelFees,
    cancellations: input.cancellations,
    noShows: 1 + (h % 3),
    upsellRevenue: Math.round(800 + (h % 12) * 120),
    ancillaryRevenue: Math.round(2200 + (h % 10) * 180),
    housekeepingCost: Math.round(input.revenue * 0.045),
    readinessMisses: input.readinessMisses,
    verified: input.verified,
    exposure: input.exposure,
    vsExpectationPct: Math.round(vsPlan * 10) / 10,
  };
}

export function metricValue(
  card: HotelPropertyScorecard,
  metric: HotelScoreMetric,
): number {
  switch (metric) {
    case "contribution":
      return card.contribution;
    case "revpar":
      return card.revpar;
    case "adr":
      return card.adr;
    case "occupancy":
      return card.occupancyPct;
    case "net_revpar":
      return card.netRevpar;
    case "direct_share":
      return card.directSharePct;
    case "revenue":
      return card.roomRevenue;
  }
}

export function hotelEstateTransfers(): {
  id: string;
  sourceLocationId: string;
  targetLocationId: string;
  pattern: string;
  context: string;
  observedEffect: string;
  expectedMonthlyEuro: number;
  confidence: number;
  verdict: TransferVerdict;
  compareHref: string;
}[] {
  return [
    {
      id: "xfer_canal_direct_hold",
      sourceLocationId: "loc_canal_house",
      targetLocationId: "loc_ams_harbour",
      pattern:
        "During comparable city-event weeks, protect premium inventory direct 48h longer",
      context: "Similar pickup profile · boutique/city format · high event sensitivity",
      observedEffect: "+€22 net ADR without occupancy loss",
      expectedMonthlyEuro: 3840,
      confidence: 0.74,
      verdict: "TRANSFERABLE",
      compareHref: "/app/compare?from=loc_canal_house&to=loc_ams_harbour",
    },
    {
      id: "xfer_hk_wave",
      sourceLocationId: "loc_canal_house",
      targetLocationId: "loc_schiphol_gate",
      pattern: "Housekeeping reprioritization before clustered arrivals",
      context: "Arrival wave shape similar · different guest mix (airport)",
      observedEffect: "Readiness misses reduced after reassignment",
      expectedMonthlyEuro: 960,
      confidence: 0.58,
      verdict: "CONTEXT_DEPENDENT",
      compareHref: "/app/compare?from=loc_canal_house&to=loc_schiphol_gate",
    },
  ];
}

/** Pace report — Canal flagship uses live SSOT; others get scaled stub. */
export function bookingPaceForProperty(locationId: string) {
  if (locationId === "loc_canal_house") return getHotelBookingPaceReport();
  const base = getHotelBookingPaceReport();
  const h = hash(locationId);
  return {
    ...base,
    arrivalLabel: `Next peak arrival · ${NORTHSTAR_HOTELS.locations.find((l) => l.id === locationId)?.name ?? "Property"}`,
    sellableRooms: 60 + (h % 40),
    deltaPctVsComparable: 4 + (h % 8),
    radrRead: "Pickup tracking comparable weeks. Watch event lead-time window.",
    markers: [],
  };
}
