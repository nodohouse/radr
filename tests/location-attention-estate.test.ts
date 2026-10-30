/**
 * Estate learning: sourceLocation ≠ targetLocation.
 */
import { describe, expect, it } from "vitest";
import { getPortfolioEconomics } from "@/lib/radr/product/portfolioEconomics";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";
import { composeLocationIntel } from "@/lib/radr/location/composeLocationIntel";
import { deriveLocationAttention } from "@/lib/radr/product/locationAttention";

describe("Estate learning + attention", () => {
  it("no transfer learns from itself", () => {
    const scope = resolveRoleScope("coo", "restaurant");
    const pulse = getBusinessPulse("coo", "restaurant");
    const portfolio = getPortfolioEconomics(scope, pulse.locations);
    for (const t of portfolio.transfers) {
      expect(t.sourceLocationId).not.toBe(t.targetLocationId);
    }
  });

  it("Frankfurt is not Quiet while procurement exposure exists", () => {
    const intel = composeLocationIntel("loc_frankfurt_westend", { role: "coo" });
    expect(intel).toBeTruthy();
    const annualized = intel!.procurement?.annualizedExposure ?? 0;
    expect(annualized).toBeGreaterThan(0);
    const state = deriveLocationAttention({
      needsYouCount: intel!.economics.needsYou,
      activeExposureEuro: Math.max(
        intel!.economics.exposure,
        Math.round(annualized / 12),
      ),
      annualizedExposureEuro: annualized,
      outlierPolarity: intel!.outlier?.polarity ?? null,
    });
    expect(state).not.toBe("QUIET");
    expect(["ACTIONABLE", "WATCH", "NEEDS_JUDGMENT"]).toContain(state);
  });
});
