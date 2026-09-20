/**
 * Adapter: legacy PriorityFinding → canonical Finding.
 * Demo fixtures remain the seed; Overview consumes Finding.
 */

import { DEMO_ORG } from "@/lib/radr/demoModel";
import { currentExposureFromFindings } from "@/lib/radr/valueSemantics";
import {
  findingSchema,
  isFindingOpen,
  URGENCY_LABEL,
  type Finding,
  type FindingStatus,
  type FindingUrgency,
} from "@/lib/radr/domain";
import {
  type PriorityBand,
  type PriorityFinding,
  type FindingWorkflowStatus,
} from "@/lib/radr/priorityFindings";

const DEMO_NOW = "2026-08-19T17:30:00+02:00";

function mapStatus(status: FindingWorkflowStatus): FindingStatus {
  switch (status) {
    case "NEW":
      return "OPEN";
    case "REVIEWED":
      return "REVIEWED";
    case "ACTIONED":
      return "ACTIONED";
    case "MONITORING":
      return "MONITORING";
    case "RESOLVED":
      return "RESOLVED";
    case "DISMISSED":
      return "DISMISSED";
    default:
      return "OPEN";
  }
}

function mapUrgency(band: PriorityBand): FindingUrgency {
  if (band === "ACT NOW") return "ACT_NOW";
  if (band === "TODAY") return "TODAY";
  return "WATCH";
}

function parseTimeframeLabel(label: string): Finding["timeframe"] {
  // Demo labels like "Tonight · 19:00-20:30"
  const windowMatch = label.match(/(\d{2}:\d{2})\s*[--]\s*(\d{2}:\d{2})/);
  if (windowMatch) {
    return {
      start: `2026-08-19T${windowMatch[1]}:00+02:00`,
      end: `2026-08-19T${windowMatch[2]}:00+02:00`,
      label,
    };
  }
  return {
    start: DEMO_NOW,
    end: DEMO_NOW,
    label,
  };
}

function buildDedupeKey(pf: PriorityFinding): string {
  return [
    pf.locationId,
    pf.territory,
    pf.type,
    pf.timeframe.replace(/\s+/g, "_").toLowerCase(),
  ].join(":");
}

/** Map a PriorityFinding fixture into the canonical Finding schema. */
export function priorityFindingToFinding(
  pf: PriorityFinding,
  organizationId = DEMO_ORG.id,
): Finding {
  const urgency = mapUrgency(pf.priorityBand);
  const currency = "EUR";

  return findingSchema.parse({
    id: pf.id,
    organizationId,
    locationId: pf.locationId,
    locationName: pf.locationName,

    territory: pf.territory,
    category: pf.type,
    subtype: pf.kind,

    title: pf.title,
    summary: pf.what,
    explanation: pf.whyItMatters,

    status: mapStatus(pf.status),
    urgency,
    priorityScore: pf.priorityScore,

    confidenceScore: pf.confidence.score,
    confidenceBand: pf.confidence.level,
    confidenceExplanation: pf.confidence.explanation,

    timeframe: parseTimeframeLabel(pf.timeframe),
    financialImpact: {
      grossValue: pf.financialImpact.grossValue,
      revenueAtRisk: pf.financialImpact.revenueAtRisk,
      contributionAtRisk: pf.financialImpact.contributionAtRisk,
      recoverableValue: pf.financialImpact.recoverableValue,
      avoidableCost: pf.financialImpact.avoidableCost,
      primaryValue: pf.financialImpact.primaryEuro,
      primaryLabel: pf.financialImpact.primaryLabel,
      currency,
    },
    drivers: pf.drivers,
    recommendation: {
      title: pf.recommendation.action,
      description: pf.recommendation.detail,
      expectedCost: pf.recommendation.actionCost,
      expectedRevenueProtected: pf.recommendation.expectedRevenueProtected,
      expectedContributionProtected:
        pf.recommendation.expectedContributionProtected,
      expectedNetBenefit: pf.recommendation.expectedNetBenefit,
      expectedBenefit: pf.recommendation.expectedNetBenefit,
      channels: pf.recommendation.channels,
    },
    evidence: pf.seesRows.map((row, i) => ({
      id: `${pf.id}_ev_${i}`,
      label: row.label,
      value: row.value,
    })),
    sourceIds: pf.dataSources.map((s) => s.key),
    dedupeKey: buildDedupeKey(pf),

    presentation: {
      kindLabel: pf.kind,
      headline: pf.headline,
      recommendShort: pf.recommendShort,
      ctaLabel: pf.ctaLabel,
      financialNote: pf.financialNote,
      actionCreated: pf.actionCreated,
      actionedNote: pf.actionedNote,
      primaryAction: pf.primaryAction,
      secondaryHref: pf.secondaryHref,
      secondaryLabel: pf.secondaryLabel,
      eventId: pf.eventId,
      verificationStatus: pf.verification.status,
      verificationMethod: pf.verification.method,
      dataSources: pf.dataSources.map((s) => ({
        key: s.key,
        label: s.label,
        lastSyncLabel: s.lastSyncLabel,
        ageMinutes: s.ageMinutes,
      })),
    },

    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW,
  });
}

export function urgencyDisplayLabel(urgency: FindingUrgency): string {
  return URGENCY_LABEL[urgency];
}

export function unresolvedDomainFindings(findings: Finding[]): Finding[] {
  return findings.filter((f) => isFindingOpen(f.status));
}

export function valueAtRiskFromFindings(findings: Finding[]): number {
  return currentExposureFromFindings(findings);
}

/** Map Finding status mutations used by Overview back onto Finding.status. */
export function applyFindingStatus(
  finding: Finding,
  status: FindingStatus,
  note?: string,
): Finding {
  const presentation = finding.presentation
    ? {
        ...finding.presentation,
        actionedNote:
          status === "ACTIONED" || status === "MONITORING"
            ? note ?? finding.presentation.actionedNote
            : finding.presentation.actionedNote,
        actionCreated:
          status === "ACTIONED"
            ? true
            : finding.presentation.actionCreated,
        verificationStatus:
          status === "ACTIONED" || status === "MONITORING"
            ? ("MONITORING" as const)
            : finding.presentation.verificationStatus,
      }
    : finding.presentation;

  return {
    ...finding,
    status,
    presentation,
    updatedAt: new Date().toISOString(),
  };
}

export function markFindingActioned(finding: Finding): Finding {
  const note = finding.presentation
    ? `${finding.recommendation.title} · just now`
    : undefined;
  return applyFindingStatus(
    {
      ...finding,
      presentation: finding.presentation
        ? { ...finding.presentation, actionCreated: true, actionedNote: note }
        : finding.presentation,
    },
    "ACTIONED",
    note,
  );
}
