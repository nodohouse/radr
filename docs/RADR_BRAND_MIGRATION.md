# RADR Brand Migration Audit

**Date:** 2026-10-23  
**Scope:** Public website + marketing surfaces. Logged-in product typography deferred.

Canonical: A-mark + green focal dot · Geist Sans · green-first / blue intelligence · NOTHING OFF THE RADR. · HOSPITALITY OPERATING INTELLIGENCE

---

## Logo / mark

| Asset / usage | Classification | Notes |
|---|---|---|
| `components/radr/RadrDeltaGlyph.tsx` | **REPLACE** | Triangle → A-mark geometry |
| `components/radr/RadrDelta.tsx` | **REPLACE** | Keep API; render A-mark |
| `components/radr/RadrWordmark.tsx` | **REPLACE** | R[A]DR with A-mark + focal dot |
| `components/radr/RadrMark.tsx` | **REPLACE** | Product chrome mark → A-mark |
| `components/radr/DeltaMark.tsx` | **REVIEW** | PNG glass/orbit; stop marketing chrome use |
| `components/marketing/BrandMark.tsx` | **REPLACE** | Become BrandLogo API |
| `SiteNav` green square + `RadrDelta` | **REPLACE** | Secondary lockup [A] RADR |
| `SiteFooter` `RadrWordmark` | **REPLACE** | New lockup |
| Hero Connect hub “RADR.” text | **REPLACE** | A-mark in hub |
| Value Calculator hub wordmark | **REPLACE** | A-mark |
| Platform central node | **REPLACE** | A-mark |
| `public/brand/delta-*.png` | **KEEP TEMPORARILY** | Archive; no public chrome refs |
| `public/brand/radr-lockup.png` | **KEEP TEMPORARILY** | Archive |
| New `/public/brand/radr-*.svg` | **REPLACE** | Canonical SSOT |

## Favicon / icons

| Asset | Classification |
|---|---|
| `app/icon.tsx` | **REPLACE** → A-mark app icon |
| `app/apple-icon.tsx` | **REPLACE** |
| `app/favicon.ico` | **REPLACE** |
| `public/favicon.svg` | **REPLACE** (create) |

## Typography

| Surface | Classification |
|---|---|
| Root `GeistSans` in `app/layout.tsx` | **KEEP** |
| Public CSS Instrument Sans overrides (`pricing.css`, marketing docs) | **REMOVE** / alias Geist |
| Product engine CSS Instrument Sans | **KEEP TEMPORARILY** (later pass) |
| Hero NOTHING OFF THE RADR. | **REPLACE** type scale (Geist 700–750) |
| Slogan / category lines | **KEEP** |

## Color tokens

| Token area | Classification |
|---|---|
| `--color-brand: #00D978` | **KEEP** as `--radr-green` |
| Forest CTA deep greens | **REPLACE** → `--radr-forest` for primary CTAs |
| Analytical blue | **REPLACE** → `--radr-blue` (~10% use) |
| Canvas `#F7FAF8` / `#F8FAF7` | **REPLACE** align `--radr-bg` |

## Pages

| Page | Classification |
|---|---|
| Header / footer / favicon | **REPLACE** |
| Homepage hero + Connect | **REPLACE** brand only |
| Platform / Calculator / Solutions / Pricing | **REPLACE** brand marks |
| Company | **REPLACE** logo + type only (no redesign) |
| Trust | **REPLACE** marks |
| Logged-in `/app` fonts/IA | **KEEP TEMPORARILY** |

## Content hygiene

| Item | Classification |
|---|---|
| NOTHING OFF THE RADR. | **KEEP** |
| HOSPITALITY OPERATING INTELLIGENCE | **KEEP** |
| “Signal to decision” as primary slogan | **REMOVE** if used as primary |
| Mockup revenue / fake executives | **REMOVE** if present |
| Serif marketing type | **REMOVE** |

## Migration order

1. Audit (this doc)  
2. SVG assets + favicons  
3. BrandLogo / glyph / tokens  
4. Header / footer / favicon  
5. Homepage  
6. Platform → Calculator → Solutions → Pricing → Company → Trust  
7. Visual QA + preview deploy  
