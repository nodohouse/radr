/**
 * Business Pulse interpretation — what changed / why / does anything need doing?
 */

import type { PulseMetric } from "@/lib/radr/product/businessPulse";

export type PulseInterpretation = {
  metricId: string;
  label: string;
  formatted: string;
  comparison: string | null;
  changed: string;
  why: string;
  radrState: string;
  needsAction: boolean;
};

export function interpretPulseMetric(m: PulseMetric): PulseInterpretation {
  const delta = m.comparisonFormatted;
  const adverse =
    m.comparisonValue != null &&
    ((m.higherIsBetter && m.comparisonValue < 0) ||
      (!m.higherIsBetter && m.comparisonValue > 0));

  if (m.id === "labor_pct" || m.label.toLowerCase().includes("labor")) {
    return {
      metricId: m.id,
      label: m.label,
      formatted: m.formatted,
      comparison: delta,
      changed: delta ? `${delta} vs target` : "Within band",
      why: "Productivity remains normal.",
      radrState: "NO ACTION",
      needsAction: false,
    };
  }

  if (m.id.includes("contribution") || m.label.toLowerCase().includes("contribution")) {
    return {
      metricId: m.id,
      label: m.label,
      formatted: m.formatted,
      comparison: delta,
      changed: delta ? `${delta} vs plan` : "On plan",
      why: adverse
        ? "82% explained by COGS + labor."
        : "Within plan band.",
      radrState: adverse ? "1 Decision" : "NO ACTION",
      needsAction: adverse,
    };
  }

  if (m.id.includes("revenue") || m.label.toLowerCase().includes("revenue")) {
    return {
      metricId: m.id,
      label: m.label,
      formatted: m.formatted,
      comparison: delta,
      changed: delta ? `${delta} vs forecast` : "On forecast",
      why: "Covers and spend both ahead on comparable Fridays.",
      radrState: "NO REVENUE ACTION",
      needsAction: false,
    };
  }

  if (m.id.includes("verified") || m.label.toLowerCase().includes("verified")) {
    return {
      metricId: m.id,
      label: m.label,
      formatted: m.formatted,
      comparison: delta,
      changed: delta ?? "MTD sealed",
      why: "Supplier credit + peak Wait verified this period.",
      radrState: "PROOF AVAILABLE",
      needsAction: false,
    };
  }

  if (m.id.includes("food") || m.label.toLowerCase().includes("food")) {
    return {
      metricId: m.id,
      label: m.label,
      formatted: m.formatted,
      comparison: delta,
      changed: delta ? `${delta} vs plan` : "On plan",
      why: "Beverage COGS and delivery mix associated with the lift.",
      radrState: adverse ? "Linked to Menu Decision" : "NO FOOD ACTION",
      needsAction: adverse,
    };
  }

  return {
    metricId: m.id,
    label: m.label,
    formatted: m.formatted,
    comparison: delta,
    changed: delta ?? "Stable",
    why: "Within operating tolerance.",
    radrState: "NO ACTION",
    needsAction: false,
  };
}

/** Canonical “Since your last check” — max 3 editorial lines. */
export function composeSinceLastCheckLines(input: {
  contributionGapFormatted?: string;
  verifiedFormatted?: string;
  needJudgment: number;
}): { id: string; text: string; href?: string }[] {
  const lines: { id: string; text: string; href?: string }[] = [
    {
      id: "contrib",
      text: "Contribution deteriorated −€1.2k.",
      href: "/app?focus=pulse&stay=1",
    },
    {
      id: "berlin",
      text: "Berlin enters Watch at 20:10.",
      href: "/app?focus=live&stay=1",
    },
    {
      id: "verified",
      text: `${input.verifiedFormatted ?? "€273"} became Verified.`,
      href: "/app/value",
    },
  ];
  if (input.needJudgment <= 0) {
    return [
      lines[2]!,
      {
        id: "quiet",
        text: "No new Decisions need judgment.",
        href: "/app/decisions",
      },
    ].slice(0, 3);
  }
  return lines.slice(0, 3);
}
