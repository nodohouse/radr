import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BERLIN_GM_LIVE_STATE,
  D1911_CC_DECISION,
  deriveRestaurantGmConclusion,
  restaurantLocationAllowed,
} from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { CANON_PEAK, canonChosen } from "@/lib/radr/decision/demo/canonical";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

const ROOT = join(process.cwd());

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Restaurant GM Control Center canon", () => {
  it("locks Soho · New York dinner economics", () => {
    expect(BERLIN_GM_LIVE_STATE.locationId).toBe("loc_berlin_mitte");
    expect(BERLIN_GM_LIVE_STATE.revenueEuro).toBe(18_420);
    expect(BERLIN_GM_LIVE_STATE.contributionEuro).toBe(6_870);
    expect(BERLIN_GM_LIVE_STATE.covers).toBe(124);
    expect(BERLIN_GM_LIVE_STATE.avgCheckEuro).toBe(148);
    expect(BERLIN_GM_LIVE_STATE.laborPct).toBe(26.1);
    expect(BERLIN_GM_LIVE_STATE.constraint).toBe("grill");
    expect(BERLIN_GM_LIVE_STATE.constraintTime).toBe("20:10");
  });

  it("derives grill constraint conclusion — not FOH", () => {
    const c = deriveRestaurantGmConclusion(BERLIN_GM_LIVE_STATE);
    expect(c.lead).toMatch(/Dinner is ahead/i);
    expect(c.trail).toMatch(/Grill becomes the constraint at 20:10/i);
  });

  it("D-1911 paces seating — never Add FOH", () => {
    expect(D1911_CC_DECISION.id).toBe(DECISION_IDS.peak);
    expect(D1911_CC_DECISION.expectedEuro).toBe(620);
    expect(D1911_CC_DECISION.confidencePct).toBe(canonChosen(CANON_PEAK).confidence);
    expect(D1911_CC_DECISION.deadlineLabel).toBe("19:59");
    expect(D1911_CC_DECISION.action).toMatch(/Hold next seating wave for 12 min/i);
    expect(D1911_CC_DECISION.action).not.toMatch(/FOH/i);
    expect(D1911_CC_DECISION.bannedAction).toMatch(/Add 1 FOH/i);
  });

  it("rejects Canal House under restaurant location set", () => {
    const ids = new Set(["loc_berlin_mitte", "loc_berlin_kreuzberg"]);
    expect(restaurantLocationAllowed("loc_canal_house", ids)).toBe(false);
    expect(restaurantLocationAllowed("loc_berlin_mitte", ids)).toBe(true);
  });
});

describe("Restaurant GM Control Center source guards", () => {
  it("VisionGmCockpit does not recommend Add FOH", () => {
    const src = read(
      "components/product/control-center/vision/VisionGmCockpit.tsx",
    );
    expect(src).not.toMatch(/Add 1 FOH/i);
    expect(src).toMatch(/D1911_CC_DECISION/);
    expect(src).toMatch(/decision\.action/);
    expect(src).not.toMatch(/Canal House/);
    expect(src).not.toMatch(/112 \/ 12/);
  });

  it("VisionGmCockpit removes Operations carditis modules", () => {
    const src = read(
      "components/product/control-center/vision/VisionGmCockpit.tsx",
    );
    expect(src).not.toMatch(/rv-gm-modules/);
    expect(src).not.toMatch(/Table Turns/);
    expect(src).not.toMatch(/Floor issues/);
  });
});
