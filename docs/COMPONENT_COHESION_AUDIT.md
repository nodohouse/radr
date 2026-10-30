# Component Cohesion Audit

**Date:** 2026-10-05 · Visual normalization pass  
**SSOT:** `app/radr-brand-tokens.css` → `app/radr-product-tokens.css`

## Primitives

| Primitive | Path | Status |
|-----------|------|--------|
| RadrEyebrow | `components/radr/ui/RadrEyebrow.tsx` | Shared mono · 0.12em · uppercase |
| RadrArrowLink | `components/radr/ui/RadrArrowLink.tsx` | `→` via shared link |
| MetricBlock | `components/product/ui/MetricBlock.tsx` | Label / value / delta composition |
| RadrMark / Delta | `components/radr/` | Brand green #00d978 |

## Rules enforced

- No label+value concatenation in one text node on Menu Pulse (MetricBlock).
- Futures matrix uses `<table>` columns — not run-on euros.
- Service tabs = label only; question on `.rp-svc-viewline` below.
- Font weight capped at 600 in product CSS.
- Cream `#fffcf7` remapped to mineral `#f7faf8`.
- Dark instrument (`#07090a`) removed from product shell tokens.
