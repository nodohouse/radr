/**
 * Deterministic terrace weather opportunity.
 * Gross opportunity = additional expected covers × contribution per cover.
 * Net opportunity = gross − labor cost to capture.
 * Counterfactual (do nothing) = constrained covers × contribution.
 */

export type TerraceWeatherInputs = {
  scheduledTerraceCapacity: number;
  comparableWarmDryLiftPct: number;
  expectedDemandCovers: number;
  fohPlanCovers: number;
  contributionPerCover: number;
  /** Additional FOH cost to capture the opportunity (major currency units). */
  fohCostToCapture: number;
  comparableSampleSize: number;
};

export type TerraceWeatherOpportunity = {
  additionalExpectedCovers: number;
  constrainedVsFoh: number;
  /** Gross contribution opportunity (not revenue, not verified). */
  grossOpportunity: number;
  laborCostToCapture: number;
  netOpportunity: number;
  /** Estimated contribution left behind if no action. */
  doNothingValue: number;
  calc: string;
  netCalc: string;
  doNothingCalc: string;
  /** @deprecated Prefer grossOpportunity - kept for Ask/tool compatibility. */
  estimatedImpact: number;
};

export function calculateTerraceWeatherOpportunity(
  input: TerraceWeatherInputs,
): TerraceWeatherOpportunity {
  const additionalExpectedCovers = Math.max(
    0,
    input.expectedDemandCovers - input.scheduledTerraceCapacity,
  );
  const constrainedVsFoh = Math.max(
    0,
    input.expectedDemandCovers - input.fohPlanCovers,
  );
  const grossOpportunity = Math.round(
    additionalExpectedCovers * input.contributionPerCover,
  );
  const laborCostToCapture = Math.max(0, Math.round(input.fohCostToCapture));
  const netOpportunity = Math.max(0, grossOpportunity - laborCostToCapture);
  const doNothingValue = Math.round(
    constrainedVsFoh * input.contributionPerCover,
  );
  return {
    additionalExpectedCovers,
    constrainedVsFoh,
    grossOpportunity,
    laborCostToCapture,
    netOpportunity,
    doNothingValue,
    estimatedImpact: grossOpportunity,
    calc: `${additionalExpectedCovers} additional covers × €${input.contributionPerCover} contribution = €${grossOpportunity}`,
    netCalc: `€${grossOpportunity} gross − €${laborCostToCapture} FOH cost = €${netOpportunity} net`,
    doNothingCalc: `${constrainedVsFoh} constrained covers × €${input.contributionPerCover} = €${doNothingValue} left behind`,
  };
}

/** Berlin demo fixture - all opportunity euros derive from these inputs. */
export const BERLIN_TERRACE_WEATHER = {
  scheduledTerraceCapacity: 42,
  comparableWarmDryLiftPct: 24,
  expectedDemandCovers: 56,
  fohPlanCovers: 46,
  contributionPerCover: 30,
  /** One additional FOH for the lunch peak. */
  fohCostToCapture: 72,
  /** Historical sample used for confidence explanation. */
  comparableSampleSize: 23,
  peakStart: "12:30",
  peakEnd: "15:30",
  lunchPeakStart: "13:00",
  lunchPeakEnd: "15:00",
  reservationPaceLabel: "On plan for Thursday lunch · indoor fully booked first",
} as const;

export function berlinTerraceOpportunity(): TerraceWeatherOpportunity {
  return calculateTerraceWeatherOpportunity(BERLIN_TERRACE_WEATHER);
}
