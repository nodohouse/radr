# Asset quality audit — public marketing

**Date:** 2026-10-25  
**Rule:** Logos/icons/charts = SVG. Photos may be raster at ≥2× display. No upscaled UI screenshots as product truth.

## Logos (KEEP — vector)

| Asset | Path | Action |
|---|---|---|
| Wordmark traced | `/brand/radr-wordmark-traced.svg` | **KEEP** — canonical |
| Mark traced | `/brand/radr-mark-traced.svg` | **KEEP** — canonical |
| White / mono variants | `/brand/*-traced-*.svg` | **KEEP** |
| Favicon | `/brand/favicon.svg` | **KEEP** (mark on dark tile) |
| Apple touch | `/brand/apple-touch-icon.png` 180×180 | **KEEP** |
| Deprecated approximations | `/brand/legacy/approximated-2026-10/` | **ARCHIVE** — do not import |
| Integration logos | `/public/vendors/*.svg` (31) | **KEEP** — SVG rails |

## Photographic / atmospheric (marketing)

| Asset | Intrinsic | Typical display | DPR | Action |
|---|---|---|---|---|
| `marketing/2030/hero-coastal-hi.jpg` | 2400×1921 | ≤1200 CSS | OK 2× | **KEEP** |
| `marketing/2030/hero-lounge-hi.jpg` | 1200×800 | ≤600 CSS | Marginal | **REEXPORT** 2400w if used large |
| `marketing/2030/dining.jpg` | 1152×864 | tile ~216 | OK for tiles | **KEEP** for marquee |
| `marketing/2030/hero-atmosphere.jpg` | 1152×864 | section bg | Weak for full-bleed | **CONVERT** prefer CSS/SVG atmosphere |
| `marketing/2030/hero-suite.jpg` | 1152×864 | tile | OK | **KEEP** |
| `marketing/2030/cc-restaurant.jpg` | 1280×720 | card | Marginal | **REEXPORT** 2560w if hero |
| `marketing/2030/gateway.jpg` | 1024×665 | tile | Weak | **REEXPORT** or shrink display |
| `marketing/company-env-aparthotel.jpg` | 1152×864 | tile ~216 | OK | **KEEP** |
| Demo facility JPGs | various | product demo | Mixed | **KEEP** product; not public logo |

## Product UI / charts on public site

| Surface | Format | Action |
|---|---|---|
| Hero Connect map | HTML/SVG | **KEEP** |
| Decision cards | HTML/CSS | **KEEP** |
| Value Calculator map | SVG/CSS | **KEEP** — verify 4K crisp |
| Sticky loop stages | HTML | **KEEP** |

## Next.js Image

Marquee tiles use `next/image` with `sizes` ≈ 184–216px and sources ≥1152px → **OK** for 2×.

## Do not

- Rasterize RADR wordmark / mark
- Use Next Image blur placeholder on logos
- Upscale 1152px photos across 2560px+ viewports as hero art
