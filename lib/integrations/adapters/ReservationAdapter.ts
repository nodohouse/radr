import type {
  AdapterContext,
  ConnectionResult,
  DateRange,
  ExternalLocation,
  ExternalReservation,
  ExternalWaitlistEntry,
  IntegrationHealth,
  RateLimitPolicy,
  SyncCursor,
  SyncResult,
} from "../types";

/**
 * Reservation / booking adapter contract.
 * Provider SDKs stay inside adapter implementations; never leak into product UI.
 */
export interface ReservationAdapter {
  readonly providerId: string;
  readonly rateLimitPolicy: RateLimitPolicy;

  connect(context: AdapterContext): Promise<ConnectionResult>;

  refreshCredentials?(context: AdapterContext): Promise<void>;

  listLocations(context: AdapterContext): Promise<ExternalLocation[]>;

  backfillReservations(
    context: AdapterContext,
    range: DateRange,
  ): Promise<ExternalReservation[]>;

  syncReservations(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult & { reservations: ExternalReservation[] }>;

  syncWaitlist?(
    context: AdapterContext,
    cursor?: SyncCursor,
  ): Promise<SyncResult & { entries: ExternalWaitlistEntry[] }>;

  /**
   * Verify signature using official provider docs before parsing JSON when required.
   * Return empty array if payload is not relevant.
   */
  handleWebhook?(
    payload: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ events: string[]; reservations?: ExternalReservation[] }>;

  healthCheck(context: AdapterContext): Promise<IntegrationHealth>;
}
