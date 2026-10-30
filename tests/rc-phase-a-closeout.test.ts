import { describe, expect, it } from "vitest";
import { getPortfolioEconomics } from "@/lib/radr/product/portfolioEconomics";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";
import { formatOrdinal, ordinalSuffix } from "@/lib/radr/format/ordinal";
import { formatOperatorDeadline, isRawIsoTimestamp } from "@/lib/radr/format/operatorTime";
import { berlinAttentionBudget } from "@/lib/radr/product/roleTranslation";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { getLocationComparison } from "@/lib/radr/comparisonService";
import { executiveCompressionLine } from "@/lib/radr/intelligence/finding";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";

describe("RC Phase A — money bridge reconciles", () => {
  it("gross − displayed deductions === contribution for all 10 restaurants", () => {
    const scope = resolveRoleScope("coo", "restaurant");
    const pulse = getBusinessPulse("coo", "restaurant");
    const econ = getPortfolioEconomics(scope, pulse.locations);
    expect(econ.locations.length).toBe(10);
    for (const loc of econ.locations) {
      const b = loc.bridge;
      const sum =
        b.revenue +
        b.discounts +
        b.refundsComps +
        b.channelFees +
        b.labor +
        b.cogs +
        b.otherOperating;
      expect(sum).toBe(b.contribution);
    }
  });

  it("group revenue / contribution / refunds sum to locations", () => {
    const scope = resolveRoleScope("coo", "restaurant");
    const pulse = getBusinessPulse("coo", "restaurant");
    const econ = getPortfolioEconomics(scope, pulse.locations);
    const rev = econ.locations.reduce((s, l) => s + l.revenue, 0);
    const contrib = econ.locations.reduce((s, l) => s + l.contribution, 0);
    const refunds = econ.locations.reduce((s, l) => s + l.refundsComps, 0);
    expect(rev).toBe(econ.group.revenue);
    expect(contrib).toBe(econ.group.contribution);
    expect(refunds).toBe(econ.group.refundsComps);
  });
});

describe("RC Phase A — ordinal + operator time", () => {
  it("formats 52nd 61st 72nd 91st", () => {
    expect(formatOrdinal(52)).toBe("52nd");
    expect(formatOrdinal(61)).toBe("61st");
    expect(formatOrdinal(72)).toBe("72nd");
    expect(formatOrdinal(91)).toBe("91st");
    expect(ordinalSuffix(11)).toBe("th");
    expect(ordinalSuffix(12)).toBe("th");
    expect(ordinalSuffix(13)).toBe("th");
  });

  it("never leaves raw ISO as operator copy", () => {
    expect(isRawIsoTimestamp("2026-09-18T19:25:00+02:00")).toBe(true);
    expect(formatOperatorDeadline("2026-09-18T19:25:00+02:00")).toBe(
      "Decide by 19:25",
    );
    expect(formatOperatorDeadline("Decide by 19:25")).toBe("Decide by 19:25");
  });
});

describe("RC Phase A — CC ↔ Live counts", () => {
  it("Live attention budget matches CC compression (146 / 3)", () => {
    const brief = composeControlCenterBrief({
      role: "gm",
      locationId: "loc_berlin_mitte",
      vertical: "restaurant",
      period: "mtd",
    });
    const need = brief.needsYouCount;
    expect(need).toBe(3);
    const budget = berlinAttentionBudget({ needJudgment: need });
    expect(budget.meaningfulChanges).toBe(146);
    const line = executiveCompressionLine({
      withinExpectation: 141,
      handling: 1,
      watching: 1,
      needJudgment: need,
    });
    expect(line.startsWith("146 evaluated")).toBe(true);
    expect(line).toMatch(/cleared/);
    expect(budget.gmSees).toBe("3 signals need your judgment");
  });
});

describe("RC Phase A — estate compare", () => {
  it("Hamburg → Berlin resolves (no invalid / loading)", () => {
    const r = getLocationComparison({
      locationIds: ["loc_hamburg_hafen", "loc_berlin_mitte"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.locations.map((l) => l.id)).toEqual([
        "loc_hamburg_hafen",
        "loc_berlin_mitte",
      ]);
    }
  });
});

describe("RC Phase A — org roster", () => {
  it("Northstar restaurants has 10 locations", () => {
    expect(NORTHSTAR_RESTAURANTS.locations.length).toBe(10);
  });
});
