/**
 * Weather → operating impact (location-elastic, not decorative).
 */

export type WeatherSnapshot = {
  temperatureC: number;
  conditionLabel: string;
  precipitationProbabilityPct: number;
  windKph: number;
  humidityPct?: number;
  feelsLikeC?: number;
};

export type TerraceDecision = "OPEN" | "PARTIAL" | "HOLD" | "CLOSE";

export type WeatherOperatingImpact = {
  hasTerrace: boolean;
  decision: TerraceDecision;
  headline: string;
  weather: WeatherSnapshot;
  /** Location-learned lift (covers), not generic sun=more. */
  historicalTerraceLiftCovers: number;
  incrementalRevenue: number;
  incrementalContribution: number;
  rainRiskAfter?: string;
  cancellationsAtRisk?: number;
  revenueAtRisk?: number;
  recommendation: string;
  fohCostToCapture: number;
  netExpectedContribution: number;
  confidence: "low" | "medium" | "high";
  /** Location-learned correlation (when available). */
  comparableLiftPct?: number;
  comparableSampleSize?: number;
  outdoorLabel?: string;
  outdoorSeats?: number;
};

export function translateWeatherToOperations(input: {
  hasTerrace: boolean;
  weather: WeatherSnapshot;
  /** Elasticity from location history. */
  dryWarmLiftCovers: number;
  spendPerCover: number;
  contributionRate: number;
  fohCostToCapture: number;
  /** Optional explicit economics (demo fixtures). */
  incrementalRevenue?: number;
  incrementalContribution?: number;
  comparableLiftPct?: number;
  comparableSampleSize?: number;
  outdoorLabel?: string;
  outdoorSeats?: number;
}): WeatherOperatingImpact | null {
  if (!input.hasTerrace) return null;

  const rain = input.weather.precipitationProbabilityPct;
  const windy = input.weather.windKph >= 35;
  const warmDry =
    rain <= 20 &&
    !windy &&
    input.weather.temperatureC >= 18 &&
    input.weather.temperatureC <= 28;

  const meta = {
    comparableLiftPct: input.comparableLiftPct,
    comparableSampleSize: input.comparableSampleSize,
    outdoorLabel: input.outdoorLabel,
    outdoorSeats: input.outdoorSeats,
  };

  if (rain >= 45) {
    const cancel = Math.round(input.dryWarmLiftCovers * 0.55);
    const revenueAtRisk = Math.round(cancel * input.spendPerCover);
    return {
      hasTerrace: true,
      decision: "HOLD",
      headline: "Terrace risk",
      weather: input.weather,
      historicalTerraceLiftCovers: 0,
      incrementalRevenue: 0,
      incrementalContribution: 0,
      rainRiskAfter: "20:30",
      cancellationsAtRisk: cancel,
      revenueAtRisk,
      recommendation: "Hold 3 indoor tables for reassignment.",
      fohCostToCapture: 0,
      netExpectedContribution: -Math.round(
        revenueAtRisk * input.contributionRate,
      ),
      confidence: "medium",
      ...meta,
    };
  }

  if (warmDry) {
    const covers = input.dryWarmLiftCovers;
    const revenue =
      input.incrementalRevenue ?? Math.round(covers * input.spendPerCover);
    const contribution =
      input.incrementalContribution ??
      Math.round(revenue * input.contributionRate);
    const net = contribution - input.fohCostToCapture;
    return {
      hasTerrace: true,
      decision: "OPEN",
      headline: "Terrace opportunity",
      weather: input.weather,
      historicalTerraceLiftCovers: covers,
      incrementalRevenue: revenue,
      incrementalContribution: contribution,
      recommendation: "Open full terrace from 18:00.",
      fohCostToCapture: input.fohCostToCapture,
      netExpectedContribution: net,
      confidence: "high",
      ...meta,
    };
  }

  return {
    hasTerrace: true,
    decision: "PARTIAL",
    headline: "Terrace watch",
    weather: input.weather,
    historicalTerraceLiftCovers: Math.round(input.dryWarmLiftCovers * 0.4),
    incrementalRevenue: 0,
    incrementalContribution: 0,
    recommendation: "Open partial terrace; reassess at 18:30.",
    fohCostToCapture: 0,
    netExpectedContribution: 0,
    confidence: "medium",
    ...meta,
  };
}
