/**
 * D-4188 — recommendation miss (trust depth).
 * Not for homepage. Expected recovery did not materialize.
 * DEMO · ILLUSTRATIVE.
 */

import { euro, euroRate, euroCents } from "@/lib/marketing/publicDecisionEconomics";
import type { DecisionTraceRecord } from "./types";

const EXPECTED = 420;
const OBSERVED = 0;
const VERIFIED = 0;

export const TRACE_D4188: DecisionTraceRecord = {
  displayId: "D-4188",
  location: "Soho · New York",
  classLabel: "Supplier / AP",
  state: "CLOSED_NO_VALUE",
  stateLabel: "CLOSED · NO RECOVERY",
  economicImportance: `${euro(EXPECTED)} expected · ${euro(0)} verified`,
  headlineEuro: VERIFIED,
  headlineLabel: "Verified recovery",
  owner: "Finance",
  deadline: "Closed 24 Sep 2026",
  confidenceLabel: "MEDIUM",
  evidenceQuality: "MEDIUM",
  whySurfaced:
    "Invoice unit price appeared above the active contract rate. After dispute, supplier documentation proved a valid seasonal surcharge covering the invoice period.",
  rationale: [
    "Contract base rate alone did not include the seasonal surcharge schedule.",
    "At formation time, surcharge evidence was not in the package.",
    "Dispute was the highest-recovery path given available evidence.",
  ],
  whatCouldChange: [
    "Seasonal surcharge schedule already attached to the contract.",
    "Supplier credit already issued.",
    "Quantity correction removing the variance.",
  ],
  selectedBecause: [
    "Apparent rate variance exceeded materiality.",
    "No surcharge evidence present at Decision formation.",
    "Supplier dispute workflow available.",
  ],
  materiality: {
    ruleLabel: "Supplier variance threshold",
    thresholdEuro: 100,
    observedEuro: EXPECTED,
    triggered: true,
  },
  evidence: [
    {
      id: "CTR-1188",
      kind: "CONTRACT",
      title: "CTR-1188",
      fields: [
        { label: "Base rate", value: `${euroRate(6.8)}`, grade: "OBSERVED" },
        {
          label: "Seasonal schedule",
          value: "Not in initial package",
          grade: "OBSERVED",
        },
      ],
      provenance: {
        sourceSystem: "Uploaded contract",
        method: "Files · CSV / Documents",
        freshness: "At formation",
        location: "Soho · New York",
        entityId: "CTR-1188",
        grade: "OBSERVED",
      },
    },
    {
      id: "INV-90112",
      kind: "INVOICE",
      title: "INV-90112",
      fields: [
        { label: "Quantity", value: "400 L", grade: "OBSERVED" },
        { label: "Unit price", value: `${euroRate(7.85)}`, grade: "OBSERVED" },
      ],
      provenance: {
        sourceSystem: "AP export",
        method: "Files · CSV / Documents",
        importedAt: "20 Sep 2026 07:10",
        freshness: "Imported 20 Sep",
        location: "Soho · New York",
        entityId: "INV-90112",
        grade: "OBSERVED",
      },
    },
    {
      id: "SUP-SURCHARGE-SEP",
      kind: "SUPPLIER DOC",
      title: "Seasonal surcharge schedule",
      fields: [
        {
          label: "Surcharge",
          value: `${euroRate(1.05)} · Sep–Oct`,
          grade: "OBSERVED",
        },
        {
          label: "Received",
          value: "After dispute · 23 Sep",
          grade: "OBSERVED",
        },
      ],
      provenance: {
        sourceSystem: "Supplier email attachment",
        method: "Operator upload",
        importedAt: "23 Sep 2026 14:02",
        freshness: "Received 23 Sep",
        location: "Soho · New York",
        entityId: "SUP-SURCHARGE-SEP",
        grade: "OBSERVED",
      },
    },
  ],
  calculation: {
    title: "Apparent unit-price variance (at formation)",
    steps: [
      {
        label: "Invoice rate",
        value: `${euroRate(7.85)}`,
        grade: "OBSERVED",
      },
      {
        label: "Contract base rate",
        value: `${euroRate(6.8)}`,
        grade: "OBSERVED",
      },
      {
        label: "Apparent difference",
        value: `${euroRate(1.05)}`,
        grade: "DERIVED",
      },
      { label: "Quantity", value: "400 L", grade: "OBSERVED" },
    ],
    result: {
      label: "Calculated exposure at formation",
      value: euro(EXPECTED),
      amountEuro: EXPECTED,
      grade: "DERIVED",
    },
    excluded: [
      {
        label: "Seasonal surcharge",
        value: "Not present in evidence at formation",
      },
    ],
    formulaHuman: `400 L × (${euroCents(7.85)} − ${euroCents(6.8)}) = ${euro(EXPECTED)}`,
  },
  baseline: {
    title: "No-action baseline",
    type: "contractual",
    source: "CTR-1188 (base rate only)",
    outcome: "Invoice paid as submitted.",
    economicEuro: -EXPECTED,
    economicLabel: `−${euro(EXPECTED)} vs base contract (at formation)`,
    confidence: "Medium",
  },
  futures: [
    {
      id: "do_nothing",
      title: "Pay as submitted",
      expectedLabel: `−${euro(EXPECTED)} vs base terms`,
      expectedEuro: -EXPECTED,
      effort: "Low",
      confidence: "High",
      selected: false,
    },
    {
      id: "query",
      title: "Dispute variance",
      expectedLabel: `${euro(EXPECTED)} expected recovery`,
      expectedEuro: EXPECTED,
      effort: "1–3 days",
      confidence: "Medium",
      selected: true,
    },
  ],
  constraints: [
    { label: "Finance auto-dispute threshold", value: euro(500) },
    { label: "Decision value at formation", value: euro(EXPECTED) },
    { label: "Therefore", value: "Human approval required" },
  ],
  policy: {
    allowed: ["Prepare dispute", "Attach evidence package"],
    requiresApproval: ["Send dispute to supplier"],
    notAllowed: ["Initiate payment adjustment"],
    approvalOwner: "Finance Manager",
  },
  dataQuality: {
    requiredPresent: "2 / 3 material evidence objects at formation",
    items: [
      { label: "Contract base", state: "Fresh" },
      { label: "Invoice", state: "Fresh" },
      { label: "Seasonal schedule", state: "Missing at formation · arrived later" },
    ],
    overall: "MEDIUM",
    missing: ["Seasonal surcharge schedule (at formation)"],
    unknowns: [
      "Whether a valid surcharge exists for the invoice period.",
      "Final credit — none expected after surcharge accepted.",
    ],
  },
  confidence: {
    overall: "MEDIUM",
    dimensions: [
      { label: "Evidence completeness", level: "Medium" },
      { label: "Data freshness", level: "High" },
      { label: "Method certainty", level: "High" },
      { label: "Outcome uncertainty", level: "Medium" },
      { label: "Policy fit", level: "High" },
    ],
    why: [
      "Calculation was deterministic given available evidence.",
      "Surcharge schedule was absent at formation — outcome risk was real.",
    ],
  },
  method: {
    classLabel: "Contract rule comparison",
    bullets: [
      "Deterministic calculation at formation",
      "No predictive model used",
      "Generative model not used for economics",
    ],
    predictiveModelUsed: false,
    generativeEconomicsUsed: false,
  },
  action: {
    name: "Supplier dispute",
    preparedAt: "20 Sep 08:40",
    approvedBy: "Anna Müller",
    approvedAt: "20 Sep 09:05",
    sentAt: "20 Sep 09:12",
    recipient: "Supplier AP",
    evidenceAttached: ["CTR-1188", "INV-90112"],
    status: "Closed · surcharge accepted · no credit",
    preview: [
      "Prepare dispute",
      "Attach contract + invoice",
      `Request ${euro(EXPECTED)} credit`,
    ],
  },
  outcome: {
    kind: "RECOMMENDATION_MISSED",
    expectedEuro: EXPECTED,
    expectedLabel: `${euro(EXPECTED)} credit`,
    observedEuro: OBSERVED,
    observedLabel: `${euro(OBSERVED)} credit`,
    differenceEuro: -EXPECTED,
    differenceLabel: `−${euro(EXPECTED)}`,
    missReason:
      "Supplier provided valid seasonal surcharge documentation after Decision formation. Variance explained. No recovery.",
  },
  verification: {
    strength: "UNVERIFIED",
    proof: [
      { label: "Credit memo", value: "None" },
      { label: "Surcharge schedule", value: "SUP-SURCHARGE-SEP · accepted" },
      { label: "Date closed", value: "24 Sep 2026" },
    ],
    verifiedEuro: VERIFIED,
    verifiedLabel: `${euro(VERIFIED)} verified`,
  },
  attribution: {
    withoutRadr: "Invoice would have been paid as submitted.",
    radrAction: "Supplier dispute prepared and sent.",
    observed: "No credit · surcharge validated.",
    competingExplanation:
      "Seasonal surcharge schedule explains the full apparent variance.",
    attributedEuro: 0,
    verifiedEuro: 0,
  },
  memory: {
    bullets: [
      "Seasonal surcharge schedules must be attached to contract packages.",
      "Decision closed with no recovery — recommendation miss recorded.",
      "Playbook updated: require surcharge schedule check before dispute.",
    ],
    basedOnDecisionIds: ["D-4188"],
    playbookUpdated: true,
  },
  versions: [
    {
      version: 1,
      at: "20 Sep 07:22",
      summary: `Apparent ${euro(EXPECTED)} variance detected.`,
    },
    {
      version: 2,
      at: "20 Sep 09:12",
      summary: "Dispute sent.",
    },
    {
      version: 3,
      at: "24 Sep 11:04",
      summary: "Surcharge accepted · closed · $0 verified.",
    },
  ],
  audit: [
    { at: "20 Sep 07:22", actor: "RADR", text: "Created Decision." },
    {
      at: "20 Sep 09:05",
      actor: "Anna Müller",
      text: "Approved dispute send.",
    },
    {
      at: "23 Sep 14:02",
      actor: "RADR",
      text: "Supplier surcharge schedule ingested.",
    },
    {
      at: "24 Sep 11:04",
      actor: "RADR",
      text: "Decision closed · no recovery · Memory updated.",
    },
  ],
  provenanceSequence: [
    { label: "CTR-1188", detail: "Contract base · incomplete package" },
    { label: "INV-90112", detail: "Invoice · apparent variance" },
    { label: euro(EXPECTED), detail: "Exposure at formation · DERIVED" },
    { label: "D-4188", detail: "Dispute recommended" },
    { label: "SUP-SURCHARGE", detail: "Evidence changed · OBSERVED" },
    {
      label: euro(0),
      detail: "Verified · no recovery",
      verified: true,
    },
  ],
  reportingCurrency: "EUR",
  disclosure: "DEMO · ILLUSTRATIVE · recommendation miss · not customer results",
};
