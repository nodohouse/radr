# Global Demo Estate Migration — Audit

**Date:** 2026-10-20  
**Principle:** Product data proves global footprint. UI visual system frozen.

## SSOT today

| Role | Path |
|------|------|
| Org / location lists | `lib/radr/demo/organizations.ts` |
| New estate registry | `lib/radr/demo/estateRegistry.ts` |
| Display names | `lib/radr/product/demoOrg.ts` → `locationDisplayName` |
| Venue currency | `lib/radr/venueProfiles.ts` + `lib/radr/currency.ts` |
| Gateway copy | `lib/radr/demo/enterWorlds.ts` |

## Pre-migration estate

**Restaurants (8 × DE):** `loc_berlin_mitte` (hero) … Stuttgart  
**Hotels (8 × EU):** `loc_canal_house` (hero) … Munich Airside  

## Classification (Berlin / Amsterdam / Canal House)

| Class | Guidance |
|-------|----------|
| **CANONICAL_HERO_DEPENDENCY** | Keep IDs `loc_berlin_mitte` / `loc_canal_house`. Remap display → Soho · New York / Mercer House · New York. Decision IDs (`dec_peak_berlin`, D-H-9201) stay. |
| **PORTFOLIO_DATA** | Rewrite via `DemoEstateRegistry` → organizations. Expand to 10 + 10. |
| **COPY** | Sweep through `locationDisplayName` + org seeds. |
| **IMAGE** | Prefer distinct facility assets per city where available; no Berlin reuse for every row. |
| **TEST** | Assert IDs still resolve; update display-name assertions gradually. |
| **LEGACY** | `estateSites.ts`, stale docs, `loc_ams_canal` aliases — quarantine. |
| **SAFE_TO_REPLACE** | Gateway city lines, org display fields, venue profiles, group reporting currency → USD. |

## Hero migration choice (this pass)

**Temporary-safe + visible global (completed):**

- Keep hero **IDs** for determinism (`loc_berlin_mitte`, `loc_canal_house`).
- Remap **labels / city / country / timezone / currency** to New York.
- Preserve operating story numbers; GM CC / hotel hero money formatted as USD.
- Demo clocks: `America/New_York`.
- Group reporting: **USD**.
- Product display copy swept off Berlin/Amsterdam/Canal House labels (fixture IDs unchanged).

## Target estate

See `DemoEstateRegistry` in `lib/radr/demo/estateRegistry.ts` (10 restaurants · 10 hotels).

## Count reconciliation

Gateway · Locations · Settings · Control Center group must all report **10** per vertical.
