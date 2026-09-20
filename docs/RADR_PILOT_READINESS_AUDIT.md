# RADR Pilot Readiness Audit

**Date:** 2026-08-27  
**Phase:** 0 (mandatory). No feature implementation until this audit is accepted.  
**Objective:** Move from polished product concept to pilot-ready operating intelligence without redesigning working UI or inventing capabilities.

**Related (do not discard):**
- `RADR_ARCHITECTURE_AUDIT.md` (2026-08-24 architecture + Phase 2–18 library work)
- `docs/platform/*` (integrations, normalized model, security)
- `SECURITY_TODO.md`, `SECURITY.md`
- `openapi/radr-v1.yaml` (PROPOSED, not live)

---

## Executive verdict

| Surface | Reality |
|---------|---------|
| Marketing site | WORKING cinematic dark brand |
| Developers site | WORKING docs / proposed API honesty |
| Control Center `/app/*` | DEMO ONLY ungated vision product |
| Auth app `/(app)/*` | PARTIAL real Better Auth + documents |
| Domain libraries (`lib/radr/*`, `lib/platform/*`) | PARTIAL solid TS engines; Berlin-scoped; not persisted |
| Live reservation + POS integrations | NOT IMPLEMENTED |
| Complete DETECT → VERIFY loop on real data | NOT IMPLEMENTED |

**Bottom line:** RADR can demo the hospitality intelligence story convincingly in-browser. It cannot yet run a real venue end-to-end with persisted findings, server RBAC, live sync, and conservative verified value.

**Do not start over.** Reuse Control Center IA, domain modules, Drizzle schema shells, adapter interfaces, and honest LIVE/EARLY/PLANNED language.

---

## Classification key

| Tag | Meaning |
|-----|---------|
| WORKING | Fit for use as-is (or with minor polish) |
| PARTIAL | Real foundation; incomplete for pilot |
| DEMO ONLY | Intentionally synthetic; must stay labeled |
| NOT IMPLEMENTED | Missing |
| BROKEN | Does not work or contradicts claims |
| NEEDS REFACTOR | Exists but must be consolidated before scaling |

---

## 1. Current frontend architecture

**Status: PARTIAL** (three shells, one ungated demo product)

| Shell | Path | Status |
|-------|------|--------|
| Marketing | `.radr` + `components/marketing/*` | WORKING |
| Product Control Center | `ProductShell` → `/app/*` | DEMO ONLY |
| Developers | `DevelopersShell` → `/developers/*` | WORKING |
| Auth early product | `app/(app)/layout.tsx` | PARTIAL |

Stack: Next.js 15 App Router, React 19, `product.css` / `radr.css`, Motion/GSAP.  
State: `lib/product/store.tsx` (`ProductProvider`) — client signals/controls from demo catalog; scope in sessionStorage.

Ask RADR is not a route. It is `CommandPalette` → `lib/radr/butler/tools.ts`.

Design systems (keep):
- Marketing: dark cinematic
- Product: daylight warm control room
- Developers: light editorial
- Ask: dark graphite (`.rp-intel`)

---

## 2. Current backend architecture

**Status: PARTIAL**

| Piece | Status | Notes |
|-------|--------|-------|
| Better Auth API | WORKING | `app/api/auth/[...all]` |
| Onboarding API | PARTIAL | Creates org + location |
| Documents API | PARTIAL | Upload/download/delete + tenant checks |
| Contact server action | WORKING | Marketing only |
| Jobs / queues / cron | NOT IMPLEMENTED | |
| Public `/v1` API | NOT IMPLEMENTED | OpenAPI proposed only |
| Webhook inbound routes | NOT IMPLEMENTED | |

---

## 3. Database / storage architecture

**Status: PARTIAL**

- Drizzle ORM; default PGlite (`.data/pglite`); optional Postgres (`DATABASE_URL`, `docker-compose.yml`)
- File storage: `lib/storage.ts` (local or S3)
- Migrations: `drizzle/0000_*.sql`, `drizzle/0001_domain_model.sql`

**Tables present:**
Auth: `user`, `session`, `account`, `verification`  
Tenant: `organizations`, `organization_members`, `locations`, `suppliers`, `documents`, `audit_logs`  
Intelligence shells: `findings`, `actions`, `verifications`, `reservations`, `waitlist_entries`

**Critical gap:** No application writers insert into findings/actions/verifications/reservations/waitlist. Schema exists; lifecycle is in-memory / fixtures.

---

## 4. Current data models

**Status: PARTIAL**

| Layer | Status |
|-------|--------|
| Zod/TS domain (`lib/radr/domain/*`) | WORKING as contracts |
| Drizzle mirror for intelligence | PARTIAL (empty shells) |
| Product `Signal` / `Control` types | NEEDS REFACTOR (parallel to Finding/Action) |
| Docs normalized model | WORKING as design intent |

Canonical Finding / Action / Verification / Reservation / WaitlistEntry exist in TypeScript. Money helpers prefer `amountMinor` but demo still uses major-unit euros in many places (NEEDS REFACTOR).

---

## 5. Current demo-data architecture

**Status: DEMO ONLY** (coherent Berlin / Northstar story; must stay labeled)

| Source | Role |
|--------|------|
| `lib/product/demo/catalog.ts` | Org, locations, SIGNALS, CONTROLS, €18,620 story |
| `lib/radr/demoModel.ts`, `venueProfiles.ts`, `operatingPulse.ts` | Ops numbers |
| `lib/radr/reservationDemo.ts`, `berlinFloor.ts` | Table 14 / floor |
| `lib/radr/ports/demoOperatingContext.ts` | Context for engines |
| `lib/radr/priorityFindings.ts` | Legacy parallel findings queue |
| `lib/radr/demoValidators.ts` | Story coherence checks |

DEMO badge: `DEMO_BADGE` / ProductShell. Settings honesty points at `SECURITY_TODO.md`.

---

## 6. Current authentication

**Status: PARTIAL**

| Item | Status |
|------|--------|
| Better Auth email/password | WORKING |
| Sessions | WORKING |
| Middleware gate on `/(app)` | WORKING |
| `/app` Control Center gate | NOT IMPLEMENTED (ungated) |
| Password reset email | NOT IMPLEMENTED (needs provider) |
| Social OAuth | NOT IMPLEMENTED |

---

## 7. Current organization / location model

**Status: PARTIAL**

- DB: Organization → Locations; membership `OWNER` \| `ADMIN` \| `MEMBER`
- Locations extended (city, seatCount, servicePeriods JSON, metric definition JSON fields)
- Brand entity: NOT IMPLEMENTED as first-class table
- Demo catalog locations ≠ DB locations (parallel graphs)

---

## 8. Current API architecture

**Status: PARTIAL**

Live handlers: auth, onboarding, documents only.  
Proposed: `openapi/radr-v1.yaml`, developers docs.  
No API keys, no sandbox API runtime.

---

## 9. Existing integrations

**Status: DEMO ONLY / honesty WORKING**

Registry (`lib/integrations/registry.ts`): only demo reservations + file upload marked available; Toast/SevenRooms/etc. partner_access or planned. Do not claim live commercial connectors.

---

## 10. Existing integration abstractions

**Status: PARTIAL**

- Category adapters: Reservation, POS, Labor (+ stubs)
- Concrete: `DemoReservationAdapter` only
- Normalizer: `normalize/reservation.ts`
- Ingest: `lib/ingest/*` (in-memory idempotency)

---

## 11. Existing findings logic

**Status: PARTIAL**

Engine: `lib/radr/findings/engine.ts`  
Active rules: staffing gap, cancellation exposure, waitlist recovery, supplier variance  
Stub rules (null): invoice mismatch, no-show, booking pace, prime-time, margin, labor overrun, delivery payout, supplier credit  

Overview uses `findingsForScope`.  
Service Map / territories / nav still use `priorityFindings` — **NEEDS REFACTOR**.

---

## 12. Existing forecasting logic

**Status: DEMO ONLY / PARTIAL library**

`lib/radr/forecast/service.ts` computes drivers from OperatingContext. No persisted forecasts, no live model training, no API.

---

## 13. Existing action logic

**Status: PARTIAL**

- Domain Action model + in-memory `lib/radr/actions/service.ts`
- Overview “Add to actions” creates memory Action + marks Finding ACTIONED
- `/app/controls` still largely demo Controls catalog — **NEEDS REFACTOR** to Action SoT

---

## 14. Existing Verified Value logic

**Status: PARTIAL**

- Conservative verification helpers exist
- `/app/value` page uses finance vocabulary + demo ledger numbers
- No durable verification ledger from real POS evidence

---

## 15. Existing Butler implementation

**Status: DEMO ONLY**

- Keyword tool router; no LLM inventing money
- Client-side; fake `butler_demo` user
- RBAC via `lib/platform/rbac.ts` (not DB-backed)
- Write proposals require UI confirmation payload

---

## 16. Existing Service Map implementation

**Status: DEMO ONLY / WORKING vision**

- `components/product/ServiceMap.tsx` + Berlin floor geometry
- Table 14 cancellation highlight tied to demo reservations
- Not driven by live seating events

---

## 17. Existing notification infrastructure

**Status: NOT IMPLEMENTED** (rules library only)

`lib/platform/notifications.ts`: preference/draft helpers. No email sender. No Slack/Teams. Morning Brief is in-product only.

---

## 18. Existing security measures

**Status: PARTIAL**

| Control | Status |
|---------|--------|
| Tenant checks on documents | WORKING |
| Auth secrets via env | WORKING (when set) |
| Webhook HMAC helpers | PARTIAL (no inbound routes) |
| PII strip helpers | PARTIAL |
| Secure headers map | PARTIAL (not applied in middleware) |
| Credential vault for integrations | NOT IMPLEMENTED |
| `/app` tenant isolation | NOT IMPLEMENTED |
| SOC2/ISO claims | Correctly NOT claimed |

---

## 19. Existing observability

**Status: NOT IMPLEMENTED** (helper only)

`lib/platform/observability.ts` → `console.log` JSON. Unused by product paths. No Sentry/OTel. No sync job monitors.

---

## 20. Existing tests

**Status: PARTIAL**

~14 Vitest files, ~86 tests: domain, findings math, butler snapshot, ingest/reconcile unit, tenant isolation, security helpers, routes.  
No Playwright/Cypress E2E. No live provider integration tests.

---

## 21. Existing environment variables

**Status: WORKING** (placeholders in `.env.example`)

Includes app URL, Better Auth, DB/PGlite, storage/S3, `FEATURE_DOCUMENT_CHECKING`, email flag, contact webhook, proposed RADR API keys, integration encryption key, provider placeholders. No secrets in example file.

---

## 22. Current deployment architecture

**Status: PARTIAL**

- Local: `next build` / `next start` or `scripts/dev.sh`
- Docker Compose for Postgres optional
- No documented production deploy (Vercel/Fly/etc.) as SoT in-repo
- Multiple stale local ports historically (3140–3152) — operator hygiene, not product bug

---

## 23. Current marketing site

**Status: WORKING** (copy polish still useful)

Dark radar identity intact. Demo financial examples must remain labeled simulated. Customers page “coming soon” honesty. Em-dash cleanup previously applied to hero copy — enforce ongoing.

---

## 24. Current Developers site

**Status: WORKING** as documentation / proposed platform

Honest LIVE / EARLY / PLANNED. Do not imply sandbox API is live until handlers exist (label COMING SOON).

---

## 25. Duplicate business logic

**Status: NEEDS REFACTOR**

| Duplication | Locations |
|-------------|-----------|
| Finding queues | Engine Finding vs `priorityFindings` vs product Signals |
| Actions | Memory Actions vs demo Controls |
| €18,620 FreshCo | catalog, demoModel, marketing, charts |
| Group margin averages | operatingPulse vs dashboard |
| Cancel economics | ServiceMap constants vs cancellationModel vs LiveVisuals |

Shared SoT started: `lib/radr/calc`, finding engine, finance vocab.

---

## 26. Business calculations in frontend components

**Status: NEEDS REFACTOR**

| File | Issue |
|------|-------|
| `DailyPulse.tsx` | Hardcoded pts vs plan strings |
| `ControlCenter.tsx` | Territory hardcode 290; fixture mixes |
| `OperatingPerformanceChart` | Synthetic series generator |
| Territory / LiveVisuals | Local bar math from constants |

Rule going forward: UI formats; domain services calculate.

---

## 27. Hard-coded demo values

**Status: DEMO ONLY** (acceptable if labeled)

Berlin tonight covers, €256 cancel, €192 waitlist, €184 POS story fragments, FreshCo €18,620, `DAILY_PULSE`, `FORWARD_WEEK`, chart sine waves.

---

## 28. Fake functionality

**Status: PARTIAL honesty / some traps**

| Item | Reality |
|------|---------|
| Settings Billing COMING SOON | Honest |
| Data page connector statuses | Simulated |
| Document checking feature flag | Dead (unused) |
| Role “View as” | Cosmetic |
| OpenAPI /v1 | Spec only |
| Live Toast/SevenRooms | Not available |

---

## 29. Dead buttons / CTAs

**Status: PARTIAL**

- Review & Act creates in-memory action on Overview; Controls page not fully SoT
- Some marketing socials empty by design
- Assign on signal detail historically weak — verify before pilot

---

## 30. Broken routes

**Status: WORKING** for primary nav (covered by `product-routes` tests). Dual product trees (`/app` vs `/home`) can confuse operators — document, then converge.

---

## 31. TODOs

**Status: PARTIAL**

Notable: social URL TODOs in marketing config; architecture audit phase notes; SECURITY_TODO matrix. No systematic TODO debt tracker.

---

## 32. Security risks

**Status: PARTIAL / production blockers**

1. `/app` ungated with realistic ops UI (trust risk if mistaken for live)
2. Cosmetic RBAC on demo
3. No encrypted integration credential vault
4. Incomplete password-reset email
5. Audit log does not cover finding/action lifecycle
6. Secure headers not enforced in middleware

---

## 33. Privacy risks

**Status: PARTIAL**

- Design intent: minimize guest PII (good)
- Need retention/deletion/DSAR procedures documented for pilot
- Legal pages exist; mark counsel-review templates where text is not lawyer-approved
- Never store PAN/CVV (policy present; no payment ingest yet)

---

## 34. Data-model inconsistencies

**Status: NEEDS REFACTOR**

- Signal ≠ Finding
- Control ≠ Action
- Demo location IDs ≠ DB location UUIDs
- Finding workflow statuses partially remapped (NEW→OPEN)
- Money: major units vs amountMinor mixed

---

## 35. Currency inconsistencies

**Status: PARTIAL**

- Per-location currency fields exist
- Multi-location rollups risk naive €+£+$ — **guardrail required**
- FX / CurrencyRate entity: NOT IMPLEMENTED in DB
- Helpers: `lib/radr/currency.ts` PARTIAL

---

## 36. Timezone inconsistencies

**Status: PARTIAL**

- Location timezone on DB and domain
- Demo uses Europe/Berlin labels
- Product scope/period is not venue-business-date driven
- Risk: browser TZ ≠ venue TZ for “tonight”

---

## 37. Responsive issues

**Status: PARTIAL** (prior polish; needs dedicated QA pass Phase 23)

Known risk areas: Service Map floor, drawers, compare, developers sidebar. Systematic 1440→375 audit not complete in this pass.

---

## 38. Performance problems

**Status: PARTIAL**

- Large CSS files; GSAP/motion on marketing
- ServiceMap is a large client component
- Synthetic chart rebuilds on metric change
- No query cache layer (demo has no network)

---

## 39. Accessibility problems

**Status: PARTIAL**

Some dialogs/focus/ARIA present (NeedsAttention drawer). Charts need text summaries. Full WCAG AA audit not done.

---

## 40. Production blockers (pilot)

| Blocker | Severity |
|---------|----------|
| No live reservation + POS connection path | Critical |
| Findings/actions/verifications not persisted | Critical |
| `/app` not auth-gated for LIVE mode | Critical |
| Platform RBAC not server-enforced on product | Critical |
| No credential encryption vault | Critical |
| No email for auth reset / ACT NOW notify | High |
| Dual finding queues | High |
| No E2E cancellation recovery test against SoT | High |
| Observability absent | High |
| Currency rollup policy incomplete | Medium |
| Legal text may need counsel review | Medium |

---

## Gold-standard gap: Cancellation recovery vertical slice

**Target:** Berlin Mitte · Table 14 · 4 covers · €256 → waitlist €192 → seated → POS €184 verified.

| Step | Today |
|------|--------|
| Demo reservation + floor | DEMO ONLY present |
| Waitlist match math | Library WORKING |
| Finding rules | Library WORKING |
| Timeline UI (17:42…21:37) | NOT IMPLEMENTED as single evidence trail |
| Accept action persisted | NOT IMPLEMENTED |
| POS reconcile persisted | Library only |
| Verified €184 SoT shared with Butler | NOT IMPLEMENTED |

This must become the **first** end-to-end lifecycle before expanding finding types.

---

## What to reuse (do not rebuild)

1. Control Center hierarchy and daylight product UI  
2. Marketing cinematic identity  
3. Developers honesty model (LIVE / EARLY / PLANNED)  
4. `lib/radr/domain`, calc, findings engine, forecast, brief, actions, waitlist recovery, reconciliation  
5. `lib/integrations` adapter interfaces + DemoReservationAdapter  
6. Drizzle intelligence table shells  
7. Better Auth + document tenant isolation patterns  
8. `lib/platform` RBAC/data health/security helpers (promote from library to enforcement)

---

## Implementation plan (ordered)

Aligned with the Master Build brief. **Do not parallelize all phases.**

### Phase 0 — Audit (this document)
Done when stakeholders accept classifications and blockers.

### Phase 1 — Canonical data model consolidation
- Single Finding/Action/Verification SoT; retire Signal/Control as persistence concepts  
- Money `amountMinor` + currency everywhere new  
- Location timezone + reporting currency policy  
- Brand entity if needed without breaking onboarding  

### Phase 2 — Shared calculation services
- Kill remaining frontend hardcodes (DailyPulse pts, chart synthesis where possible)  
- One metric-definition module used by Product, Butler, Brief, tooltips  

### Phase 3 — DEMO / SANDBOX / LIVE separation
- Explicit environment enum; DEMO badge mandatory on synthetic  
- SANDBOX labeled COMING SOON until API exists  
- LIVE requires auth + real connections  

### Phase 4 — Finding Engine hardening
- Persist findings; expand toward 10 excellent types (stubs → real when data exists)  
- Dedupe + priority already started; enforce completeness gate in UI  

### Phase 5 — Cancellation recovery vertical slice (GOLD STANDARD)
- One scenario seed with full timeline  
- Wire Service Map, Finding detail, Action, POS reconcile, Verified Value, Butler to **same persisted evidence**  
- Documented by `docs/pilots/CANCELLATION_RECOVERY_TEST.md`  

### Phase 6 — Action lifecycle persistence
- Replace Controls demo mutations with Action service + DB  

### Phase 7 — Verification engine
- Conservative verified value; attribution enums; Value page reads ledger  

### Phase 8 — Morning Brief first-class
- Location + group briefs from domain; deep links; since-last-check  

### Phase 9 — Provenance / explainability
- “How is this calculated?” on material numbers  

### Phase 10 — Butler domain tools (server)
- Server gateway + DB RBAC; no silent writes  

### Phase 11 — Onboarding + data health
- Coverage gate before RADR READY; health chip from real sync metadata  

### Phase 12 — Auth / org / RBAC / audit on product
- Gate LIVE `/app`; map platform roles to memberships; expand audit events  

### Phase 13 — First real reservation adapter
- Only after partner/API access confirmed; no fake Toast/SevenRooms  

### Phase 14 — First real POS adapter
- Same constraint  

### Phase 15 — Reservation ↔ POS reconciliation (durable)

### Phase 16 — Forecasting (consume live bookings + history)

### Phase 17 — Labor integration / intelligence

### Phase 18 — Notifications (email first; ACT NOW / TODAY / WATCH)

### Phase 19 — Security / privacy / legal baseline for pilot

### Phase 20 — Observability (structured logs + error tracking + sync monitors)

### Phase 21 — Demo simulation upgrade (deterministic scenarios A–E)

### Phase 22 — Marketing outcome-copy cleanup (no fake customer results)

### Phase 23 — Performance / a11y / responsive QA

### Phase 24 — Pilot readiness review against checklist

**Stop condition:** After reservation + POS + ~10 findings + Brief + Butler + Actions + Verified Value + auth + onboarding + security baseline → **stop adding surface area** and run a real restaurant pilot.

---

## Phase status (2026-08-27 implementation pass)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Audit | Done | This doc + checklist + cancellation test doc |
| 1–2 Domain / calcs | Advanced | Scenario SoT + metric provenance; DailyPulse pts from data |
| 3 DEMO/SANDBOX/LIVE | Done | `lib/radr/env.ts` + ProductShell chrome + `.env.example` |
| 4 Finding engine | Advanced | Merges gold-standard scenario; stubs remain for unused types |
| 5 Cancellation recovery | Done (DEMO SoT) | Scenario + timeline page `/app/findings/[id]` + Value + Butler |
| 6–7 Action / verify | Done (DEMO store) | Accept → seat → verify lifecycle on scenario store |
| 8 Morning Brief | Partial | Still uses brief builder; scenario in findings queue |
| 9 Provenance | Done for gold standard | `lib/radr/provenance.ts` + Value/Finding UI |
| 10 Butler | Advanced | Table 14 answer from same store |
| 11–12 Onboarding/RBAC | Library only | Not LIVE-gated `/app` yet |
| 13–15 Real adapters | Not started | No fake commercial APIs |
| 16–24 Remaining | Partial / open | See checklist |

**Honest limit:** Gold-standard loop is DEMO in-memory SoT, not Postgres-persisted LIVE. Do not claim pilot-complete.

---

## Immediate next step after acceptance

**Phase 1 + Phase 5 design spike:**  
Specify the persisted Cancellation Recovery event model and Finding timeline schema, then implement that vertical slice before any new pages or new finding categories.

---

*End of Phase 0 audit. No major refactor should proceed without explicit go-ahead on this document.*
