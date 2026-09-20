import type {
  AdapterContext,
  ConnectionResult,
  DateRange,
  IntegrationHealth,
  RateLimitPolicy,
  SyncCursor,
  SyncResult,
} from "../types";

export interface AccountingAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  refreshCredentials?(context: AdapterContext): Promise<void>;
  syncInvoices(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  backfillInvoices?(
    context: AdapterContext,
    range: DateRange,
  ): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}

export interface PaymentsAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  syncSettlements(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  handleWebhook?(
    payload: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ events: string[] }>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}

export interface DeliveryAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  syncOrders(context: AdapterContext, cursor?: SyncCursor): Promise<SyncResult>;
  syncPayouts?(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}

export interface ProcurementAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  syncInvoices(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}

export interface BankingAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  syncTransactions(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}

export interface ExternalSignalAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;
  connect(context: AdapterContext): Promise<ConnectionResult>;
  syncSignals(context: AdapterContext, range: DateRange): Promise<SyncResult>;
  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}
