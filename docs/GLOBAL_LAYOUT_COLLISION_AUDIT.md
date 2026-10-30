# GLOBAL LAYOUT COLLISION AUDIT

**Date:** 2026-09-30 · Wave A5  
**Harness:** `tests/e2e/layout-collision-audit.spec.ts`  
**Viewports:** 1440×900 · 1280×800 · 1024×768 · 768×1024 · 430×932

## Modules covered

| Module | Rule |
|---|---|
| Needs You handoff card | id-row · verb · econ no mutual overlap |
| Business pulse | `.rp-pulse-read` / KPI stacks label left of value |
| Waterfall MetricRow | label \| track \| value |
| MenuPulse | units / sold / contrib as separate Metric nodes |

## Metric primitive

SSOT: `components/product/ui/MetricBlock.tsx`  
`MetricLabel` · `MetricValue` · `MetricDeltaText` · `MetricMeta` · `MetricStatus` · `MetricRow`

Location strip + MenuPulse migrated off concatenated money+label strings (2026-09-30).

## Status

Automated gate green when local Playwright suite passes. Deploy gate: prep-ten-zeta after Wave A.
