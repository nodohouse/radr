/**
 * Evidence / Why RADR believes this - reusable across findings, Ask, Recover.
 * Semantics: ACTUAL | FORECAST | ESTIMATE | INFERENCE must never blur.
 */

import type { Finding, FindingEvidence } from "@/lib/radr/domain";

export type EvidenceKind = "ACTUAL" | "FORECAST" | "ESTIMATE" | "INFERENCE";

export type EvidenceRow = {
  id?: string;
  label: string;
  value: string;
  kind: EvidenceKind;
  sourceId?: string;
};

export function kindForEvidenceLabel(label: string): EvidenceKind {
  const l = label.toLowerCase();
  if (
    l.includes("forecast") ||
    l.includes("expected") ||
    l.includes("modeled") ||
    l.includes("comparable")
  ) {
    return "FORECAST";
  }
  if (
    l.includes("estimate") ||
    l.includes("probability") ||
    l.includes("likely")
  ) {
    return "ESTIMATE";
  }
  if (
    l.includes("infer") ||
    l.includes("implied") ||
    l.includes("derived") ||
    l.includes("calculation")
  ) {
    return "INFERENCE";
  }
  return "ACTUAL";
}

export function evidenceRowsFromFinding(finding: Finding): EvidenceRow[] {
  return finding.evidence.map((e: FindingEvidence) => ({
    id: e.id,
    label: e.label,
    value: e.value,
    kind: e.kind ?? kindForEvidenceLabel(e.label),
    sourceId: e.sourceId,
  }));
}

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  ACTUAL: "Actual",
  FORECAST: "Forecast",
  ESTIMATE: "Estimate",
  INFERENCE: "Inference",
};
