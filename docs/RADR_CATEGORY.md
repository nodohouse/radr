# RADR Category — Verified Hospitality Decision Intelligence

**Status:** Canonical category definition (2026-09-14)  
**Binding doctrine:** `.cursor/rules/radr-product-doctrine.mdc`  
**Loop:** `docs/THE_RADR_LOOP.md` · `lib/radr/loop.ts`

## Category

**RADR is Verified Decision Intelligence for Hospitality** — the decision layer above the hospitality stack.

Systems underneath keep recording (POS, PMS, reservations, labor, accounting, suppliers, delivery, channels). RADR continuously understands the operation and produces **auditable decisions** with evidence, economics, deadlines, and verified outcomes.

### Category line (external)

Your software tells you what happened.  
RADR tells you what to do next — and whether it worked.

### Category line (internal)

Systems record. RADR decides. Humans provide the hospitality.

## What we refuse to become

Not another: restaurant management platform · hotel PMS · RMS · scheduling · BI · finance dashboard · reservation platform · generic AI copilot.

Integrate systems of record. Own: cross-system understanding, attention, decisioning, simulation, action orchestration, verification, learning.

## The loop

```
OBSERVE → UNDERSTAND → PREDICT → SIMULATE → DECIDE → PREPARE → ACT → VERIFY → LEARN
```

Compatible with existing public stages:

`OBSERVE → DETECT → UNDERSTAND → QUANTIFY → PREPARE → ACT → VERIFY → LEARN`

| New emphasis | Maps to existing |
|--------------|------------------|
| PREDICT | Forecast / expected value (Quantify + forecast objects) |
| SIMULATE | Counterfactuals / scenarios (whitespace — build deliberately) |
| DECIDE | Decision objects + attention ranking |

Every feature must improve at least one loop stage.

## Signature concepts

| Concept | Intent |
|---------|--------|
| **Attention** | What deserves a human vs silent handling |
| **Attention budget** | Ruthless ranking; “2 things need you” |
| **HospitalityOperatingTwin** | Living ops model — not a 3D visualization |
| **PerishableValueOpportunity** | Time-decaying inventory / capacity value |
| **Decision** | Auditable decision object (not a chat tip) |
| **Decision Ledger** | What we believed → chose → verified |
| **OperatingDNA** | Location-specific learned behavior |
| **Verified Value** | Recovered / protected / created / avoided with proof chain |
| **Autonomy ladder** | Earn execution rights per decision class |

## Control Center = decision cockpit

Primary surface:

- **NEEDS YOU**
- **RADR IS HANDLING** (rollup)
- **WATCHING** (quiet)
- **VERIFIED** (since last check)

Not: chart walls, KPI graveyards, task inboxes.

Signature pattern: **Since your last check**.

## Decision UI pattern

Every material decision:

**WHAT? · SO WHAT? · NOW WHAT? · WHY? · WHAT IF?**

Always include: cost of doing nothing · recommended option · expected net · confidence · deadline · role · evidence on demand.

States must stay explicit: OBSERVED · ESTIMATED · PREDICTED · RECOMMENDED · VERIFIED.

## Roadmap (category build order)

| Phase | Focus |
|-------|--------|
| **1** | Decision cockpit · Attention engine · Decision objects · Evidence · Value at risk · Role compression |
| **2** | Operating Twin · Time · Capacity · Constraints · Perishable inventory |
| **3** | Predict + Simulate · Counterfactuals · Expected value · Deadlines |
| **4** | Act · Prepared actions · Approvals · Provider integrations · Playbooks |
| **5** | Verify + Learn · Decision ledger · Verified Value 2.0 · Forecast error · Location DNA |
| **6** | Controlled autonomy · Trusted low-risk decision classes only |

## Already in motion (do not rebuild)

Extend these — do not fork:

- Attention / Control Center calm UX
- Finding → Action → Verification
- `DecisionObject` adapter (`lib/radr/decision/types.ts`)
- Verified Value with evidence discipline
- Role lenses / three demo verticals (restaurant, boutique hotel, serviced apartments)
- Weather / perishable terrace as a decision-shaped demo (rain → capacity → contribution → prepare)

## Design tests (every PR)

1. Does this help observe / predict / decide / act / verify / learn?
2. Does this reduce human decisions — or add dashboard surface?
3. Is this another category’s system of record? → integrate.
4. Are OBSERVED / PREDICTED / VERIFIED kept distinct?
5. Would silence be more trustworthy than shipping this insight?

## Success metrics

Optimize: attention saved · decisions avoided · time-to-action · verified value · prediction accuracy · false-alert rate · adoption of prepared actions.

Deprioritize: DAU · time in app · chart count · Finding volume.
