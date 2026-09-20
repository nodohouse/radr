/**
 * Alias for the canonical integration registry.
 * Prefer `@/lib/integrations/registry` in new code.
 */
export {
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS_LABEL,
  getProvider,
  integrationTypeOf,
  providersByCategory,
  providersByStatus,
  type AccessType,
  type AuthMethod,
  type DataEntity,
  type IntegrationCategory,
  type IntegrationProvider,
  type IntegrationStatus,
  type IntegrationType,
} from "@/lib/integrations/registry";
