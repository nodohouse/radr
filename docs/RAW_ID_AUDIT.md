# RAW ID AUDIT

**Date:** 2026-09-30 · Wave A6

## Rule

User-facing text must never show `loc_*`, `dec_*`, `dash_*`, `org_*`.

## Display helpers

- Locations → `locationDisplayName` / seed `displayName`
- Decisions → `displayDecisionId` (D-####)
- Dashboards → dashboard `name`

## Allowed

- Route paths and `href` values (e.g. `/app/decisions/dec_peak_berlin`)
- `data-*` attributes
- Internal store keys

## Automated

- `tests/p0-release-invariants.test.ts` — display helpers
- `tests/customer-copy-hygiene.test.ts` — displayId guards
- E2E matrix smoke scans visible text (Wave D)

## Residual

Internal onClick handlers may pass Decision IDs — must not render as visible text.
