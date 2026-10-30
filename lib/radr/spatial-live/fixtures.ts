/**
 * Deterministic RADR Live demo fixtures — stable for QA screenshots.
 * SIMULATED LIVE · not claimed as production telemetry.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

const STAMP = "2026-10-05T17:48:00+02:00";

function sev(s: LiveSeverity): LiveSeverity {
  return s;
}

/** Estate nodes — Northstar Restaurants (8). */
export function restaurantEstateEntities(): LiveEntity[] {
  const layouts: Array<{
    id: string;
    x: number;
    y: number;
    severity: LiveSeverity;
    revenue: string;
    revDelta: string;
    contrib: string;
    contribDelta: string;
    exposure: number;
    status: string;
    driver: string;
    radrSees: string;
    decisionIds: string[];
    expectedValue?: string;
  }> = [
    /* Catalog MTD pin values — PDF 04 Estate View */
    {
      id: "loc_berlin_mitte",
      x: 42,
      y: 38,
      severity: "healthy",
      revenue: "€198.4K",
      revDelta: "+12.4%",
      contrib: "€61.2K",
      contribDelta: "+8.1%",
      exposure: 620,
      status: "Healthy",
      driver: "Approve menu price update for Soho · New York",
      radrSees:
        "Dinner demand up +18% this week · labor within band · guest spend rising on wine.",
      decisionIds: [DECISION_IDS.peak, DECISION_IDS.labor],
      expectedValue: "+€6,400",
    },
    {
      id: "loc_berlin_kreuzberg",
      x: 48,
      y: 48,
      severity: "watch",
      revenue: "€142.8K",
      revDelta: "−2.1%",
      contrib: "€38.4K",
      contribDelta: "−1.4%",
      exposure: 1840,
      status: "Needs attention",
      driver: "Friday delivery lateness",
      radrSees: "Refund lift concentrated Fri 19:00–21:00 on delivery.",
      decisionIds: [DECISION_IDS.guestVoice],
    },
    {
      id: "loc_hamburg_hafen",
      x: 38,
      y: 18,
      severity: "healthy",
      revenue: "€168.2K",
      revDelta: "+6.4%",
      contrib: "€52.1K",
      contribDelta: "+1.8%",
      exposure: 110,
      status: "Healthy",
      driver: "Wine attach holding",
      radrSees: "Premium attach without service-time penalty.",
      decisionIds: [],
    },
    {
      id: "loc_frankfurt_westend",
      x: 52,
      y: 44,
      severity: "healthy",
      revenue: "€154.6K",
      revDelta: "+3.0%",
      contrib: "€48.2K",
      contribDelta: "+0.6%",
      exposure: 80,
      status: "Healthy",
      driver: "Cover mix balanced",
      radrSees: "No material intervention required tonight.",
      decisionIds: [],
    },
    {
      id: "loc_munich_altstadt",
      x: 58,
      y: 62,
      severity: "intervene",
      revenue: "€161.4K",
      revDelta: "−4.2%",
      contrib: "€41.8K",
      contribDelta: "−3.9%",
      exposure: 12400,
      status: "Intervene",
      driver: "Supplier variance",
      radrSees: "Invoice vs contract gap developing on beverage lines.",
      decisionIds: [DECISION_IDS.supplier],
    },
    {
      id: "loc_koln_ehrenfeld",
      x: 34,
      y: 46,
      severity: "watch",
      revenue: "€128.9K",
      revDelta: "−1.8%",
      contrib: "€36.4K",
      contribDelta: "−1.1%",
      exposure: 6400,
      status: "Needs attention",
      driver: "Labor within watch band",
      radrSees: "Contribution soft vs plan · RADR watching labor mix.",
      decisionIds: [],
    },
    {
      id: "loc_dusseldorf_medienhafen",
      x: 28,
      y: 42,
      severity: "healthy",
      revenue: "€136.2K",
      revDelta: "+2.8%",
      contrib: "€41.1K",
      contribDelta: "+0.4%",
      exposure: 95,
      status: "Healthy",
      driver: "Channel mix stable",
      radrSees: "No Decision required.",
      decisionIds: [],
    },
    {
      id: "loc_stuttgart_mitte",
      x: 54,
      y: 58,
      severity: "intervene",
      revenue: "€118.4K",
      revDelta: "−6.1%",
      contrib: "€29.8K",
      contribDelta: "−4.2%",
      exposure: 18600,
      status: "Intervene",
      driver: "Walk-in soft vs forecast",
      radrSees: "Terrace demand soft · recovery window still open.",
      decisionIds: [DECISION_IDS.created],
    },
  ];

  return layouts.map((row) => {
    const seed = NORTHSTAR_RESTAURANTS.locations.find((l) => l.id === row.id)!;
    return {
      id: row.id,
      type: "location" as const,
      vertical: "restaurant" as const,
      parentId: "estate_restaurants",
      label: seed.displayName,
      shortLabel: seed.city,
      position: { x: row.x, y: row.y },
      size: { w: 10, h: 8 },
      status: row.status,
      severity: sev(row.severity),
      metrics: [
        {
          id: "revenue",
          label: "Revenue",
          value: row.revenue,
          delta: row.revDelta,
          tone: row.revDelta.startsWith("−") || row.revDelta.startsWith("-")
            ? "neg"
            : "pos",
        },
        {
          id: "contrib",
          label: "Contribution",
          value: row.contrib,
          delta: row.contribDelta,
          tone:
            row.contribDelta.startsWith("−") || row.contribDelta.startsWith("-")
              ? "neg"
              : "pos",
        },
        {
          id: "exposure",
          label: "Exposure",
          value: `€${row.exposure.toLocaleString("en-GB")}`,
          tone: row.exposure > 500 ? "watch" : "neutral",
        },
      ],
      decisionIds: row.decisionIds,
      exposureEuro: row.exposure,
      confidence: row.severity === "intervene" ? 0.82 : 0.74,
      radrSees: row.radrSees,
      driver: row.driver,
      expectedValue: row.expectedValue,
      lastUpdated: STAMP,
      lenses: ["financial", "operations"],
    };
  });
}

export function restaurantVenueZones(locationId = "loc_berlin_mitte"): LiveEntity[] {
  return [
    {
      id: `${locationId}__zone_main`,
      type: "zone",
      vertical: "restaurant",
      parentId: locationId,
      label: "Main Dining",
      position: { x: 28, y: 42 },
      size: { w: 28, h: 22 },
      status: "HIGH PRESSURE",
      severity: "intervene",
      metrics: [
        { id: "occ", label: "Occupied", value: "82%", tone: "watch" },
        { id: "turn", label: "Turn risk", value: "3 tables", tone: "watch" },
      ],
      decisionIds: [DECISION_IDS.peak],
      exposureEuro: 620,
      confidence: 0.86,
      radrSees: "Main dining saturating · hold window protects kitchen recovery.",
      driver: "Covers vs kitchen load",
      expectedValue: "+€620",
      lastUpdated: STAMP,
      lenses: ["service", "operations"],
    },
    {
      id: `${locationId}__zone_bar`,
      type: "zone",
      vertical: "restaurant",
      parentId: locationId,
      label: "Bar",
      position: { x: 62, y: 36 },
      size: { w: 16, h: 14 },
      status: "RECOVERABLE",
      severity: "watch",
      metrics: [
        { id: "occ", label: "Occupied", value: "63%", tone: "neutral" },
        { id: "rec", label: "Recoverable", value: "2 tables", tone: "pos" },
      ],
      decisionIds: [DECISION_IDS.tableRecover],
      exposureEuro: 180,
      radrSees: "Two bar seats recoverable before 20:10 without kitchen load.",
      driver: "Turn stage",
      expectedValue: "+€180",
      lastUpdated: STAMP,
      lenses: ["service"],
    },
    {
      id: `${locationId}__zone_terrace`,
      type: "zone",
      vertical: "restaurant",
      parentId: locationId,
      label: "Terrace",
      position: { x: 72, y: 58 },
      size: { w: 18, h: 16 },
      status: "OPPORTUNITY",
      severity: "watch",
      metrics: [
        { id: "occ", label: "Occupied", value: "41%", tone: "neutral" },
        { id: "opp", label: "Opportunity", value: "€460", tone: "pos" },
      ],
      decisionIds: [DECISION_IDS.created],
      exposureEuro: 460,
      radrSees: "Terrace under-utilized vs weather-cleared forecast.",
      driver: "Weather cleared",
      expectedValue: "+€460",
      lastUpdated: STAMP,
      lenses: ["service", "financial"],
    },
    {
      id: `${locationId}__zone_kitchen`,
      type: "zone",
      vertical: "restaurant",
      parentId: locationId,
      label: "Kitchen",
      position: { x: 18, y: 68 },
      size: { w: 22, h: 18 },
      status: "HIGH PRESSURE",
      severity: "intervene",
      metrics: [
        { id: "hot", label: "Hot line", value: "91%", tone: "neg" },
        { id: "cold", label: "Cold station", value: "76%", tone: "watch" },
        { id: "prep", label: "Prep gaps", value: "2", tone: "watch" },
        { id: "stock", label: "Stock risk", value: "1 item", tone: "watch" },
      ],
      decisionIds: [DECISION_IDS.peak, DECISION_IDS.labor],
      exposureEuro: 240,
      confidence: 0.88,
      radrSees:
        "Delivery demand is adding 18% to hot-line load.",
      driver: "Hold delivery expansion for 8 minutes",
      expectedValue: "+€240",
      lastUpdated: STAMP,
      lenses: ["operations", "service"],
    },
    {
      id: `${locationId}__zone_delivery`,
      type: "zone",
      vertical: "restaurant",
      parentId: locationId,
      label: "Delivery",
      position: { x: 48, y: 72 },
      size: { w: 14, h: 12 },
      status: "ABOVE TARGET",
      severity: "watch",
      metrics: [
        { id: "dem", label: "Demand share", value: "34%", tone: "watch" },
        { id: "tgt", label: "Target", value: "22%", tone: "neutral" },
        { id: "press", label: "Pressure", value: "Kitchen +18%", tone: "neg" },
        { id: "exp", label: "Expected exposure", value: "€420", tone: "watch" },
      ],
      decisionIds: [DECISION_IDS.peak],
      exposureEuro: 420,
      confidence: 0.82,
      radrSees:
        "Delivery demand is consuming capacity needed for dine-in peak.",
      driver: "Throttle delivery intake for 12 minutes",
      expectedValue: "+€280",
      lastUpdated: STAMP,
      lenses: ["operations", "financial"],
    },
  ];
}

export function hotelEstateEntities(): LiveEntity[] {
  const rows: Array<{
    id: string;
    x: number;
    y: number;
    severity: LiveSeverity;
    rev: string;
    occ: string;
    adr: string;
    revpar: string;
    exposure: number;
    status: string;
    driver: string;
    radrSees: string;
    decisionIds: string[];
  }> = [
    {
      id: "loc_canal_house",
      x: 36,
      y: 40,
      severity: "intervene",
      rev: "€42,800",
      occ: "88%",
      adr: "€248",
      revpar: "€218",
      exposure: 1840,
      status: "HK PRESSURE",
      driver: "Floor 7 readiness lag",
      radrSees:
        "11 priority rooms at risk before check-in · reassign attendants from Floors 3–4.",
      decisionIds: [DECISION_IDS.hotelReadiness, HOTEL_DECISION_IDS.hkStaff],
    },
    {
      id: "loc_ams_harbour",
      x: 44,
      y: 32,
      severity: "healthy",
      rev: "€31,200",
      occ: "79%",
      adr: "€198",
      revpar: "€156",
      exposure: 220,
      status: "ON PLAN",
      driver: "Pickup steady",
      radrSees: "No material property intervention.",
      decisionIds: [],
    },
    {
      id: "loc_schiphol_gate",
      x: 28,
      y: 52,
      severity: "watch",
      rev: "€28,400",
      occ: "91%",
      adr: "€162",
      revpar: "€147",
      exposure: 640,
      status: "OTA MIX",
      driver: "Channel cost",
      radrSees: "OTA share above target on shoulder nights.",
      decisionIds: [DECISION_IDS.ota],
    },
    {
      id: "loc_lisbon_alfama",
      x: 22,
      y: 68,
      severity: "healthy",
      rev: "€19,600",
      occ: "74%",
      adr: "€176",
      revpar: "€130",
      exposure: 90,
      status: "HEALTHY",
      driver: "Direct share",
      radrSees: "Quiet · within plan.",
      decisionIds: [],
    },
    {
      id: "loc_berlin_mitte_hotel",
      x: 58,
      y: 40,
      severity: "watch",
      rev: "€36,100",
      occ: "84%",
      adr: "€212",
      revpar: "€178",
      exposure: 510,
      status: "LABOR",
      driver: "FO overtime",
      radrSees: "Front desk wave pressure 14:40–15:20.",
      decisionIds: [],
    },
    {
      id: "loc_paris_opera",
      x: 48,
      y: 58,
      severity: "healthy",
      rev: "€44,200",
      occ: "81%",
      adr: "€268",
      revpar: "€217",
      exposure: 140,
      status: "HEALTHY",
      driver: "Group pace",
      radrSees: "No Decision required.",
      decisionIds: [],
    },
    {
      id: "loc_london_clerkenwell",
      x: 32,
      y: 28,
      severity: "watch",
      rev: "€39,500",
      occ: "77%",
      adr: "€255",
      revpar: "€196",
      exposure: 780,
      status: "CANCEL RECOVERY",
      driver: "Same-day cancel",
      radrSees: "Recoverable nights still open on Canal-comparable inventory.",
      decisionIds: [HOTEL_DECISION_IDS.cancelRecover],
    },
    {
      id: "loc_munich_airport",
      x: 64,
      y: 52,
      severity: "healthy",
      rev: "€26,800",
      occ: "86%",
      adr: "€148",
      revpar: "€127",
      exposure: 70,
      status: "HEALTHY",
      driver: "Corp base",
      radrSees: "Stable airport demand.",
      decisionIds: [],
    },
  ];

  const SHORT: Record<string, string> = {
    loc_canal_house: "Canal House",
    loc_ams_harbour: "Harbour",
    loc_schiphol_gate: "Schiphol",
    loc_lisbon_alfama: "Lisbon",
    loc_berlin_mitte_hotel: "Berlin",
    loc_paris_opera: "Paris",
    loc_london_clerkenwell: "London",
    loc_munich_airport: "Munich",
  };

  return rows.map((row) => {
    const seed = NORTHSTAR_HOTELS.locations.find((l) => l.id === row.id)!;
    return {
      id: row.id,
      type: "property" as const,
      vertical: "hotel" as const,
      parentId: "estate_hotels",
      label: seed.displayName,
      shortLabel: SHORT[row.id] ?? seed.city,
      position: { x: row.x, y: row.y },
      size: { w: 11, h: 9 },
      status: row.status,
      severity: sev(row.severity),
      metrics: [
        { id: "rev", label: "Revenue", value: row.rev, tone: "pos" },
        { id: "occ", label: "Occupancy", value: row.occ, tone: "neutral" },
        { id: "adr", label: "ADR", value: row.adr, tone: "neutral" },
        { id: "revpar", label: "RevPAR", value: row.revpar, tone: "neutral" },
        {
          id: "exposure",
          label: "Exposure",
          value: `€${row.exposure.toLocaleString("en-GB")}`,
          tone: row.exposure > 500 ? "watch" : "neutral",
        },
      ],
      decisionIds: row.decisionIds,
      exposureEuro: row.exposure,
      confidence: 0.8,
      radrSees: row.radrSees,
      driver: row.driver,
      expectedValue:
        row.severity === "intervene" ? "11 rooms ready before 15:00" : undefined,
      lastUpdated: STAMP,
      lenses: ["financial", "operations", "rooms"],
    };
  });
}

export function hotelPropertyFloors(propertyId = "loc_canal_house"): LiveEntity[] {
  return [
    {
      id: `${propertyId}__floor_8`,
      type: "floor",
      vertical: "hotel",
      parentId: propertyId,
      label: "Floor 8",
      position: { x: 50, y: 22 },
      size: { w: 40, h: 10 },
      status: "14 READY · 2 DELAYED",
      severity: "watch",
      metrics: [
        { id: "ready", label: "Ready", value: "14", tone: "pos" },
        { id: "delay", label: "Delayed", value: "2", tone: "watch" },
      ],
      decisionIds: [],
      radrSees: "Two delayed inspects · still within wave.",
      lastUpdated: STAMP,
      lenses: ["rooms", "operations"],
    },
    {
      id: `${propertyId}__floor_7`,
      type: "floor",
      vertical: "hotel",
      parentId: propertyId,
      label: "Floor 7",
      position: { x: 50, y: 38 },
      size: { w: 40, h: 12 },
      status: "HOUSEKEEPING PRESSURE",
      severity: "intervene",
      metrics: [
        { id: "priority", label: "Priority", value: "6", tone: "neg" },
        { id: "risk", label: "At risk", value: "11", tone: "watch" },
      ],
      decisionIds: [DECISION_IDS.hotelReadiness, HOTEL_DECISION_IDS.hkStaff],
      exposureEuro: 1840,
      confidence: 0.87,
      radrSees:
        "Move two attendants from Floors 3–4 to Floor 7 for 46 minutes. Expected: 11 priority rooms ready before 15:00.",
      driver: "Arrival wave +35 min",
      expectedValue: "11 rooms ready before 15:00",
      lastUpdated: STAMP,
      lenses: ["rooms", "operations"],
    },
    {
      id: `${propertyId}__floor_6`,
      type: "floor",
      vertical: "hotel",
      parentId: propertyId,
      label: "Floor 6",
      position: { x: 50, y: 54 },
      size: { w: 40, h: 10 },
      status: "HEALTHY",
      severity: "healthy",
      metrics: [{ id: "ready", label: "Ready", value: "18", tone: "pos" }],
      decisionIds: [],
      radrSees: "Floor clear of material risk.",
      lastUpdated: STAMP,
      lenses: ["rooms"],
    },
    {
      id: `${propertyId}__lobby`,
      type: "department",
      vertical: "hotel",
      parentId: propertyId,
      label: "Lobby",
      position: { x: 28, y: 72 },
      size: { w: 18, h: 12 },
      status: "ARRIVAL WAVE +35m",
      severity: "watch",
      metrics: [
        { id: "wave", label: "Wave", value: "+35 min", tone: "watch" },
      ],
      decisionIds: [DECISION_IDS.hotelReadiness],
      radrSees: "Lobby pressure tracks Floor 7 readiness.",
      lastUpdated: STAMP,
      lenses: ["operations", "service"],
    },
    {
      id: `${propertyId}__front_desk`,
      type: "department",
      vertical: "hotel",
      parentId: propertyId,
      label: "Front Desk",
      position: { x: 52, y: 72 },
      size: { w: 20, h: 12 },
      status: "HIGH PRESSURE 14:40–15:20",
      severity: "watch",
      metrics: [
        { id: "queue", label: "Queue risk", value: "High", tone: "watch" },
      ],
      decisionIds: [],
      radrSees: "Desk load follows readiness clearance.",
      lastUpdated: STAMP,
      lenses: ["operations", "service"],
    },
  ];
}

export function hotelFloorRooms(
  floorId = "loc_canal_house__floor_7",
): LiveEntity[] {
  const rooms: Array<{
    n: string;
    x: number;
    y: number;
    status: string;
    severity: LiveSeverity;
  }> = [
    { n: "702", x: 18, y: 40, status: "READY", severity: "healthy" },
    { n: "704", x: 32, y: 40, status: "INSPECT", severity: "watch" },
    { n: "706", x: 46, y: 40, status: "DIRTY", severity: "intervene" },
    { n: "708", x: 60, y: 40, status: "MAINTENANCE", severity: "critical" },
    { n: "710", x: 74, y: 40, status: "PRIORITY ARRIVAL", severity: "intervene" },
    { n: "712", x: 18, y: 58, status: "CLEAN", severity: "healthy" },
    { n: "714", x: 32, y: 58, status: "DIRTY", severity: "watch" },
    { n: "716", x: 46, y: 58, status: "READY", severity: "healthy" },
    { n: "718", x: 60, y: 58, status: "INSPECT", severity: "watch" },
    { n: "720", x: 74, y: 58, status: "PRIORITY ARRIVAL", severity: "intervene" },
  ];
  return rooms.map((r) => ({
    id: `${floorId}__room_${r.n}`,
    type: "room" as const,
    vertical: "hotel" as const,
    parentId: floorId,
    label: `Room ${r.n}`,
    shortLabel: r.n,
    position: { x: r.x, y: r.y },
    size: { w: 10, h: 10 },
    status: r.status,
    severity: sev(r.severity),
    metrics: [{ id: "state", label: "State", value: r.status }],
    decisionIds:
      r.severity === "intervene" || r.severity === "critical"
        ? [DECISION_IDS.hotelReadiness]
        : [],
    radrSees:
      r.severity === "intervene"
        ? "Priority arrival depends on attendant reassignment Decision."
        : "Within wave plan.",
    lastUpdated: STAMP,
    lenses: ["rooms"],
  }));
}
