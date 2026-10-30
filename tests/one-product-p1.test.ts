/**
 * One-product P1 — deep links, control-center redirect, metric reconcile.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { BERLIN_GM_LIVE_STATE } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { resolveDecisionContext } from "@/lib/product/radrContext/resolveEntityContext";

const root = process.cwd();
function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("one-product P1", () => {
  it("resolveDecisionContext maps D-1911 → restaurant · Soho · New York", () => {
    const ctx = resolveDecisionContext(DECISION_IDS.peak)!;
    expect(ctx.vertical).toBe("restaurant");
    expect(ctx.scopeId).toBe("loc_berlin_mitte");
    expect(getDecisionRecord(DECISION_IDS.peak)?.locationId).toBe(
      "loc_berlin_mitte",
    );
  });

  it("resolveDecisionContext maps D-H-9201 → hotel · Mercer House · New York", () => {
    const ctx = resolveDecisionContext(DECISION_IDS.hotelReadiness)!;
    expect(ctx.vertical).toBe("hotel");
    expect(ctx.scopeId).toBe("loc_canal_house");
  });

  it("Live service NOW reconciles with NYC GM Control Center canon", () => {
    const live = getLiveServicePerformance(DEMO_LOCATIONS.berlin.id);
    expect(live.active).toBe(true);
    expect(live.revenue).toBe(BERLIN_GM_LIVE_STATE.revenueEuro);
    expect(live.covers).toBe(BERLIN_GM_LIVE_STATE.covers);
    expect(live.laborPct).toBe(BERLIN_GM_LIVE_STATE.laborPct);
    expect(live.kitchenPressure).toBe(BERLIN_GM_LIVE_STATE.kitchenLoadNowPct);
    expect(live.kitchenProjected).toBe(BERLIN_GM_LIVE_STATE.kitchenPeakPct);
    expect(live.walkIns).toBe(BERLIN_GM_LIVE_STATE.walkIns);
    expect(live.avgSpend).toBe(BERLIN_GM_LIVE_STATE.avgCheckEuro);
  });

  it("control-center redirects into /app; setRoleView does not auto-reset scope", () => {
    const cc = read("app/app/control-center/page.tsx");
    expect(cc).toMatch(/router\.replace\("\/app\?stay=1"\)/);
    expect(cc).not.toMatch(/from \"@\/components\/product\/control-center\/cfo-center/);

    const store = read("lib/product/store.tsx");
    expect(store).not.toMatch(
      /setLocationScopeState\(defaultScopeForRole/,
    );
    expect(store).toMatch(/must not silently reset scope\/period/);

    const shell = read("components/product/ProductShell.tsx");
    expect(shell).not.toMatch(/isCfoControlCenter/);
    expect(shell).not.toMatch(/isRadrDecisions/);
  });
});
