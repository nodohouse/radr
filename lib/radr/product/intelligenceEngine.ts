/**
 * Intelligence Engine — canonical Finding model for /app/intelligence.
 * Deterministic demo SSOT. Cost movers economics align with D-4102 (€6.80 / €7.45 / 420 L / €273).
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  COST_MOVER_SKUS,
  type CostMoverHorizon,
  type VendorSkuCostMover,
} from "@/lib/radr/procurement/costMovers";
import type { IntelCategory } from "@/lib/radr/intelligence/moduleRegistry";

export type IntelFindingState =
  | "OBSERVING"
  | "WATCHING"
  | "DECISION_FORMED"
  | "IN_MOTION"
  | "VERIFYING"
  | "VERIFIED"
  | "DATA_DEGRADED";

export type IntelPeriod = "7d" | "30d" | "90d" | "1y";

export type IntelSort =
  | "impact"
  | "newest"
  | "exposure"
  | "confidence"
  | "urgency"
  | "verified";

export type IntelSkuSlug = "tuna" | "olive-oil" | "chicken" | "coke";

export type IntelEvidenceMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  accent?: "green" | "coral" | "neutral";
};

export type IntelRecommendation = {
  id: string;
  title: string;
  why: string;
  valueLow: number;
  valueHigh: number;
  confidence: number;
  timeHorizon: string;
  tradeoff: string;
  actionType: string;
};

export type IntelFinding = {
  id: string;
  domain: IntelCategory;
  title: string;
  question: string;
  summary: string;
  state: IntelFindingState;
  periodDefault: IntelPeriod;
  exposureEuro: number;
  confidencePct: number;
  confidenceLabel: "HIGH" | "MEDIUM" | "LOW";
  decisionId: string | null;
  rankWhy: string[];
  whatRadrSees: string;
  whyItMatters: string;
  evidenceSources: { system: string; detail: string }[];
  recommendations: IntelRecommendation[];
  expectedOutcome: {
    valueLow: number;
    valueHigh: number;
    valueLabel: string;
    riskLow: number;
    riskHigh: number;
    contributionPp?: number;
    locations?: number;
    payback?: string;
  };
  controlCenterNote?: string;
  liveLink?: boolean;
  skus?: IntelSkuSlug[];
};

const SKU_SLUG: Record<string, IntelSkuSlug> = {
  sku_tuna_bluefin: "tuna",
  sku_olive_oil: "olive-oil",
  sku_chicken_supreme: "chicken",
  sku_coke_postmix: "coke",
};

export const INTEL_DOMAINS: { id: IntelCategory; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "live", label: "Live operations" },
  { id: "revenue", label: "Revenue · demand" },
  { id: "menu", label: "Menu · margin" },
  { id: "reservations", label: "Reservations · guests" },
  { id: "labor", label: "Labor" },
  { id: "procurement", label: "Procurement" },
  { id: "payments", label: "Payments · reconciliation" },
  { id: "channels", label: "Channels" },
];

export const INTEL_FINDINGS: IntelFinding[] = [
  {
    id: "cost-movers",
    domain: "procurement",
    title: "Cost movers",
    question: "Which vendor SKUs are drifting in price?",
    summary: "4 SKUs drifting vs contract",
    state: "DECISION_FORMED",
    periodDefault: "30d",
    exposureEuro: 2247,
    confidencePct: 93,
    confidenceLabel: "HIGH",
    decisionId: DECISION_IDS.supplier,
    rankWhy: [
      "€2.2k exposure",
      "12 locations",
      "30-day persistence",
      "93% evidence confidence",
      "Decision ready",
    ],
    whatRadrSees: "4 SKUs drifting vs contract.",
    whyItMatters:
      "€2,247 exposure · 30D. Higher vendor costs are reducing contribution across 12 locations, led by olive oil and tuna.",
    evidenceSources: [
      { system: "Procurement", detail: "Purchase orders · contracts · GRNs" },
      { system: "Accounting", detail: "AP invoices · GL · accruals" },
    ],
    recommendations: [
      {
        id: "renegotiate-oil",
        title: "Renegotiate olive oil pricing",
        why: "Leverage committed volume and contract terms.",
        valueLow: 1050,
        valueHigh: 1400,
        confidence: 91,
        timeHorizon: "30D",
        tradeoff: "Supplier may tighten fill terms.",
        actionType: "negotiate",
      },
      {
        id: "tuna-sub",
        title: "Lock substitute for tuna",
        why: "Source alternate supplier to reduce concentration risk.",
        valueLow: 620,
        valueHigh: 840,
        confidence: 84,
        timeHorizon: "30D",
        tradeoff: "Lead time +1 day on Atlantic Catch.",
        actionType: "source",
      },
      {
        id: "vendor-review",
        title: "Open vendor review",
        why: "Review full catalog for adjacent contract drift.",
        valueLow: 130,
        valueHigh: 180,
        confidence: 78,
        timeHorizon: "30D",
        tradeoff: "Buyer time · ~2 hours.",
        actionType: "review",
      },
    ],
    expectedOutcome: {
      valueLow: 1800,
      valueHigh: 2400,
      valueLabel: "VALUE PROTECTED · 30D",
      riskLow: 60,
      riskHigh: 80,
      contributionPp: 0.3,
      locations: 12,
      payback: "immediate",
    },
    controlCenterNote:
      "€2,247 procurement exposure represents 14% of current contribution gap.",
    skus: ["tuna", "olive-oil", "chicken", "coke"],
  },
  {
    id: "settlement-bridge",
    domain: "payments",
    title: "Settlement bridge",
    question: "Where does settlement break between POS and accounting?",
    summary: "POS expected → processor → accounting",
    state: "DECISION_FORMED",
    periodDefault: "30d",
    exposureEuro: 342,
    confidencePct: 88,
    confidenceLabel: "HIGH",
    decisionId: DECISION_IDS.settlement,
    rankWhy: ["€342 unreconciled", "3 layers", "Decision ready"],
    whatRadrSees: "€342 unreconciled between processor settle and AP post.",
    whyItMatters:
      "POS €184,420 · processor €183,982 · bank €183,982 · accounting €183,640.",
    evidenceSources: [
      { system: "POS", detail: "Expected settlement" },
      { system: "Processor", detail: "Settle batch · fees · refunds" },
      { system: "Accounting", detail: "AP · GL · accruals" },
    ],
    recommendations: [
      {
        id: "post-accrual",
        title: "Post timing accrual",
        why: "Close the €342 layer gap before period lock.",
        valueLow: 300,
        valueHigh: 342,
        confidence: 90,
        timeHorizon: "7D",
        tradeoff: "One-time GL entry.",
        actionType: "reconcile",
      },
    ],
    expectedOutcome: {
      valueLow: 300,
      valueHigh: 342,
      valueLabel: "VALUE PROTECTED · 7D",
      riskLow: 70,
      riskHigh: 90,
    },
  },
  {
    id: "location-exposure",
    domain: "overview",
    title: "Location exposure",
    question: "Where is contribution pressure concentrating?",
    summary: "Soho · New York · Kreuzberg · Roma Norte · Mexico City",
    state: "WATCHING",
    periodDefault: "30d",
    exposureEuro: 1840,
    confidencePct: 81,
    confidenceLabel: "HIGH",
    decisionId: null,
    rankWhy: ["3 locations", "38% Frankfurt share"],
    whatRadrSees: "Frankfurt 38% · Berlin 27% · Hamburg 14% of exposure.",
    whyItMatters: "Location concentration is driving portfolio contribution variance.",
    evidenceSources: [
      { system: "Locations", detail: "Site P&L · pace" },
      { system: "Procurement", detail: "Site invoices" },
    ],
    recommendations: [],
    expectedOutcome: {
      valueLow: 900,
      valueHigh: 1400,
      valueLabel: "VALUE PROTECTED · 30D",
      riskLow: 40,
      riskHigh: 55,
    },
  },
  {
    id: "revenue-vs-forecast",
    domain: "revenue",
    title: "Revenue vs forecast",
    question: "Why are we above revenue plan but below contribution plan?",
    summary: "+3.2% · €17,850 above expected",
    state: "WATCHING",
    periodDefault: "30d",
    exposureEuro: 17850,
    confidencePct: 86,
    confidenceLabel: "HIGH",
    decisionId: null,
    rankWhy: ["Revenue +3.2%", "Contribution lag"],
    whatRadrSees: "Revenue +6.8% · contribution +2.1% — mix and labor absorb the gap.",
    whyItMatters: "Channel mix and COGS dilute the revenue beat into contribution.",
    evidenceSources: [
      { system: "POS", detail: "Revenue · mix" },
      { system: "Labor", detail: "Hours · labor %" },
    ],
    recommendations: [],
    expectedOutcome: {
      valueLow: 4200,
      valueHigh: 6100,
      valueLabel: "VALUE PROTECTED · 30D",
      riskLow: 35,
      riskHigh: 50,
    },
    controlCenterNote: "View contribution bridge in Control Center.",
  },
  {
    id: "verified-value-trend",
    domain: "overview",
    title: "Verified Value trend",
    question: "Which sealed Decisions are compounding?",
    summary: "7 sealed Decisions · MTD",
    state: "VERIFIED",
    periodDefault: "30d",
    exposureEuro: 418000,
    confidencePct: 96,
    confidenceLabel: "HIGH",
    decisionId: null,
    rankWhy: ["€418k actual", "106% accuracy"],
    whatRadrSees: "7 Decisions verified MTD · expected €395k · actual €418k.",
    whyItMatters: "Accuracy 106% — olive oil renegotiation and peak labor templates led.",
    evidenceSources: [
      { system: "Ledger", detail: "Verified Value · sealed outcomes" },
      { system: "Memory", detail: "What worked · where · why" },
    ],
    recommendations: [],
    expectedOutcome: {
      valueLow: 395000,
      valueHigh: 418000,
      valueLabel: "VERIFIED · MTD",
      riskLow: 0,
      riskHigh: 0,
    },
  },
  {
    id: "channel-mix",
    domain: "channels",
    title: "Channel mix",
    question: "How is delivery mix changing contribution?",
    summary: "Delivery growing faster than dine-in",
    state: "WATCHING",
    periodDefault: "30d",
    exposureEuro: 190000,
    confidencePct: 79,
    confidenceLabel: "MEDIUM",
    decisionId: null,
    rankWhy: ["Delivery pace", "Commission drag"],
    whatRadrSees: "Delivery growing faster than dine-in — commission and kitchen load rising.",
    whyItMatters: "Channel mix is a material contributor to contribution gap this month.",
    evidenceSources: [
      { system: "Delivery", detail: "Orders · commission" },
      { system: "POS", detail: "Dine-in vs delivery" },
    ],
    recommendations: [],
    expectedOutcome: {
      valueLow: 80000,
      valueHigh: 120000,
      valueLabel: "VALUE PROTECTED · 30D",
      riskLow: 30,
      riskHigh: 45,
    },
  },
];

export const CATALOG_MORE_COUNT = 12;

export const COMPARE_DRIVERS = [
  { id: "labor", label: "Labor", euro: -410000 },
  { id: "procurement", label: "Procurement", euro: -225000 },
  { id: "channel", label: "Channel", euro: -190000 },
  { id: "menu", label: "Menu mix", euro: -128000 },
  { id: "reservations", label: "Reservations", euro: 86000 },
  { id: "verified", label: "Verified Decisions", euro: 395000 },
] as const;

export function periodToHorizon(p: IntelPeriod): CostMoverHorizon {
  if (p === "7d") return "7D";
  if (p === "90d") return "90D";
  if (p === "1y") return "1Y";
  return "30D";
}

export function parsePeriod(raw: string | null): IntelPeriod {
  if (raw === "7d" || raw === "90d" || raw === "1y" || raw === "30d") return raw;
  return "30d";
}

export function parseDomain(raw: string | null): IntelCategory {
  if (INTEL_DOMAINS.some((d) => d.id === raw)) return raw as IntelCategory;
  return "overview";
}

export function parseFindingId(raw: string | null): string {
  if (raw && allFindings().some((f) => f.id === raw)) return raw;
  return "cost-movers";
}

export function parseSku(raw: string | null): IntelSkuSlug {
  if (raw === "tuna" || raw === "olive-oil" || raw === "chicken" || raw === "coke") {
    return raw;
  }
  return "olive-oil";
}

export function skuFromMover(m: VendorSkuCostMover): IntelSkuSlug {
  return SKU_SLUG[m.skuId] ?? "olive-oil";
}

export function moverForSlug(slug: IntelSkuSlug): VendorSkuCostMover {
  const hit = COST_MOVER_SKUS.find((m) => SKU_SLUG[m.skuId] === slug);
  return hit ?? COST_MOVER_SKUS[1]!;
}

export function shortSkuName(m: VendorSkuCostMover): string {
  return m.name.split("·")[0]?.trim() ?? m.name;
}

export function findingsForDomain(domain: IntelCategory): IntelFinding[] {
  // Overview keeps the default 6 — extras surface via domain filter / catalog.
  if (domain === "overview") return INTEL_FINDINGS;
  const scoped = allFindings().filter((f) => f.domain === domain);
  return scoped.length ? scoped : INTEL_FINDINGS;
}

export function sortFindings(
  list: IntelFinding[],
  sort: IntelSort,
): IntelFinding[] {
  const copy = [...list];
  switch (sort) {
    case "newest":
      return copy.reverse();
    case "exposure":
      return copy.sort((a, b) => b.exposureEuro - a.exposureEuro);
    case "confidence":
      return copy.sort((a, b) => b.confidencePct - a.confidencePct);
    case "urgency":
      return copy.sort((a, b) => stateUrgency(b.state) - stateUrgency(a.state));
    case "verified":
      return copy.sort((a, b) => Number(b.state === "VERIFIED") - Number(a.state === "VERIFIED"));
    case "impact":
    default:
      return copy;
  }
}

function stateUrgency(s: IntelFindingState): number {
  const map: Record<IntelFindingState, number> = {
    DECISION_FORMED: 5,
    IN_MOTION: 4,
    VERIFYING: 3,
    WATCHING: 2,
    OBSERVING: 1,
    DATA_DEGRADED: 4,
    VERIFIED: 0,
  };
  return map[s];
}

export function stateLabel(s: IntelFindingState): string {
  switch (s) {
    case "DECISION_FORMED":
      return "DECISION FORMED";
    case "IN_MOTION":
      return "IN MOTION";
    case "DATA_DEGRADED":
      return "DATA DEGRADED";
    default:
      return s.replace(/_/g, " ");
  }
}

export function stateTone(
  s: IntelFindingState,
): "green" | "amber" | "mint" | "coral" | "quiet" {
  switch (s) {
    case "DECISION_FORMED":
    case "IN_MOTION":
      return "green";
    case "VERIFIED":
      return "mint";
    case "WATCHING":
    case "OBSERVING":
    case "VERIFYING":
      return "amber";
    case "DATA_DEGRADED":
      return "coral";
    default:
      return "quiet";
  }
}

export function evidenceForSku(m: VendorSkuCostMover): IntelEvidenceMetric[] {
  const delta = ((m.currentRate - m.contractRate) / m.contractRate) * 100;
  return [
    {
      id: "contract",
      label: "Contract price",
      value: `€${m.contractRate.toFixed(2)}`,
      detail: `per ${m.unit === "L" ? "litre" : m.unit}`,
    },
    {
      id: "invoice",
      label: "Invoiced price (avg.)",
      value: `€${m.currentRate.toFixed(2)}`,
      detail: `+${delta.toFixed(1)}% per ${m.unit === "L" ? "litre" : m.unit}`,
      accent: "green",
    },
    {
      id: "fill",
      label: "Fill rate",
      value: `${m.fillRatePct}%`,
      detail: "last 30 days",
    },
    {
      id: "delivery",
      label: "Delivery reliability",
      value: "94%",
      detail: "on time",
    },
    {
      id: "locations",
      label: "Affected locations",
      value: "12 of 18",
      detail: "restaurants",
    },
  ];
}

export function formatEuro(n: number): string {
  if (Math.abs(n) >= 1000) {
    return `€${Math.round(n).toLocaleString("en-US")}`;
  }
  return `€${Math.round(n)}`;
}

export function confidenceFactors(finding: IntelFinding) {
  return {
    dataCompleteness: 98,
    contractMatch: 100,
    invoiceNormalization: 96,
    comparableRecords: 54,
    dataFreshness: "Healthy" as const,
    conflictingSignals: 0,
    explanation: `Confidence is ${finding.confidencePct}% because contracts match invoices at unit level, fill and GRN coverage is complete, and no conflicting supplier feeds remain open.`,
  };
}

export type ChartHoverPoint = {
  label: string;
  contract: number;
  paid: number;
  variancePct: number;
  qty: number;
  exposure: number;
  supplier: string;
};

/** Deterministic series for chart hover — no Math.random. */
export function chartPointsFor(
  m: VendorSkuCostMover,
  period: IntelPeriod,
): ChartHoverPoint[] {
  const horizon = periodToHorizon(period);
  const series = m.priceSeries[horizon];
  const n = series.length;
  return series.map((p, i) => {
    const variancePct =
      p.contract === 0 ? 0 : ((p.paid - p.contract) / p.contract) * 100;
    const qty = Math.round(12 + i * 1.7 + (m.skuId.length % 3));
    const exposure = Math.round(qty * Math.max(0, p.paid - p.contract) * 100) / 100;
    const day =
      period === "7d"
        ? `May ${24 + i}`
        : period === "30d"
          ? `May ${1 + Math.floor((i / Math.max(n - 1, 1)) * 29)}`
          : p.label;
    return {
      label: day,
      contract: p.contract,
      paid: p.paid,
      variancePct: Math.round(variancePct * 10) / 10,
      qty,
      exposure,
      supplier: m.vendor,
    };
  });
}

const PERIOD_SCALE: Record<IntelPeriod, number> = {
  "7d": 0.28,
  "30d": 1,
  "90d": 2.85,
  "1y": 11.2,
};

export function scaleExposure(base: number, period: IntelPeriod): number {
  return Math.round(base * PERIOD_SCALE[period]);
}

/** Map Decision lifecycle → Intelligence Finding state. */
export function findingStateFromDecision(
  status: string | undefined | null,
  fallback: IntelFindingState,
): IntelFindingState {
  if (!status) return fallback;
  if (status === "VERIFIED" || status === "LEARNED" || status === "CLOSED") {
    return "VERIFIED";
  }
  if (status === "APPROVED" || status === "EXECUTING" || status === "OBSERVING") {
    return "IN_MOTION";
  }
  if (
    status === "AWAITING_APPROVAL" ||
    status === "RECOMMENDED" ||
    status === "SIMULATED"
  ) {
    return "DECISION_FORMED";
  }
  if (status === "DETECTED" || status === "UNDERSTANDING" || status === "PREDICTED") {
    return "WATCHING";
  }
  return fallback;
}

export type IntelSaysContext = {
  whatRadrSees: string;
  whyItMatters: string;
  recommendations: IntelRecommendation[];
  expectedOutcome: IntelFinding["expectedOutcome"];
  decisionId: string | null;
  liveLink?: boolean;
  controlCenterHref?: string;
  dataHealthLink?: boolean;
  memoryLink?: boolean;
};

/** SKU selection updates RADR Says for Cost movers. */
export function saysForContext(
  finding: IntelFinding,
  sku: IntelSkuSlug | null,
  period: IntelPeriod,
): IntelSaysContext {
  const scale = PERIOD_SCALE[period];
  const scaleOutcome = (o: IntelFinding["expectedOutcome"]) => ({
    ...o,
    valueLow: Math.round(o.valueLow * scale),
    valueHigh: Math.round(o.valueHigh * scale),
  });

  if (finding.id !== "cost-movers" || !sku) {
    return {
      whatRadrSees: finding.whatRadrSees,
      whyItMatters: finding.whyItMatters,
      recommendations: finding.recommendations.map((r) => ({
        ...r,
        valueLow: Math.round(r.valueLow * scale),
        valueHigh: Math.round(r.valueHigh * scale),
      })),
      expectedOutcome: scaleOutcome(finding.expectedOutcome),
      decisionId: finding.decisionId,
      liveLink: finding.liveLink,
      controlCenterHref: finding.controlCenterNote
        ? "/app?lens=contribution"
        : undefined,
      memoryLink: finding.id === "verified-value-trend",
      dataHealthLink: finding.id === "settlement-bridge",
    };
  }

  const m = moverForSlug(sku);
  const exp = scaleExposure(m.exposureEuro, period);
  const periodLabel = period.toUpperCase();

  if (sku === "olive-oil") {
    return {
      whatRadrSees: `Olive oil invoiced at €${m.currentRate.toFixed(2)}/L vs contract €${m.contractRate.toFixed(2)}.`,
      whyItMatters: `${formatEuro(exp)} exposure · ${periodLabel}. 12 locations · fill ${m.fillRatePct}% · otherwise acceptable delivery.`,
      recommendations: finding.recommendations
        .filter((r) => r.id === "renegotiate-oil" || r.id === "vendor-review")
        .map((r) => ({
          ...r,
          valueLow: Math.round(r.valueLow * scale),
          valueHigh: Math.round(r.valueHigh * scale),
        })),
      expectedOutcome: {
        valueLow: Math.round(1050 * scale),
        valueHigh: Math.round(1400 * scale),
        valueLabel: `VALUE PROTECTED · ${periodLabel}`,
        riskLow: 55,
        riskHigh: 75,
        contributionPp: 0.12,
        locations: 12,
        payback: "immediate",
      },
      decisionId: m.relatedDecisionId,
      controlCenterHref: "/app?lens=procurement",
    };
  }

  if (sku === "tuna") {
    return {
      whatRadrSees: `Bluefin tuna +${m.changePct30d}% vs contract — concentration risk on Nordic Seafood.`,
      whyItMatters: `${formatEuro(exp)} exposure · ${periodLabel}. Largest SKU in the Cost movers set.`,
      recommendations: finding.recommendations
        .filter((r) => r.id === "tuna-sub" || r.id === "vendor-review")
        .map((r) => ({
          ...r,
          valueLow: Math.round(r.valueLow * scale),
          valueHigh: Math.round(r.valueHigh * scale),
        })),
      expectedOutcome: {
        valueLow: Math.round(620 * scale),
        valueHigh: Math.round(840 * scale),
        valueLabel: `VALUE PROTECTED · ${periodLabel}`,
        riskLow: 50,
        riskHigh: 70,
        locations: 8,
        payback: "7D",
      },
      decisionId: m.relatedDecisionId,
      controlCenterHref: "/app?lens=procurement",
    };
  }

  return {
    whatRadrSees: `${shortSkuName(m)} drifting +${m.changePct30d}% · watching.`,
    whyItMatters: `${formatEuro(exp)} exposure · ${periodLabel}. Below Decision threshold alone — contributes to portfolio drift.`,
    recommendations: finding.recommendations
      .filter((r) => r.id === "vendor-review")
      .map((r) => ({
        ...r,
        valueLow: Math.round(r.valueLow * scale),
        valueHigh: Math.round(r.valueHigh * scale),
      })),
    expectedOutcome: {
      valueLow: Math.round(m.exposureEuro * 0.6 * scale),
      valueHigh: Math.round(m.exposureEuro * scale),
      valueLabel: `VALUE PROTECTED · ${periodLabel}`,
      riskLow: 25,
      riskHigh: 40,
    },
    decisionId: null,
    controlCenterHref: "/app?lens=procurement",
  };
}

export type CausalStep = {
  label: string;
  value: string;
  kind: "CAUSE" | "CONTRIBUTOR" | "CORRELATION";
};

export function causalChainForSku(sku: IntelSkuSlug): CausalStep[] {
  const m = moverForSlug(sku);
  const pct = `+${m.changePct30d.toFixed(1)}%`;
  return [
    { label: shortSkuName(m).toUpperCase(), value: pct, kind: "CAUSE" },
    { label: "FOOD COST", value: "+0.4pp", kind: "CONTRIBUTOR" },
    { label: "MARGIN", value: "−0.3pp", kind: "CONTRIBUTOR" },
    { label: "LOCATIONS", value: "12", kind: "CORRELATION" },
    {
      label: "EXPOSURE",
      value: formatEuro(m.exposureEuro),
      kind: "CAUSE",
    },
  ];
}

export type SettlementLayer = {
  id: string;
  label: string;
  euro: number;
  note: string;
};

export const SETTLEMENT_LAYERS: SettlementLayer[] = [
  { id: "pos", label: "POS expected", euro: 184420, note: "Tickets settled" },
  { id: "processor", label: "Processor", euro: 183982, note: "Fees · refunds" },
  { id: "bank", label: "Bank", euro: 183982, note: "Settle matched" },
  { id: "accounting", label: "Accounting", euro: 183640, note: "AP post lag" },
];

export const LOCATION_EXPOSURE_BARS = [
  { id: "frankfurt", label: "Frankfurt", pct: 38, euro: 854 },
  { id: "berlin", label: "Berlin", pct: 27, euro: 607 },
  { id: "hamburg", label: "Hamburg", pct: 14, euro: 315 },
  { id: "other", label: "Other", pct: 21, euro: 472 },
] as const;

export const REVENUE_BRIDGE = [
  { id: "revenue", label: "Revenue vs plan", euro: 17850, note: "+6.8%" },
  { id: "labor", label: "Labor absorption", euro: -8200, note: "−3.1pp" },
  { id: "channel", label: "Channel mix", euro: -4100, note: "Delivery drag" },
  { id: "cogs", label: "COGS drift", euro: -3200, note: "Procurement" },
  { id: "contribution", label: "Contribution vs plan", euro: 2350, note: "+2.1%" },
] as const;

export const VERIFIED_VALUE_ROWS = [
  {
    id: "oil",
    title: "Olive oil renegotiation",
    expected: 1180,
    actual: 1310,
    where: "12 locations",
    learned: "Works when annual volume > 4.2k L and expiry < 90d",
  },
  {
    id: "labor",
    title: "Peak labor template",
    expected: 62000,
    actual: 64800,
    where: "Berlin · Frankfurt",
    learned: "Template beats ad-hoc cuts when covers > 92% of plan",
  },
  {
    id: "peak",
    title: "VIP terrace hold",
    expected: 4200,
    actual: 3980,
    where: "Soho · New York",
    learned: "Hold window ≤ 18 min or guest recovery cost rises",
  },
] as const;

export const CHANNEL_MIX_ROWS = [
  { id: "dine", label: "Dine-in", sharePct: 58, growthPct: 1.2, contributionPp: 0.4 },
  { id: "delivery", label: "Delivery", sharePct: 31, growthPct: 8.4, contributionPp: -0.9 },
  { id: "pickup", label: "Pickup", sharePct: 11, growthPct: 3.1, contributionPp: 0.1 },
] as const;

export const MENU_DESTROYERS = [
  {
    id: "truffle",
    name: "Truffle pasta",
    volumePct: 22,
    foodCostPct: 14,
    contributionPp: -3.2,
    why: "Supplier cost drift + discount mix",
  },
  {
    id: "tuna-dish",
    name: "Tuna tataki",
    volumePct: 11,
    foodCostPct: 9,
    contributionPp: -1.8,
    why: "Rush premium on bluefin",
  },
  {
    id: "burger",
    name: "House burger",
    volumePct: 8,
    foodCostPct: 2,
    contributionPp: 0.4,
    why: "Healthy — keep",
  },
] as const;

/** Domain extras — not on Overview rail (keeps default = 6). */
export const INTEL_EXTRA_FINDINGS: IntelFinding[] = [
  {
    id: "kitchen-pressure",
    domain: "live",
    title: "Kitchen pressure",
    question: "Why is kitchen pressure increasing?",
    summary: "Delivery adding 18% to hot-line load",
    state: "WATCHING",
    periodDefault: "7d",
    exposureEuro: 420,
    confidencePct: 87,
    confidenceLabel: "HIGH",
    decisionId: null,
    rankWhy: ["3 turns at risk", "€420 exposure"],
    whatRadrSees: "Delivery demand is adding 18% to hot-line load.",
    whyItMatters: "3 turns at risk · €420 exposure tonight.",
    evidenceSources: [
      { system: "KDS", detail: "Ticket age · station load" },
      { system: "Delivery", detail: "Order pace" },
      { system: "Reservations", detail: "Covers on books" },
      { system: "POS", detail: "Ticket mix" },
    ],
    recommendations: [
      {
        id: "throttle",
        title: "Throttle delivery 12 minutes",
        why: "Protect dine-in turns during peak.",
        valueLow: 280,
        valueHigh: 420,
        confidence: 84,
        timeHorizon: "Tonight",
        tradeoff: "Delivery GMV pause · ~€90",
        actionType: "throttle",
      },
    ],
    expectedOutcome: {
      valueLow: 280,
      valueHigh: 420,
      valueLabel: "VALUE PROTECTED · TONIGHT",
      riskLow: 45,
      riskHigh: 65,
    },
    liveLink: true,
  },
  {
    id: "menu-destroyers",
    domain: "menu",
    title: "Menu margin destroyers",
    question: "Which dishes are growing revenue but destroying margin?",
    summary: "Truffle pasta · volume +22% · contribution −3.2pp",
    state: "WATCHING",
    periodDefault: "30d",
    exposureEuro: 128000,
    confidencePct: 82,
    confidenceLabel: "HIGH",
    decisionId: DECISION_IDS.menuPeak,
    rankWhy: ["Mix effect", "Food cost drift"],
    whatRadrSees: "Truffle pasta volume +22% while contribution −3.2pp.",
    whyItMatters: "Supplier cost drift + discount mix is eroding contribution.",
    evidenceSources: [
      { system: "POS", detail: "Item mix · price" },
      { system: "Procurement", detail: "Ingredient cost" },
    ],
    recommendations: [
      {
        id: "price-portion",
        title: "Price / portion / sourcing fork",
        why: "Restore contribution without killing demand.",
        valueLow: 18000,
        valueHigh: 32000,
        confidence: 78,
        timeHorizon: "30D",
        tradeoff: "Guest reaction risk on +€1.50",
        actionType: "menu",
      },
    ],
    expectedOutcome: {
      valueLow: 18000,
      valueHigh: 32000,
      valueLabel: "VALUE PROTECTED · 30D",
      riskLow: 40,
      riskHigh: 60,
    },
  },
  {
    id: "terrace-conversion",
    domain: "reservations",
    title: "Terrace conversion",
    question: "Where is guest demand converting poorly?",
    summary: "Terrace strong · pace limits 20:10–20:40",
    state: "WATCHING",
    periodDefault: "7d",
    exposureEuro: 860,
    confidencePct: 80,
    confidenceLabel: "HIGH",
    decisionId: DECISION_IDS.peak,
    rankWhy: ["Waitlist", "Turn pace"],
    whatRadrSees:
      "Terrace demand is strong but service pace is limiting conversion 20:10–20:40.",
    whyItMatters: "€860 exposed covers · VIP wait risk rising.",
    evidenceSources: [
      { system: "Reservations", detail: "Pace · waitlist" },
      { system: "POS", detail: "Turns" },
      { system: "Guests", detail: "Segment value" },
    ],
    recommendations: [
      {
        id: "hold-window",
        title: "Hold VIP terrace window",
        why: "Protect conversion without overbooking.",
        valueLow: 600,
        valueHigh: 860,
        confidence: 85,
        timeHorizon: "Tonight",
        tradeoff: "One walk-in slot",
        actionType: "hold",
      },
    ],
    expectedOutcome: {
      valueLow: 600,
      valueHigh: 860,
      valueLabel: "VALUE PROTECTED · TONIGHT",
      riskLow: 50,
      riskHigh: 70,
    },
    liveLink: true,
  },
  {
    id: "labor-template",
    domain: "labor",
    title: "Labor template drift",
    question: "Where are scheduled hours disconnected from demand?",
    summary: "Frankfurt late shift · labor +8.4pp",
    state: "WATCHING",
    periodDefault: "7d",
    exposureEuro: 1840,
    confidencePct: 83,
    confidenceLabel: "HIGH",
    decisionId: DECISION_IDS.labor,
    rankWhy: ["€1,840", "Next 7d €4,600"],
    whatRadrSees: "Frankfurt late shift labor +8.4pp while covers −11%.",
    whyItMatters: "€1,840 exposed this week · €4,600 expected next 7d if unchanged.",
    evidenceSources: [
      { system: "Labor", detail: "Scheduled hours" },
      { system: "POS", detail: "Cover pace" },
    ],
    recommendations: [
      {
        id: "template",
        title: "Adjust staffing template",
        why: "Reconnect hours to demand curve.",
        valueLow: 3200,
        valueHigh: 4600,
        confidence: 81,
        timeHorizon: "7D",
        tradeoff: "Manager review · 20 min",
        actionType: "schedule",
      },
    ],
    expectedOutcome: {
      valueLow: 3200,
      valueHigh: 4600,
      valueLabel: "VALUE PROTECTED · 7D",
      riskLow: 45,
      riskHigh: 65,
    },
  },
];

export function allFindings(): IntelFinding[] {
  return [...INTEL_FINDINGS, ...INTEL_EXTRA_FINDINGS];
}

export function getFindingById(id: string): IntelFinding | undefined {
  return allFindings().find((f) => f.id === id);
}
