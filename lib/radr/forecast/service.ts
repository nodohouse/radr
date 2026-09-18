/**
 * Forecasting domain service - drivers + confidence, not hard-coded UI numbers.
 */

import type { OperatingContext } from "@/lib/radr/ports/operatingContext";

export type ForecastResult = {
  locationId: string;
  businessDate: string;
  forecastReservations: number;
  forecastBookedCovers: number;
  forecastWalkIns: number;
  forecastWaitlistConversion: number;
  forecastNoShows: number;
  forecastCovers: number;
  forecastRevenue: number;
  forecastAverageSpend: number;
  forecastOccupancy: number;
  forecastMargin: number;
  forecastLaborDemand: number;
  forecastServicePressure: OperatingContext["forecast"]["servicePressure"];
  confidenceScore: number;
  drivers: { label: string; value: string }[];
  baselines: {
    planCovers?: number;
    priorYearCovers?: number;
    comparableWeekdayCovers?: number;
  };
};

export function computeForecast(ctx: OperatingContext): ForecastResult {
  const booked = ctx.forecast.bookedCovers;
  const walkIns = ctx.forecast.walkIns;
  const waitlist = ctx.forecast.waitlistConversion;
  const noShows = ctx.forecast.noShows;
  const covers = Math.max(
    0,
    booked + walkIns + waitlist - noShows,
  );
  // Prefer explicit forecast covers from context when provided (venue model)
  const forecastCovers = ctx.forecast.covers || covers;
  const avgSpend = ctx.bookings.expectedSpendPerCover;
  const revenue = ctx.forecast.revenue || Math.round(forecastCovers * avgSpend);

  return {
    locationId: ctx.locationId,
    businessDate: ctx.businessDate,
    forecastReservations: ctx.bookings.reservationCount,
    forecastBookedCovers: booked,
    forecastWalkIns: walkIns,
    forecastWaitlistConversion: waitlist,
    forecastNoShows: noShows,
    forecastCovers,
    forecastRevenue: revenue,
    forecastAverageSpend: avgSpend,
    forecastOccupancy: ctx.forecast.occupancy,
    forecastMargin: ctx.forecast.margin,
    forecastLaborDemand: ctx.forecast.laborDemandCovers || forecastCovers,
    forecastServicePressure: ctx.forecast.servicePressure,
    confidenceScore: ctx.forecast.confidenceScore,
    drivers:
      ctx.forecast.drivers.length > 0
        ? ctx.forecast.drivers
        : [
            { label: "Currently booked", value: String(booked) },
            { label: "Expected additional demand", value: `+${walkIns}` },
            { label: "Expected no-shows", value: `-${noShows}` },
            {
              label: "Expected waitlist conversion",
              value: `+${waitlist}`,
            },
          ],
    baselines: {
      comparableWeekdayCovers: Math.round(
        booked / (1 + ctx.bookings.bookingPaceVsComparable / 100),
      ),
    },
  };
}

/** Labor demand from forecast - gap vs current FOH capacity. */
export function laborDemandFromForecast(
  ctx: OperatingContext,
  forecast = computeForecast(ctx),
): {
  window: string;
  forecastActiveDemand: number;
  currentFohCapacity: number;
  gap: number;
  recommendation: string | null;
} {
  const gap = Math.max(
    0,
    forecast.forecastLaborDemand - ctx.capacity.peakCapacityCovers,
  );
  return {
    window: `${ctx.capacity.peakWindowStart}-${ctx.capacity.peakWindowEnd}`,
    forecastActiveDemand: forecast.forecastLaborDemand,
    currentFohCapacity: ctx.capacity.peakCapacityCovers,
    gap,
    recommendation: gap > 0 ? "+1 FOH" : null,
  };
}
