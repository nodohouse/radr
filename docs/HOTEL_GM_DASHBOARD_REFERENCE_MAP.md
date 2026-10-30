# Hotel General Manager Dashboard — Reference Map

**Route:** `/app/dashboards/dash_hotel_gm`  
**Visual SSOT:** `tmp/hotel-gm-dashboard-mockup-ssot.jpg`  
**Screenshot gate:** `tmp/hotel-gm-dashboard-pass2-1512x982.png`  
**Data SSOT:** Canal House · Today · 14:20 · `HOTEL_READINESS_CANON` / `canalHouseLive()` / `hotelVerifiedTotal()`

## Thesis

Saved operating view for a Hotel GM — not Control Center, not Live, not Operations.

Answers: property performance · arrival readiness · demand · channel · judgment · verified value.

## Disposition

| Surface | Path | Disposition |
|---------|------|-------------|
| Template config | `lib/product/dashboards.ts` → `dash_hotel_gm` | **KEEP LOGIC** — 6 widgets · 2-col grid |
| Widget grid chrome | `DashboardWidgetGrid.tsx` | **RECOMPOSE UI** — Hotel GM card chrome |
| Module bodies | `DashboardModule.tsx` + `renderIntelModule` | **HOTEL ADAPTER** — mockup skins |
| Occ / ADR / RevPAR data | `getHotelOccAdrRevparModule` · `canalHouseLive` | **KEEP LOGIC** — present as 3 equal metrics |
| Room readiness data | `getHotelRoomReadinessModule` · live 31/42 / 7 | **KEEP LOGIC** — donut 31 ready / 11 to prepare · risk callout |
| Pickup chart | `HotelBookingPace` · `hotelBookingPace.ts` | **RECOMPOSE** — remove D-H-9201 marker · keep D-2201 |
| Channel mix | `canalChannelEconomics` · `HotelDistributionViz` | **RECOMPOSE UI** — table + rn-share bars |
| Needs you | `builder_decisions` / hotel needs list | **RECOMPOSE UI** — compact priority rows |
| Verified Value | `hotelVerifiedTotal()` = **€6,710** | **DATA ERROR FIX** — was restaurant CFO €3,793 via `getVerifiedValueTrendModule()` |
| Page header | `app/app/dashboards/[id]/page.tsx` | **RECOMPOSE** — Canal House · Amsterdam · GM (not Alex · CFO · Group) |
| Shell selectors | product store prefs | **HOTEL ADAPTER** — seed GM + Canal House on open |
| AppShell | canonical `rp-shell-v2` | **SHARED** — do not fork |
| Builder | `/app/dashboards/dash_hotel_gm/edit` | **SHARED** — same Customize |
| Restaurant dashboards | `dash_gm` etc. | **DO NOT REGRESS** |

## Explicit mismatches (before rebuild)

| Issue | Was | Must be |
|-------|-----|---------|
| Persona metadata | Elena · Hotel GM · or Alex · CFO · Group | Canal House · Amsterdam · GM |
| Shell role | Often CFO / All properties | GM · Canal House · Today |
| Verified Value | €3,793 (restaurant CFO aggregate) | **€6,710** hotel MTD (`hotelVerifiedTotal`) |
| Occ card layout | Single RevPAR hero | Three equal metrics + mint intel strip |
| Readiness | Sparse metric + faint donut | Donut 74% · legend · 7 of 11 at risk |
| Pickup markers | D-2201 + D-H-9201 | **D-2201 only** (HK not causal to pickup) |
| Channel | Compact bars | Full table columns per mockup |

## Canonical numbers (Canal House · Today · 14:20)

| Metric | Value | Source |
|--------|-------|--------|
| Occupancy | 89% | `canalHouseLive` / CC |
| ADR | €248 | pulse |
| RevPAR | €221 | pulse |
| Ready / due | 31 / 42 | `HOTEL_READINESS_CANON` |
| At risk | 7 (of 11 unready) | canon |
| Exposure | €1,840 | canon |
| Pickup vs comparable | +11% | `getHotelBookingPaceReport` |
| Verified Value MTD | €6,710 | `hotelVerifiedTotal()` |

## Widget → Open targets

| Widget | Open → |
|--------|--------|
| Occ · ADR · RevPAR | `/app/intelligence?module=hotel_occ_adr_revpar` |
| Room readiness | `/app/service` (House Readiness) |
| Pickup | `/app/intelligence?module=hotel_pickup` |
| Channel mix | `/app/intelligence?module=hotel_channel_mix` |
| Needs you | `/app/decisions` |
| Verified value | `/app/value` |

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — static mockup match · screenshot
3. PASS 3 — Open links
4. PASS 4 — Decision rows
5. PASS 5 — chart tooltips
6. PASS 6 — favorite + pin
7. PASS 7 — Customize → builder
8. PASS 8 — data health states
9. PASS 9 — Playwright

## Final principle

Personal operating view built from RADR intelligence — GM feels they configured it; RADR interprets it.
