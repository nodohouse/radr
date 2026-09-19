/**
 * Rain closes terrace — RADR Futures restaurant demo.
 * Four viable plans; risk-adjusted pick is D (not always max EV alone).
 */

import type { FuturesBundle, Scenario } from "./types";
import { rankScenarios } from "./rank";

const DECISION_ID = "dec_rain_berlin";

const RAW: Scenario[] = [
  {
    id: "fut_rain_a",
    decisionId: DECISION_ID,
    label: "Do nothing",
    actionSet: ["Absorb displaced covers without replan"],
    assumptions: ["Walk-ins hold", "Bar absorbs overflow"],
    probability: 0.22,
    expectedContribution: 5420,
    expectedGuestImpact: "high",
    expectedLaborImpactEuro: 0,
    expectedCapacityImpact: "high",
    operationalRisk: "high",
    downside: 4980,
    upside: 5580,
    confidence: 71,
    constraintViolations: [],
    isNoAction: true,
    note: "Service risk high · €467 perishes vs best plan",
  },
  {
    id: "fut_rain_b",
    decisionId: DECISION_ID,
    label: "Move 1 FOH to bar",
    actionSet: ["Reassign 1 FOH to bar standing"],
    assumptions: ["Floor holds with −1 FOH", "Bar capacity frees"],
    probability: 0.28,
    expectedContribution: 5638,
    expectedGuestImpact: "low",
    expectedLaborImpactEuro: 22,
    expectedCapacityImpact: "medium",
    operationalRisk: "medium",
    downside: 5410,
    upside: 5810,
    confidence: 74,
    constraintViolations: [],
    note: "Labor +€22 · partial recovery",
  },
  {
    id: "fut_rain_c",
    decisionId: DECISION_ID,
    label: "Pause delivery",
    actionSet: ["Pause delivery channels for peak"],
    assumptions: ["Kitchen load drops enough", "Guests accept delay"],
    probability: 0.18,
    expectedContribution: 5571,
    expectedGuestImpact: "medium",
    expectedLaborImpactEuro: 0,
    expectedCapacityImpact: "low",
    operationalRisk: "medium",
    downside: 5320,
    upside: 5720,
    confidence: 68,
    constraintViolations: [
      {
        constraintId: "channel_sla",
        label: "Delivery SLA soft-breach risk",
        severity: "warn",
      },
    ],
    note: "Guest impact medium · channel friction",
  },
  {
    id: "fut_rain_e",
    decisionId: DECISION_ID,
    label: "Terrace crush indoors",
    actionSet: [
      "Re-seat all terrace indoors immediately",
      "Pause delivery for peak",
      "Run standing-only bar overflow",
    ],
    assumptions: [
      "Indoor can absorb +36 without ticket times spiking",
      "Guests accept forced moves",
      "Kitchen clears backlog in 45 min",
    ],
    probability: 0.14,
    expectedContribution: 5920,
    expectedGuestImpact: "high",
    expectedLaborImpactEuro: 0,
    expectedCapacityImpact: "high",
    operationalRisk: "high",
    downside: 5180,
    upside: 6080,
    confidence: 58,
    constraintViolations: [
      {
        constraintId: "kitchen_throughput",
        label: "Kitchen already 88% before replan",
        severity: "warn",
      },
    ],
    note: "Highest € on paper · guest + capacity risk · not risk-adjusted pick",
  },
  {
    id: "fut_rain_d",
    decisionId: DECISION_ID,
    label: "Move FOH + feature substitute + keep delivery",
    actionSet: [
      "Move 1 FOH to bar",
      "Feature indoor substitute",
      "Keep delivery open",
    ],
    assumptions: [
      "One FOH can move without collapsing the floor",
      "Feature uptake ≥60%",
      "Delivery kitchen lane stays staffed",
    ],
    probability: 0.32,
    expectedContribution: 5793,
    expectedGuestImpact: "low",
    expectedLaborImpactEuro: 22,
    expectedCapacityImpact: "low",
    operationalRisk: "low",
    downside: 5510,
    upside: 5990,
    confidence: 78,
    constraintViolations: [],
    note: "Best risk-adjusted path · service risk low",
  },
];

export function buildRainFutures(): FuturesBundle {
  const objective = {
    primary: "balanced" as const,
    riskAversion: "medium" as const,
  };
  const scenarios = rankScenarios(RAW, objective);
  const recommended = scenarios.find((s) => s.recommended) ?? scenarios[0]!;
  const noAction = scenarios.find((s) => s.isNoAction) ?? scenarios[0]!;

  return {
    id: "futures_rain_berlin",
    title: "Play the operation forward",
    situation: [
      "Rain closes terrace",
      "36 covers displaced",
      "Dinner demand remains strong",
      "Delivery +18%",
      "Bar approaching capacity",
    ],
    decisionId: DECISION_ID,
    objective,
    scenarios,
    recommendedScenarioId: recommended.id,
    incrementalVsNoAction:
      recommended.expectedContribution - noAction.expectedContribution,
    temporal: [
      { at: "NOW", label: "19:00", detail: "Bar 72%", pressure: 72 },
      { at: "+30 MIN", label: "19:30", detail: "Bar 94%", pressure: 94 },
      { at: "+1H", label: "20:00", detail: "Kitchen pressure 88%", pressure: 88 },
      {
        at: "+2H",
        label: "20:30",
        detail: "Terrace recovery possible",
        pressure: 55,
      },
      { at: "CLOSE", label: "22:30", detail: "Service closed", pressure: 20 },
    ],
    payloadNote:
      "Prepared — not written back to POS/labor. Operator confirms in the system of record.",
  };
}

export const RAIN_FUTURES_ACTUAL = {
  simulatedEuro: 5793,
  actualEuro: 5842,
  errorPct: 0.8,
  assumptionMisses: ["Walk-in demand exceeded forecast by 12%"],
  dnaUpdates: [
    "Thursday rain elasticity adjusted",
    "Feature substitution conversion: predicted 64% → actual 71%",
  ],
};
