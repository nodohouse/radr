/**
 * Project DecisionRecord → marketing/brief Decision card shape.
 * Keeps shared IDs and money vocabulary.
 */

import type { Decision, DecisionOption, DecisionStatus } from "./core";
import type { DecisionRecord } from "./record";
import { attentionBandOf } from "./lifecycle";
import { optionEconomicEuro } from "./counterfactual";

function cardStatus(record: DecisionRecord): DecisionStatus {
  const band = attentionBandOf(record.status);
  if (band === "verified") return "verified";
  if (band === "handling") return "approved";
  if (band === "watching") return "watching";
  return "needs_you";
}

function projectOptions(record: DecisionRecord): DecisionOption[] | undefined {
  if (attentionBandOf(record.status) === "verified") return undefined;
  if (!record.options.length) return undefined;
  return record.options.map((o) => {
    const euro = optionEconomicEuro(o);
    return {
      id: o.id,
      title: o.title,
      netVsDoNothing:
        o.isNoAction || euro == null ? 0 : Math.max(0, euro),
      cost: o.costEuro,
      note: o.note,
      recommended: o.recommended,
    };
  });
}

export function projectDecision(record: DecisionRecord): Decision {
  const verifiedBand = attentionBandOf(record.status) === "verified";
  const rec = record.options.find((o) => o.id === record.recommendedOptionId);

  return {
    id: record.id,
    vertical: record.vertical,
    property: record.property,
    phase: verifiedBand ? "after" : "pre",
    phaseLabel: record.phaseLabel,
    contextLine: record.contextLine,
    headline: record.title.includes("\n")
      ? record.title
      : record.problemStatement.length < 90
        ? record.problemStatement
        : record.title,
    soWhat: verifiedBand
      ? (record.observedOutcome ?? record.lesson ?? record.problemStatement)
      : record.noActionOutcome.replace(/^−/, "").length > 0
        ? record.currentState
        : record.problemStatement,
    exposed:
      !verifiedBand && record.exposedContribution != null
        ? {
            amount: record.exposedContribution,
            kind: "exposed",
            horizon: "tonight",
          }
        : undefined,
    expected:
      !verifiedBand
        ? {
            amount:
              (rec ? optionEconomicEuro(rec) : null) ??
              record.expectedContributionImpact,
            kind: "protected",
            horizon: "tonight",
          }
        : undefined,
    action: verifiedBand
      ? record.verifiedValue
        ? record.verifiedValue.kind === "recovered"
          ? "Recovered"
          : record.verifiedValue.kind === "avoided"
            ? "Avoided"
            : "Protected"
        : "Closed"
      : rec?.title ?? record.actionPlan.steps[0]?.title ?? "Review",
    fallback: record.options.find((o) => !o.recommended && !o.isNoAction)?.title,
    deadline: record.decisionDeadline,
    evidence: record.evidenceRefs.slice(0, 2).map((e) => ({
      value: e.value,
      label: e.label,
    })),
    why: {
      blocks: record.whyBlocks,
      sources: record.evidenceRefs.map((e) => ({
        name: e.source,
        freshness: e.freshness,
      })),
      sample: {
        n: record.memory?.optionStats[0]?.n ?? record.playbook?.nEvents ?? 12,
        window: record.memory?.note ?? "comparable events",
      },
      baseline: record.baselinePrediction,
      effect: "Historically followed by protected outcomes when acted on",
      confidence: {
        point: record.confidence.point,
        low: record.confidence.low,
        high: record.confidence.high,
      },
      assumptions: [record.confidence.explanation],
      locationDna: record.locationDnaLine,
    },
    options: projectOptions(record),
    status: cardStatus(record),
    payloadNote: record.actionPlan.payloadNote,
    proof: verifiedBand
      ? record.ledger
          .filter((e) =>
            ["signal", "recommend", "approve", "act", "verify"].includes(e.kind),
          )
          .slice(0, 6)
          .map((e) => ({
            label: e.kind === "verify" ? "Verified value" : e.title.split(" ")[0] ?? "Event",
            detail: e.detail ?? e.title,
          }))
      : undefined,
    verified: record.verifiedValue,
    learn: record.lesson,
    silenceNote: record.silenceNote,
    image: record.image,
    imageAlt: record.imageAlt,
  };
}

/** Stronger soWhat for needs-you cards (match catalog tone). */
export function projectDecisionForBrief(record: DecisionRecord): Decision {
  const d = projectDecision(record);
  if (attentionBandOf(record.status) === "verified") return d;
  return {
    ...d,
    headline: headlineForVertical(record),
    soWhat: soWhatForVertical(record),
  };
}

function headlineForVertical(record: DecisionRecord): string {
  if (record.id === "dec_tuna_berlin") {
    return "Tuna Tataki is tonight’s bestseller.\n6 portions short for peak.";
  }
  if (record.id === "dec_ota_canal") {
    return "You’re nearly sold out —\nbut giving too much away to OTAs.";
  }
  if (record.id === "dec_orphan_chiado") {
    return "Apartment 24 has a one-night gap.";
  }
  return record.title;
}

function soWhatForVertical(record: DecisionRecord): string {
  if (record.id === "dec_tuna_berlin") {
    return "Peak contribution is exposed if the shortfall stands.";
  }
  if (record.id === "dec_ota_canal") {
    return "High demand is still leaking through expensive channels.";
  }
  if (record.id === "dec_orphan_chiado") {
    return "One empty night between bookings will expire if left closed.";
  }
  return record.currentState;
}
