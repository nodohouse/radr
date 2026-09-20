import { describe, expect, it } from "vitest";
import {
  BOUTIQUE_HOTEL,
  RESTAURANT_FULL_SERVICE,
  berlinRestaurantUnits,
  canalHouseUnits,
  getProfile,
} from "@/lib/radr/domain/hospitalityOperatingProfile";
import {
  profileIdFromVenueType,
  resolveProfile,
} from "@/lib/radr/operating/resolveProfile";
import { terminologyForProfile } from "@/lib/radr/operating/terminology";
import { DEMO_LOCATION_ID } from "@/lib/radr/demoClock";

describe("HospitalityOperatingProfile", () => {
  it("Berlin resolves to live restaurant profile", () => {
    const p = resolveProfile({ locationId: DEMO_LOCATION_ID });
    expect(p.id).toBe("restaurant_full_service");
    expect(p.support).toBe("live");
    expect(p.timeModel).toBe("meal_service");
  });

  it("Canal House location resolves to boutique hotel demo", () => {
    const p = resolveProfile({ locationId: "loc_ams_canal" });
    expect(p.id).toBe("boutique_hotel");
    expect(p.support).toBe("demo");
    expect(p.timeModel).toBe("hotel_day");
  });

  it("demo vertical overrides location", () => {
    expect(
      resolveProfile({
        locationId: DEMO_LOCATION_ID,
        demoVertical: "boutique_hotel",
      }).id,
    ).toBe("boutique_hotel");
    expect(
      resolveProfile({
        locationId: "loc_ams_canal",
        demoVertical: "restaurant",
      }).id,
    ).toBe("restaurant_full_service");
  });

  it("onboarding venueType maps to profiles", () => {
    expect(profileIdFromVenueType("restaurant")).toBe(
      "restaurant_full_service",
    );
    expect(profileIdFromVenueType("hotel")).toBe("boutique_hotel");
    expect(profileIdFromVenueType("bar")).toBe("bar");
    expect(getProfile("spa")?.support).toBe("stub");
    expect(getProfile("serviced_apartments")?.support).toBe("demo");
  });

  it("terminology differs for restaurant vs boutique hotel", () => {
    const r = terminologyForProfile(RESTAURANT_FULL_SERVICE);
    const h = terminologyForProfile(BOUTIQUE_HOTEL);
    expect(r.inventoryUnitSingular).toBe("Table");
    expect(h.inventoryUnitSingular).toBe("Room");
    expect(r.recoveryOpenedLabel).toBe("Table opened");
    expect(h.recoveryOpenedLabel).toBe("Room night opened");
    expect(r.phaseLabel.PREPARE).toBe("Pre-shift");
    expect(h.phaseLabel.PREPARE).toBe("Pre-arrival");
    expect(r.rhythmLabels.prepare).toBe("Pre-shift");
    expect(h.rhythmLabels.prepare).toBe("House brief");
  });

  it("default units exist for Berlin and Canal House", () => {
    expect(berlinRestaurantUnits().length).toBeGreaterThanOrEqual(2);
    expect(canalHouseUnits().some((u) => u.unitType === "ROOMS")).toBe(true);
  });
});
