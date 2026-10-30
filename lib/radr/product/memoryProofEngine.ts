/**
 * Operating Memory — model for /app/memory.
 * Deterministic demo SSOT. Calibration: 14.2% → 5.4% across N=24.
 */

import type { DecisionRecord } from "@/lib/radr/decision/record";
import type { RoleView } from "@/lib/product/types";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { MemoryService } from "@/lib/radr/product/services";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { TERRACE_DEMAND_FADE_MISS } from "@/lib/radr/product/valueMiss";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type MemoryView =
  | "overview"
  | "playbooks"
  | "learnings"
  | "dna"
  | "year";

export type MemoryPeriod = "7d" | "30d" | "90d" | "1y";

export type LearningState =
  | "CANDIDATE"
  | "EMERGING"
  | "SUPPORTED"
  | "HIGH_CONFIDENCE"
  | "DISPUTED"
  | "RETIRED";

export type PlaybookStatus =
  | "DRAFT"
  | "TESTING"
  | "LIVE"
  | "SUPERSEDED"
  | "PAUSED";

/** Forecast error narrowing — DEMO envelope for comparable Friday peaks. */
export const CALIBRATION_SERIES = [
  { n: 1, error: 14.2, lo: 8, hi: 22 },
  { n: 5, error: 11.8, lo: 6.5, hi: 18 },
  { n: 12, error: 8.9, lo: 5, hi: 14 },
  { n: 18, error: 6.8, lo: 4, hi: 10.5 },
  { n: 24, error: 5.4, lo: 3.2, hi: 8.2 },
] as const;

export type CalibrationPoint = (typeof CALIBRATION_SERIES)[number];

export type MemoryLearningRow = {
  id: string;
  displayId: string;
  location: string;
  locationId: string;
  statement: string;
  domain: string;
  domainTone: "green" | "blue" | "violet" | "amber" | "coral" | "teal";
  confidence: "High" | "Medium" | "Low";
  state: LearningState;
  added: string;
  href: string;
  sampleSize: number;
  supporting: number;
  contradicting: number;
  playbookId: string | null;
  originFinding: string;
  expectedEuro: number | null;
  verifiedEuro: number | null;
  fromMiss: boolean;
};

export type MemoryDnaPattern = {
  id: string;
  name: string;
  statement: string;
  confidence: number;
  accuracyLift: number;
  spark: number[];
  scope: string;
  locationId: string;
  supporting: number;
  contradicting: number;
  relatedPlaybookIds: string[];
  applicability: string;
  confidenceFactors: string[];
};

export type MemoryWhatChanged = {
  title: string;
  summary: string;
  applies: string;
  fromVersion: string;
  toVersion: string;
  beforeError: number;
  afterError: number;
  decisionId: string;
  evidenceHref: string;
  playbookId: string;
};

export type PlaybookVersion = {
  version: string;
  status: PlaybookStatus;
  date: string;
  reason: string;
  evidenceCount: number;
  confidence: number;
  errorBefore: number | null;
  errorAfter: number | null;
};

export type MemoryPlaybook = {
  id: string;
  name: string;
  domain: string;
  scope: string;
  version: string;
  status: PlaybookStatus;
  confidence: "High" | "Medium" | "Low";
  lastUpdated: string;
  sampleSize: number;
  decisionsInfluenced: number;
  verifiedPositive: number;
  partial: number;
  miss: number;
  currentLogic: string;
  whenApplies: string;
  whenNot: string;
  guardrails: string[];
  inputSignals: string[];
  versions: PlaybookVersion[];
  decisionIds: string[];
  valueHref: string;
  intelligenceHref: string;
};

export type YearMilestone = {
  month: string;
  title: string;
  detail: string;
};

export type MemoryYearModel = {
  services: number;
  decisionsReviewed: number;
  decisionsVerified: number;
  valueVerified: number;
  valueFormatted: string;
  playbooksImproved: number;
  forecastStart: number;
  forecastEnd: number;
  patternsLearned: number;
  milestones: YearMilestone[];
};

export type MemoryOverviewModel = {
  startError: number;
  currentError: number;
  improvementPct: number;
  deltaPp: number;
  sampleSize: number;
  playbookVersion: string;
  uncertaintyLo: number;
  uncertaintyHi: number;
  series: readonly CalibrationPoint[];
  whatChanged: MemoryWhatChanged;
  learnings: MemoryLearningRow[];
  allLearnings: MemoryLearningRow[];
  dna: MemoryDnaPattern[];
  playbooks: MemoryPlaybook[];
  year: MemoryYearModel;
  missLearning: MemoryLearningRow;
  errorMetricLabel: string;
  errorMetricTooltip: string;
  uncertaintyTooltip: string;
};

const DOMAIN_TONE: Record<string, MemoryLearningRow["domainTone"]> = {
  Capacity: "green",
  "Service capacity": "green",
  Labor: "blue",
  Guests: "violet",
  "Guest voice": "violet",
  Marketing: "amber",
  Weather: "amber",
  Procurement: "teal",
  "Supplier / AP": "teal",
  "Menu economics": "coral",
  Menu: "coral",
  "Operating pattern": "blue",
  Decision: "blue",
};

function domainLabel(classLabel: string): string {
  if (classLabel === "Service capacity") return "Capacity";
  if (classLabel === "Guest voice" || classLabel === "Guests") return "Guests";
  if (classLabel === "Supplier / AP") return "Procurement";
  if (classLabel === "Menu economics") return "Menu";
  return classLabel;
}

function confidenceBand(i: number): MemoryLearningRow["confidence"] {
  if (i < 2) return "High";
  if (i < 4) return "Medium";
  return "Low";
}

function learningState(conf: MemoryLearningRow["confidence"]): LearningState {
  if (conf === "High") return "HIGH_CONFIDENCE";
  if (conf === "Medium") return "SUPPORTED";
  return "EMERGING";
}

const ADDED_LABELS = [
  "2h ago",
  "5h ago",
  "1d ago",
  "2d ago",
  "3d ago",
  "4d ago",
  "5d ago",
  "1w ago",
];

function buildPlaybooks(): MemoryPlaybook[] {
  return [
    {
      id: "friday-peak-v4",
      name: "Friday Peak Capacity",
      domain: "Capacity",
      scope: "Soho · New York · Friday dinner peak",
      version: "V4",
      status: "LIVE",
      confidence: "High",
      lastUpdated: "12 Oct",
      sampleSize: 24,
      decisionsInfluenced: 8,
      verifiedPositive: 6,
      partial: 1,
      miss: 1,
      currentLogic:
        "VIP seat exception + workforce rebalance gate. Hold when kitchen ≥90% and inbound ≥30 covers in <25m.",
      whenApplies:
        "Soho · New York · Friday dinner peak · kitchen ≥90% · ≥30 inbound covers in <25m",
      whenNot:
        "Group event · VIP service exception already active · kitchen staffing gap · data health degraded",
      guardrails: [
        "Do not auto-hold VIP tables without GM override",
        "Require inbound cover signal before soft-open terrace",
        "Pause if reservation sync stale >12h",
      ],
      inputSignals: [
        "Kitchen load %",
        "Inbound covers / 25m",
        "FOH coverage",
        "VIP seat flags",
      ],
      versions: [
        {
          version: "V1",
          status: "SUPERSEDED",
          date: "Mar 2026",
          reason: "Baseline seat-first discretionary demand",
          evidenceCount: 4,
          confidence: 58,
          errorBefore: 14.2,
          errorAfter: 13.1,
        },
        {
          version: "V2",
          status: "SUPERSEDED",
          date: "May 2026",
          reason: "Added kitchen pressure threshold",
          evidenceCount: 9,
          confidence: 71,
          errorBefore: 13.1,
          errorAfter: 11.8,
        },
        {
          version: "V3",
          status: "SUPERSEDED",
          date: "Aug 2026",
          reason: "Added VIP seat exception",
          evidenceCount: 16,
          confidence: 82,
          errorBefore: 11.8,
          errorAfter: 8.9,
        },
        {
          version: "V4",
          status: "LIVE",
          date: "Oct 2026",
          reason: "Workforce rebalance + inbound demand gate",
          evidenceCount: 24,
          confidence: 92,
          errorBefore: 11.8,
          errorAfter: 5.4,
        },
      ],
      decisionIds: [DECISION_IDS.peak, DECISION_IDS.labor, DECISION_IDS.menuPeak],
      valueHref: "/app/value",
      intelligenceHref: "/app/intelligence?finding=kitchen-pressure",
    },
    {
      id: "wine-attach-v3",
      name: "Wine Attach Lift",
      domain: "Menu",
      scope: "Roma Norte · Mexico City · dinner",
      version: "V3",
      status: "LIVE",
      confidence: "High",
      lastUpdated: "10 Oct",
      sampleSize: 18,
      decisionsInfluenced: 5,
      verifiedPositive: 4,
      partial: 1,
      miss: 0,
      currentLogic:
        "Premium wine attach when guest mix ≥35% couple/celebrate and kitchen <85%.",
      whenApplies: "Dinner · couple/celebrate mix · kitchen headroom",
      whenNot: "Peak kitchen ≥90% · large group · promo wine already active",
      guardrails: [
        "No attach prompt when service time risk elevated",
        "Respect allergen / preference flags",
      ],
      inputSignals: ["Guest mix", "Kitchen load", "Wine attach rate"],
      versions: [
        {
          version: "V2",
          status: "SUPERSEDED",
          date: "Jul 2026",
          reason: "Table-type adjustments",
          evidenceCount: 11,
          confidence: 74,
          errorBefore: null,
          errorAfter: null,
        },
        {
          version: "V3",
          status: "LIVE",
          date: "Oct 2026",
          reason: "Guest mix signals + service-time guard",
          evidenceCount: 18,
          confidence: 88,
          errorBefore: null,
          errorAfter: null,
        },
      ],
      decisionIds: [DECISION_IDS.menuPeak],
      valueHref: "/app/value",
      intelligenceHref: "/app/intelligence?domain=sell",
    },
    {
      id: "delivery-risk-v2",
      name: "Delivery Refund Risk",
      domain: "Channels",
      scope: "West Hollywood · Los Angeles · Friday evening",
      version: "V2",
      status: "LIVE",
      confidence: "Medium",
      lastUpdated: "08 Oct",
      sampleSize: 14,
      decisionsInfluenced: 4,
      verifiedPositive: 2,
      partial: 1,
      miss: 1,
      currentLogic:
        "Gate delivery accept when kitchen ≥88% and ETA slip historically lifts refunds.",
      whenApplies: "Friday evening · delivery channel · kitchen pressure",
      whenNot: "Dedicated delivery station · low historical refund cohort",
      guardrails: [
        "Do not blanket-block delivery without ETA evidence",
        "Surface coral risk only when refund lift ≥1pp",
      ],
      inputSignals: ["Kitchen load", "Delivery ETA", "Refund rate"],
      versions: [
        {
          version: "V1",
          status: "SUPERSEDED",
          date: "Jun 2026",
          reason: "Initial refund detection",
          evidenceCount: 6,
          confidence: 62,
          errorBefore: null,
          errorAfter: null,
        },
        {
          version: "V2",
          status: "LIVE",
          date: "Oct 2026",
          reason: "Improved refund risk + menu adjust",
          evidenceCount: 14,
          confidence: 79,
          errorBefore: null,
          errorAfter: null,
        },
      ],
      decisionIds: [DECISION_IDS.settlement],
      valueHref: "/app/value",
      intelligenceHref: "/app/intelligence?finding=settlement-bridge",
    },
    {
      id: "supplier-first-v1",
      name: "Supplier-first Strategy",
      domain: "Procurement",
      scope: "Group · peak conditions",
      version: "V1",
      status: "TESTING",
      confidence: "Medium",
      lastUpdated: "11 Oct",
      sampleSize: 9,
      decisionsInfluenced: 3,
      verifiedPositive: 2,
      partial: 1,
      miss: 0,
      currentLogic:
        "Feature-swap first under peak before emergency procurement when SKU variance is contractual.",
      whenApplies: "Peak · contract variance ≥ threshold · stock buffer OK",
      whenNot: "86 risk · guest signature dish · supplier SLA already breached",
      guardrails: [
        "Human approval for high-value AP credits",
        "Minimum 3 comparable invoice evidence",
      ],
      inputSignals: ["Invoice delta", "Contract rate", "Stock buffer"],
      versions: [
        {
          version: "V1",
          status: "TESTING",
          date: "Oct 2026",
          reason: "NEW — feature-swap under peak",
          evidenceCount: 9,
          confidence: 76,
          errorBefore: null,
          errorAfter: null,
        },
      ],
      decisionIds: [DECISION_IDS.supplier, DECISION_IDS.supplierOpen],
      valueHref: "/app/value",
      intelligenceHref: "/app/intelligence?finding=cost-movers",
    },
  ];
}

function buildDna(): MemoryDnaPattern[] {
  return [
    {
      id: "kitchen-load",
      name: "Kitchen load threshold",
      statement: "When kitchen ≥90%, hold discretionary covers.",
      confidence: 92,
      accuracyLift: 18,
      spark: [40, 48, 52, 60, 72, 78, 92],
      scope: "Location",
      locationId: "loc_berlin_mitte",
      supporting: 22,
      contradicting: 2,
      relatedPlaybookIds: ["friday-peak-v4"],
      applicability: "Soho · New York · dinner peak · kitchen telemetry healthy",
      confidenceFactors: [
        "22 comparable services",
        "Low contradiction rate (2)",
        "Recency: last 30 days",
        "Cross-linked to V4 playbook outcomes",
      ],
    },
    {
      id: "friday-peak",
      name: "Friday peak structure",
      statement: "Demand builds 18–32 min earlier in Soho · New York.",
      confidence: 87,
      accuracyLift: 14,
      spark: [30, 35, 42, 55, 68, 80, 87],
      scope: "Location",
      locationId: "loc_berlin_mitte",
      supporting: 18,
      contradicting: 1,
      relatedPlaybookIds: ["friday-peak-v4"],
      applicability: "Soho · New York · Friday dinner",
      confidenceFactors: [
        "18 Friday-peak observations",
        "Consistent lead time band",
        "Booking pace corroboration",
      ],
    },
    {
      id: "weather",
      name: "Weather sensitivity",
      statement: "Terrace demand drops 40–70% below 22°C with wind.",
      confidence: 79,
      accuracyLift: 12,
      spark: [50, 48, 55, 60, 70, 74, 79],
      scope: "Location type",
      locationId: "loc_berlin_mitte",
      supporting: 18,
      contradicting: 3,
      relatedPlaybookIds: [],
      applicability:
        "Terrace locations · unless heating + event demand present",
      confidenceFactors: [
        "18 supporting · 3 contradicting (event nights / heaters)",
        "Seasonal scope retained",
        "Linked to honest miss D-4410",
      ],
    },
    {
      id: "promo-decay",
      name: "Promotion effect decay",
      statement: "Campaign residual demand fades after 2 services.",
      confidence: 76,
      accuracyLift: 11,
      spark: [45, 50, 58, 62, 68, 72, 76],
      scope: "Group",
      locationId: "group",
      supporting: 14,
      contradicting: 2,
      relatedPlaybookIds: ["wine-attach-v3"],
      applicability: "Marketing campaigns · residual demand window",
      confidenceFactors: [
        "14 campaigns observed",
        "Decay consistent across 2 cities",
      ],
    },
    {
      id: "wine-attach",
      name: "Wine attach lift",
      statement: "Premium attach without service-time penalty when kitchen <85%.",
      confidence: 88,
      accuracyLift: 9,
      spark: [42, 50, 58, 66, 74, 82, 88],
      scope: "Location",
      locationId: "loc_hamburg_hafen",
      supporting: 16,
      contradicting: 1,
      relatedPlaybookIds: ["wine-attach-v3"],
      applicability: "Roma Norte · Mexico City · dinner · couple/celebrate mix",
      confidenceFactors: [
        "16 services",
        "+9.4pp attach lift verified",
      ],
    },
  ];
}

function buildYear(): MemoryYearModel {
  return {
    services: 1248,
    decisionsReviewed: 386,
    decisionsVerified: 241,
    valueVerified: 482000,
    valueFormatted: formatDecisionMoney(482000),
    playbooksImproved: 23,
    forecastStart: 18.2,
    forecastEnd: 6.1,
    patternsLearned: 41,
    milestones: [
      {
        month: "JAN",
        title: "Initial baseline",
        detail: "Forecast error baseline established at 18.2%.",
      },
      {
        month: "MAR",
        title: "Friday peak model stabilized",
        detail: "Kitchen pressure entered the peak playbook (V2).",
      },
      {
        month: "JUN",
        title: "Procurement playbook added",
        detail: "Supplier variance path linked to verified AP credits.",
      },
      {
        month: "SEP",
        title: "Guest recovery model improved",
        detail: "Guest-voice learnings reduced wrong-move labor adds.",
      },
      {
        month: "OCT",
        title: "Peak V4 live",
        detail: "Workforce rebalance + inbound gate · error 5.4% on cohort.",
      },
      {
        month: "DEC",
        title: "Forecast error down 66%",
        detail: "Year close path: 18.2% → 6.1% estate-wide comparable services.",
      },
    ],
  };
}

export function buildMemoryOverview(role: RoleView = "cfo", recordsOverride?: DecisionRecord[]): MemoryOverviewModel {
  const series = CALIBRATION_SERIES;
  const start = series[0]!;
  const current = series[series.length - 1]!;
  const improvementPct = Math.round(
    ((start.error - current.error) / start.error) * 100,
  );
  const deltaPp = Math.round((start.error - current.error) * 10) / 10;
  const ids = recordsOverride ? new Set(recordsOverride.map(r=>r.id)) : null;
  const locations = recordsOverride ? new Set(recordsOverride.map(r=>r.locationId)) : null;
  const playbooks = buildPlaybooks().filter(p=>!ids || p.decisionIds.some(id=>ids.has(id)));
  const dna = buildDna().filter(d=>!locations || locations.has(d.locationId));
  const year = buildYear();

  const fromStore = (recordsOverride ?? MemoryService.forRole(role))
    .filter((r) => r.lesson)
    .slice(0, 10)
    .map((r, i) => {
      const classLabel = customerDecisionClass(r);
      const domain = domainLabel(classLabel);
      const confidence = confidenceBand(i);
      const pb =
        r.id === DECISION_IDS.peak || r.id === DECISION_IDS.labor
          ? "friday-peak-v4"
          : r.id === DECISION_IDS.menuPeak
            ? "wine-attach-v3"
            : r.id === DECISION_IDS.supplier || r.id === DECISION_IDS.supplierOpen
              ? "supplier-first-v1"
              : null;
      return {
        id: r.id,
        displayId: displayDecisionId(r.id),
        location: locationDisplayName(r.locationId),
        locationId: r.locationId,
        statement: r.lesson!,
        domain,
        domainTone: DOMAIN_TONE[domain] ?? DOMAIN_TONE[classLabel] ?? "green",
        confidence,
        state: learningState(confidence),
        added: ADDED_LABELS[i] ?? "1w ago",
        href: `/app/decisions/${r.id}`,
        sampleSize: 8 + ((i * 3) % 14),
        supporting: 6 + ((i * 2) % 10),
        contradicting: i % 3 === 0 ? 2 : i % 2,
        playbookId: pb,
        originFinding:
          domain === "Capacity"
            ? "Kitchen pressure"
            : domain === "Procurement"
              ? "Cost movers"
              : domain === "Labor"
                ? "Labor template"
                : "Operating signal",
        expectedEuro: r.expectedContributionImpact ?? null,
        verifiedEuro: r.verifiedValue?.amount ?? r.actualContributionImpact ?? null,
        fromMiss: false,
      } satisfies MemoryLearningRow;
    });

  const missLearning: MemoryLearningRow = {
    id: TERRACE_DEMAND_FADE_MISS.decisionId,
    displayId: TERRACE_DEMAND_FADE_MISS.displayId,
    location: "Soho · New York",
    locationId: "loc_berlin_mitte",
    statement:
      "Weather-hold terrace prep remains preferred, but soft-open without inbound demand signal ranks lower.",
    domain: "Weather",
    domainTone: "amber",
    confidence: "High",
    state: "HIGH_CONFIDENCE",
    added: "3d ago",
    href: `/app/decisions/${TERRACE_DEMAND_FADE_MISS.decisionId}`,
    sampleSize: 7,
    supporting: 5,
    contradicting: 2,
    playbookId: null,
    originFinding: "Terrace conversion",
    expectedEuro: TERRACE_DEMAND_FADE_MISS.expectedEuro,
    verifiedEuro: TERRACE_DEMAND_FADE_MISS.verifiedEuro,
    fromMiss: true,
  };

  const allLearnings: MemoryLearningRow[] = [...fromStore];
  if ((!ids || ids.has(missLearning.id)) && !allLearnings.some((l) => l.id === missLearning.id)) {
    allLearnings.splice(Math.min(3, allLearnings.length), 0, missLearning);
  }

  return {
    startError: start.error,
    currentError: current.error,
    improvementPct,
    deltaPp,
    sampleSize: current.n,
    playbookVersion: "V4",
    uncertaintyLo: current.lo,
    uncertaintyHi: current.hi,
    series,
    whatChanged: {
      title: "Friday peak capacity",
      summary:
        "VIP seat exception + workforce rebalance gate · hold when kitchen ≥90% and inbound ≥30 covers in <25m.",
      applies:
        "Soho · New York · Friday dinner peak · kitchen ≥90% with ≥30 covers inbound in <25m",
      fromVersion: "V3",
      toVersion: "V4 LIVE",
      beforeError: 11.8,
      afterError: current.error,
      decisionId: DECISION_IDS.peak,
      evidenceHref: `/app/decisions/${DECISION_IDS.peak}`,
      playbookId: "friday-peak-v4",
    },
    learnings: allLearnings.slice(0, 5),
    allLearnings,
    dna,
    playbooks,
    year,
    missLearning,
    errorMetricLabel: "MAPE",
    errorMetricTooltip:
      "Forecast error (MAPE) measures the average absolute percentage difference between RADR’s forecast and the observed outcome for comparable Friday peak services.",
    uncertaintyTooltip:
      "Uncertainty range reflects expected forecast variation given current evidence and sample size. As comparable observations accumulate, the band generally narrows.",
  };
}

export function parseMemoryView(raw: string | null): MemoryView {
  if (
    raw === "playbooks" ||
    raw === "learnings" ||
    raw === "dna" ||
    raw === "year"
  ) {
    return raw;
  }
  return "overview";
}

export function parseMemoryPeriod(raw: string | null): MemoryPeriod {
  if (raw === "7d" || raw === "90d" || raw === "1y" || raw === "30d") return raw;
  return "30d";
}

export function parsePlaybookId(
  raw: string | null,
  playbooks: MemoryPlaybook[],
): string | null {
  if (!raw) return null;
  return playbooks.some((p) => p.id === raw) ? raw : null;
}

export function parseLearningParam(
  raw: string | null,
  learnings: MemoryLearningRow[],
): string | null {
  if (!raw) return null;
  const byDisplay = learnings.find(
    (l) => l.displayId.toLowerCase() === raw.toLowerCase(),
  );
  if (byDisplay) return byDisplay.id;
  const byId = learnings.find((l) => l.id === raw);
  return byId ? byId.id : null;
}

export function parseDnaId(
  raw: string | null,
  dna: MemoryDnaPattern[],
): string | null {
  if (!raw) return null;
  return dna.some((d) => d.id === raw) ? raw : null;
}

/** Slice series for period filter — still deterministic; 30d/1y show full cohort. */
export function seriesForPeriod(
  period: MemoryPeriod,
  series: readonly CalibrationPoint[] = CALIBRATION_SERIES,
): readonly CalibrationPoint[] {
  if (period === "7d") return series.slice(0, 3);
  if (period === "90d") return series;
  if (period === "1y") return series;
  return series;
}

export function filterLearnings(
  rows: MemoryLearningRow[],
  opts: { domain?: string; q?: string; location?: string },
): MemoryLearningRow[] {
  const domain = (opts.domain ?? "All").toLowerCase();
  const q = (opts.q ?? "").trim().toLowerCase();
  const loc = (opts.location ?? "").trim().toLowerCase();
  return rows.filter((l) => {
    const d = l.domain.toLowerCase();
    let domainOk = true;
    if (domain && domain !== "all") {
      if (domain === "service") {
        domainOk =
          d.includes("capacity") ||
          d.includes("labor") ||
          d.includes("service") ||
          d.includes("weather");
      } else if (domain === "operations") {
        domainOk =
          d.includes("capacity") ||
          d.includes("labor") ||
          d.includes("operating");
      } else {
        domainOk = d.includes(domain);
      }
    }
    const qOk =
      !q ||
      l.statement.toLowerCase().includes(q) ||
      l.displayId.toLowerCase().includes(q) ||
      l.domain.toLowerCase().includes(q);
    const locOk = !loc || l.location.toLowerCase().includes(loc);
    return domainOk && qOk && locOk;
  });
}
