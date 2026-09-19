/**
 * Shared integration types: money, provenance, health, sync.
 * No secrets. No provider-specific field names.
 */

export type Money = {
  amountMinor: number;
  currency: string;
};

export type Provenance = {
  sourceProvider: string;
  sourceConnectionId: string;
  externalId: string;
  sourceCreatedAt?: string;
  sourceUpdatedAt?: string;
  ingestedAt: string;
  rawReference?: string;
};

export type IntegrationHealthStatus =
  | "CONNECTED"
  | "SYNCING"
  | "HEALTHY"
  | "STALE"
  | "ERROR"
  | "DISCONNECTED";

export type IntegrationHealth = {
  status: IntegrationHealthStatus;
  lastSuccessfulSync?: string;
  lastAttempt?: string;
  latencyMs?: number;
  recordsLastSync?: number;
  errorSummary?: string;
};

export type ConnectionResult = {
  connectionId: string;
  health: IntegrationHealth;
};

export type SyncCursor = {
  value: string;
  updatedAt: string;
};

export type SyncResult = {
  records: number;
  cursor?: SyncCursor;
  health: IntegrationHealth;
};

export type RateLimitPolicy = {
  /** Human-readable note from official provider docs; not invented numbers. */
  notes: string;
  maxRequestsPerMinute?: number;
};

export type ExternalLocation = {
  externalId: string;
  name: string;
  timezone?: string;
  currency?: string;
};

export type ExternalReservation = {
  externalId: string;
  locationExternalId: string;
  serviceTime: string;
  partySize: number;
  status: string;
  bookingChannel?: string;
  tableExternalId?: string;
  section?: string;
  cancelledAt?: string;
  noShow?: boolean;
  sourceUpdatedAt: string;
};

export type ExternalWaitlistEntry = {
  externalId: string;
  locationExternalId: string;
  requestedAt: string;
  requestedServiceTime: string;
  partySize: number;
  status: string;
  quotedWaitMinutes?: number;
  source: string;
};

export type DateRange = {
  from: string;
  to: string;
};

export type AdapterContext = {
  tenantId: string;
  connectionId: string;
  /** Opaque. Adapters read secrets only via server-side secret store. */
  locationScope?: string[];
};
