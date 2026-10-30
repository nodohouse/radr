# RADR logo master correction (2026-10-26)

## Defect

`radr-mark-traced.svg` left leg was traced flush to `x=0` (flat vertical crop). Padding fixes on the website were the wrong layer.

## Fix (SVG only)

1. **Geometry:** Shared A = approved traced paths from the kit wordmark A (complete left leg, min x = −12 in mark space). Right leg + green dot unchanged. Not the clean polygonal rewrite.
2. **Canvas:** Mark viewBox `-18 31 79 63` (~7.5–9.5% intrinsic clear space). Artwork does not touch edges.
3. **Wordmark:** Same A geometry (`+85` x); letters unchanged; viewBox `6 31 269 63`.

## Canonical files

| File | Role |
|------|------|
| `public/brand/radr-mark-master.svg` | Standalone mark |
| `public/brand/radr-wordmark-master.svg` | Wordmark |
| `*-master-white.svg` / `*-master-mono-*.svg` | Color variants (same paths) |

QA: `/en/brand-test` — board crop vs master.
