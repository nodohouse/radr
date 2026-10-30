# Hotel House Readiness — Reference Map

**Route (canonical):** `/app/service` (hotel vertical) · alias `/app/operations` → same shell  
**Status:** PASS 1–4 complete · screenshot `tmp/hotel-house-readiness-pass4-1512x982.png`  

**Visual SSOT:** mega-spec House Readiness mockup (Daylight · room tiles · inspector · recommendation)  
**Broken baseline:** SVG `HotelServiceMapInstrument` room-label overlap (`101102103…`)

## Thesis

RADR Hotel Operations = **live readiness decision layer** above PMS / housekeeping / maintenance.

Answers: Can this hotel be ready for today’s arrivals? Which rooms fail? Why? What moves? What value does that protect?

Not: PMS · housekeeping checklist · room directory · static status grid.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Canal House live snapshot | `lib/radr/demo/hotelDataset.ts` → `canalHouseLive()` | **KEEP** — occ 89% · 31/42 ready · gap 11 · arrivals 42 · 14:20 |
| HOTEL_LIVE_SCENARIO | `lib/radr/demoClock.ts` | **KEEP** — clock · wave · room counts |
| Decision | `DECISION_IDS.hotelReadiness` / D-H-9201 | **KEEP** — Open Decision |
| HK staff Decision | `HOTEL_DECISION_IDS.hkStaff` | **KEEP** — reassignment class |
| Restaurant ServiceShell | `components/product/service/ServiceShell.tsx` | **KEEP** — restaurant only |
| AppShell / GOH | shared product shell | **KEEP** — no hotel chrome fork |

## Old presentation (DELETE / REPLACE)

| Old surface | Disposition |
|-------------|-------------|
| `HotelServiceMapInstrument.tsx` SVG `viewBox="0 0 100 90"` + bare `<text>` labels | **DELETE** — root cause of giant overlapping room numbers |
| `canalRoomSnapshot()` 18-unit SVG geometry | **REPLACE** — new floor/room model in `houseReadiness.ts` |
| Dark Live-style hotel ops look | **REPLACE** — Daylight (ivory · white · mint) |
| Period MTD while LIVE 14:20 | **FIX** — Operations forces Today |
| Restaurant terms on hotel route | **BAN** — covers / tables / kitchen / menu / delivery |

## New architecture

```
HouseReadinessShell
├── ReadinessKpiStrip
├── FloorReadinessMap
│   ├── FloorRow
│   └── RoomTile          ← fixed px · never SVG text
├── RoomInspector
├── RadrRecommendation
├── ArrivalList
└── analytics row
    ├── ReadinessByHour
    ├── RoomsAtRisk
    ├── RoomTypeReadiness
    ├── TurnoverPace
    └── HousekeepingCapacity
```

## Views

| Tab | Content |
|-----|---------|
| READINESS (default) | Full overview composition |
| ARRIVALS | Timeline · assignment · VIP · FO pressure |
| RECOVERY | Guest experience protection · value at risk |

## Canonical demo numbers (SSOT)

| Metric | Value |
|--------|-------|
| Clock | 14:20 |
| Occupancy | 89% (178 / 200) |
| Ready / Due | 31 / 42 |
| Readiness gap | 11 |
| Arrivals today | 42 |
| Recoverable revenue | €3,780 (expected · not verified) |
| Selected room | 105 · Standard · Cleaning · ETA 14:50 · arrival 15:00 · €280 |
| Recommendation | Reassign inspection F3 → F1 · 92% · +4 rooms · €1,120 · −35m |

## Room states

READY · CLEANING · INSPECTION · DIRTY · BLOCKED (+ VIP marker)

Lifecycle: DEPARTED → DIRTY → CLEANING → INSPECTION → READY (branches: BLOCKED / OOO / OOS / OCCUPIED)

## Cross-product links

| From | To |
|------|----|
| Apply / Open Decision | `/app/decisions/{hotelReadiness}` |
| View in Live | `/app/live` property + room context |
| Guest | `/app/guests` |
| Value (expected) | `/app/value` — never instant Verified |
| Data Health | `/app/data-health` on stale confidence |

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — RoomTile + FloorRow (no overlap)~~
3. ~~PASS 3 — static Readiness overview~~
4. ~~PASS 4 — screenshot 1512×982 gate~~ · awaiting visual approval
5. PASS 5 — room interactions (drawer tabs)
6. PASS 6 — recommendation / Decision polish
7. PASS 7 — Arrivals tab
8. PASS 8 — Recovery tab
9. PASS 9 — cross-links
10. PASS 10 — Playwright room-bounds already seeded in `tests/e2e/hotel-house-readiness-rooms.spec.ts`

## Bug law

Room numbers must never: overlap · inherit heading type · scale via SVG transforms · escape tile bounds.  
Test: every visible room text bbox ⊆ tile bbox · font-size ≤ 16px.
