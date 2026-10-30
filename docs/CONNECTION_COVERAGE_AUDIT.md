# CONNECTION COVERAGE AUDIT

**Date:** 2026-09-30 · Wave B/C

## Rule

Connections = what RADR can access. Filtered by `sourcesForDemo(role, vertical)`.

## Restaurant

- POS / reservations / delivery / labor / accounting fixtures for DE estate
- **No Mews** as primary restaurant connection

## Hotel

- Mews + hotel-relevant sources for Canal estate
- Restaurant-only POS stacks filtered out

## Data Health

`dataHealthRowsForRole(role, vertical)` uses same source set. Stale/degraded reduces Decision confidence copy.

## Automated

`tests/portfolio-totals-reconcile.test.ts` · p0 invariants
