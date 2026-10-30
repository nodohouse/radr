/**
 * D-4102 Decision Trace — sealed supplier variance recovery.
 * Economics from CANON_SUPPLIER / publicMoney. Demo · illustrative.
 */

import { CANON_SUPPLIER, verifiedEuro } from "@/lib/radr/decision/demo/canonical";
import { euro, euroRate, euroCents } from "@/lib/marketing/publicDecisionEconomics";
import type { DecisionTraceRecord } from "./types";

const VARIANCE = CANON_SUPPLIER.exposureEuro; // 273
const VERIFIED = verifiedEuro(CANON_SUPPLIER);
const CONTRACT_RATE = 6.8;
const INVOICE_RATE = 7.45;
const QTY = 420;
const DIFF = INVOICE_RATE - CONTRACT_RATE; // 0.65

export const TRACE_D4102: DecisionTraceRecord = {
  displayId: CANON_SUPPLIER.displayId,
  location: CANON_SUPPLIER.property,
  classLabel: "Supplier / AP",
  state: "VERIFIED",
  stateLabel: "SEALED · VERIFIED",
  economicImportance: `${euro(VARIANCE)} variance · material for review`,
  headlineEuro: VERIFIED,
  headlineLabel: "Verified recovery",
  owner: "Finance",
  deadline: CANON_SUPPLIER.deadline,
  confidenceLabel: "HIGH",
  evidenceQuality: "HIGH",
  whySurfaced: `Invoice unit price is ${euroRate(DIFF)} above the active contract rate across ${QTY} L, creating a ${euro(VARIANCE)} variance not explained by the available contract evidence.`,
  rationale: [
    `Active contract rate is ${euroRate(CONTRACT_RATE)}.`,
    `Invoice rate is ${euroRate(INVOICE_RATE)}.`,
    `Quantity is ${QTY} L.`,
    "No permitted surcharge explains the difference.",
    `${euro(VARIANCE)} exceeds the configured review threshold.`,
    "Supplier dispute has the highest expected recovery among available actions.",
  ],
  whatCouldChange: [
    `A valid ${euroRate(DIFF)} seasonal surcharge in the contract.`,
    "A superseding contract covering the invoice period.",
    "A supplier credit already issued for the same lines.",
    "A quantity correction that removes the variance.",
    "New supplier documentation that explains the rate.",
  ],
  selectedBecause: [
    "Contract term is active.",
    "Invoice exceeds contracted unit rate.",
    "Difference exceeds Finance materiality threshold.",
    "No allowed surcharge found.",
    "Supplier dispute workflow is available.",
    "Expected recovery exceeds intervention cost.",
  ],
  materiality: {
    ruleLabel: "Supplier variance threshold",
    thresholdEuro: 100,
    observedEuro: VARIANCE,
    triggered: true,
  },
  evidence: [
    {
      id: "CTR-1188",
      kind: "CONTRACT",
      title: "CTR-1188",
      fields: [
        { label: "Supplier", value: "Example Foods", grade: "OBSERVED" },
        { label: "Rate", value: `${euroRate(CONTRACT_RATE)}`, grade: "OBSERVED" },
        {
          label: "Effective",
          value: "01 Sep 2026 – 31 Dec 2026",
          grade: "OBSERVED",
        },
      ],
      provenance: {
        sourceSystem: "Uploaded contract",
        method: "Files · CSV / Documents",
        freshness: "12 days",
        location: "Soho · New York",
        entityId: "CTR-1188",
        grade: "OBSERVED",
      },
    },
    {
      id: "INV-88421",
      kind: "INVOICE",
      title: "INV-88421",
      fields: [
        { label: "Quantity", value: `${QTY} L`, grade: "OBSERVED" },
        { label: "Unit price", value: `${euroRate(INVOICE_RATE)}`, grade: "OBSERVED" },
        {
          label: "Line total",
          value: euro(INVOICE_RATE * QTY),
          grade: "DERIVED",
        },
      ],
      provenance: {
        sourceSystem: "AP export",
        method: "Files · CSV / Documents",
        importedAt: "18 Sep 2026 06:02",
        freshness: "Imported 18 Sep",
        location: "Soho · New York",
        entityId: "INV-88421",
        grade: "OBSERVED",
      },
    },
    {
      id: "CM-1042",
      kind: "CREDIT MEMO",
      title: "CM-1042",
      fields: [
        { label: "Amount", value: euro(VERIFIED), grade: "OBSERVED" },
        { label: "Matched to", value: "INV-88421", grade: "OBSERVED" },
      ],
      provenance: {
        sourceSystem: "Accounting export",
        method: "Files · CSV / Documents",
        importedAt: "21 Sep 2026 08:14",
        freshness: "Matched 21 Sep",
        location: "Soho · New York",
        entityId: "CM-1042",
        grade: "OBSERVED",
      },
    },
  ],
  calculation: {
    title: "Unit-price variance",
    steps: [
      {
        label: "Invoice rate",
        value: `${euroRate(INVOICE_RATE)}`,
        grade: "OBSERVED",
      },
      {
        label: "Contract rate",
        value: `${euroRate(CONTRACT_RATE)}`,
        grade: "OBSERVED",
      },
      {
        label: "Difference",
        value: `${euroRate(DIFF)}`,
        grade: "DERIVED",
      },
      {
        label: "Quantity",
        value: `${QTY} L`,
        grade: "OBSERVED",
      },
    ],
    result: {
      label: "Calculated variance",
      value: euro(VARIANCE),
      amountEuro: VARIANCE,
      grade: "DERIVED",
    },
    excluded: [
      { label: "VAT difference", value: "None" },
      { label: "Freight adjustment", value: "None" },
      { label: "Quantity mismatch", value: "None" },
      { label: "Promotional pricing", value: "No matching term found" },
    ],
    formulaHuman: `${QTY} L × (${euroCents(INVOICE_RATE)} − ${euroCents(CONTRACT_RATE)}) = ${euro(VARIANCE)}`,
  },
  baseline: {
    title: "No-action baseline",
    type: "contractual",
    source: "CTR-1188",
    outcome: "Invoice paid as submitted.",
    economicEuro: -VARIANCE,
    economicLabel: `−${euro(VARIANCE)} vs contracted terms`,
    confidence: "High",
  },
  futures: [
    {
      id: "do_nothing",
      title: "Pay as submitted",
      expectedLabel: `−${euro(VARIANCE)} vs terms`,
      expectedEuro: -VARIANCE,
      effort: "Low",
      confidence: "High",
      selected: false,
      note: "Drift compounds · contribution keeps compressing",
    },
    {
      id: "clarify",
      title: "Request clarification",
      expectedLabel: `${euro(180)}–${euro(VARIANCE)} expected recovery`,
      expectedRange: `${euro(180)}–${euro(VARIANCE)}`,
      effort: "2–5 days",
      confidence: "Medium",
      selected: false,
    },
    {
      id: "query",
      title: "Dispute variance",
      expectedLabel: `${euro(VARIANCE)} expected recovery`,
      expectedEuro: VARIANCE,
      effort: "1–3 days",
      confidence: "High",
      selected: true,
      note: "Highest expected recovery among available actions",
    },
  ],
  constraints: [
    { label: "Finance auto-dispute threshold", value: euro(500) },
    { label: "Decision value", value: euro(VARIANCE) },
    { label: "Therefore", value: "Human approval required" },
  ],
  policy: {
    allowed: ["Prepare dispute", "Attach evidence package"],
    requiresApproval: ["Send dispute to supplier"],
    notAllowed: ["Initiate payment adjustment"],
    approvalOwner: "Finance Manager",
  },
  operatorContext: {
    text: "Supplier agreed verbally that September pricing would remain unchanged.",
    addedBy: "Anna Müller",
    at: "18 Sep · 09:22",
    effect: "Increased confidence in dispute path.",
    confidenceBefore: "Medium",
    confidenceAfter: "High",
  },
  dataQuality: {
    requiredPresent: "4 / 4 required evidence objects present",
    items: [
      { label: "Contract", state: "Fresh" },
      { label: "Invoice", state: "Fresh" },
      { label: "Credit memo", state: "Available · matched" },
      { label: "Supplier statement", state: "Available" },
    ],
    overall: "HIGH",
    missing: [],
    unknowns: [],
  },
  confidence: {
    overall: "HIGH",
    dimensions: [
      { label: "Evidence completeness", level: "High" },
      { label: "Data freshness", level: "High" },
      { label: "Method certainty", level: "High" },
      { label: "Outcome uncertainty", level: "Low" },
      { label: "Policy fit", level: "High" },
    ],
    why: [
      "All required source evidence available.",
      "Calculation is deterministic contract vs invoice arithmetic.",
      "No major source conflicts.",
      "Comparable supplier disputes historically recovered credit.",
    ],
  },
  method: {
    classLabel: "Contract rule comparison",
    bullets: [
      "Deterministic calculation",
      "No predictive model used",
      "Generative model not used for economics",
      "LLM may summarize / draft dispute text — not invent amounts",
    ],
    predictiveModelUsed: false,
    generativeEconomicsUsed: false,
  },
  action: {
    name: "Supplier dispute",
    preparedAt: "18 Sep 09:31",
    approvedBy: "Anna Müller",
    approvedAt: "18 Sep 09:33",
    sentAt: "18 Sep 09:34",
    recipient: "Supplier AP",
    evidenceAttached: ["CTR-1188", "INV-88421"],
    status: "Credit received · matched",
    preview: [
      "Prepare dispute",
      "Attach contract + invoice",
      "Reference variance calculation",
      `Request ${euro(VARIANCE)} credit`,
    ],
  },
  outcome: {
    kind: "FULL_SUCCESS",
    expectedEuro: VARIANCE,
    expectedLabel: `${euro(VARIANCE)} credit`,
    observedEuro: VERIFIED,
    observedLabel: `${euro(VERIFIED)} credit issued`,
    differenceEuro: 0,
    differenceLabel: euro(0),
  },
  verification: {
    strength: "STRONG",
    proof: [
      { label: "Credit memo", value: `CM-1042 · ${euro(VERIFIED)}` },
      { label: "Matched to", value: "INV-88421" },
      { label: "Posted", value: "Accounting / AP export" },
      { label: "Date", value: "21 Sep 2026" },
    ],
    verifiedEuro: VERIFIED,
    verifiedLabel: `${euro(VERIFIED)} verified recovered`,
  },
  attribution: {
    withoutRadr: "Invoice scheduled to pay at submitted price.",
    radrAction: "Supplier dispute prepared and sent with evidence.",
    observed: `${euro(VERIFIED)} credit.`,
    competingExplanation: "None identified.",
    attributedEuro: VERIFIED,
    verifiedEuro: VERIFIED,
  },
  memory: {
    bullets: [
      "Supplier Example Foods variance pattern: third occurrence in 90 days.",
      "Action effectiveness: 3 / 3 disputes produced credit.",
      "Average resolution: 2.1 days.",
      "Playbook updated: dispute before menu reprice.",
    ],
    basedOnDecisionIds: ["D-3120", "D-3771", "D-4102"],
    playbookUpdated: true,
  },
  versions: [
    {
      version: 1,
      at: "18 Sep 06:12",
      summary: "Invoice vs contract variance detected.",
    },
    {
      version: 2,
      at: "18 Sep 09:02",
      summary: "Dispute recommendation formed · evidence package prepared.",
    },
    {
      version: 3,
      at: "21 Sep 08:20",
      summary: `Credit matched · ${euro(VERIFIED)} verified.`,
    },
  ],
  audit: [
    { at: "18 Sep 06:12", actor: "RADR", text: "Created Decision." },
    {
      at: "18 Sep 06:12",
      actor: "RADR",
      text: "Imported INV-88421 · matched CTR-1188.",
    },
    {
      at: "18 Sep 06:13",
      actor: "RADR",
      text: `Economic exposure calculated · ${euro(VARIANCE)}.`,
    },
    {
      at: "18 Sep 09:22",
      actor: "Anna Müller",
      text: "Operator context added.",
    },
    {
      at: "18 Sep 09:33",
      actor: "Anna Müller",
      text: "Approved dispute send.",
    },
    {
      at: "21 Sep 08:20",
      actor: "RADR",
      text: "Credit memo matched · Verified Value sealed.",
    },
  ],
  provenanceSequence: [
    { label: "CTR-1188", detail: "Contract · $6.80/L" },
    { label: "INV-88421", detail: "Invoice · 420 L × $7.45/L" },
    { label: euro(VARIANCE), detail: "Calculation · DERIVED" },
    { label: "D-4102", detail: "Decision · dispute recommended" },
    { label: "Dispute", detail: "Action · approved & sent" },
    { label: "CM-1042", detail: "Credit memo · $273" },
    {
      label: euro(VERIFIED),
      detail: "Verified recovery",
      verified: true,
    },
  ],
  reportingCurrency: "EUR",
  disclosure: "DEMO · ILLUSTRATIVE · not customer results",
};
