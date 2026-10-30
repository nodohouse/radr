/**
 * Intelligence graph — drillable nodes for Explorer / Focus.
 * Contribution → COGS → Tuna → Vendor. UI renders from this only.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { FindingLever, FindingEvidence } from "./finding";

export type NodeKind = "metric" | "driver" | "sku" | "vendor";

export type IntelSlice = {
  id: string;
  label: string;
  amountEuro: number;
  sharePct?: number;
  childNodeId?: string;
  actionable?: boolean;
  note?: string;
};

export type IntelligenceNode = {
  id: string;
  kind: NodeKind;
  parentId: string | null;
  title: string;
  primaryFormatted: string;
  comparisonFormatted: string;
  materiality: "noise" | "watch" | "material" | "HIGH" | "MEDIUM" | "LOW";
  actionState: string;
  explainedPct?: number;
  bridge: IntelSlice[];
  where: IntelSlice[];
  what: IntelSlice[];
  whenSeries: { label: string; index: number }[];
  causalSpine: string[];
  soWhat: {
    exposure30d: string;
    exposure90d: string;
    annualized: string;
    affectedDishes?: number;
    affectedLocations?: number;
  };
  levers: FindingLever[];
  noActionBaseline: string;
  relatedDecisions: { id: string; displayId: string; title: string }[];
  evidence: FindingEvidence[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  dataHealth: "ok" | "degraded" | "stale";
  dataHealthNote?: string;
  children: string[];
};

function money(n: number): string {
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  return `${sign}${formatDecisionMoney(Math.abs(n))}`;
}

const NODES: IntelligenceNode[] = [
  {
    id: "contribution",
    kind: "metric",
    parentId: null,
    title: "Contribution",
    primaryFormatted: "€89.4k",
    comparisonFormatted: "−€4.8k vs plan",
    materiality: "HIGH",
    actionState: "2 actionable drivers",
    explainedPct: 86,
    bridge: [
      { id: "sales", label: "Sales", amountEuro: 6800, actionable: false },
      {
        id: "mix",
        label: "Menu mix",
        amountEuro: -1800,
        actionable: true,
        childNodeId: "menu_mix",
      },
      {
        id: "labor",
        label: "Labor",
        amountEuro: -3200,
        actionable: false,
        note: "Productivity normal · NO ACTION",
      },
      {
        id: "cogs",
        label: "COGS",
        amountEuro: -4100,
        sharePct: 41,
        actionable: true,
        childNodeId: "cogs",
      },
      {
        id: "channels",
        label: "Channels",
        amountEuro: -2500,
        actionable: true,
        childNodeId: "channels",
      },
    ],
    where: [
      { id: "berlin", label: "Berlin", amountEuro: -2600, sharePct: 54 },
      { id: "frankfurt", label: "Frankfurt", amountEuro: -1150, sharePct: 24 },
      { id: "kreuzberg", label: "Kreuzberg", amountEuro: -720, sharePct: 15 },
      { id: "other", label: "Other", amountEuro: -330, sharePct: 7 },
    ],
    what: [],
    whenSeries: [
      { label: "W-11", index: 62 },
      { label: "W-8", index: 58 },
      { label: "W-5", index: 55 },
      { label: "W-3", index: 48 },
      { label: "W-1", index: 42 },
      { label: "NOW", index: 38 },
    ],
    causalSpine: [
      "Channel + COGS pressure",
      "Berlin concentration 54%",
      "Contribution −€4.8k",
    ],
    soWhat: {
      exposure30d: "−€1.6k",
      exposure90d: "−€4.8k",
      annualized: "−€19k",
      affectedLocations: 3,
    },
    levers: [
      {
        id: "do_nothing",
        label: "Do nothing",
        expectedEuro: -8400,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "cogs_path",
        label: "Address COGS (tuna / beverage)",
        expectedEuro: 5200,
        guestImpact: "low",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "channel_path",
        label: "Peak delivery control",
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
    evidence: [
      {
        id: "e1",
        label: "POS contribution",
        value: "€89.4k",
        source: "Lightspeed",
        freshness: "Live",
      },
      {
        id: "e2",
        label: "Plan",
        value: "€94.2k",
        source: "Budget",
        freshness: "MTD",
      },
    ],
    confidence: "HIGH",
    dataHealth: "ok",
    children: ["cogs", "channels", "menu_mix"],
  },
  {
    id: "cogs",
    kind: "driver",
    parentId: "contribution",
    title: "COGS",
    primaryFormatted: "27.9%",
    comparisonFormatted: "−€4.1k vs plan",
    materiality: "HIGH",
    actionState: "Primary driver · tuna",
    explainedPct: 82,
    bridge: [],
    where: [
      { id: "berlin", label: "Berlin", amountEuro: -2200, sharePct: 54 },
      { id: "frankfurt", label: "Frankfurt", amountEuro: -1000, sharePct: 24 },
      { id: "kreuzberg", label: "Kreuzberg", amountEuro: -600, sharePct: 15 },
      { id: "other", label: "Other", amountEuro: -300, sharePct: 7 },
    ],
    what: [
      {
        id: "tuna",
        label: "Bluefin tuna",
        amountEuro: -1700,
        sharePct: 41,
        actionable: true,
        childNodeId: "tuna",
      },
      { id: "oil", label: "Olive oil", amountEuro: -900, sharePct: 22 },
      { id: "chicken", label: "Chicken", amountEuro: -500, sharePct: 12 },
      { id: "waste", label: "Waste", amountEuro: -400, sharePct: 10 },
      { id: "mix", label: "Mix", amountEuro: -600, sharePct: 15 },
    ],
    whenSeries: [
      { label: "W-11", index: 48 },
      { label: "W-8", index: 52 },
      { label: "W-5", index: 58 },
      { label: "W-3", index: 70 },
      { label: "W-1", index: 82 },
      { label: "NOW", index: 88 },
    ],
    causalSpine: [
      "Vendor price +19%",
      "Tuna COGS −€1.7k",
      "3 high-volume dishes",
      "Contribution −€1.7k",
    ],
    soWhat: {
      exposure30d: "−€710",
      exposure90d: "−€2.1k",
      annualized: "−€8.4k",
      affectedDishes: 3,
      affectedLocations: 6,
    },
    levers: [
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
        label: "Negotiate current vendor",
        expectedEuro: 5200,
        guestImpact: "none",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "shift",
        label: "Shift 40% volume to Vendor C",
        expectedEuro: 4600,
        guestImpact: "low",
        confidence: "MEDIUM",
      },
    ],
    noActionBaseline: "−€8.4k annualized supplier exposure if absorbed",
    relatedDecisions: [
      {
        id: DECISION_IDS.tuna,
        displayId: displayDecisionId(DECISION_IDS.tuna),
        title: "Tuna stock / cost",
      },
      {
        id: DECISION_IDS.marginCoke,
        displayId: displayDecisionId(DECISION_IDS.marginCoke),
        title: "Beverage category rebalance",
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Bluefin invoice",
        value: "+19% / 90D",
        source: "Supplier",
        freshness: "2d",
      },
    ],
    confidence: "HIGH",
    dataHealth: "ok",
    children: ["tuna"],
  },
  {
    id: "tuna",
    kind: "sku",
    parentId: "cogs",
    title: "Bluefin tuna",
    primaryFormatted: "€14.80/kg",
    comparisonFormatted: "+19% / 90D",
    materiality: "HIGH",
    actionState: "Root driver · vendor price",
    bridge: [],
    where: [
      { id: "berlin", label: "Berlin", amountEuro: -920, sharePct: 54 },
      { id: "frankfurt", label: "Frankfurt", amountEuro: -480, sharePct: 28 },
      { id: "other", label: "Other", amountEuro: -300, sharePct: 18 },
    ],
    what: [
      {
        id: "vendor",
        label: "Vendor A unit price",
        amountEuro: -1700,
        actionable: true,
        childNodeId: "vendor_a",
        note: "Contract €13.90 · variance €0.90/kg",
      },
    ],
    whenSeries: [
      { label: "D-90", index: 50 },
      { label: "D-60", index: 54 },
      { label: "D-30", index: 62 },
      { label: "D-14", index: 78 },
      { label: "D-7", index: 88 },
      { label: "NOW", index: 95 },
    ],
    causalSpine: [
      "VENDOR PRICE +19%",
      "TUNA COGS −€1.7k",
      "3 HIGH-VOLUME DISHES",
      "MENU MARGIN −1.4pp",
      "CONTRIBUTION −€1.7k",
    ],
    soWhat: {
      exposure30d: "−€710",
      exposure90d: "−€2.1k",
      annualized: "−€8.4k",
      affectedDishes: 3,
      affectedLocations: 6,
    },
    levers: [
      {
        id: "no_action",
        label: "No action",
        expectedEuro: -8400,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "negotiate",
        label: "Negotiate current vendor",
        expectedEuro: 5200,
        guestImpact: "none",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "shift40",
        label: "Shift 40% volume to Vendor C",
        expectedEuro: 4600,
        guestImpact: "low",
        confidence: "MEDIUM",
      },
      {
        id: "switch",
        label: "Switch vendor",
        expectedEuro: 6100,
        guestImpact: "low",
        confidence: "LOW",
      },
      {
        id: "recipe",
        label: "Rework portion / recipe",
        expectedEuro: 2800,
        guestImpact: "medium",
        confidence: "MEDIUM",
      },
      {
        id: "reprice",
        label: "Reprice relevant dishes",
        expectedEuro: 3200,
        guestImpact: "high",
        confidence: "LOW",
      },
    ],
    noActionBaseline: "If unchanged: −€8.4k annualized · 6 locations · 3 dishes",
    relatedDecisions: [
      {
        id: DECISION_IDS.tuna,
        displayId: displayDecisionId(DECISION_IDS.tuna),
        title: "Negotiate tuna before shifting volume",
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Contract rate",
        value: "€13.90/kg",
        source: "Contract",
        freshness: "Active",
      },
      {
        id: "e2",
        label: "Invoice unit",
        value: "€14.80/kg",
        source: "AP",
        freshness: "2d",
      },
      {
        id: "e3",
        label: "Peer median",
        value: "€13.92/kg",
        source: "Memory",
        freshness: "90D",
      },
    ],
    confidence: "HIGH",
    dataHealth: "ok",
    children: ["vendor_a"],
  },
  {
    id: "vendor_a",
    kind: "vendor",
    parentId: "tuna",
    title: "Vendor A",
    primaryFormatted: "€14.80/kg",
    comparisonFormatted: "vs contract €13.90 · peer €13.92",
    materiality: "HIGH",
    actionState: "ROOT DRIVER · evidence ready",
    bridge: [],
    where: [],
    what: [],
    whenSeries: [
      { label: "Contract", index: 50 },
      { label: "D-60", index: 55 },
      { label: "D-30", index: 68 },
      { label: "Invoice", index: 95 },
    ],
    causalSpine: [
      "Invoice above contract",
      "Market list confirms move",
      "Not volume-driven (+2% volume)",
    ],
    soWhat: {
      exposure30d: "−€710",
      exposure90d: "−€2.1k",
      annualized: "−€8.4k",
      affectedLocations: 6,
    },
    levers: [
      {
        id: "no_action",
        label: "No action",
        expectedEuro: -8400,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "negotiate",
        label: "Negotiate to €14.10",
        expectedEuro: 5200,
        guestImpact: "none",
        confidence: "MEDIUM",
        recommended: true,
      },
      {
        id: "shift",
        label: "Shift 40% to Vendor C",
        expectedEuro: 4600,
        guestImpact: "low",
        confidence: "MEDIUM",
      },
    ],
    noActionBaseline: "Vendor-specific excess ~12pp vs peers",
    relatedDecisions: [
      {
        id: DECISION_IDS.tuna,
        displayId: displayDecisionId(DECISION_IDS.tuna),
        title: "Negotiate tuna contract",
      },
    ],
    evidence: [
      {
        id: "e1",
        label: "Invoice #4412",
        value: "€14.80/kg",
        source: "AP",
        freshness: "OBSERVED",
      },
      {
        id: "e2",
        label: "Contract",
        value: "€13.90/kg",
        source: "Procurement",
        freshness: "OBSERVED",
      },
      {
        id: "e3",
        label: "Market list",
        value: "+11% category",
        source: "Market · DEMO",
        freshness: "ESTIMATED",
      },
    ],
    confidence: "HIGH",
    dataHealth: "ok",
    children: [],
  },
  {
    id: "channels",
    kind: "driver",
    parentId: "contribution",
    title: "Channels",
    primaryFormatted: "−€2.5k",
    comparisonFormatted: "Delivery fees + mix",
    materiality: "MEDIUM",
    actionState: "Actionable · peak delivery",
    bridge: [],
    where: [
      { id: "berlin", label: "Berlin", amountEuro: -1800, sharePct: 72 },
      { id: "other", label: "Other", amountEuro: -700, sharePct: 28 },
    ],
    what: [
      { id: "fees", label: "Platform fees", amountEuro: -1400 },
      { id: "refunds", label: "Delivery refunds", amountEuro: -700 },
      { id: "mix", label: "Delivery share +8.1pp", amountEuro: -400 },
    ],
    whenSeries: [
      { label: "W-4", index: 40 },
      { label: "W-2", index: 55 },
      { label: "Fri", index: 85 },
      { label: "NOW", index: 78 },
    ],
    causalSpine: [
      "Delivery share +8.1pp",
      "Kitchen pressure",
      "Peak Decision D-1911",
    ],
    soWhat: {
      exposure30d: "−€820",
      exposure90d: "−€2.5k",
      annualized: "−€10k",
    },
    levers: [
      {
        id: "do_nothing",
        label: "Do nothing",
        expectedEuro: -2500,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
      },
      {
        id: "throttle",
        label: "Throttle delivery at peak",
        expectedEuro: 620,
        guestImpact: "medium",
        confidence: "HIGH",
        recommended: true,
      },
    ],
    noActionBaseline: "Peak Fridays compound fee + refund drag",
    relatedDecisions: [
      {
        id: DECISION_IDS.peak,
        displayId: displayDecisionId(DECISION_IDS.peak),
        title: "Wait 12 · throttle delivery",
      },
    ],
    evidence: [],
    confidence: "HIGH",
    dataHealth: "degraded",
    dataHealthNote: "Deliverect stale 4m · fee estimate provisional",
    children: [],
  },
  {
    id: "menu_mix",
    kind: "driver",
    parentId: "contribution",
    title: "Menu mix",
    primaryFormatted: "−€1.8k",
    comparisonFormatted: "Attach / feature mix",
    materiality: "MEDIUM",
    actionState: "Actionable · category rebalance",
    bridge: [],
    where: [{ id: "berlin", label: "Berlin", amountEuro: -1200, sharePct: 67 }],
    what: [
      { id: "bev", label: "Beverage attach soft", amountEuro: -900 },
      { id: "feat", label: "Feature mix", amountEuro: -900 },
    ],
    whenSeries: [
      { label: "W-4", index: 55 },
      { label: "NOW", index: 45 },
    ],
    causalSpine: ["Beverage cost shock", "Category rebalance D-7501"],
    soWhat: {
      exposure30d: "−€600",
      exposure90d: "−€1.8k",
      annualized: "−€7.2k",
    },
    levers: [
      {
        id: "do_nothing",
        label: "Do nothing",
        expectedEuro: -1800,
        guestImpact: "none",
        confidence: "MEDIUM",
        isNoAction: true,
      },
      {
        id: "rebalance",
        label: "Beverage category rebalance",
        expectedEuro: 168,
        guestImpact: "low",
        confidence: "MEDIUM",
        recommended: true,
      },
    ],
    noActionBaseline: "Weekly beverage bleed compounds if absorbed",
    relatedDecisions: [
      {
        id: DECISION_IDS.marginCoke,
        displayId: displayDecisionId(DECISION_IDS.marginCoke),
        title: "Category rebalance",
      },
    ],
    evidence: [],
    confidence: "MEDIUM",
    dataHealth: "ok",
    children: [],
  },
  {
    id: "labor",
    kind: "metric",
    parentId: null,
    title: "Labor",
    primaryFormatted: "30.4%",
    comparisonFormatted: "+0.8pp adverse",
    materiality: "LOW",
    actionState: "NO ACTION · productivity normal",
    explainedPct: 100,
    bridge: [
      {
        id: "prod",
        label: "Productivity",
        amountEuro: 0,
        note: "Within ±5% · NO ACTION",
        actionable: false,
      },
    ],
    where: [],
    what: [],
    whenSeries: [
      { label: "W-4", index: 50 },
      { label: "NOW", index: 52 },
    ],
    causalSpine: ["Labor % up", "Sales/labor hour normal", "No cut"],
    soWhat: {
      exposure30d: "€0 actionable",
      exposure90d: "€0 actionable",
      annualized: "Do not cut labor from this signal",
    },
    levers: [
      {
        id: "no_action",
        label: "No labor action",
        expectedEuro: 0,
        guestImpact: "none",
        confidence: "HIGH",
        isNoAction: true,
        recommended: true,
      },
    ],
    noActionBaseline: "Productivity remains within expected range",
    relatedDecisions: [],
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
    dataHealth: "ok",
    children: [],
  },
];

const BY_ID = new Map(NODES.map((n) => [n.id, n]));

export function getIntelligenceNode(id: string): IntelligenceNode | null {
  return BY_ID.get(id) ?? null;
}

export function listIntelligenceNodes(): IntelligenceNode[] {
  return NODES;
}

export function rootNodeIdForMetric(metricId: string): string {
  const k = metricId.toLowerCase();
  if (k.includes("labor")) return "labor";
  if (k.includes("cogs") || k.includes("food")) return "cogs";
  if (k.includes("channel") || k.includes("delivery")) return "channels";
  return "contribution";
}

export function breadcrumbForNode(id: string): IntelligenceNode[] {
  const chain: IntelligenceNode[] = [];
  let cur = BY_ID.get(id) ?? null;
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? BY_ID.get(cur.parentId) ?? null : null;
  }
  return chain;
}

export function contributionNodeFromBridge(): IntelligenceNode {
  const base = BY_ID.get("contribution")!;
  const bridge = getContributionBridge();
  const slices = bridge.segments
    .filter((s) => s.kind === "positive" || s.kind === "negative")
    .map((s) => {
      const label = s.label;
      let childNodeId: string | undefined;
      if (/cogs/i.test(label)) childNodeId = "cogs";
      else if (/channel/i.test(label)) childNodeId = "channels";
      else if (/menu|mix/i.test(label)) childNodeId = "menu_mix";
      return {
        id: s.id,
        label: shortLabel(label),
        amountEuro: s.amount,
        actionable: s.kind === "negative" && !/labor/i.test(label),
        childNodeId,
        note: /labor/i.test(label)
          ? "Productivity normal · NO ACTION"
          : undefined,
      };
    });
  return {
    ...base,
    primaryFormatted:
      bridge.segments.find((s) => s.id === "actual")?.formatted ??
      base.primaryFormatted,
    comparisonFormatted: money(bridge.varianceAmount),
    bridge: slices.length ? slices : base.bridge,
  };
}

function shortLabel(label: string): string {
  return (
    label
      .replace(/contribution|vs plan|volume/gi, "")
      .replace(/channel fees/i, "Channels")
      .replace(/menu mix/i, "Menu mix")
      .replace(/sales/i, "Sales")
      .trim() || label
  );
}

export function assertStructuredDepth(): string[] {
  const errors: string[] = [];
  for (const n of NODES) {
    if (n.parentId == null) continue;
    const hasViz =
      n.bridge.length > 0 ||
      n.where.length > 0 ||
      n.what.length > 0 ||
      n.whenSeries.length > 0 ||
      n.causalSpine.length > 0;
    const hasAction = n.levers.length > 0 || n.relatedDecisions.length > 0;
    if (!hasViz) errors.push(`${n.id}: missing visualization fields`);
    if (!hasAction) errors.push(`${n.id}: missing action path`);
  }
  return errors;
}

export { money as formatIntelMoney };
