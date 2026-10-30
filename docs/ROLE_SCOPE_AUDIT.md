# ROLE SCOPE AUDIT

**Date:** 2026-09-30 · Wave B/C

## SSOT

`selectNeedsJudgment({ role, vertical, locationId? })`  
`navBadgesForScope(scope, role, vertical)` — location-scoped  
`scopedDecisionsForDemo` · `ExperienceComposer`

## Checks

| Check | Status |
|---|---|
| GM Berlin Mitte needs you = 3 | PASS |
| Kreuzberg location scope ≠ Mitte counts | PASS (nav badges scoped) |
| Hotel decisions excluded from restaurant | PASS |
| stay=1 → org primary | PASS |

## Automated

`tests/p0-release-invariants.test.ts` · `tests/nav-attention.test.ts` · `tests/demo-scenario-coherence.test.ts`
