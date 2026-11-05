# Custom connector planning

Website guide: `/developers/connectors`.

Implemented paths are authenticated document upload, scoped onboarding CSV analysis and a local synthetic reservation adapter. Public REST, provider webhooks, SFTP and warehouse connections remain proposed or scoped work, not generic available connectors.

For a new provider, first confirm authorization, source entity IDs, workspace/location mapping, timezone, currency, source update timestamps, backfill/incremental rules, idempotency, retry behavior and evidence receipts. The reservation adapter interface uses `externalId`, `locationExternalId`, `serviceTime`, `partySize`, `status` and provenance fields. These are RADR-side contracts, not guessed provider payload fields.

Confirm official provider documentation before writing endpoint paths, credentials, scopes, rate limits or signature verification. See `../ADDING_AN_INTEGRATION.md` and `../CURRENT_IMPLEMENTATION.md`.
