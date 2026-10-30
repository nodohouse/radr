/**
 * Contribution bridge — plan → drivers → actual.
 * Every segment is from CONNECTED_PILOT_MTD.bridge (tested identity).
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  CONNECTED_PILOT_MTD,
  assertContributionBridgeIdentity,
} from "@/lib/radr/product/demoOperatingPulse";
import { displayDecisionId } from "@/lib/radr/decision/ids";

export type BridgeSegment = {
  id: string;
  label: string;
  amount: number;
  formatted: string;
  kind: "base" | "positive" | "negative" | "result";
  method: "deterministic" | "modeled" | null;
  evidence: string[];
  relatedDecisionIds: string[];
  relatedDisplayIds: string[];
};

export type ContributionBridge = {
  title: string;
  subtitle: string;
  segments: BridgeSegment[];
  varianceFormatted: string;
  varianceAmount: number;
  identityOk: boolean;
};

export function getContributionBridge(): ContributionBridge {
  const { plan, drivers, actual } = CONNECTED_PILOT_MTD.bridge;
  const identityOk = assertContributionBridgeIdentity();
  const variance = actual - plan;

  const segments: BridgeSegment[] = [
    {
      id: "plan",
      label: "Plan contribution",
      amount: plan,
      formatted: formatDecisionMoney(plan),
      kind: "base",
      method: null,
      evidence: ["budget.contribution_plan"],
      relatedDecisionIds: [],
      relatedDisplayIds: [],
    },
    ...drivers.map((d) => ({
      id: d.id,
      label: d.label,
      amount: d.amount,
      formatted: formatDecisionMoney(d.amount),
      kind: (d.amount >= 0 ? "positive" : "negative") as BridgeSegment["kind"],
      method: d.method,
      evidence: [...d.evidence],
      relatedDecisionIds: [...d.relatedDecisionIds],
      relatedDisplayIds: d.relatedDecisionIds.map(displayDecisionId),
    })),
    {
      id: "actual",
      label: "Actual contribution",
      amount: actual,
      formatted: formatDecisionMoney(actual),
      kind: "result",
      method: "modeled",
      evidence: ["pos", "labor", "cogs", "channels"],
      relatedDecisionIds: [],
      relatedDisplayIds: [],
    },
  ];

  return {
    title: "Contribution bridge",
    subtitle: "MTD · Why contribution moved vs plan",
    segments,
    varianceFormatted: formatDecisionMoney(variance),
    varianceAmount: variance,
    identityOk,
  };
}
