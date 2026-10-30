# Value Calculator — Model

**Route:** `/value-calculator`  
**Engine:** `lib/marketing/value-calculator/calculateValueOpportunity.ts`  
**Assumptions registry:** `lib/marketing/value-calculator/assumptions.ts`  
**Detail:** [`VALUE_CALCULATOR_ASSUMPTIONS.md`](./VALUE_CALCULATOR_ASSUMPTIONS.md)

Illustrative model. Not guaranteed savings. Not Verified Value. Not financial advice.

---

## Purpose

Estimate:

1. Where value may be leaking  
2. Which opportunity areas matter  
3. Modeled annual opportunity **range**  
4. What is worth investigating first  
5. Capture scenarios  
6. Evidence required  
7. Illustrative ROI **only if** investment is supplied  

Never: `revenue × random %` as the headline story.

---

## Inputs

| Field | Notes |
|-------|-------|
| `vertical` | `restaurant` · `hotel` · `mixed` · `other` |
| `otherKind` | resort / apartments / bar / multi-venue / other (conservative generic model) |
| `locations` | sites / properties / venues |
| `annualRevenue` | total **or** derived from avg × locations |
| `currency` | reporting currency code |
| Operating metrics | labor %, COGS/food %, delivery mix, occupancy, ADR, OTA mix, purchasing — optional |
| `unknownFields` | every advanced field may be “I don’t know” → ASSUMED |
| `painAreas` | selected opportunity classes (or “not sure” → all applicable) |
| Maturity | system count · reconcile cadence · manual recon · decision standardization |
| `captureRate` | default conservative (~20%) |
| `annualInvestment` | optional — enables ROI |

---

## Output shape

```ts
{
  total: { low, modeled, high },      // annual, reporting currency
  headline: { low, modeled },         // conservative → modeled (not high)
  categories: CategoryResult[],
  confidence: "low" | "medium" | "high",
  confidenceReasons: string[],
  evidenceReadiness: Record<CategoryId, number>, // 0–1
  startingOpportunity: CategoryId,
  startingWhy: string[],
  captureScenario: { rate, capturedLow, capturedModeled },
  roi: null | { netLow, netModeled, roiLow, roiModeled, paybackMonthsModeled },
  verifiedValue: 0,
  methodology: { disclaimer, assumptionIds, overlapGroupsApplied },
}
```

---

## Category formulas (deterministic)

For each applicable category `c`:

```
base_c = relevantSpendOrRevenue(vertical, inputs, c)
raw_c = base_c × rate_c   // rate from assumptions low/base/high
```

Relevant bases (examples):

| Category | Typical base |
|----------|--------------|
| labor | labor cost ≈ revenue × labor% (or assumed %) |
| supplier_ap | purchasing spend (or assumed % of revenue) |
| procurement | same purchasing base |
| reconciliation | revenue (settlement / payment volume proxy) |
| perishable | restaurant: contribution proxy; hotel: room revenue |
| food_waste | food/COGS spend |
| channel_mix | hotel room / OTA-exposed revenue |
| readiness | hotel labor or rooms × ADR proxy |
| revenue_pricing | revenue |
| guest_experience | revenue (small rate — diagnostic only) |

Rates: see assumptions registry. `sourceType`: prefer `internal_modeling_assumption` unless a public citation exists.

---

## Overlap protection

Categories are **not** summed raw.

1. Assign each category to an **overlap group** (e.g. `food_cost_cluster`, `hotel_yield_cluster`, `labor_cluster`).  
2. Within a group, take `max(primary)` + `sum(others) × correlationFactor` (default 0.35).  
3. Apply a **portfolio cap**: total modeled ≤ `revenue × portfolioCapRate` (assumption).  
4. Document groups in result `methodology.overlapGroupsApplied`.

---

## Confidence

Score from known vs assumed inputs + specificity:

| Score | Label |
|-------|-------|
| ≥ 0.7 | high |
| ≥ 0.4 | medium |
| else | low |

Reasons list which fields were supplied vs assumed. Not “AI confidence.”

---

## Evidence readiness

Per category 0–1 from maturity (systems connected, reconcile cadence, manual recon inverse, standardization). Used in ranking:

```
priority = modeledValue × evidenceReadiness × timeToProveScore × (1 / effortScore)
```

**START HERE** = highest priority, not necessarily largest raw dollars.

---

## Capture rate

Default 20% (user-adjustable).  

```
captured = modeledOpportunity × captureRate
```

Explains: not every identified opportunity becomes realized value.

---

## ROI (optional)

Only when `annualInvestment > 0`:

```
net = captured - investment
ROI = net / investment
paybackMonths ≈ investment / (captured / 12)   // if captured > 0
```

Label: **Illustrative ROI.**

---

## Currency

All math in selected reporting currency. No FX conversion in V1 (user enters figures already in that currency). Display with currency symbol map.

---

## Unknown inputs

Missing metrics → assumption midpoints from registry, tagged `ASSUMED` in UI and `confidenceReasons`.

---

## Verified Value

Always **0** in calculator output until real product evidence seals value.

---

## Unit tests

Cover: restaurant · hotel · mixed · zeros · unknowns · currencies · 1 vs 100 sites · high/low revenue · no/all pain · overlap · capture · ROI with/without investment · no NaN/Infinity · non-negative totals.
