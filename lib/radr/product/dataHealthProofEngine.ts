/**
 * Data Health proof engine — evidence trust + decision impact.
 * Deterministic restaurant demo. Trust Score is DERIVED, never hard-coded alone.
 */

import type { RoleView } from "@/lib/product/types";
import { dependentDecisionsFor } from "@/components/product/connections/dependentDecisions";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type HealthStatus = "HEALTHY" | "DEGRADED" | "STALE" | "ERROR" | "DISCONNECTED";

export type FreshnessLabel = "HIGH" | "MEDIUM" | "LOW";
export type CompletenessLabel = "HIGH" | "MEDIUM" | "PARTIAL";

export type ScoreWeights = {
  freshness: number;
  completeness: number;
  conflicts: number;
  coverage: number;
};

/** Scoring config — single source of thresholds. */
export const DH_SCORE_WEIGHTS: ScoreWeights = {
  freshness: 0.35,
  completeness: 0.3,
  conflicts: 0.25,
  coverage: 0.1,
};

export const DH_CAPS = {
  staleRequired: 50,
  criticalConflict: 60,
} as const;

export type AffectedDecision = {
  id: string;
  label: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  confidenceBefore?: number;
  confidenceAfter?: number;
};

export type EvidenceSource = {
  id: string;
  name: string;
  domain: string;
  status: HealthStatus;
  freshnessScore: number;
  freshnessLabel: FreshnessLabel;
  lastSync: string;
  lastSuccessAt: string;
  expectedCadence: string;
  freshnessSla: string;
  slaBreach: string | null;
  completenessScore: number;
  completenessLabel: CompletenessLabel;
  datasets: string[];
  conflictScore: number;
  conflict: string | null;
  conflictCritical: boolean;
  coverageScore: number;
  coverageLabel: string;
  locationCount: number;
  locationTotal: number;
  evidenceInUse: string | null;
  /** Decision labels shown in the Evidence in use column (table). */
  evidenceTags: string[];
  evidenceConfidence: number;
  required: boolean;
  inUseByDecisions: boolean;
  affectedDecisions: AffectedDecision[];
  recommendedAction: string;
};

export type DependencyDomain = {
  id: string;
  label: string;
  decisionCount: number;
  sourceIds: string[];
};

export type DataHealthOverviewModel = {
  healthyCount: number;
  degradedCount: number;
  staleCount: number;
  sourceTotal: number;
  decisionsAffected: number;
  sourcesAffectingDecisions: number;
  trustScore: number;
  trustDeltaPct: number;
  trustTooltip: string;
  sources: EvidenceSource[];
  dependencyDomains: DependencyDomain[];
  attentionCount: number;
};

type SourceInput = Omit<EvidenceSource, "evidenceConfidence"> & {
  evidenceConfidence?: number;
};

function computeEvidenceConfidence(input: {
  freshnessScore: number;
  completenessScore: number;
  conflictScore: number;
  coverageScore: number;
  status: HealthStatus;
  required: boolean;
  conflictCritical: boolean;
}): number {
  const w = DH_SCORE_WEIGHTS;
  let score =
    w.freshness * input.freshnessScore +
    w.completeness * input.completenessScore +
    w.conflicts * input.conflictScore +
    w.coverage * input.coverageScore;
  if (input.conflictCritical) score = Math.min(score, DH_CAPS.criticalConflict);
  if (input.status === "STALE" && input.required) {
    score = Math.min(score, DH_CAPS.staleRequired);
  }
  return Math.round(score);
}

function computeTrustScore(sources: EvidenceSource[]): number {
  if (!sources.length) return 0;
  // Equal mean of current estate — matches deterministic 78% with configured scores
  const sum = sources.reduce((s, r) => s + r.evidenceConfidence, 0);
  return Math.round(sum / sources.length);
}

const SOURCE_INPUTS: SourceInput[] = [
  {
    id: "xero",
    name: "Xero",
    domain: "Accounting",
    status: "STALE",
    freshnessScore: 20,
    freshnessLabel: "LOW",
    lastSync: "6h ago",
    lastSuccessAt: "14:12:08",
    expectedCadence: "15 min",
    freshnessSla: "2h",
    slaBreach: "4h past SLA",
    completenessScore: 56,
    completenessLabel: "PARTIAL",
    datasets: ["Settlements", "AP Ledger"],
    conflictScore: 32,
    conflict: "POS ↔ Ledger timing",
    conflictCritical: true,
    coverageScore: 100,
    coverageLabel: "10 / 10 locations",
    locationCount: 10,
    locationTotal: 10,
    evidenceInUse: "Affects settlement evidence freshness",
    evidenceTags: ["D-4102"],
    required: true,
    inUseByDecisions: true,
    affectedDecisions: [
      {
        id: "dec_supplier_berlin",
        label: "D-4102",
        title: "Settlement reconciliation",
        impact: "High",
        confidenceBefore: 92,
        confidenceAfter: 68,
      },
      {
        id: "dec_settlement_berlin",
        label: "D-2201",
        title: "Daily P&L",
        impact: "Medium",
        confidenceBefore: 88,
        confidenceAfter: 74,
      },
      {
        id: "dec_created",
        label: "D-1188",
        title: "Cash flow forecast",
        impact: "Medium",
        confidenceBefore: 85,
        confidenceAfter: 72,
      },
    ],
    recommendedAction:
      "Check the Xero connection and run a manual sync. If the issue persists, review integration logs.",
  },
  {
    id: "deliverect",
    name: "Deliverect",
    domain: "Delivery",
    status: "DEGRADED",
    freshnessScore: 65,
    freshnessLabel: "MEDIUM",
    lastSync: "4m ago",
    lastSuccessAt: "20:10:48",
    expectedCadence: "60 sec",
    freshnessSla: "5 min",
    slaBreach: null,
    completenessScore: 70,
    completenessLabel: "PARTIAL",
    datasets: ["Uber Eats", "Deliveroo"],
    conflictScore: 55,
    conflict: "Feed intermittent",
    conflictCritical: false,
    coverageScore: 100,
    coverageLabel: "10 / 10 locations",
    locationCount: 10,
    locationTotal: 10,
    evidenceInUse: "Channel mix provisional",
    evidenceTags: ["D-1911", "D-7110"],
    required: true,
    inUseByDecisions: true,
    affectedDecisions: [
      {
        id: "dec_peak_berlin",
        label: "D-1911",
        title: "Peak kitchen pressure",
        impact: "High",
        confidenceBefore: 88,
        confidenceAfter: 79,
      },
      {
        id: "dec_menu_peak_berlin",
        label: "D-7110",
        title: "Menu × peak contribution",
        impact: "Medium",
        confidenceBefore: 86,
        confidenceAfter: 78,
      },
    ],
    recommendedAction:
      "Review Deliverect channel feeds. Confirm Uber Eats and Deliveroo payloads are complete.",
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    domain: "POS",
    status: "HEALTHY",
    freshnessScore: 96,
    freshnessLabel: "HIGH",
    lastSync: "40s ago",
    lastSuccessAt: "20:14:22",
    expectedCadence: "60 sec",
    freshnessSla: "2 min",
    slaBreach: null,
    completenessScore: 94,
    completenessLabel: "HIGH",
    datasets: ["Orders", "Menu", "Tickets"],
    conflictScore: 95,
    conflict: null,
    conflictCritical: false,
    coverageScore: 100,
    coverageLabel: "10 / 10 locations",
    locationCount: 10,
    locationTotal: 10,
    evidenceInUse: null,
    evidenceTags: [],
    required: true,
    inUseByDecisions: false,
    affectedDecisions: [],
    recommendedAction: "No action required.",
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    domain: "Reservations",
    status: "HEALTHY",
    freshnessScore: 94,
    freshnessLabel: "HIGH",
    lastSync: "2m ago",
    lastSuccessAt: "20:13:05",
    expectedCadence: "2 min",
    freshnessSla: "5 min",
    slaBreach: null,
    completenessScore: 92,
    completenessLabel: "HIGH",
    datasets: ["Covers", "Waitlist", "Guest profiles"],
    conflictScore: 94,
    conflict: null,
    conflictCritical: false,
    coverageScore: 100,
    coverageLabel: "10 / 10 locations",
    locationCount: 10,
    locationTotal: 10,
    evidenceInUse: null,
    evidenceTags: [],
    required: true,
    inUseByDecisions: false,
    affectedDecisions: [],
    recommendedAction: "No action required.",
  },
  {
    id: "toast-kds",
    name: "Toast KDS",
    domain: "Kitchen",
    status: "HEALTHY",
    freshnessScore: 95,
    freshnessLabel: "HIGH",
    lastSync: "40s ago",
    lastSuccessAt: "20:14:20",
    expectedCadence: "60 sec",
    freshnessSla: "2 min",
    slaBreach: null,
    completenessScore: 88,
    completenessLabel: "HIGH",
    datasets: ["Ticket times", "KDS events"],
    conflictScore: 88,
    conflict: null,
    conflictCritical: false,
    coverageScore: 100,
    coverageLabel: "10 / 10 locations",
    locationCount: 10,
    locationTotal: 10,
    evidenceInUse: null,
    evidenceTags: [],
    required: false,
    inUseByDecisions: false,
    affectedDecisions: [],
    recommendedAction: "No action required.",
  },
];

const DEPENDENCY_DOMAINS: DependencyDomain[] = [
  {
    id: "financial",
    label: "Financial reporting",
    decisionCount: 2,
    sourceIds: ["xero", "lightspeed"],
  },
  {
    id: "labor",
    label: "Labor optimization",
    decisionCount: 1,
    sourceIds: ["toast-kds", "sevenrooms"],
  },
  {
    id: "menu",
    label: "Menu & profitability",
    decisionCount: 2,
    sourceIds: ["lightspeed", "deliverect", "xero"],
  },
  {
    id: "guest",
    label: "Guest experience",
    decisionCount: 1,
    sourceIds: ["sevenrooms"],
  },
];

function buildSources(): EvidenceSource[] {
  return SOURCE_INPUTS.map((raw) => {
    const evidenceConfidence = computeEvidenceConfidence(raw);
    return { ...raw, evidenceConfidence };
  }).sort((a, b) => {
    const rank = (s: HealthStatus) =>
      s === "STALE" ? 0 : s === "DEGRADED" ? 1 : s === "ERROR" ? 2 : 3;
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  });
}

export function buildDataHealthOverview(
  _role: RoleView = "cfo",
  _vertical: DemoVerticalFamily = "restaurant",
): DataHealthOverviewModel {
  const sources = buildSources();
  const healthyCount = sources.filter((s) => s.status === "HEALTHY").length;
  const degradedCount = sources.filter((s) => s.status === "DEGRADED").length;
  const staleCount = sources.filter((s) => s.status === "STALE").length;
  const affecting = sources.filter((s) => s.inUseByDecisions);
  // Table-visible Decision tags (D-4102 · D-1911 · D-7110) → 3 across 2 sources
  const evidenceDecisionTags = new Set(
    sources.flatMap((s) => s.evidenceTags),
  );
  const trustScore = computeTrustScore(sources);

  return {
    healthyCount,
    degradedCount,
    staleCount,
    sourceTotal: sources.length,
    decisionsAffected: evidenceDecisionTags.size,
    sourcesAffectingDecisions: affecting.length,
    trustScore,
    trustDeltaPct: 12,
    trustTooltip:
      "Trust Score = average evidence confidence across estate sources. Each source = 35% freshness · 30% completeness · 25% conflicts · 10% coverage. Stale required sources are capped at 50%.",
    sources,
    dependencyDomains: DEPENDENCY_DOMAINS,
    attentionCount: degradedCount + staleCount,
  };
}

export function getEvidenceSource(
  id: string,
  model?: DataHealthOverviewModel,
): EvidenceSource | null {
  const sources = model?.sources ?? buildSources();
  return sources.find((s) => s.id === id) ?? null;
}

export type DataHealthStatusFilter =
  | "all"
  | "healthy"
  | "degraded"
  | "stale"
  | "decisions";

export function parseDataHealthStatus(
  raw: string | null,
): DataHealthStatusFilter {
  if (
    raw === "healthy" ||
    raw === "degraded" ||
    raw === "stale" ||
    raw === "decisions"
  ) {
    return raw;
  }
  return "all";
}

export function parseDataHealthSourceId(
  raw: string | null,
  sources: EvidenceSource[],
): string | null {
  if (!raw) return null;
  const hit = sources.find(
    (s) =>
      s.id === raw ||
      s.name.toLowerCase().replace(/\s+/g, "-") === raw.toLowerCase(),
  );
  return hit?.id ?? null;
}

export function filterEvidenceSources(
  sources: EvidenceSource[],
  query: string,
  status: DataHealthStatusFilter,
): EvidenceSource[] {
  const q = query.trim().toLowerCase();
  return sources.filter((s) => {
    if (status === "healthy" && s.status !== "HEALTHY") return false;
    if (status === "degraded" && s.status !== "DEGRADED") return false;
    if (status === "stale" && s.status !== "STALE") return false;
    if (status === "decisions" && s.affectedDecisions.length === 0) return false;
    if (!q) return true;
    const deps = [
      ...s.affectedDecisions.map((d) => `${d.label} ${d.id}`),
      ...dependentDecisionsFor(s.id).map((d) => d.label),
    ].join(" ");
    return [
      s.name,
      s.domain,
      s.status,
      s.conflict ?? "",
      s.evidenceInUse ?? "",
      deps,
      ...s.datasets,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export type InspectorTab = "overview" | "impact" | "evidence" | "history";

export function parseInspectorTab(raw: string | null): InspectorTab {
  if (
    raw === "impact" ||
    raw === "evidence" ||
    raw === "history"
  ) {
    return raw;
  }
  return "overview";
}

export function confidenceBarTone(score: number): "high" | "medium" | "low" {
  if (score >= 85) return "high";
  if (score >= 60) return "medium";
  return "low";
}
