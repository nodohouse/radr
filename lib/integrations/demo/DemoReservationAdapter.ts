import type { ReservationAdapter } from "../adapters/ReservationAdapter";
import type {
  AdapterContext,
  ConnectionResult,
  DateRange,
  ExternalLocation,
  ExternalReservation,
  ExternalWaitlistEntry,
  IntegrationHealth,
  SyncCursor,
  SyncResult,
} from "../types";

const PROVIDER_ID = "radr-demo-reservations";

const DEMO_LOCATION: ExternalLocation = {
  externalId: "demo-berlin-mitte",
  name: "Berlin Mitte (Demo)",
  timezone: "Europe/Berlin",
  currency: "EUR",
};

/**
 * Synthetic reservation adapter. Teaches the architecture.
 * No network calls. No secrets. Safe for tests and sandbox demos.
 */
export class DemoReservationAdapter implements ReservationAdapter {
  readonly providerId = PROVIDER_ID;
  readonly rateLimitPolicy = {
    notes: "Synthetic adapter; no external rate limits.",
  };

  async connect(context: AdapterContext): Promise<ConnectionResult> {
    return {
      connectionId: context.connectionId || "conn_demo_reservations",
      health: {
        status: "HEALTHY",
        lastSuccessfulSync: new Date().toISOString(),
        recordsLastSync: 0,
      },
    };
  }

  async listLocations(_context: AdapterContext): Promise<ExternalLocation[]> {
    return [DEMO_LOCATION];
  }

  async backfillReservations(
    context: AdapterContext,
    _range: DateRange,
  ): Promise<ExternalReservation[]> {
    return this.sampleReservations(context);
  }

  async syncReservations(
    context: AdapterContext,
    _cursor?: SyncCursor,
  ): Promise<SyncResult & { reservations: ExternalReservation[] }> {
    const reservations = this.sampleReservations(context);
    return {
      records: reservations.length,
      reservations,
      cursor: {
        value: `demo_${reservations.length}`,
        updatedAt: new Date().toISOString(),
      },
      health: {
        status: "HEALTHY",
        lastSuccessfulSync: new Date().toISOString(),
        recordsLastSync: reservations.length,
      },
    };
  }

  async syncWaitlist(
    _context: AdapterContext,
    _cursor?: SyncCursor,
  ): Promise<SyncResult & { entries: ExternalWaitlistEntry[] }> {
    const entries: ExternalWaitlistEntry[] = [
      {
        externalId: "wl_demo_1",
        locationExternalId: DEMO_LOCATION.externalId,
        requestedAt: "2026-08-24T18:30:00+02:00",
        requestedServiceTime: "2026-08-24T20:00:00+02:00",
        partySize: 3,
        status: "waiting",
        quotedWaitMinutes: 25,
        source: "demo",
      },
    ];
    return {
      records: entries.length,
      entries,
      health: {
        status: "HEALTHY",
        lastSuccessfulSync: new Date().toISOString(),
        recordsLastSync: entries.length,
      },
    };
  }

  async healthCheck(_context: AdapterContext): Promise<IntegrationHealth> {
    return {
      status: "HEALTHY",
      lastSuccessfulSync: new Date().toISOString(),
      latencyMs: 1,
      recordsLastSync: 0,
    };
  }

  private sampleReservations(
    context: AdapterContext,
  ): ExternalReservation[] {
    const now = new Date().toISOString();
    return [
      {
        externalId: "res_demo_confirmed",
        locationExternalId: DEMO_LOCATION.externalId,
        serviceTime: "2026-08-24T19:00:00+02:00",
        partySize: 2,
        status: "confirmed",
        bookingChannel: "direct",
        tableExternalId: "t12",
        section: "main",
        sourceUpdatedAt: now,
      },
      {
        externalId: "res_demo_cancelled",
        locationExternalId: DEMO_LOCATION.externalId,
        serviceTime: "2026-08-24T20:00:00+02:00",
        partySize: 4,
        status: "cancelled",
        bookingChannel: "demo",
        tableExternalId: "t14",
        section: "main",
        cancelledAt: "2026-08-24T18:45:00+02:00",
        sourceUpdatedAt: now,
      },
    ].map((r) => ({
      ...r,
      // Bind to tenant only via context; no PII.
      externalId: `${context.tenantId}:${r.externalId}`,
    }));
  }
}
