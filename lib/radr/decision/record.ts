import type { DecisionVertical, Epistemic, ValueKind } from "./core";
import type { DecisionLifecycleStatus, AttentionBand } from "./lifecycle";
import type { DecisionRecordHorizon } from "./horizon";
import type { DecisionLedgerEvent } from "./ledger";
import type { DecisionGraph } from "./graph";
import type { DecisionDebt, PatternEscalation } from "./pattern";
import type { DecisionMemoryEntry } from "./memory";
import type { Playbook } from "./playbook";
import type { OperatingDNAProfile } from "./dna";
import type { CounterfactualOption, DecisionRegret } from "./counterfactual";
import type { DecisionAutonomyPolicy } from "./autonomy";
import type { EconomicTerritory } from "@/lib/radr/intelligence";
import type { EconomicMetricType } from "@/lib/economics/metricTypes";

export type ActionPlanStatus =
  | "DRAFTED"
  | "READY"
  | "PREPARED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "EXECUTING"
  | "EXECUTED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ActionPlanStep = {
  id: string;
  provider: string;
  title: string;
  status: ActionPlanStatus;
  detail?: string;
  /** Never fake writes — prepared only unless explicitly demo-completed. */
  preparedOnly: boolean;
};

export type ActionPlan = {
  status: ActionPlanStatus;
  steps: ActionPlanStep[];
  payloadNote: string;
};

export type VerificationMethod =
  | "POS_TRANSACTION"
  | "PMS_BOOKING"
  | "SETTLEMENT"
  | "SUPPLIER_CREDIT"
  | "PAYROLL_ACTUAL"
  | "BOOKING_CONVERSION"
  | "ACCOUNTING_ENTRY"
  | "CHANNEL_BOOKING"
  | "MANUAL_CONFIRM"
  | "KDS_OBSERVED"
  | "DEMO_ILLUSTRATIVE";

export type DecisionConfidence = {
  forecast: "HIGH" | "MEDIUM" | "LOW";
  data: "HIGH" | "MEDIUM" | "LOW";
  decision: "HIGH" | "MEDIUM" | "LOW";
  userFacing: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  point: number;
  low: number;
  high: number;
  evidenceCoverage?: "HIGH" | "MEDIUM" | "LOW";
  dataFreshness?: "HIGH" | "MEDIUM" | "LOW";
  mainUncertainty?: string;
};

export type DecisionEvidenceRef = {
  id: string;
  label: string;
  value: string;
  source: string;
  freshness: string;
  grade?: Epistemic | "OPERATOR_CONTEXT" | "STALE" | "MISSING" | "UNKNOWN";
};

export type DecisionWhyBlock = {
  epistemic: Epistemic;
  title: string;
  body: string;
};

export type OperatorContextEntry = {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  impactNote?: string;
};

export type OperatingStateRow = {
  label: string;
  value: string;
  tone?: "neutral" | "watch" | "risk" | "ok";
};

export type TypedMetric = {
  metricType: EconomicMetricType;
  value: number;
  currency: string;
  label: string;
  scope?: string;
  horizon?: string;
};

export type DecisionOutcomeDetail = {
  summary: string;
  rows: OperatingStateRow[];
  observedContributionEuro?: number;
  expectedContributionEuro?: number;
  forecastErrorEuro?: number;
  forecastErrorPct?: number;
};

export type DecisionVerificationDetail = {
  method: VerificationMethod;
  attributionStrength:
    | "DIRECTLY_VERIFIED"
    | "STRONGLY_ATTRIBUTED"
    | "MODELED"
    | "UNVERIFIED";
  comparedTo: string;
  note: string;
  metrics: TypedMetric[];
};

export type DecisionRecord = {
  id: string;
  organizationId: string;
  locationId: string;
  operatingUnitId: string;
  roleContext: string;
  decisionType: string;
  decisionHorizon: DecisionRecordHorizon;
  status: DecisionLifecycleStatus;
  vertical: DecisionVertical;
  /** Economic lenses — always treat as array in UI (default []). */
  territories?: EconomicTerritory[];
  attentionOverride?: AttentionBand | "learned";

  title: string;
  problemStatement: string;
  currentState: string;
  property: string;
  phaseLabel: string;
  contextLine: string;
  recommendationHeadline?: string;

  triggerEvents: string[];
  evidenceRefs: DecisionEvidenceRef[];
  relatedEntities: { type: string; id: string; label: string }[];
  operatingStateSnapshot?: OperatingStateRow[];
  relationshipChain?: string[];
  constraints?: string[];
  /** Competing explanations RADR ranked lower. */
  alternativeExplanations?: { label: string; whyLower: string }[];
  /** Evidence that argues against the recommendation. */
  counterEvidence?: string;
  /** Human-readable main risk — not the risk level alone. */
  mainRiskNarrative?: string;
  operatorContext?: OperatorContextEntry[];

  baselinePrediction: string;
  noActionOutcome: string;
  options: CounterfactualOption[];
  recommendedOptionId: string;
  recommendationReasoning: string;

  expectedRevenueImpact?: number;
  expectedContributionImpact: number;
  expectedGuestImpact: string;
  expectedOperationalImpact: string;
  exposedContribution?: number;

  confidence: DecisionConfidence;

  decisionDeadline: string;
  decisionDeadlineAt?: string;
  valueDecayCurve?: { at: string; valueEuro: number }[];

  requiredRole: string;
  approver?: string;
  approvedAt?: string;
  chosenOptionId?: string;

  actionPlan: ActionPlan;
  executionRefs: string[];

  observedOutcome?: string;
  actualRevenueImpact?: number;
  actualContributionImpact?: number;
  actualGuestImpact?: string;
  outcomeDetail?: DecisionOutcomeDetail;

  verifiedValue?: {
    amount: number;
    kind: Exclude<ValueKind, "exposed">;
    note: string;
  };
  verificationMethod?: VerificationMethod;
  verifiedAt?: string;
  verificationDetail?: DecisionVerificationDetail;

  forecastError?: string;
  recommendationQuality?: {
    score: number;
    note: string;
  };
  counterfactualAssessment?: string;
  regret?: DecisionRegret;

  lesson?: string;
  playbookImpact?: string;
  playbookId?: string;
  patternsUpdated?: string[];
  playbooksUpdated?: string[];

  ledger: DecisionLedgerEvent[];
  graph: DecisionGraph;
  pattern?: PatternEscalation;
  debt?: DecisionDebt;
  memory?: DecisionMemoryEntry;
  playbook?: Playbook;
  operatingDna?: OperatingDNAProfile;
  autonomy: DecisionAutonomyPolicy;

  whyBlocks: DecisionWhyBlock[];
  locationDnaLine: string;
  image?: string;
  imageAlt?: string;
  silenceNote?: string;
  modelVersion: string;
  demoLabel?: string;

  /** Opinionated problem family — not a free-form agent skill. */
  problemFamily?: import("@/lib/radr/problemFamilies").ProblemFamily;
  economicState?: import("@/lib/radr/problemFamilies").EconomicValueState;
  timeToExpiry?: string;
  recoverability?: "high" | "medium" | "low" | "none";
  verificationPath?: string[];
  requiredEvidence?: string[];
  allowedActions?: string[];
  alwaysAskActions?: string[];

  createdAt: string;
  updatedAt: string;
};

export type WatchingSignal = {
  id: string;
  locationId: string;
  property: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  reason: string;
};

export type SinceLastCheckItem = {
  id: string;
  kind: "handled" | "needs_you" | "verified" | "changed";
  title: string;
  detail: string;
  amountEuro?: number;
};
