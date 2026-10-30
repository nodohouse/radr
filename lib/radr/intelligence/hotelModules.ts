/**
 * Hotel Intelligence module data — Canal House / Northstar Hotels.
 * Feeds MetricModule renderers; no restaurant lexicon.
 */

import { canalHouseLive, canalChannelEconomics } from "@/lib/radr/demo/hotelDataset";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";
import type { MetricModuleReport } from "@/lib/radr/intelligence/opsModules";

export function getHotelRoomReadinessModule(): MetricModuleReport {
  const live = canalHouseLive();
  return {
    moduleId: "room_readiness",
    primaryLabel: "Rooms ready",
    primaryValue: `${live.ready}/${live.arrivals}`,
    comparisonLabel: "At risk arrivals",
    comparisonValue: String(live.atRiskArrivals),
    radrRead: live.heroSub,
    judgment: "DECISION_FORMED",
    state: "DECISION_FORMED",
    relatedDecisionId: HOTEL_DECISION_IDS.readiness,
    comparisonType: "vs arrivals",
    periodLabel: live.clockLabel,
  };
}

export function getHotelPickupModule(): MetricModuleReport {
  const live = canalHouseLive();
  const trade = live.context.find((c) =>
    /trade|pickup/i.test(c.label + c.detail),
  );
  return {
    moduleId: "hotel_pickup",
    primaryLabel: "Expected occupancy tonight",
    primaryValue: `${live.expectedOccTonight}%`,
    comparisonLabel: "Pickup context",
    comparisonValue: trade?.detail ?? "+11% trade show",
    radrRead:
      "Pickup firm. Readiness — not demand — is the material Decision tonight.",
    judgment: "WATCHING",
    state: "WATCHING",
    relatedDecisionId: null,
    comparisonType: "vs pace",
    periodLabel: "Tonight",
  };
}

export function getHotelOccAdrRevparModule(): MetricModuleReport {
  const live = canalHouseLive();
  const occ = live.pulse.find((p) => p.id === "occ");
  const adr = live.pulse.find((p) => p.id === "adr");
  const revpar = live.pulse.find((p) => p.id === "revpar");
  return {
    moduleId: "hotel_occ_adr_revpar",
    primaryLabel: "RevPAR",
    primaryValue: revpar?.value ?? "€221",
    comparisonLabel: `Occ ${occ?.value ?? "89%"} · ADR ${adr?.value ?? "€248"}`,
    comparisonValue: revpar?.delta ?? "+3.1%",
    radrRead:
      "Occupancy and ADR within plan. No rate action — protect readiness and channel mix.",
    judgment: "NO_ACTION",
    state: "WITHIN_EXPECTATIONS",
    relatedDecisionId: null,
    comparisonType: "vs budget",
    periodLabel: "Today",
  };
}

export function getHotelHkModule(): MetricModuleReport {
  const live = canalHouseLive();
  const hk = live.pulse.find((p) => p.id === "hk");
  return {
    moduleId: "hk_productivity",
    primaryLabel: "HK productivity",
    primaryValue: hk?.value ?? "13.2/shift",
    comparisonLabel: "Floor 3",
    comparisonValue: "Behind wave",
    radrRead: `${live.nowNext.decision} · ${live.nowNext.driver}`,
    judgment: "DECISION_FORMED",
    state: "DECISION_FORMED",
    relatedDecisionId: HOTEL_DECISION_IDS.hkStaff,
    comparisonType: "vs expected",
    periodLabel: live.nowNext.nextWindow,
  };
}

export function getHotelChannelModule(): MetricModuleReport {
  const channels = canalChannelEconomics();
  const direct = channels.find((c) => c.channel === "direct");
  const ota = channels
    .filter((c) => c.channel === "booking_com" || c.channel === "expedia")
    .reduce((s, c) => s + c.pickupTonight, 0);
  return {
    moduleId: "hotel_channel_mix",
    primaryLabel: "Direct share",
    primaryValue: "62%",
    comparisonLabel: "OTA pickup tonight",
    comparisonValue: String(ota),
    radrRead: direct
      ? `Direct net ADR €${direct.netAdr} · hold window active on Canal View`
      : "Hold premium rooms direct 72h.",
    judgment: "DECISION_FORMED",
    state: "DECISION_FORMED",
    relatedDecisionId: HOTEL_DECISION_IDS.channel,
    comparisonType: "vs OTA",
    periodLabel: "Tonight",
  };
}

export function getHotelCancelModule(): MetricModuleReport {
  return {
    moduleId: "hotel_cancellation",
    primaryLabel: "Same-day cancels",
    primaryValue: "3",
    comparisonLabel: "Recoverable nights",
    comparisonValue: "2 · €620 gate",
    radrRead:
      "Cancellation released inventory. Recover or release — do not leave orphan nights unpriced.",
    judgment: "WATCHING",
    state: "WATCHING",
    relatedDecisionId: HOTEL_DECISION_IDS.cancelRecover,
    comparisonType: "vs released",
    periodLabel: "Today",
  };
}
