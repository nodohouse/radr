import { describe, expect, it } from "vitest";
import {
  boostByPersonaDriver,
  hotelPersonaLens,
} from "@/lib/product/decisionsWorkspace/hotelPersonaLens";
import { getDecisionsWorkspace } from "@/lib/product/decisionsWorkspace";

describe("hotel Decisions persona lenses", () => {
  const hotel = getDecisionsWorkspace("hotels");

  it("CFO prioritizes channel / revenue / value sort", () => {
    const lens = hotelPersonaLens("cfo");
    expect(lens.roleLabel).toBe("CFO");
    expect(lens.defaultSort).toBe("value");
    expect(lens.preferredDrivers[0]).toBe("channel");
    expect(lens.focuses).toContain("Verified Value");
  });

  it("Revenue Manager defaults to channel filter", () => {
    const lens = hotelPersonaLens("revenue_manager");
    expect(lens.defaultDriver).toBe("channel");
    expect(lens.focuses).toContain("Pace");
  });

  it("Housekeeping defaults to housekeeping filter + urgency", () => {
    const lens = hotelPersonaLens("housekeeping_manager");
    expect(lens.defaultDriver).toBe("housekeeping");
    expect(lens.defaultSort).toBe("urgency");
    expect(lens.focuses).toContain("Reassignment");
  });

  it("Front Office defaults to guests filter", () => {
    const lens = hotelPersonaLens("host");
    expect(lens.defaultDriver).toBe("guests");
    expect(lens.focuses).toContain("VIP check-in");
  });

  it("boost floats channel Decisions ahead for CFO without dropping others", () => {
    const lens = hotelPersonaLens("cfo");
    const boosted = boostByPersonaDriver(
      hotel.judgment,
      lens.preferredDrivers,
    );
    expect(boosted[0]?.driverKind).toBe("channel");
    expect(boosted.some((r) => r.driverKind === "housekeeping")).toBe(true);
  });

  it("Housekeeping boost keeps readiness first among HK drivers", () => {
    const lens = hotelPersonaLens("housekeeping_manager");
    const boosted = boostByPersonaDriver(
      hotel.judgment,
      lens.preferredDrivers,
    );
    expect(boosted[0]?.id).toBe(hotel.defaultDecisionId);
  });
});
