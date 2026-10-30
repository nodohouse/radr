# Value Calculator — Assumptions Registry

**Code SSOT:** `lib/marketing/value-calculator/assumptions.ts`  
**Rule:** Do not invent “industry benchmarks.” Prefer `internal_modeling_assumption`. Public citations only when real and dated.

Last reviewed: 2026-10-23

---

## Rate units

All opportunity rates are **annual fractions of the category base** (see model doc).  
`low` / `base` / `high` define the range. Headline uses low→base (modeled), not high.

---

## Default operating assumptions (when “I don’t know”)

| Key | Restaurant | Hotel | Mixed / Other | sourceType |
|-----|------------|-------|---------------|------------|
| laborPctOfRevenue | 0.28 | 0.32 | 0.30 | internal_modeling_assumption |
| foodCogsPctOfRevenue | 0.28 | 0.08 | 0.18 | internal_modeling_assumption |
| purchasingPctOfRevenue | 0.32 | 0.18 | 0.25 | internal_modeling_assumption |
| deliveryMixPct | 0.15 | 0 | 0.08 | internal_modeling_assumption |
| occupancy | — | 0.72 | 0.70 | internal_modeling_assumption |
| otaMixPct | — | 0.45 | 0.30 | internal_modeling_assumption |
| roomRevenueShare | — | 0.65 | 0.40 | internal_modeling_assumption |

---

## Opportunity rates (of relevant base)

| id | low | base | high | verticals | overlapGroup | sourceType |
|----|-----|------|------|-----------|--------------|------------|
| laborOpportunityRate | 0.015 | 0.03 | 0.05 | all | labor_cluster | internal_modeling_assumption |
| supplierLeakageRate | 0.008 | 0.015 | 0.028 | all | ap_cluster | internal_modeling_assumption |
| procurementDispersionRate | 0.006 | 0.012 | 0.022 | all | ap_cluster | internal_modeling_assumption |
| reconciliationVarianceRate | 0.002 | 0.005 | 0.01 | all | recon_cluster | internal_modeling_assumption |
| foodWasteOpportunityRate | 0.01 | 0.02 | 0.035 | restaurant, mixed, other | food_cost_cluster | internal_modeling_assumption |
| perishableRevenueOpportunityRate | 0.008 | 0.018 | 0.03 | all | yield_cluster | internal_modeling_assumption |
| channelMixOpportunityRate | 0.01 | 0.02 | 0.035 | hotel, mixed | yield_cluster | internal_modeling_assumption |
| readinessOpportunityRate | 0.004 | 0.01 | 0.018 | hotel, mixed | yield_cluster | internal_modeling_assumption |
| revenuePricingOpportunityRate | 0.004 | 0.01 | 0.02 | all | yield_cluster | internal_modeling_assumption |
| guestExperienceOpportunityRate | 0.002 | 0.005 | 0.01 | all | guest_cluster | internal_modeling_assumption |

---

## Portfolio & overlap

| Key | Value | Notes |
|-----|-------|-------|
| portfolioCapRate | 0.08 | Cap total modeled ≤ 8% of annual revenue |
| overlapCorrelationFactor | 0.35 | Non-primary categories in same group |
| defaultCaptureRate | 0.20 | Conservative value capture |
| captureRateMin / Max | 0.05 / 0.50 | Sensitivity bounds |

---

## Time-to-prove & effort (ranking, ordinal)

| Category | timeToProve (higher=faster) | effort (higher=harder) |
|----------|----------------------------|------------------------|
| supplier_ap | 0.9 | 0.3 |
| reconciliation | 0.85 | 0.35 |
| labor | 0.6 | 0.55 |
| procurement | 0.7 | 0.45 |
| food_waste | 0.55 | 0.5 |
| perishable | 0.5 | 0.6 |
| channel_mix | 0.55 | 0.55 |
| readiness | 0.5 | 0.5 |
| revenue_pricing | 0.45 | 0.65 |
| guest_experience | 0.35 | 0.7 |

---

## Evidence packs (UI)

Documented in code `EVIDENCE_BY_CATEGORY` — invoices/contracts for AP, schedules/timeclock for labor, PMS/channel for hotel, POS/menu/inventory for restaurant mix, etc.

---

## Disclaimer (canonical)

> Illustrative model based on information provided and stated assumptions. Results are not guaranteed savings, financial advice, or Verified Value.
