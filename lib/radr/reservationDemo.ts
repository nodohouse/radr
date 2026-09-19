/**
 * Berlin Mitte tonight: realistic simulated reservation operating input.
 * Aligns with venueProfiles BERLIN_TONIGHT_OPS (72 seats).
 */

import {
  BERLIN_TONIGHT_FORECAST,
  BERLIN_TONIGHT_OPS,
} from "./venueProfiles";
import {
  RESERVATION_CONFIG,
  calculateBookingConcentration,
  calculateCancellationExposureFromBookings,
  calculateServicePeak,
  expectedBookingValue,
  type BookingMixBucket,
  type GroupArrival,
  type Reservation,
  type ReservationSummary,
  type ServiceSlot,
} from "./reservationModel";

const LOC = "loc_ber";
const SPEND = BERLIN_TONIGHT_OPS.expectedSpendPerCover;

function res(
  partial: Pick<
    Reservation,
    "id" | "bookingDateTime" | "status" | "partySize" | "channel"
  > &
    Partial<
      Omit<
        Reservation,
        | "id"
        | "bookingDateTime"
        | "status"
        | "partySize"
        | "channel"
        | "locationId"
        | "createdAt"
        | "updatedAt"
      >
    > & { createdAt?: string },
): Reservation {
  const partySize = partial.partySize;
  const expected =
    partial.expectedBookingValue ?? expectedBookingValue(partySize, SPEND);
  return {
    locationId: LOC,
    createdAt: partial.createdAt ?? "2026-08-18T10:00:00",
    updatedAt: "2026-08-19T16:00:00",
    expectedSpendPerCover: SPEND,
    expectedBookingValue: expected,
    isGroup:
      partial.isGroup ?? partySize >= RESERVATION_CONFIG.groupPartySizeMin,
    isLargeParty:
      partial.isLargeParty ??
      partySize >= RESERVATION_CONFIG.largePartySizeMin,
    tags: partial.tags ?? [],
    id: partial.id,
    bookingDateTime: partial.bookingDateTime,
    status: partial.status,
    partySize,
    channel: partial.channel,
    tableId: partial.tableId,
    area: partial.area,
    depositAmount: partial.depositAmount,
    prepaidAmount: partial.prepaidAmount,
    cancelledAt: partial.cancelledAt,
    cancellationLeadMinutes: partial.cancellationLeadMinutes,
    noShow: partial.noShow,
    rebookedValue: partial.rebookedValue,
    recovered: partial.recovered,
  };
}

export const BERLIN_TONIGHT_RESERVATIONS: Reservation[] = [
  res({
    id: "r_g1",
    bookingDateTime: "2026-08-19T19:30:00",
    status: "confirmed",
    partySize: 12,
    channel: "direct",
    isGroup: true,
    isLargeParty: true,
    tags: ["corporate", "deposit"],
    depositAmount: 200,
    tableId: "t12",
    area: "main",
  }),
  res({
    id: "r_g2",
    bookingDateTime: "2026-08-19T20:00:00",
    status: "confirmed",
    partySize: 7,
    channel: "opentable",
    isGroup: true,
    tags: ["large_party"],
    tableId: "t08",
    area: "main",
  }),
  res({
    id: "r_late",
    bookingDateTime: "2026-08-19T20:00:00",
    status: "cancelled",
    partySize: 4,
    channel: "opentable",
    cancelledAt: "2026-08-19T18:05:00",
    cancellationLeadMinutes: 115,
    tableId: "t14",
    area: "main",
  }),
  res({
    id: "r_c2",
    bookingDateTime: "2026-08-19T19:00:00",
    status: "cancelled",
    partySize: 2,
    channel: "resy",
    cancelledAt: "2026-08-18T14:00:00",
    cancellationLeadMinutes: 1740,
  }),
  res({
    id: "r_c3",
    bookingDateTime: "2026-08-19T18:30:00",
    status: "cancelled",
    partySize: 2,
    channel: "direct",
    cancelledAt: "2026-08-19T11:00:00",
    cancellationLeadMinutes: 450,
  }),
  res({
    id: "r_c4",
    bookingDateTime: "2026-08-19T21:00:00",
    status: "cancelled",
    partySize: 1,
    channel: "phone",
    cancelledAt: "2026-08-19T12:00:00",
    cancellationLeadMinutes: 540,
  }),
  res({
    id: "r_vip",
    bookingDateTime: "2026-08-19T19:15:00",
    status: "confirmed",
    partySize: 2,
    channel: "direct",
    tags: ["vip", "anniversary"],
    tableId: "t03",
    area: "main",
  }),
];

/** Peak 19:00-20:30 ≈ 76 covers through windows. */
export const BERLIN_SERVICE_CURVE: ServiceSlot[] = [
  { time: "18:00", covers: 16 },
  { time: "18:30", covers: 21 },
  { time: "19:00", covers: 22 },
  { time: "19:30", covers: 28 },
  { time: "20:00", covers: 18 },
  { time: "20:30", covers: 8 },
];

export function buildBerlinTonightReservationSummary(): ReservationSummary {
  const reservations = BERLIN_TONIGHT_RESERVATIONS;
  const cancelled = reservations.filter((r) => r.status === "cancelled");
  const late = cancelled.filter(
    (r) =>
      r.cancellationLeadMinutes != null &&
      r.cancellationLeadMinutes < RESERVATION_CONFIG.lateCancellationHours * 60,
  );
  const noShows = reservations.filter((r) => r.status === "no_show" || r.noShow);

  const cancelledBookingValue = Math.round(9 * SPEND);
  const cancelMoney = calculateCancellationExposureFromBookings(
    cancelledBookingValue,
    380 / cancelledBookingValue,
  );

  const groupArrivals: GroupArrival[] = [
    { time: "19:30", covers: 12, expectedValue: 12 * SPEND },
    { time: "20:00", covers: 7, expectedValue: 7 * SPEND },
  ];
  const groupCovers = 19;
  const groupExpectedValue = groupCovers * SPEND;

  const peak = calculateServicePeak(
    BERLIN_SERVICE_CURVE,
    RESERVATION_CONFIG.peakWindow.start,
    RESERVATION_CONFIG.peakWindow.end,
    RESERVATION_CONFIG.peakServiceCapacity,
  );

  const concentration = calculateBookingConcentration(
    reservations.filter((r) => r.status === "confirmed"),
    3,
  );

  const bookingMix: BookingMixBucket[] = (
    [
      { key: "standard", label: "Standard", count: 44, covers: 99 },
      { key: "group", label: "Group", count: 2, covers: 19 },
      { key: "large_party", label: "Large party", count: 0, covers: 0 },
      { key: "private_event", label: "Private / event", count: 0, covers: 0 },
    ] as const satisfies readonly BookingMixBucket[]
  ).filter((b) => b.count > 0);

  const ops = BERLIN_TONIGHT_OPS;
  const lateValue = Math.round(4 * SPEND);
  const lateExposed = calculateCancellationExposureFromBookings(
    lateValue,
    90 / lateValue,
  );

  return {
    locationId: LOC,
    dateLabel: "Wednesday, 19 August",
    reservationCount: ops.reservationCount,
    bookedCovers: ops.bookedCovers,
    expectedAdditionalCovers: ops.expectedAdditionalCovers,
    forecastCovers: BERLIN_TONIGHT_FORECAST.covers,
    expectedOccupancy: ops.expectedOccupancyPct,
    bookingPaceVsComparable: ops.bookingPaceVsComparable,
    bookingPaceVsForecast: ops.bookingPaceVsForecast,
    pctOfFinalDemandBooked: ops.pctOfFinalDemandBooked,
    cancellationCount: 4,
    cancelledCovers: 9,
    lateCancellationCount: Math.max(1, late.length),
    lateCancelledCovers: 4,
    noShowCount: noShows.length,
    noShowCovers: noShows.reduce((s, r) => s + r.partySize, 0),
    groupBookingCount: 2,
    groupCovers,
    largePartyCount: 1,
    grossBookingValue: Math.round(ops.bookedCovers * SPEND),
    cancelledBookingValue,
    expectedRecoveredValue: cancelMoney.expectedRecovered,
    revenueAtRisk: cancelMoney.revenueAtRisk,
    lateExposedValue: lateExposed.revenueAtRisk,
    groupExpectedValue,
    largestGroup: groupArrivals[0],
    bookingMix,
    serviceCurve: BERLIN_SERVICE_CURVE,
    peakWindowLabel: `${RESERVATION_CONFIG.peakWindow.start}-${RESERVATION_CONFIG.peakWindow.end}`,
    peakCovers: peak.peakCovers,
    peakCapacity: RESERVATION_CONFIG.peakServiceCapacity,
    peakGap: peak.gap,
    servicePressure: peak.pressure,
    groupArrivals,
    specialSummary: ["2 group bookings", "1 VIP booking"],
    concentrationPct: concentration.pct || 16,
    concentrationTopCount: concentration.topCount || 2,
    concentrationValue: concentration.value || groupExpectedValue,
  };
}

export const BERLIN_RESERVATION_SUMMARY = buildBerlinTonightReservationSummary();
