/**
 * Project CanonDecision scenarios into a FuturesBundle.
 * Intelligence + Platform Futures share this — no duplicate economics.
 */

import type { CanonDecision } from "../demo/canonical";
import type { FuturesBundle, Scenario } from "./types";
import type { ScenarioEconomicMetric } from "../counterfactual";
import { DECISION_IDS } from "../ids";
import { PEAK_SERVICE_CLOCK } from "../demos/peakClock";
import { incrementalVsNoActionEuro } from "../economics/moneyImpact";

function euroFromScenario(s: CanonDecision["scenarios"][number]): number | undefined {
  if (s.expectedContributionEuro != null) return s.expectedContributionEuro;
  const m = s.economicMetrics?.find((x) => x.value != null);
  return m?.value;
}

export function futuresFromCanon(
  d: CanonDecision,
  opts?: { verified?: boolean },
): FuturesBundle {
  const verified = Boolean(opts?.verified && d.verifiedOutcomeNote);
  const scenarios: Scenario[] = d.scenarios.map((s, i) => {
    const expected = euroFromScenario(s);
    let economicMetrics: ScenarioEconomicMetric[] | undefined =
      s.economicMetrics ??
      (s.economicEffectNote
        ? [
            {
              type: "NOT_MODELED",
              label: s.economicEffectNote,
              status: "NOT_MODELED",
            },
          ]
        : expected != null
          ? [
              {
                type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
                value: expected,
                currency: "EUR",
                label: s.value?.label ?? "Expected economic effect",
                baseline: s.value?.comparedTo,
                scope: s.value?.scope,
                horizon: s.value?.horizon,
                status: "EXPECTED",
              },
            ]
          : undefined);

    if (verified && s.recommended && economicMetrics?.length) {
      economicMetrics = economicMetrics.map((m) =>
        m.status === "POTENTIAL" || m.status === "PENDING"
          ? {
              ...m,
              status: "VERIFIED",
              label: "Recovered variance",
              baseline: d.verifiedOutcomeNote,
            }
          : m,
      );
    }

    return {
      id: `fut_${d.displayId}_${s.id}`,
      decisionId: d.id,
      label: s.title,
      actionSet: [s.note],
      assumptions: [d.connect],
      probability: Math.min(0.92, Math.max(0.12, s.confidence / 100)),
      expectedContribution: expected ?? 0,
      expectedContributionDefined: expected != null,
      economicMetrics,
      economicEffectNote: s.economicEffectNote,
      expectedGuestImpact: s.guestImpact,
      expectedCapacityImpact:
        s.operationalRisk === "high"
          ? "high"
          : s.operationalRisk === "medium"
            ? "medium"
            : "low",
      operationalRisk: s.operationalRisk,
      riskLevel: s.riskLevel ?? s.operationalRisk,
      mainRiskDescription: s.mainRiskDescription,
      downside:
        expected == null
          ? 0
          : s.isNoAction
            ? Math.min(0, expected)
            : Math.round(expected * 0.45),
      upside:
        expected == null
          ? 0
          : Math.max(expected, Math.round(expected * 1.12)),
      confidence: s.confidence,
      decisionDeadline: d.deadline,
      constraintViolations: [],
      rank: i + 1,
      recommended: s.id === d.chosenScenarioId || Boolean(s.recommended),
      isNoAction: s.isNoAction,
      note: s.note,
    };
  });

  const recommended =
    scenarios.find((s) => s.recommended) ??
    scenarios.find((s) => !s.isNoAction) ??
    scenarios[0]!;

  for (const s of scenarios) {
    s.recommended = s.id === recommended.id;
  }

  const baseline =
    scenarios.find((s) => s.isNoAction && s.expectedContributionDefined)
      ?.expectedContribution ?? 0;

  return {
    id: `futures_${d.id}`,
    title: "Play it forward",
    situation: [
      d.property,
      d.title,
      d.problemLine.split("\n")[0] ?? d.problemLine,
      `${d.territories.join(" × ")}`,
    ],
    decisionId: d.id,
    objective: { primary: "contribution", riskAversion: "medium" },
    scenarios,
    recommendedScenarioId: recommended.id,
    incrementalVsNoAction: recommended.expectedContributionDefined
      ? incrementalVsNoActionEuro(recommended.expectedContribution, baseline)
      : 0,
    temporal:
      d.id === DECISION_IDS.peak
        ? [
            { at: PEAK_SERVICE_CLOCK.nowLabel, label: "Now", detail: "Decide" },
            { at: PEAK_SERVICE_CLOCK.resumeLabel, label: "Resume", detail: "Hold ends" },
            { at: PEAK_SERVICE_CLOCK.peakObservedLabel, label: "Peak", detail: "Kitchen pressure" },
            { at: PEAK_SERVICE_CLOCK.turnsObservedLabel, label: "Turns", detail: "Second seating" },
          ]
        : [
            { at: "NOW", label: "Decide", detail: d.deadline },
            { at: d.horizon, label: "Horizon", detail: d.scope },
            { at: "AFTER", label: "Verify", detail: "Observed vs expected" },
          ],
    payloadNote: d.prepared,
  };
}
