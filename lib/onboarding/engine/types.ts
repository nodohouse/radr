/**
 * Schema-driven onboarding engine types.
 * Steps bind to canonical settings keys — not a parallel onboarding data model.
 */

export type OnboardingComponentType =
  | "role_lens"
  | "organization_profile"
  | "location_profile"
  | "connect_systems"
  | "go_live";

export type OnboardingResponseBinding = {
  /** Canonical settings key — see SETTINGS_SCHEMA_MAP.md */
  settingsKey: string;
  /** Field name on the step payload */
  field: string;
};

export type OnboardingStepDefinition = {
  id: string;
  version: number;
  title: string;
  description: string;
  order: number;
  roles?: string[];
  verticals?: string[];
  organizationSize?: string[];
  requiredPermissions?: string[];
  requiredFields: string[];
  skipCondition?: string;
  completionCondition?: string;
  settingsDestination: string;
  componentType: OnboardingComponentType;
  isRequired: boolean;
  isRevisitable: boolean;
  bindings: OnboardingResponseBinding[];
};

export type OnboardingFlowDefinition = {
  id: string;
  version: number;
  schemaVersion: number;
  title: string;
  steps: OnboardingStepDefinition[];
};

/** Progress-only — never store settings values here as SSOT. */
export type OnboardingProgress = {
  schemaVersion: number;
  flowVersion: number;
  flowId: string;
  currentStepId: string | null;
  completedStepIds: string[];
  skippedStepIds: string[];
  lastCompletedAt: string | null;
};
