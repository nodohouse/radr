# Final visual QA — production polish

**Preview:** https://prep-79ku0mjp2-nodo13.vercel.app/en  
**Date:** 2026-10-25  
**Scope:** Logo fit / retina / alignment / content cleanup — **no redesign**

## Measured logo (live)

| Instance | Asset | CSS size | object-fit | filter |
|---|---|---|---|---|
| Header desktop | `radr-wordmark-traced.svg` | 148×34 | contain | none |
| Connect hub | `radr-mark-traced.svg` | ~33×33 (+ pad) | contain | none |
| Top ticker | — | removed | — | — |

## Scores (1–10) — Home @ 1512×982 DPR2

| Criterion | Score | Notes |
|---|---|---|
| Logo accuracy | 9 | Traced wordmark verbatim |
| Logo clipping | 9 | overflow visible; hub pad 0.35rem |
| Alignment | 8 | Nav optical center OK; gutters still vary by legacy CSS |
| Typography | 9 | Geist; hero clamp intact |
| Image sharpness | 8 | Product UI HTML/SVG; photo tiles OK at marquee size |
| Icon sharpness | 9 | Vendor SVGs |
| Spacing | 8 | Section rhythm inherited; tokens not fully unified |
| Responsive | 9 | 390 checked; ticker gone |
| Motion | 8 | Prefer transform/opacity already on rails |
| Overflow | 9 | No horizontal overflow observed |
| CTA | 9 | Forest primary / ghost secondary |
| Brand consistency | 9 | Same traced mark header + hub |

**Nothing below 8 on this pass.** Full 3840×2160 matrix not fully captured in-session; logo remains SVG (vector-sharp at any DPR).

## Changes this pass

### Logo / render
- Global `.radr-logo` rules: `object-fit: contain`, no filter/shadow/transform, height auto
- Nav/footer brand: vertical pad 8px, overflow visible
- Hub mark: safe padding; height auto (no forced square stretch)
- Hub face: drop backdrop-filter on logo face
- Removed `OperatingPulse` from `SiteNav` (all public pages)

### Content (only specified)
- How RADR works → **From signal to outcome.** + support copy
- Solutions: removed redundant Locations / Global marquee
- Company: one Global by design section; removed dual marquee + “Supported now / Architecture supports” badges
- Pricing compare: always shows **8 buyer rows**; expand reveals full matrix

### Docs
- `docs/ASSET_QUALITY_AUDIT.md`
- `docs/FINAL_VISUAL_QA.md` (this file)

## Assets replaced / upgraded
- No new logo geometry — still traced kit
- Raster: audit only (coastal-hi OK; atmosphere/gateway flagged REEXPORT if used full-bleed)

## Logo instances fixed
- Header wordmark contain + pad
- Hub mark contain + pad
- Footer inherits same `RadrLogo` path
- Favicon unchanged (SVG mark on dark)

## Remaining (non-blocking)
- Unify `--page-max` / gutters across all marketing CSS files
- Reexport weak 1152px atmospheric JPGs if promoted to hero full-bleed
- Capture full 3840 screenshot matrix in CI or local 4K pass
