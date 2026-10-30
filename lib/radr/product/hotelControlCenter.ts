/**
 * Hotel Control Center view model — GM Canal House flagship.
 * Deterministic. Aligns with canalHouseLive + houseReadiness + hotelDecisions.
 */

import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import {
  hotelNeedsYouDecisions,
  hotelVerifiedExamples,
  hotelVerifiedTotal,
  HOTEL_DECISION_IDS,
} from "@/lib/radr/demo/hotelDecisions";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";

export type OperatingPulseEvent = {
  id: string;
  time: string;
  type: string;
  title: string;
  detail: string;
  t: number; // 0–1 along day axis
  severity: "pos" | "watch" | "neg" | "now";
  decisionId?: string;
};

export type HotelCcPropertyRow = {
  id: string;
  name: string;
  city: string;
  occupancy: number;
  occupancyDelta: string;
  adr: number;
  adrDelta: string;
  revpar: number;
  pickup7d: number;
  pickupExpected: number;
  readiness: string;
  atRisk: number;
  exposure: number;
  status: string;
  state: "ok" | "watch" | "pressure";
};

export type HotelCcReviewItem = {
  id: string;
  family: string;
  title: string;
  detail: string;
  exposureLabel: string;
  tone: "neg" | "watch";
  href?: string;
  decisionId?: string;
};

export type HotelControlCenterViewModel = {
  locationId: string;
  locationLabel: string;
  city: string;
  clockLabel: string;
  greeting: string;
  heroPrimary: string;
  heroAdverse: string;
  summary: string;
  exposureEuro: number;
  kpis: {
    id: string;
    label: string;
    value: string;
    delta: string;
    tone: "pos" | "neg" | "watch" | "neutral";
    spark: number[];
  }[];
  pulse: OperatingPulseEvent[];
  pulseSeries: { x: number; actual: number; expected: number }[];
  activeDecision: {
    id: string;
    verb: string;
    where: string;
    why: string;
    expectedImpact: string;
    confidence: number;
  } | null;
  reviewItems: HotelCcReviewItem[];
  verified: {
    totalEuro: number;
    decisions: number;
    positive: number;
    avgImpactLabel: string;
    bars: number[];
  };
  properties: HotelCcPropertyRow[];
  heroImage: string;
};

function greeting(clock: string): string {
  const h = Number(clock.split(":")[0] ?? 14);
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const PROPERTY_METRIC_SEED: Omit<HotelCcPropertyRow, "name" | "city">[] = [
  {
    id: "loc_canal_house",
    occupancy: 89,
    occupancyDelta: "+2.4%",
    adr: 248,
    adrDelta: "−1.8%",
    revpar: 221,
    pickup7d: 11,
    pickupExpected: 6,
    readiness: "31/42",
    atRisk: 7,
    exposure: 1840,
    status: "Readiness gap",
    state: "pressure",
  },
  {
    id: "loc_ams_harbour",
    occupancy: 76,
    occupancyDelta: "+0.8%",
    adr: 210,
    adrDelta: "+1.2%",
    revpar: 160,
    pickup7d: 8,
    pickupExpected: 7,
    readiness: "28/38",
    atRisk: 2,
    exposure: 320,
    status: "Healthy",
    state: "ok",
  },
  {
    id: "loc_lisbon_alfama",
    occupancy: 81,
    occupancyDelta: "−0.6%",
    adr: 178,
    adrDelta: "+2.0%",
    revpar: 144,
    pickup7d: 5,
    pickupExpected: 6,
    readiness: "22/28",
    atRisk: 1,
    exposure: 180,
    status: "Watch",
    state: "watch",
  },
  {
    id: "loc_berlin_mitte_hotel",
    occupancy: 84,
    occupancyDelta: "+1.1%",
    adr: 212,
    adrDelta: "−0.9%",
    revpar: 178,
    pickup7d: 7,
    pickupExpected: 6,
    readiness: "OK",
    atRisk: 0,
    exposure: 0,
    status: "On pace",
    state: "ok",
  },
  {
    id: "loc_paris_opera",
    occupancy: 88,
    occupancyDelta: "+2.0%",
    adr: 268,
    adrDelta: "+0.5%",
    revpar: 236,
    pickup7d: 9,
    pickupExpected: 7,
    readiness: "OK",
    atRisk: 0,
    exposure: 140,
    status: "Healthy",
    state: "ok",
  },
  {
    id: "loc_london_clerkenwell",
    occupancy: 79,
    occupancyDelta: "−1.2%",
    adr: 255,
    adrDelta: "+1.4%",
    revpar: 201,
    pickup7d: 4,
    pickupExpected: 6,
    readiness: "24/30",
    atRisk: 3,
    exposure: 780,
    status: "Cancel recovery",
    state: "watch",
  },
  {
    id: "loc_munich_airport",
    occupancy: 91,
    occupancyDelta: "+0.3%",
    adr: 148,
    adrDelta: "−0.4%",
    revpar: 135,
    pickup7d: 6,
    pickupExpected: 5,
    readiness: "OK",
    atRisk: 0,
    exposure: 0,
    status: "On track",
    state: "ok",
  },
  {
    id: "loc_sydney_surry_hotel",
    occupancy: 86,
    occupancyDelta: "+1.5%",
    adr: 229,
    adrDelta: "+0.9%",
    revpar: 197,
    pickup7d: 8,
    pickupExpected: 7,
    readiness: "OK",
    atRisk: 0,
    exposure: 90,
    status: "Healthy",
    state: "ok",
  },
  {
    id: "loc_schiphol_gate",
    occupancy: 93,
    occupancyDelta: "+3.1%",
    adr: 265,
    adrDelta: "+0.4%",
    revpar: 246,
    pickup7d: 15,
    pickupExpected: 9,
    readiness: "36/40",
    atRisk: 0,
    exposure: 0,
    status: "On track",
    state: "ok",
  },
  {
    id: "loc_cape_town_waterfront",
    occupancy: 82,
    occupancyDelta: "+0.6%",
    adr: 195,
    adrDelta: "+1.1%",
    revpar: 160,
    pickup7d: 6,
    pickupExpected: 5,
    readiness: "OK",
    atRisk: 1,
    exposure: 210,
    status: "Watch",
    state: "watch",
  },
];

function propertyRowsFromEstate(): HotelCcPropertyRow[] {
  return PROPERTY_METRIC_SEED.map((row) => {
    const loc =
      NORTHSTAR_HOTELS.locations.find((l) => l.id === row.id) ??
      NORTHSTAR_HOTELS.locations[0]!;
    return {
      ...row,
      name: loc.name,
      city: loc.city,
    };
  });
}

const PROPERTY_ROWS: HotelCcPropertyRow[] = propertyRowsFromEstate();

/** Deterministic pulse curve 08:00–22:00 (rooms in progress). */
function pulseSeries(): { x: number; actual: number; expected: number }[] {
  const pts: { x: number; actual: number; expected: number }[] = [];
  for (let i = 0; i <= 28; i++) {
    const x = i / 28;
    const expected = 18 + Math.sin(x * Math.PI) * 22 + x * 8;
    const actual =
      expected +
      (x > 0.35 && x < 0.55 ? 10 : 0) -
      (x > 0.7 ? 4 : 0) +
      (x > 0.48 && x < 0.62 ? 6 : 0);
    pts.push({ x, actual, expected });
  }
  return pts;
}

export function hotelControlCenterViewModel(
  locationId = "loc_canal_house",
): HotelControlCenterViewModel {
  const live = canalHouseLive();
  const needs = hotelNeedsYouDecisions();
  const active = needs.find((d) => d.id === HOTEL_DECISION_IDS.readiness) ?? needs[0]!;
  const verified = hotelVerifiedExamples();
  const verifiedTotal = hotelVerifiedTotal();
  const loc =
    NORTHSTAR_HOTELS.locations.find((l) => l.id === locationId) ??
    NORTHSTAR_HOTELS.locations[0]!;

  return {
    locationId: loc.id,
    locationLabel: loc.displayName,
    city: loc.city,
    clockLabel: HOTEL_LIVE_SCENARIO.clockLabel,
    greeting: greeting(HOTEL_LIVE_SCENARIO.clockLabel),
    heroPrimary: "Occupancy is strong.",
    heroAdverse: "Room contribution isn’t.",
    summary:
      "89% occupied · 31/42 ready · $1,840 exposed · Floor 3 behind the arrival wave.",
    exposureEuro: live.exposureEuro,
    kpis: [
      {
        id: "occ",
        label: "Occupancy",
        value: "89%",
        delta: "+2.4% vs plan",
        tone: "pos",
        spark: [62, 64, 68, 70, 72, 78, 82, 85, 87, 89],
      },
      {
        id: "adr",
        label: "ADR",
        value: "€248",
        delta: "−1.8% vs plan",
        tone: "neg",
        spark: [255, 252, 250, 249, 251, 248, 247, 249, 248, 248],
      },
      {
        id: "ready",
        label: "Readiness",
        value: "31/42",
        delta: "7 at risk",
        tone: "neg",
        spark: [8, 12, 16, 20, 22, 26, 28, 29, 30, 31],
      },
      {
        id: "pickup",
        label: "7D pickup",
        value: "+11",
        delta: "vs expected +6",
        tone: "pos",
        spark: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      },
    ],
    pulse: [
      {
        id: "dep",
        time: "12:00",
        type: "DEPARTURES_PEAK",
        title: "Departures peak",
        detail: `${live.departuresDue} due`,
        t: 0.28,
        severity: "pos",
      },
      {
        id: "hk",
        time: "14:00",
        type: "CLEANING_PRESSURE",
        title: "Cleaning pressure",
        detail: `${live.cleaning} in HK`,
        t: 0.42,
        severity: "watch",
      },
      {
        id: "now",
        time: live.clockLabel,
        type: "CURRENT",
        title: "NOW",
        detail: `${live.ready}/${live.arrivals} ready`,
        t: 0.48,
        severity: "now",
        decisionId: active.id,
      },
      {
        id: "wave",
        time: "15:30",
        type: "CHECK_IN_WAVE",
        title: "Check-in wave",
        detail: `${live.atRiskArrivals} at risk`,
        t: 0.62,
        severity: "neg",
        decisionId: active.id,
      },
    ],
    pulseSeries: pulseSeries(),
    activeDecision: {
      id: active.id,
      verb: active.verb,
      where: `${active.locationLabel} · ${active.deadlineLabel}`,
      why: active.why,
      expectedImpact: `+${active.economicFormatted.replace(/^\+/, "")}`,
      confidence: 81,
    },
    reviewItems: [
      {
        id: "rev_ready",
        family: "ROOM READINESS",
        title: "Mercer House",
        detail: "7 rooms at risk for 15:30 check-in",
        exposureLabel: "€1,840 · 40m",
        tone: "neg",
        decisionId: HOTEL_DECISION_IDS.readiness,
        href: "/app/service",
      },
      {
        id: "rev_arrivals",
        family: "ARRIVALS / NO-SHOWS",
        title: "Mercer House",
        detail: "2 potential no-shows · 3 waitlisted",
        exposureLabel: "Tonight",
        tone: "watch",
        href: "/app/service",
      },
      {
        id: "rev_guest",
        family: "GUEST RECOVERY",
        title: "Mercer House",
        detail: "4 guests require follow-up",
        exposureLabel: "Priority",
        tone: "neg",
        href: "/app/guests",
      },
    ],
    verified: {
      totalEuro: verifiedTotal,
      decisions: verified.length,
      positive: Math.max(1, verified.length - 1),
      avgImpactLabel: `€${(verifiedTotal / verified.length / 1000).toFixed(1)}k`,
      bars: [38, 52, 47, 61, 55, 70, 58, 74, 63, 71, 68, 80],
    },
    properties: PROPERTY_ROWS,
    heroImage: "/control-center/hotel/hero.jpg",
  };
}
