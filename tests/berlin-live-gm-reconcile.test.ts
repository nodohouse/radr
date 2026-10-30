import { describe, expect, it } from "vitest";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { BERLIN_GM_LIVE_STATE } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

describe("Soho · New York Live ↔ GM Control Center", () => {
  it("shared NOW snapshot", () => {
    const live = getLiveServicePerformance(DEMO_LOCATIONS.berlin.id);
    expect(live.revenue).toBe(18_420);
    expect(live.covers).toBe(124);
    expect(live.laborPct).toBe(26.1);
    expect(live.kitchenPressure).toBe(92);
    expect(live.kitchenProjected).toBe(97);
    expect(live.kitchenProjectedAt).toBe("20:10");
    expect(live.walkIns).toBe(12);
    expect(live.avgSpend).toBe(148);

    expect(live.revenue).toBe(BERLIN_GM_LIVE_STATE.revenueEuro);
    expect(live.covers).toBe(BERLIN_GM_LIVE_STATE.covers);
    expect(live.laborPct).toBe(BERLIN_GM_LIVE_STATE.laborPct);
  });
});
