import { describe, expect, it } from "vitest";
import {
  getRestaurantDayPace,
  getGroupMtdPace,
  getGroupDayPace,
} from "@/lib/radr/product/revenuePacing";
import {
  getCombinedTonightDemand,
  getCancellationIntel,
} from "@/lib/radr/product/externalSignals";
import { modulesForIntelligenceCategory } from "@/lib/radr/intelligence/categoryModules";
import { classifyAskIntent } from "@/lib/ai/intents";
import { composeAskAnswer } from "@/lib/ai/compose";

describe("revenue pacing", () => {
  it("restaurant day pace is ahead with expected close", () => {
    const p = getRestaurantDayPace();
    expect(p.revenueActualNow).toBeGreaterThan(0);
    expect(p.revenueForecastClose).toBeGreaterThan(p.revenueActualNow);
    expect(p.status).toBe("AHEAD");
    expect(p.radrRead.length).toBeLessThan(120);
  });

  it("group MTD includes month-end forecast", () => {
    const p = getGroupMtdPace();
    expect(p.revenueMTD).toBe(312_480);
    expect(p.revenueForecastMonthEnd).toBe(492_800);
    expect(p.contributionVsPlan).toBeLessThan(0);
  });

  it("group day pace ranks location exceptions", () => {
    const p = getGroupDayPace("restaurant");
    expect(p.locations.length).toBe(3);
    expect(p.locations[0]?.label).toMatch(/Berlin/);
    expect(p.locations.every((l) => !/Canal|Chiado/i.test(l.label))).toBe(true);
  });

  it("restaurant group pace never names Canal or Chiado", () => {
    const p = getGroupDayPace("restaurant");
    const blob = JSON.stringify(p);
    expect(blob).not.toMatch(/Canal|Chiado/i);
  });
});

describe("external + cancellation intel", () => {
  it("combines bookings event weather", () => {
    const d = getCombinedTonightDemand();
    expect(d.signals.length).toBeGreaterThanOrEqual(2);
    expect(d.netDemandDeltaPct).toBe(
      Math.round((d.bookingsDeltaPct + d.eventDeltaPct + d.weatherDeltaPct) * 10) /
        10,
    );
  });

  it("cancellation shows recovered vs exposed", () => {
    const c = getCancellationIntel();
    expect(c.alreadyRecovered + c.stillExposed).toBe(c.expectedRevenueLost);
  });
});

describe("intelligence category expansion", () => {
  it("live includes pace and demand modules", () => {
    const ids = modulesForIntelligenceCategory("live", []);
    expect(ids).toContain("revenue_pace_day");
    expect(ids).toContain("tonight_demand");
    expect(ids).not.toContain("top_dishes");
  });
});

describe("Ask pacing intents", () => {
  it("classifies contribution behind", () => {
    const c = classifyAskIntent("Why is contribution behind?");
    expect(c.intent).toBe("MARGIN_ANALYSIS");
  });

  it("composes structured contribution answer", () => {
    const r = composeAskAnswer(
      "MARGIN_ANALYSIS",
      {
        locationScope: "all",
        period: "mtd",
        role: "group_cfo",
        allowedLocationIds: "all",
      } as never,
      [],
      "Why is contribution behind?",
    );
    expect(r.verdict).toMatch(/Contribution/i);
    expect(r.primaryMetric?.value).toMatch(/€|4/);
    expect(r.drivers?.length).toBeGreaterThan(2);
    expect(r.actions[0]?.href).toContain("performance");
  });

  it("composes tracking today without paragraph wall", () => {
    const r = composeAskAnswer(
      "REVENUE_ANALYSIS",
      {
        locationScope: "loc_berlin_mitte",
        period: "today",
        role: "location_manager",
        allowedLocationIds: ["loc_berlin_mitte"],
      } as never,
      [],
      "How are we tracking today?",
    );
    expect(r.verdict).toMatch(/pace/i);
    expect((r.answer ?? "").length).toBeLessThan(160);
  });
});
