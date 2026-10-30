# LAYOUT COLLISION AUDIT — Locations portfolio brain

**Generated:** 2026-09-25  
**Surface:** `/app/locations` (Northstar Restaurants · COO portfolio)  
**Standard:** Zero P0/P1 overlaps before release.

## Method

1. CSS layout uses grid + `minmax(0, …)` + `min-width: 0` — no absolute positioning for estate hero, needs-attention, pulse, or table.
2. Portfolio matrix capped at `max-height: 320px` with domain padding and collision-aware SVG labels.
3. Playwright bounding-box checks in `tests/e2e/locations-portfolio.spec.ts` (`no horizontal overflow or clipped estate hero at key viewports`).

## Viewports audited

| Viewport | Horizontal overflow | Deep section overlap | Status |
|---|---|---|---|
| 1440×900 | FAIL if scrollWidth > clientWidth+1 | editorial ∩ needs ∩ rail ∩ matrix ∩ pulse | Audited in e2e |
| 1280×800 | same | same | Audited in e2e |
| 1024×768 | same | same | Audited in e2e |
| 768×1024 | same | same | Audited in e2e |
| 430×932 | same | same | Audited in e2e |
| 390×844 | same | same | Audited in e2e |

## Important regions

| Region | Selector | Notes |
|---|---|---|
| Estate editorial | `.rp-loc-editorial` | Dominant statement · no absolute |
| Needs attention | `.rp-loc-needs` | Compact intervention · CTA links |
| Metric rail | `.rp-loc-rail` | 6-col → responsive collapse |
| Portfolio matrix | `.rp-loc-matrix` | ≤320px · sqrt bubble scale |
| Location pulse | `.rp-loc-pulse` | Watchlist · no cards |
| Economics table | `.rp-loc-table-rich` | Sticky identity column via grid |
| Learn from estate | `.rp-loc-learn` | Transfer verdicts |

## Open P0/P1 collisions

**0** (gate: e2e collision test must pass).

## Controls that prevent regressions

- `min-width: 0` on editorial, needs, pulse, table cells
- Matrix frame `overflow: hidden` + label nudge
- Mobile pulse drops spark/attention columns under 640px
- Tooltips: native `title` on matrix nodes only (no floating portal collisions on Level 1)
