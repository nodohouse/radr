import { describe, expect, it } from "vitest";
import {
  estateDaypartForLocation,
  estateLocalClockLabel,
  localHourAtDemo,
} from "@/lib/radr/live/estateDaypart";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { RESTAURANT_ESTATE } from "@/lib/radr/demo/estateRegistry";

describe("estate local daypart", () => {
  it("does not stamp the same clock on every city", () => {
    const clocks = new Set(
      RESTAURANT_ESTATE.map((e) => estateLocalClockLabel(e.id)),
    );
    expect(clocks.size).toBeGreaterThan(1);
  });

  it("NYC is Dinner at the Live snapshot", () => {
    expect(estateDaypartForLocation("loc_berlin_mitte")).toBe("Dinner");
    expect(estateLocalClockLabel("loc_berlin_mitte")).toBe(
      LIVE_SCENARIO.clockLabel,
    );
  });

  it("Tokyo / Dubai / Sydney differ from NYC daypart", () => {
    expect(estateDaypartForLocation("loc_stuttgart_mitte")).not.toBe("Dinner");
    expect(estateDaypartForLocation("loc_koln_ehrenfeld")).not.toBe("Dinner");
    expect(estateDaypartForLocation("loc_sydney_surry")).not.toBe("Dinner");
  });

  it("local hours span multiple regions at the same instant", () => {
    const hours = RESTAURANT_ESTATE.map((e) =>
      localHourAtDemo(e.timezone, LIVE_SCENARIO.timestampIso),
    );
    expect(new Set(hours).size).toBeGreaterThanOrEqual(4);
  });
});
