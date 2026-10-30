# Public link audit

**Updated:** 2026-09-24 (final freeze pass)  
**Scope:** Public `/en/**` must not open authenticated `/app/**` without signup.  
**Companion:** `docs/PUBLIC_INTERACTION_AUDIT.md` · `docs/WEBSITE_RELEASE_AUDIT.md`

## Method

1. Static scan of `components/marketing/**` + `components/developers/**` + `lib/marketing/**` for `/app` hrefs.
2. Middleware: `/app/**` always requires session → redirect signup (`intent=demo`).
3. Playwright crawl (`scripts/public-interaction-crawl.mjs`) — 1130 interactive rows, **0 app leaks**.

## Auth probes

| Request | Expected | Status |
|---|---|---|
| `GET /app` | → `/en/signup?intent=demo&next=/app/enter` | PASS |
| `GET /app/decisions/dec_peak_berlin` | → signup with safe `next` | PASS |
| `GET /app/lab/control-center` | → signup | PASS |
| `GET /app/memory` | → signup | PASS |
| `GET /app/connections` | → signup | PASS |
| `GET /app/enter` | → signup | PASS |

## Canonical CTAs

| CTA | Destination | Status |
|---|---|---|
| See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| Compare Futures | `/en/product/futures?example=D-1911` | PASS |
| See a Verified Recovery | `/en/product/value` | PASS |
| Developers See RADR | signup demo gate | PASS (was `/app`) |
| Start recovery pilot | `/en/contact?intent=recovery-pilot` | PASS |

## Formerly failing public → /app links (fixed)

| Surface | Was | Now |
|---|---|---|
| Hero primary CTA | `/app?stay=1` | signup demo |
| Hero Decision card | `/app/decisions/…` | non-clickable |
| Hero Compare Futures | `/app/decisions/…` | `/product/futures?example=D-1911` |
| Nav “See a Verified Recovery” | `/app/lab/control-center?seed=recover` | `/product/value` |
| Developers top CTA | `/app` | signup demo |
| Restaurants / Hotels CTA | `/app?stay=1` | signup |
| Control Center chapter | `/app` | signup |
| Product ask / forecast chapters | `/app` | signup |

## `next` security

`safeDemoNext` / `safeInternalPath` reject external hosts, protocol-relative URLs, and non-product paths. Signup `next` may only land on `/app/**`, `/onboarding/**`, `/select-org/**`.

## Robots

`/app/**` responses set `X-Robots-Tag: noindex, nofollow`.

## Notes

- Product surfaces (`components/product/**`) correctly continue to use `/app` links — gated by auth.
- After signup, `/app/enter` offers Restaurant group / Hotel group example choice before Control Center.
