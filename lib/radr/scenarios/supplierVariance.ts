/**
 * Gold-standard BUY slice: supplier invoice above contract → credit request → verified recovery.
 * Recoverable = €118 (invoice 2840 − contract 2722). Same math as detectSupplierPriceVariance.
 */

import type { Action, Finding, Verification } from "@/lib/radr/domain";

export const SUPPLIER_VARIANCE_ID = "fnd_buy_loc_ber";
export const SUPPLIER_ACTION_ID = "act_supplier_credit_loc_ber";
export const SUPPLIER_VERIFICATION_ID = "ver_supplier_credit_118";

export const SUPPLIER_SCENARIO_CLOCK = {
  businessDate: "2026-08-19",
  timezone: "Europe/Berlin",
  label: "Berlin · 19 Aug 2026",
} as const;

export type SupplierScenarioPhase =
  | "DETECTED"
  | "APPROVAL_REQUIRED"
  | "APPROVED"
  | "EXECUTING"
  | "VERIFIED";

export type SupplierVarianceScenario = {
  id: typeof SUPPLIER_VARIANCE_ID;
  organizationId: string;
  locationId: string;
  locationName: string;
  environment: "DEMO";
  invoice: {
    id: string;
    number: string;
    supplier: string;
    invoiceTotal: number;
    contractedTotal: number;
    variance: number;
    currency: string;
    lines: { label: string; contract: number; invoiced: number; variance: number }[];
  };
  phase: SupplierScenarioPhase;
  finding: Finding;
  action: Action | null;
  verification: Verification | null;
};

const LINES = [
  { label: "Tomatoes", contract: 312, invoiced: 358, variance: 46 },
  { label: "Olive oil", contract: 190, invoiced: 228, variance: 38 },
  { label: "Fresh herbs", contract: 96, invoiced: 130, variance: 34 },
] as const;

const NOW = "2026-08-19T16:10:00+02:00";
const ORG = "org_northstar";
const LOC = "loc_ber";

function buildFinding(phase: SupplierScenarioPhase): Finding {
  const verified = phase === "VERIFIED";
  const actioned =
    phase === "APPROVED" || phase === "EXECUTING" || phase === "VERIFIED";

  return {
    id: SUPPLIER_VARIANCE_ID,
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    territory: "BUY",
    category: "supplier_price_variance",
    subtype: "Invoice variance",
    title: "Supplier invoice above contract",
    summary:
      "Invoice #10418 exceeds contracted pricing by €118 across three line items.",
    explanation:
      "Three line items differ from contracted pricing. Variance is still actionable while the invoice is open.",
    status: verified ? "VERIFIED" : actioned ? "ACTIONED" : "OPEN",
    urgency: "TODAY",
    priorityScore: 82,
    confidenceScore: 94,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "Deterministic invoice vs contract comparison on line items. Supplier invoices synced 14 min ago.",
    timeframe: {
      start: NOW,
      end: NOW,
      label: "This week",
    },
    financialImpact: {
      recoverableValue: 118,
      verifiedValue: verified ? 118 : undefined,
      primaryValue: 118,
      primaryLabel: verified ? "Verified recovery" : "Recoverable",
      currency: "EUR",
    },
    drivers: LINES.map((l) => ({
      label: l.label,
      value: `+€${l.variance}`,
    })),
    recommendation: {
      title: "Request supplier credit",
      description:
        "Send credit request for the three mismatched lines against contract rate card effective 01 Aug 2026.",
      expectedNetBenefit: 118,
      expectedBenefit: 118,
    },
    evidence: [
      {
        id: "ev_inv",
        label: "Invoice total",
        value: "€2,840",
        sourceId: "supplier_invoices",
      },
      {
        id: "ev_contract",
        label: "Expected contracted total",
        value: "€2,722",
        sourceId: "supplier_invoices",
      },
      {
        id: "ev_var",
        label: "Variance",
        value: "+€118",
        sourceId: "supplier_invoices",
      },
      {
        id: "ev_inv_no",
        label: "Invoice",
        value: "#10418 · FreshCo",
      },
      {
        id: "ev_contract_eff",
        label: "Contract effective",
        value: "01 Aug 2026",
      },
    ],
    sourceIds: ["supplier_invoices"],
    dedupeKey: `${LOC}:BUY:supplier_price_variance:2026-08-19`,
    presentation: {
      kindLabel: "Invoice variance",
      headline: "Supplier invoice above contract.",
      recommendShort: "Request €118 credit",
      ctaLabel: actioned ? "View action" : "Request credit",
      financialNote:
        "Deterministic invoice/contract variance. Becomes verified value only after credit evidence.",
      actionCreated: actioned,
      actionedNote: actioned
        ? "Credit request approved. Awaiting supplier confirmation."
        : undefined,
      primaryAction: {
        kind: "review",
        label: actioned ? "Open finding" : "Request credit",
        href: `/app/findings/${SUPPLIER_VARIANCE_ID}`,
      },
      secondaryHref: "/app/recover",
      secondaryLabel: "Recover",
      verificationStatus: verified ? "VERIFIED" : "IDENTIFIED",
      verificationMethod:
        "Verified when supplier credit memo is confirmed against invoice #10418.",
      dataSources: [
        {
          key: "supplier_invoices",
          label: "Supplier invoices",
          lastSyncLabel: "14m ago",
          ageMinutes: 14,
        },
      ],
    },
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function buildAction(phase: SupplierScenarioPhase): Action | null {
  if (phase === "DETECTED") return null;
  const approved =
    phase === "APPROVED" || phase === "EXECUTING" || phase === "VERIFIED";
  const completed = phase === "VERIFIED" || phase === "EXECUTING";
  return {
    id: SUPPLIER_ACTION_ID,
    organizationId: ORG,
    locationId: LOC,
    findingId: SUPPLIER_VARIANCE_ID,
    title: "Request supplier credit · FreshCo #10418",
    description:
      "Prepared credit request for three lines above contracted rate. No live supplier connector.",
    actionType: "supplier_credit_request",
    status: completed
      ? "COMPLETED"
      : approved
        ? "IN_PROGRESS"
        : "PROPOSED",
    expectedBenefit: 118,
    expectedNetBenefit: 118,
    currency: "EUR",
    preparedSummary:
      "Invoice #10418 · FreshCo · variance €118 · contract effective 01 Aug 2026 · Finance approval required.",
    requiredApproverRole: "Finance",
    executionCapability: "DRAFT_ONLY",
    executionMode: "MANUAL",
    maxDelegationLevel: "EXECUTE_WITH_APPROVAL",
    targetSystem: "supplier_email",
    targetEntity: "inv_10418",
    evidenceRefs: ["ev_inv", "ev_contract", "ev_var"],
    reversible: true,
    shadowMode: false,
    structuredPayload: {
      invoiceNumber: "10418",
      supplier: "FreshCo",
      varianceMajor: 118,
      lines: LINES.map((l) => ({ ...l })),
    },
    createdBy: "demo_operator",
    assignedToUserId: approved ? "demo_operator" : undefined,
    createdAt: NOW,
    updatedAt: NOW,
    startedAt: approved ? "2026-08-19T16:20:00+02:00" : undefined,
    completedAt: phase === "VERIFIED" ? "2026-08-19T17:05:00+02:00" : undefined,
  };
}

function buildVerification(phase: SupplierScenarioPhase): Verification | null {
  if (phase !== "VERIFIED") return null;
  return {
    id: SUPPLIER_VERIFICATION_ID,
    organizationId: ORG,
    locationId: LOC,
    findingId: SUPPLIER_VARIANCE_ID,
    actionId: SUPPLIER_ACTION_ID,
    expectedValue: 118,
    observedValue: 118,
    verifiedValue: 118,
    currency: "EUR",
    attribution: "RADR_RECOMMENDED",
    strength: "DIRECT",
    method: "Supplier credit memo CM-4419 matched to invoice #10418",
    notes: "Credit memo matched to invoice #10418.",
    evidenceIds: ["ev_inv", "ev_var"],
    createdAt: "2026-08-19T17:05:00+02:00",
    updatedAt: "2026-08-19T17:05:00+02:00",
  };
}

export function buildSupplierVarianceScenario(
  phase: SupplierScenarioPhase = "DETECTED",
): SupplierVarianceScenario {
  return {
    id: SUPPLIER_VARIANCE_ID,
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    environment: "DEMO",
    invoice: {
      id: "inv_10418",
      number: "10418",
      supplier: "FreshCo",
      invoiceTotal: 2840,
      contractedTotal: 2722,
      variance: 118,
      currency: "EUR",
      lines: LINES.map((l) => ({ ...l })),
    },
    phase,
    finding: buildFinding(phase),
    action: buildAction(phase),
    verification: buildVerification(phase),
  };
}
