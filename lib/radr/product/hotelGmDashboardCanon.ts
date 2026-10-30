/**
 * Hotel GM Dashboard — canonical presentation data.
 * Numbers must reconcile with Control Center · Live · Operations · Value.
 */

import { canalHouseLive, canalChannelEconomics } from "@/lib/radr/demo/hotelDataset";
import { hotelVerifiedExamples, hotelVerifiedTotal } from "@/lib/radr/demo/hotelDecisions";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { HOTEL_READINESS_CANON } from "@/lib/product/decisionsWorkspace/hotelCrossLinks";
import { getHotelBookingPaceReport } from "@/lib/radr/demo/hotelBookingPace";

export const HOTEL_GM_DASH_META = {
  dashboardId: "dash_hotel_gm",
  title: "Hotel General Manager",
  propertyLabel: "Mercer House · New York",
  personaLabel: "GM",
  periodLabel: "Today",
  clockLabel: "14:20",
  lastUpdatedClock: "10:37",
} as const;

export function hotelGmPerformance() {
  const live = canalHouseLive();
  return {
    occupancyPct: live.occupancyPct,
    /** Presentation deltas — Hotel GM dashboard mockup SSOT vs budget. */
    occupancyDelta: "+3.1% vs budget",
    adrEuro: 248,
    adrDelta: "+2.8% vs budget",
    revparEuro: 221,
    revparDelta: "+3.1% vs budget",
    statusLabel: "Within expectations",
    intel:
      "Occupancy and ADR within plan. No rate action — protect readiness and channel mix.",
    openHref: "/app/intelligence?module=hotel_occ_adr_revpar&stay=1",
  };
}

export function hotelGmReadiness() {
  const c = HOTEL_READINESS_CANON;
  const toPrepare = c.due - c.ready;
  const readyPct = Math.round((c.ready / c.due) * 100);
  return {
    ready: c.ready,
    due: c.due,
    toPrepare,
    atRisk: c.atRisk,
    readyPct,
    exposureEuro: c.exposureEuro,
    occPct: 89,
    revparEuro: 221,
    floorNote: "Floor 3 behind",
    insight: `Occ 89% · RevPAR €221 · ${c.ready}/${c.due} ready · €${c.exposureEuro.toLocaleString("en-GB")} exposed · Floor 3 behind.`,
    openHref: "/app/service",
    decisionId: c.decisionId,
  };
}

/** Pickup for dashboard — D-2201 only (HK readiness is not a pickup driver). */
export function hotelGmPickup() {
  const report = getHotelBookingPaceReport();
  return {
    ...report,
    markers: report.markers.filter((m) => m.displayId === "D-2201"),
    headline: "Pickup & occupancy",
    supporting: "Tonight occupancy expectation vs pace and events.",
    openHref: "/app/intelligence?module=hotel_pickup&stay=1",
  };
}

export function hotelGmChannelMix() {
  const channels = canalChannelEconomics().filter((c) =>
    ["direct", "booking_com", "expedia", "corporate"].includes(c.channel),
  );
  const totalRn = channels.reduce((s, c) => s + c.pickupTonight, 0);
  return {
    headline: "Distribution mix",
    supporting: "Direct vs OTA net contribution and hold windows.",
    decisionChip: "D-2201 · hold direct 72h",
    decisionId: HOTEL_DECISION_IDS.channel,
    /** Bar length = room-night share of featured channels tonight. */
    barMetric: "room_night_share" as const,
    totalRn,
    rows: channels.map((c) => ({
      ...c,
      rnSharePct: totalRn ? Math.round((c.pickupTonight / totalRn) * 100) : 0,
    })),
    openHref: "/app/intelligence?module=hotel_channel_mix&stay=1",
  };
}

export type HotelGmNeed = {
  id: string;
  decisionId: string;
  displayId: string;
  title: string;
  context: string;
  priority: "high" | "medium";
  href: string;
};

export function hotelGmNeedsYou(): HotelGmNeed[] {
  return [
    {
      id: "n1",
      decisionId: HOTEL_DECISION_IDS.channel,
      displayId: "D-2201",
      title: "OTA mix drift on sold-out shoulder",
      context: "Mercer House · New York · D-2201",
      priority: "high",
      href: `/app/decisions/${HOTEL_DECISION_IDS.channel}`,
    },
    {
      id: "n2",
      decisionId: DECISION_IDS.hotelReadiness,
      displayId: "D-H-9201",
      title: "Reassign 2 housekeepers · check-in wave",
      context: "Mercer House · New York · D-H-9201",
      priority: "high",
      href: `/app/decisions/${DECISION_IDS.hotelReadiness}`,
    },
    {
      id: "n3",
      decisionId: HOTEL_DECISION_IDS.cancelRecover,
      displayId: "D-2412",
      title: "Recover cancelled Canal View · 20h out",
      context: "Mercer House · New York · D-2412",
      priority: "medium",
      href: `/app/decisions/${HOTEL_DECISION_IDS.cancelRecover}`,
    },
    {
      id: "n4",
      decisionId: HOTEL_DECISION_IDS.hkStaff,
      displayId: "D-2408",
      title: "Close 14:00–15:00 housekeeping gap",
      context: "Mercer House · New York · D-2408",
      priority: "medium",
      href: `/app/decisions/${HOTEL_DECISION_IDS.hkStaff}`,
    },
  ];
}

export function hotelGmVerifiedValue() {
  const total = hotelVerifiedTotal();
  const examples = hotelVerifiedExamples();
  /** Deterministic MTD cumulative curve ending at canonical total. */
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
  const points = labels.map((label, i) => ({
    label,
    cumulative: Math.round(total * weights[i]!),
    decisionId: examples[Math.min(i, examples.length - 1)]?.decisionId ?? null,
  }));
  return {
    totalEuro: total,
    vsPriorPct: 28,
    sealedCount: examples.length,
    points,
    openHref: "/app/value",
  };
}
