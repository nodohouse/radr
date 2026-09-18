# RADR Intelligence Architecture (working notes)

**Updated:** 2026-09-16  
**Product source of truth:** `lib/radr/intelligence/architecture.ts`  
**Rule:** Prefer extending these primitives. Do not create parallel Finding/Signal/Value models.  
**Category:** `docs/RADR_CATEGORY.md` — Verified Hospitality Decision Intelligence (decision layer above the stack).

## Definition

**RADR Intelligence** continuously turns fragmented operating data into an economic model of the business, then finds where a decision can still change the outcome.

**Law:** The number is not the intelligence. The connection is.

**Pipeline:** DATA → OPERATING STATE → RELATIONSHIPS → ECONOMIC EXPOSURE → FUTURES → DECISION → ACTION → OUTCOME → VERIFIED VALUE → MEMORY

## Four economic lenses (not four products)

| Lens | Definition | Not |
|------|------------|-----|
| **BUY** | Know what inputs really cost the operation | Invoice matching software |
| **LABOR** | Put capacity where demand will actually hit | Headcount / scheduling software |
| **SELL** | Choose demand with the strongest contribution | RMS / revenue management software |
| **RECOVER** | Reclaim value before it disappears | Collections software |

Cross-domain Decisions are first-class (e.g. BUY cost × SELL velocity × LABOR kitchen minutes).

## Website

`/solutions` (+ `/solutions/buy|labor|sell|recover`) — one Operating State hub; lenses switch choreography (docs / capacity flow / channels / Economic Clock). Sequence: SEE → CONNECT → UNDERSTAND → DECIDE → VERIFY → LEARN.

## Core loop

**Category / decision emphasis:**

OBSERVE → UNDERSTAND → PREDICT → SIMULATE → DECIDE → PREPARE → ACT → VERIFY → LEARN

**Public / product UX (canonical in code):**

OBSERVE → DETECT → UNDERSTAND → QUANTIFY → PREPARE → ACT → VERIFY → LEARN → OBSERVE

See `docs/THE_RADR_LOOP.md` and `lib/radr/loop.ts`.

**Internal pipeline (compatible, longer):**

CONNECT → OBSERVE → DETECT → QUANTIFY → EXPLAIN → RECOMMEND → PREPARE → APPROVE → ACT → VERIFY → LEARN

Do not invent a parallel Finding/Signal/Value model for the public loop.

## Canonical objects

| Object | Code | Persistence |
|--------|------|-------------|
| Finding | `lib/radr/domain/finding.ts` | Drizzle `findings` (schema ready; demo uses engine + scenarios) |
| Decision | `lib/radr/decision/types.ts` | Adapter from Finding today — deepen toward full Decision Ledger |
| Action | `lib/radr/domain/action.ts` | Drizzle `actions` + in-memory `lib/radr/actions/service.ts` |
| Verification | `lib/radr/domain/verification.ts` | Drizzle `verifications` + scenario store |
| Evidence | `lib/radr/evidence.ts` + `EvidenceBlock` | Embedded on Finding today |
| Intelligence vocab | `lib/radr/intelligence/architecture.ts` | Territories · primitives · detection types · reasoning pipeline |

## Canonical demo clock

All DEMO business time derives from `lib/radr/demoClock.ts`.

- `asOf`: `2026-08-19T17:30:00+02:00` (Europe/Berlin)
- Today: Wednesday 19 August 2026
- Yesterday: 18 August (Table 14 recovery completed)
- Tomorrow: 20 August (terrace weather opportunity)

Do not use browser `Date.now()` for demo “today”, “tonight”, or finding chronology.

Entry point: `lib/radr/canonicalDemo.ts`.

## Canonical demo ledger

Atomic events (`CANONICAL_EVENTS`):

| Event | Amount | State |
|-------|--------|--------|
| Labor peak capacity gap | €290 | Current exposure (LABOR, unresolved) |
| Supplier invoice discrepancy | €118 | Recoverable (BUY, unresolved) |
| Cancellation Table 14 | €192 potential → €184 observed | Verified (excluded from exposure) |

Derived (never typed independently in UI):

- Current exposure = 290 + 118 = **€408** (`currentExposureFromFindings`)
- Verified value = **€184** (`getVerifiedValueFromScenarios`)
- Recover Found = 118 + 192 = **€310** (`recoverLifecycleFromCanonical`)
- Still recoverable = **€118**; In action = **€0**; Verified = **€184**
- Terrace weather opportunity = (56 − 42) × €30 = **€420** gross (`berlinTerraceOpportunity`) — opportunity, not exposure
- Weather net = 420 − 72 FOH cost = **€348**; do-nothing = 10 × €30 = **€300**

## Value state semantics

`lib/radr/valueSemantics.ts`

IDENTIFIED → ACTIONABLE → ACTIONED → PENDING_VERIFICATION → VERIFIED | DISMISSED | EXPIRED

Money kinds must not be mixed: exposure, recoverable, opportunity, verified, forecast.

Verified findings do not appear in the urgent unresolved queue (`attentionNowFindings`).

## Finding lifecycle

Engine: `lib/radr/findings/engine.ts` (detect → complete → dedupe → score → sort) plus gold scenarios.

Priority is not euros alone (`lib/radr/findings/priority.ts`): financial impact, urgency, confidence, time sensitivity, actionability, recoverability, operational severity.

UI bands: ACT NOW · TODAY · WATCH.

## Verification model

Estimated opportunity (e.g. €192) is not verified value. Verified value is an observed outcome with evidence (e.g. POS €184). Proof chain lives on Verified Value and finding detail.

### Attribution strength

`verificationStrengthSchema`: **DIRECT** | **SUPPORTED** | **ESTIMATED**

- DIRECT: action and resulting transaction are linked (Table 14 waitlist → POS)
- SUPPORTED: strong evidence, imperfect causality
- ESTIMATED: modeled impact only — never label as Verified Value

## External context (architecture)

Weather is the first strong example of **EXTERNAL CONTEXT**.

External information is not itself a Finding. RADR determines whether it changes expected economics or operations.

Examples to support later (do not nav or stub pages now):

- Weather
- Local events
- Public holidays
- Major sports / concerts / conventions
- Transport or flight disruption

BAD: “Champions League match tonight.”  
GOOD: “Dinner demand is pacing 18% above comparable Tuesdays around tonight's match. Kitchen capacity constrains from 19:30. €760 at risk.”

## Weather context

Weather itself is **not** a RADR insight and **not** a product territory.

Weather becomes useful only when RADR connects it to an operational or economic consequence (covers, labor, terrace capacity, cancellations, mix, etc.).

- Location-scoped: `WeatherLocationRef` (locationId, timezone, optional city/coords) — never one org-global weather object
- Provider port: `lib/radr/weather/types.ts` (`WeatherProvider`)
- Demo adapter: `lib/radr/weather/demoProvider.ts` (deterministic fiction; no API keys)
- Opportunity math: `lib/radr/weather/calc.ts` (gross / cost / net / do-nothing)
- Detector: `lib/radr/findings/rules/detectWeatherSensitiveDemand.ts` → SELL finding
- Vertical channels (restaurant / hotel / bar_cafe): `lib/radr/weather/sensitivity.ts` — architecture only; one restaurant terrace detector is implemented
- Ask RADR: tool `get_weather` + intent `WEATHER_CONTEXT`; euros come from the same calculator as the UI
- Do not build a weather dashboard, sidebar item, or decorative weather UI

### Weather economics (Berlin demo)

| Input | Value |
|-------|--------|
| Expected demand | 56 covers |
| Scheduled terrace | 42 |
| FOH plan | 46 |
| Contribution / cover | €30 |
| FOH cost to capture | €72 |
| Comparable sample | n=23 |

Gross 420 · Net 348 · Do nothing 300.

Confidence is explainable from sample size, forecast freshness, and feed currency — not decorative “High”.

## Cancellation on Control Center

Service Pulse uses the **canonical Table 14 verified outcome** (`table14VerifiedCancellationEconomics`).

Do not show a second open cancel story (€256 / €156 / €38 / €62 residual) on the primary Control Center.

€192 = potential estimate. €184 = observed verified value.

## Action governance

Statuses in schema: PROPOSED, ACCEPTED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED.

Product copy mapping: APPROVED → ACCEPTED, EXECUTING → IN_PROGRESS. Integrations that cannot execute must not fake execution except in DEMO scenario replay.

## Since last check

`lib/radr/attentionState.ts` — storage is a port (`AttentionStore`). DEMO uses localStorage; LIVE should persist per user on the server.

Recently verified wins (e.g. €184 Table 14) sit beside the attention brief — not in the unresolved queue.

## Product UI

- Control Center: attention-first (`ExecutiveBrief` → `NeedsAttention` → Service / Forward). Compare / performance demoted under “Deeper operating context”
- Findings queue: `/app/findings` (engine). `/app/signals` redirects here.
- Recover: Found / Still recoverable / In action / Verified
- Nav: Operate · Territories · Portfolio · Intelligence · Admin (Reconciliation under Admin)

## Progressive depth

1. What needs attention?
2. Why?
3. What should I do? (gross / cost / net where modeled)
4. Show evidence
5. Data lineage / audit

## Auth / Ask

- DEMO Ask: capped to `org_northstar` / `loc_ber`
- LIVE Ask: session + org membership required; location IDs from DB only — never `"all"`
- Numbers: tools only (`lib/ai/tools.ts`); LLM does not invent euros
- Potential vs verified must survive the Ask layer (€192 ≠ €184)

## Next vertical work

1. Persist Finding/Action/Verification writers to Drizzle
2. Retire remaining Signal/Control dual-tree in TerritoryWorkspace
3. Wire labor/sell detectors to same approve→verify UX
4. Server-side attention state for multi-device “since last check”
5. Live weather adapter behind `WeatherProvider` (server-side credentials only)
6. Portfolio weather exceptions across locations
7. Additional external-context detectors (events, holidays) without nav clutter

---

## Future requirement: core intelligence + vertical operating models

RADR needs one shared intelligence philosophy:

Find what matters → Understand why → Quantify the financial consequence → Recommend what to do → Verify what happened.

### RADR CORE

Finding · Evidence · Action · Verification · Value · Priority · Confidence · Ask RADR · Permissions · Audit

### OPERATING MODELS

**Product SSOT (not marketing):** `lib/radr/domain/hospitalityOperatingProfile.ts`

| Profile id | Support | Notes |
|------------|---------|--------|
| `restaurant_full_service` | **live** | Berlin dinner demo + production path |
| `boutique_hotel` | **demo** | Canal House Amsterdam Control Center |
| `serviced_apartments` | **demo** | Lisbon Residences (unit / turnover / orphan night) |
| `vacation_rental` | **demo** | Aliases Lisbon Residences demo path |
| `hotel`, `spa`, `bar`, `resort_mixed` | **stub** | Typed shells only |

Organization → Location → OperatingUnit (`lib/radr/domain/operatingUnit.ts`).

Resolve profile: `lib/radr/operating/resolveProfile.ts` (location, onboarding venueType, demo vertical).

Venue terminology: `lib/radr/operating/terminology.ts` — Table/Cover vs Room/Room night vs Unit/Night.

Perishable inventory types include `room_night`, `unit_night`, `treatment_slot`, `event_slot` (`lib/radr/activeRevenue/liveRecovery.ts`).

Integration families: `lib/radr/integrations/families.ts` — filter onboarding connect UX by profile.

**Marketing** `industryIntelligence.ts` stays marketing-only. Do not drive product runtime from it.

**Honesty:** Hotel / serviced-apartment / spa paths are DEMO or onboarding preview until PMS (etc.) are real. Do not claim LIVE hotel intelligence.

Demo switcher (synthetic only): Restaurant · Boutique hotel · Serviced apartments (`DemoVerticalSwitcher`).

Onboarding teaches the business first (org → operate → units → role → KPIs → system → first insight), then persists `operatingProfileId` on org onboarding jsonb.

### Known → Missed → Predicted → Action → Verified

Core philosophy (`lib/radr/domain/intelligence.ts`):

| Class | Meaning |
|-------|---------|
| **KNOWN** | Metrics operators already see in PMS/POS/reporting |
| **MISSED** | Signals available but fragmented across systems |
| **PREDICTED** | Derived statistically / historically with confidence + drivers |
| **ACTIONABLE** | What RADR prepares or asks |
| **VERIFIED** | Observed outcome after action |

Related contracts:

- `Prediction` — point/range, confidence, drivers, baseline, role visibility
- `ValueExposure` — revenue/contribution/guest/ops impact + deadline
- `RecoveryOpportunity` — normalized across table / room_night / unit_night
- `MissedOpportunity` — upside not visibly “lost”
- `MetricDefinition` (domain) — role × vertical KPI registry (`lib/radr/domain/metricDefinition.ts`)
- `RoleLens` — decisions, known/missed/predicted, Control Center modules (`lib/radr/domain/roleLens.ts`)

Control Center composition: `lib/radr/controlCenter/compose.ts` from profile + role + phase.

Predictions must answer WHAT / WHY / HOW SURE / WHAT TO DO. Never opaque AI scores. Never fake precision.

### Legacy note — CORE vs MODELS (still valid)

Shared engine remains:
Restaurant · Hotel · Bar / Café · Group

A hotel must not receive restaurant assumptions. Weather, events, and other external context are interpreted through the active operating model.

Weather sensitivity channels differ by operating model (terrace vs leisure bookings vs beverage mix). Detectors interpret weather; weather data does not.

### Shared core concepts

Organization · Location · Revenue · Labor · Payment · Supplier · Invoice · Finding · Evidence · Action · Verification · Value

### Vertical extensions (examples)

**Restaurant:** Reservation, Cover, Table, Turn, Menu item, Order, Delivery channel, terrace utilization

**Hotel:** Property, Room, Stay, Occupancy, ADR, RevPAR, Housekeeping, spa, outdoor facilities

**Bar / café:** Terrace traffic, hot vs cold mix, daypart walk-ins

---

## Finished Work principle

**Standard:** RADR should leave as little work as possible for the operator.

A RADR output should leave the operator with less work than before RADR detected the issue.

Customer-facing loop (marketing and Control Center):

FIND → PREPARE → APPROVE → PROVE

(or NOTICE → PREPARE → DECIDE → VERIFY)

Internal loop:

CONNECT → OBSERVE → DETECT → QUANTIFY → EXPLAIN → RECOMMEND → PREPARE → APPROVE → ACT → VERIFY → LEARN

### Product rule

**Automate preparation. Govern execution. Verify outcomes.**

Do not imply external execution (schedule changes, supplier email, guest messaging, rate changes, payments) unless `executionCapability` is `SUPPORTED` for that action and org policy allows it.

### User attention is a scarce resource

Every notification, queue item, badge and escalation must justify why it needs the operator.

Success is not time spent in RADR. Success is: RADR required less attention while improving operating outcomes.

**Attention budget (design principle, not a UI meter):** spend operator attention only on high-impact decisions, high-urgency exceptions, low-confidence judgment calls, high-risk actions, and policy exceptions. Everything else should be handled, prepared, batched, summarized, deferred, or verified quietly.

### Control Center attention hierarchy

First viewport answers:

1. What needs you now?
2. What is ready for approval?
3. What did RADR handle since your last check?
4. What was verified?

Unresolved exposure (€408 = €290 + €118) stays separate from Verified Value (€184).

Operator attention states (map to Finding status; do not fork):

NEEDS YOU NOW · READY FOR APPROVAL · RADR HANDLING · WAITING FOR EXTERNAL · PENDING VERIFICATION · VERIFIED · WATCH

### Prepared Action (extends Action, does not fork)

`lib/radr/domain/action.ts` optional fields:

- `preparedSummary`
- `requiredApproverRole`
- `executionCapability`: `NONE` | `DRAFT_ONLY` | `SUPPORTED`
- `maxDelegationLevel`
- `evidenceRefs`
- `reversible`

`proposeActionFromFinding` / `createActionFromFinding` populate preparation fields with default `DRAFT_ONLY` capability.

UI: `PreparedActionCard` shows what RADR will do, economics, approver, reversibility, and execution capability — without fake send.

### Escalation quality

A good escalation is nearly self-sufficient: value, evidence, what RADR prepared, confidence, and the decision required.

### Role-based attention (document; partial UI)

| Role | Decision focus |
|------|----------------|
| GM | service, labor, local recovery |
| Finance | supplier discrepancy, Verified Value, reconciliation |
| Group | cross-location variance, escalations |
| Hotel RM | pricing, pickup, inventory, channel mix |

Do not overbuild until RBAC is complete.

### Delegation levels (architecture / governance; not a public taxonomy)

| Level | Name | Meaning |
|-------|------|---------|
| 0 | OBSERVE | Watch only |
| 1 | EXPLAIN | State what happened and why |
| 2 | RECOMMEND | State what should happen |
| 3 | PREPARE | Draft claim / shift / message / pricing review |
| 4 | EXECUTE_WITH_APPROVAL | Run after human approval |
| 5 | EXECUTE_UNDER_POLICY | Auto-run within explicit org rules |
| 6 | VERIFY_AND_LEARN | Observe outcome and feed controls |

Org policy examples (future — do not build a giant policy engine in this pass):

- Automatically prepare supplier discrepancies
- Require finance approval above €500
- Require GM approval for labor changes above a threshold
- Do not execute low-confidence external actions
- Never change room pricing without authorized revenue policy
- Automatically verify supported outcomes

### Future measurement (do not market fake hours)

Eventually Verified Value may sit beside operational work removed:

- manual reviews avoided
- reconciliations completed
- discrepancies / actions prepared / approved / executed / verified
- operator escalations avoided

Financial value created **and** operational work removed are both first-class goals.

### Ideal experience

RADR found it → investigated → quantified → prepared the response → brought only the decision that needed a human → tracked the result → verified what happened → the operator went back to running the business.

**Less operational work. More hospitality.**
