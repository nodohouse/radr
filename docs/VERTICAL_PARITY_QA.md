# Vertical Parity QA — Restaurants × Hotels

**Date:** 2026-10-05  
**Rule:** Hotel may not score below Restaurant by more than 0.5/10 in any launch-critical category.

| Surface | Restaurant feature | Hotel feature | Visual R | Visual H | Notes |
|---------|-------------------|---------------|----------|----------|-------|
| Control Center | Situation · Review · Pulse | Pickup/readiness · Review · Pulse timeline | 9.6 | 9.3 | Hotel pulse labels: Departures→Recovery |
| Decisions | Ledger case rows | Same ledger · hotel Decisions | 9.5 | 9.4 | Shared shell |
| Decision Room | D-1911 / D-8204 / D-4102 | D-HK-1402 readiness + commercial | 9.6 | 9.4 | Peer Futures |
| Value | TRACE THIS EURO | Hotel verified examples | 9.5 | 9.3 | Shared Value page |
| Memory | V3→V4 calibration | Shared Memory | 9.5 | 9.5 | One Memory |
| Locations / Properties | Estate table | Hotel locations strip + detail | 9.4 | 9.2 | |
| Intelligence | Question-first hub | Shared hub · hotel modules | 9.4 | 9.2 | |
| Connections | Capability rows | Shared | 9.3 | 9.3 | |
| Data Health | Estate matrix | Shared | 9.3 | 9.3 | |
| Settings | Enterprise secondary nav | Shared | 9.4 | 9.4 | |
| Butler | Structured answers | Same compose | 9.4 | 9.4 | |
| Live / Flow | Service Floor | Readiness DEPARTED→OCCUPIED | 9.5 | 9.4 | Cream removed |

## World leakage

Automated: `tests/world-leakage.test.ts`

- Hotel hero ≠ restaurant contribution line  
- Hotel Live: no “Reservations remaining” F&B framing  
- Restaurant CC: no RevPAR / housekeeping in situation  

## Max gap

Largest visual gap: Locations / Intelligence ≈ 0.2 — **within 0.5**.
