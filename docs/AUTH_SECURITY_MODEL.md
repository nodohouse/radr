# AUTH SECURITY MODEL

**Status:** Phases A–E foundation (2026-09-23)  
**Auth provider:** better-auth + Drizzle (kept). WorkOS AuthKit is a future IdentityProvider adapter — not built in this slice.

## Boundaries

| Layer | Owns | Does not own |
|-------|------|----------------|
| **IdentityProvider** (`lib/identity/provider.ts`) | Authenticated user identity (`userId`, `email`, `emailVerified`) | Orgs, roles, permissions, invites |
| **better-auth** (`lib/auth.ts`) | Passwords, sessions, cookies, verification tokens | RADR RBAC |
| **RADR domain** (`lib/authz.ts`, `lib/platform/rbac.ts`, tenancy tables) | Organizations, memberships, roles, permissions, location scope, invites, auth policy stubs, audit | Credential storage |

Domain code must not import better-auth session types. Use `getAuthIdentity` / `requireAuthIdentity`.

Future WorkOS: implement `IdentityProvider` in a new adapter; leave Settings, Onboarding, RBAC, Decisions unchanged.

## Tenant isolation

Every protected API:

1. Resolve `AuthIdentity` (or 401)
2. Resolve membership for the resource’s `organizationId` (or opaque 404/403)
3. Check **permission** (`resource.action`) — never `if (role === "CFO")`
4. If location-scoped: intersect `location_access` with the resource location

Cross-tenant object IDs must not leak existence (prefer 404).

## Roles & permissions

System roles seeded: `owner`, `admin`, `cfo`, `coo`, `gm`, `revenue`, `fnb`, `finance`, `operations`, `it`, `viewer`.

Permissions include: `decision.read|approve|execute`, `verified_value.read`, `settings.edit`, `user.invite|manage`, `location.read|edit`, `integration.manage`, `security.manage`, `developer.manage`, `document.upload|read`, `org.admin`, `audit.read`, `butler.use`.

Catalog SSOT: `lib/platform/rbac.ts`. DB `roles` / `role_permissions` support future custom roles; runtime system checks use the catalog via `roleId`.

## Location scope

`location_access` per membership:

- `all` — every location in the org
- `group` — locations in a `location_groups` row
- `locations` — explicit ID list (filtered to org)

## Invitations

- Token: random; **SHA-256 hash** stored; raw token returned once
- Expire (14 days), revoke, email bind
- Accept requires authenticated email match
- Creating invites requires `user.invite`; inviting `owner` requires actor `owner`

## Authentication policy stub

`authentication_policies` per org: `mfaRequired`, `ssoEnforced`, `allowedDomains`.

Columns only — no MFA/SSO enforcement wired. Do not claim SSO is active.

## `/app` gate

| `NEXT_PUBLIC_RADR_ENV` | `/app` |
|------------------------|--------|
| `DEMO` (default) | Public Northstar demo |
| `LIVE` / `SANDBOX` | Session cookie required |
| Any + `NEXT_PUBLIC_RADR_REQUIRE_AUTH=true` | Session required |

Cookie presence ≠ authorization. APIs still call `requirePermission`.

## Sessions

Managed by better-auth (7-day expiry, secure cookies in prod). Org selection: `radr-org-id` httpOnly cookie validated against membership.

## Audit

Expanded actions: invitation lifecycle, membership role changes, location access, auth policy, session revoke (stub). Never log tokens, passwords, or file bytes.

## Threat boundaries (this slice)

In scope: tenant isolation, permission checks, invite misuse, location scope bypass, role escalation to owner.

Out of scope until later: WorkOS SSO/SCIM, MFA enforcement, Decisions table tenancy (next slice), full Settings UI.

## Handoff

Next product priority: **Decisions persistence** — tenant-scoped via this authz foundation.
