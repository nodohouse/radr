# AUTH ONBOARDING SETTINGS AUDIT

**Date:** 2026-09-23  
**Slice:** Phases A–E  
**Base:** local vitest + code review  

## Gate

**Open P0: 0 · Open P1: 0**

## Flows tested

| Flow | Result | Notes |
|------|--------|-------|
| IdentityProvider returns null without session | PASS | Contract + authz requireAuthIdentity |
| System role permission matrix | PASS | `tests/auth-tenancy.test.ts` |
| Legacy OWNER/ADMIN/MEMBER → roleId | PASS | Migration + `legacyRoleToRoleId` |
| Location scope filter / bypass attempt | PASS | Hostile IDs filtered to org set |
| Invite token hash (no raw storage) | PASS | SHA-256 |
| Invite revoke status | PASS | DB status `revoked` |
| Onboarding progress vs settings separation | PASS | Engine progress helpers |
| Org slug generation | PASS | `slugifyOrgName` |
| Document tenant isolation (existing) | PASS | `tests/tenant-isolation.test.ts` (schema updated) |
| LIVE `/app` middleware gate | PASS (code) | Cookie required when env LIVE/SANDBOX or REQUIRE_AUTH |
| DEMO `/app` remains public | PASS (code) | Default env |

## Roles / permissions exercised

owner, admin, gm, revenue, viewer — invite / approve / document permissions via catalog unit tests.

## Settings mapping

Bindings exist for organization + location profile keys (see SETTINGS_SCHEMA_MAP). Full Settings UI **not** in this slice — deferred by design.

## Security issues

None open at P0/P1.

| ID | Severity | Status | Detail |
|----|----------|--------|--------|
| — | — | — | — |

## UX issues

| ID | Severity | Status | Detail |
|----|----------|--------|--------|
| UX-1 | P2 | Open | Multi-org selector is minimal; polish later |
| UX-2 | P3 | Open | Login brand line still “Nothing off the RADR.” — acceptable |

## Responsive

Invite accept + select-org use LightAuthShell — usable on mobile. Not full device matrix this slice.

## Explicitly not tested (deferred)

WorkOS SSO · SCIM · MFA enforcement · full adaptive onboarding UI · Settings editors · Decisions persistence tenancy

## Next audit trigger

After Decisions persistence lands — re-run tenant isolation against Decision APIs.
