# Menu Availability Risk

## Intent

Connect supplier → delivery → inventory → ingredient → recipe → menu → demand → revenue → contribution → prepared action.

Surface on Control Center **only when financially material** — not as a permanent inventory widget.

## Measures (distinct)

| Measure | Meaning |
|---------|---------|
| Gross revenue at risk | Shortfall portions × menu price (upper bound) |
| Expected revenue loss | After historical substitution / cannibalization |
| Contribution at risk | Expected revenue loss × item contribution rate |

Never present gross as expected loss.

## Actions

Prepared options are **approval-gated**. Never execute supplier orders, POS 86, or menu edits without integration support + approval.

## Environments

- DEMO: illustrative fixture (`demo.ts`)
- LIVE: only when `NEXT_PUBLIC_MENU_AVAILABILITY_FEEDS=true`
