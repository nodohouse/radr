# Current implementation and boundaries

Reviewed: 5 November 2026. This is an implementation map, not a promise that all architecture proposals have shipped.

## Local reference path

`lib/integrations/demo/DemoReservationAdapter.ts` implements `ReservationAdapter`. Its context contains a tenant ID and connection ID; the example does not read secrets. `syncReservations()` returns two synthetic records, including a cancellation. `lib/integrations/normalize/reservation.ts` maps statuses and attaches provider, connection, external record ID, source timestamp and ingestion timestamp.

Run `scripts/demo-reference-ingestion.ts` from this repository. The reference location is Soho, New York, with `America/New_York` timezone and USD currency. Fixture service timestamps use the applicable New York offset for their August 2026 date. Normalization does not establish ingestion persistence, Decision creation, provider connectivity or verified financial results.

## Authenticated upload paths

`app/api/documents/upload/route.ts` validates the session, organization upload permission, optional location ownership, file count, extension, MIME and file bytes. It stores private document objects and document records, then writes an audit event. See `lib/constants.ts` and `lib/validation.ts` for authoritative application limits.

`app/api/onboarding/upload/route.ts` scopes the upload to the authenticated workspace. `lib/onboarding/csvUpload.ts` validates UTF-8 contract/invoice CSV, size, currency, unit and numeric formatting before storage. `lib/onboarding/supplierApAnalysis.ts` defines the supported columns and parsing behavior. Document storage and supplier analysis are separate steps.

Both routes return 401 without an authenticated identity. Workspace permission, location membership, rate-limit, format and size checks also apply. Their error response shapes are not the proposed public API envelope. A deployment may impose lower HTTP payload limits. Account enablement and storage must be configured before an authorized user can exercise these routes.

## Provider status

`lib/integrations/registry.ts` is the catalog source. Currently available paths are the reference adapter and file intake. Other states describe plans, development, access requirements or scoped custom work. Provider API support, webhook support and OAuth availability are provider metadata, not a RADR sync receipt.

`lib/integrations/providerDetails.ts` derives descriptions, entity mapping intent and configuration placeholders. These mappings are not verified provider field contracts. `lib/integrations/capabilityStory.ts` describes potential signals, not observed receipt.

Before moving a commercial adapter to Available, confirm provider authorization, read/write scope, tenant mapping, idempotency, backfill and incremental behavior, retries, credential handling, freshness and error receipts. Publish the supported entities and limitations. Do not relabel a static demo health indicator as real sync evidence.

## Proposed public contracts

The public REST host is deliberately `https://api.example.invalid`. `/v1` examples, bearer-key issuance, the typed RADR client, public MCP and webhook delivery are design proposals. No production connection URL, public SDK install command or service-level guarantee is documented.

The checked-in OpenAPI file and its public download are identical. Proposed outbound event names are described in the API design and website webhook page; they remain subject to review before release. No public subscription, signing header, algorithm or delivery schedule should be inferred from an example consumer.

## Public documentation design

The developer shell shares the approved v4 mark, font, sapphire-to-ocean depth gradient, jade actions and pale glass panels with the marketing/product system. Provider logos identify systems and do not imply partnerships. The sticky sidebar, on-page section links, mobile focus containment, code copying, filters and download links are functional documentation controls.

The common availability note remains visible across the hub, reference pages and provider guides. Interface status and implementation boundaries take precedence over decorative diagrams and proposed examples.


## Verification of this documentation pass

The local reference command completed with two normalized synthetic reservations. Sixteen focused integration/contract tests passed, including the published CSV files against the real validator and the public OpenAPI file against its source. Six browser journeys passed for routes and anchors, catalog filtering, mobile focus, clipboard success/failure, downloads, upload authentication and localized shell layouts. Twenty desktop/mobile template states had no detected text intersections, horizontal overflow or Axe WCAG A/AA violations after fixes. The final hub regression check captured no hydration errors. Application typecheck and changed-component lint passed.

Developer translation keys match across all five locales. The repository-wide locale parity command still reports pre-existing gaps in unrelated company, navigation and product namespaces; this pass does not claim those translations are complete. Automated scans do not establish production API or provider readiness.
