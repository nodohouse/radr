/**
 * Funnel analytics - structured logs, no sensitive payloads.
 */

import { logEvent } from "@/lib/platform/observability";

export type OnboardingEvent =
  | "signup_started"
  | "signup_completed"
  | "onboarding_started"
  | "business_created"
  | "organization_created"
  | "location_created"
  | "first_location_created"
  | "decision_class_selected"
  | "data_source_started"
  | "file_uploaded"
  | "schema_detected"
  | "mapping_completed"
  | "import_completed"
  | "data_health_ready"
  | "analysis_started"
  | "first_finding_created"
  | "first_decision_created"
  | "first_decision_opened"
  | "first_action_prepared"
  | "first_action_approved"
  | "first_outcome_observed"
  | "first_value_verified"
  | "demo_selected"
  | "integration_selected"
  | "integration_started"
  | "control_center_viewed"
  | "first_finding_opened"
  | "ask_radr_opened"
  | "first_question_asked"
  | "team_invited"
  | "onboarding_completed"
  | "tour_started"
  | "tour_dismissed"
  | "checklist_dismissed";

export function trackOnboarding(
  event: OnboardingEvent,
  meta?: Record<string, string | number | boolean | null>,
  organizationId?: string,
) {
  logEvent({
    level: "info",
    event: `onboarding.${event}`,
    organizationId,
    meta,
  });
}
