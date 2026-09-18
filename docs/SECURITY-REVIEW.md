# RADR Security Review

Living table of security findings. Status values: `OPEN` · `FIXED` · `ACCEPTED` · `MITIGATED`.

Last updated: 2026-08-28

| SEVERITY | ISSUE | FILE | ATTACK SCENARIO | FIX | STATUS |
|----------|-------|------|-----------------|-----|--------|
| CRITICAL | Ask RADR trusted client `role` / `allowedLocationIds` | `app/api/ask-radr/route.ts`, `lib/ai/tools.ts` | Attacker POSTs `group_cfo` + `all` locations and escalates demo (or LIVE once wired) | Server forces `location_manager` + demo location scope; LIVE requires session; ignore client privilege claims | MITIGATED |
| CRITICAL | Ask RADR unauthenticated LLM cost abuse | `app/api/ask-radr/route.ts` | Scripted POSTs burn OpenAI quota | Rate limit 30/min/IP; LIVE requires session; key remains server-only | MITIGATED |
| HIGH | Open redirect via login `?next=` | `components/LoginForm.tsx` | `?next=//evil.example` phishing | `safeInternalPath()` relative paths only | FIXED |
| HIGH | Signup account enumeration | `components/SignupForm.tsx` | Probe emails via distinct error text | Neutral error copy | FIXED |
| HIGH | Document DELETE allowed for any MEMBER | `app/api/documents/[id]/route.ts` | Invited member deletes all evidence | OWNER/ADMIN only; opaque 404 | FIXED |
| HIGH | Cross-tenant document probe via 403 vs 404 | `lib/authz.ts`, documents API | Enumerate valid document IDs | Always opaque 404 | FIXED |
| HIGH | Production boot without `BETTER_AUTH_SECRET` | `lib/auth.ts` | Weak/empty signing secret | Throw on missing secret in production | FIXED |
| HIGH | Password reset URLs logged / silent prod fail | `lib/auth.ts` | Token leakage in logs; broken recovery | No prod logs; fail closed without email provider | FIXED |
| HIGH | No API rate limiting | Ask / onboarding / upload | Credential stuffing, storage DoS, LLM burn | In-memory limiter + better-auth rateLimit | MITIGATED |
| HIGH | `/app` ungated demo product | `app/app/layout.tsx` | Confusion with customer product; future data mix | Keep DEMO-only; document; do not set LIVE | ACCEPTED (demo) |
| HIGH | Open self-signup | signup + better-auth | Abuse accounts / spam | Invite-only or disableSignUp before LIVE | OPEN |
| MEDIUM | Client Ask fallback bypassed API | `components/product/ask/AskRadr.tsx` | Offline privilege via `resolveButlerIntelligence` | Removed; show opaque error | FIXED |
| MEDIUM | Forgot-password error leakage | `ForgotPasswordForm.tsx` | Distinct errors reveal accounts | Always same success path | FIXED |
| MEDIUM | Logo low contrast on cream | onboarding / product | Brand illegibility (a11y) | `surface="light"` + CSS overrides | FIXED |
| MEDIUM | Security headers only on middleware matcher | `middleware.ts` | Marketing/API without CSP/HSTS | Global headers in `next.config.ts` | FIXED |
| MEDIUM | Onboarding PATCH any member | `app/api/onboarding/route.ts` | Member flips workspace settings | Structural fields OWNER/ADMIN | FIXED |
| MEDIUM | Cookie-presence middleware only | `middleware.ts` | Expired cookie passes edge | Pages/APIs re-validate (documented) | ACCEPTED |
| MEDIUM | Dual RBAC systems | `lib/platform/rbac.ts` vs membership | Confusion; LIVE mis-binding | Bind Ask LIVE to membership before customer data | OPEN |
| MEDIUM | No MFA / SSO | `lib/auth.ts` | Credential stuffing / shared passwords | better-auth MFA + Google/Microsoft | OPEN |
| MEDIUM | Email verification unused | schema `emailVerified` | Disposable / takeover emails | Enforce before LIVE product | OPEN |
| MEDIUM | In-memory rate limit not multi-instance | `lib/security/rate-limit.ts` | Bypass via many nodes | Redis/Upstash before scale | OPEN |
| MEDIUM | CSP allows unsafe-inline/eval | `lib/security/headers.ts` | XSS impact if injection appears | Nonce-based CSP when feasible | OPEN |
| LOW | Zod field names in some 400s | various APIs | Mild schema disclosure | Prefer opaque bad request | MITIGATED (Ask/onboarding) |
| LOW | Onboarding preview public | `/onboarding/preview*` | UI leak only | Keep for design; no secrets | ACCEPTED |
| LOW | drizzle-kit transitive esbuild advisory | npm audit | Dev-server request risk in kit tooling | Upgrade drizzle-kit carefully (breaking) | OPEN |
| HIGH | `lib/ai/provider.ts` reachable from `/app` client graph | `AskRadr` → `butler/tools` → orchestrate | Client chunk contained `OPENAI_API_KEY` lookup | AskRadr imports `opening` + `types` only; LLM stays server-route | FIXED |

## Manual action required

1. Wire transactional email (Resend/Postmark/SES) and set `EMAIL_PROVIDER_CONFIGURED` only when live.
2. Generate and store production `BETTER_AUTH_SECRET` (`openssl rand -hex 32`) in the host secret store — never in git.
3. Keep preview deployments off production DB / production OpenAI keys where possible.
4. Before LIVE: invite-only signup, MFA/SSO, tenant-bound Ask tools, Redis rate limits, pen-test.
5. Confirm Vercel env separation (Production / Preview / Development).
6. Rotate any secret ever pasted into chat, tickets, or screenshots.

## Verification notes

- No `dangerouslySetInnerHTML` found in app source.
- No `NEXT_PUBLIC_` secrets in `.env.example`.
- Document upload validates extension + magic bytes; private storage paths are org-scoped.
- Ask LLM does not execute SQL; tools are allowlisted.
