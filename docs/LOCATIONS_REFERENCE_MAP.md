# Locations Reference Map — Portfolio Operating Intelligence

**Route:** `/app/locations`  
**Status:** PASS 1–7 complete · Overview + Performance/Exposure/Profitability/Watchlist · Playwright `tests/e2e/locations-engine.spec.ts`  
**Visual SSOT:** attached Locations Performance Dashboard mockup

## Thesis

Locations is the **portfolio operating layer**: where value is created or leaked across the estate — not a restaurant directory, not a mini Control Center, not a map.

Control Center → WHAT matters · Locations → WHERE · Intelligence → WHY · Decisions → WHAT TO DO · Value → DID IT WORK · Memory → WHAT WE LEARNED

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Portfolio economics | `lib/radr/product/portfolioEconomics.ts` | **KEEP LOGIC** — group = Σ locations · identity assert |
| Business pulse | `demoOperatingPulse` / `businessPulse` | **KEEP** — MTD location pulses |
| Outliers / editorial | `demoOutliers.ts` | **KEEP** — Berlin Mitte + Frankfurt attention stories |
| Exposure field layout | `PortfolioExposureField.tsx` | **RECOMPOSE** — new bubble chart in engine |
| Location detail route | `/app/locations/[id]` | **KEEP** — deep link from drawer later |
| Transfer / shared cost | portfolioEconomics transfers | **MOVE TO DETAIL** — Performance / Exposure views |
| Hotel portfolio | `HotelPortfolioIntel.tsx` | **KEEP** — hotel path later; restaurant Overview first |
| Value / CC reconcile | `portfolio-totals-reconcile.test.ts` | **KEEP** — verified totals must match |

## Old presentation (REMOVE / RECOMPOSE)

| Old (`app/app/locations/page.tsx`) | Disposition |
|------------------------------------|-------------|
| Monolith page + matrix + expand rows | **RECOMPOSE** → `locations/engine/*` |
| Period “Today” vs “Portfolio · MTD” mismatch | **REMOVE DUPLICATE** — period label = period state |
| Estate editorial + rail as primary | **RECOMPOSE** into MTD summary + key insight |
| Giant location expand blocks | **MOVE TO DETAIL** — selection drawer |
| Parallel experimental routes | **LEAVE** — do not invent |

## Canonical Overview composition

1. Performance × Exposure bubble chart  
2. Portfolio MTD summary + key insight + dark-green CTA  
3. Locations table (8 rows · sort · search)  
4. Attention · Top opportunities · Portfolio health  

## Component plan

```
components/product/locations/engine/
  LocationsShell.tsx
  LocationsOverview.tsx
  LocationsBubbleChart.tsx
  locations-engine.css
lib/radr/product/locationsProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Overview · `tmp/locations-pass2-1512x982.png`~~
3. ~~PASS 3–7 — selection · diagnosis · Performance/Exposure/Profitability/Watchlist · cross-links · Playwright~~
