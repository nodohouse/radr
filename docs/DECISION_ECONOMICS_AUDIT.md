# DECISION ECONOMICS AUDIT

**Date:** 2026-09-30 · Wave A7

## MoneyImpact convention

SSOT: `lib/radr/decision/economics/moneyImpact.ts`

Kinds: `EXPOSURE` · `EXPECTED_CONTRIBUTION` · `PROTECTED` · `INCREMENTAL` · `ACTUAL` · `VERIFIED`  
Sign: **+ = benefit**, **− = loss/exposure**

## Flagship checks

| Decision | Primary measure | Amount | Status |
|---|---|---|---|
| D-1911 | expected incremental vs seat-now | +€620 | PASS |
| D-1842 | incremental vs do-nothing | +€1,640 (exposure €1,840 separate) | PASS |
| D-7501 | expected incremental vs absorb | catalog | PASS |
| D-4102 | verified recovery | €273 sealed | PASS |
| D-8204 | emergency top-up economics | +€186 | PASS |

## Futures rule

`incrementalVsNoAction = selectedExpected − noActionExpected`  
Never double-count negative no-action exposure into incremental.

## Automated

`tests/money-impact-d1842.test.ts` · `tests/decision-economics-validator.test.ts` · `tests/product-integrity.test.ts`
