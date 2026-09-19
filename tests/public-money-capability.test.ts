/**
 * Canonical public money semantics — flagship Decisions.
 */
import { describe, expect, it } from "vitest";
import {
  MONEY_D1911_EXPECTED,
  MONEY_D2201_EXPECTED,
  MONEY_D2201_EXPOSURE,
  MONEY_D2201_VERIFIED,
  MONEY_D3104_EXPECTED,
  MONEY_D3104_OBSERVED,
  MONEY_D3104_VERIFIED,
  MONEY_D4102_VARIANCE,
  MONEY_D4102_VERIFIED,
  PUBLIC_MONEY_FIXTURES,
} from "@/lib/marketing/publicMoney";
import { PUBLIC_CAPABILITIES } from "@/lib/marketing/capabilityStatus";
import { CATEGORY } from "@/lib/marketing/brand";

describe("public money fixtures", () => {
  it("D-1911 €620 is expected incremental contribution vs seat-now", () => {
    expect(MONEY_D1911_EXPECTED.amount).toBe(620);
    expect(MONEY_D1911_EXPECTED.metricType).toBe(
      "expected_incremental_contribution",
    );
    expect(MONEY_D1911_EXPECTED.label.toLowerCase()).toContain("vs seat-now");
    expect(MONEY_D1911_EXPECTED.metricType).not.toBe("exposure");
  });

  it("D-4102 €273 is invoice variance / exposure — not expected value", () => {
    expect(MONEY_D4102_VARIANCE.amount).toBe(273);
    expect(MONEY_D4102_VARIANCE.metricType).toBe("invoice_variance");
    expect(MONEY_D4102_VARIANCE.label.toLowerCase()).not.toContain("expected value");
    expect(MONEY_D4102_VERIFIED.amount).toBe(0);
    expect(MONEY_D4102_VERIFIED.label.toLowerCase()).toContain("no verified");
  });

  it("D-3104 keeps expected / observed / verified distinct", () => {
    expect(MONEY_D3104_EXPECTED.amount).toBe(112);
    expect(MONEY_D3104_OBSERVED.amount).toBe(118);
    expect(MONEY_D3104_VERIFIED.amount).toBe(40);
  });

  it("D-2201 keeps exposure / expected / verified distinct", () => {
    expect(MONEY_D2201_EXPOSURE.amount).toBe(4200);
    expect(MONEY_D2201_EXPECTED.amount).toBe(3100);
    expect(MONEY_D2201_VERIFIED.amount).toBe(2960);
  });

  it("fixtures are keyed by display id", () => {
    expect(PUBLIC_MONEY_FIXTURES["D-1911"].expected.displayId).toBe("D-1911");
    expect(PUBLIC_MONEY_FIXTURES["D-2201"].exposure.displayId).toBe("D-2201");
  });
});

describe("capability status registry", () => {
  it("marks autopilot as planned — not live", () => {
    expect(PUBLIC_CAPABILITIES.autopilot.status).toBe("planned");
  });

  it("marks files/csv available for first pilot", () => {
    expect(PUBLIC_CAPABILITIES.filesCsv.status).toBe("available");
  });

  it("marks developers API as technical preview", () => {
    expect(PUBLIC_CAPABILITIES.developersApi.status).toBe("technical_preview");
  });
});

describe("category hierarchy", () => {
  it("locks customer-facing primary language", () => {
    expect(CATEGORY.primary.toLowerCase()).toContain("decision layer");
    expect(CATEGORY.systemOfDecisionRecord.toLowerCase()).toContain(
      "system of decision record",
    );
  });
});
