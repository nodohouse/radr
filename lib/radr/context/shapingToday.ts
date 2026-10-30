/**
 * What's shaping today — one Context module for Live.
 * Community-first market philosophy: understand your market, don't copy neighbors.
 */

import type { ContextSignal, ContextSourceClass } from "./types";
import { contextForLocation } from "./types";

export type ShapingSignalCard = {
  id: string;
  label: string;
  impact: string;
  sourceClass: ContextSourceClass;
  family: ContextSignal["family"];
};

export type ShapingToday = {
  locationId: string;
  title: string;
  interpretation: string;
  peakPressure: string | null;
  signals: ShapingSignalCard[];
  /** Community-first market note — never "copy competitor price" */
  marketNote: string | null;
  reservationsRemaining: number | null;
};

function impactLine(s: ContextSignal): string {
  if (s.expectedDemandImpactPct != null) {
    const sign = s.expectedDemandImpactPct >= 0 ? "+" : "";
    return `${sign}${s.expectedDemandImpactPct}% demand`;
  }
  if (s.expectedOperationalImpact) return s.expectedOperationalImpact;
  if (s.expectedRevenueImpactEuro != null) {
    const sign = s.expectedRevenueImpactEuro >= 0 ? "+" : "−";
    return `${sign}€${Math.abs(s.expectedRevenueImpactEuro)}`;
  }
  return s.sourceClass;
}

/** Berlin dinner — material context, single interpretation. */
export function berlinShapingToday(): ShapingToday {
  return {
    locationId: "loc_berlin_mitte",
    title: "Tonight's context",
    interpretation:
      "Highest pressure expected 20:10–20:35 — inbound covers, delivery spike, and rain push indoor load.",
    peakPressure: "20:10–20:35",
    reservationsRemaining: 38,
    signals: [
      {
        id: "ctx_concert_berlin",
        label: "Concert nearby",
        impact: "+12% demand",
        sourceClass: "OFFICIAL",
        family: "EVENT",
      },
      {
        id: "ctx_rain_berlin",
        label: "Rain from 20:10",
        impact: "−8 terrace covers",
        sourceClass: "OFFICIAL",
        family: "WEATHER",
      },
      {
        id: "ctx_salary_berlin",
        label: "Pay-cycle pattern",
        impact: "+6% dinner demand",
        sourceClass: "LEARNED",
        family: "INCOME_CYCLE",
      },
      {
        id: "ctx_delivery",
        label: "Delivery",
        impact: "+31% vs comparable Friday",
        sourceClass: "CONFIGURED",
        family: "LOCAL_DEMAND",
      },
    ],
    marketNote:
      "New 300-seat venue opened 600m away. Lunch-demand uncertainty widened — watching conversion 6 weeks. No action recommended. Understand your market. Don't copy your neighbor.",
  };
}

export function shapingTodayForLocation(locationId: string): ShapingToday {
  if (
    locationId === "loc_berlin_mitte" ||
    locationId === "loc_ber" ||
    locationId === "all"
  ) {
    return berlinShapingToday();
  }

  const signals = contextForLocation(locationId);
  if (locationId === "loc_canal_house") {
    return {
      locationId,
      title: "Today's context",
      interpretation:
        "Check-in wave 14:00–16:00 · 7 rooms at risk creates arrival friction.",
      peakPressure: "14:00–16:00",
      reservationsRemaining: null,
      signals: signals.map((s) => ({
        id: s.id,
        label: s.timelineLabel,
        impact: impactLine(s),
        sourceClass: s.sourceClass,
        family: s.family,
      })),
      marketNote: null,
    };
  }

  if (locationId === "loc_chiado_collective") {
    return {
      locationId,
      title: "Today's context",
      interpretation:
        "Turnover window active · cleaning behind SLA on 6 units · gap-night exposure if not cleared.",
      peakPressure: "12:00–15:00",
      reservationsRemaining: null,
      signals: signals.map((s) => ({
        id: s.id,
        label: s.timelineLabel,
        impact: impactLine(s),
        sourceClass: s.sourceClass,
        family: s.family,
      })),
      marketNote: null,
    };
  }

  return {
    locationId,
    title: "Today's context",
    interpretation: "No material external context flagged.",
    peakPressure: null,
    reservationsRemaining: null,
    signals: [],
    marketNote: null,
  };
}
