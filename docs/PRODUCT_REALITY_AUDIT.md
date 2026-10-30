# PRODUCT_REALITY_AUDIT

**Date:** 2026-09-20  
**Phase:** 0 — Repository / product reality audit  
**Scope:** Authenticated product paths (`app/app/**`, `app/(app)/**`, `lib/product`, `lib/radr`, auth, `lib/db`, integrations). Marketing excluded except shared canon.  
**Status vocabulary:** REAL · PARTIAL · DEMO · EXPERIMENTAL · REMOVE_ARCHIVE  

This document is the handoff from **website mode → actual product mode**.  
It supersedes stale claims in `docs/RADR_PRODUCT_REALITY_AUDIT.md` (2026-08-28).

---

## Executive summary

1. **Primary product UI is `/app`** — public by default (`NEXT_PUBLIC_RADR_ENV=DEMO`). Polished Decision cockpit on **in-memory** Northstar / canon data.
2. **Auth, organizations, memberships, locations, and document upload APIs are REAL** — but largely **disconnected** from `/app` Decisions, Findings, and integrations UI.
3. **There is no `decisions` table.** Decision Records live in `lib/radr/decision/store.ts` (process memory). Approve / verify does not survive restart.
4. **Drizzle tables exist for findings / actions / verifications / reservations / waitlist** — **no application writers/readers** use them today. Schema implies false readiness.
5. **`app/(app)/*` is redirect-only** into `/app` — not a separate honest production shell anymore.
6. **Integrations page shows fake CONNECTED providers** while `lib/integrations/registry.ts` correctly marks almost everything planned / partner — **credibility risk**.
7. **D-4102 canon exists and is sealed** (`CANON_SUPPLIER`, €273). A **parallel €118 supplier Finding scenario** must not be confused with it.
8. **Next milestone is not another screen.** It is: persist Decisions + wire file ingest → Finding → Decision → Action → Outcome → Verified Value for Supplier/AP variance.

---

## Architecture (current)

| Layer | Path | Auth | Reality |
|-------|------|------|---------|
| Demo product | `/app/*` | **Public** (not in middleware protected prefixes) | Primary UX; synthetic portfolio |
| Lab UX | `/app/lab/*` | Public | Experimental; suppresses SaaS chrome |
| Legacy shell | `/home`, `/cases`, `/money`, `/sources`, `/documents`, `/controls`, `/scan` | Cookie-gated then redirect | **Redirects only** → `/app/*` |
| Onboarding | `/onboarding` | Session required | Creates real org + location → `/app?welcome=1` |
| APIs | `/api/auth`, `/api/onboarding`, `/api/documents/*`, `/api/ask-radr` | Mixed | Only real persistence paths besides auth |

Env model: `lib/radr/env.ts` — `DEMO` (default) · `SANDBOX` · `LIVE`.

---

## Auth & tenancy

| Piece | Class | Evidence |
|-------|-------|----------|
| Email/password + sessions | **REAL** | `lib/auth.ts` (better-auth + drizzle user/session/account) |
| Password reset email | **PARTIAL** | Dev logs URL; production provider incomplete |
| Organization + membership | **REAL** | `organizations`, `organizationMembers` (`OWNER`/`ADMIN`/`MEMBER`); `lib/onboarding.ts` |
| Location rows | **REAL** | Created at onboarding |
| Upload authorization | **REAL** (API) | `lib/authz.ts` + `app/api/documents/upload/route.ts` |
| Product role lenses (CFO/GM) | **DEMO** | Demo personas in client store — not membership-enforced |
| `/app` session gate | **DEMO** | Middleware does not require auth for `/app` |
| Tenant-scoped Decision queries | **NOT IMPLEMENTED** | No Decision persistence |

**Blocker for pilots:** tenant isolation tests + server-side Decision authorization do not exist yet.

Minimum roles from the master brief (OWNER/ADMIN, GROUP_CFO, GROUP_OPERATIONS, REGIONAL_MANAGER, GENERAL_MANAGER, FINANCE, VIEWER) are **not** modeled — only OWNER/ADMIN/MEMBER today.

---

## Data model / persistence

| Object | DB | Used by product? |
|--------|----|------------------|
| User / session | yes | Auth |
| Organization / member / location | yes | Onboarding + upload authz |
| Documents | yes | Upload/delete API; **UploadPanel orphaned** (no mounted `/app` Sources UI) |
| Audit logs | yes | Onboarding + document events |
| Findings / actions / verifications | schema only | **Unused** |
| Reservations / waitlist | schema only | **Unused** |
| **Decisions** | **no table** | In-memory `DecisionStore` + canon builders |

---

## Surface-by-surface audit

| Route | Data source | Persisted? | Real actions? | Real integrations? | Auth/RBAC? | Class | Survive Recovery Pilot? |
|-------|-------------|------------|---------------|--------------------|------------|-------|-------------------------|
| `/app` Control Center | `decision/store` + product store | No | In-memory approve | No | No | **DEMO** | **Yes** — attention cockpit pattern |
| `/app/decisions` | store | No | No | No | No | **DEMO** | **Yes** |
| `/app/decisions/[id]` | store / builders | No | In-memory approve/verify | No | No | **DEMO** | **Yes** — esp. D-4102 |
| `/app/value` | store aggregates | No | No | No | No | **DEMO** | **Yes** — Verified Value UI |
| `/app/memory` | MemoryService + store | No | No | No | No | **DEMO** | Pattern only |
| `/app/ask` | `/api/ask-radr` + demo tools | No | Optional LLM; no tenant writes | No | Public in DEMO | **PARTIAL** | Later (Butler late) |
| `/app/integrations` | Fake CONNECTED list | No | No | **Misleading** | No | **DEMO** | **Replace** — use registry honesty |
| `/app/locations*` | Demo org / dashboard | No | No | No | No | **DEMO** | Rebuild on real locations |
| `/app/settings` | Demo personas | localStorage prefs | No | No | No | **DEMO** | Partial |
| `/app/service`, `/app/intelligence/*`, `/app/forecast`, `/app/compare`, `/app/calibration`, `/app/shift/*`, `/app/checks*`, `/app/glossary`, `/app/finance`, `/app/m` | Fixtures | No | No | No | No | **DEMO** / **EXPERIMENTAL** | **No** for MVP critical path |
| `/app/controls*` | Findings engine + client store | Client only | Client resolve | No | No | **DEMO** | Partial (attention UX) |
| `/app/findings/[id]` | Scenario stores incl. **€118 supplier** | No | Scenario phases | No | No | **DEMO** | **Quarantine** vs D-4102 |
| `/app/buy|labor|sell|recover|data|signals*|team|performance` | Redirects | — | — | — | — | **REMOVE_ARCHIVE** | Keep thin redirects |
| `/app/lab/*` | Lab modules + canon | No | Lab-local | No | No | **EXPERIMENTAL** | **Yes** recover seed / D-4102 storyboard |
| `/onboarding` | DB org/location/member | **Yes** | Creates tenant | No | **Yes** | **REAL** | **Yes** |
| `/api/documents/*` | Storage + DB | **Yes** | File + row | files-csv path | **Yes** | **PARTIAL** | **Yes** — remount UI for ingest |
| `app/(app)/*` | Redirects | — | — | — | Cookie then demo | **REMOVE_ARCHIVE** | Thin redirects OK |

---

## KEEP / REUSE (for real D-4102 slice)

1. **Decision Record model + store API shape** — `lib/radr/decision/{core,record,lifecycle,store,ids}.ts` + `DecisionRecordView`
2. **CANON_SUPPLIER / D-4102** — `lib/radr/decision/demo/canonical.ts`, portfolio builder, sealed economics (€6.80 / €7.45 / 420 L / €273)
3. **Control Center attention bands** — needs you / handling / watching / verified
4. **Auth + org + location + membership** — `lib/auth.ts`, `lib/authz.ts`, `lib/onboarding.ts`
5. **Document upload/storage** — `app/api/documents/*`, `lib/storage.ts` (re-wire product UI)
6. **Integration registry** — `lib/integrations/registry.ts` as SSOT (kill fake CONNECTED UI)
7. **Lab recover seed** — D-4102 modules as storyboard for the real loop
8. **Supplier variance algorithm** — `detectSupplierPriceVariance` (retarget to D-4102 math / persisted objects)
9. **Marketing Trace structure** — evidence → calculation → baseline → futures → action → verification (rebuild on domain services, not hardcoded copy)

---

## ARCHIVE / DEMOTE

1. Dual supplier Finding path (`lib/radr/scenarios/supplierVariance.ts` €118) for pilot demos — quarantine or delete
2. Fake integrations CONNECTED list as product truth
3. Unused drizzle implication that Findings lifecycle is live — either wire or document as unused
4. Orphan `UploadPanel` until remounted on auth-gated Sources / Data Health
5. Non-pilot surfaces: Service Map, menu intelligence, forecast hard-wire, checks catalog, multi-vertical floor maps
6. Stale `docs/RADR_PRODUCT_REALITY_AUDIT.md` dual-shell narrative

---

## Demo mode vs real mode (required separation)

| Mode | Purpose | Rule |
|------|---------|------|
| **DEMO** | Public `/app` seeded via same domain services | Labeled; no customer secrets |
| **PILOT / LIVE** | Auth-gated org data | Persisted Decisions; registry-honest integrations |

Best demo = real product + seeded org. Do **not** maintain a forever-separate fake frontend architecture.

---

## Golden D-4102 acceptance (target — not yet real)

| Step | Required | Today |
|------|----------|-------|
| Org + Amsterdam location | Persist | Onboarding creates org/location; not used by Decision engine |
| Upload contract + invoice | Normalize | Upload API exists; no mapping → Finding |
| Match €6.80 vs €7.45 × 420 L | Deterministic | Canon math exists; not from uploaded rows |
| Finding → Decision (€273 > threshold) | Persist | In-memory Decision seed only |
| Control Center “1 needs you” | Query DB | Fixture portfolio |
| Prepare dispute + approve | Persist Action | In-memory |
| Credit memo → Verified €273 | Persist Verification | In-memory / sealed demo |
| Ledger + audit + memory | Derive | Demo aggregates |

**RADR exists when this flow runs on persisted tenant data.**

---

## Recommended implementation order (locked)

Per engineering master brief — **do not reorder**:

1. ~~Repository/product reality audit~~ ← **this document**
2. Auth + organization + locations + roles (expand membership roles; gate pilot workspace)
3. Canonical domain / database model (**add Decisions** + wire Findings)
4. Upload / import pipeline (remount UI)
5. Data mapping + normalization
6. Data Health
7. Supplier/AP contract–invoice variance Finding
8. Materiality + Finding → Decision gate
9. Real Decision state machine / versioning
10. Control Center ← real Decisions
11. Decision Trace ← real evidence
12. Action preparation + approval
13. Outcome ingestion
14. Verification + Verified Value ledger
15. Pilot onboarding
16. Reconciliation Decision class
17. First real external connector(s)
18. Operating Memory from closed Decisions
19. Predictive perishable-revenue Futures
20. Butler grounded in real tools

---

## Next engineering step (Phase 1)

**Do not redesign marketing.**  
**Do not add another demo module.**

**Onboarding first-value funnel (MVP) is in progress** — see `docs/ONBOARDING_FIRST_VALUE.md`.

Then continue foundation for the Recovery Pilot:

1. Expand tenancy roles + **gate a pilot workspace** (keep public DEMO separate if needed).
2. Add persisted **Decision** (and DecisionVersion) schema aligned to the Decision Record model.
3. Remount **Sources / upload** under auth for the pilot org (onboarding upload already uses `/api/documents`).
4. Quarantine the €118 supplier scenario; lock SSOT to **D-4102 / CANON_SUPPLIER**.

Then implement Phase 4–14 until the golden acceptance test passes end-to-end with persisted Decisions.

---

## Marketing freeze pointer

Public website: `docs/MARKETING_SITE_FREEZE.md` — **FROZEN**.  
Company page: FROZEN after semantic marquee cleanup (2026-09-20).  
Touch marketing only for factual corrections, bugs, a11y regressions, legal updates, or claims that become inaccurate when product capability changes.
