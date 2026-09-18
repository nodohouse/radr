/**
 * RADR Futures — play the operation forward before acting.
 * Probabilistic scenarios, not deterministic crystal-ball claims.
 */

export type ScenarioImpact = "none" | "low" | "medium" | "high";

export type ScenarioConstraintViolation = {
  constraintId: string;
  label: string;
  severity: "block" | "warn";
};

export type Scenario = {
  id: string;
  decisionId: string;
  label: string;
  actionSet: string[];
  assumptions: string[];
  probability: number; // 0–1
  expectedRevenue?: number;
  expectedContribution: number;
  /** False when no comparable euro exists — UI must not show €0 as a projection. */
  expectedContributionDefined?: boolean;
  economicMetrics?: import("../counterfactual").ScenarioEconomicMetric[];
  economicEffectNote?: string;
  expectedGuestImpact: ScenarioImpact;
  expectedLaborImpactEuro?: number;
  expectedCapacityImpact: ScenarioImpact;
  operationalRisk: ScenarioImpact;
  riskLevel?: ScenarioImpact;
  mainRiskDescription?: string;
  downside: number;
  upside: number;
  confidence: number; // 0–100
  decisionDeadline?: string;
  constraintViolations: ScenarioConstraintViolation[];
  rank?: number;
  recommended?: boolean;
  isNoAction?: boolean;
  note?: string;
};

export type DecisionObjective = {
  primary: "contribution" | "guest" | "service" | "balanced";
  riskAversion: "low" | "medium" | "high";
};

export type OperatingConstraint = {
  id: string;
  label: string;
  vertical: "restaurant" | "hotel" | "apartment" | "all";
};

export type TemporalPoint = {
  at: string;
  label: string;
  detail: string;
  pressure?: number; // 0–100
};

export type FuturesBundle = {
  id: string;
  title: string;
  situation: string[];
  decisionId: string;
  objective: DecisionObjective;
  scenarios: Scenario[];
  recommendedScenarioId: string;
  incrementalVsNoAction: number;
  temporal?: TemporalPoint[];
  payloadNote: string;
};

export type FuturesActual = {
  simulatedEuro: number;
  actualEuro: number;
  errorPct: number;
  assumptionMisses: string[];
  dnaUpdates: string[];
};
