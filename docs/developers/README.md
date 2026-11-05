# RADR developer documentation

Reviewed: 5 November 2026. RADR is the adaptive decision system for hospitality, above the systems that record the operation.

This documentation separates implemented application paths, local reference code and proposed public interfaces. A provider API listing or logo is not evidence that a RADR connection is live.

## Start with a working example

From a checkout of this repository with dependencies installed:

```sh
npx tsx scripts/demo-reference-ingestion.ts
```

The program calls the local `DemoReservationAdapter`, normalizes two synthetic reservations and prints their statuses and provenance summary. It needs no API key, account, provider access or network calls. It does not persist Findings or Decisions, execute actions or establish customer results. The website quickstart displays this source file directly.

## What exists

| Path | Status and boundary |
| --- | --- |
| Local reference adapter | Implemented synthetic reservations and normalization; local execution only |
| `/api/documents/upload` | Session-authenticated document storage, scoped by organization and upload permission |
| `/api/onboarding/upload` | Session-authenticated contract/invoice CSV intake for onboarding analysis |
| Public `/v1` REST API | Design proposal; no published production handlers or public key issuance |
| Typed RADR SDK | Interface examples only; no published client package is documented |
| Provider webhooks, outbound subscriptions, public MCP | Proposed interfaces; no public delivery or connection endpoint is provided |
| Commercial provider adapters | Check `lib/integrations/registry.ts`; API access and partnership requirements do not establish a shipped RADR adapter |

Hosted account access and storage depend on deployment configuration. A public product demo is not an authenticated workspace.

## File intake contracts

Document storage accepts PDF, JPEG and PNG up to 15 MiB per file, with at most ten files per request. Multipart fields are `file` or `files`, `organizationId`, optional `locationId`, and `documentType`. A successful response records `UPLOADED`; it does not prove extraction, normalization into every domain, a Decision, or Verified Value.

Onboarding intake accepts one UTF-8 CSV up to 1 MiB, with `documentType` set to `CONTRACT` or `INVOICE`. The organization and primary location come from the authenticated workspace. Use the [actual CSV examples](./examples/csv-import.md). Explicit currency and unit are required on every row. XLSX, PDF and arbitrary operating CSV schemas are not supported by this analysis path. Invalid rows are rejected rather than silently partially analyzed.

These are application validation limits. Hosting request limits can be lower. Authentication, authorization, rate limiting, storage and hosting configuration must be checked for a deployment before promising end-to-end upload capacity.

## Read next

1. [Current implementation and boundaries](./CURRENT_IMPLEMENTATION.md)
2. [Adding a provider integration](./ADDING_AN_INTEGRATION.md)
3. [Integration architecture](../platform/INTEGRATION_ARCHITECTURE.md)
4. [Proposed API design](../platform/API_DESIGN.md) and `openapi/radr-v1.yaml`
5. [Normalized data model](../platform/NORMALIZED_DATA_MODEL.md)
6. [Security requirements](../platform/SECURITY.md)

Public documentation: `/developers`, `/developers/quickstart`, `/developers/api`, `/developers/webhooks`, `/developers/connectors`, `/developers/mcp`. The integration catalog is `/developers#integrations`; provider records are `/developers/integrations/:provider`.

## Editorial and implementation rules

- Registry status is the source of truth for availability. Preserve the distinction between provider capability, approval requirements, implemented adapters and actual received data.
- Published code must identify whether it runs in this repository or illustrates a future interface. Never invent an SDK install command or production API host.
- Use stable external IDs, workspace scope, explicit currency and timezone, and provenance. Minimize personal data.
- Do not invent provider URLs, scopes, signature headers, retry schedules or rate limits. Confirm official documentation and permissions during implementation.
- Never commit real credentials or put secrets in `NEXT_PUBLIC_*`.
- Keep expected, observed and verified outcomes separate. Public example data is synthetic.

## Validation

Run the reference example, application typecheck, focused integration/docs tests and developer browser journeys. Public OpenAPI and CSV downloads must match the checked-in contract and validators. A clean browser or style scan does not establish production integration readiness.
