import { describe, expect, it } from "vitest";
import {
  calculateValueMap,
  sampleJourney,
  REVENUE_OPTIONS_USD,
  formatRevenueLabel,
  formatMoneyIntl,
} from "@/lib/marketing/value-calculator";
import {
  financialInputs,
  valueMapCsv,
} from "@/lib/marketing/value-calculator/presentation";

describe("Value Map explanations and local export", () => {
  it("labels currency bands using the actual numerical bounds, without FX", () => {
    const band = REVENUE_OPTIONS_USD.find((r) => r.id === "2_5")!;
    expect(formatRevenueLabel(band, "EUR")).toBe("€2M–€5M");
    expect(formatRevenueLabel(band, "JPY")).toBe("¥2M–¥5M");
    expect(formatMoneyIntl(1200, "OTHER")).toBe("1,200");
  });
  it("offers smaller venue bands and shows their assumed base", () => {
    const small = REVENUE_OPTIONS_USD.find((r) => r.id === "u250k")!;
    expect(small.range?.base).toBe(125000);
    expect(formatRevenueLabel(small, "EUR")).toBe("Under €250K");
  });
  it("distinguishes a supplied zero from an assumed unknown", () => {
    const rows = financialInputs({ ...sampleJourney("hotel"), otaId: "none" });
    expect(rows.find((r) => r.label.includes("Third-party"))?.supplied).toBe(
      true,
    );
    expect(
      financialInputs({ ...sampleJourney("hotel"), otaId: "unknown" }).find(
        (r) => r.label.includes("Third-party"),
      )?.supplied,
    ).toBe(false);
  });
  it("exports every category, assumptions, evidence and an annual horizon", () => {
    const j = { ...sampleJourney("mixed"), currency: "EUR" as const };
    const r = calculateValueMap(j)!;
    const csv = valueMapCsv(j, r);
    for (const c of r.categories) expect(csv).toContain(`"${c.label}"`);
    expect(csv).toContain("Annual; all selected locations combined");
    expect(csv).toContain("Internal modeling assumptions");
    expect(csv).toContain("Records to check");
    expect(csv).toContain("RADR prices remain pending");
  });
  it("does not export a fabricated positive estimate for missing revenue", () => {
    const j = { ...sampleJourney("restaurant"), revenueId: "unknown" };
    expect(valueMapCsv(j, calculateValueMap(j)!)).toContain(
      '"Revenue used","Not provided"',
    );
  });
});
