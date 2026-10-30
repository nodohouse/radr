/**
 * Business Pulse reading — material change, not a KPI strip.
 * Uses contribution bridge + pulse peers + Decision links.
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type { ContributionBridge, BridgeSegment } from "@/lib/radr/finance/contributionBridge";
import type { BusinessPulse, PulseMetric } from "@/lib/radr/product/businessPulse";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";

export type PulseDriverRow = {
  id: string;
  label: string;
  amount: number;
  formatted: string;
  sharePct: number;
  kind: "positive" | "negative";
  method: "deterministic" | "modeled" | null;
  decisionId: string | null;
  displayId: string | null;
  /** needs judgment now vs linked evidence only */
  open: boolean;
};

export type PulseQuietPeer = {
  id: string;
  label: string;
  value: string;
  delta: string | null;
  state: "quiet" | "proof";
};

export type PulseLinkedDecision = {
  id: string;
  displayId: string;
  title: string;
  economic: string;
};

export type BusinessPulseReading = {
  periodLabel: string;
  leadLabel: string;
  leadValue: string;
  leadTone: "neg" | "pos" | "ok";
  diagnosis: string;
  offsetLine: string | null;
  drivers: PulseDriverRow[];
  linkedDecisions: PulseLinkedDecision[];
  quiet: PulseQuietPeer[];
  explainedPct: number;
};

function moneyDelta(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${formatDecisionMoney(Math.abs(n))}`;
}

function pickMetric(
  pulse: BusinessPulse,
  id: string,
): PulseMetric | undefined {
  return (
    pulse.primary.find((m) => m.id === id) ??
    pulse.support.find((m) => m.id === id)
  );
}

/**
 * Compose the Control Center Business Pulse as a reading:
 * one material lead · ranked drivers · linked Decisions · quiet peers.
 */
export function composeBusinessPulseReading(input: {
  pulse: BusinessPulse;
  bridge: ContributionBridge;
  needsYou: NeedsYouRow[];
}): BusinessPulseReading {
  const { pulse, bridge, needsYou } = input;
  const drivers = bridge.segments.filter(
    (s): s is BridgeSegment & { kind: "positive" | "negative" } =>
      s.kind === "positive" || s.kind === "negative",
  );

  const neg = drivers.filter((d) => d.kind === "negative");
  const pos = drivers.filter((d) => d.kind === "positive");
  const absNeg = neg.reduce((s, d) => s + Math.abs(d.amount), 0);
  const absPos = pos.reduce((s, d) => s + Math.abs(d.amount), 0);

  const openById = new Map(needsYou.map((r) => [r.id, r]));

  const driverRows: PulseDriverRow[] = [
    ...neg
      .slice()
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    ...pos
      .slice()
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
  ].map((d) => {
      const decisionId = d.relatedDecisionIds[0] ?? null;
      const open = decisionId ? openById.has(decisionId) : false;
      const shareBase = d.kind === "negative" ? absNeg : absPos;
      return {
        id: d.id,
        label: d.label,
        amount: d.amount,
        formatted: moneyDelta(d.amount),
        sharePct:
          shareBase > 0
            ? Math.round((Math.abs(d.amount) / shareBase) * 100)
            : 0,
        kind: d.kind,
        method: d.method,
        decisionId,
        displayId: decisionId ? displayDecisionId(decisionId) : null,
        open,
      };
    });

  const linkedFromDrivers = driverRows
    .filter((d) => d.decisionId)
    .map((d) => {
      const open = d.decisionId ? openById.get(d.decisionId) : undefined;
      return {
        id: d.decisionId!,
        displayId: d.displayId ?? displayDecisionId(d.decisionId!),
        title: open?.title ?? open?.recommendation ?? d.label,
        economic: open?.economicFormatted ?? d.formatted,
        open: Boolean(open),
      };
    });

  // Prefer open needs-you that share a driver link; keep unique.
  const seen = new Set<string>();
  const linkedDecisions: PulseLinkedDecision[] = [];
  for (const row of linkedFromDrivers) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    linkedDecisions.push({
      id: row.id,
      displayId: row.displayId,
      title: row.title,
      economic: row.economic,
    });
  }
  for (const n of needsYou) {
    if (seen.has(n.id)) continue;
    // Surface needs-you only when economically tied to contribution pressure
    // (BUY / menu / labor / channels) — not every live Decision.
    const buyLike =
      /supplier|menu|mix|cogs|labor|channel|category|rebalance|credit/i.test(
        `${n.classLabel} ${n.title} ${n.recommendation}`,
      );
    if (!buyLike) continue;
    seen.add(n.id);
    linkedDecisions.push({
      id: n.id,
      displayId: n.displayId,
      title: n.title,
      economic: n.economicFormatted,
    });
  }

  const rev = pickMetric(pulse, "revenue_mtd");
  const labor = pickMetric(pulse, "labor_pct_mtd");
  const covers = pickMetric(pulse, "covers_mtd");
  const spend = pickMetric(pulse, "avg_spend_mtd");
  const food = pickMetric(pulse, "food_cost_pct_mtd");
  const verified = pickMetric(pulse, "verified_value_mtd");

  const quiet: PulseQuietPeer[] = [];
  if (rev) {
    quiet.push({
      id: rev.id,
      label: "Revenue",
      value: rev.formatted,
      delta: rev.comparisonFormatted,
      state: "quiet",
    });
  }
  if (labor) {
    quiet.push({
      id: labor.id,
      label: "Labor",
      value: labor.formatted,
      delta: labor.comparisonFormatted,
      state: "quiet",
    });
  }
  if (covers) {
    quiet.push({
      id: covers.id,
      label: "Covers",
      value: covers.formatted,
      delta: covers.comparisonFormatted,
      state: "quiet",
    });
  }
  if (spend) {
    quiet.push({
      id: spend.id,
      label: "Avg spend",
      value: spend.formatted,
      delta: spend.comparisonFormatted,
      state: "quiet",
    });
  }
  if (food) {
    quiet.push({
      id: food.id,
      label: "Food cost",
      value: food.formatted,
      delta: food.comparisonFormatted,
      state: "quiet",
    });
  }
  if (verified) {
    quiet.push({
      id: verified.id,
      label: "Verified",
      value: verified.formatted,
      delta: verified.comparisonFormatted,
      state: "proof",
    });
  }

  // Cap quiet rail — proof last, drop tertiary peers if crowded.
  const quietCapped = [
    ...quiet.filter((q) => q.state !== "proof").slice(0, 3),
    ...quiet.filter((q) => q.state === "proof"),
  ];

  const topNeg = neg
    .slice()
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 2);
  const topShare =
    absNeg > 0
      ? Math.round(
          (topNeg.reduce((s, d) => s + Math.abs(d.amount), 0) / absNeg) * 100,
        )
      : 0;

  const variance = bridge.varianceAmount;
  const leadTone: BusinessPulseReading["leadTone"] =
    variance < -50 ? "neg" : variance > 50 ? "pos" : "ok";

  const diagnosis =
    topNeg.length >= 2
      ? `${topNeg.map((d) => d.label).join(" + ")} explain ${topShare}% of the shortfall.`
      : topNeg.length === 1
        ? `${topNeg[0]!.label} is the primary drag.`
        : "Contribution is within plan band.";

  const offsetLine =
    absPos > 0 && variance < 0
      ? `Sales volume ${moneyDelta(absPos)} offsets — still net ${moneyDelta(variance)}.`
      : null;

  return {
    periodLabel: "MTD",
    leadLabel: "Contribution vs plan",
    leadValue: moneyDelta(variance),
    leadTone,
    diagnosis,
    offsetLine,
    drivers: driverRows,
    linkedDecisions: linkedDecisions.slice(0, 3),
    quiet: quietCapped,
    explainedPct: topShare,
  };
}
