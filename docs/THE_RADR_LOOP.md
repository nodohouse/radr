# THE RADR LOOP

**Updated:** 2026-09-14  
**Status:** Canonical product + marketing model  
**Category:** See `docs/RADR_CATEGORY.md` — Verified Hospitality Decision Intelligence

## Public name

**THE RADR LOOP**

Verified Decision Intelligence for Hospitality — the decision layer above the stack.  
Not “Datadog for hospitality.” Not another PMS / RMS / BI dashboard.

## Stages

**Category / decision emphasis (preferred product language):**

```
OBSERVE → UNDERSTAND → PREDICT → SIMULATE → DECIDE → PREPARE → ACT → VERIFY → LEARN
```

**Public / UX stages (canonical in code + marketing graphics):**

```
OBSERVE → DETECT → UNDERSTAND → QUANTIFY → PREPARE → ACT → VERIFY → LEARN → OBSERVE
```

| # | Stage | Meaning |
|---|--------|---------|
| 01 | Observe | Normalize signals into an operating picture |
| 02 | Detect | Identify what deserves attention (Finding candidate) |
| 03 | Understand | Correlate hospitality concepts — why it matters |
| 04 | Quantify | Economic consequence from canonical inputs (includes predict / expected value) |
| 05 | Prepare | Finish work before the operator (Prepared Action / Decision ready) |
| 06 | Act | Governed action only (approval / supported / policy) |
| 07 | Verify | Observe actual outcome; Verified Value needs evidence |
| 08 | Learn | Retain expected vs actual — Decision Ledger / Location DNA over time |

**Whitespace to deepen deliberately (do not fake):** PREDICT ranges, SIMULATE counterfactuals, DECIDE as first-class Decision objects, Decision Ledger.

Code: `lib/radr/loop.ts`

## Complementary graphics

| Graphic | Answers |
|---------|---------|
| **Operating model** | Where RADR sits (systems ↔ RADR ↔ outcomes) |
| **RADR Loop** | What RADR does inside |

Homepage: Hero → Loop → Operating model → Proof → Ask → Close

## Mapping to longer internal pipeline

Internal notes may still use:

CONNECT → OBSERVE → DETECT → QUANTIFY → EXPLAIN → RECOMMEND → PREPARE → APPROVE → ACT → VERIFY → LEARN

Public eight-stage names collapse:

- EXPLAIN → Understand
- RECOMMEND → Prepare (recommendation becomes prepared work)
- APPROVE → Act (governance boundary)

## Entities

The loop operates on the hospitality operating graph — Location, Service period, Reservation, Demand, Labor, Capacity, Supplier, Invoice, Product, Room, Table, Weather, Event, Action, Outcome, Verified Value.

Do not create a second ontology for the loop.

## State transitions (Finding)

| Value state | Typical loop stage |
|-------------|-------------------|
| IDENTIFIED / DETECTED | Detect → Understand → Quantify |
| ACTIONABLE | Prepare |
| ACTIONED | Act |
| PENDING_VERIFICATION | Verify |
| VERIFIED | Learn (retention) |

UI: `components/product/RadrLoopRail.tsx`

## Act governance

Act never means unrestricted autonomy.

Action may be:

- approved manually
- executed manually from a prepared action
- executed through a supported integration after approval
- executed automatically only under explicit org policy

Respect: permissions, role, financial threshold, confidence, risk, reversibility, policy, integration capability.

Never imply execution when it did not occur.

## Verify vs Learn

- **Verified Value** = observed outcome with evidence (Verify)
- **Learn** = retain prediction, action, expected, actual, variance for future estimates

Learning status:

- `pending` — no observed outcome yet
- `retained` — outcome stored; **no automatic model update claimed**
- `not_applicable`

Code: `lib/radr/outcomeHistory.ts` → `InterventionOutcomeRecord`

## Marketing fixture

Recover story closes the full loop:

- Potential $192
- Observed / Verified $184
- Variance retained

SELL weather ($420 / $72 / $348) remains the flagship opportunity example elsewhere — Verify not claimed until observation exists.

## Ask RADR

Questions should map to stages (“What are you observing?”, “What have you prepared?”, “What did you learn?”). Answers must use structured canonical data — never invent money.

## Since your last check

Represents movement through the loop (detected / prepared / approval / verified), not a static dashboard refresh.

## Strategic test

Every major feature should answer:

What does RADR observe? detect? understand? quantify? prepare? act? verify? learn?

If it only “shows another metric” or “generates another insight,” challenge whether it belongs.
