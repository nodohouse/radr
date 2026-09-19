import { describe, expect, it } from "vitest";
import {
  calculateBookingConcentration,
  calculateCancellationExposureFromBookings,
  calculateServicePeak,
  isGroupParty,
  isLateCancellation,
} from "@/lib/radr/reservationModel";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { assertDemoConsistency } from "@/lib/radr/demoValidators";

describe("reservationModel", () => {
  it("uses config threshold for group parties", () => {
    expect(isGroupParty(7)).toBe(false);
    expect(isGroupParty(8)).toBe(true);
  });

  it("flags late cancellations by lead time", () => {
    expect(isLateCancellation(300)).toBe(false);
    expect(isLateCancellation(100)).toBe(true);
  });

  it("separates cancelled value from revenue at risk", () => {
    const r = calculateCancellationExposureFromBookings(576, 380 / 576);
    expect(r.expectedRecovered).toBe(380);
    expect(r.revenueAtRisk).toBe(196);
  });

  it("computes service peak pressure", () => {
    const peak = calculateServicePeak(
      [
        { time: "19:00", covers: 22 },
        { time: "19:30", covers: 28 },
        { time: "20:00", covers: 18 },
        { time: "20:30", covers: 8 },
      ],
      "19:00",
      "20:30",
      66,
    );
    expect(peak.peakCovers).toBe(76);
    expect(peak.gap).toBe(10);
    expect(peak.pressure).toBe("HIGH");
  });

  it("Berlin summary keeps reservations distinct from covers", () => {
    expect(BERLIN_RESERVATION_SUMMARY.reservationCount).toBe(46);
    expect(BERLIN_RESERVATION_SUMMARY.bookedCovers).toBe(118);
    expect(BERLIN_RESERVATION_SUMMARY.forecastCovers).toBe(142);
    expect(BERLIN_RESERVATION_SUMMARY.reservationCount).not.toBe(
      BERLIN_RESERVATION_SUMMARY.bookedCovers,
    );
    expect(BERLIN_RESERVATION_SUMMARY.revenueAtRisk).toBe(196);
  });

  it("concentration helper returns pct of top bookings", () => {
    const r = calculateBookingConcentration(
      [
        {
          id: "a",
          locationId: "loc_ber",
          bookingDateTime: "",
          createdAt: "",
          updatedAt: "",
          status: "confirmed",
          partySize: 14,
          channel: "direct",
          isGroup: true,
          isLargeParty: true,
          tags: [],
          expectedBookingValue: 1000,
        },
        {
          id: "b",
          locationId: "loc_ber",
          bookingDateTime: "",
          createdAt: "",
          updatedAt: "",
          status: "confirmed",
          partySize: 4,
          channel: "direct",
          isGroup: false,
          isLargeParty: false,
          tags: [],
          expectedBookingValue: 200,
        },
      ],
      1,
    );
    expect(r.pct).toBe(83);
    expect(r.value).toBe(1000);
  });
});

describe("demoValidators", () => {
  it("passes Berlin hospitality consistency", () => {
    expect(() => assertDemoConsistency()).not.toThrow();
  });
});
