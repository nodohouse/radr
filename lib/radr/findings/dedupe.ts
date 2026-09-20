import type { Finding } from "@/lib/radr/domain";

/**
 * Merge findings that share a dedupeKey.
 * Drivers and evidence are unioned; highest urgency / priority wins.
 */
export function dedupeFindings(findings: Finding[]): Finding[] {
  const byKey = new Map<string, Finding>();

  for (const f of findings) {
    const existing = byKey.get(f.dedupeKey);
    if (!existing) {
      byKey.set(f.dedupeKey, f);
      continue;
    }

    const driverLabels = new Set(existing.drivers.map((d) => d.label));
    const evidenceLabels = new Set(existing.evidence.map((e) => e.label));

    const merged: Finding = {
      ...existing,
      drivers: [
        ...existing.drivers,
        ...f.drivers.filter((d) => !driverLabels.has(d.label)),
      ],
      evidence: [
        ...existing.evidence,
        ...f.evidence.filter((e) => !evidenceLabels.has(e.label)),
      ],
      sourceIds: [...new Set([...existing.sourceIds, ...f.sourceIds])],
      priorityScore: Math.max(existing.priorityScore, f.priorityScore),
      urgency:
        urgencyRank(f.urgency) > urgencyRank(existing.urgency)
          ? f.urgency
          : existing.urgency,
      financialImpact:
        f.financialImpact.primaryValue > existing.financialImpact.primaryValue
          ? f.financialImpact
          : existing.financialImpact,
      updatedAt: f.updatedAt,
    };
    byKey.set(f.dedupeKey, merged);
  }

  return [...byKey.values()];
}

function urgencyRank(u: Finding["urgency"]): number {
  if (u === "ACT_NOW") return 3;
  if (u === "TODAY") return 2;
  return 1;
}

/** Completeness gate: WHAT / WHY / MONEY / DO / CONFIDENCE / EVIDENCE */
export function isFindingComplete(f: Finding): boolean {
  return Boolean(
    f.summary &&
      f.explanation &&
      f.financialImpact.primaryValue >= 0 &&
      f.recommendation.title &&
      f.confidenceExplanation &&
      (f.evidence.length > 0 || f.drivers.length > 0),
  );
}

export function filterCompleteFindings(findings: Finding[]): Finding[] {
  return findings.filter(isFindingComplete);
}
