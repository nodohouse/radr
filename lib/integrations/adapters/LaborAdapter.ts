import type {
  AdapterContext,
  ConnectionResult,
  DateRange,
  IntegrationHealth,
  RateLimitPolicy,
  SyncCursor,
  SyncResult,
} from "../types";

/** Workforce / scheduling adapter. Operational staffing evidence only. */
export interface LaborAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;

  connect(context: AdapterContext): Promise<ConnectionResult>;
  refreshCredentials?(context: AdapterContext): Promise<void>;
  backfillShifts(context: AdapterContext, range: DateRange): Promise<SyncResult>;
  syncShifts(context: AdapterContext, cursor?: SyncCursor): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}
