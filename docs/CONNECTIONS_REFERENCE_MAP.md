# Connections Reference Map — Data Coverage + Trust + Decision Dependency

**Route:** `/app/connections`  
**Status:** PASS 1–7 complete · Overview + drawer + setup + gaps · Playwright `tests/e2e/connections-engine.spec.ts`  
**Visual SSOT:** attached RADR Connections Dashboard Overview mockup  
**Screenshot:** `tmp/connections-pass2-1512x982.png`

## Thesis

Connections is the **data coverage and system-of-record trust layer** — not an integration marketplace, not a logo catalog, not a setup splash.

Systems of record stay the source. RADR reads, validates, and decides above them.

Answers: WHAT IS CONNECTED? · WHAT DATA IS FLOWING? · HOW FRESH? · WHAT MISSING? · WHAT UNLOCKS? · WHICH DECISIONS DEPEND? · WHAT DEGRADED? · ESTATE COVERAGE? · WHAT NEXT?

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Live source fixtures | `lib/radr/product/integrations.ts` | **KEEP LOGIC** — base health rows · freshness · impact |
| Decision dependency map | `components/product/connections/dependentDecisions.ts` | **KEEP** — D-1911 / D-7110 / D-4102 wiring |
| Vendor logos | `components/product/connections/VendorLogo.tsx` | **KEEP** — unified logo shell + catalog |
| Catalog entries | `CONNECTION_CATALOG` in VendorLogo | **KEEP** — AVAILABLE / REQUEST_ACCESS / PLANNED |
| Data Health deep link | `/app/data-health` | **KEEP** — separate trust diagnostics |
| Role / vertical scope | `sourcesForDemo` | **KEEP** — restaurant vs hotel filtering |

## Old presentation (RECOMPOSE / REMOVE)

| Old (`app/app/connections/page.tsx`) | Disposition |
|--------------------------------------|-------------|
| Monolith page + `rp-cap` / `rp-conn-*` | **RECOMPOSE** → `connections/engine/*` |
| Summary strip without Coverage % | **RECOMPOSE** — Connected · Attention · Available · Coverage |
| Table without Actions column | **RECOMPOSE** — add ··· menu |
| No right intelligence rail | **RECOMPOSE** — RADR sees · Coverage donut · Unlocks · Need attention |
| Full catalog dump as “Catalog” | **RECOMPOSE** — Recommended 6–8 + View all |
| Missing OpenTable / Stripe in live rows | **MERGE** into Connections proof SSOT (demo estate = 8) |

## Canonical Overview composition (mock)

1. Header + Data Health →  
2. Summary strip (4 compact metrics)  
3. Search + category filters  
4. System Health & Coverage table (main)  
5. Right rail: RADR sees · Coverage by category · What RADR unlocks · Need attention  
6. Available Integrations (recommended cards)

## Component plan

```
components/product/connections/engine/
  ConnectionsShell.tsx
  ConnectionsOverview.tsx
  connections-engine.css
lib/radr/product/connectionsProofEngine.ts
```

## Deterministic demo (restaurant CFO)

| Metric | Value |
|--------|-------|
| Connected | 8 |
| Need attention | 2 (Xero STALE · Deliverect DEGRADED) |
| Available | 13 |
| Coverage | 84% |

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Overview · `tmp/connections-pass2-1512x982.png`~~
3. ~~PASS 3 — filter · search · row selection · system drawer~~
4. ~~PASS 4 — Decision deps · Data Health impact · confidence~~
5. ~~PASS 5 — setup / request access / notify me~~
6. ~~PASS 6 — coverage recommendations~~
7. ~~PASS 7 — Playwright `tests/e2e/connections-engine.spec.ts`~~

## Engine tree

```
components/product/connections/engine/
  ConnectionsShell.tsx
  ConnectionsOverview.tsx
  ConnectionsDrawer.tsx
  ConnectionsSetupModal.tsx
  connections-engine.css
lib/radr/product/connectionsProofEngine.ts
```

