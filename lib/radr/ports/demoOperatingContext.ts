/**
 * Demo OperatingContext provider - Berlin Midte tonight story.
 * Not a live integration. Implements the same port live providers will.
 */

import { DEMO_ORG } from "@/lib/radr/demoModel";
import {
  DEMO_AS_OF_ISO,
  DEMO_BUSINESS_DATE,
  DEMO_TIMEZONE,
  isoOnDemoDate,
} from "@/lib/radr/demoClock";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { BERLIN_WAITLIST } from "@/lib/radr/servicePulse";
import {
  BERLIN_TONIGHT_FORECAST,
  BERLIN_TONIGHT_OPS,
} from "@/lib/radr/venueProfiles";
import type { WaitlistEntry } from "@/lib/radr/domain";
import { BERLIN_TERRACE_WEATHER } from "@/lib/radr/weather/calc";
import { berlinTomorrowWeather } from "@/lib/radr/weather/demoProvider";

const FRESH = {
  bookings: {
    key: "bookings" as const,
    label: "Bookings",
    lastSyncLabel: "2m ago",
    ageMinutes: 2,
  },
  labor: {
    key: "labor" as const,
    label: "Labor",
    lastSyncLabel: "4h ago",
    ageMinutes: 240,
  },
  invoices: {
    key: "supplier_invoices" as const,
    label: "Supplier invoices",
    lastSyncLabel: "14m ago",
    ageMinutes: 14,
  },
};

function mapWaitlist(): WaitlistEntry[] {
  const now = DEMO_AS_OF_ISO;
  return BERLIN_WAITLIST.map((p) => ({
    id: p.id,
    organizationId: DEMO_ORG.id,
    locationId: "loc_ber",
    externalId: p.id,
    provider: "demo_reservations",
    requestedServiceTime: isoOnDemoDate(DEMO_BUSINESS_DATE, p.requestedTime),
    partySize: p.covers,
    status: "waiting" as const,
    quotedWaitMinutes: p.waitedMinutes,
    actualWaitMinutes: p.waitedMinutes,
    seatingPreference: p.seatingPreference ?? null,
    createdAt: now,
    updatedAt: now,
    matchedReservationId: null,
    expectedValue: p.expectedValue,
    convertProbability: p.convertProbability,
  }));
}

export function getDemoOperatingContext(
  locationId: string,
): OperatingContext | null {
  if (locationId !== "loc_ber") return null;

  const rs = BERLIN_RESERVATION_SUMMARY;
  const ops = BERLIN_TONIGHT_OPS;
  const fc = BERLIN_TONIGHT_FORECAST;

  return {
    organizationId: DEMO_ORG.id,
    locationId: "loc_ber",
    locationName: "Berlin Mitte",
    currency: "EUR",
    timezone: DEMO_TIMEZONE,
    businessDate: DEMO_BUSINESS_DATE,

    forecast: {
      covers: fc.covers,
      revenue: fc.revenue,
      bookedCovers: rs.bookedCovers,
      walkIns: rs.expectedAdditionalCovers,
      noShows: 5,
      waitlistConversion: 5,
      occupancy: rs.expectedOccupancy,
      margin: 17.4,
      laborDemandCovers: fc.covers,
      servicePressure: "high",
      confidenceScore: 78,
      drivers: [
        { label: "Currently booked", value: String(rs.bookedCovers) },
        {
          label: "Expected additional demand",
          value: `+${rs.expectedAdditionalCovers}`,
        },
        { label: "Expected no-shows", value: "-5" },
        { label: "Expected waitlist conversion", value: "+5" },
      ],
    },

    capacity: {
      peakWindowStart: "19:00",
      peakWindowEnd: "20:30",
      peakCapacityCovers: ops.peakServiceCapacity,
      sectionBCapacity: ops.sectionBCapacity,
      sectionBPeakCovers: ops.sectionBPeakCovers,
    },

    bookings: {
      reservationCount: rs.reservationCount,
      bookedCovers: rs.bookedCovers,
      bookingPaceVsComparable: ops.bookingPaceVsComparable,
      groupCovers: rs.groupCovers,
      groupBookingCount: rs.groupBookingCount,
      expectedAdditionalCovers: rs.expectedAdditionalCovers,
      expectedSpendPerCover: ops.expectedSpendPerCover,
      contributionRate: ops.contributionRate,
      lateCancellations: {
        reservations: 1,
        covers: 4,
        rebookingProbability: 90 / 256,
      },
    },

    labor: {
      fohPeakCapacity: ops.peakServiceCapacity,
      fohCostPerShift: 68,
      revenueAtRiskIfGap: 290,
    },

    supplier: {
      invoiceTotal: 2840,
      contractedTotal: 2722,
      lines: [
        { label: "Tomatoes", variance: 46 },
        { label: "Olive oil", variance: 38 },
        { label: "Fresh herbs", variance: 34 },
      ],
    },

    waitlist: mapWaitlist(),
    reservations: [],

    dataFreshness: [FRESH.bookings, FRESH.labor, FRESH.invoices],

    weatherTomorrow: (() => {
      const wx = berlinTomorrowWeather();
      return {
        highC: wx.highC,
        precipitationProbabilityPct: wx.precipitationProbabilityPct,
        condition: wx.condition,
        summary: wx.summary,
      };
    })(),
    terrace: { ...BERLIN_TERRACE_WEATHER },
  };
}

export const demoOperatingContextProvider = {
  getContext: getDemoOperatingContext,
};
