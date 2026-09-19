/**
 * Operating context fed into detection rules / forecast / brief.
 * Demo provider fills this from fixtures; live providers will query DB.
 */

import type { DataSourceFreshness } from "@/lib/radr/findingIntelligence";
import type { DomainReservation, WaitlistEntry } from "@/lib/radr/domain";

export type OperatingContext = {
  organizationId: string;
  locationId: string;
  locationName: string;
  currency: string;
  timezone: string;

  /** ISO date for "tonight" / business date */
  businessDate: string;

  forecast: {
    covers: number;
    revenue: number;
    bookedCovers: number;
    walkIns: number;
    noShows: number;
    waitlistConversion: number;
    occupancy: number;
    margin: number;
    laborDemandCovers: number;
    servicePressure: "low" | "moderate" | "high" | "critical";
    confidenceScore: number;
    drivers: { label: string; value: string }[];
  };

  capacity: {
    peakWindowStart: string;
    peakWindowEnd: string;
    peakCapacityCovers: number;
    sectionBCapacity?: number;
    sectionBPeakCovers?: number;
  };

  bookings: {
    reservationCount: number;
    bookedCovers: number;
    bookingPaceVsComparable: number;
    groupCovers: number;
    groupBookingCount: number;
    expectedAdditionalCovers: number;
    expectedSpendPerCover: number;
    contributionRate: number;
    lateCancellations: {
      reservations: number;
      covers: number;
      rebookingProbability: number;
    };
  };

  labor: {
    fohPeakCapacity: number;
    fohCostPerShift: number;
    revenueAtRiskIfGap: number;
  };

  supplier?: {
    invoiceTotal: number;
    contractedTotal: number;
    lines: { label: string; variance: number }[];
  };

  waitlist: WaitlistEntry[];
  reservations: DomainReservation[];

  dataFreshness: DataSourceFreshness[];

  /** Tomorrow's daily forecast when the weather port is wired. */
  weatherTomorrow?: {
    highC: number;
    precipitationProbabilityPct: number;
    condition: string;
    summary: string;
  };

  terrace?: {
    scheduledTerraceCapacity: number;
    comparableWarmDryLiftPct: number;
    expectedDemandCovers: number;
    fohPlanCovers: number;
    contributionPerCover: number;
    fohCostToCapture: number;
    comparableSampleSize: number;
    peakStart: string;
    peakEnd: string;
    lunchPeakStart: string;
    lunchPeakEnd: string;
    reservationPaceLabel?: string;
  };
};

export type OperatingContextProvider = {
  getContext(locationId: string): OperatingContext | null;
};
