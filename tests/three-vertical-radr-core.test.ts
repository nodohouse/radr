import { describe, expect, it } from "vitest";
import {
  SERVICED_APARTMENTS,
  lisbonResidencesUnits,
  getProfile,
} from "@/lib/radr/domain/hospitalityOperatingProfile";
import {
  isDemoVertical,
  resolveProfile,
} from "@/lib/radr/operating/resolveProfile";
import { composeControlCenter } from "@/lib/radr/controlCenter";
import { metricsForRole } from "@/lib/radr/metrics/catalog";
import { roleLensFor, demoRoleGroupsForVertical } from "@/lib/radr/role/lenses";
import {
  lisbonAttention,
  lisbonTonight,
  lisbonPredictions,
} from "@/lib/radr/demo/lisbonResidences";
import { canalHousePredictions } from "@/lib/radr/demo/canalHouseAmsterdam";
import {
  intelligenceClassSchema,
  valueExposureFromMajor,
} from "@/lib/radr/domain/intelligence";

describe("Three-vertical RADR core", () => {
  it("serviced apartments is demo support", () => {
    expect(SERVICED_APARTMENTS.support).toBe("demo");
    expect(getProfile("vacation_rental")?.support).toBe("demo");
    expect(getProfile("spa")?.support).toBe("stub");
  });

  it("resolves Lisbon location and vertical", () => {
    expect(resolveProfile({ locationId: "loc_lis_residences" }).id).toBe(
      "serviced_apartments",
    );
    expect(
      resolveProfile({ demoVertical: "serviced_apartments" }).id,
    ).toBe("serviced_apartments");
    expect(isDemoVertical("serviced_apartments")).toBe(true);
  });

  it("composer picks different modules by role for hotel", () => {
    const gm = composeControlCenter({
      profile: resolveProfile({ demoVertical: "boutique_hotel" }),
      role: "hotel_gm",
      vertical: "boutique_hotel",
    });
    const rev = composeControlCenter({
      profile: resolveProfile({ demoVertical: "boutique_hotel" }),
      role: "revenue_manager",
      vertical: "boutique_hotel",
    });
    expect(gm.surface).toBe("hotel_glance");
    expect(gm.modules).toContain("house_brief");
    expect(rev.modules).toContain("revenue_pace");
    expect(rev.modules).not.toContain("overnight");
  });

  it("composer surfaces residences for ops gm", () => {
    const ops = composeControlCenter({
      profile: SERVICED_APARTMENTS,
      role: "gm",
      vertical: "serviced_apartments",
    });
    expect(ops.surface).toBe("residences_glance");
    expect(ops.modules).toContain("turnover_board");
  });

  it("metric catalog filters by role and vertical", () => {
    const hotelGm = metricsForRole("boutique_hotel", "hotel_gm");
    expect(hotelGm.some((m) => m.id === "occupancy")).toBe(true);
    const chef = metricsForRole("restaurant_full_service", "head_chef");
    expect(chef.some((m) => m.id === "covers")).toBe(true);
  });

  it("role lenses and filtered demo groups exist", () => {
    expect(roleLensFor("hotel_gm", "boutique_hotel")?.missedSignals.length).toBeGreaterThan(
      0,
    );
    const hotelGroups = demoRoleGroupsForVertical("boutique_hotel");
    expect(hotelGroups.flatMap((g) => g.roles)).toContain("housekeeping_manager");
    expect(hotelGroups.flatMap((g) => g.roles)).not.toContain("head_chef");
  });

  it("Lisbon fixture has continuity attention and predictions", () => {
    expect(lisbonTonight().needsYou).toBe(2);
    expect(lisbonAttention().every((a) => a.radrDid)).toBe(true);
    expect(lisbonPredictions()[0]?.confidence).toBeTruthy();
    expect(lisbonResidencesUnits().some((u) => u.unitType === "SERVICED_APARTMENTS")).toBe(
      true,
    );
  });

  it("hotel predictions are explainable", () => {
    const preds = canalHousePredictions();
    expect(preds.some((p) => p.type === "room_readiness_risk")).toBe(true);
    expect(preds.every((p) => p.drivers.length > 0)).toBe(true);
  });

  it("intelligence triad and value exposure parse", () => {
    expect(intelligenceClassSchema.parse("MISSED")).toBe("MISSED");
    const exp = valueExposureFromMajor({
      id: "x1",
      revenue: 420,
      guestImpact: "medium",
    });
    expect(exp.revenueExposure).toBe(420);
  });
});
