/**
 * Data / vertical coherence — same org + scope + clock ⇒ same numbers.
 */
import { describe, expect, it } from "vitest";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { getDecisionRecord, getDecisionStoreSnapshot } from "@/lib/radr/decision/store";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import {
  CANON_BY_ID,
  CANON_MARGIN_COKE,
  CANON_OTA,
} from "@/lib/radr/decision/demo/canonical";
import { buildOtaDecisionRecord } from "@/lib/radr/decision/demos/ota";
import { buildPeakDecisionRecord } from "@/lib/radr/decision/demos/peak";
import {
  filterRecordsByVertical,
  decisionBelongsToVertical,
} from "@/lib/radr/demo/verticalScope";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import {
  HOTEL_LIVE_SCENARIO,
  LIVE_SCENARIO,
  scenarioClockLabel,
} from "@/lib/radr/demoClock";
import { hotelNeedsYouDecisions } from "@/lib/radr/demo/hotelDecisions";
import { PEAK_SERVICE_CLOCK } from "@/lib/radr/decision/demos/peakClock";

describe("vertical coherence", () => {
  it("Northstar Restaurants locations exclude Canal House hotel + Chiado", () => {
    const ids = NORTHSTAR_RESTAURANTS.locations.map((l) => l.id);
    expect(ids).not.toContain("loc_canal_house");
    expect(ids).not.toContain("loc_chiado");
    expect(ids).not.toContain("loc_ams_canal_fb");
    expect(ids).toContain("loc_berlin_mitte");
  });

  it("Northstar Hotels locations exclude Berlin restaurant", () => {
    const ids = NORTHSTAR_HOTELS.locations.map((l) => l.id);
    expect(ids).toContain("loc_canal_house");
    expect(ids).not.toContain("loc_berlin_mitte");
  });

  it("restaurant filter excludes hotel decisions", () => {
    const all = Object.values(getDecisionStoreSnapshot().records);
    const rest = filterRecordsByVertical(all, "restaurant");
    expect(rest.every((r) => decisionBelongsToVertical(r.id, "restaurant"))).toBe(
      true,
    );
    expect(rest.some((r) => r.id === DECISION_IDS.hotelReadiness)).toBe(false);
    expect(rest.some((r) => r.id === DECISION_IDS.ota)).toBe(false);
    expect(rest.some((r) => r.id === DECISION_IDS.peak)).toBe(true);
    expect(rest.some((r) => r.id === DECISION_IDS.marginCoke)).toBe(true);
  });

  it("hotel filter excludes restaurant peak / margin", () => {
    const all = Object.values(getDecisionStoreSnapshot().records);
    const hotel = filterRecordsByVertical(all, "hotel");
    expect(hotel.some((r) => r.id === DECISION_IDS.peak)).toBe(false);
    expect(hotel.some((r) => r.id === DECISION_IDS.marginCoke)).toBe(false);
    expect(hotel.some((r) => r.id === DECISION_IDS.hotelReadiness)).toBe(true);
    expect(hotel.some((r) => r.id === DECISION_IDS.ota)).toBe(true);
  });
});

describe("D-2201 OTA futures + org isolation", () => {
  it("futuresFromCanon(CANON_OTA) has no Peak Seat/Wait/Throttle labels", () => {
    const futures = futuresFromCanon(CANON_OTA);
    const labels = futures.scenarios.map((s) => s.label);
    expect(labels.some((l) => /^Seat now$/i.test(l))).toBe(false);
    expect(labels.some((l) => /Wait 12/i.test(l))).toBe(false);
    expect(labels.some((l) => /Throttle delivery/i.test(l))).toBe(false);
  });

  it("restaurant vs hotel decision seeds carry correct org ids", () => {
    expect(buildPeakDecisionRecord().organizationId).toBe(
      NORTHSTAR_RESTAURANTS.id,
    );
    expect(buildOtaDecisionRecord().organizationId).toBe(NORTHSTAR_HOTELS.id);
  });
});

describe("D-7501 futures ownership", () => {
  it("margin futures are category rebalance options — not Peak Seat/Wait/Throttle", () => {
    const futures = futuresFromCanon(CANON_MARGIN_COKE);
    const labels = futures.scenarios.map((s) => s.label);
    expect(labels.some((l) => /category rebalance/i.test(l))).toBe(true);
    expect(labels.some((l) => /absorb/i.test(l))).toBe(true);
    expect(labels.some((l) => /raise coke/i.test(l))).toBe(true);
    expect(labels.some((l) => /^Seat now$/i.test(l))).toBe(false);
    expect(labels.some((l) => /Wait 12/i.test(l))).toBe(false);
    expect(labels.some((l) => /Throttle delivery/i.test(l))).toBe(false);
  });

  it("display id is D-7501", () => {
    expect(displayDecisionId(DECISION_IDS.marginCoke)).toBe("D-7501");
    expect(CANON_BY_ID[DECISION_IDS.marginCoke]?.displayId).toBe("D-7501");
  });
});

describe("D-H-9201 readiness vs D-2201 channel", () => {
  it("readiness display id and evidence", () => {
    expect(displayDecisionId(DECISION_IDS.hotelReadiness)).toBe("D-H-9201");
    const r = getDecisionRecord(DECISION_IDS.hotelReadiness)!;
    expect(r.contextLine).toMatch(/42 arrivals/);
    expect(r.contextLine).toMatch(/31 ready/);
    expect(r.contextLine).toMatch(/7 at risk/);
    expect(r.recommendationHeadline).toMatch(/REASSIGN 2 HOUSEKEEPERS/i);
    const optionTitles = r.options.map((o) => o.title);
    expect(optionTitles.some((t) => /reassign 2 housekeepers/i.test(t))).toBe(
      true,
    );
    expect(optionTitles.some((t) => /keep current allocation/i.test(t))).toBe(
      true,
    );
  });

  it("channel D-2201 remains separate Needs You seed", () => {
    const needs = hotelNeedsYouDecisions();
    const readiness = needs.find((d) => d.id === DECISION_IDS.hotelReadiness);
    const channel = needs.find((d) => d.id === DECISION_IDS.ota);
    expect(readiness?.displayId).toBe("D-H-9201");
    expect(channel?.displayId).toBe("D-2201");
    expect(readiness?.family).toBe("ROOM_READINESS");
    expect(channel?.family).toBe("CHANNEL_ALLOCATION");
  });

  it("CANAL_HOTEL_TODAY readiness attention links to D-H-9201 not D-2201", async () => {
    const { CANAL_HOTEL_TODAY } = await import(
      "@/lib/radr/product/verticalDay"
    );
    expect(CANAL_HOTEL_TODAY.attention[0]?.href).toContain(
      DECISION_IDS.hotelReadiness,
    );
    expect(CANAL_HOTEL_TODAY.attention[0]?.href).not.toContain(
      DECISION_IDS.ota,
    );
    const beat = CANAL_HOTEL_TODAY.timeline.find((t) => t.decisionId);
    expect(beat?.decisionId).toBe(DECISION_IDS.hotelReadiness);
    expect(beat?.decisionLabel).not.toMatch(/Hold direct|D-2201/i);
    expect(CANAL_HOTEL_TODAY.radrLine).not.toMatch(/channel hold/i);
  });
});

describe("DemoClock SSOT", () => {
  it("restaurant clock is 19:48 · resume 20:00", () => {
    expect(scenarioClockLabel("restaurant")).toBe("19:48");
    expect(LIVE_SCENARIO.resumeClock).toBe("20:00");
    expect(PEAK_SERVICE_CLOCK.resumeLabel).toBe("20:00");
    expect(PEAK_SERVICE_CLOCK.nowLabel).toBe(LIVE_SCENARIO.clockLabel);
  });

  it("hotel clock is 14:20 · 42/31/7", () => {
    expect(scenarioClockLabel("hotel")).toBe("14:20");
    expect(HOTEL_LIVE_SCENARIO.arrivalsToday).toBe(42);
    expect(HOTEL_LIVE_SCENARIO.roomsReady).toBe(31);
    expect(HOTEL_LIVE_SCENARIO.roomsAtRisk).toBe(7);
  });
});

describe("RoleScope COO portfolio", () => {
  it("Marcus sees all restaurant locations, not only Berlin", async () => {
    const { resolveRoleScope } = await import("@/lib/radr/product/roleScopeService");
    const { getBusinessPulse } = await import("@/lib/radr/product/businessPulse");
    const scope = resolveRoleScope("coo", "restaurant");
    expect(scope.allowedLocationIds.length).toBeGreaterThanOrEqual(5);
    expect(scope.allowedLocationIds).toContain("loc_berlin_mitte");
    expect(scope.allowedLocationIds).not.toContain("loc_canal_house");
    const pulse = getBusinessPulse("coo", "restaurant");
    expect(pulse.locations.length).toBe(scope.allowedLocationIds.length);
    expect(pulse.locations.every((l) => !l.locationId.includes("canal"))).toBe(true);
  });

  it("Sarah GM is Berlin-only", async () => {
    const { resolveRoleScope } = await import("@/lib/radr/product/roleScopeService");
    const scope = resolveRoleScope("gm", "restaurant");
    expect(scope.allowedLocationIds).toEqual(["loc_berlin_mitte"]);
  });
});
