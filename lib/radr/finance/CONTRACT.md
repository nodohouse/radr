# Financial Operating Layer — contract

## Purpose

Turn live hospitality operations into an **explainable financial picture** before accounting closes the books.

RADR **prepares, reconciles, explains, and flags**.  
The accounting system remains the **financial source of record** unless explicitly architected otherwise.

## Terminology

| Use | Do not use (Phase 1) |
|-----|----------------------|
| Net sales | “Revenue” alone when discounts/refunds matter |
| Live contribution | Profit / operating profit / net income |
| Contribution margin (pts) | Vague “margin is down” without unit |

**Live contribution** = net sales − direct costs RADR can see tonight (COGS estimate, direct labor, channel fees, payment fees, comps/refunds economic impact).  
It excludes overhead, depreciation, and full accruals — so it is **not** accounting profit.

**F&B category** (food vs beverage) is a first-class split of net sales. Beverage share is typically ~35% at Berlin dinner. Beverage contribution margin is usually higher than food. Seating channel `bar` ≠ beverage category.

## Confidence

Every material metric carries:

- `complete` — live source reconciled for the window  
- `estimated` — model (e.g. recipe COGS, loaded labor)  
- `partial` — delayed or incomplete feed  
- `stale` — source older than operating threshold  

Never hide uncertainty.

## Permissions

- CFO / Finance / Owner / COO: full Financial Operating Layer  
- GM: operational money for decisions — not full reconciliation chrome  
- Floor roles: no payroll aggregates beyond what their brief requires  
- Individual compensation: never on this surface  

Server-side enforcement is required when APIs leave demo.

## Phase 1

Demo fixture: Berlin Mitte dinner LIVE.  
Integrations (Exact, Xero, DATEV, NetSuite, …), Ready to Post, and month-end assistant are **out of scope**.
