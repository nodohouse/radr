# RADR logo replacement audit

**Rule:** Public logo = verbatim **traced** SVG from `RADR_exact_traced_logo_assets.zip` via `RadrLogo`.  
No CSS triangles · no live-text lockups · no separate green dots · no path edits · no reinterpretation.

**SSOT files:** `/public/brand/radr-*-traced*.svg`  
**Component:** `components/brand/RadrLogo.tsx`  
**QA:** `/en/brand-test`

Byte-check against zip: `radr-wordmark-traced.svg` / `radr-mark-traced.svg` = **identical**.

**Deprecated:** `/public/brand/legacy/approximated-2026-10/` (prior approximate kit).

---

## Asset map

| File | Use |
|---|---|
| `radr-wordmark-traced.svg` | Primary R[A]DR artwork (header / footer) |
| `radr-mark-traced.svg` | Intelligence node |
| `*-traced-white.svg` | Dark surfaces (white + green dot) |
| `*-traced-monochrome-*.svg` | One-color |
| `favicon.svg` | Dark tile wrapping mark-traced-white paths (paths unchanged) |

No traced horizontal lockup in kit — `horizontal` variant maps to wordmark-traced.

---

## PUBLIC — REPLACE (this pass)

| Location | Action | Status |
|---|---|---|
| `/public/brand/*.svg` | Verbatim from zip | DONE |
| `components/brand/RadrLogo.tsx` | `<img>` → assets only | DONE |
| `SiteNav` | `wordmark` SVG | DONE |
| `SiteFooter` | `wordmark` dark SVG | DONE |
| `HeroConnectMap` hub | `mark` SVG | DONE |
| `app/icon.svg` / `public/favicon.svg` | Kit favicon | DONE |
| `app/apple-icon.png` | From kit favicon raster | DONE |
| `/en/brand-test` | Exact asset board | DONE |

---

## PUBLIC — shimmed (asset under the hood)

These APIs still exist but render kit SVGs (no JSX geometry):

| Location | Via |
|---|---|
| `RadrAMark` / `RadrDeltaGlyph` | `/brand/radr-mark.svg` |
| `RadrWordmark` | `/brand/radr-wordmark.svg` |
| `IntegrationLogoMarquee` | `RadrAMark` → mark SVG |
| `HeroProductTheater` | `BrandLogo` mark |
| `ValueOpportunityMap` | `BrandLogo` / `RadrAMark` |

---

## ARCHIVE / DO NOT IMPORT (public)

| Path | Notes |
|---|---|
| `/public/brand/legacy/*` | Prior Cursor approximations + delta PNGs |
| `/public/brand/archive/*` | Triangle favicon archive |
| `lib/radr/aMarkGeometry.ts` | Geometry constants — **do not use for public logo** |

---

## KEEP INTERNAL / PRODUCT (out of this pass)

| Location | Class |
|---|---|
| Product shell delta CSS (`rp-delta-glyph`, etc.) | Product chrome |
| `DeltaRainParts` / kinetic delta effects | Motif — migrate later |
| `HowPage` / older scenes | Deep pages — next pass |
| Mockups (`MockupBrand`) | Internal |

---

## Route checklist

| Route | Logo source |
|---|---|
| `/en` header | wordmark SVG |
| `/en` Connect hub | mark SVG |
| `/en` footer | wordmark-white SVG |
| `/en/brand-test` | all kit variants |
| Favicon / apple | kit favicon |
| `/en/product` … | via SiteNav BrandLogo → wordmark |
| 404 | Site chrome when present |

---

## Acceptance

Place branding board next to `/en/brand-test` PRIMARY WORDMARK + STANDALONE MARK.

- Same A?  
- Same green-dot relationship?  
- Same wordmark feel?  

If “almost” → **FAIL**. Do not continue site redesign.
