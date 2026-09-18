"use client";

import type { Finding } from "@/lib/radr/domain";
import { moneyKindOfFinding } from "@/lib/radr/valueSemantics";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";

export function attentionHeadline(f: Finding): string {
  return (
    f.presentation?.headline?.replace(/\.$/, "") ??
    f.title.replace(/\.$/, "")
  );
}

export function attentionNextStep(f: Finding): string {
  return (
    f.presentation?.recommendShort ??
    `${f.recommendation.title}${
      f.recommendation.description ? ` · ${f.recommendation.description}` : ""
    }`
  );
}

export function attentionContext(f: Finding, fallback = "Location"): string {
  const loc = f.locationName ?? fallback;
  const when = f.timeframe?.label;
  return when ? `${loc} · ${when}` : loc;
}

export function attentionStake(f: Finding): {
  amount: string;
  label: string;
  positive: boolean;
} {
  const kind = moneyKindOfFinding(f);
  const amount = formatFindingEuro(f.financialImpact.primaryValue);
  if (kind === "recoverable") {
    return { amount, label: "recoverable", positive: true };
  }
  if (kind === "opportunity") {
    return { amount, label: "opportunity", positive: true };
  }
  return { amount, label: "at risk", positive: false };
}

export function attentionWhy(f: Finding): { label: string; value: string }[] {
  const fromEvidence = f.evidence.slice(0, 4).map((e) => ({
    label: e.label,
    value: e.value,
  }));
  if (fromEvidence.length) return fromEvidence;
  return f.drivers.slice(0, 4).map((d) => ({
    label: d.label,
    value: d.value,
  }));
}

/** One short sentence for Level-1 surfaces - the reasoning, not the evidence dump. */
export function attentionWhyLine(f: Finding): string {
  const summary = f.summary?.trim();
  if (summary) return summary.replace(/\.$/, "");
  const explanation = f.explanation?.trim();
  if (explanation) {
    const first = explanation.split(/(?<=\.)\s+/)[0] ?? explanation;
    return first.replace(/\.$/, "");
  }
  const driver = f.drivers[0];
  if (driver) return `${driver.label}: ${driver.value}`;
  return "RADR surfaced this because it changes tonight's outcome";
}

export function confidenceLabel(f: Finding): string {
  if (f.confidenceBand === "HIGH") return "High";
  if (f.confidenceBand === "MEDIUM") return "Medium";
  return "Low";
}
