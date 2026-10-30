/**
 * Canonical Decision Trace — structured rationale for auditability.
 * No LLM chain-of-thought. Numbers derive from fixtures / deterministic calc.
 */

export type EpistemicGrade =
  | "OBSERVED"
  | "DERIVED"
  | "ESTIMATED"
  | "PREDICTED"
  | "OPERATOR_CONTEXT"
  | "RECOMMENDED"
  | "VERIFIED";

export type VerificationStrength = "STRONG" | "MODERATE" | "WEAK" | "UNVERIFIED";

export type TraceEvidenceObject = {
  id: string;
  kind: string;
  title: string;
  fields: { label: string; value: string; grade?: EpistemicGrade }[];
  provenance: {
    sourceSystem: string;
    method: string;
    importedAt?: string;
    freshness: string;
    location: string;
    entityId: string;
    grade: EpistemicGrade;
  };
};

export type TraceCalculation = {
  title: string;
  steps: { label: string; value: string; grade: EpistemicGrade }[];
  result: { label: string; value: string; amountEuro: number; grade: EpistemicGrade };
  excluded: { label: string; value: string }[];
  formulaHuman: string;
};

export type TraceBaseline = {
  title: string;
  type: "contractual" | "historical" | "forecasted" | "policy" | "operator" | "model";
  source: string;
  outcome: string;
  economicEuro: number;
  economicLabel: string;
  confidence: "High" | "Medium" | "Low";
};

export type TraceFuture = {
  id: string;
  title: string;
  expectedLabel: string;
  expectedEuro?: number;
  expectedRange?: string;
  effort: string;
  confidence: "High" | "Medium" | "Low";
  selected: boolean;
  note?: string;
};

export type TraceConstraint = {
  label: string;
  value: string;
};

export type TracePolicy = {
  allowed: string[];
  requiresApproval: string[];
  notAllowed: string[];
  approvalOwner: string;
};

export type TraceOperatorContext = {
  text: string;
  addedBy: string;
  at: string;
  effect: string;
  confidenceBefore?: string;
  confidenceAfter?: string;
};

export type TraceDataQuality = {
  requiredPresent: string;
  items: { label: string; state: string }[];
  overall: "HIGH" | "MEDIUM" | "LOW";
  missing: string[];
  unknowns: string[];
  conflicts?: { label: string; detail: string }[];
};

export type TraceConfidence = {
  overall: "HIGH" | "MEDIUM" | "LOW";
  dimensions: { label: string; level: "High" | "Medium" | "Low" }[];
  why: string[];
};

export type TraceMethod = {
  classLabel: string;
  bullets: string[];
  predictiveModelUsed: boolean;
  /** LLM must never invent economic values. */
  generativeEconomicsUsed: boolean;
  modelVersion?: string;
  lastCalibrated?: string;
};

/** Canonical Decision lifecycle — UI may humanize labels. */
export type DecisionLifecycleState =
  | "DETECTED"
  | "EVIDENCE_GATHERING"
  | "DECISION_READY"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "ACTIONING"
  | "OBSERVING"
  | "VERIFYING"
  | "VERIFIED"
  | "CLOSED_NO_VALUE"
  | "CLOSED_OVERRIDDEN"
  | "CLOSED_INSUFFICIENT_EVIDENCE"
  | "MEMORY_UPDATED"
  | "NO_ACTION_RECOMMENDED";

export type OutcomeKind =
  | "FULL_SUCCESS"
  | "PARTIAL_OUTCOME"
  | "NO_RECOVERY"
  | "ACTION_FAILED"
  | "RECOMMENDATION_OVERRIDDEN"
  | "RECOMMENDATION_MISSED"
  | "EVIDENCE_CHANGED"
  | "INSUFFICIENT_EVIDENCE"
  | "NO_ACTION_RECOMMENDED";

export type TraceMateriality = {
  ruleLabel: string;
  thresholdEuro: number;
  observedEuro: number;
  triggered: boolean;
};

export type TraceSourceDisagreement = {
  title: string;
  rows: { source: string; value: string; amountEuro?: number }[];
  differenceLabel: string;
  differenceEuro: number;
  nextStep: string;
};

export type TraceAction = {
  name: string;
  preparedAt: string;
  approvedBy: string;
  approvedAt: string;
  sentAt: string;
  recipient: string;
  evidenceAttached: string[];
  status: string;
  preview: string[];
};

export type TraceOutcome = {
  kind: OutcomeKind;
  expectedEuro: number;
  expectedLabel: string;
  observedEuro: number;
  observedLabel: string;
  differenceEuro: number;
  differenceLabel: string;
  missReason?: string;
};

export type TraceVerification = {
  strength: VerificationStrength;
  proof: { label: string; value: string }[];
  verifiedEuro: number;
  verifiedLabel: string;
};

export type TraceAttribution = {
  withoutRadr: string;
  radrAction: string;
  observed: string;
  competingExplanation: string;
  attributedEuro: number;
  verifiedEuro: number;
};

export type TraceMemory = {
  bullets: string[];
  basedOnDecisionIds: string[];
  playbookUpdated: boolean;
};

export type TraceAuditEvent = {
  at: string;
  actor: string;
  text: string;
};

export type TraceVersion = {
  version: number;
  at: string;
  summary: string;
};

export type DecisionTraceRecord = {
  displayId: string;
  location: string;
  classLabel: string;
  /** Canonical lifecycle state. */
  state: DecisionLifecycleState;
  /** Humanized seal line, e.g. SEALED · VERIFIED */
  stateLabel: string;
  economicImportance: string;
  /** Primary economic headline for overview (usually verified or exposed). */
  headlineEuro: number;
  headlineLabel: string;
  owner: string;
  deadline: string;
  confidenceLabel: string;
  evidenceQuality: string;
  whySurfaced: string;
  rationale: string[];
  whatCouldChange: string[];
  selectedBecause: string[];
  materiality?: TraceMateriality;
  evidence: TraceEvidenceObject[];
  calculation: TraceCalculation;
  baseline: TraceBaseline;
  futures: TraceFuture[];
  constraints: TraceConstraint[];
  policy: TracePolicy;
  operatorContext?: TraceOperatorContext;
  dataQuality: TraceDataQuality;
  confidence: TraceConfidence;
  method: TraceMethod;
  action: TraceAction;
  outcome: TraceOutcome;
  verification: TraceVerification;
  attribution: TraceAttribution;
  memory: TraceMemory;
  versions: TraceVersion[];
  audit: TraceAuditEvent[];
  sourceDisagreement?: TraceSourceDisagreement;
  /** Linear provenance sequence for overview visual. */
  provenanceSequence: { label: string; detail: string; verified?: boolean }[];
  reportingCurrency: "EUR";
  disclosure: string;
};
