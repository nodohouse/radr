# RADR Security Status

Honest inventory of security posture. Do not treat marketing claims as implementation.

Last updated: 2026-08-18

## Legend

- **IMPLEMENTED** · exists and is used in production-facing paths
- **PARTIAL** · exists in some surfaces, incomplete coverage
- **NOT IMPLEMENTED** · required for a real multi-tenant product; missing
- **NOT APPLICABLE** · not relevant to current stack/scope

---

| Requirement | Status | Notes |
|---|---|---|
| 1. No secrets/API keys in client bundles | **PARTIAL** | Public env only (`NEXT_PUBLIC_*`). Audit before each release. |
| 2. Search git history for accidental secrets | **PARTIAL** | Manual / tooling recommended; not automated in CI yet. |
| 3. Env vars correctly separated | **PARTIAL** | Auth/DB use server env; verify `.env*` not committed. |
| 4. Server-side authentication | **PARTIAL** | `better-auth` protects `(app)` routes via middleware (`/home`, `/cases`, …). **`/app` Control Center prototype is NOT gated.** |
| 5. Server-side authorization | **PARTIAL** | Session helpers exist for auth product; `/app` is client demo store. |
| 6. Organization / tenant isolation | **PARTIAL** | Intended in auth product; not enforced on `/app` demo. |
| 7. Row-level security | **NOT IMPLEMENTED** | Depends on DB policies when product data is server-backed. |
| 8. IDOR / cross-org resource access | **NOT IMPLEMENTED** for `/app` | Demo IDs are public client state. |
| 9. Sensitive fields resistant to client tampering | **NOT IMPLEMENTED** for `/app` | Client can mutate demo store. |
| 10. Secure session cookies | **IMPLEMENTED** | better-auth session cookies on auth paths. |
| 11. Passwords via proper auth provider | **IMPLEMENTED** | better-auth email/password. |
| 12. Login rate limiting | **NOT IMPLEMENTED** | Provider/infra level needed. |
| 13. Abuse / bot protection | **NOT IMPLEMENTED** | |
| 14. Parameterized DB queries | **PARTIAL** | Drizzle ORM when used; audit all raw SQL. |
| 15. Validate inputs server-side | **PARTIAL** | Auth forms; `/app` has no server mutations. |
| 16. Safe render of user content | **PARTIAL** | Prefer text nodes; review any `dangerouslySetInnerHTML`. |
| 17. Restrict file upload type/size | **PARTIAL** | Demo upload is simulated; real upload path must enforce. |
| 18. Never trust MIME alone | **NOT IMPLEMENTED** | Required when uploads go live. |
| 19. Minimize sensitive API fields | **PARTIAL** | Review API responses as they ship. |
| 20. Security headers | **PARTIAL** | Next defaults; harden CSP/HSTS in production config. |
| 21. HTTPS in production | **IMPLEMENTED** | Hosting (Vercel) terminates TLS. |
| 22. Dependency audit | **PARTIAL** | `npm audit` reports known Next/postcss/sharp issues; track upgrades; do not force-major blindly. |
| 23. CSRF protection | **PARTIAL** | Auth framework patterns; verify for custom POSTs. |
| 24. CORS deliberately configured | **PARTIAL** | Mostly same-origin Next app. |
| 25. Errors hide stack/secrets | **PARTIAL** | Ensure production error boundaries; no debug in client. |
| 26. Logs exclude credentials/tokens | **PARTIAL** | Policy + review. |
| 27. File access requires authorization | **PARTIAL** | Auth product intent; demo evidence is local mock names. |
| 28. No public sensitive document URLs | **PARTIAL** | Do not ship unsigned public object URLs. |
| 29. Production / demo separation | **PARTIAL** | Demo labeling improved; `/app` still open without auth. |
| 30. Destructive ops require authorization | **NOT IMPLEMENTED** for `/app` | |

---

## Critical honesty

1. **`/app` is a vision prototype**: client-side demo data, not a secured tenant product.
2. **Do not claim SOC 2 / ISO / GDPR certification** on marketing until independently true.
3. **Settings previously marked org isolation / server auth as LIVE for `/app`**: corrected to reflect CLIENT DEMO / NOT ENFORCED.

## Immediate next security work

1. Gate `/app` behind session **or** keep it explicitly public demo with persistent DEMO chrome.
2. Add CI `npm audit` + secret scanning.
3. Harden security headers (CSP, Referrer-Policy, Permissions-Policy).
4. Server-backed signals/controls with org-scoped queries before any real customer data.
