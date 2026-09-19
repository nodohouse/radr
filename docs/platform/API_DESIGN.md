# RADR API Design

Last updated: 2026-08-24

## Status

All `/v1` routes below are **PROPOSED / BETA** until implemented behind
authenticated handlers. Do not treat this as a live production contract.

Fake base URL for examples:

```
RADR_API_BASE_URL=https://api.example.invalid
RADR_ENV=sandbox
RADR_API_KEY=radr_test_your_test_api_key
```

## Authentication (proposed)

Server-to-server:

```
Authorization: Bearer <RADR_API_KEY>
```

- Test keys (`radr_test_…`) vs live keys (`radr_live_…`)
- Scoped, rotatable, revocable
- Store hashes server-side; never return plaintext after creation
- Never put keys in `NEXT_PUBLIC_*` or client bundles

Human sessions remain Better Auth (existing product auth).

## Versioning

Prefix: `/v1/`

Breaking changes require a new major version. Deprecations announced in the
developer changelog with a migration window.

## Proposed read API

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | `/v1/locations` | List locations in tenant | PROPOSED |
| GET | `/v1/locations/{id}` | Location detail | PROPOSED |
| GET | `/v1/locations/{id}/summary` | Operating summary | PROPOSED |
| GET | `/v1/reservations` | Reservations (filterable) | PROPOSED |
| GET | `/v1/performance` | Performance series | PROPOSED |
| GET | `/v1/forecasts` | Forecast series | PROPOSED |
| GET | `/v1/findings` | Open / closed findings | PROPOSED |
| GET | `/v1/findings/{id}` | Finding + lineage | PROPOSED |
| GET | `/v1/actions` | Actions | PROPOSED |
| POST | `/v1/actions` | Create / update action | PROPOSED |
| GET | `/v1/verified-value` | Verified value rollup | PROPOSED |

## Proposed ingest API

All ingest endpoints require API key + tenant binding + schema validation.

| Method | Path | Status |
|--------|------|--------|
| POST | `/v1/ingest/reservations` | PROPOSED |
| POST | `/v1/ingest/orders` | PROPOSED |
| POST | `/v1/ingest/labor` | PROPOSED |
| POST | `/v1/ingest/invoices` | PROPOSED |

Example (placeholders only):

```http
POST /v1/ingest/reservations
Authorization: Bearer radr_test_your_test_api_key
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "location_external_id": "berlin-mitte",
  "reservation_id": "res_123",
  "service_time": "2026-08-24T20:00:00+02:00",
  "party_size": 4,
  "status": "confirmed",
  "currency": "EUR"
}
```

## Errors (proposed)

```json
{
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Location does not exist or is not accessible.",
    "request_id": "req_example"
  }
}
```

Common codes: `401` unauthorized · `403` forbidden · `404` not found ·
`409` conflict · `422` validation · `429` rate limited · `500` internal.

## Pagination (proposed)

Cursor-based: `?cursor=` + `limit` (default 50, max 200).

## Rate limits (proposed)

Per-tenant and per-key. Exact limits published when the API goes live.
Adapters to *providers* use provider-specific policies, not one global throttle.

## Outbound webhooks (proposed)

Events: `finding.created` · `finding.updated` · `action.created` ·
`action.completed` · `verified_value.created` · `integration.stale`

Signed with a per-endpoint secret. Include `id`, `type`, `created_at`, `data`.
Retry with backoff; consumers must be idempotent on event `id`.

## OpenAPI

See `openapi/radr-v1.yaml`, marked `x-status: proposed` throughout.
