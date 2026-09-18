import type {
  AdapterContext,
  ConnectionResult,
  DateRange,
  IntegrationHealth,
  RateLimitPolicy,
  SyncCursor,
  SyncResult,
} from "../types";

/** POS / EPOS adapter: orders, checks, payments summary. No card PAN. */
export interface PosAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;

  connect(context: AdapterContext): Promise<ConnectionResult>;
  refreshCredentials?(context: AdapterContext): Promise<void>;
  backfillOrders(context: AdapterContext, range: DateRange): Promise<SyncResult>;
  syncOrders(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  handleWebhook?(
    payload: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ events: string[] }>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}
