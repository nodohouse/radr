/**
 * Intelligence Finding disposition + world isolation for Decision OS pass.
 */
import { describe, expect, it } from "vitest";
import {
  assertNoOrphanMaterialFindings,
  contributionFindingFromBridge,
  findingForMetric,
  listIntelligenceFindings,
} from "@/lib/radr/intelligence/finding";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import {
  CANON_MARGIN_COKE,
  CANON_TUNA,
} from "@/lib/radr/decision/demo/canonical";
import { groupExpectedCloseForecast } from "@/lib/radr/forecast";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("IntelligenceFinding disposition", () => {
  it("every material finding has a disposition path", () => {
    expect(assertNoOrphanMaterialFindings()).toEqual([]);
  });

  it("contribution finding exposes explain drivers + related Decisions", () => {
    const f = contributionFindingFromBridge();
    expect(f.drivers.length).toBeGreaterThan(2);
    expect(f.relatedDecisions.length).toBeGreaterThan(0);
    expect(f.availableLevers.some((l) => l.isNoAction)).toBe(true);
    expect(f.disposition).toBe("DECISION_REQUIRED");
  });

  it("labor maps to NO_ACTION", () => {
    const f = findingForMetric("labor_pct");
    expect(f?.disposition).toBe("NO_ACTION");
    expect(f?.noActionReason).toBeTruthy();
  });

  it("registry is non-empty", () => {
    expect(listIntelligenceFindings().length).toBeGreaterThanOrEqual(3);
  });
});

describe("domain Futures horizons", () => {
  it("D-7501 futures never carry Peak Seat/Wait/Throttle labels", () => {
    const futures = futuresFromCanon(CANON_MARGIN_COKE);
    const labels = futures.scenarios.map((s) => s.label).join(" | ");
    expect(labels).not.toMatch(/Seat now/i);
    expect(labels).not.toMatch(/Wait 12/i);
    expect(labels).not.toMatch(/Throttle delivery/i);
    expect(futures.scenarios.some((s) => s.id.includes("defer"))).toBe(true);
  });

  it("D-1842 tuna futures are stock/menu options", () => {
    const futures = futuresFromCanon(CANON_TUNA);
    const labels = futures.scenarios.map((s) => s.label).join(" | ");
    expect(labels).not.toMatch(/Seat now|Wait 12|Throttle delivery/i);
    expect(futures.decisionId).toBe(DECISION_IDS.tuna);
  });
});

describe("group forecast world isolation", () => {
  it("restaurant close forecast has no Canal or Chiado", () => {
    const f = groupExpectedCloseForecast("restaurant");
    const blob = JSON.stringify(f);
    expect(blob).not.toMatch(/Canal|Chiado/i);
    expect(f.drivers.some((d) => /Berlin/i.test(d.label))).toBe(true);
  });
});
