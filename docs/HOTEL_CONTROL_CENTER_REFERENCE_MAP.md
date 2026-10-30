# Hotel Control Center — Reference Map

**Route:** `/app` · hotel vertical · GM property default  
**Status:** PASS 1–2 complete · `tmp/hotel-cc-gm-pass2-1512x982.png` · awaiting visual approval  

**Visual SSOT:** `tmp/hotel-cc-mockup-ssot.png` (ChatGPT mockup 2026-10-14)  
**Replace:** graphite/instrument `HotelCockpit` composition for GM rooms lens

## Thesis

Hotel Control Center = executive operating brief.

SITUATION → EXPOSURE → CAUSE → DECISION → EXPECTED OUTCOME → VERIFIED VALUE

Not: PMS summary · KPI dump · Live spatial · House Readiness room grid.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| `canalHouseLive()` | `lib/radr/demo/hotelDataset.ts` | **KEEP** — 89% · 31/42 · €1,840 · 14:20 |
| `hotelNeedsYouDecisions()` | `lib/radr/demo/hotelDecisions.ts` | **KEEP** — Active Decision REASSIGN 2 HK |
| `hotelVerifiedExamples()` / total €6,710 | same | **KEEP** — Verified Value MTD only |
| `controlCenterLensFor(hotel_gm)` | `lib/radr/product/controlCenterLens.ts` | **KEEP** — hero copy · KPI band |
| `houseReadinessModel()` | `lib/radr/product/houseReadiness.ts` | **ALIGN** — same readiness numbers |
| Restaurant `VisionGmCockpit` | vision/ | **KEEP** — do not regress |
| Hotel CFO `CfoControlCenter` | cfo-center/ | **KEEP** — later persona; shared architecture |
| `VisionHotelPace` | vision/ | **KEEP** — revenue_manager lens only |

## Old presentation (RECOMPOSE / REMOVE)

| Surface | Disposition |
|---------|-------------|
| Dark pulse SVG strokes (`rgba(255,255,255,…)`) | **RECOMPOSE** — Daylight mint pulse |
| Pace calendar under pulse on GM rooms | **REMOVE from GM default** — pulse owns the day |
| Review = slice of Decision seeds only | **RECOMPOSE** — Readiness · Arrivals/No-shows · Guest recovery |
| Hero without atmosphere | **ADD** — subtle Canal House visual |
| KPI tiles without sparklines | **RECOMPOSE** — mockup KPI cards |
| Property meta incomplete (Park Central / Riverside) | **EXTEND** — deterministic rows |

## Composition (GM · Canal House · Today)

```
HotelGmControlCenter
├── Hero (greeting · LIVE · statement · exposure · atmosphere)
├── KpiStrip (Occ · ADR · Readiness · 7D Pickup)
├── Main
│   ├── OperatingPulse (Today/Tomorrow/7d · floors · events)
│   └── PropertyPerformance table
└── Rail
    ├── ActiveDecision
    ├── ThingsToReview (3)
    └── VerifiedValue
```

## Canonical numbers (must match House Readiness)

| Metric | Value |
|--------|-------|
| Clock | 14:20 |
| Occupancy | 89% (+2.4% vs plan) · 178/200 |
| ADR | €248 (−1.8% vs plan) |
| RevPAR | €221 |
| Ready / Due | 31 / 42 |
| At risk | 7 |
| Arrivals | 42 |
| 7D pickup | +11 vs expected +6 |
| Exposure | €1,840 (expected Decision protects same) |
| Verified MTD | €6,710 · 5 decisions · 4 positive · avg €1.3k |
| Active Decision | REASSIGN 2 HOUSEKEEPERS · 81% · D-H-9201 |

## Cross-links

| Control | Target |
|---------|--------|
| Readiness KPI / review | `/app/service` |
| Review decision | Decision drawer / `/app/decisions/{id}` |
| Verified Value | `/app/value` |
| View all properties | `/app/locations` |
| Property row | set scope / `/app/locations/{id}` |

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — static GM CC + screenshot gate
3. PASS 3 — pulse / property interactions
4. PASS 4 — Active Decision wire
5. PASS 5 — Value
6. PASS 6 — House Readiness links
7. PASS 7 — CFO persona (later)
8. PASS 8 — Owner / Ops adaptations
9. PASS 9 — Playwright + arithmetic

## Regression

Restaurant VisionGmCockpit must be unchanged after shared CSS edits.
