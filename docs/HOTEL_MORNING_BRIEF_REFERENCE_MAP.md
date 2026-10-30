# Hotel Morning Brief — Reference Map

**Route:** `/app/dashboards/dash_hotel_morning_brief`  
**Visual SSOT:** `tmp/hotel-morning-brief-mockup-ssot.jpg`  
**Screenshot gate:** `tmp/hotel-morning-brief-pass2-1512x982.png`  
**Data SSOT:** Canal House · Hotel GM · Today · brief snapshot **10:37**

## Thesis

Daily operating brief — not a full GM dashboard clone.

WHAT CHANGED OVERNIGHT? · WHAT MATTERS TODAY? · WHAT NEEDS JUDGMENT? · BEFORE ARRIVAL WAVE? · WHAT VALUE VERIFIED?

## Layout (mockup)

| Row | Columns | Widgets |
|-----|---------|---------|
| 1 | 4 · 4 · 4 | Occ·ADR·RevPAR · Room readiness · Pickup |
| 2 | 6 · 6 | Event context · Needs you |
| 3 | 12 | Verified Value (full-width hero) |

## Disposition

| Surface | Disposition |
|---------|-------------|
| Template `dash_hotel_morning_brief` | **KEEP LOGIC** — update grid heights if needed |
| Hotel GM skins (`HotelGmWidgets`) | **SHARED** — reuse Occ / Pickup / Needs / VV with brief CSS |
| Room readiness | **RECOMPOSE** — label **Forecast for 14:20** (brief @ 10:37 ≠ live 14:20 observation) |
| Event context | **HOTEL ADAPTER** — fictional Amsterdam event; no Columbiahalle; no “walk-ins” |
| Verified Value | **DATA** — €6,710 · hotelVerifiedTotal |
| Duplicate Open → | **REMOVE** — skins hide grid header Open; one Open in card head |
| AppShell / Builder | **SHARED** |

## Explicit flags (before rebuild)

| Issue | Fix |
|-------|-----|
| Columbiahalle (Berlin) on Amsterdam brief | → **IJ LIVE HALL · CONCERT · 20:00** (fictional) |
| “late walk-ins” | → “+21% arrivals after 21:00” |
| 31/42 shown as current at 10:37 | → **Forecast for 14:20** |
| Restaurant event module | → Morning Brief event skin |
| €3,793 VV | → €6,710 |
| Duplicate Open | → single Open per card |

## Canonical numbers

Same as Hotel GM for Canal House economics · readiness forecast 31/42 · 7 of 11 at risk · €1,840 · pickup +11% · VV €6,710 · 5 sealed · +28%.

## Temporal model

| Clock | Role |
|-------|------|
| **10:37** | Brief snapshot / Last updated |
| **14:20** | Readiness **forecast** target (canonical live state) |
| **20:00** | Tonight event |
| **MTD** | Verified Value only |

## Open → destinations

| Widget | Destination |
|--------|-------------|
| Performance | Intelligence · hotel_occ_adr_revpar |
| Readiness | `/app/service` |
| Pickup | Intelligence · hotel_pickup |
| Event | Intelligence · event_context |
| Needs you | `/app/decisions` |
| Verified Value | `/app/value` |

## Implementation order

1. PASS 1 — this map  
2. PASS 2 — static visual + corrections  
3. PASS 3 — destinations  
4. PASS 4 — chart tooltips  
5. PASS 5 — favorites / pin  
6. PASS 6 — builder  
7. PASS 7 — data health  
8. PASS 8 — Playwright  
