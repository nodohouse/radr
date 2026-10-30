/**
 * Same org + role + scope + period ⇒ identical aggregates across surfaces.
 */
import { describe, expect, it } from "vitest";
import {
  estateEditorial,
  needsAttentionOutliers,
  RESTAURANT_OUTLIER_SCENARIOS,
} from "@/lib/radr/demo/demoOutliers";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { getPortfolioEconomics } from "@/lib/radr/product/portfolioEconomics";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { sourcesForDemo } from "@/lib/radr/product/integrations";
import { scopedDecisionsForDemo } from "@/lib/radr/product/roleScope";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { recordAttention } from "@/lib/radr/product/roleScope";

describe("portfolio totals reconciliation", () => {
  const role = "coo" as const;
  const vertical = "restaurant" as const;

  it("estate editorial matches 10 / 2 / outliers SSOT", () => {
    const ed = estateEditorial();
    expect(ed.locationCount).toBe(10);
    expect(ed.locationCount).toBe(NORTHSTAR_RESTAURANTS.locations.length);
    expect(ed.needIntervention).toBe(2);
    expect(needsAttentionOutliers()).toHaveLength(2);
    expect(RESTAURANT_OUTLIER_SCENARIOS).toHaveLength(10);
  });

  it("Locations portfolio verified ≡ Value aggregate verified", () => {
    const scope = resolveRoleScope(role, vertical);
    const pulse = getBusinessPulse(role, vertical);
    const portfolio = getPortfolioEconomics(scope, pulse.locations);
    const value = deriveValueAggregate(role, vertical);

    expect(portfolio.locationCount).toBe(10);
    expect(portfolio.group.verified).toBe(value.verifiedTotal);
    expect(portfolio.group.verified).toBe(
      pulse.locations.reduce((s, l) => s + l.verifiedValue, 0),
    );
  });

  it("Control Center verified ≡ Value aggregate verified", () => {
    const brief = composeControlCenterBrief({ role, vertical });
    const value = deriveValueAggregate(role, vertical);
    expect(brief.economics.verifiedTotal).toBe(value.verifiedTotal);
  });

  it("needs judgment on Locations ≡ needs_you Decision count", () => {
    const scope = resolveRoleScope(role, vertical);
    const pulse = getBusinessPulse(role, vertical);
    const portfolio = getPortfolioEconomics(scope, pulse.locations);
    const needs = scopedDecisionsForDemo(
      listDecisionRecords(),
      role,
      vertical,
    ).filter((r) => recordAttention(r) === "needs_you");
    expect(portfolio.group.needsJudgment).toBe(needs.length);
  });

  it("restaurant connections never include Mews", () => {
    const rows = sourcesForDemo(role, vertical);
    expect(rows.some((r) => /mews/i.test(r.name))).toBe(false);
    expect(rows.every((r) => r.locationIds.every((id) => !id.includes("canal")))).toBe(
      true,
    );
  });

  it("group revenue is exact sum of location revenues", () => {
    const scope = resolveRoleScope(role, vertical);
    const pulse = getBusinessPulse(role, vertical);
    const portfolio = getPortfolioEconomics(scope, pulse.locations);
    const sum = portfolio.locations.reduce((s, l) => s + l.revenue, 0);
    expect(portfolio.group.revenue).toBe(sum);
    expect(portfolio.locations).toHaveLength(10);
  });
});
