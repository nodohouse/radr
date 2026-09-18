/**
 * Aparthotel orphan-night futures — one-night gap (CANON_ORPHAN / D-3104).
 * Rate (€148) is not contribution. Scenarios expose expected net contribution.
 */

import { CANON_ORPHAN } from "../demo/canonical";
import { DECISION_IDS } from "../ids";
import type { FuturesBundle, Scenario } from "./types";
import { rankScenarios } from "./rank";

const DECISION_ID = DECISION_IDS.orphan;
const RATE = CANON_ORPHAN.recommendedRateEuro ?? 148;

const RAW: Scenario[] = [
  {
    id: "fut_orphan_ota",
    decisionId: DECISION_ID,
    label: "OTA release now",
    actionSet: ["Open orphan night to OTA channels immediately"],
    assumptions: ["OTA fills within 12h", "Commission at contracted rate"],
    probability: 0.34,
    expectedContribution: 72,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "none",
    operationalRisk: "low",
    downside: 55,
    upside: 88,
    confidence: 76,
    constraintViolations: [],
    note: "Fills · net contribution after distribution tax",
  },
  {
    id: "fut_orphan_discount",
    decisionId: DECISION_ID,
    label: "Discount now",
    actionSet: ["Drop rate to €128 on direct + meta"],
    assumptions: ["Price-sensitive bookers respond within 6h"],
    probability: 0.28,
    expectedContribution: 78,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "none",
    operationalRisk: "low",
    downside: 65,
    upside: 90,
    confidence: 78,
    constraintViolations: [],
    isNoAction: false,
    note: "Rate €128 · expected net contribution €78",
  },
  {
    id: "fut_orphan_wait",
    decisionId: DECISION_ID,
    label: "Wait 24h · direct first",
    actionSet: [
      "Hold 24h",
      `Open one-night at €${RATE} direct`,
      "OTA only if threshold drops",
    ],
    assumptions: [
      "Direct demand often arrives inside 48h",
      "Cleaning already absorbed",
      "Next stay Wed — no walkaway risk",
    ],
    probability: 0.22,
    expectedContribution: CANON_ORPHAN.expectedProtectedEuro,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "low",
    operationalRisk: "low",
    downside: 0,
    upside: CANON_ORPHAN.exposureEuro,
    confidence: 64,
    constraintViolations: [],
    note: `Recommended rate €${RATE} · expected net contribution €${CANON_ORPHAN.expectedProtectedEuro}`,
  },
];

export function buildOrphanFutures(): FuturesBundle {
  const objective = {
    primary: "balanced" as const,
    riskAversion: "medium" as const,
  };
  const scenarios = rankScenarios(RAW, objective);
  const wait =
    scenarios.find((s) => s.id === "fut_orphan_wait") ??
    scenarios.find((s) => s.recommended) ??
    scenarios[0]!;
  for (const s of scenarios) {
    s.recommended = s.id === wait.id;
  }
  const noAction: Scenario = {
    id: "fut_orphan_empty",
    decisionId: DECISION_ID,
    label: "Do nothing",
    actionSet: ["Leave gap closed"],
    assumptions: ["Night expires empty"],
    probability: 0.16,
    expectedContribution: 0,
    expectedGuestImpact: "none",
    expectedCapacityImpact: "none",
    operationalRisk: "low",
    downside: 0,
    upside: 0,
    confidence: 90,
    constraintViolations: [],
    isNoAction: true,
    note: "Night expires · €0 recovered contribution",
  };

  return {
    id: "futures_orphan_chiado",
    title: "Play the gap forward",
    situation: [
      "One-night gap · Tuesday",
      "72h until arrival",
      "Unit 24 · Chiado",
      `€${CANON_ORPHAN.exposureEuro.toLocaleString("en-US")} opportunity if ignored`,
      `Recommended rate €${RATE}`,
      "Cleaning already absorbed",
    ],
    decisionId: DECISION_ID,
    objective,
    scenarios,
    recommendedScenarioId: wait.id,
    incrementalVsNoAction:
      wait.expectedContribution - noAction.expectedContribution,
    temporal: [
      { at: "NOW", label: "Morning", detail: "Gap detected", pressure: 48 },
      { at: "72H", label: "−72h", detail: "Decision window open", pressure: 52 },
      { at: "48H", label: "−48h", detail: "Direct pace typical", pressure: 58 },
      { at: "24H", label: "−24h", detail: "RADR opens direct", pressure: 71 },
      { at: "CHECK-IN", label: "Arrival", detail: "Night resolves", pressure: 88 },
    ],
    payloadNote:
      "Prepared — not written back to channel manager. Operator confirms in the system of record.",
  };
}

export const ORPHAN_FUTURES_ACTUAL = {
  simulatedEuro: CANON_ORPHAN.expectedProtectedEuro,
  actualEuro: CANON_ORPHAN.actualProtectedEuro,
  errorPct: CANON_ORPHAN.forecastVariancePct,
  assumptionMisses: [
    "Direct booked slightly above modeled net contribution",
  ],
  dnaUpdates: [CANON_ORPHAN.learning.nextTimeImpact],
};
