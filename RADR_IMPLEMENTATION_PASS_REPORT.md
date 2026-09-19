# RADR Product Implementation Pass — Report

**Date:** 2026-09-09  
**Scope:** Prove one closed operating loop on existing architecture. No redesign. No parallel domain models.

---

## A. Repository audit

| Area | Finding |
|------|---------|
| ORM | Drizzle (`lib/db/schema.ts`): orgs, locations, findings, actions, verifications, reservations, waitlist, suppliers, documents |
| Domain | Zod models in `lib/radr/domain/*` already covered Finding / Action / Verification |
| Loop | `lib/radr/loop.ts` — OBSERVE→LEARN |
| Demo fixture | `canonicalDemo.ts`, scenarios, findings engine, Control Center `/app` |
| Ask RADR | Tool-grounded (`lib/ai`, `lib/radr/butler`); LLM never invents money |
| Production shell | `/(app)/*` honest empties + document upload |
| Auth / tenant | Better Auth + `lib/authz`; document isolation tests exist |

**Verdict:** Architecture was already sound. This pass **extended and normalized**, it did not fork.

---

## B. Architecture decisions

**Reused:** Finding, Action, Verification schemas; scenario store; findings engine; valueSemantics; Ask tools; Control Center; integration registry.

**Extended:** Economic states, attention vocabulary, Action executionMode / shadowMode / payload, action transition gates, capability status registry, Service Period foundation, Verified Work events, connector write honesty, Ask intents for exposure / fix-first.

**Intentionally not built:** POS, full Service Twin, Decision Twin, Hospitality Constitution automation, commercial connectors, autonomous agent framework, DB persistence for demo findings (still DEMO in-memory / fixtures).

---

## C. Database changes

**No new migrations.** Domain tables already existed. Optional Action fields live on the Zod model first; DB jsonb/columns can follow when LIVE write paths land.

New domain files (not tables): `servicePeriod.ts`, `capabilityStatus.ts`, `verifiedWork.ts`, `actions/transitions.ts`.

---

## D. Product changes (by surface)

| Surface | Change |
|---------|--------|
| Finding detail | Loop rail + attention + economic state + PreparedActionCard; recovery money as potential / observed / verified; supplier CTA = “Mark as manually sent (demo)” |
| Supplier / cancel scenarios | Explicit DRAFT_ONLY + MANUAL execution; structured payload on supplier claim |
| Action service | Transition gates; ESTIMATED cannot mint Verified Value |
| Ask RADR | Intents for “fix first” and “currently exposed” |
| Integrations | `supportsWriteActions` / `writeActions` on provider type; demo reservations = read-only |
| Canonical fixture | Sell 420 / 72 / 348 + derived exposure helper |

---

## E. Canonical loop (honest status)

| Stage | Status |
|-------|--------|
| OBSERVE | DEMO — fixture / simulated sources |
| DETECT | DEMO — rule detectors |
| UNDERSTAND | DEMO — explanation + evidence kinds |
| QUANTIFY | DEMO — deterministic calculators |
| PREPARE | DEMO — Prepared Action objects |
| ACT | DEMO — approval + **manual** confirm only; no live connector send |
| VERIFY | DEMO — POS / credit memo evidence in scenarios |
| LEARN | PROTOTYPE — outcome retained; no automatic model update claimed |

---

## F. Financial integrity

- Exposure = €290 LABOR + €118 BUY = **€408**
- Verified Value Table 14 = **€184** (observed), not €192 potential
- Sell net = €420 − €72 = **€348** (opportunity, not exposure)
- Tests: `canonical-demo`, `finished-work-attention`, `product-implementation-pass`

---

## G. Verified Value

`buildVerification` → `min(expected, observed)`. Strength DIRECT / SUPPORTED / ESTIMATED. **ESTIMATED throws** if passed to `verifyOutcome`. UI must not label estimates as Verified Value.

---

## H. Ask RADR

Grounded (fixture): attention / exposure €408, Verified Value €184, Table 14 192≠184, supplier variance, weather €420/€348, fix first.

Still DEMO-scoped to Northstar Berlin for ungated `/app`.

---

## I. Connectors

| Connector | Reality |
|-----------|---------|
| RADR Demo Reservations | Available · **read-only** |
| Files / CSV | Partial · upload live in prod shell |
| Commercial POS / labor / accounting | PLANNED |

---

## J. Security

Tenant isolation tests for documents remain green. Ask DEMO capped to org/location. Action transitions refuse unsupported execution. **Gaps:** demo `/app` ungated; LIVE findings not yet DB-backed; RBAC still partial for product roles.

---

## K. Test results

| Check | Result |
|-------|--------|
| Vitest | **180 passed** (25 files) |
| `tsc --noEmit` | **pass** |
| ESLint | **0 errors** (pre-existing warnings) |
| Production build | **pass** |
| Playwright | **not configured** in repo |

---

## L. Product truth table

| Capability | Status |
|------------|--------|
| Control Center | DEMO |
| Findings engine | DEMO |
| Cancellation recovery loop | DEMO |
| Supplier recovery | DEMO |
| Prepared Actions | DEMO |
| Verified Value | DEMO |
| Verified Work | PROTOTYPE |
| Ask RADR | DEMO |
| Operating Memory | PROTOTYPE |
| Service Period | PROTOTYPE |
| Shadow Mode | PROTOTYPE |
| Data Health | DEMO |
| Commercial connectors | PLANNED |
| Document upload | IMPLEMENTED |
| Auth + onboarding | IMPLEMENTED |

Source: `lib/radr/capabilityStatus.ts`

---

## M. Technical debt

1. Demo findings / actions not persisted to Drizzle rows.
2. Action Zod fields ahead of `actions` table columns (`strength` also missing on `verifications`).
3. `lib/product/demo/catalog.ts` still has legacy signal statuses; “Other findings” on territories still from signal catalog.
4. Marketing homepage uses `$` in places; product canon is **EUR**.
5. Since-last-check still partly narrative for demo seed.
6. Production `/(app)` Control Center equivalent still empty.
7. Territory KPI band now uses `TERRITORY_OPEN` / canonical fixture (fixed 2026-09-09); trading revenue % on SELL/LABOR still from dashboard for context only.

---

## N. Next vertical slice (exactly one)

**Persist the cancellation recovery loop to org-scoped Drizzle rows** (Finding → Action → Verification) behind DEMO/LIVE ports, with the same economics and no fake connector writes. That is the shortest path from “credible demo” to “first customer Verified Value.”
