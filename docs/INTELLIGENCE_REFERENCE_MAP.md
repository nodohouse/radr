# Intelligence Reference Map — Operating Intelligence Engine

**Route:** `/app/intelligence`  
**Status:** PASS 1–7 shipped · Cost Movers visual SSOT + domain adapters + Decision live state + Playwright (`tests/e2e/intelligence-engine.spec.ts`)  
**Visual SSOT:** attached procurement / Findings mockup (Hospitality Procurement Intelligence Dashboard)

## Thesis

RADR Intelligence = analytical brain of RADR.

Loop: **OBSERVE → CONNECT → EXPLAIN → PRIORITISE → PREDICT → RECOMMEND → DECIDE → VERIFY → LEARN**

Not: dashboard · KPI page · AI chat · long report · generic insights feed.

Core framing (KEEP): **What is moving contribution?**

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Module registry | `lib/radr/intelligence/moduleRegistry.ts` | **KEEP** — domain modules · `cost_movers` · `supplier_variance` |
| Ops modules / olive oil | `lib/radr/intelligence/opsModules.ts` | **KEEP LOGIC** — €6.80 / €7.45 / 420 L / €273 · D-4102 |
| Canonical findings | `lib/radr/intelligence/finding.ts` | **KEEP + RECOMPOSE** — contribution drivers · levers |
| Architecture / lenses | `lib/radr/intelligence/architecture.ts` | **KEEP** — BUY/LABOR/SELL/RECOVER · loop vocabulary |
| Decision D-4102 | `DECISION_IDS.supplier` / canonical demo | **KEEP** — Review Decision CTA |
| Category modules | `categoryModules.ts` · `recommendedModules.ts` | **KEEP** — domain filtering |
| Pin / Add to Dashboard | `IntelligencePinContext` · `AddToDashboardButton` | **RECOMPOSE UI** — Favorite / Add to Dashboard |
| Experience composer | `experienceComposer.ts` | **KEEP** — curated overview ranking |

## Old presentation (REMOVE / RECOMPOSE)

| Old surface (`IntelligenceHub.tsx` + hub CSS) | Disposition |
|-----------------------------------------------|-------------|
| Module-centric Findings list | **RECOMPOSE** as ranked Finding model (cost-movers first) |
| Generic module viz via `renderIntelModule` | **MOVE TO DETAIL** — replace Cost Movers with SKU strip + chart |
| Repeated Favorite / Add to Dashboard / status copy | **REMOVE DUPLICATE** |
| Ambiguous confidence vs Decision state | **FIX** — HIGH CONFIDENCE ≠ DECISION FORMED |
| Parallel experimental routes | **DO NOT ADD** — replace canonical `/app/intelligence` |

## Views → reference

| Surface | URL | Content |
|---------|-----|---------|
| Overview (default) | `/app/intelligence` | Findings rail · Cost movers selected · olive oil chart · RADR Says |
| Domain filter | `?domain=procurement` | Re-rank findings |
| Finding | `?finding=cost-movers` | Select Finding |
| SKU | `?finding=cost-movers&sku=olive-oil` | Select SKU |
| Period | `&period=30d` | 7D / 30D / 90D / 1Y |

## Flagship Finding (PASS 2)

**Cost movers** · Procurement  
Question: Which vendor SKUs are drifting in price?  
SKUs: Bluefin tuna · Extra virgin olive oil (default) · Chicken supreme · Coke post-mix  
Decision: D-4102 · €2,247 exposure · 30D  
Olive oil: contract €9.10 → invoiced €10.40 · +9.6% · €273 · Mediterranean Direct

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — Overview / Procurement / Cost Movers UI — **await visual approval**
3. PASS 3 — SKU · chart · evidence · RADR Says interactions
4. PASS 4 — Decision · confidence · recommendations · expected outcome
5. PASS 5 — domain adapters
6. PASS 6 — Control Center / Decisions / Live / Data Health / Memory / Dashboards
7. PASS 7 — Playwright + visual QA

## Component plan

```
components/product/intelligence/engine/
  IntelShell.tsx
  IntelFindingsRail.tsx
  IntelCanvas.tsx
  IntelSaysRail.tsx
  IntelPriceChart.tsx
  intel-engine.css
lib/radr/product/intelligenceEngine.ts
```
