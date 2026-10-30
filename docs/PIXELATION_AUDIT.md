# Pixelation / asset quality audit

**Date:** 2026-10-26  
**Rule:** Anything displayed larger than source → FIX. Prefer SVG / HTML / CSS on marketing. Photography ≥ 2560px wide (prefer 3840) with AVIF/WebP + srcset.

## Brand logos (homepage chrome)

| Asset | Type | Intrinsic | Displayed (typical) | DPR | Quality | Action |
|-------|------|-----------|---------------------|-----|---------|--------|
| `/brand/radr-wordmark-traced.svg` | SVG | vector | ~138×31 header | 1–3 | Sharp | KEEP — canonical |
| `/brand/radr-wordmark-traced-white.svg` | SVG | vector | footer ~122px | 1–3 | Sharp | KEEP |
| `/brand/radr-mark-traced.svg` | SVG | vector | hub / Connect / Gap | 1–3 | Sharp | KEEP |
| `/brand/radr-mark-traced-white.svg` | SVG | vector | dark surfaces | 1–3 | Sharp | KEEP |
| Legacy `/brand/legacy/*.png` | PNG | raster | not used on homepage | — | Soft if used | ARCHIVE only |
| Favicon PNG / apple-touch | PNG | device icons | browser chrome only | — | OK | KEEP for OS icons |

**Rendering rules enforced:** `object-fit: contain`, `height: auto`, no `cover`, no overflow clip on logo parents, no CSS filters on marks.

## Homepage product visuals

| Surface | Medium | Notes | Action |
|---------|--------|-------|--------|
| Hero Connect map | HTML + SVG wires + RadrLogo | Retina-safe | KEEP |
| Decision Gap card | HTML/CSS | No screenshot | KEEP |
| Connect marquee | IntegrationLogo + SVG node | Vendor marks via `/public/vendors` | Prefer SVG; audit each vendor |
| Signals / How / RH | HTML/CSS canvases | No raster product shots | KEEP |
| Value Map teaser | HTML/CSS + mark SVG | New | KEEP |
| SilkAtmosphere | CSS | OK | KEEP |

## Rasters in `/public` (not homepage-critical)

| Path pattern | Typical size | Homepage use? | Action |
|--------------|--------------|---------------|--------|
| `public/demo/**`, `public/live/**` | Mixed JPG/WebP | Product demo / estate | Ensure srcset; no upscale |
| `public/mockup-exports/*3840*` | 3840×2160 PNG | Docs / mock refs | Do not use as CSS bg stretched |
| `public/control-center/**` | JPG heroes | App / deep | Prefer WebP + srcset |
| `public/menu/**`, `public/house/**` | JPG | Product demos | Keep ≤ display size |
| `public/docs-static/**` | Mixed | Docs only | Out of homepage scope |

## Canvas / chart usage

Homepage charts and connectors should remain SVG or CSS. Avoid drawing logos into `<canvas>` (rasterizes at DPR incorrectly).

## Zoom QA checklist

At 90% / 100% / 125% / 150% / 200%:

- [ ] Header wordmark curves + green focal
- [ ] Hero hub A-mark unclipped
- [ ] Connect `IntegrationRadrNode` unclipped
- [ ] Gap node + Decision mark
- [ ] Footer wordmark

## Failures to fix immediately if found

1. Any PNG logo in header / hero / Connect / footer  
2. `object-fit: cover` on `.radr-logo`  
3. Fixed width **and** height distorting aspect  
4. Parent `overflow: hidden` clipping A legs or focal dot  
5. Vendor logo displayed larger than intrinsic pixels without SVG replacement  
