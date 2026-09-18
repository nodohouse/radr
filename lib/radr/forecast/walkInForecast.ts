/**
 * Walk-in forecast - first-class demand layer (not reservation residual).
 */

import type { AreaFootfallEstimate } from "@/lib/radr/ports/footfall";

export type WalkInForecast = {
  locationId: string;
  serviceLabel: string;
  /** Point estimate */
  expected: number;
  rangeLow: number;
  rangeHigh: number;
  peakWindow: { start: string; end: string };
  expectedRevenue: number;
  expectedCoversFromWalkIns: number;
  avgPartySize: number;
  spendPerCover: number;
  confidence: "low" | "medium" | "high";
  drivers: { label: string; deltaCovers: number }[];
  footfall: AreaFootfallEstimate | null;
};

export function composeWalkInForecast(input: {
  locationId: string;
  serviceLabel: string;
  baseWalkIns: number;
  weatherLift: number;
  eventLift: number;
  bookingPaceLift: number;
  transitDrag: number;
  avgPartySize: number;
  spendPerCover: number;
  peakWindow: { start: string; end: string };
  footfall: AreaFootfallEstimate | null;
}): WalkInForecast {
  const expected = Math.max(
    0,
    Math.round(
      input.baseWalkIns +
        input.weatherLift +
        input.eventLift +
        input.bookingPaceLift +
        input.transitDrag,
    ),
  );
  const band = Math.max(3, Math.round(expected * 0.2));
  const covers = Math.round(expected * input.avgPartySize);
  const revenue = Math.round(covers * input.spendPerCover);

  const drivers: WalkInForecast["drivers"] = [
    { label: "Historical walk-ins", deltaCovers: input.baseWalkIns },
  ];
  if (input.weatherLift !== 0) {
    drivers.push({ label: "Weather / terrace", deltaCovers: input.weatherLift });
  }
  if (input.eventLift !== 0) {
    drivers.push({ label: "Local event", deltaCovers: input.eventLift });
  }
  if (input.bookingPaceLift !== 0) {
    drivers.push({ label: "Booking pace", deltaCovers: input.bookingPaceLift });
  }
  if (input.transitDrag !== 0) {
    drivers.push({
      label: "Transit / arrival friction",
      deltaCovers: input.transitDrag,
    });
  }

  // If footfall conversion is available, sanity-check point estimate
  let confidence: WalkInForecast["confidence"] = "medium";
  if (input.footfall?.historicalConversionRate != null) {
    const fromFootfall = Math.round(
      input.footfall.estimatedPeople * input.footfall.historicalConversionRate,
    );
    const gap = Math.abs(fromFootfall - expected);
    confidence =
      gap <= 4 ? "high" : gap <= 8 ? "medium" : input.footfall.confidence;
  }

  return {
    locationId: input.locationId,
    serviceLabel: input.serviceLabel,
    expected,
    rangeLow: Math.max(0, expected - band),
    rangeHigh: expected + band,
    peakWindow: input.peakWindow,
    expectedRevenue: revenue,
    expectedCoversFromWalkIns: covers,
    avgPartySize: input.avgPartySize,
    spendPerCover: input.spendPerCover,
    confidence,
    drivers,
    footfall: input.footfall,
  };
}
