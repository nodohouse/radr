# LOCATION DEMO STORY AUDIT

**Date:** 2026-09-25  
**SSOT:** `lib/radr/location/*` · `lib/radr/demo/demoOutliers.ts` · `lib/radr/demo/organizations.ts`

Every clickable portfolio location resolves. Legacy marketing IDs (Shoreditch, Le Marais, De Pijp, Maxvorstadt, Nørrebro, Baixa) alias onto living DE archetypes — they never 404.

## Northstar Restaurants (8)

| Location | Archetype | Current statement | Material driver | Decision / Futures | Memory |
|---|---|---|---|---|---|
| Berlin Mitte | high_volume_delivery_peak | Revenue ahead · contribution isn't | Delivery fees / refunds / peak | `dec_peak_berlin` | Fri throttle · wine before 19:30 |
| Kreuzberg Market | delivery_refund | Sales normal · refunds aren't | Fri 19–21 delivery lateness 61% | Compare Futures | Refund daypart pattern |
| Hamburg Hafen | premium_attach | Best contribution month | Wine attach +9.4pp | Transfer → Berlin | Attach without service penalty |
| Frankfurt Westend | procurement_shock | Demand healthy · costs erode margin | Tuna +19%/90D · €8.4k | Cost Movers Futures | Stockout after 20:00 Fri |
| München Altstadt | labor_heavy | Within watch band | Labor +0.8pp | Watch | Tue overstaff afternoon |
| Köln Ehrenfeld | discount_spend | Within range | Promo softens spend | Watch | Discount elasticity |
| Düsseldorf Medienhafen | premium_mix | Strong premium mix | Events + menu | Learning source | Events without discount dependency |
| Stuttgart Mitte | stable | Within expectations | None material | Silence | Quiet baseline |

## Northstar Hotels (8)

| Location | Archetype | Focus | Memory / Decision |
|---|---|---|---|
| Canal House | boutique_city | Design Week · readiness · direct hold | HK reassign · OTA hold |
| Harbour | larger_urban | Pace / RevPAR peers | Estate transfer target |
| Schiphol Gate | airport_business | Readiness bunching | Context-dependent transfer |
| Alfama House | leisure | Seasonality | — |
| Mitte Suites | high_ota | Channel leakage | — |
| Opéra Maison | (city premium) | ADR / direct | — |
| + remaining hotel org seeds | — | Same intel architecture | Generated DNA + 24M history |

## Architecture

- `resolveLocation` — identity + aliases
- `historyEngine` — deterministic 730-day + months + daypart + weekday + DNA
- `composeLocationIntel` — statement, economics, leaks, peers, menu, procurement, lessons
- Tabs: **Overview · Live · Performance · Decisions · Value · Memory · Data**

## QA

- Unit: `tests/location-intel.test.ts`
- E2E: `tests/e2e/location-detail-all.spec.ts` loops every canonical id
