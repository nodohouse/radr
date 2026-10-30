# RADR logo migration audit

**Rule:** Public logo = canonical SVG from `RADR_brand_assets.zip` via `RadrLogo`.  
Do not recreate geometry in JSX/CSS. Do not split the green dot.

**Canonical assets:** `/public/brand/radr-*.svg`, `/public/brand/favicon.svg`  
**Component:** `components/brand/RadrLogo.tsx`  
**QA:** `/en/brand-test`

### Packaging note
`radr-lockup-horizontal.svg` (+ white) from the zip had letter paths at y≈61–111 inside `viewBox="0 0 280 80"` (clipped). Path data is unchanged; a `translate(0 -48)` group was added so lettering aligns with the mark inside the viewBox. Mark / wordmark / favicon files are byte-identical to the zip.

---

## Public website — REPLACE (done this pass)

| Location | Was | Now | Status |
|---|---|---|---|
| `components/brand/RadrLogo.tsx` | — | Asset `<img>` API | **DONE** |
| `components/marketing/BrandLogo.tsx` | Text + A-mark rebuild | Re-export `RadrLogo` | **DONE** |
| `components/marketing/SiteNav.tsx` | `BrandLogo` wordmark rebuild | `horizontal` SVG lockup | **DONE** |
| `components/marketing/v2030/HeroConnectMap.tsx` | Inline `RadrAMark` geometry | `RadrLogo` mark SVG | **DONE** |
| `app/icon.svg` / `app/apple-icon.png` | Generated approximate A | Verbatim favicon assets | **DONE** |
| `public/favicon.svg` | Approximate stroke A | Verbatim `favicon.svg` | **DONE** |
| `public/brand/*.svg` | Cursor-drawn approximations | Zip assets verbatim | **DONE** |
| `app/brand-test/page.tsx` | — | Logo QA board | **DONE** |

---

## ARCHIVE

| Asset / path | Action |
|---|---|
| Prior Cursor-drawn `/public/brand/radr-*.svg` | → `/public/brand/legacy/` |
| `public/brand/delta-*.png` | → `/public/brand/legacy/` |
| `public/brand/archive/favicon-triangle-legacy.ico` | Keep archived |
| `lib/radr/aMarkGeometry.ts` | **ARCHIVE intent** — do not use for public logo; delete after product chrome migrates |
| `app/icon.tsx` / `app/apple-icon.tsx` (ImageResponse approximations) | **Removed** |

---

## KEEP INTERNAL TEMPORARILY

These still import old *APIs* but now resolve to SVG assets through `RadrAMark` / `RadrWordmark` shims. Migrate call sites to `RadrLogo` in a follow-up; do not restore JSX geometry.

| Location | Class | Notes |
|---|---|---|
| `components/radr/RadrAMark.tsx` | Shim → `RadrLogo` mark | Public-safe |
| `components/radr/RadrWordmark.tsx` | Shim → `RadrLogo` wordmark | Public-safe |
| `components/radr/RadrDelta*.tsx` | Re-exports | Product / legacy |
| `components/marketing/SiteFooter.tsx` | Uses `BrandLogo` | Gets SVG; visual polish later |
| `HeroProductTheater.tsx` | `BrandLogo` mark | Gets SVG |
| `IntegrationLogoMarquee.tsx` | `RadrAMark` | Gets SVG via shim |
| `DevelopersShell.tsx` | `RadrWordmark` | Dev surface |
| `app/dev/wordmark/page.tsx` | Dev QA | Update to `/brand-test` |
| Product shell (`LabModeRail`, etc.) | Delta / wordmark | **Product** — out of first-pass scope |
| Marketing kinetic / DeltaRain / ValueOnRadr | Glyph rain effects | Visual motifs — migrate or retire later |
| `HowPage.tsx` | `RadrWordmark` | Deep page — next brand pass |

---

## Expected public references after this pass

| Pattern | Expected |
|---|---|
| `/brand/radr-mark.svg` etc. via `RadrLogo` | YES |
| JSX path recreation of A / green `div` dot | ZERO on header / hub / favicon |
| Lucide `Triangle` as logo | ZERO |
| `/brand/legacy/*` imported by public pages | ZERO |

---

## First-pass scope (locked)

1. Exact production logo assets  
2. `/brand-test`  
3. `RadrLogo`  
4. Header  
5. Homepage central mark  
6. Favicon  

Do not continue deep-page visual migration until `/brand-test` matches the branding board.
