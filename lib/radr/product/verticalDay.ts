/**
 * Vertical day fixtures — deterministic, reconciles within vertical.
 * Hotel and serviced apartments NEVER reuse restaurant covers / food metrics.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import { verticalForLocationId } from "@/lib/radr/demo/verticalScope";
import { orgLocationLabel } from "@/lib/radr/product/portfolioEconomics";

export type TimelineBeat = {
  at: string;
  label: string;
  detail: string;
  kind: "now" | "demand" | "pressure" | "ops" | "decision" | "release";
  decisionId?: string;
  decisionLabel?: string;
};

export type VerticalMetric = {
  label: string;
  value: string;
  compare?: string;
  tone?: "ok" | "watch" | "risk" | "verified";
};

export type VerticalDaySurface = {
  locationId: string;
  vertical: "restaurant" | "hotel" | "apartment";
  title: string;
  subtitle: string;
  heroMetrics: VerticalMetric[];
  timeline: TimelineBeat[];
  radrState: "No action" | "Watching" | "Decision formed" | "Handling";
  radrLine: string;
  attention: { title: string; detail: string; href: string }[];
};

/** Berlin — live dinner command surface. */
export const BERLIN_LIVE_DAY: VerticalDaySurface = {
  locationId: DEMO_LOCATIONS.berlin.id,
  vertical: "restaurant",
  title: "DINNER · 19:48 · CLOSES 23:00",
  subtitle: "Ahead +3.2% · €18.4k realized · €26.8k expected close",
  heroMetrics: [
    { label: "Revenue now", value: "€18.4k", compare: "+3.2% vs expected", tone: "ok" },
    { label: "Expected close", value: "€26.8k", compare: "Modeled" },
    { label: "Kitchen", value: "92%", compare: "→ 94% band", tone: "risk" },
    { label: "Peak", value: "20:10–20:35", compare: "Pressure window", tone: "watch" },
  ],
  timeline: [
    { at: "19:48", label: "NOW", detail: "Kitchen 92% · 2 walk-ins", kind: "now" },
    {
      at: "20:00",
      label: "18 covers arriving",
      detail: "Reservation wave",
      kind: "demand",
    },
    {
      at: "20:12",
      label: "Delivery wave",
      detail: "Associated with station load",
      kind: "pressure",
    },
    {
      at: "20:18",
      label: "Kitchen → 94%",
      detail: "Intervention band",
      kind: "pressure",
      decisionId: DECISION_IDS.peak,
      decisionLabel: `${displayDecisionId(DECISION_IDS.peak)} · Wait 12 min`,
    },
    {
      at: "20:25",
      label: "Second-turn window",
      detail: "Hold protects turns",
      kind: "ops",
    },
    {
      at: "20:38",
      label: "Pressure releases",
      detail: "If hold applied",
      kind: "release",
    },
  ],
  radrState: "Decision formed",
  radrLine: "Wait 12 minutes · $620 expected incremental vs seat-now",
  attention: [
    {
      title: "Wait 12 minutes",
      detail: "D-1911 · Service capacity",
      href: `/app/decisions/${DECISION_IDS.peak}`,
    },
  ],
};

export const CANAL_HOTEL_TODAY: VerticalDaySurface = {
  locationId: DEMO_LOCATIONS.canal.id,
  vertical: "hotel",
  title: "CHECK-IN WAVE · 14:20",
  subtitle: "89% occupancy · 31/42 rooms ready · 7 at risk · ADR €248 · RevPAR €221",
  heroMetrics: [
    { label: "Occupancy", value: "89%", compare: "vs 86% pace", tone: "ok" },
    { label: "Rooms ready", value: "31 / 42", compare: "7 at risk", tone: "watch" },
    { label: "ADR", value: "€248", compare: "+€6 vs budget", tone: "ok" },
    { label: "RevPAR", value: "€221", compare: "+3.1% vs plan", tone: "ok" },
  ],
  timeline: [
    { at: "07:00", label: "Departures begin", detail: "38 check-outs", kind: "ops" },
    { at: "10:00", label: "Housekeeping peak", detail: "Floor 3–4", kind: "pressure" },
    {
      at: "12:00",
      label: "Early arrival risk",
      detail: "6 early · 2 rooms not ready",
      kind: "demand",
    },
    {
      at: "14:00",
      label: "Check-in wave",
      detail: "7 rooms risk missing readiness",
      kind: "pressure",
      decisionId: DECISION_IDS.hotelReadiness,
      decisionLabel: `${displayDecisionId(DECISION_IDS.hotelReadiness)} · Reassign 2 HK`,
    },
    { at: "17:30", label: "VIP arrival", detail: "Suite 501", kind: "demand" },
    {
      at: "18:00",
      label: "Rooms-at-risk window",
      detail: "Guest impact if unresolved",
      kind: "ops",
    },
  ],
  radrState: "Decision formed",
  radrLine: "7 rooms risk missing check-in readiness · housekeeping reassignment prepared",
  attention: [
    {
      title: "7 rooms readiness risk",
      detail: "Guest impact · escalate HK · VIP protected",
      href: `/app/decisions/${DECISION_IDS.hotelReadiness}`,
    },
  ],
};

export const CHIADO_APARTMENT_TODAY: VerticalDaySurface = {
  locationId: DEMO_LOCATIONS.chiado.id,
  vertical: "apartment",
  title: "TURNOVER WINDOW · 11:40",
  subtitle: "11 departed · 6 cleaning · 2 behind SLA · 9 arrivals",
  heroMetrics: [
    { label: "Departed", value: "11", compare: "Check-outs" },
    { label: "Cleaning", value: "6", compare: "2 behind SLA", tone: "watch" },
    { label: "Arrivals", value: "9", compare: "3 same-day" },
    { label: "Gap nights", value: "3", compare: "€118 net gate", tone: "risk" },
  ],
  timeline: [
    { at: "09:00", label: "Departures", detail: "11 check-outs", kind: "ops" },
    {
      at: "10:30",
      label: "Cleaning wave",
      detail: "6 units · 2 behind",
      kind: "pressure",
    },
    {
      at: "13:00",
      label: "Access failure",
      detail: "Unit 2B · guest waiting",
      kind: "ops",
    },
    {
      at: "15:00",
      label: "Arrival window",
      detail: "9 arrivals · 3 same-day",
      kind: "demand",
    },
    {
      at: "16:30",
      label: "Gap-night window",
      detail: "3 orphan nights · net gate",
      kind: "pressure",
      decisionId: DECISION_IDS.orphan,
      decisionLabel: `${displayDecisionId(DECISION_IDS.orphan)} · Direct release`,
    },
    {
      at: "18:00",
      label: "Last-minute booking",
      detail: "Channel opportunity",
      kind: "release",
    },
  ],
  radrState: "Decision formed",
  radrLine: "Orphan-night net contribution gate · direct release prepared",
  attention: [
    {
      title: "3 gap nights",
      detail: "Perishable revenue · D-3104",
      href: `/app/decisions/${DECISION_IDS.orphan}`,
    },
  ],
};

export function verticalDayFor(locationId: string): VerticalDaySurface | null {
  if (locationId === DEMO_LOCATIONS.berlin.id) return BERLIN_LIVE_DAY;
  if (locationId === DEMO_LOCATIONS.canal.id) return CANAL_HOTEL_TODAY;
  if (locationId === DEMO_LOCATIONS.chiado.id) return CHIADO_APARTMENT_TODAY;

  const v = verticalForLocationId(locationId);
  if (!v) return null;
  const label = orgLocationLabel(locationId);
  const short = label.split("·")[0]?.trim() ?? label;

  if (v === "hotel") {
    const inOrg = NORTHSTAR_HOTELS.locations.some((l) => l.id === locationId);
    if (!inOrg) return null;
    return {
      locationId,
      vertical: "hotel",
      title: `${short.toUpperCase()} · TODAY`,
      subtitle: "Occupancy · ADR · readiness · distribution",
      heroMetrics: [
        { label: "Occupancy", value: "82%", compare: "vs 79% pace", tone: "ok" },
        { label: "ADR", value: "€168", compare: "MTD" },
        { label: "RevPAR", value: "€138", compare: "+€4 vs plan", tone: "ok" },
        { label: "Readiness", value: "On track", compare: "Arrivals window" },
      ],
      timeline: [
        { at: "06:00", label: "OPEN", detail: "House status set", kind: "ops" },
        { at: "10:00", label: "NOW", detail: "Departures clearing", kind: "now" },
        { at: "14:00", label: "PRESSURE", detail: "Arrival wave", kind: "pressure" },
        { at: "16:00", label: "RECOVERY", detail: "Rooms turned", kind: "release" },
        { at: "22:00", label: "CLOSE", detail: "Night audit", kind: "ops" },
      ],
      radrState: "Watching",
      radrLine: "No material Decision at this property right now.",
      attention: [],
    };
  }

  const inOrg = NORTHSTAR_RESTAURANTS.locations.some((l) => l.id === locationId);
  if (!inOrg) return null;
  return {
    locationId,
    vertical: "restaurant",
    title: `${short.toUpperCase()} · SERVICE DAY`,
    subtitle: "Open → now → pressure → recovery → close",
    heroMetrics: [
      { label: "Revenue pace", value: "On plan", compare: "MTD modeled", tone: "ok" },
      { label: "Kitchen", value: "Stable", compare: "No band breach" },
      { label: "Covers", value: "Tracking", compare: "vs forecast" },
      { label: "RADR", value: "Watching", compare: "Quiet" },
    ],
    timeline: [
      { at: "11:00", label: "OPEN", detail: "Lunch prep complete", kind: "ops" },
      { at: "13:20", label: "NOW", detail: "Lunch peak clearing", kind: "now" },
      { at: "19:30", label: "PRESSURE", detail: "Dinner demand band", kind: "pressure" },
      { at: "21:15", label: "RECOVERY", detail: "Station load eases", kind: "release" },
      { at: "23:00", label: "CLOSE", detail: "Wrap + settle", kind: "ops" },
    ],
    radrState: "Watching",
    radrLine: "No material intervention required at this location tonight.",
    attention: [],
  };
}

/** Operating outliers — metric abnormalities, NOT Needs You Decisions. */
export type OperatingOutlier = {
  id: string;
  metric: string;
  delta: string;
  locationLabel: string;
  state: "Watching" | "Decision formed";
  why: string;
  href: string;
};

export const GROUP_OPERATING_OUTLIERS: OperatingOutlier[] = [
  {
    id: "out_berlin_contrib",
    metric: "Contribution",
    delta: "−3.1%",
    locationLabel: "Soho · New York",
    state: "Decision formed",
    why: "Revenue +4.2% · delivery fees and refunds eating the night",
    href: "/app/locations/loc_berlin_mitte",
  },
  {
    id: "out_refund",
    metric: "Refund rate",
    delta: "+1.4pp",
    locationLabel: "West Hollywood · Los Angeles",
    state: "Watching",
    why: "61% linked to delivery lateness Fri 19:00–21:00",
    href: "/app/locations/loc_berlin_kreuzberg",
  },
  {
    id: "out_hamburg_wine",
    metric: "Contribution",
    delta: "+8.1%",
    locationLabel: "Roma Norte · Mexico City",
    state: "Watching",
    why: "Wine attach +9.4pp · service still in band",
    href: "/app/locations/loc_hamburg_hafen",
  },
  {
    id: "out_frankfurt_tuna",
    metric: "Tuna cost",
    delta: "+19% / 90D",
    locationLabel: "Jardins · São Paulo",
    state: "Decision formed",
    why: "€8.4k annualized exposure · procurement Futures open",
    href: "/app/intelligence?module=cost_movers",
  },
];
