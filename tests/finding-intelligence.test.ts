import { describe, expect, it } from "vitest";
import {
  calculateCancellationExposure,
  calculateExpectedNetBenefit,
  calculateStaffingRisk,
  calculateSupplierVariance,
} from "@/lib/radr/findingIntelligence";

describe("findingIntelligence", () => {
  it("calculates staffing risk with contribution-based net benefit", () => {
    const r = calculateStaffingRisk({
      expectedCovers: 348,
      capacityCovers: 320,
      revenueAtRisk: 640,
      contributionRate: 0.334,
      fohCost: 84,
      bookingLiftPct: 8.2,
      walkInLiftPct: 4.1,
      localEvent: true,
    });
    expect(r.gap).toBe(28);
    expect(r.contributionAtRisk).toBe(214);
    expect(r.expectedNetBenefit).toBe(130);
  });

  it("does not treat full cancelled booking value as lost", () => {
    const r = calculateCancellationExposure({
      reservations: 6,
      covers: 18,
      spendPerCover: 1240 / 18,
      rebookingProbability: 860 / 1240,
      contributionRate: 0.334,
    });
    expect(r.originalBookingValue).toBe(1240);
    expect(r.expectedNaturalRecovery).toBe(860);
    expect(r.revenueExposed).toBe(380);
    expect(r.revenueExposed).toBeLessThan(r.originalBookingValue);
  });

  it("calculates supplier variance from invoice vs contract", () => {
    const r = calculateSupplierVariance({
      invoiceTotal: 2840,
      contractedTotal: 2722,
      lines: [
        { label: "Tomatoes", variance: 46 },
        { label: "Olive oil", variance: 38 },
        { label: "Fresh herbs", variance: 34 },
      ],
    });
    expect(r.variance).toBe(118);
    expect(r.recoverableValue).toBe(118);
    expect(r.lineSum).toBe(118);
  });

  it("nets contribution against action cost", () => {
    expect(calculateExpectedNetBenefit(214, 84)).toBe(130);
  });
});
