/**
 * Hotel Morning Brief — curated daily operating brief (Canal House).
 * Snapshot clock 10:37 · readiness values are forecast for 14:20.
 */

import { hotelVerifiedExamples, hotelVerifiedTotal } from "@/lib/radr/demo/hotelDecisions";
import { HOTEL_READINESS_CANON } from "@/lib/product/decisionsWorkspace/hotelCrossLinks";
import {
  hotelGmNeedsYou,
  hotelGmPerformance,
  hotelGmPickup,
  hotelGmChannelMix,
} from "@/lib/radr/product/hotelGmDashboardCanon";

export const HOTEL_MORNING_BRIEF_META = {
  dashboardId: "dash_hotel_morning_brief",
  title: "Morning Brief",
  propertyLabel: "Mercer House · New York",
  personaLabel: "Hotel General Manager",
  firstName: "Elena",
  periodLabel: "Today",
  /** Brief generation / last-updated clock — not Live 14:20. */
  briefClock: "10:37",
  /** Canonical readiness state the brief forecasts toward. */
  readinessForecastClock: "14:20",
} as const;

export function morningBriefPerformance() {
  return hotelGmPerformance();
}

export function morningBriefReadiness() {
  const c = HOTEL_READINESS_CANON;
  const toPrepare = c.due - c.ready;
  return {
    ready: c.ready,
    due: c.due,
    toPrepare,
    atRisk: c.atRisk,
    readyPct: Math.round((c.ready / c.due) * 100),
    exposureEuro: c.exposureEuro,
    /** Explicit temporal label — values are forecast, not 10:37 observed. */
    forecastLabel: `Forecast for ${HOTEL_MORNING_BRIEF_META.readinessForecastClock}`,
    primaryCaption: "expected ready",
    riskLine: `${c.atRisk} of ${toPrepare} arrivals at risk`,
    insight: `Occ 89% · RevPAR €221 · ${c.ready}/${c.due} ready · €${c.exposureEuro.toLocaleString("en-GB")} exposed · Floor 3 behind.`,
    openHref: "/app/service",
    decisionId: c.decisionId,
  };
}

export function morningBriefPickup() {
  return hotelGmPickup();
}

/** Fictional Amsterdam event — never Columbiahalle / Berlin. */
export function morningBriefEvent() {
  return {
    headline: "Tonight · Local events as demand drivers with historical association.",
    vsBaselinePct: 12,
    venueLine: "IJ LIVE HALL · CONCERT · 20:00",
    explanation:
      "Historically associated with +12% same-day pickup and +21% arrivals after 21:00. Modeled demand effect.",
    strip: "Local events feed · DEMO · MEDIUM confidence · historically associated",
    openHref: "/app/intelligence?module=event_context&stay=1",
    confidence: "MEDIUM" as const,
  };
}

export function morningBriefNeedsYou() {
  return hotelGmNeedsYou();
}

export function morningBriefVerifiedValue() {
  const total = hotelVerifiedTotal();
  const examples = hotelVerifiedExamples();
  const labels = [
    "1 Sep",
    "5 Sep",
    "10 Sep",
    "15 Sep",
    "20 Sep",
    "25 Sep",
    "30 Sep",
  ];
  const weights = [0.12, 0.22, 0.34, 0.48, 0.62, 0.82, 1];
  return {
    totalEuro: total,
    vsPriorPct: 28,
    sealedCount: examples.length,
    points: labels.map((label, i) => ({
      label,
      cumulative: Math.round(total * weights[i]!),
      decisionId: examples[Math.min(i, examples.length - 1)]?.decisionId ?? null,
      title: examples[Math.min(i, examples.length - 1)]?.label ?? "Verified",
    })),
    openHref: "/app/value",
  };
}

/** Re-export unused channel helper for builder registry consistency. */
export { hotelGmChannelMix };
