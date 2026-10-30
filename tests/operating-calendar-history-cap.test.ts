import { describe, expect, it } from "vitest";
import {
  buildOperatingCalendarCells,
  calendarAsOf,
  canAdvanceCalendarPeriod,
  clampCalendarPeriod,
  isCalendarDateAfterAsOf,
  maxCalendarPeriod,
  shiftCalendarPeriod,
} from "@/lib/radr/product/operatingCalendar/metrics";

describe("operating calendar — History cannot look into the future", () => {
  it("caps restaurant History at LIVE_SCENARIO business date (2026-09-18)", () => {
    const asOf = calendarAsOf("restaurant");
    expect(asOf).toEqual({ year: 2026, month: 9, day: 18 });
    expect(maxCalendarPeriod("restaurant")).toEqual({ year: 2026, month: 9 });
  });

  it("caps hotel History at HOTEL_LIVE_SCENARIO business date", () => {
    const asOf = calendarAsOf("hotel");
    expect(asOf).toEqual({ year: 2026, month: 9, day: 24 });
  });

  it("clamps Oct 2026 / 2027 back to Sep 2026 for restaurants", () => {
    const max = maxCalendarPeriod("restaurant");
    expect(clampCalendarPeriod({ year: 2026, month: 10 }, max)).toEqual(max);
    expect(clampCalendarPeriod({ year: 2027, month: 1 }, max)).toEqual(max);
    expect(shiftCalendarPeriod({ year: 2026, month: 9 }, 1, max)).toEqual(max);
    expect(canAdvanceCalendarPeriod({ year: 2026, month: 9 }, max)).toBe(false);
    expect(canAdvanceCalendarPeriod({ year: 2026, month: 8 }, max)).toBe(true);
  });

  it("marks days after DemoClock today as empty", () => {
    const asOf = calendarAsOf("restaurant");
    expect(isCalendarDateAfterAsOf(2026, 9, 19, asOf)).toBe(true);
    expect(isCalendarDateAfterAsOf(2026, 9, 18, asOf)).toBe(false);

    const cells = buildOperatingCalendarCells("restaurant", "CONTRIBUTION", {
      year: 2026,
      month: 9,
    });
    const labeled = cells.filter((c) => c.label.includes("SEP"));
    // Day 19+ Sep should be empty (no performance yet)
    const sep19 = cells.find((c) => c.label.includes("19 SEP"));
    const sep18 = cells.find((c) => c.label.includes("18 SEP"));
    expect(sep18?.tone).not.toBe("empty");
    expect(sep19).toBeUndefined(); // empty cells lose day label
    expect(labeled.every((c) => {
      const day = Number(c.label.match(/(\d{2}) SEP/)?.[1]);
      return Number.isFinite(day) && day <= 18;
    })).toBe(true);
  });
});
