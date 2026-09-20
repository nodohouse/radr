import { describe, expect, it } from "vitest";
import {
  DEMO_HIDDEN_SIGNALS,
  homepageHiddenSignalStories,
} from "@/lib/radr/hiddenSignals/demo";
import { parseHiddenSignal } from "@/lib/radr/domain/hiddenSignal";

describe("HiddenSignal", () => {
  it("demo signals are never single-metric vanity alerts", () => {
    for (const s of DEMO_HIDDEN_SIGNALS) {
      expect(s.systemsJoined.length).toBeGreaterThanOrEqual(2);
      expect(s.evidence.length).toBeGreaterThanOrEqual(2);
      expect(s.recommendation.length).toBeGreaterThan(10);
      expect(["ASSOCIATED", "HISTORICALLY_FOLLOWED", "EXPECTED", "CAUSAL"]).toContain(
        s.epistemic,
      );
    }
  });

  it("homepage stories cover three verticals", () => {
    const stories = homepageHiddenSignalStories();
    expect(stories.map((s) => s.vertical)).toEqual([
      "restaurant",
      "hotel",
      "serviced_apartments",
    ]);
    expect(stories[0]!.headline.toLowerCase()).toMatch(/bestseller/);
    expect(stories[1]!.headline.toLowerCase()).toMatch(/occupancy|economics/);
    expect(stories[2]!.headline.toLowerCase()).toMatch(/empty|random|orphan/i);
  });

  it("weather signal treats forecast as trigger not intelligence", () => {
    const wx = DEMO_HIDDEN_SIGNALS.find((s) => s.id === "hs_weather_operation")!;
    expect(wx.trigger).toBeTruthy();
    expect(wx.headline.toLowerCase()).not.toMatch(/sunny|open the terrace/);
    expect(wx.evidence.some((e) => /comparable|sample/i.test(e.label))).toBe(
      true,
    );
    const again = parseHiddenSignal(wx);
    expect(again.id).toBe(wx.id);
  });
});
