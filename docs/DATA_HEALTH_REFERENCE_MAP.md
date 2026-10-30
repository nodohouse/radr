# Data Health Reference Map — Evidence Trust + Decision Impact

**Route:** `/app/data-health`  
**Status:** PASS 1 complete · PASS 2 Overview ready for visual approval  
**Visual SSOT:** attached RADR Data Health Dashboard mockup  
**Screenshot:** `tmp/data-health-pass2-1512x982.png` (1512×982)

## Thesis

Connections answers **WHAT IS CONNECTED?**  
Data Health answers **CAN RADR TRUST THE EVIDENCE?**

This is the trust layer under Intelligence / Decisions / Value / Memory — not infrastructure monitoring.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Integration fixtures | `lib/radr/product/integrations.ts` | **KEEP LOGIC** — vendor ids · freshness strings · impact |
| Canonical rows | `lib/radr/product/dataHealthCanonical.ts` | **KEEP LOGIC** — role scope · unhealthy counts · Control Center pulse |
| Decision dependencies | `dependentDecisions.ts` / Decision IDs | **KEEP** — D-4102 · D-1911 · D-7110 |
| Vendor logos | `VendorLogo.tsx` | **KEEP** — 40×40 shell |
| Connections deep link | `/app/connections?system=` | **KEEP** — Open Connection CTA |

## Old presentation (RECOMPOSE)

| Old (`app/app/data-health/page.tsx`) | Disposition |
|--------------------------------------|-------------|
| Monolith `rp-dhm` matrix | **RECOMPOSE** → `data-health/engine/*` |
| Summary without Trust Score | **RECOMPOSE** — 4 cards + rail Trust Score |
| No inspector | **RECOMPOSE** — sticky source inspector |
| No confidence chart / dependency map | **RECOMPOSE** — bottom modules |
| Soft status only | **MERGE** — HEALTHY / DEGRADED / STALE + scores |

## Scoring (config SSOT)

```
Evidence Confidence =
  35% Freshness + 30% Completeness + 25% Conflicts + 10% Coverage

Stale required source → cap 50
Critical conflict → cap 60

Trust Score = round(mean of source evidence confidences)
```

Deterministic demo targets: Xero 42 · Deliverect 68 · Lightspeed 96 · SevenRooms 94 · Toast KDS 92 → Trust **78%**.

## Canonical Overview composition

1. Header question + subtitle  
2. Summary cards (Healthy / Degraded / Stale / Decisions affected)  
3. Evidence Sources table (5)  
4. Right rail: Trust Score + selected source inspector  
5. Evidence confidence bars  
6. Decision dependency map  

## Component plan

```
components/product/data-health/engine/
  DataHealthShell.tsx
  DataHealthOverview.tsx
  DataHealthInspector.tsx
  data-health-engine.css
lib/radr/product/dataHealthProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Overview · `tmp/data-health-pass2-1512x982.png`~~
3. PASS 3 — selection · filters · search · inspector tabs  
4. PASS 4 — scoring wiring polish  
5. PASS 5 — Decision / Finding / Value impact  
6. PASS 6 — Connections deep links  
7. PASS 7 — Playwright + downstream consistency  
