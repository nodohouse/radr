# Hotel Live — Reference Map

**Route:** `/app/live` · hotel vertical · Property level · Canal House GM · Today  
**Status:** Visual rebuild (DOM tiles + mockup fold) · PASS 1–11  
**Gates:** `tmp/hotel-live-pass2-1512x982.png` · `tmp/hotel-live-pass6-1512x982.png` · `tmp/hotel-live-pass8-staff-1512x982.png` · `tmp/hotel-live-pass10-estate-1512x982.png` · `tmp/hotel-live-pass11-rooms-1512x982.png`  
**Visual SSOT:** `tmp/hotel-live-mockup-ssot.jpg` — DOM room tiles, Preview Impact in inspector, scrub in Arrival wave  
**Logic SSOT:** `canalHouseLive()` · 89% · 31/42 · 7 at risk · €1,840 · 14:20 · Floor 3 · Room 310 · D-H-9201

## Thesis

Hotel Live = realtime spatial operating layer.

WHAT IS HAPPENING INSIDE THIS PROPERTY RIGHT NOW?

Not Control Center (MTD / brief). Not a dark gaming canvas. Not WebGL.

**Daylight DOM + SVG digital twin.** Property level first.

## Current implementation (REPLACE visual)

| Surface | Path | Disposition |
|---------|------|-------------|
| `RadrLiveShell` | `components/product/radr-live/` | **DELETE VISUAL for hotel** — dark vision estate/ops |
| `VisionHotelOpsWorld` | radr-live/vision/ | **DELETE VISUAL** — abstract dark floors |
| `VisionEstateWorld` | radr-live/vision/ | **KEEP LOGIC later** — Estate PASS 10 · daylight rewrite |
| `LiveInspector` (radr-live) | radr-live/ | **RECOMPOSE** — daylight room inspector |
| WebGL / Three scenes | HotelPropertyScene, VenueScene, … | **DO NOT USE** — banned |
| `hotelFloorRooms` / fixtures | `lib/radr/spatial-live/fixtures.ts` | **KEEP LOGIC partial** — align Floor 3 / Room 310 canon |
| `canalHouseLive()` | `lib/radr/demo/hotelDataset.ts` | **KEEP** — KPI SSOT |
| `houseReadinessModel()` | houseReadiness.ts | **ALIGN** — same 31/42 · €1,840 · D-H-9201 |
| `DECISION_IDS.hotelReadiness` | ids.ts | **KEEP** — D-H-9201 |
| ProductShell AppSidebar | ProductShell | **SHARED** — Live stays in shell (no bare dark chrome) |
| Restaurant `LiveSpatialShell` | live-spatial/ | **KEEP** — restaurant only |

## Classification

| Kind | Items |
|------|--------|
| **KEEP LOGIC** | Occupancy 89% · 178/200 · ready 31/42 · at risk 7 · arrivals 42 · exposure €1,840 · clock 14:20 · D-H-9201 |
| **DELETE VISUAL** | Black canvas · neon · gaming floor bars · dark inspector · WebGL fallback panels on hotel path |
| **SHARED** | AppShell · daylight tokens · Decision deep-links · Framer Motion patterns |
| **HOTEL-NATIVE** | Floor plan · room tiles · arrival wave · modes Rooms/HK/Arrivals/… |
| **MISSING (later)** | Time scrub · Preview Impact · Estate daylight · Staff/Incidents depth · Data Health stale states |
| **P0 BUG** | Old Live Floor 7 pressure vs canon Floor 3 · room labels vs House Readiness drift |

## Target composition (Property · Rooms · Floor 3)

```
HotelLiveShell (inside ProductShell)
├── Header (LIVE · 14:20 · Canal House · subtitle)
├── KpiStrip (Occ · Ready · Arrivals · In house · Exposure)
├── ModeTabs (Rooms | Housekeeping | Arrivals | Guests | Staff | Incidents)
├── Toolbar (Floor 3 · status filters · View lens · zoom)
├── Body
│   ├── FloorPlan (SVG architecture + RoomTiles)
│   │   └── FloorRail (F8…G)
│   └── RoomInspector (310 selected · Overview)
└── ArrivalWave (SVG timeline · Today)
```

## Canonical numbers

| Metric | Value |
|--------|-------|
| Clock | 14:20 LIVE |
| Occupancy | 89% · 178 / 200 |
| Ready / Due | 31 / 42 |
| At risk | 7 |
| Arrivals | 42 · 15:00 wave |
| In house | 136 guests |
| Exposure | €1,840 |
| Selected floor | 3 |
| Selected room | 310 · DIRTY · Deluxe King · K. Silva · Michael Tan 15:20 · €280 |
| Active Decision | D-H-9201 Reassign 2 housekeepers · 81% |

## Implementation order

1. **PASS 1** — this map  
2. **PASS 2** — static Rooms mode · screenshot 1512×982 · **stop for visual approval**  
3. PASS 3 — floor + room selection + URL  
4. PASS 4 — inspector actions  
5. PASS 5 — Arrival Wave / time scrub  
6. PASS 6–8 — Housekeeping · Arrivals · Guests/Staff/Incidents  
7. PASS 9 — Preview Impact  
8. PASS 10 — Estate daylight  
9. PASS 11 — Playwright + visual QA  

## Final gate (PASS 2)

5-second test: 89% · 31/42 · 7 at risk · €1,840 · Floor 3 · Room 310 dirty · arrival wave visible · no black canvas.
