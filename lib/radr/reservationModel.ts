/**
 * Reservation domain: operating input for RADR intelligence.
 * Demo / simulated data only. Thresholds live in config, not JSX.
 */

export type ReservationStatus =
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export type ReservationTag =
  | "vip"
  | "birthday"
  | "anniversary"
  | "corporate"
  | "large_party"
  | "private_dining"
  | "prepaid"
  | "deposit"
  | "special_menu"
  | "accessibility";

export type ReservationChannel =
  | "direct"
  | "opentable"
  | "resy"
  | "phone"
  | "walk_in_hold";

export type Reservation = {
  id: string;
  locationId: string;
  bookingDateTime: string;
  createdAt: string;
  updatedAt: string;
  status: ReservationStatus;
  partySize: number;
  channel: ReservationChannel;
  tableId?: string;
  area?: string;
  expectedSpendPerCover?: number;
  expectedBookingValue?: number;
  isGroup: boolean;
  isLargeParty: boolean;
  tags: ReservationTag[];
  depositAmount?: number;
  prepaidAmount?: number;
  cancelledAt?: string;
  cancellationLeadMinutes?: number;
  noShow?: boolean;
  rebookedValue?: number;
  recovered?: boolean;
};

/** Location / product config: not hard-coded in UI. */
export const RESERVATION_CONFIG = {
  groupPartySizeMin: 8,
  largePartySizeMin: 10,
  lateCancellationHours: 4,
  peakWindow: { start: "19:00", end: "20:30" } as const,
  /** Peak FOH cover-equivalent capacity (Berlin demo) */
  peakServiceCapacity: 66,
  contributionRate: 0.334,
  seatsAvailable: 72,
} as const;

export type ServiceSlot = {
  time: string;
  covers: number;
};

export type BookingMixBucket = {
  key: "standard" | "group" | "large_party" | "private_event";
  label: string;
  count: number;
  covers: number;
};

export type GroupArrival = {
  time: string;
  covers: number;
  expectedValue: number;
  label?: string;
};

export type ReservationSummary = {
  locationId: string;
  dateLabel: string;
  reservationCount: number;
  bookedCovers: number;
  expectedAdditionalCovers: number;
  forecastCovers: number;
  expectedOccupancy: number;
  bookingPaceVsComparable: number;
  bookingPaceVsForecast: number;
  pctOfFinalDemandBooked: number;
  cancellationCount: number;
  cancelledCovers: number;
  lateCancellationCount: number;
  lateCancelledCovers: number;
  noShowCount: number;
  noShowCovers: number;
  groupBookingCount: number;
  groupCovers: number;
  largePartyCount: number;
  grossBookingValue: number;
  cancelledBookingValue: number;
  expectedRecoveredValue: number;
  revenueAtRisk: number;
  lateExposedValue: number;
  groupExpectedValue: number;
  largestGroup: GroupArrival | null;
  bookingMix: BookingMixBucket[];
  serviceCurve: ServiceSlot[];
  peakWindowLabel: string;
  peakCovers: number;
  peakCapacity: number;
  peakGap: number;
  servicePressure: "LOW" | "MODERATE" | "HIGH";
  groupArrivals: GroupArrival[];
  specialSummary: string[];
  concentrationPct: number;
  concentrationTopCount: number;
  concentrationValue: number;
};

export function expectedBookingValue(
  partySize: number,
  spendPerCover: number,
): number {
  return Math.round(partySize * spendPerCover);
}

export function isGroupParty(
  partySize: number,
  min = RESERVATION_CONFIG.groupPartySizeMin,
): boolean {
  return partySize >= min;
}

export function isLateCancellation(
  leadMinutes: number | undefined,
  lateHours = RESERVATION_CONFIG.lateCancellationHours,
): boolean {
  if (leadMinutes == null) return false;
  return leadMinutes < lateHours * 60;
}

export function calculateCancellationExposureFromBookings(
  cancelledBookingValue: number,
  rebookingProbability: number,
): { expectedRecovered: number; revenueAtRisk: number } {
  const expectedRecovered = Math.round(
    cancelledBookingValue * rebookingProbability,
  );
  return {
    expectedRecovered,
    revenueAtRisk: Math.max(0, cancelledBookingValue - expectedRecovered),
  };
}

export function calculateServicePeak(
  curve: ServiceSlot[],
  start: string,
  end: string,
  capacity: number,
): { peakCovers: number; gap: number; pressure: "LOW" | "MODERATE" | "HIGH" } {
  const peakCovers = curve
    .filter((s) => s.time >= start && s.time <= end)
    .reduce((sum, s) => sum + s.covers, 0);
  const gap = Math.max(0, peakCovers - capacity);
  const ratio = capacity > 0 ? peakCovers / capacity : 1;
  const pressure =
    ratio >= 1.08 || gap >= 12 ? "HIGH" : ratio >= 1.0 || gap >= 5 ? "MODERATE" : "LOW";
  return { peakCovers, gap, pressure };
}

export function calculateBookingConcentration(
  reservations: Reservation[],
  topN = 3,
): { pct: number; value: number; topCount: number } {
  const active = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "seated",
  );
  const total = active.reduce(
    (s, r) => s + (r.expectedBookingValue ?? 0),
    0,
  );
  if (!total) return { pct: 0, value: 0, topCount: 0 };
  const top = [...active]
    .sort(
      (a, b) =>
        (b.expectedBookingValue ?? 0) - (a.expectedBookingValue ?? 0),
    )
    .slice(0, topN);
  const value = top.reduce((s, r) => s + (r.expectedBookingValue ?? 0), 0);
  return {
    pct: Math.round((value / total) * 100),
    value,
    topCount: top.length,
  };
}
