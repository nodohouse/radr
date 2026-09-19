# RADR Security Architecture

RADR will process sensitive hospitality operational and financial data.
This document describes the **current** security architecture, controls, and
honest limitations. Nothing here claims the product is “hacker proof.”

Related:

- Live findings table → [`SECURITY-REVIEW.md`](./SECURITY-REVIEW.md)
- Integration / connector posture → [`../docs/platform/SECURITY.md`](../docs/platform/SECURITY.md)
- Historical checklist → [`../SECURITY_TODO.md`](../SECURITY_TODO.md)

---

## Authentication architecture

| Item | Current state |
|------|----------------|
| Provider | **better-auth** (`lib/auth.ts`) |
| Adapter | Drizzle → Postgres / PGlite (`user`, `session`, `account`, `verification`) |
| Password hashing | better-auth **scrypt** (not custom crypto) |
| Min password length | 10 |
| Session model | Server-side DB sessions + HttpOnly cookies |
| Session lifetime | 7 days; sliding update every 24h |
| Cookie cache | 5 minutes (signed); revocation may lag until expiry |
| Cookie flags (prod) | HttpOnly, Secure, SameSite=Lax |
| Magic links | Not implemented |
| Google / Microsoft SSO | Not implemented (UI placeholders only) |
| MFA / WebAuthn | Not implemented — architect for IdP MFA before customer LIVE |
| Email verification | Schema field exists; not enforced |
| Password reset email | Dev logs URL; production fails closed unless email provider is wired |

**Do not invent a second auth system.** Prefer better-auth plugins for SSO, MFA, and organizations/invites.

### Routes

| Surface | Path |
|---------|------|
| Login / signup / recovery UI | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| Auth API | `/api/auth/*` |
| Logout | `authClient.signOut()` → clears server session |

### Account enumeration

Login, signup, and password-reset UIs use **neutral** messaging.
Do not reveal whether an email exists, which IdP is used, or tenant names
before authentication.

### Open redirects

Post-login `?next=` is sanitized via `lib/security/safe-redirect.ts`
(relative same-origin paths only).

---

## Authorization model

| Layer | Mechanism |
|-------|-----------|
| Session | `auth.api.getSession` / `requireSession` |
| Tenant membership | `organization_members` (`OWNER` \| `ADMIN` \| `MEMBER`) |
| Helpers | `lib/authz.ts` — never trust browser-supplied org IDs alone |
| Document access | Load document → membership on **document’s** organization |
| Document delete | OWNER / ADMIN only |
| Onboarding structural PATCH | OWNER / ADMIN; soft UI flags any member |
| Product RBAC (`lib/platform/rbac.ts`) | Demo / Ask tools — **not** yet bound to DB membership for LIVE |

### Planned roles (product)

OWNER · ADMIN · FINANCE · OPERATIONS · LOCATION_MANAGER · VIEWER

Granular permissions are not fully implemented. UI hiding is **not** authorization.

---

## Tenant isolation

1. Authenticate user (session).
2. Resolve membership server-side.
3. Authorize resource against membership organization (and location where applicable).
4. Return data or opaque `404`.

**Never** trust `organizationId` / `locationId` / `findingId` from the client
without a membership check.

Demo Control Center (`/app`) uses synthetic Northstar data and is **not** the
customer data plane. LIVE must bind tools to the user’s real organization.

---

## Session handling

- Prefer cookies over `localStorage` for credentials (current design).
- Logout must call server `signOut` (not only clear client state).
- After security-sensitive account changes (password reset), better-auth should
  invalidate other sessions when that capability is configured — verify when
  enabling MFA / SSO.
- Middleware checks cookie **presence** for UX redirects only. APIs and
  `(app)` layouts re-validate sessions.

---

## Secrets management

| Rule | Detail |
|------|--------|
| Never commit secrets | `.env*` gitignored; only `.env.example` |
| Never use `NEXT_PUBLIC_` for secrets | Public: app URL, `RADR_ENV`, social links only |
| `OPENAI_API_KEY` | Server-only; Ask RADR browser → RADR API → LLM |
| `BETTER_AUTH_SECRET` | Required in production (boot fails if missing) |
| Integration tokens | Must remain server-side (proposed encryption key in `.env.example`) |

---

## Integration token handling

User-facing OAuth (Google/Microsoft) and connector OAuth (SevenRooms, Toast, …)
must:

- validate `state`
- use PKCE where applicable
- validate redirect URIs / issuer / audience
- store tokens server-side only

Not shipped yet — see platform security docs.

---

## Encryption assumptions

- TLS terminated at the edge (Vercel / reverse proxy). HSTS set in production
  via Next headers.
- Database connections should use TLS in production (`DATABASE_URL` with SSL).
- At-rest encryption for object storage depends on the S3/R2 provider.
- Field-level encryption for integration credentials is **planned**, not live.

---

## Logging policy

**Never log:** passwords, password hashes, reset tokens, magic links, session
tokens, OAuth tokens, `Authorization` headers, cookies, API keys.

Production client errors are opaque (`We couldn't complete that request.`) with
optional correlation IDs. Stack traces stay server-side.

---

## Audit events

`writeAuditLog` records important actions (e.g. document delete/upload) with:

actor · action · resource · timestamp · organization

Extend for: login, integration connect/disconnect, role changes, API key
lifecycle, exports, financial action approval.

Do not store secret payloads in audit metadata.

---

## AI security model (Ask RADR)

```
authenticated context (when LIVE)
  → server builds tool auth (ignore client role claims)
  → allowlisted tools only
  → structured results
  → optional LLM for intent / tool pick
  → compose answer (numbers from tools only)
```

- LLM must **never** generate executable SQL against production.
- Integration free-text is **data**, not instructions (prompt-injection resistant design).
- Financial actions: separate READ / RECOMMEND / PREPARE / EXECUTE; AI starts at READ.
- Unauthenticated DEMO Ask is rate-limited and privilege-capped to
  `location_manager` + a single demo location.

---

## Data retention & privacy

Architect for: export, deletion, account deletion, retention policies,
integration disconnect, access requests.

Minimize ingestion from reservations (prefer operational fields over guest PII).

---

## Rate limiting

In-process limiter (`lib/security/rate-limit.ts`) on Ask RADR, onboarding,
uploads. better-auth enables its own rate limits. Production at scale should
add Redis/Upstash + edge WAF — current limiter is single-node defense-in-depth.

---

## Security headers

Global via `next.config.ts` → `lib/security/headers.ts`:

- Content-Security-Policy (App Router compatible; tighten with nonces later)
- Strict-Transport-Security (production)
- X-Content-Type-Options
- Referrer-Policy
- X-Frame-Options / frame-ancestors
- Permissions-Policy

---

## CSRF

SameSite=Lax cookies + same-origin fetches. State-changing APIs require
session cookies. Do not assume SameSite alone is enough for every threat
model — add CSRF tokens if cross-site form posts are introduced.

---

## Incident-response basics

1. Rotate `BETTER_AUTH_SECRET`, DB credentials, storage keys, OpenAI key.
2. Invalidate sessions (clear `session` table / force re-login).
3. Review audit logs for affected organization(s).
4. Notify affected customers per contract / GDPR timelines.
5. Document timeline and remediations in `docs/SECURITY-REVIEW.md`.

**Security contact:** security@radrup.com (placeholder until mailbox live)

---

## Known limitations (do not hide)

1. `/app` demo Control Center is ungated — synthetic data only; not for LIVE customers.
2. Ask RADR LIVE does not yet bind tools to real tenant datasets (demo adapters).
3. Password reset email provider not wired — production recovery fails closed.
4. No MFA / SSO / email verification yet.
5. Open self-signup (no invite gate).
6. Product RBAC roles ≠ DB membership roles (two systems).
7. In-memory rate limits do not span multiple instances.
8. CSP still allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js compatibility.
9. Onboarding preview routes are intentionally public for design review.
10. No formal penetration test completed.

---

## Safe before public demo?

**Yes, with constraints:** keep `NEXT_PUBLIC_RADR_ENV=DEMO`, do not load customer
data, keep Ask throttled, label DEMO chrome, do not enable LIVE.

## Safe before real customer data?

**No.** Require: MFA/SSO path, email verification or invite-only signup,
tenant-bound Ask tools, production email for recovery, Redis rate limits,
penetration review, backup/encryption verification, and closing CRITICAL/HIGH
items in `SECURITY-REVIEW.md`.
