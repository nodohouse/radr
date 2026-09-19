/**
 * Forecast learning loop stubs - predicted vs actual after each service.
 * Improves location-specific models over time.
 */

export type ForecastLearningRecord = {
  locationId: string;
  serviceId: string;
  businessDate: string;
  predicted: {
    walkIns: number;
    covers: number;
    revenue: number;
    terraceLiftCovers: number;
    staffingGapCovers: number;
  };
  actual: {
    walkIns: number | null;
    covers: number | null;
    revenue: number | null;
    terraceLiftCovers: number | null;
    staffingGapCovers: number | null;
  };
  errors: {
    walkIns: number | null;
    covers: number | null;
    revenue: number | null;
  };
};

export function computeForecastErrors(
  predicted: ForecastLearningRecord["predicted"],
  actual: ForecastLearningRecord["actual"],
): ForecastLearningRecord["errors"] {
  return {
    walkIns:
      actual.walkIns == null ? null : actual.walkIns - predicted.walkIns,
    covers: actual.covers == null ? null : actual.covers - predicted.covers,
    revenue:
      actual.revenue == null ? null : actual.revenue - predicted.revenue,
  };
}

/** Demo post-shift outcomes for learning UI. */
export function demoPostShiftLearning(): ForecastLearningRecord {
  const predicted = {
    walkIns: 26,
    covers: 142,
    revenue: 9480,
    terraceLiftCovers: 14,
    staffingGapCovers: 14,
  };
  const actual = {
    walkIns: 29,
    covers: 149,
    revenue: 9740,
    terraceLiftCovers: 16,
    staffingGapCovers: 14,
  };
  return {
    locationId: "loc_ber",
    serviceId: "sp_ber_2026-08-19_dinner",
    businessDate: "2026-08-19",
    predicted,
    actual,
    errors: computeForecastErrors(predicted, actual),
  };
}
