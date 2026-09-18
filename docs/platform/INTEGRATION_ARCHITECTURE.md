# RADR Integration Architecture

Last updated: 2026-08-24

## Purpose

RADR is an open hospitality intelligence layer. It sits above POS, reservations,
labor, purchasing, payments, accounting, delivery and external signal systems.
It does **not** replace those systems.

This document defines the platform architecture for connecting evidence sources
into the RADR operating model.

## Honest status (today)

| Layer | Status |
|-------|--------|
| Document / file ingest (PDF, CSV, Excel via Documents) | **LIVE** |
| Manual targets / commercial terms | **LIVE** (product UX) |
| Multi-tenant auth + org/location model | **LIVE** |
| Demo Control Center (synthetic connectors) | **DEMO ONLY** |
| Vendor adapters (Toast, SevenRooms, …) | **NOT IMPLEMENTED** |
| Public RADR REST API `/v1` | **PROPOSED** |
| Inbound provider webhooks | **PROPOSED** |
| Encrypted integration credential store | **PROPOSED** |

Do not market any commercial provider as AVAILABLE until an adapter ships and is validated.

## Conceptual pipeline

```
EXTERNAL SYSTEMS
  POS · Reservations · Labor · Payments · Delivery · Accounting
  Suppliers · Banking · Weather · Events · Custom / warehouse / files
        ↓  APIs / Webhooks / Files / SFTP / Warehouses / Custom adapters
INTEGRATION ADAPTERS  (per provider, isolated)
        ↓
RAW / SOURCE EVIDENCE  (immutable ingest + provenance)
        ↓
NORMALIZER  (provider → RADR schema)
        ↓
RADR NORMALIZED MODEL
        ↓
DOMAIN SERVICES  (reservations, revenue, labor, purchasing, payments, forecast, reconciliation)
        ↓
INTELLIGENCE ENGINE  BUY · LABOR · SELL · RECOVER
        ↓
Findings · Recommendations · Actions · Verified Value
        ↓
RADR Product · RADR Butler · RADR API
```

## Core principles

1. **Adapters are isolated.** One provider failure must not break domain logic.
2. **Normalize early.** Provider field names must not leak into product UI.
3. **Preserve source of record.** Accounting truth stays in accounting; RADR derives intelligence above it.
4. **Minimize PII.** Prefer reservation IDs, party size, times, status over guest identity.
5. **Never invent capabilities.** Statuses: available | beta | building | planned | custom | partner_access.
6. **Secrets stay server-side.** No `NEXT_PUBLIC_*` credentials. Placeholders only in docs.
7. **Idempotent ingest.** Unique `(tenant, provider, externalId)` prevents duplicates.
8. **Async processing.** Webhooks validate + ack, then queue. No heavy work in HTTP request.

## Adapter pattern

Each category has a focused TypeScript interface under `lib/integrations/adapters/`:

- `ReservationAdapter`
- `PosAdapter`
- `LaborAdapter`
- `AccountingAdapter`
- `PaymentsAdapter`
- `DeliveryAdapter`
- `ProcurementAdapter`
- `BankingAdapter`
- `ExternalSignalAdapter`

Shared lifecycle: connect → refresh credentials → backfill → incremental sync → webhook handle → health check.

Reference implementation: `DemoReservationAdapter` (synthetic data only).

## Sync strategies

| Strategy | When |
|----------|------|
| Historical backfill | On connect (window depends on agreement / rate limits) |
| Incremental polling | Cursor / updated-since when webhooks unavailable |
| Webhooks | Preferred for near-real-time when provider supports + signature verify |
| Reconciliation poll | Periodic catch-up against source of record |

Never invent polling frequencies. Each adapter declares `rateLimitPolicy` from official docs.

## Source of truth policy

| Concern | Source of record |
|---------|------------------|
| Reservation attendance / cancel / no-show | Reservation provider |
| Revenue / checks / line items | POS |
| Settlement / fees / chargebacks | Payments or delivery platform |
| Posted GL / invoice | Accounting system |
| Scheduled vs actual labor | Workforce system |
| Derived exposure / findings | RADR (with lineage) |

## Related docs

- [API_DESIGN.md](./API_DESIGN.md)
- [NORMALIZED_DATA_MODEL.md](./NORMALIZED_DATA_MODEL.md)
- [SECURITY.md](./SECURITY.md)
- [PROVIDER_MATRIX.md](./PROVIDER_MATRIX.md)
- [DEVELOPER_SITE_PLAN.md](./DEVELOPER_SITE_PLAN.md)
- [REPO_AUDIT.md](./REPO_AUDIT.md)
