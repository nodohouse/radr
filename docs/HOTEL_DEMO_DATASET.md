# Hotel Demo Dataset

Org: **Northstar Hotels** (`org_northstar_hotels`)  
Scenario: `hotel_demo_v1_checkin_wave` · snapshot `2026-09-24T14:20+02`  
SSOT code: `lib/radr/demo/hotelDataset.ts`

## Locations (8)

| ID | Name | Archetype |
|---|---|---|
| loc_canal_house | Canal House · Amsterdam | boutique city |
| loc_ams_harbour | Harbour | larger urban |
| loc_schiphol_gate | Schiphol Gate | airport/business |
| loc_lisbon_alfama | Alfama House | leisure |
| loc_berlin_mitte_hotel | Mitte Suites | high-OTA |
| loc_paris_opera | Opéra Maison | strong direct |
| loc_london_clerkenwell | Clerkenwell | boutique city |
| loc_munich_airport | Munich Airside | airport/business |

## Bookings

`canalBookings()` — 42 arrivals, channel / ADR / LOS / VIP / upgrade / group block.

## Inventory

`canalRoomInventory()` — per-room status: departed · dirty · cleaning · ready · ooo · occupied.

## Distribution

`canalChannelEconomics()` — Direct · Booking.com · Expedia · GDS · Corporate · Wholesale with gross→commission→net ADR.

## Live snapshot (Canal House 14:20)

- Occupancy 89% · 42 arrivals · 31 ready · 7 at risk  
- Tonight 94% · ADR €252 · RevPAR €237  
- Hero: CHECK-IN IS ON TRACK. ROOM READINESS ISN'T.  
- Phases: NIGHT → DEPARTURE → HOUSEKEEPING → ARRIVAL PREP → CHECK-IN → EVENING → OVERNIGHT

## Conceptual sources

PMS · CRS / channel · RMS · Housekeeping · POS/F&B · Labor · Accounting · Payments · CRM · Maintenance · Weather · Events
