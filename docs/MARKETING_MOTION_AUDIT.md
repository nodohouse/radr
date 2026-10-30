# RADR marketing motion audit

Visual design is **frozen / approved**. This document scopes motion only.
Tokens: `lib/marketing/motion.ts` · easing `cubic-bezier(0.22, 1, 0.36, 1)`.

Intensity targets: Home 9 · Platform 8 · Leaks 7 · Trust 7 · Company 4 · Pricing 3.

---

## Implementation order

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Homepage hero + sticky Decision story | Done |
| 2 | Homepage global markets | Done |
| 3 | Platform surface browser | Done |
| 4 | Where value leaks explorer | Done |
| 5 | Trust interactions | Done |
| 6 | Company subtle motion | Done |
| 7 | Pricing minimal motion | Done |

---

## Polish bugs (pre-motion)

| Issue | Fix |
|-------|-----|
| Chrome shows `Soho · New York` + `19:48 · Soho · New York · Dinner` | Use `displayName` + `service · clock` only |
| Duplicate responsive content | Audit mobile/desktop dual renders |
| Ticker claims feel real | Relabel DEMO SIGNALS; illustrative items only |

---

## `/` Homepage

### Hero (`rx30-bleed`)

| Field | Value |
|-------|--------|
| Current | Static copy + DecisionLayerPreview |
| Purpose | First paint clarity, then quiet life |
| Animation | Headline + frame enter (opacity/y/scale); LIVE pulse; one green sweep; confidence 0→82 once |
| Trigger | Mount |
| Duration | 400–550ms enter · MICRO pulse |
| Mobile | Same, shorter enter |
| Reduced motion | Instant final state |
| Perf | Low — one-shot CSS/Motion |

### Hero Decision interaction (`DecisionLayerPreview`)

| Field | Value |
|-------|--------|
| Purpose | Futures comparison felt, not read |
| Animation | Card lift; future hover tips (recommended / kitchen risk / lower expected) |
| Trigger | Hover / focus |
| Duration | STANDARD |
| Mobile | Tap selects future + tip |
| Reduced motion | Tips only, no lift |
| Perf | Low |

### Sticky loop (`HomeStickyLoop`)

| Field | Value |
|-------|--------|
| Current | IO-driven stage swap · ~52vh steps |
| Purpose | One window: Observe→Learn |
| Animation | Sticky canvas; stage-specific body (signals→constraint→futures→prepared→verified→memory) |
| Trigger | Scroll progress · ~500vh desktop |
| Duration | CONTENT / SECTION |
| Mobile | Stacked panels + Next stage (no pin) |
| Reduced motion | Stacked, no pin |
| Perf | Medium — one sticky listener via `useScrollStage` |

### Global markets (`LocationsMarquee`)

| Field | Value |
|-------|--------|
| Phase | 2 |
| Purpose | Timezone-aware operating contexts |
| Animation | Slow rail + focal DEMO status |
| Trigger | Scroll / in-view |
| Reduced motion | Static chips |

### Other home sections

| Section | Purpose | Phase |
|---------|---------|-------|
| Pain / Connect | Quiet section enter only | Later |
| Impact / Close | Grouped enter, no child storms | Later |

---

## `/product` Platform

| Section | Purpose | Phase |
|---------|---------|-------|
| Systems → RADR paths | Data entering RADR | 3 |
| Surface browser | One preview morphs | 3 |
| Live / Decisions / Value / Memory / Health | Stage-specific demos | 3 |

---

## `/solutions` Where value leaks

| Category | Motion purpose | Phase |
|----------|----------------|-------|
| Supplier/AP | Contract vs invoice gap → exposure | 4 |
| Reconciliation | Expected/Actual diverge | 4 |
| Cost variance | Drivers stagger | 4 |
| Procurement | Price dispersion | 4 |
| Perishable | Value decay vs deadline | 4 |

---

## `/security` Trust

| Section | Purpose | Phase |
|---------|---------|-------|
| Autonomy ladder | Governance tangible | 5 |
| Data health toggle | Confidence → allowed action | 5 |
| Proof lineage | Trace chain | 5 |
| Ask RADR | Structured answers | 5 |

---

## `/company` · `/pricing`

| Route | Intensity | Phase |
|-------|-----------|-------|
| Company | Soft reveal, principles hover | 6 |
| Pricing | Journey line, compare expand, FAQ | 7 |

---

## Global chrome

| Element | Purpose | Notes |
|---------|---------|-------|
| Nav | Floating surface on scroll | 200ms · Phase 1 light |
| Buttons | Physical hover | Arrow +1–3px · Phase 1 |
| Ticker | DEMO SIGNALS marquee | Pause on hover · Phase 2 |

---

## QA checklist

- [ ] Slow / fast / reverse scroll
- [ ] Resize mid-animation
- [ ] Browser back
- [ ] Mobile rotation
- [ ] `prefers-reduced-motion`
- [ ] Keyboard tabs / focus
- [ ] No half-finished states
- [ ] Max one meaningful animation per viewport
