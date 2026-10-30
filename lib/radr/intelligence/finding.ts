/**
 * IntelligenceFinding — canonical drillable intelligence object.
 * UI renders from this. No orphan material insights.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type FindingDisposition =
  | "NO_ACTION"
  | "WATCH"
  | "ACTIONABLE"
  | "DECISION_REQUIRED"
  | "RADR_HANDLING"
  | "VERIFICATION_PENDING";

export type FindingDriver = {
  id: string;
  label: string;
  amountEuro: number;
  sharePct: number;
  actionable: boolean;
  note?: string;
};

export type FindingLever = {
  id: string;
  label: string;
  expectedEuro: number;
  guestImpact: "none" | "low" | "medium" | "high";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  dominated?: boolean;
  recommended?: boolean;
  isNoAction?: boolean;
};

export type FindingEvidence = {
  id: string;
  label: string;
  value: string;
  source: string;
  freshness: string;
};

export type IntelligenceFinding = {
  id: string;
  metric: string;
  scope: string;
  period: string;
  status: string;
  materiality: "noise" | "watch" | "material";
  observedChange: string;
  expectedBaseline: string;
  primaryFormatted: string;
  comparisonFormatted: string;
  explainedPct: number;
  drivers: FindingDriver[];
  evidence: FindingEvidence[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  actionableDrivers: FindingDriver[];
  relatedDecisions: { id: string; displayId: string; title: string }[];
  availableLevers: FindingLever[];
  noActionBaseline: string;
  dataHealth: "ok" | "degraded" | "stale";
  disposition: FindingDisposition;
  /** Disposition path — required for material findings */
  noActionReason?: string;
  watchTrigger?: string;
  preparedAction?: string;
  verificationState?: string;
  diagnose: {
    where: { label: string; sharePct: number }[];
    when: string;
    changed: string[];
  };
  followUps: string[];
};

const FINDINGS: IntelligenceFinding[] = [
  {
    id: "if_contribution_mtd",
    metric: "contribution",
    scope: "Northstar Restaurants · portfolio",
    period: "MTD",
    status: "Adverse vs plan",
    materiality: "material",
    observedChange: "−€4.8k vs plan",
    expectedBaseline: "Plan contribution",
    primaryFormatted: "€89.4k",
    comparisonFormatted: "−€4.8k vs plan",
    explainedPct: 86,
    drivers: [
      { id: "sales", label: "Sales", amountEuro: 6800, sharePct: 0, actionable: false },
      { id: "mix", label: "Menu mix", amountEuro: -1800, sharePct: 18, actionable: true },
      { id: "labor", label: "Labor", amountEuro: -3200, sharePct: 32, actionable: false, note: "Productivity normal" },
      { id: "cogs", label: "COGS", amountEuro: -4100, sharePct: 41, actionable: true },
      { id: "channels", label: "Channels", amountEuro: -2500, sharePct: 25, actionable: true },
    ],
    evidence: [
      { id: "e1", label: "POS contribution", value: "€89.4k", source: "Lightspeed", freshness: "Live" },
      { id: "e2", label: "Plan", value: "€94.2k", source: "Budget", freshness: "MTD" },
      { id: "e3", label: "COGS invoices", value: "+1.1pp", source: "Procurement", freshness: "2d" },
    ],
    confidence: "HIGH",
    actionableDrivers: [],
    relatedDecisions: [
      {
        id: DECISION_IDS.peak,
        displayId: displayDecisionId(DECISION_IDS.peak),
        title: "Wait 12 · peak capacity",
      },
      {
        id: DECISION_IDS.marginCoke,
        displayId: displayDecisionId(DECISION_IDS.marginCoke),
        title: "Beverage margin shock",
      },
    ],
    availableLevers: [
      {
        id: "do_nothing",
        label: "Do nothing",
        expectedEuro: -8400,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "supplier",
        label: "Negotiate / category rebalance",
        expectedEuro: 5200,
        guestImpact: "low",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "throttle",
        label: "Throttle delivery at peak",
        expectedEuro: 620,
        guestImpact: "medium",
        confidence: "HIGH",
      },
      {
        id: "labor_cut",
        label: "Cut labor",
        expectedEuro: 1100,
        guestImpact: "high",
        confidence: "LOW",
        dominated: true,
      },
    ],
    noActionBaseline: "−€8.4k annualized exposure if no intervention",
    dataHealth: "ok",
    disposition: "DECISION_REQUIRED",
    diagnose: {
      where: [
        { label: "Berlin", sharePct: 54 },
        { label: "Frankfurt", sharePct: 24 },
        { label: "Kreuzberg", sharePct: 15 },
      ],
      when: "Friday dinner",
      changed: [
        "Tuna +19%",
        "Delivery +8.1pp",
        "Refunds +38%",
        "Labor productivity within expected range",
      ],
    },
    followUps: [
      "Why Berlin?",
      "What if we do nothing?",
      "Which option has lowest guest impact?",
      "Did this happen before?",
    ],
  },
  {
    id: "if_labor_mtd",
    metric: "labor",
    scope: "Northstar Restaurants · portfolio",
    period: "MTD",
    status: "Adverse · no action",
    materiality: "watch",
    observedChange: "+0.8pp vs target",
    expectedBaseline: "Labor % target",
    primaryFormatted: "30.4%",
    comparisonFormatted: "+0.8pp adverse",
    explainedPct: 100,
    drivers: [
      {
        id: "productivity",
        label: "Productivity",
        amountEuro: 0,
        sharePct: 100,
        actionable: false,
        note: "Within expected range",
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Revenue / labor hour",
        value: "€91",
        source: "Labor + POS",
        freshness: "Live",
      },
    ],
    confidence: "HIGH",
    actionableDrivers: [],
    relatedDecisions: [],
    availableLevers: [
      {
        id: "do_nothing",
        label: "No labor action",
        expectedEuro: 0,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
        recommended: true,
      },
    ],
    noActionBaseline: "No incremental € from labor cut — productivity normal",
    dataHealth: "ok",
    disposition: "NO_ACTION",
    noActionReason: "Productivity remains within expected range",
    diagnose: {
      where: [{ label: "Portfolio", sharePct: 100 }],
      when: "MTD",
      changed: ["Labor % +0.8pp", "Sales/labor hour within ±5%"],
    },
    followUps: ["Why is labor % up?", "Compare to last month"],
  },
  {
    id: "if_cogs_mtd",
    metric: "cogs",
    scope: "Northstar Restaurants · portfolio",
    period: "MTD",
    status: "Adverse · actionable",
    materiality: "material",
    observedChange: "+1.1pp",
    expectedBaseline: "COGS % plan",
    primaryFormatted: "27.9%",
    comparisonFormatted: "+1.1pp",
    explainedPct: 82,
    drivers: [
      {
        id: "supplier",
        label: "Supplier costs",
        amountEuro: -3200,
        sharePct: 62,
        actionable: true,
      },
      {
        id: "mix",
        label: "Menu mix",
        amountEuro: -900,
        sharePct: 20,
        actionable: true,
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Bluefin tuna invoice",
        value: "+19%",
        source: "Supplier",
        freshness: "2d",
      },
    ],
    confidence: "HIGH",
    actionableDrivers: [],
    relatedDecisions: [
      {
        id: DECISION_IDS.tuna,
        displayId: displayDecisionId(DECISION_IDS.tuna),
        title: "Tuna stockout / cost",
      },
      {
        id: DECISION_IDS.marginCoke,
        displayId: displayDecisionId(DECISION_IDS.marginCoke),
        title: "Beverage margin shock",
      },
    ],
    availableLevers: [
      {
        id: "absorb",
        label: "Absorb",
        expectedEuro: 0,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "negotiate",
        label: "Negotiate",
        expectedEuro: 4200,
        guestImpact: "none",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "shift",
        label: "Shift partial volume",
        expectedEuro: 3600,
        guestImpact: "low",
        confidence: "MEDIUM",
      },
    ],
    noActionBaseline: "−€8.4k annualized supplier exposure if absorbed",
    dataHealth: "ok",
    disposition: "ACTIONABLE",
    preparedAction: "Negotiation pack + category rebalance draft",
    diagnose: {
      where: [
        { label: "Berlin", sharePct: 48 },
        { label: "Frankfurt", sharePct: 31 },
      ],
      when: "Last 6 weeks",
      changed: ["Tuna +19%", "Beverage Coke +23.8% unit"],
    },
    followUps: ["Which vendors?", "Can menu absorb?", "Compare Futures"],
  },
  {
    id: "if_revenue_mtd",
    metric: "revenue",
    scope: "Northstar Restaurants · portfolio",
    period: "MTD",
    status: "Ahead of forecast",
    materiality: "watch",
    observedChange: "+3.2% vs forecast",
    expectedBaseline: "Revenue forecast",
    primaryFormatted: "€312k",
    comparisonFormatted: "+3.2% vs forecast",
    explainedPct: 91,
    drivers: [
      {
        id: "covers",
        label: "Covers",
        amountEuro: 4200,
        sharePct: 55,
        actionable: false,
      },
      {
        id: "spend",
        label: "Avg spend",
        amountEuro: 2100,
        sharePct: 28,
        actionable: false,
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Covers MTD",
        value: "+4.1%",
        source: "Reservations + POS",
        freshness: "Live",
      },
    ],
    confidence: "HIGH",
    actionableDrivers: [],
    relatedDecisions: [],
    availableLevers: [
      {
        id: "hold",
        label: "No revenue action",
        expectedEuro: 0,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
        recommended: true,
      },
    ],
    noActionBaseline: "Revenue strength holds; contribution is the Decision surface",
    dataHealth: "ok",
    disposition: "NO_ACTION",
    noActionReason: "Revenue ahead — contribution gap is the material Decision path",
    diagnose: {
      where: [{ label: "Berlin", sharePct: 42 }],
      when: "Friday + Saturday",
      changed: ["Covers ahead", "Delivery share up"],
    },
    followUps: ["Where is contribution moving?", "Channel mix?"],
  },
];

// Fill actionableDrivers from drivers where actionable
for (const f of FINDINGS) {
  f.actionableDrivers = f.drivers.filter((d) => d.actionable);
}

const BY_ID = new Map(FINDINGS.map((f) => [f.id, f]));
const BY_METRIC = new Map(FINDINGS.map((f) => [f.metric, f]));

export function listIntelligenceFindings(): IntelligenceFinding[] {
  return FINDINGS;
}

export function getIntelligenceFinding(id: string): IntelligenceFinding | null {
  return BY_ID.get(id) ?? null;
}

export function findingForMetric(metricId: string): IntelligenceFinding | null {
  const key = metricId.toLowerCase();
  if (key.includes("contribution")) return BY_METRIC.get("contribution") ?? null;
  if (key.includes("labor")) return BY_METRIC.get("labor") ?? null;
  if (key.includes("cogs") || key.includes("food")) return BY_METRIC.get("cogs") ?? null;
  if (key.includes("revenue") || key.includes("verified"))
    return BY_METRIC.get("revenue") ?? null;
  return BY_METRIC.get("contribution") ?? null;
}

/** Enrich contribution finding drivers from live bridge when available. */
export function contributionFindingFromBridge(): IntelligenceFinding {
  const base = BY_METRIC.get("contribution")!;
  const bridge = getContributionBridge();
  const drivers = bridge.segments
    .filter((s) => s.kind === "positive" || s.kind === "negative")
    .map((s) => ({
      id: s.id,
      label: s.label,
      amountEuro: s.amount,
      sharePct: 0,
      actionable: s.kind === "negative" && !/labor/i.test(s.label),
      note: /labor/i.test(s.label) ? "Productivity normal" : undefined,
    }));
  const adverse = drivers.filter((d) => d.amountEuro < 0);
  const totalAdverse = adverse.reduce((s, d) => s + Math.abs(d.amountEuro), 0) || 1;
  for (const d of adverse) {
    d.sharePct = Math.round((Math.abs(d.amountEuro) / totalAdverse) * 100);
  }
  return {
    ...base,
    primaryFormatted: bridge.segments.find((s) => s.id === "actual")?.formatted ?? base.primaryFormatted,
    comparisonFormatted: bridge.varianceFormatted.startsWith("−") || bridge.varianceAmount < 0
      ? bridge.varianceFormatted.startsWith("−") || bridge.varianceFormatted.startsWith("-")
        ? bridge.varianceFormatted
        : `−${formatDecisionMoney(Math.abs(bridge.varianceAmount))}`
      : bridge.varianceFormatted,
    observedChange: `${bridge.varianceFormatted} vs plan`,
    drivers: drivers.length ? drivers : base.drivers,
    actionableDrivers: (drivers.length ? drivers : base.drivers).filter((d) => d.actionable),
  };
}

export function assertNoOrphanMaterialFindings(): string[] {
  const errors: string[] = [];
  for (const f of FINDINGS) {
    if (f.materiality !== "material") continue;
    const hasPath =
      Boolean(f.noActionReason) ||
      Boolean(f.watchTrigger) ||
      f.relatedDecisions.length > 0 ||
      Boolean(f.preparedAction) ||
      Boolean(f.verificationState) ||
      f.disposition === "NO_ACTION" ||
      f.disposition === "WATCH" ||
      f.disposition === "RADR_HANDLING" ||
      f.disposition === "VERIFICATION_PENDING" ||
      f.disposition === "DECISION_REQUIRED" ||
      f.disposition === "ACTIONABLE";
    if (!hasPath) errors.push(f.id);
    if (
      f.disposition === "NO_ACTION" &&
      !f.noActionReason &&
      f.availableLevers.every((l) => !l.isNoAction)
    ) {
      errors.push(`${f.id}: missing noActionReason`);
    }
  }
  return errors;
}

export type CompressionDisposition = {
  noAction: number;
  watching: number;
  handling: number;
  needJudgment: number;
  verifying?: number;
  actionable?: number;
};

/** Canonical disposition aggregation — evaluated must equal the sum of parts. */
export function reconcileCompression(
  parts: CompressionDisposition,
): CompressionDisposition & { evaluated: number } {
  const verifying = parts.verifying ?? 0;
  const actionable = parts.actionable ?? 0;
  const evaluated =
    parts.noAction +
    parts.watching +
    parts.handling +
    parts.needJudgment +
    verifying +
    actionable;
  return { ...parts, verifying, actionable, evaluated };
}

export function executiveCompressionLine(input: {
  evaluated?: number;
  withinExpectation: number;
  handling: number;
  watching: number;
  needJudgment: number;
  verifying?: number;
}): string {
  const reconciled = reconcileCompression({
    noAction: input.withinExpectation,
    watching: input.watching,
    handling: input.handling,
    needJudgment: input.needJudgment,
    verifying: input.verifying,
  });
  // Prefer reconciled total — never trust a caller-supplied total that doesn't add up.
  const evaluated = reconciled.evaluated;
  const verifying = reconciled.verifying ?? 0;
  const verifyingBit =
    verifying > 0 ? ` · ${verifying} verifying` : "";
  return `${evaluated} evaluated · ${reconciled.noAction} cleared · ${reconciled.handling} RADR handling · ${reconciled.watching} watching · ${reconciled.needJudgment} need judgment${verifyingBit}`;
}
