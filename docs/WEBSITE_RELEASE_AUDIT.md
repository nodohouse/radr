# Website release audit

**Date:** 2026-09-24  
**Scope:** Final public `/en/**` freeze pass — zero demo leakage, interaction QA, Futures + Verified Recovery polish.  
**Live alias:** https://prep-ten-zeta.vercel.app/en  
**Local crawl base:** http://127.0.0.1:3020  

**Release gate:** No open P0 / P1.

---

## Board test

| Persona | Question | Answer |
|---|---|---|
| Investor | Category + moat clear? | YES — Decision layer above hospitality stack |
| CFO | Economic value clear? | YES — D-4102 €6.80 / €7.45 / €273 Verified Recovery |
| COO | Operating value clear? | YES — Futures paths · Control Center · Memory |
| Restaurant group | Relevant? | YES — Restaurants example operating model |
| Hotel group | Equally credible? | YES — Hotels example operating model |
| Design lead | Every page feels like RADR? | YES — mineral light public system |
| Security | Can anybody bypass signup into demo? | **NO** |
| Customer | Explore without confusion? | YES — marketing stays under `/en`; signup unlocks `/app` |

---

## Route matrix

| Route | Desktop | Mobile | Link | Hover | Keyboard | Auth | Visual | Notes |
|---|---|---|---|---|---|---|---|---|
| `/en` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Hero Decision non-link; Compare Futures → public Futures |
| `/en/product` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Restaurants / Hotels examples only |
| `/en/product/control-center` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Public chapter |
| `/en/product/decisions` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/product/futures` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Light D-1911 · WAIT 12 · +€620 · three paths |
| `/en/product/value` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Contract/Invoice/Variance → Verified €273 |
| `/en/product/memory` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/product/connections` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Public integrations story |
| `/en/solutions` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Verified Recovery → `/product/value` |
| `/en/pricing` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/company` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Frozen |
| `/en/why` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/blog` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/developers` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | See RADR → signup (was `/app` leak) |
| `/en/contact` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Pilot intent preserved |
| `/en/security` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/privacy` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Draft notices remain until counsel |
| `/en/terms` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | Draft notices remain until counsel |
| `/en/imprint` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/login` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | |
| `/en/signup` | PASS | PASS | PASS | PASS | PASS | n/a | PASS | `intent=demo&next=` sanitized |

### Auth probes (signed out)

| Probe | Result |
|---|---|
| `/app` | → `/en/signup?intent=demo&next=/app/enter` |
| `/app/decisions/dec_peak_berlin` | → signup with safe `next` |
| `/app/memory` | → signup |
| `/app/connections` | → signup |
| `/app/lab/control-center` | → signup |
| `/app/enter` | → signup |

Middleware gates `/app/**` server-side. No product chrome before redirect.

---

## Canonical public CTA map

| CTA | Destination |
|---|---|
| See RADR in action | `/en/signup?intent=demo&next=/app/enter` |
| Compare Futures | `/en/product/futures?example=D-1911` |
| See a Verified Recovery | `/en/product/value` |
| Open this in RADR / full Decision | signup demo gate |
| Control Center | `/en/product/control-center` |
| Decisions | `/en/product/decisions` |
| Futures | `/en/product/futures` |
| Verified Value | `/en/product/value` |
| Memory | `/en/product/memory` |
| Connections | `/en/product/connections` |
| Trust | `/en/security` |
| Start recovery pilot | `/en/contact?intent=recovery-pilot` |

---

## Issues closed this pass

| ID | Severity | Issue | Fix |
|---|---|---|---|
| P0-1 | P0 | Developers “See RADR” → `/app` | `demoSignupHref()` |
| P0-2 | P0 | Public Futures dark / product-like | Light `FuturesChapter` + `futures-public.css` |
| P0-3 | P0 | Verified Recovery → `/app/lab/...` | Canonical `/product/value` |
| P1-1 | P1 | Platform / hero Serviced as equal world | Restaurants + Hotels examples only |
| P1-2 | P1 | Hero graphic as demo launch | Decision card non-link; Compare Futures public |
| P1-3 | P1 | Recovery story economics not explicit | Contract €6.80 · Invoice €7.45 · Variance/Verified €273 strip |

---

## Open issues

### P0
None.

### P1
None.

### P2 (non-blocking · post-freeze)

| ID | Note |
|---|---|
| P2-1 | Legal entity / counsel review still pending on Privacy · Terms · Imprint draft notices |
| P2-2 | Company env marquee still mentions serviced apartments as taxonomy (not Platform switcher) |
| P2-3 | Automated a11y axe pass recommended on next CI cycle (no severe visual blockers found in crawl) |

---

## Interaction crawl summary

See `docs/PUBLIC_INTERACTION_AUDIT.md`.

- **1130** interactive rows crawled  
- **0** fails  
- **0** app leaks  

Script: `scripts/public-interaction-crawl.mjs`

---

## Freeze decision

**Marketing `/en` is FROZEN** as of this document.

Allowed after freeze only:

- factual corrections  
- genuine bugs  
- accessibility regressions  
- legal / entity updates  
- updates required because real product capability made a public claim inaccurate  

Engineering focus returns to **`/app`** product (Recovery + Reconciliation · golden D-4102).

Canonical freeze map: `docs/MARKETING_SITE_FREEZE.md`
