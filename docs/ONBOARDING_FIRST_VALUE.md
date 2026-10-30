/**
 * First-value onboarding — product spec (MVP).
 *
 * North star: TIME TO FIRST DECISION.
 * Full enterprise brief lives in the product workstream; this doc tracks what shipped.
 */

## Philosophy

Onboarding is complete when RADR has enough **real evidence** to form a trustworthy Decision — not when a progress bar hits 100%.

## MVP funnel (shipped)

```
ACCOUNT (auth)
→ WHO (role lens ≠ permission)
→ ORGANIZATION (name, industry, scale, reporting currency)
→ FIRST LOCATION
→ GOAL (Supplier/AP recommended)
→ EVIDENCE (upload | demo | connect later)
→ UPLOAD contract + invoice CSV
→ DATA HEALTH
→ ANALYZE (deterministic Supplier/AP)
→ FIRST DECISION REVEAL
→ CONTROL CENTER
```

Legacy questionnaire remains at `/onboarding?legacy=1`.

## Domain

- State: `lib/onboarding/firstValue.ts` + `lib/onboarding/types.ts`
- Persisted on `organizations.onboarding` (jsonb)
- Milestones tracked independently for resume / CS visibility
- Analytics events: `lib/onboarding/analytics.ts`

## Analysis

- `lib/onboarding/supplierApAnalysis.ts` — deterministic CSV match
- `POST /api/onboarding/analyze` — reads latest CONTRACT + INVOICE docs
- Templates: `/public/templates/radr-*-template.csv`
- Golden: €6.80/L vs €7.45/L × 420 L → €273

## Acceptance tests (code)

See `tests/onboarding-supplier-ap.test.ts`:

1. Golden variance → Decision
2. Clean rates → no Decision
3. Missing contract → insufficient evidence
4. Below materiality → no interrupt

## Not yet in MVP (next)

- Schema auto-detect UI / ambiguous field mapper
- Bulk location import UI
- Team invite after value
- Materiality policy editor
- Outcome → Verified Value in this funnel
- Integration OAuth onboarding
- Internal pilot admin / CS blocker view
- Persist Decision objects (still in-memory Control Center) — Phase 1–3 of PRODUCT_REALITY_AUDIT

## Copy rules

Prefer: RADR HAS ENOUGH EVIDENCE · RADR FOUND SOMETHING · NOTHING NEEDS YOUR ATTENTION  
Avoid: Awesome / You're all set / Let's supercharge
