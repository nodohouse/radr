# RADR Strategic Product Architecture

**Status:** Locked strategy · 2026-09-24  
**Scope:** One company · one product thesis · one design system · two operating worlds  
**Live references:** https://prep-ten-zeta.vercel.app/en · https://prep-ten-zeta.vercel.app/app?stay=1  

This document is the **north-star architecture** after product evolution.  
Implementation of website changes requires an explicit **marketing freeze lift** (`docs/MARKETING_SITE_FREEZE.md`). Product work may proceed under existing product-mode rules.

---

## 1. Category

| Layer | Statement |
|---|---|
| **Internal** | System of Decision Record for hospitality |
| **External** | Nothing off the RADR. |
| **Commercial wedge** | Recovery + Reconciliation |
| **Supporting** | Verified Decision Intelligence · the Decision layer above POS / PMS / labor / RMS / channels |

**Not:** restaurant management · hotel PMS · RMS · scheduling · BI · finance dashboard · reservation platform · generic AI copilot.

---

## 2. Core loop (canonical)

Public + product language must converge on one loop:

```
CAPTURE / CONNECT
  → UNDERSTAND
  → DECIDE
  → ACT
  → VERIFY
  → LEARN
```

| Stage | Meaning | Product surface |
|---|---|---|
| **CAPTURE / CONNECT** | Systems of record + (future) physical capture | Connections · Data Health · document ingest |
| **UNDERSTAND** | Materiality, drivers, forecast, context | Intelligence · Live · pulse · evidence |
| **DECIDE** | Futures · no-action baseline · recommendation | Decision object · Decision Room · Needs you |
| **ACT** | Prepare / approve / execute within policy | Prepared Action · autonomy ladder |
| **VERIFY** | Observed outcome · attribution · Verified Value | Value · Ledger · proof chain |
| **LEARN** | Operating Memory · playbooks · calibration | Memory |

**Compatibility note:** Older public copy used `CONNECT → UNDERSTAND → FUTURES → DECIDE → VERIFY → REMEMBER`. Futures is **inside DECIDE**, not a separate loop stage. Remember = Learn. Prefer the six-stage loop above going forward; do not maintain parallel loops.

**Internal engineering loop** remains compatible: OBSERVE → NORMALIZE → DERIVE → RELATE → DETECT → … → LEARN.

---

## 3. Decision object (hero product artifact)

Every material recommendation is a **Decision**, not a chat tip.

```
Evidence → Finding → Materiality → Futures → Decision
  → Action → Outcome → Verification → Verified Value → Memory
```

Decision UI always answers: **WHAT? · SO WHAT? · NOW WHAT? · WHY? · WHAT IF?**  
Always model **cost of doing nothing**. Never blur: OBSERVED · ESTIMATED · PREDICTED · RECOMMENDED · VERIFIED.

### Flagship sealed examples

| ID | World | Story | Economics |
|---|---|---|---|
| **D-4102** | Restaurant / Finance | Supplier AP variance | Contract €6.80/L · Invoice €7.45/L · 420 L · **€273** Verified |
| **D-1911** | Restaurant / Live | WAIT 12 MINUTES · kitchen →97% | Expected contribution **+€620** · Futures: Wait / Seat / Throttle |
| **Hotel readiness** | Hotel / Ops | CHECK-IN ON TRACK · ROOM READINESS ISN'T | Arrivals 42 · Ready 31 · At risk 7 · reassign housekeepers |

Shared demo orgs: **Northstar Restaurants** · **Northstar Hotels**.

---

## 4. Attention model

Classify into: **NEEDS YOU · RADR IS HANDLING · WATCHING · HANDLED · NO ACTION**

Work absorption: **HANDLE → PREPARE → ASK → INFORM**

Control Center answers only:

1. What needs me?
2. How are we doing?
3. What happens next?
4. What is RADR already handling?
5. Where is the risk?

Everything deeper is click-through. Do not dump strategic capabilities onto the Brief.

---

## 5. Autonomy ladder (governance strength)

0 Observe → 1 Recommend → 2 Prepare → 3 Approve required → 4 Auto-act within policy → 5 Autonomous low-risk only

Never overclaim execution. Approval + policy are a trust feature.

---

## 6. Two operating worlds · one platform

| | Restaurants | Hotels |
|---|---|---|
| Demand | covers · covers/hr · inbound | arrivals · pickup · occupancy |
| Capacity | kitchen · seats · prep | rooms ready · HK · OOO |
| Economics | contribution · COGS · labor % | ADR · RevPAR · net channel |
| Flagship live | pressure window · Menu pulse | readiness gap · arrival wave |
| Architecture | same Decision / Attention / Memory | same |

`VerticalExperienceProfile` (`lib/radr/vertical/experienceProfile.ts`) owns language + viz. Do not fork three intelligence architectures.

---

## 7. Product navigation (locked)

```
CONTROL     Center · Decisions · Value
HOUSE       House (BOH standards / captures)
OPERATE     Locations · Memory · Intelligence
PINNED      user dashboards (if any)
SYSTEM      Connections · Data Health
            Butler · Settings
```

Source: `lib/product/appNav.ts`. Do not expose architecture as 20 tabs.

---

## 8. Website story spine (target)

When freeze is lifted, homepage progression:

1. Hero — Nothing off the RADR.
2. What RADR sees
3. What needs you (real Control Center grammar)
4. Decisions + Futures
5. Action
6. Verified Value
7. Operating Memory
8. Restaurants + Hotels (equal weight)
9. Integrations / operational truth
10. Trust / governance
11. CTA → product

**Primary CTA:** See RADR in action → `/app?stay=1`  
**Secondary:** Explore the platform → `/product`

---

## 9. Reality boundary

| Class | Meaning |
|---|---|
| **LIVE NOW** | Real persistence / auth / adapters |
| **DEMO** | Believable product UX on Northstar fixtures |
| **PLANNED** | Designed; not shippable as production claim |
| **FUTURE** | Multimodal capture, voice, camera — roadmap only |

`/app` today is primarily **DEMO** (in-memory Decisions). Auth/onboarding/documents are **LIVE NOW** but not yet the Decision path. See `PRODUCT_REALITY_AUDIT.md` + `ROADMAP_CAPABILITY_BOUNDARIES.md`.

---

## 10. Success metrics

Optimize: human decisions avoided · decision time reduced · value recovered/protected/created · prediction accuracy · action adoption · false alerts · Verified Value · attention saved.

Not: DAU · time-in-app · Finding count · notification vanity.

---

## 11. Related docs

- `WEBSITE_PRODUCT_PARITY.md` — gap matrix /en ↔ /app  
- `MARKETING_CLAIM_AUDIT.md` — claim → LIVE/DEMO/PLANNED/FUTURE  
- `RESTAURANT_HOTEL_PARITY.md` — vertical depth  
- `DESIGN_SYSTEM_PARITY.md` — shared DNA  
- `ROADMAP_CAPABILITY_BOUNDARIES.md` — what not to claim  
- `VERTICAL_PARITY_ARCHITECTURE.md` — technical vertical profile  
- `PRODUCT_REALITY_AUDIT.md` — engineering truth  
- `MARKETING_SITE_FREEZE.md` — website change gate  
