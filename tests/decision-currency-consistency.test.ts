import { describe, expect, it } from "vitest";
import { CANON_PEAK, CANON_OTA, CANON_ORPHAN } from "@/lib/radr/decision/demo/canonical";
import { buildPeakDecisionRecord } from "@/lib/radr/decision/demos/peak";
import { buildPlaybookDecisionRecord } from "@/lib/radr/decision/demos/portfolio";
import { formatDecisionMoney, formatDecisionMoneyCents } from "@/lib/radr/decision/core";
import { primaryMetricOf, formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import { getServiceCommand } from "@/lib/product/serviceCommand";

describe("canonical decision source currency", () => {
  it("uses USD consistently through the New York decision, evidence and futures", () => {
    const record = buildPeakDecisionRecord();
    expect(primaryMetricOf(record)?.currency).toBe("USD");
    expect(formatPrimaryMetric(record)?.money).toBe(formatDecisionMoney(CANON_PEAK.expectedProtectedEuro, "USD"));
    expect(JSON.stringify(record)).not.toContain("€");
    const futures = futuresFromCanon(CANON_PEAK);
    expect(futures.scenarios.flatMap(s=>s.economicMetrics??[]).filter(m=>m.currency).every(m=>m.currency==="USD")).toBe(true);
    expect(JSON.stringify(CANON_PEAK)).not.toContain("€");
    expect(record.confidence.userFacing).toBe("MEDIUM");
    expect(record.verifiedValue).toBeUndefined();
  });
  it("migrates Mercer House to USD without changing Lisbon EUR", () => {
    expect(CANON_OTA.property).toContain("New York");
    expect(JSON.stringify(CANON_OTA)).not.toContain("€");
    expect(JSON.stringify(CANON_ORPHAN)).toContain("€");
    expect(futuresFromCanon(CANON_ORPHAN).scenarios.flatMap(s=>s.economicMetrics??[]).filter(m=>m.currency).every(m=>m.currency==="EUR")).toBe(true);
  });
  it("keeps explicit European source denomination on the group pattern", () => {
    const record=buildPlaybookDecisionRecord();
    expect(record.sourceCurrency).toBe("EUR");
    expect(primaryMetricOf(record)?.currency).toBe("EUR");
  });
  it("formats negative effects and cents without losing their sign", () => {
    expect(formatDecisionMoney(-620,"USD")).toBe("−$620");
    expect(formatDecisionMoney(620,"EUR")).toBe("€620");
    expect(formatDecisionMoneyCents(-6.8,"USD")).toBe("−$6.80");
  });
  it("does not render European money under the Soho service snapshot", () => {
    expect(getServiceCommand().location).toContain("New York");
    expect(JSON.stringify(getServiceCommand())).not.toContain("€");
  });
});
