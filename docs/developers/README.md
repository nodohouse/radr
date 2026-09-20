# RADR Developer Documentation

Last updated: 2026-08-24

RADR is an open hospitality intelligence layer. Connect operational and financial
evidence, or build your own adapter.

## Start here

1. [Integration architecture](../platform/INTEGRATION_ARCHITECTURE.md)
2. [API design (proposed)](../platform/API_DESIGN.md)
3. [Normalized data model](../platform/NORMALIZED_DATA_MODEL.md)
4. [Security](../platform/SECURITY.md)
5. [Provider matrix](../platform/PROVIDER_MATRIX.md)
6. Public site: `/developers`

## Sections

| Path | Content |
|------|---------|
| [architecture/](./architecture/) | Ingestion, tenancy, currency, lineage, idempotency |
| [security/](./security/) | Credentials, OAuth, webhooks, secrets |
| [api/](./api/) | Proposed RADR API reference |
| [integrations/](./integrations/) | Provider guides |
| [examples/](./examples/) | TypeScript, Python, webhooks, CSV |

## How to add an integration

See [ADDING_AN_INTEGRATION.md](./ADDING_AN_INTEGRATION.md).

## Honesty rule

Never document commercial endpoints from memory. Confirm official provider docs.
Never commit real API keys. Use placeholders only.
