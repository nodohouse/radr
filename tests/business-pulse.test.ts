import { describe, expect, it } from "vitest";
import {
  assertContributionBridgeIdentity,
  CONNECTED_PILOT_MTD,
} from "@/lib/radr/product/demoOperatingPulse";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { composeBusinessPulseReading } from "@/lib/radr/product/businessPulseReading";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { composeExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";

describe("Business pulse + contribution bridge", () => {
  it("contribution bridge identity closes", () => {
    expect(assertContributionBridgeIdentity()).toBe(true);
    const bridge = getContributionBridge();
    expect(bridge.identityOk).toBe(true);
    const plan = CONNECTED_PILOT_MTD.bridge.plan;
    const actual = CONNECTED_PILOT_MTD.bridge.actual;
    const driverSum = CONNECTED_PILOT_MTD.bridge.drivers.reduce(
      (s, d) => s + d.amount,
      0,
    );
    expect(plan + driverSum).toBe(actual);
    expect(bridge.varianceAmount).toBe(actual - plan);
  });

  it("business pulse uses fixture + Decision ledger Verified Value", () => {
    const pulse = getBusinessPulse("cfo", "restaurant");
    const agg = deriveValueAggregate("cfo", "restaurant");
    const verified = pulse.primary.find((m) => m.id === "verified_value_mtd");
    expect(verified?.value).toBe(agg.verifiedTotal);
    expect(verified?.value).toBeGreaterThan(0);

    const revenue = pulse.primary.find((m) => m.id === "revenue_mtd");
    expect(revenue?.value).toBe(CONNECTED_PILOT_MTD.revenue.actual);
    expect(revenue?.comparisonFormatted).toMatch(/%/);

    const labor = pulse.support.find((m) => m.id === "labor_pct_mtd");
    expect(labor?.comparisonFormatted).toMatch(/pp/);
  });

  it("pulse reading surfaces material contribution gap + ranked drivers", () => {
    const pulse = getBusinessPulse("gm", "restaurant");
    const bridge = getContributionBridge();
    const brief = composeControlCenterBrief({
      role: "gm",
      vertical: "restaurant",
      period: "mtd",
    });
    const reading = composeBusinessPulseReading({
      pulse,
      bridge,
      needsYou: brief.needsYou,
    });

    expect(reading.leadTone).toBe("neg");
    expect(reading.leadValue).toMatch(/−€/);
    expect(reading.drivers.length).toBe(
      CONNECTED_PILOT_MTD.bridge.drivers.length,
    );
    expect(reading.drivers[0]!.kind).toBe("negative");
    expect(reading.drivers[0]!.sharePct).toBeGreaterThan(20);
    expect(reading.diagnosis.toLowerCase()).toMatch(/cogs|labor|shortfall/);
    expect(reading.quiet.some((q) => q.state === "proof")).toBe(true);
    expect(
      reading.quiet.every(
        (q) => q.state === "proof" || q.label !== "Contribution",
      ),
    ).toBe(true);
    expect(reading.linkedDecisions.length).toBeGreaterThanOrEqual(1);
    expect(
      reading.drivers.some(
        (d) => d.displayId === "D-7501" || d.displayId === "D-4102",
      ),
    ).toBe(true);
  });

  it("location pulse exposure reconciles to needs-you Decisions", () => {
    const pulse = getBusinessPulse("cfo");
    const berlin = pulse.locations.find(
      (l) => l.locationId === "loc_berlin_mitte",
    );
    expect(berlin?.needsYouCount).toBe(3);
    expect(berlin?.activeExposure).toBeGreaterThanOrEqual(974);
  });

  it("executive brief is grounded — no empty facts, clickable sources", () => {
    const exec = composeExecutiveBrief("cfo");
    expect(exec.headline.length).toBeGreaterThan(20);
    expect(exec.facts.length).toBeGreaterThanOrEqual(2);
    expect(exec.facts.length).toBeLessThanOrEqual(4);
    for (const f of exec.facts) {
      expect(f.sourceIds.length).toBeGreaterThan(0);
      expect(f.text.length).toBeGreaterThan(4);
    }
  });
});
