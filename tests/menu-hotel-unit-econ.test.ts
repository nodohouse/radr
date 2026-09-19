import { describe, expect, it } from "vitest";
import {
  computeMenuEconomics,
  discoverPairings,
  menuEconomicsHiddenSignals,
} from "@/lib/radr/menuEconomics/engine";
import {
  computeRoomTypeEconomics,
  hotelEconomicsHiddenSignals,
} from "@/lib/radr/hotelEconomics/roomTypes";
import {
  computeUnitEconomics,
  residencesEconomicsHiddenSignals,
} from "@/lib/radr/residencesEconomics/units";
import {
  collectHiddenSignals,
  mapDemoWhenToCockpitHorizon,
  rankHiddenSignalsForCockpit,
  rankHiddenSignalsForInsights,
} from "@/lib/radr/hiddenSignals/rank";
import { composeControlCenter } from "@/lib/radr/controlCenter";
import { resolveProfile } from "@/lib/radr/operating/resolveProfile";

describe("Menu economics + pairing", () => {
  it("flags bestseller with weak kitchen-minute economics", () => {
    const rows = computeMenuEconomics();
    const tataki = rows.find((r) => r.dishId === "dish_tataki");
    const truffle = rows.find((r) => r.dishId === "dish_truffle");
    expect(tataki?.volumeRank).toBe(1);
    expect(truffle!.contributionPerKitchenMinute).toBeGreaterThan(
      tataki!.contributionPerKitchenMinute,
    );
    expect(tataki?.bestsellerWeakEconomics).toBe(true);
  });

  it("discovers pairing lift with association language", () => {
    const pairings = discoverPairings();
    const riesling = pairings.find((p) => p.pairedItem === "Riesling");
    expect(riesling?.meetsThreshold).toBe(true);
    expect(riesling?.liftPts).toBeGreaterThanOrEqual(8);
    expect(["ASSOCIATED", "HISTORICALLY_FOLLOWED"]).toContain(riesling?.epistemic);
  });

  it("emits menu HiddenSignals from engine", () => {
    const signals = menuEconomicsHiddenSignals();
    expect(signals.some((s) => s.kind === "BESTSELLER_WEAK_ECONOMICS")).toBe(
      true,
    );
    expect(signals.some((s) => s.kind === "PAIRING_OPPORTUNITY")).toBe(true);
    expect(signals.every((s) => s.promoteToCockpit === false)).toBe(true);
  });
});

describe("Hotel + unit economics", () => {
  it("computes room-type net contribution below ADR premium story", () => {
    const rows = computeRoomTypeEconomics();
    const deluxe = rows.find((r) => r.id === "deluxe_king")!;
    expect(deluxe.adrPremiumPct).toBeGreaterThan(0);
    expect(deluxe.netContribution).toBeGreaterThan(0);
    expect(deluxe.netPremiumPct).toBeLessThan(deluxe.adrPremiumPct);
  });

  it("emits hotel HiddenSignals", () => {
    const signals = hotelEconomicsHiddenSignals();
    expect(signals.some((s) => s.kind === "OCCUPANCY_WEAK_ECONOMICS")).toBe(
      true,
    );
    expect(signals.some((s) => s.kind === "ROOM_TYPE_HIDDEN_VALUE")).toBe(true);
  });

  it("ranks high-ADR unit below peers on contribution", () => {
    const rows = computeUnitEconomics();
    const u24 = rows.find((r) => r.id === "unit_24")!;
    expect(u24.adrRank).toBe(1);
    expect(u24.contributionRank).toBeGreaterThan(1);
    const signals = residencesEconomicsHiddenSignals();
    expect(signals.some((s) => s.kind === "UNIT_WEAK_CONTRIBUTION")).toBe(true);
    expect(signals.some((s) => s.kind === "ORPHAN_NIGHT_PATTERN")).toBe(true);
  });
});

describe("Horizon ranking into Control Center", () => {
  it("maps demo When strip to cockpit filter", () => {
    expect(mapDemoWhenToCockpitHorizon("tonight")).toBe("TODAY");
    expect(mapDemoWhenToCockpitHorizon("mtd")).toBe("THIS_MONTH");
    expect(mapDemoWhenToCockpitHorizon("ytd")).toBe("STRUCTURAL");
  });

  it("cockpit excludes STRUCTURAL/MONTH from attention budget", () => {
    const cockpit = rankHiddenSignalsForCockpit({
      vertical: "restaurant",
      whenHorizon: "TODAY",
      maxAttention: 3,
    });
    expect(cockpit.every((s) => s.promoteToCockpit)).toBe(true);
    expect(
      cockpit.every((s) => s.horizon === "NOW" || s.horizon === "TODAY"),
    ).toBe(true);
    expect(cockpit.some((s) => s.kind === "WEATHER_OPERATING_RESPONSE")).toBe(
      true,
    );

    const insights = rankHiddenSignalsForInsights({ vertical: "restaurant" });
    expect(
      insights.some((s) => s.kind === "BESTSELLER_WEAK_ECONOMICS"),
    ).toBe(true);
    expect(insights.every((s) => s.horizon !== "TODAY" || !s.promoteToCockpit)).toBe(
      true,
    );
  });

  it("residences cockpit surfaces orphan night; hotel keeps economics in insights", () => {
    const resCockpit = rankHiddenSignalsForCockpit({
      vertical: "serviced_apartments",
      whenHorizon: "TODAY",
    });
    expect(resCockpit.some((s) => s.kind === "ORPHAN_NIGHT_PATTERN")).toBe(
      true,
    );

    const hotelCockpit = rankHiddenSignalsForCockpit({
      vertical: "boutique_hotel",
      whenHorizon: "TODAY",
    });
    expect(hotelCockpit.every((s) => s.horizon !== "STRUCTURAL")).toBe(true);

    const hotelInsights = rankHiddenSignalsForInsights({
      vertical: "boutique_hotel",
    });
    expect(
      hotelInsights.some((s) => s.kind === "OCCUPANCY_WEAK_ECONOMICS"),
    ).toBe(true);
  });

  it("composeControlCenter budgets cockpit vs insights", () => {
    const cc = composeControlCenter({
      profile: resolveProfile({ demoVertical: "restaurant" }),
      role: "gm",
      vertical: "restaurant",
      whenHorizon: "TODAY",
    });
    expect(cc.cockpitHiddenSignals.length).toBeLessThanOrEqual(cc.maxAttention);
    expect(cc.insightHiddenSignals.length).toBeGreaterThan(0);
    expect(
      collectHiddenSignals("restaurant").some(
        (s) => s.kind === "PAIRING_OPPORTUNITY",
      ),
    ).toBe(true);

    const month = composeControlCenter({
      profile: resolveProfile({ demoVertical: "restaurant" }),
      role: "gm",
      vertical: "restaurant",
      whenHorizon: "THIS_MONTH",
    });
    expect(month.cockpitHiddenSignals).toHaveLength(0);
  });
});
