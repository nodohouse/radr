import type { OnboardingFlowDefinition } from "../types";

/**
 * Thin self-serve catalog (Phase E foundation).
 * Full adaptive funnel deferred — steps map to future Settings destinations.
 */
export const SELF_SERVE_FLOW: OnboardingFlowDefinition = {
  id: "self_serve",
  version: 1,
  schemaVersion: 1,
  title: "Tell RADR about your operation",
  steps: [
    {
      id: "role",
      version: 1,
      title: "What's your role?",
      description: "Configures your initial lens. Editable later in Users & Access.",
      order: 10,
      requiredFields: ["roleLens"],
      settingsDestination: "membership.roleLens",
      componentType: "role_lens",
      isRequired: true,
      isRevisitable: true,
      bindings: [{ settingsKey: "membership.roleLens", field: "roleLens" }],
    },
    {
      id: "organization",
      version: 1,
      title: "Your organization",
      description: "Name, country, currency, timezone.",
      order: 20,
      requiredFields: ["name", "country", "currency", "timezone"],
      settingsDestination: "organization.profile",
      componentType: "organization_profile",
      isRequired: true,
      isRevisitable: true,
      bindings: [
        { settingsKey: "organization.name", field: "name" },
        { settingsKey: "organization.country", field: "country" },
        { settingsKey: "organization.currency", field: "currency" },
        { settingsKey: "organization.timezone", field: "timezone" },
      ],
    },
    {
      id: "location",
      version: 1,
      title: "First location",
      description: "Minimum profile so Live and Decisions have a place to attach.",
      order: 30,
      requiredFields: ["name", "country", "city", "timezone", "currency"],
      settingsDestination: "location.profile",
      componentType: "location_profile",
      isRequired: true,
      isRevisitable: true,
      bindings: [
        { settingsKey: "location.name", field: "name" },
        { settingsKey: "location.country", field: "country" },
        { settingsKey: "location.city", field: "city" },
        { settingsKey: "location.timezone", field: "timezone" },
        { settingsKey: "location.currency", field: "currency" },
      ],
    },
    {
      id: "connect",
      version: 1,
      title: "Bring RADR to life",
      description: "Connect systems when ready — skippable.",
      order: 40,
      requiredFields: [],
      settingsDestination: "connections.integrations",
      componentType: "connect_systems",
      isRequired: false,
      isRevisitable: true,
      bindings: [],
    },
    {
      id: "go_live",
      version: 1,
      title: "RADR is learning your operation",
      description: "Enter Control Center. Continue setup progressively.",
      order: 50,
      requiredFields: [],
      settingsDestination: "setup.activation",
      componentType: "go_live",
      isRequired: true,
      isRevisitable: false,
      bindings: [],
    },
  ],
};

export function getSelfServeFlow(): OnboardingFlowDefinition {
  return SELF_SERVE_FLOW;
}
