# Responsive QA — Visual normalization

**Date:** 2026-10-05

## Viewports

| Width | Expectation |
|-------|-------------|
| 1280 | Full rail collapsed · content usable |
| 1440 | Primary operating width |
| 1512 | MacBook Pro |
| 1728 | Wide — no forced narrow column |
| 1920 | Analytical surfaces use width |

## Checks

- [ ] No body horizontal scroll on Center / Service / Decisions / Locations
- [ ] Mobile Menu opens full rail sheet (Connections, Data Health, Dashboards, Settings)
- [ ] Service Floor / Timeline / Recovery tabs switch without run-on question
- [ ] World switcher Restaurants ↔ Hotels persists across routes
- [ ] Ask RADR launcher visible; Escape closes panel

## P0 blockers

Dead nav · missing mode · body overflow · major overlap → block release.
