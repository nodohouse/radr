# TEMPORAL STATE AUDIT

**Date:** 2026-09-24  
**Pass:** Product coherence 10/10

## Canonical clocks

| World | Source | Value |
|-------|--------|-------|
| Restaurant Live | `LIVE_SCENARIO` (`lib/radr/demoClock.ts`) | Fri 18 Sep 2026 · **19:48** Europe/Berlin |
| Hotel Live | `HOTEL_LIVE_SCENARIO` | Thu 24 Sep 2026 · **14:20** Europe/Amsterdam |
| Morning OS | `DEMO_AS_OF` | Wed 19 Aug 2026 · 17:30 (greeting only) |

Helpers: `scenarioTimestamp(vertical)` · `scenarioClockLabel(vertical)`.

### Restaurant Live

| Field | Value |
|-------|-------|
| Open / close | 17:00–23:00 |
| D-1911 formed | 19:37 |
| D-1911 deadline | **19:59** (~11 min from NOW) |
| Wait → resume | **20:00** (not 18:54) |

`PEAK_SERVICE_CLOCK`, Service Map, Decision Replay, `demoScenario.snapshotTimestamp`, and `connectedState.serviceTime` derive from **19:48**.

### Hotel Live

| Field | Value |
|-------|-------|
| Check-in wave | 14:00–15:30 |
| D-HK-1402 formed | 13:25 |
| Deadline | 15:00 |
| Arrivals / ready / at risk | 42 / 31 / 7 |

## Checks

| Surface | Expected | Status |
|---------|----------|--------|
| Live hero NOW (restaurant) | 19:48 | PASS |
| D-1911 resume copy | 20:00 | PASS |
| Futures temporal Peak | resume / peak / turns from LIVE_SCENARIO | PASS |
| Hotel CC / readiness | 14:20 · 42/31/7 | PASS |
| Wall-clock `new Date()` in CC brief | replaced with demo clock | PASS |
| Marketing 18:54 narrative | frozen — not product SSOT | N/A |

## Open P0/P1 temporal contradictions

**0** (product surfaces)
