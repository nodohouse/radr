# Vertical Experience Profile

SSOT: `lib/radr/vertical/experienceProfile.ts`

## Restaurant

| Field | Value |
|---|---|
| Demand | covers / orders |
| Capacity | tables · kitchen stations · staff |
| Economics | contribution · € / constrained minute |
| Live hero | service trajectory |
| Flow | reservation → seat → order → kitchen → serve |
| Intelligence | Reservations · Menu · Kitchen · Labor · Delivery · Inventory · Procurement |

Forbidden in primary UI: ADR, RevPAR, room nights, housekeeping, check-in.

## Hotel

| Field | Value |
|---|---|
| Demand | room nights · bookings · arrivals |
| Capacity | rooms · room types · housekeeping · front desk |
| Economics | net room contribution · RevPAR · ADR · channel cost |
| Live hero | room readiness × arrival |
| Flow | DEPARTURES → HOUSEKEEPING → READY → ARRIVALS → OCCUPIED |
| Intelligence | Pickup · Occupancy · ADR · RevPAR · Readiness · HK · Distribution · Cancellation · Upsell · Maintenance |

Forbidden in primary UI: covers, tables, kitchen pressure, dish, delivery (unless F&B module).

## Role lenses

**Restaurant:** GM · CFO · Chef · Revenue/Ops  
**Hotel:** Hotel GM · CFO · Revenue Manager · Ops · Housekeeping lead
