# Decision Attention UX

## Bands (Ledger)

| Band | Meaning | Visual weight |
| --- | --- | --- |
| **Needs your judgment** | Human handoff required | Large premium cards |
| **In motion** | Actioning / Observing / Verifying | Compact timeline rows |
| **Resolved** | Verified / Closed | Quiet historical |

**Watching is not a Decision state** in the Ledger. Watching findings stay on Control Center / Intelligence until promoted.

## Filters / deep links

- `/app/decisions?band=needs_you`
- Control Center master CTA + judgment headline use this URL

## Row design (Needs you)

```
WAIT 12 MINUTES                         +€620
Berlin Mitte · Dinner
38 inbound · delivery +31% · kitchen → 97%
[Compare Futures →]
```

Operating judgment — not issue tracker.

## Escalation

Rank by time urgency × exposure × severity × deadline — not euros alone.

## Nav badge

`Decisions  2` = human judgment count only.  
Tooltip: “2 Decisions need your judgment.”

## Primitive

`HumanHandoff` — reusable wherever operator judgment is required.
