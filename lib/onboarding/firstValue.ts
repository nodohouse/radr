/**
 * First-value onboarding — domain model.
 * North star: TIME TO FIRST DECISION.
 *
 * Persisted on organizations.onboarding (jsonb).
 * Milestones are independent so enterprise flows can be non-linear.
 */

/** Meaningful stages shown in the UI (not "Step 3 of 11"). */
export type OnboardingStage =
  | "your_organization"
  | "your_locations"
  | "your_goal"
  | "your_data"
  | "data_check"
  | "first_decision";

/** Persistable step machine for the MVP first-value path. */
export type FirstValueStep =
  | "welcome"
  | "who"
  | "organization"
  | "location"
  | "goal"
  | "evidence"
  | "upload"
  | "mapping"
  | "data_health"
  | "analyzing"
  | "reveal"
  | "complete"
  /** Legacy questionnaire path (kept for older rows / ?legacy=1) */
  | "legacy";

export type LocationBand = "1" | "2-5" | "6-20" | "21-50" | "51-100" | "100+";

export type IndustryKind =
  | "restaurant_group"
  | "hotel_group"
  | "bar_nightlife"
  | "serviced_apartments"
  | "mixed_hospitality"
  | "other";

/** Role lens — NOT authorization. */
export type RoleLens =
  | "owner"
  | "ceo"
  | "cfo"
  | "coo"
  | "regional_ops"
  | "gm"
  | "procurement"
  | "finance"
  | "it_data"
  | "other";

/** First Decision class — only surface production-ready options honestly. */
export type DecisionClassGoal =
  | "supplier_ap"
  | "reconciliation"
  | "cost_variance"
  | "procurement"
  | "perishable_revenue";

export type DecisionClassAvailability =
  | "recommended"
  | "available"
  | "building"
  | "planned";

export const DECISION_CLASS_CATALOG: {
  id: DecisionClassGoal;
  title: string;
  detail: string;
  availability: DecisionClassAvailability;
}[] = [
  {
    id: "supplier_ap",
    title: "Supplier / AP",
    detail: "Find invoice and contract discrepancies.",
    availability: "recommended",
  },
  {
    id: "reconciliation",
    title: "Reconciliation",
    detail: "Find unexplained settlement gaps.",
    availability: "building",
  },
  {
    id: "cost_variance",
    title: "Cost variance",
    detail: "Find costs moving outside expected terms.",
    availability: "building",
  },
  {
    id: "procurement",
    title: "Procurement",
    detail: "Find purchasing opportunities / contract leakage.",
    availability: "planned",
  },
  {
    id: "perishable_revenue",
    title: "Perishable revenue",
    detail: "Find revenue that may disappear if nobody acts.",
    availability: "planned",
  },
];

export type EvidenceMethod = "upload" | "connect" | "demo";

export type OnboardingMilestone =
  | "account_created"
  | "org_created"
  | "first_location_created"
  | "use_case_selected"
  | "source_started"
  | "source_ready"
  | "data_mapped"
  | "data_validated"
  | "analysis_ready"
  | "first_finding_created"
  | "first_decision_created"
  | "first_action_prepared"
  | "first_value_verified"
  | "onboarding_complete";

export type FirstDecisionOutcome =
  | {
      kind: "decision";
      displayId: string;
      locationName: string;
      classLabel: string;
      amountMinor: number;
      currency: string;
      headline: string;
      rationale: string;
    }
  | {
      kind: "nothing_needs_you";
      invoiceLines: number;
      contracts: number;
      thresholdMinor: number;
      currency: string;
    }
  | {
      kind: "insufficient_evidence";
      missing: string[];
      message: string;
    };

export type OnboardingMilestones = Partial<
  Record<OnboardingMilestone, string /* ISO timestamp */>
>;

export type FirstValueOnboardingState = {
  path: "first_value";
  step: FirstValueStep;
  stage: OnboardingStage;
  milestones: OnboardingMilestones;
  fullName?: string;
  roleLens?: RoleLens;
  organizationName?: string;
  industry?: IndustryKind;
  locationBand?: LocationBand;
  reportingCurrency?: string;
  locationName?: string;
  locationCity?: string;
  locationCountry?: string;
  locationTimezone?: string;
  localCurrency?: string;
  decisionClass?: DecisionClassGoal;
  evidenceMethod?: EvidenceMethod;
  contractDocumentId?: string;
  invoiceDocumentId?: string;
  materialityThresholdMinor?: number;
  firstDecision?: FirstDecisionOutcome;
  startedAt?: string;
  completedAt?: string;
  /** Soft UI */
  checklistDismissed?: boolean;
  firstWelcomeSeen?: boolean;
};

export const DEFAULT_FIRST_VALUE: FirstValueOnboardingState = {
  path: "first_value",
  step: "welcome",
  stage: "your_organization",
  milestones: {},
  materialityThresholdMinor: 10000, // €100.00 in minor units when EUR
};

export const STAGE_FOR_STEP: Record<FirstValueStep, OnboardingStage> = {
  welcome: "your_organization",
  who: "your_organization",
  organization: "your_organization",
  location: "your_locations",
  goal: "your_goal",
  evidence: "your_data",
  upload: "your_data",
  mapping: "your_data",
  data_health: "data_check",
  analyzing: "data_check",
  reveal: "first_decision",
  complete: "first_decision",
  legacy: "your_organization",
};

export const STAGE_LABEL: Record<OnboardingStage, string> = {
  your_organization: "Your organization",
  your_locations: "Your locations",
  your_goal: "Your goal",
  your_data: "Your data",
  data_check: "Data check",
  first_decision: "First Decision",
};

export function markMilestone(
  state: FirstValueOnboardingState,
  milestone: OnboardingMilestone,
  at = new Date().toISOString(),
): FirstValueOnboardingState {
  if (state.milestones[milestone]) return state;
  return {
    ...state,
    milestones: { ...state.milestones, [milestone]: at },
  };
}

export function hasMilestone(
  state: FirstValueOnboardingState,
  milestone: OnboardingMilestone,
): boolean {
  return Boolean(state.milestones[milestone]);
}
