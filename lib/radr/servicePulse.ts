/**
 * Tonight / service pulse: waitlist, group demand, cancellation economics.
 * Shared by Control Center Overview (location + group). Demo math only.
 *
 * Late-cancellation money on the Control Center uses the canonical Table 14
 * recovery scenario only. Do not invent a second open cancellation story.
 */

import { formatAtRiskEuro } from "@/lib/radr/cancellationModel";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import {
  RESERVATION_CONFIG,
  expectedBookingValue,
  type ReservationSummary,
  type ServiceSlot,
} from "@/lib/radr/reservationModel";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import { BERLIN_TONIGHT_OPS } from "@/lib/radr/venueProfiles";

export type WaitlistParty = {
  id: string;
  covers: number;
  requestedTime: string;
  waitedMinutes: number;
  seatingPreference?: string;
  convertProbability: number;
  expectedValue: number;
};

export type CancellationEconomics = {
  bookingValue: number;
  waitlistMatchValue: number;
  waitlistMatchLabel: string | null;
  naturalRebookExpected: number;
  currentlyAtRisk: number;
  recoverableNow: boolean;
  actionLabel: string;
  /** Canonical Table 14 outcome when the recovery is already verified. */
  mode: "open_exposure" | "verified_outcome";
  potentialRecovery: number;
  observedPos: number;
  verifiedValue: number;
  findingId: string;
  tableLabel: string;
};

export type LocationTonightPulse = {
  dateLabel: string;
  reservations: number;
  bookedCovers: number;
  waitlistGuests: number;
  waitlistParties: number;
  waitlistDetail: WaitlistParty[];
  waitlistOpportunity: WaitlistParty | null;
  waitlistPotentialEuro: number;
  largestParty: { covers: number; time: string } | null;
  cancellations: number;
  cancelledBookingValue: number;
  cancellationEconomics: CancellationEconomics;
  noShowRiskBookings: number;
  noShowRiskEuro: number;
  expectedCovers: number;
  expectedOccupancyPct: number;
  expectedRevenueEuro: number;
  expectedRevenueDisplay: string;
  peakService: string;
  groupBookings: number;
  groupArrivals: { covers: number; time: string; expectedValue: number }[];
  groupPotentialEuro: number;
  groupImplication: string;
  serviceCurve: ServiceSlot[];
  narrative: string;
};

export type GroupTonightPulse = {
  locationCount: number;
  expectedRevenueEuro: number;
  expectedRevenueDisplay: string;
  expectedCovers: number;
  expectedOccupancyPct: number;
  valueAtRiskEuro: number;
  locationsNeedingAttention: number;
  waitlistGuests: number;
  waitlistLocations: number;
  groupBookings: number;
  lateCancellations: number;
  concentrationNarrative: string;
  hotLocations: {
    id: string;
    name: string;
    atRiskEuro: number;
    reason: string;
  }[];
};

const SPEND = BERLIN_TONIGHT_OPS.expectedSpendPerCover;

/** Berlin Mitte waitlist: demand that can absorb late inventory. */
export const BERLIN_WAITLIST: WaitlistParty[] = [
  {
    id: "wl_1",
    covers: 2,
    requestedTime: "19:30",
    waitedMinutes: 18,
    seatingPreference: "Main dining",
    convertProbability: 0.72,
    expectedValue: expectedBookingValue(2, SPEND),
  },
  {
    id: "wl_2",
    covers: 2,
    requestedTime: "20:00",
    waitedMinutes: 12,
    seatingPreference: "Any",
    convertProbability: 0.68,
    expectedValue: expectedBookingValue(2, SPEND),
  },
  {
    id: "wl_3",
    covers: 3,
    requestedTime: "20:00",
    waitedMinutes: 9,
    seatingPreference: "Booth preferred",
    convertProbability: 0.81,
    expectedValue: expectedBookingValue(3, SPEND),
  },
];

/**
 * Cancellation economics: booking value − waitlist match − natural rebook.
 * Prevents overstating loss when recoverable demand exists.
 */
export function calculateCancellationEconomics(input: {
  bookingValue: number;
  waitlistMatchValue: number;
  waitlistMatchLabel: string | null;
  naturalRebookProbability: number;
}): CancellationEconomics {
  const naturalRebookExpected = Math.round(
    input.bookingValue * input.naturalRebookProbability,
  );
  const afterWaitlist = Math.max(
    0,
    input.bookingValue - input.waitlistMatchValue,
  );
  const currentlyAtRisk = Math.max(0, afterWaitlist - naturalRebookExpected);
  const recoverableNow = input.waitlistMatchValue > 0;
  return {
    bookingValue: input.bookingValue,
    waitlistMatchValue: input.waitlistMatchValue,
    waitlistMatchLabel: input.waitlistMatchLabel,
    naturalRebookExpected,
    currentlyAtRisk,
    recoverableNow,
    actionLabel: recoverableNow ? "Match waitlist →" : "Review inventory →",
    mode: "open_exposure",
    potentialRecovery: input.waitlistMatchValue,
    observedPos: 0,
    verifiedValue: 0,
    findingId: "",
    tableLabel: "Open cancellation",
  };
}

/** Preferred Control Center story: Table 14 verified recovery, not a second open cancel. */
export function table14VerifiedCancellationEconomics(): CancellationEconomics {
  const s = getCancellationRecoveryScenario();
  const booking = s.reservation.expectedBookingValueMajor;
  const potential = s.potentialRecoverableMajor;
  const observed = s.pos.observedRevenueMajor;
  const verified = s.verification?.verifiedValue ?? observed;
  return {
    bookingValue: booking,
    waitlistMatchValue: potential,
    waitlistMatchLabel: `${s.waitlist.partySize} guests · waitlist match`,
    naturalRebookExpected: 0,
    currentlyAtRisk: 0,
    recoverableNow: false,
    actionLabel: "View proof →",
    mode: "verified_outcome",
    potentialRecovery: potential,
    observedPos: observed,
    verifiedValue: verified,
    findingId: s.id,
    tableLabel: `Table ${s.reservation.tableId} cancellation`,
  };
}

export function buildLocationTonightPulse(
  summary: ReservationSummary = BERLIN_RESERVATION_SUMMARY,
  waitlist: WaitlistParty[] = BERLIN_WAITLIST,
): LocationTonightPulse {
  const economics = table14VerifiedCancellationEconomics();

  const waitlistGuests = waitlist.reduce((s, p) => s + p.covers, 0);
  const opportunity =
    [...waitlist].sort(
      (a, b) =>
        b.expectedValue * b.convertProbability -
        a.expectedValue * a.convertProbability,
    )[0] ?? null;
  const waitlistPotentialEuro = waitlist.reduce(
    (s, p) => s + Math.round(p.expectedValue * p.convertProbability),
    0,
  );

  const largest = summary.largestGroup;
  const groupImplication =
    largest && largest.covers >= 10
      ? `${largest.covers}-person party at ${largest.time} overlaps peak service.`
      : summary.groupBookingCount > 0
        ? `Large-party demand lifts kitchen load through ${summary.peakWindowLabel}.`
        : "No material group pressure tonight.";

  const expectedRevenueEuro = Math.round(summary.forecastCovers * SPEND);
  const narrative =
    economics.mode === "verified_outcome"
      ? `Peak service ${summary.peakWindowLabel} is the binding constraint tonight. Table 14 late cancellation already recovered ${formatAtRiskEuro(economics.verifiedValue)} verified value.`
      : `Peak service ${summary.peakWindowLabel} is the binding constraint; ${summary.groupBookingCount} group bookings concentrate demand.`;

  return {
    dateLabel: summary.dateLabel,
    reservations: summary.reservationCount,
    bookedCovers: summary.bookedCovers,
    waitlistGuests,
    waitlistParties: waitlist.length,
    waitlistDetail: waitlist,
    waitlistOpportunity: opportunity,
    waitlistPotentialEuro,
    largestParty: largest
      ? { covers: largest.covers, time: largest.time }
      : null,
    cancellations: summary.cancellationCount,
    cancelledBookingValue: summary.cancelledBookingValue,
    cancellationEconomics: economics,
    noShowRiskBookings: Math.max(2, summary.noShowCount || 2),
    noShowRiskEuro: Math.round(2 * SPEND),
    expectedCovers: summary.forecastCovers,
    expectedOccupancyPct: summary.expectedOccupancy,
    expectedRevenueEuro,
    expectedRevenueDisplay: formatAtRiskEuro(expectedRevenueEuro),
    peakService: summary.peakWindowLabel,
    groupBookings: summary.groupBookingCount,
    groupArrivals: summary.groupArrivals.map((g) => ({
      covers: g.covers,
      time: g.time,
      expectedValue: g.expectedValue,
    })),
    groupPotentialEuro: summary.groupExpectedValue,
    groupImplication,
    serviceCurve: summary.serviceCurve,
    narrative,
  };
}

export function buildGroupTonightPulse(atRiskEuro: number): GroupTonightPulse {
  const expectedCovers = 2184;
  const expectedRevenueEuro = 142_000;
  const hot = [
    {
      id: "loc_ber",
      name: "Berlin Mitte",
      atRiskEuro: Math.round(atRiskEuro * 0.42),
      reason: "Peak staffing + late cancel",
    },
    {
      id: "loc_nyc",
      name: "New York Flatiron",
      atRiskEuro: Math.round(atRiskEuro * 0.16),
      reason: "Labor % above plan",
    },
    {
      id: "loc_tyo",
      name: "Tokyo Shibuya",
      atRiskEuro: Math.round(atRiskEuro * 0.08),
      reason: "Cancellation cluster",
    },
    {
      id: "loc_sf",
      name: "San Francisco Hayes",
      atRiskEuro: Math.round(atRiskEuro * 0.05),
      reason: "Supplier variance",
    },
  ];
  const hotShare = Math.round(
    (hot.reduce((s, h) => s + h.atRiskEuro, 0) / Math.max(atRiskEuro, 1)) * 100,
  );

  return {
    locationCount: 12,
    expectedRevenueEuro,
    expectedRevenueDisplay: formatAtRiskEuro(expectedRevenueEuro),
    expectedCovers,
    expectedOccupancyPct: 81,
    valueAtRiskEuro: atRiskEuro,
    locationsNeedingAttention: 4,
    waitlistGuests: 138,
    waitlistLocations: 11,
    groupBookings: 26,
    lateCancellations: 18,
    concentrationNarrative: `${hot.length} locations account for ${hotShare}% of today's financial exposure.`,
    hotLocations: hot,
  };
}

export const GROUP_THRESHOLD_NOTE = `Group bookings use a configurable threshold (demo default ${RESERVATION_CONFIG.groupPartySizeMin}+ guests).`;
