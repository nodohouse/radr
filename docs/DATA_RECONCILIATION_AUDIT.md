# DATA RECONCILIATION AUDIT

**Date:** 2026-09-30 · Wave A7

## Invariants (automated — PASS 2026-09-30)

| Check | Test |
|---|---|
| Locations verified ≡ Value aggregate | `tests/portfolio-totals-reconcile.test.ts` |
| Center verified ≡ Value | same |
| needs_you Center ≡ Ledger ≡ badges | `tests/p0-release-invariants.test.ts` · `tests/nav-attention.test.ts` |
| Group revenue / contribution / refunds = Σ locations | portfolio-totals + `tests/rc-phase-a-closeout.test.ts` |
| Money bridge: gross − deductions = contribution (×8) | `tests/rc-phase-a-closeout.test.ts` |
| D-1842 incremental = €1,640 (not €3,480) | `tests/money-impact-d1842.test.ts` |
| Restaurant connections exclude Mews | portfolio-totals + p0 |
| Berlin Mitte CC / Live compression 146 / 3 | rc-phase-a-closeout |

## Selector SSOT

- `selectNeedsJudgment({ role, vertical, locationId? })`
- `deriveLocationAttention` for portfolio / location header
- `sourcesForDemo(role, vertical)` → Connections / Data Health
- `stay=1` pins org primary (Berlin Mitte / Canal House)

## Open for Wave B+

Trace-this-euro full path UX depth; hotel matrix smoke live.
