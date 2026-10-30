# Value Reference Map — Verified ROI / Proof System

**Route:** `/app/value`  
**Status:** PASS 1 complete · PASS 2 Overview shipped — awaiting visual approval (`tmp/value-pass2-1512x982.png`)  
**Visual SSOT:** attached Verified Value Analytics mockup

## Thesis

RADR Value = proof layer. Never count EXPECTED as VERIFIED.

Loop: **DECISION → ACTION → OBSERVATION → EVIDENCE → VERIFICATION → VALUE → MEMORY**

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Aggregate SSOT | `lib/radr/product/valueAggregate.ts` | **KEEP** — `deriveValueAggregate` · verifiedTotal |
| Canon reconcile | `lib/radr/product/verifiedValueCanon.ts` | **KEEP** — Control Center ≡ Value |
| Trend history | `lib/radr/product/demoValueHistory.ts` | **KEEP** — cumulative MTD · prior MTD |
| Euro proof chain | `lib/radr/product/euroTrace.ts` | **KEEP / RECOMPOSE UI** — D-4102 proof path |
| Honest miss | `lib/radr/product/valueMiss.ts` | **KEEP** — D-4410 €420 / €90 / €0 |
| Decision store | `lib/radr/decision/store.ts` | **KEEP** — sealed verified amounts |
| D-4102 economics | supplier demo · €6.80 / €7.45 / 420 L / €273 | **KEEP** |
| Service outcomes | `lib/radr/service/verifiedOutcomes.ts` | **MOVE TO DETAIL** / closed Decisions |

## Old presentation (REMOVE / RECOMPOSE)

| Old (`app/app/value/page.tsx` + polish CSS) | Disposition |
|--------------------------------------------|-------------|
| Long-scroll cockpit + service dump | **REMOVE** — replace with compact Overview |
| PillNav + charts reused loosely | **RECOMPOSE** — Daylight Value shell |
| Hardcoded / divergent CFO €612K fixtures | **DO NOT USE** as Value truth |
| Parallel lab Value route | **LEAVE** — do not replace product with lab |

## Canonical MTD (restaurant · CFO)

| | |
|--|--|
| **Verified Value** | **€3,793** |
| Decisions | 6 |
| Prior MTD | €3,520 |
| Δ | +8% (≈ +€273 · D-4102) |

### Driver reconciliation

| Driver | € | Decision | Notes |
|--------|---|----------|-------|
| Service capacity | 690 | D-1920 | Mockup card 1 |
| Procurement | 1,590 | D-1842 | Mockup card 2 |
| Operating pattern | 350 | D-7401 | Mockup card 3 |
| Social / mix | 280 | D-7302 | Mockup card 4 labeled “Cancellation recovery” in ref — product uses accurate class |
| Supplier / AP | 273 | D-4102 | Mockup card 5 |
| Menu economics | 610 | D-7110 | In ledger · shown as quiet “also verified” so 5-card layout matches ref |

**690 + 1,590 + 350 + 280 + 273 + 610 = 3,793** ✓

## Component plan

```
components/product/value/engine/
  ValueShell.tsx
  ValueOverview.tsx
  ValueTrendChart.tsx
  value-engine.css
lib/radr/product/valueProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — static Overview · 1512×982 · **await approval**
3. PASS 3 — drivers + trend interaction
4. PASS 4 — Honest Miss + Trace
5. PASS 5 — Proof Path depth
6. PASS 6 — closed Decisions E/O/V
7. PASS 7 — Over time / By class / By location
8. PASS 8 — CC · Decisions · Intelligence · Memory
9. PASS 9 — reconcile QA + Playwright
