/**
 * Hotel inventory futures — shoulder sell-out, channel mix (CANON_OTA / D-2201).
 */

import { CANON_OTA } from "../demo/canonical";
import { DECISION_IDS } from "../ids";
import type { FuturesBundle, Scenario } from "./types";
import { rankScenarios } from "./rank";

const DECISION_ID = DECISION_IDS.ota;

const RAW: Scenario[] = [
  {
    id: "fut_ota_release",
    decisionId: DECISION_ID,
    label: "Release to OTA now",
    actionSet: ["Open remaining premium to OTA channels"],
    assumptions: ["OTA fills within 6h", "Commission at contracted rate"],
    probability: 0.38,
    expectedContribution: 0,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "none",
    operationalRisk: "low",
    downside: 0,
    upside: 420,
    confidence: 88,
    constraintViolations: [],
    isNoAction: true,
    note: "Obvious fill · €4,200 contribution drag if mix slips further",
  },
  {
    id: "fut_ota_raise",
    decisionId: DECISION_ID,
    label: "Raise rate",
    actionSet: ["Lift BAR on premium + release 2 to OTA"],
    assumptions: ["Demand elastic to +8%", "Direct still competes"],
    probability: 0.26,
    expectedContribution: 1800,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "low",
    operationalRisk: "low",
    downside: 1420,
    upside: 2240,
    confidence: 70,
    constraintViolations: [],
    note: "Looks like demand pricing · weakens direct mix further",
  },
  {
    id: "fut_ota_hold",
    decisionId: DECISION_ID,
    label: "Hold 4 premium direct",
    actionSet: ["Hold 4 premium rooms direct until 72h out"],
    assumptions: [
      "Event-weekend pickup continues",
      "Housekeeping holds readiness",
    ],
    probability: 0.28,
    expectedContribution: 3100,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "low",
    operationalRisk: "medium",
    downside: 2480,
    upside: 3400,
    confidence: 73,
    constraintViolations: [],
    note: "Risk-adjusted pick · not the obvious OTA release",
  },
];

export function buildOtaFutures(): FuturesBundle {
  const objective = {
    primary: "balanced" as const,
    riskAversion: "medium" as const,
  };
  const scenarios = rankScenarios(RAW, objective);
  const hold =
    scenarios.find((s) => s.id === "fut_ota_hold") ??
    scenarios.find((s) => s.recommended) ??
    scenarios[0]!;
  for (const s of scenarios) {
    s.recommended = s.id === hold.id;
  }
  const noAction =
    scenarios.find((s) => s.isNoAction) ?? scenarios[0]!;

  return {
    id: "futures_ota_canal",
    title: "Play the house forward",
    situation: [
      "6 premium rooms remain",
      "Pickup ahead of baseline",
      "First arrivals from 15:00",
      `€${CANON_OTA.exposureEuro.toLocaleString("en-US")} contribution exposure`,
      "OTA share +11 pts vs target",
    ],
    decisionId: DECISION_ID,
    objective,
    scenarios,
    recommendedScenarioId: hold.id,
    incrementalVsNoAction:
      hold.expectedContribution - noAction.expectedContribution,
    temporal: [
      { at: "NOW", label: "11:00", detail: "6 premium open", pressure: 62 },
      { at: "+3H", label: "14:00", detail: "Pickup +4 rooms", pressure: 78 },
      { at: "+6H", label: "17:00", detail: "Direct pace strong", pressure: 84 },
      {
        at: "+1D",
        label: "Tomorrow",
        detail: "Demand compresses",
        pressure: 71,
      },
      { at: "CHECK-IN", label: "15:00", detail: "Arrivals wave", pressure: 88 },
    ],
    payloadNote:
      "Prepared — not written back to PMS/channel manager. Operator confirms in the system of record.",
  };
}

export const OTA_FUTURES_ACTUAL = {
  simulatedEuro: CANON_OTA.expectedProtectedEuro,
  actualEuro: CANON_OTA.actualProtectedEuro,
  errorPct: CANON_OTA.forecastVariancePct,
  assumptionMisses: [
    "Direct pickup slightly weaker than modeled — 3 of 4 held rooms filled",
  ],
  dnaUpdates: [CANON_OTA.learning.nextTimeImpact],
};
