export type ScenarioInputs = {
  locations: number;
  revenue: number;
  labor: number;
  procurement: number;
  operations: number;
};
export const scenarioRates = {
  revenue: [0.08, 0.12],
  labor: [0.03, 0.06],
  procurement: [0.05, 0.1],
  operations: [0.02, 0.04],
} as const;
/** Illustrative assumptions from the design brief, not verified industry benchmarks. */
export function modelScenario(inputs: ScenarioInputs) {
  const count = Math.min(
    10000,
    Math.max(
      1,
      Math.floor(Number.isFinite(inputs.locations) ? inputs.locations : 1),
    ),
  );
  const categories = (
    ["revenue", "labor", "procurement", "operations"] as const
  ).map((key) => {
    const value = Number.isFinite(inputs[key])
      ? Math.min(1e12, Math.max(0, inputs[key]))
      : 0;
    return {
      key,
      low: Math.round(value * count * scenarioRates[key][0]),
      high: Math.round(value * count * scenarioRates[key][1]),
    };
  });
  return {
    categories,
    low: categories.reduce((n, c) => n + c.low, 0),
    high: categories.reduce((n, c) => n + c.high, 0),
  };
}
