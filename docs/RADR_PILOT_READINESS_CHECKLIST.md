# RADR Pilot Readiness Checklist

**Purpose:** Gate a real restaurant pilot. Check items only when true in LIVE (or clearly labeled DEMO for demo-only capabilities).  
**Companion:** `docs/RADR_PILOT_READINESS_AUDIT.md`, `docs/pilots/CANCELLATION_RECOVERY_TEST.md`

Legend: `[ ]` open · `[x]` done · `[D]` demo-only acceptable · `[N/A]` not required for this pilot

---

## Organization and access

- [ ] Real organization can be created
- [ ] Real location can be configured (timezone, currency, service periods)
- [ ] User authentication works (signup, login, session)
- [ ] Password reset works with real email provider
- [ ] Permissions work **server-side** (not only hidden nav)
- [ ] Location-scoped access enforced for GM / regional / group roles
- [ ] Audit log records integration, finding, action, verification, config events

## Data connections

- [ ] Reservation source can connect (real provider or approved pilot adapter)
- [ ] POS source can connect (real provider or approved pilot adapter)
- [ ] Historical sync works
- [ ] Incremental sync works
- [ ] Webhook or poll path is idempotent
- [ ] Integration credentials encrypted at rest; never sent to browser
- [ ] Data health is visible in product (fresh vs stale vs error)
- [ ] Stale data reduces confidence (visible to user)

## Data correctness

- [ ] Currency is correct per location
- [ ] Multi-location views never sum mixed currencies without FX
- [ ] Timezone is correct (venue-local display for “tonight”)
- [ ] Reservations normalize correctly (no unnecessary guest PII)
- [ ] Orders normalize correctly
- [ ] Source identity retained (provider, connectionId, externalId, ingestedAt)

## Intelligence loop (cancellation recovery gold standard)

- [ ] Cancellation is detected
- [ ] Waitlist match can be identified
- [ ] Financial exposure is calculated (booking value vs recoverable)
- [ ] Finding answers WHAT / WHY / WHERE / WHEN / MONEY / URGENCY / CONFIDENCE / DO / EVIDENCE
- [ ] Action can be accepted
- [ ] Action lifecycle persists
- [ ] Replacement seating can be recorded / ingested
- [ ] Actual POS revenue can be linked
- [ ] Verified Value is conservative (observed, not hoped)
- [ ] Attribution does not over-claim RADR causality
- [ ] Full event timeline visible on finding detail

## Product surfaces (same source of truth)

- [ ] Morning Brief uses real domain data (or labeled DEMO)
- [ ] Control Center findings match Brief / Butler / Value
- [ ] Service Map reflects same reservation/waitlist state
- [ ] Butler uses real domain tools (no parallel hard-coded answers)
- [ ] Butler obeys permissions
- [ ] Provenance / “how calculated” available on material numbers
- [ ] Notifications: ACT NOW can email (if in scope); TODAY bundles; WATCH quiet

## Trust and operations

- [ ] Error states are clear (no vague “signal lost” for ops failures)
- [ ] Secrets are protected (no keys in git; `.env.example` placeholders only)
- [ ] GDPR baseline documented (minimization, retention, deletion, export path)
- [ ] Privacy / Terms / security pages present; counsel review flagged where needed
- [ ] No SOC2 / ISO / PCI claims unless true
- [ ] Backups exist and restore tested
- [ ] Observability exists (structured logs, error tracking, sync failure alerts)
- [ ] Demo data is clearly labeled DEMO
- [ ] Sandbox labeled COMING SOON until real
- [ ] No fake production claims on website or product
- [ ] No dead primary CTAs
- [ ] No console errors on critical flows
- [ ] No major accessibility failures on critical flows
- [ ] No major responsive failures (1440 → 375)
- [ ] No obvious performance regression

## Stop condition

- [ ] Pilot checklist owner signed off
- [ ] Cancellation recovery test (`docs/pilots/CANCELLATION_RECOVERY_TEST.md`) passes against shared SoT
- [ ] Feature freeze agreed: no new modules until pilot feedback

---

## Current snapshot (2026-08-27)

**DEMO gold-standard (Cancellation Recovery):** SoT wired across finding timeline, Value, Butler — Vitest green.  
**LIVE pilot:** Most items below remain open until real adapters + auth-gated `/app` + DB persistence.

- [D] Demo cancellation → waitlist → POS → €184 verified (shared SoT)
- [D] Butler answers Table 14 from same store
- [D] DEMO environment labeled in product chrome
- [ ] Real organization / LIVE auth gate on Control Center
- [ ] Real reservation + POS adapters
- [ ] Postgres-persisted finding/action/verification writers
