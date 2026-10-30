import { describe, expect, it } from "vitest";
import {
  getLiveServicePerformance,
  forecastAtHorizon,
  BERLIN_LIVE_FRESHNESS_SECONDS,
} from "@/lib/radr/intelligence/liveService";
import {
  activeLiveScenario,
  allLiveScenarios,
  composeCfoLiveSurface,
  composeLiveOperatingSurface,
  paceHeadline,
} from "@/lib/radr/product/liveOperating";

describe("Live operating command", () => {
  it("Berlin Live is active with trajectory waypoints", () => {
    const live = getLiveServicePerformance();
    expect(live.active).toBe(true);
    expect(live.revenue).toBe(18_420);
    expect(live.forecastAtNow).toBe(17_850);
    expect(live.revenueForecast1h).toBe(21_400);
    expect(live.revenueForecast2h).toBe(23_900);
    expect(live.revenueForecast3h).toBe(25_600);
    expect(live.expectedClose).toBe(26_800);
    expect(live.targetClose).toBe(26_100);
    expect(live.series.map((s) => s.label)).toEqual([
      "OPEN",
      "18:00",
      "19:00",
      "NOW",
      "+1H",
      "+2H",
      "+3H",
      "CLOSE",
    ]);
    expect(forecastAtHorizon(live, "60m")).toBe(21_400);
    expect(forecastAtHorizon(live, "close")).toBe(26_800);
  });

  it("freshness is LIVE under 2 minutes", () => {
    const live = getLiveServicePerformance();
    expect(BERLIN_LIVE_FRESHNESS_SECONDS).toBe(102);
    expect(live.freshnessState).toBe("LIVE");
    expect(live.freshnessLabel).toContain("LIVE");
    expect(live.freshnessLabel).toContain("1m");
  });

  it("pace headline is ahead of pace", () => {
    const live = getLiveServicePerformance();
    expect(paceHeadline(live).toLowerCase()).toContain("ahead of pace");
    expect(live.revenueDeltaPct).toBe(3.2);
  });

  it("composed Live surface has top tonight judgment and demand net", () => {
    const s = composeLiveOperatingSurface();
    expect(s.topTonight.length).toBeGreaterThanOrEqual(4);
    const tuna = s.topTonight.find((d) => d.name.includes("Tuna"));
    expect(tuna?.judgmentLine).toContain("station pressure");
    expect(s.demand.netDemandDeltaPct).toBe(6);
    expect(s.cancellations.stillExposed).toBe(360);
    expect(s.labor.judgment).toBe("NO_ACTION");
    expect(s.channel.judgment).toBe("WATCHING");
    expect(s.horizons["60m"].kitchenPressure).toBe(94);
  });

  it("CFO Live answers group tracking + MTD", () => {
    const cfo = composeCfoLiveSurface();
    expect(cfo.groupDay.revenueActual).toBe(62_400);
    expect(cfo.groupDay.revenueForecastClose).toBe(91_200);
    expect(cfo.mtd.revenueForecastMonthEnd).toBeGreaterThan(cfo.mtd.revenueMTD);
    expect(cfo.locations.length).toBe(3);
    expect(cfo.settlementExceptionEuro).toBe(395);
  });

  it("live scenario matrix is complete", () => {
    expect(allLiveScenarios()).toHaveLength(9);
    expect(activeLiveScenario().id).toBe("kitchen_pressure");
  });
});
