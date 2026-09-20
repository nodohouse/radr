# RADR Architecture Audit

**Date:** 2026-08-24  
**Purpose:** Phase 1 of the Master Product Architecture + Launch Build Plan. Map what exists, what is demo, what is missing, and how to migrate without rebuilding working screens.

**Related docs (do not contradict; this supersedes for launch sequencing):**
- `docs/platform/REPO_AUDIT.md` — developer platform / integrations
- `docs/platform/NORMALIZED_DATA_MODEL.md` — entity principles
- `docs/platform/INTEGRATION_ARCHITECTURE.md` — adapter pattern
- `RADR_PRODUCT_AUDIT.md` — product UX quality pass (keep/refine)
- `SECURITY_TODO.md` — honest security status
- `openapi/radr-v1.yaml` — proposed public API (not implemented)

---

## Executive verdict

RADR today is a **dual-tree product**:

| Tree | Routes | Reality |
|------|--------|---------|
| **Control Center vision** | `/app/*` | Ungated client demo. Intelligence is TypeScript fixtures + pure calculators. No DB for findings/actions/forecasts. |
| **Auth early app** | `/(app)/*` (`/home`, `/documents`, …) | Real Better Auth + Drizzle (PGlite/Postgres). Org, location, suppliers, documents, audit. Thin UI. No intelligence engine. |
| **Marketing / Developers** | `/`, `/product`, `/developers/*` | Public. Honest LIVE / EARLY / PLANNED connector language. |

**Guiding loop (DETECT → … → VERIFY) is expressed in UI and some `lib/radr` modules, but is not yet a server-side operating intelligence pipeline.**

Do not redesign Control Center screens to “look more ready.” Wire them to a real domain layer.

---

## 1. Current frontend architecture

### Stack
- Next.js 15 App Router · React 19 · Tailwind 4 (auth tree) · large hand-written CSS (`radr.css`, `product.css`)
- Motion: `motion`, GSAP
- **No** Zustand / TanStack Query / SWR for product demo

### Shells

| Shell | File | Scope |
|-------|------|-------|
| ProductShell | `components/product/ProductShell.tsx` | `/app/*` daylight Control Center |
| Marketing | `className="radr"` + SiteNav/Footer | Public site |
| DevelopersShell | `components/developers/DevelopersShell.tsx` | `/developers/*` |
| Auth app layout | `app/(app)/layout.tsx` | Session-gated early product |
| AuthPageShell | `components/AuthPageShell.tsx` | Login / signup |

### Product composition (`/app`)
`ProductProvider` → nav + ScopeBar + CommandPalette (Ask RADR) → LocationChrome → page.

Ask RADR is **not** a route. It lives in `components/product/CommandPalette.tsx` → `lib/radr/butler/tools.ts`.

### Design tokens
- `lib/radr/brandTokens.ts` — product/dev semantic SoT
- `app/product.css` — `.rp-root` daylight + `.rp-intel` Ask layer
- `app/radr.css` — marketing dark + developers editorial
- Marketing territory neon ≠ product `#00B96B` (intentional dual systems; watch drift)

---

## 2. Current backend architecture

### Real API routes (`app/api/**`)

| Route | Role |
|-------|------|
| `api/auth/[...all]` | Better Auth |
| `api/onboarding` | Create org + first location |
| `api/documents/upload` | Authenticated upload |
| `api/documents/[id]` | Download / delete + tenant check |

### Server actions
- `app/contact/actions.ts` only (marketing contact)

### Persistence
- Drizzle: `lib/db/schema.ts`, migrations `drizzle/`
- Default local: PGlite (`.data/pglite`); optional Postgres via `DATABASE_URL` + `docker-compose.yml`
- Storage: `lib/storage.ts` (local FS or S3)

### Absent (production-critical)
- Jobs / queues / cron
- Inbound provider webhooks (docs only)
- `/v1` OpenAPI handlers
- Finding / Action / Forecast / IntegrationConnection tables
- Observability (no Sentry / OTel in `package.json`)
- Notification delivery
- Billing

---

## 3. Current data model

### Persisted (Drizzle)

**Auth:** `user`, `session`, `account`, `verification`

**Domain:**
- `organizations` — name, country, currency, timezone
- `organization_members` — `OWNER` \| `ADMIN` \| `MEMBER`
- `locations` — name, address, country, currency, timezone (missing: seatCount, servicePeriods, metric definitions, brandId, city as first-class, reportingCurrency)
- `suppliers` — name + externalReference (no contracts/invoices lines)
- `documents` — file metadata (no OCR → finding pipeline; `FEATURE_DOCUMENT_CHECKING` off)
- `audit_logs` — org/location/document/member events only

### Client / TypeScript domain (demo, not persisted)

| Concept | Path |
|---------|------|
| Signal / Control / Location / User | `lib/product/types.ts` + `lib/product/demo/catalog.ts` |
| PriorityFinding | `lib/radr/priorityFindings.ts` |
| Finding calculators | `lib/radr/findingIntelligence.ts` |
| Reservation model + demo | `lib/radr/reservationModel.ts`, `reservationDemo.ts` |
| Operating snapshot | `lib/radr/operatingSnapshot.ts` |
| Floor / Service Map | `lib/radr/floorModel.ts`, `berlinFloor.ts` |
| Comparison | `lib/radr/comparisonService.ts` |
| Integrations types + adapters | `lib/integrations/*` |
| Normalized reservation | `lib/integrations/normalize/reservation.ts` |

### Proposed (docs / OpenAPI only)
- Full hospitality model: `docs/platform/NORMALIZED_DATA_MODEL.md`
- Finding / Action / Money schemas: `openapi/radr-v1.yaml` (thin stubs)

---

## 4. Current demo data architecture

```
lib/product/demo/catalog.ts  ──► ProductProvider (clone SIGNALS/CONTROLS)
lib/product/demo/dashboard.ts     │ sessionStorage scope · localStorage prefs
lib/product/demo/integrations.ts  ▼
lib/radr/* fixtures ─────────► ControlCenter, NeedsAttention, ServiceMap, Butler
```

**Key fixtures**
- Northstar org ~18 locations, SIGNALS, CONTROLS, €18,620 FreshCo verified story (`catalog.ts`, `demoModel.ts`)
- Berlin tonight ops + forecast (`venueProfiles.ts`)
- Berlin reservations / waitlist (`reservationDemo.ts`)
- Fixed priority findings queue (`priorityFindings.ts` → `BERLIN_PRIORITY_FINDINGS`)
- Fake connector health (`lib/product/demo/integrations.ts`, `DataHealthChip`)

**Validators:** `lib/radr/demoValidators.ts` keep the Berlin story coherent.

**Rule for launch build:** keep demo as a **seed / fixture provider** behind domain interfaces. Stop importing fixtures directly from React once services exist.

---

## 5. Current routes

### Marketing
`/`, `/product`, `/product/operating-model`, `/product/connections`, `/how`, `/why`, `/approach`, `/solutions`, `/pricing`, `/company`, `/customers`, `/security`, `/contact`, `/terms`, `/privacy`, `/imprint`

### Control Center demo (`/app`) — keep surfaces; do not add random pages

| Route | Role |
|-------|------|
| `/app` | Control Center Overview |
| `/app/performance` | Operating chart / pulse |
| `/app/forecast` | Forward week (demo numbers) |
| `/app/service` | Service Map |
| `/app/locations`, `/app/locations/[id]` | Portfolio |
| `/app/compare` | Multi-location compare |
| `/app/signals`, `/app/signals/[id]` | Findings |
| `/app/controls`, `/app/controls/[id]` | Actions / controls |
| `/app/value` | Verified Value |
| `/app/checks`, `/app/checks/[id]` | Reconciliation demo |
| `/app/buy`, `/labor`, `/sell`, `/recover` | Territory lenses |
| `/app/data` | Sources / mock upload |
| `/app/glossary`, `/app/team`, `/app/settings` | Support |

**Do not add** separate Morning Brief / Notifications / Billing pages until domain services exist. Prefer embedding Brief into Overview / email; Notifications into settings + delivery; Billing into admin config.

### Auth early app
`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/home`, `/scan`, `/sources`, `/cases`, `/money`, `/controls`, `/documents`

### Developers
`/developers`, `/quickstart`, `/api`, `/webhooks`, `/connectors`, `/integrations/[provider]`

**Note:** middleware protects auth tree; `/app` is public. Post-login redirect currently favors `/app` (demo).

---

## 6. Existing auth

| Piece | Status |
|-------|--------|
| Better Auth email/password | **Real** (`lib/auth.ts`) |
| Sessions (7-day) | **Real** |
| Org membership | **Real** for `/(app)` |
| Document IDOR checks | **Real** (`lib/authz.ts`) |
| Password reset email | **Stub** (console in dev; needs email provider) |
| `/app` gate | **None** |
| Role “View as” in settings | **Cosmetic** (client store only) |
| Location-scoped RBAC | **Missing** |
| Butler server authz | **Missing** (in-process demo roles) |

---

## 7. Existing state management

- **Single provider:** `lib/product/store.tsx`
- Scope / period → `sessionStorage` (`radr.scope.v1`)
- Prefs / role view → `localStorage` (`radr.prefs.v1`)
- Signal/control mutations → in-memory only
- Compare IDs → context (+ optional `?locations=` on compare)
- Service focus → `?focus=`
- **No** server cache layer for `/app`

---

## 8. Duplicate calculations found

| Pattern | Locations |
|---------|-----------|
| `% vs forecast` `((a−f)/\|f\|)×100` | `ControlCenter`, `OperatingPerformanceChart`, `performance/page`, `locations/[id]/page` |
| Synthetic chart series (sine around center) | `buildOperatingSeries` vs unused `buildPerfSeries` in `PerformanceChart.tsx` |
| Group margin average | `GROUP_MARGIN_AVG` in `operatingPulse.ts` vs `groupAvgMargin` from dashboard |
| Cancel at-risk / rebook | `ServiceMap` constants, `LiveVisuals`, `cancellationModel` |
| €18,620 FreshCo | catalog, demoModel, dashboard, marketing, controls EXAMPLES, chart copy |
| Labor / margin “pts vs plan” | Snapshot fields exist; UI often hardcodes `+0.6` / `−0.4` / `+1.8` |
| Open impact totals | `valueAtRiskEuro()` vs ad-hoc reduces in ExecutiveBrief / signals / controls |
| Marketing vs product pulse | `operatingHero` / marketing scenes vs `DAILY_PULSE` / snapshot |

**Migration rule:** one pure helper per metric in `lib/radr/domain/` (or equivalent); UI only formats and links.

---

## 9. Hard-coded business logic found

### Acceptable seeds (keep, but behind interfaces)
- `findingIntelligence.ts` — staffing, cancellation, supplier variance calculators + tests
- `cancellationModel.ts`, `comparisonService.ts`, `operatingSnapshot.ts`
- `priorityFindings.ts` scoring (`URGENCY_WEIGHT` + euro + confidence + time)

### Must leave React / page files
- Vs-forecast % and chart series synthesis in chart components
- Hardcoded pts-vs-plan strings in `DailyPulse`, `TerritoryWorkspace`
- EXAMPLE controls and protected-value constants on `/app/controls`
- `DataHealthChip` DEMO_SOURCES
- Butler keyword router inventing structure from fixture reads (OK for demo; not for production answers)
- Forecast page summing `FORWARD_WEEK` literals
- Team page owned-euro map

### Parallel product models (consolidate)
- **Signal** (`lib/product/types.ts`) vs **PriorityFinding** (`priorityFindings.ts`) — two finding shapes for one concept
- **Control** (product store) vs future **Action** — rename/align to Action model

---

## 10. Missing services (vs master plan)

| System | Today | Gap |
|--------|-------|-----|
| 1 Intelligence Engine | Calculators + fixed Berlin findings | No detection loop, no dedupe, no persistence, incomplete Finding schema |
| 2 Canonical data model | Partial TS + thin DB | Most hospitality entities not in DB |
| 3 Ingestion + reconciliation | Adapter interfaces + DemoReservationAdapter | No raw store, no idempotent ingest, no reconciliation service |
| 4 Forecasting | Fixture numbers | No forecast service / drivers / confidence intervals |
| 5 Action + Verification | Client controls + fixture verification fields | No Action/Verification tables, workflow, conservative attribution |
| 6 Butler | Keyword tools in browser | No server tools, no RBAC, no write confirmation API |
| 7 Production readiness | Auth + partial audit | No full RBAC, jobs, observability, failure-state model |
| 8 Morning Brief | `ExecutiveBrief` UI | Not a first-class artifact / email / deep-link brief |
| 9 Notifications | Settings honesty only | No channel architecture |
| 10 Onboarding | Org+location create | No connector validation / coverage gate → “RADR ready” |
| 11 Data Health | Demo chip | Not backed by sync metadata |
| 12 Billing | COMING SOON copy | No plan/subscription model |
| 13 Security / privacy | Docs + basic tenant on documents | No credential vault, retention/DSAR, webhook signatures |
| 14 Observability | Absent | Structured ops monitoring |
| 15 Launch QA | Partial Vitest | Need permission + E2E + financial unit suite expansion |

**Partial wins to reuse**
- Adapter category interfaces: `lib/integrations/adapters/*`
- Reservation normalizer: `lib/integrations/normalize/reservation.ts`
- Finding math + tests: `tests/finding-intelligence.test.ts`, `reservation-intelligence.test.ts`
- Butler tool shapes: `lib/radr/butler/tools.ts`
- Audit writer: `lib/audit.ts` (extend actions)
- Money vocabulary: `lib/product/finance.ts`

---

## 11. Proposed domain model

Align with master plan + `NORMALIZED_DATA_MODEL.md`. Persist in Drizzle; mirror as Zod + TS types under `lib/radr/domain/`.

### Tenant / venue
`Organization`, `Brand`, `Location` (extend: city, seatCount, servicePeriods, openingHours, groupBookingThreshold, cancellationWindow, expectedSpendProfile, operatingMarginDefinition, laborCostDefinition, reportingCurrency), `VenueProfile`, `ServicePeriod`, `Floor`, `Section`, `Table`

### Demand / revenue
`Reservation`, `WaitlistEntry`, `GuestParty` (minimal PII), `POSOrder`, `POSOrderItem`, `Payment`, `Refund`

### Labor / buy / recover
`LaborShift`, `Role`, `Supplier`, `SupplierContract`, `PurchaseOrder`, `Invoice`, `InvoiceLine`, `Credit`, `DeliveryOrder`, `Payout`

### Intelligence
`Forecast`, `Finding`, `Recommendation`, `Action`, `Verification`

### Platform
`IntegrationConnection`, `DataSource`, `DataSync`, `RawIngestionRecord`, `CurrencyRate`, `AuditLog` (expanded), `NotificationPreference`, `Subscription` (billing readiness), `MetricDefinition` (admin config)

### Canonical Finding (target schema)

```
Finding {
  id, organizationId, locationId
  territory: BUY | LABOR | SELL | RECOVER
  category, subtype
  title, summary, explanation
  status: DETECTED | OPEN | REVIEWED | ACTIONED | MONITORING
         | RESOLVED | VERIFIED | DISMISSED
  urgency: ACT_NOW | TODAY | WATCH
  priorityScore
  confidenceScore
  confidenceBand: HIGH | MEDIUM | LOW
  timeframe { start, end }
  financialImpact { grossValue?, bookingValue?, revenueAtRisk?,
    contributionAtRisk?, avoidableCost?, recoverableValue?,
    verifiedValue?, currency }
  drivers[]
  recommendation
  evidence[]
  sourceIds[]
  dedupeKey          // NEW: stable fingerprint for merge
  createdAt, updatedAt
}
```

Map today’s `PriorityFinding` → this schema in a single adapter; retire Signal as a separate persisted type (Signal becomes UI alias or migration shim).

### Canonical Action / Verification

As specified in master plan Parts 5.1–5.4. Attribution enum: `NATURAL` | `OPERATOR` | `RADR_RECOMMENDED` | `UNCERTAIN`. Always conservative on verified value.

---

## 12. Proposed service architecture

```
Provider adapters
    ↓
RawIngestionRecord (provenance retained)
    ↓
Normalizers → RADR domain entities (idempotent upsert)
    ↓
Reconciliation (explicit links first; scored matches + confidence)
    ↓
Domain calculation services (margin, labor%, booking value, …)
    ↓
Forecast service (drivers + confidence)
    ↓
Finding engine (rules → detect → dedupe → score → recommend)
    ↓
Action + Verification services
    ↓
Read models / APIs → Product UI + Butler tools + Morning Brief + Notifications
```

### Package layout (proposed)

```
lib/radr/
  domain/           # types + zod schemas (Finding, Action, Reservation, …)
  calc/             # pure financial / ops calculators (move findingIntelligence here)
  forecast/         # forecast service + drivers
  findings/         # engine, priority, dedupe, rules/*
  actions/          # lifecycle
  verification/     # counterfactual vs observed
  reconciliation/   # reservation↔POS↔payment linking
  brief/            # morning brief builder
  butler/           # keep tools; add server gateway
lib/integrations/   # adapters, normalize, registry (exists)
lib/ingest/         # idempotency, raw store, processors
lib/platform/       # rbac, audit extensions, data-health, notifications, billing stubs
```

UI must call **services / API**, not fixtures.

---

## 13. Proposed finding engine

1. **Inputs:** normalized entities + forecast + data freshness
2. **Rules** (separate files, not one giant module):
   - `detectStaffingGap`
   - `detectCancellationExposure`
   - `detectWaitlistRecoveryOpportunity`
   - `detectSupplierPriceVariance`
   - `detectInvoiceMismatch`
   - `detectNoShowPattern`
   - `detectBookingPaceDrop`
   - `detectPrimeTimeCapacityOpportunity`
   - `detectMarginDeterioration`
   - `detectLaborCostOverrun`
   - `detectDeliveryPayoutMismatch`
   - `detectRecoverableSupplierCredit`
3. **Completeness gate:** WHAT / WHY / MONEY / DO / CONFIDENCE / EVIDENCE — drop or mark incomplete if any missing
4. **Dedupe:** `dedupeKey` from territory + location + service window + primary driver set; merge drivers into one finding (e.g. LABOR · PEAK SERVICE CAPACITY)
5. **Priority:**  
   `financialMateriality × urgency × confidence × timeSensitivity × actionability`  
   (extend current `scoreFinding`; ACT_NOW outranks WATCH)
6. **Output:** persisted Finding + Recommendation; UI reads ranked open set

Reuse `calculateStaffingRisk`, `calculateCancellationExposure`, `calculateSupplierVariance` as rule cores.

---

## 14. Proposed action / verification system

```
Finding → Recommendation → Action(PROPOSED)
  → ACCEPT → ASSIGN → IN_PROGRESS → COMPLETED
  → Monitor → Verification (conservative)
  → Verified Value ledger
```

- “Review & Act” must create Action records (API), not dead-end navigation.
- Verification compares counterfactual vs observed; never claim full exposure if POS only supports less.
- Ledger stages already named in `lib/product/finance.ts`: Identified → Actionable → Actioned → Recovered/Protected → Verified — bind to real aggregates.

---

## 15. Proposed Butler architecture

```
User question + UI context
  → intent / tool select (server)
  → RBAC-scoped domain function
  → structured result
  → ANSWER / WHY / € IMPACT / EVIDENCE / CONFIDENCE / NEXT STEP / LINK
  → writes require CONFIRM payload
```

**Tools (server):** map existing `butler/tools.ts` functions behind `requireSession` + location scope:  
`getControlCenterSummary`, `getLocationPerformance`, `getForecast`, `getReservations`, `getWaitlist`, `getCancellationExposure`, `compareLocations`, `getLaborRisks`, `getSupplierVariances`, `getFindings`, `getVerifiedValue`, `explainMetric`, `getDataProvenance`, `proposeAction` (write).

**Context:** org, location, comparison set, date range, selected finding/table/metric from client (explicit context object; no silent PII).

**LLM (optional later):** only as router over tools; never as source of money. Until then, keep deterministic tool router but run it server-side.

---

## 16. Proposed ingestion architecture

Category adapters (already started): Reservation, POS, Labor, Accounting, Payment, Supplier, Delivery, ExternalSignal.

```
Webhook / poll / upload
  → verify signature / auth
  → RawIngestionRecord (payload reference, not always full blob forever)
  → normalize
  → upsert by (organizationId, provider, externalId)
  → enqueue reconcile + intelligence refresh
```

Privacy: retention policies on raw payloads; minimize guest PII on Reservation by default.

First end-to-end path: **DemoReservationAdapter → normalize → persist → finding rules for cancellation/waitlist/staffing**.

---

## 17. Security risks

| Risk | Severity | Notes |
|------|----------|-------|
| `/app` ungated with realistic ops UI | High (trust) | Can be intentional demo; must stay labeled DEMO; gate when live data connected |
| Cosmetic RBAC | High | Location managers must not see other locations server-side |
| No encrypted credential vault | High | Block real connectors until exists |
| Password reset / email | Medium | Incomplete for production auth |
| Document upload without processing isolation | Medium | Path traversal / size limits — review `lib/storage.ts` |
| Audit incomplete for findings/actions | Medium | Extend `auditActionEnum` |
| Observability gap | Medium | Failures silent in production |
| Dual money float usage | Medium | Prefer `amountMinor` + currency everywhere in new domain |
| Marketing claims vs capability | Medium | Keep LIVE/EARLY/PLANNED honesty |
| Butler client-only | Medium | Easy to forget authz when “adding AI” |

Do not claim certifications not obtained (`docs/platform/SECURITY.md`, settings).

---

## 18. Migration plan

### Principles
1. No random new pages.
2. Keep Control Center IA; swap data source behind existing screens.
3. Demo fixtures become `DemoDataProvider` implementing the same ports as DB.
4. One finding model; migrate Signal → Finding.
5. Ship phases in order from master plan (below); each phase leaves UI working.

### Phase map (master plan → this repo)

| Phase | Focus | Concrete first deliverables |
|-------|--------|------------------------------|
| **1** | Architecture audit | **This document** |
| **2** | Canonical domain model | Drizzle + Zod for Location extensions, Reservation, WaitlistEntry, Finding, Action, Verification, IntegrationConnection, RawIngestionRecord, DataSync |
| **3** | Domain calculation services | Move/normalize calcs under `lib/radr/calc`; kill duplicate vs-forecast helpers in React |
| **4** | Finding engine | Rules modules + dedupe + score; seed from Berlin demo via provider |
| **5** | Action + Verification | Persist lifecycle; wire Review & Act |
| **6** | Morning Brief | `brief` builder feeding ExecutiveBrief + optional email later |
| **7** | Reservation + waitlist intelligence | Economics + recovery opportunity finding |
| **8** | Forecasting | Forecast service with drivers; labor demand consumes it |
| **9** | Butler tools | Server gateway + RBAC + confirm writes |
| **10** | Ingestion adapters | Raw + normalize + DemoReservation E2E |
| **11** | Reconciliation | Reservation↔POS↔Payment with confidence |
| **12** | Auth + RBAC + audit | Gate `/app` when not demo-mode; location permissions; expand audit |
| **13** | Data health + observability | Sync metadata → confidence decay; structured logs + error tracking |
| **14** | Onboarding | Coverage validation before RADR READY |
| **15** | Notifications | Preference model + email for ACT_NOW / brief |
| **16** | Billing readiness | Plan/subscription tables; no complex UI |
| **17** | Security/privacy hardening | Vault, retention, DSAR path, webhook signatures |
| **18** | Performance + E2E | Cache, lazy charts, permission + E2E suites |

### Dual-tree strategy
- Short term: keep `/app` as demo mode (`DEMO` badge) reading domain services with in-memory/demo provider.
- Live mode: same UI, `DatabaseProvider` + auth gate.
- Eventually merge `/(app)` thin screens into Control Center or deprecate after feature parity (documents become BUY evidence path).

---

## 19. Files to create

```
RADR_ARCHITECTURE_AUDIT.md          # (this file)

lib/radr/domain/*.ts                # schemas: finding, action, reservation, …
lib/radr/calc/*.ts                  # extracted pure math
lib/radr/findings/engine.ts
lib/radr/findings/priority.ts
lib/radr/findings/dedupe.ts
lib/radr/findings/rules/*.ts
lib/radr/actions/*.ts
lib/radr/verification/*.ts
lib/radr/forecast/*.ts
lib/radr/reconciliation/*.ts
lib/radr/brief/*.ts
lib/ingest/rawStore.ts
lib/ingest/idempotency.ts
lib/ingest/processors/*.ts
lib/platform/rbac.ts
lib/platform/dataHealth.ts
lib/platform/notifications.ts
lib/platform/billing.ts

drizzle/00xx_*.sql                  # domain tables
app/api/v1/**                       # when ready (authz first)
app/api/webhooks/[provider]/route.ts
tests/findings/*.test.ts
tests/actions/*.test.ts
tests/rbac/*.test.ts
```

---

## 20. Files to refactor

| File | Change |
|------|--------|
| `lib/radr/priorityFindings.ts` | Become thin adapter over finding engine + demo seed |
| `lib/radr/findingIntelligence.ts` | Split into `calc/` + rule inputs |
| `lib/radr/butler/tools.ts` | Shared core; add server entry with authz |
| `lib/product/types.ts` / store | Signal → Finding; Control → Action |
| `lib/product/demo/catalog.ts` | Seed data for providers only |
| `lib/db/schema.ts` | Extend locations; add intelligence + ingest tables |
| `lib/audit.ts` + audit enum | Finding/action/integration events |
| `components/product/ControlCenter.tsx` | Consume snapshot/findings services only |
| `components/product/DailyPulse.tsx` | Remove hardcoded pts; use calc helpers |
| `components/radr/OperatingPerformanceChart.tsx` | Series from forecast/actual service |
| `components/product/NeedsAttention.tsx` / `ExecutiveBrief.tsx` | Canonical Finding |
| `components/product/CommandPalette.tsx` | Call Butler API |
| `components/product/DataHealthChip.tsx` | Real DataSync |
| `middleware.ts` | Optional `/app` gate behind env flag |
| `openapi/radr-v1.yaml` | Expand to match Finding/Action/Forecast schemas |

---

## 21. Files to deprecate (after migration)

| File / area | Why |
|-------------|-----|
| Dual Signal vs PriorityFinding parallel queues | One Finding model |
| `PerformanceChart.tsx` / `buildPerfSeries` if unused | Dead duplicate |
| Hardcoded EXAMPLE blocks on controls page | Replaced by Action service |
| Client-only `resolveSignal` as source of truth | Server Action workflow |
| Auth-tree placeholder pages that duplicate Control Center without data | Merge or mark legacy |
| Orphan marketing leftovers called out in `RADR_PRODUCT_AUDIT.md` | Cleanup when touching marketing |

Do not delete demo fixtures until DemoDataProvider covers Overview, Service Map, Findings, Value, Butler.

---

## Phase status (2026-08-24)

| Phase | Status | Notes |
|-------|--------|-------|
| 1 Audit | Done | `RADR_ARCHITECTURE_AUDIT.md` |
| 2 Domain model | Done | Zod + Drizzle Finding/Action/Verification/Reservation/Waitlist |
| 3 Domain calcs | Done | `lib/radr/calc` + shared pct/occupancy/labor helpers |
| 4 Finding engine | Done | Rules + dedupe + priority; Overview uses `findingsForScope` |
| 5 Action + Verification | Done | `lib/radr/actions/service` (in-memory until API persist) |
| 6 Morning Brief | Done | `lib/radr/brief/morningBrief` → Overview narrative |
| 7 Reservation / waitlist | Done | Economics + waitlist recovery matcher |
| 8 Forecasting | Done | `lib/radr/forecast/service` with drivers + labor demand |
| 9 Butler tools | Done | RBAC-aware tools; Finding-based; write confirm payload |
| 10 Ingestion | Done | Idempotent raw identity + reservation processor |
| 11 Reconciliation | Done | Explicit + scored POS↔reservation links |
| 12 Auth + RBAC | Partial | Scope RBAC module; `/app` still demo-ungated |
| 13 Data health | Done | Health report + confidence multiplier (chip still demo UI) |
| 14 Onboarding validation | Done | Coverage → RADR READY gate helper |
| 15 Notifications | Done | Preference rules + email drafts (no sender yet) |
| 16 Billing readiness | Done | Subscription model helpers (no Stripe UI) |
| 17 Security / privacy | Done | Webhook HMAC, PII strip, secure headers map, log redaction |
| 18 Tests | Done | `tests/architecture-phases.test.ts` + existing suites (86 tests) |

**Still not production-live (honest):** real provider OAuth, credential vault, job queue, email delivery, `/app` auth gate, DB persistence of findings/actions from engine, observability vendor (Sentry/OTel).

---

## Phase 2 status (2026-08-24)

**Done**
- Canonical Zod/TS under `lib/radr/domain/` (Finding, Action, Verification, Reservation, WaitlistEntry, LocationProfile, Money)
- Drizzle tables + migration `drizzle/0001_domain_model.sql` (findings, actions, verifications, reservations, waitlist_entries; extended locations)
- Adapter `lib/radr/findings/fromPriorityFinding.ts` + `findingsForScope`
- Overview consumers: `ControlCenter`, `NeedsAttention`, `ExecutiveBrief` use canonical `Finding`
- Tests: `tests/domain-model.test.ts`

**Not yet (later phases)**
- Persisting demo findings to DB
- Finding engine / dedupe runtime
- Action API wiring for “Add to actions”
- UI still carries `presentation` hints until Action engine owns CTAs

---

## 22. Testing baseline (expand)

**Present:** Vitest for findings math, reservations, butler snapshot, comparison, floor, integrations demo, tenant isolation, security, product routes.

**Add next:**
- Unit: margin, labor %, booking value, cancellation exposure, waitlist recovery, verified value, FX, forecast decomposition, priority scoring, dedupe
- Integration: normalize idempotency, reconcile, finding create, action lifecycle, verification
- Permission: location scope, Butler tool denial
- E2E: login, scope switch, finding → action → verify, Service Map, stale data, back button

---

## 23. Final product questions (readiness gate)

A live customer must answer:

1. What is happening?
2. What changed?
3. What needs action?
4. How much money?
5. Why?
6. What should we do?
7. What if we do nothing?
8. What happened after we acted?
9. Can RADR prove the value?
10. Where did this number come from?
11. Can I trust the data?

| Question | Today | After target architecture |
|----------|-------|---------------------------|
| 1–6 | Demo narrative / partial findings | Finding engine + Brief + Butler |
| 7 | Weak | Forecast + counterfactual on findings |
| 8–9 | Fixture verification | Action + Verification ledger |
| 10 | Partial (evidence rows in findings) | Provenance on every metric |
| 11 | Demo chip | Data Health + freshness → confidence |

---

## 24. Immediate next step

**Phase 2 — Canonical domain model**

1. Add Zod + TS types for Finding, Action, Verification, Reservation, WaitlistEntry (canonical).
2. Extend Drizzle schema (migrations) without wiring all UI yet.
3. Adapter: map `PriorityFinding` → canonical Finding for one Overview consumer.
4. No new pages. No fake integrations. No production-readiness claims.

---

*End of audit. Implementation proceeds only from Phase 2 forward, incrementally.*
