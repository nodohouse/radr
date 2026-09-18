import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import {
  applyFreshnessToConfidence,
  calculateSupplierVariance,
} from "@/lib/radr/calc";
import { scoreFinding } from "../priority";

export function detectSupplierPriceVariance(
  ctx: OperatingContext,
): Finding | null {
  if (!ctx.supplier) return null;
  const calc = calculateSupplierVariance(ctx.supplier);
  if (calc.recoverableValue <= 0) return null;

  const freshness = ctx.dataFreshness.filter(
    (s) => s.key === "supplier_invoices",
  );
  const confidence = applyFreshnessToConfidence(
    {
      level: "HIGH",
      score: 94,
      explanation: "Deterministic invoice vs contract comparison on line items.",
    },
    freshness,
  );

  const now = `${ctx.businessDate}T18:00:00+02:00`;
  const urgency = "TODAY" as const;
  const primaryValue = calc.recoverableValue;

  return {
    id: `fnd_buy_${ctx.locationId}`,
    organizationId: ctx.organizationId,
    locationId: ctx.locationId,
    locationName: ctx.locationName,
    territory: "BUY",
    category: "supplier_price_variance",
    subtype: "Invoice variance",
    title: "Supplier invoice above contract",
    summary: `Invoice total exceeds contracted pricing by ${calc.variance} ${ctx.currency}.`,
    explanation:
      "Three line items differ from contracted pricing. Variance is still actionable while the invoice is open.",
    status: "OPEN",
    urgency,
    priorityScore: scoreFinding({
      urgency,
      primaryValue,
      confidenceBand: confidence.level,
      timeSensitive: false,
      actionable: true,
    }),
    confidenceScore: confidence.score,
    confidenceBand: confidence.level,
    confidenceExplanation: confidence.explanation,
    timeframe: {
      start: now,
      end: now,
      label: "This week",
    },
    financialImpact: {
      recoverableValue: calc.recoverableValue,
      primaryValue,
      primaryLabel: "Recoverable / review",
      currency: ctx.currency,
    },
    drivers: calc.lines.map((l) => ({
      label: l.label,
      value: `+${l.variance}`,
    })),
    recommendation: {
      title: "Review invoice against contract",
      description: "Open reconciliation for the mismatched lines.",
      expectedNetBenefit: calc.recoverableValue,
      expectedBenefit: calc.recoverableValue,
    },
    evidence: [
      {
        id: "ev_inv",
        label: "Invoice total",
        value: String(calc.invoiceTotal),
      },
      {
        id: "ev_contract",
        label: "Expected contracted total",
        value: String(calc.contractedTotal),
      },
      {
        id: "ev_var",
        label: "Variance",
        value: `+${calc.variance}`,
      },
    ],
    sourceIds: freshness.map((s) => s.key),
    dedupeKey: `${ctx.locationId}:BUY:supplier_price_variance:${ctx.businessDate}`,
    presentation: {
      kindLabel: "Invoice variance",
      headline: "Supplier invoice above contract.",
      recommendShort: "Review invoice lines",
      ctaLabel: "Open reconciliation",
      financialNote:
        "Deterministic invoice/contract variance. Becomes verified value only after recovery evidence.",
      primaryAction: {
        kind: "review",
        label: "Open reconciliation",
        href: "/app/checks",
      },
      secondaryHref: "/app/buy",
      secondaryLabel: "View calculation",
      verificationStatus: "IDENTIFIED",
      verificationMethod:
        "Verified when supplier credit or corrected invoice is confirmed in accounting.",
      dataSources: freshness,
    },
    createdAt: now,
    updatedAt: now,
  };
}
