# RADR logo freeze audit

**Date:** 2026-10-26  
**Status:** LOGO FROZEN — restore complete  

## Source of truth (LOCKED)

| File | SHA-256 (kit) | Status |
|------|---------------|--------|
| `.tmp/traced-logo/radr-mark-traced.svg` → `public/brand/radr-mark-traced.svg` | `46a4e203…` | RESTORED byte-identical |
| `.tmp/traced-logo/radr-wordmark-traced.svg` → `public/brand/radr-wordmark-traced.svg` | `0919e02e…` | RESTORED byte-identical |
| `*-traced-white.svg` / `*-traced-monochrome-*.svg` | kit copies | RESTORED |

**Rule:** Do not edit path data, viewBox, fills, or geometry. Fix containers only.

## Immutable renderer

| Path | Role |
|------|------|
| `components/brand/FrozenRadrLogo.tsx` | **ONLY** public logo renderer |
| `components/brand/RadrLogo.tsx` | Compat shim → FrozenRadrLogo |
| `.cursor/rules/radr-logo-freeze.mdc` | Always-on agent rule |

## Public surfaces (must use Frozen assets)

| Surface | Implementation |
|---------|----------------|
| Header / mobile nav | `BrandLogo` → FrozenRadrLogo wordmark |
| Footer | `BrandLogo` → FrozenRadrLogo |
| Hero hub | `FrozenRadrLogo` mark |
| Connect node | `IntegrationRadrNode` → FrozenRadrLogo mark |
| Decision Gap | FrozenRadrLogo mark |
| Value Map teaser | FrozenRadrLogo mark |
| Favicon | `public/brand/favicon.svg` (mark paths nested; geometry from kit) |
| `/brand-test` | FrozenRadrLogo size ladder |

## Legacy / deprecated (do not use on public routes)

| Path | Action |
|------|--------|
| `public/brand/legacy/**` | ARCHIVE — approximations, deltas, PNGs |
| `public/brand/legacy/approximated-2026-10/**` | ARCHIVE — Cursor-drawn geometry |
| `public/brand/legacy/pixel-traced-cropped-apex/**` | ARCHIVE — failed viewBox pad experiment |
| Old `RadrAMark` / triangle / delta CSS recreations | Do not wire on marketing |

## Incident (2026-10-26)

A pass substituted clean approx geometry into `radr-mark-traced.svg` / wordmark A paths.  
**Reverted.** Kit files restored verbatim. Geometry must never be “improved” again.

## Acceptance checklist

**Preview:** https://prep-mwdnkx9wv-nodo13.vercel.app/en  
**Brand-test:** https://prep-mwdnkx9wv-nodo13.vercel.app/en/brand-test  
**Shots:** `docs/qa/premium-2026-10/freeze-*.png`

Deployed assets SHA-256 match kit (mark `46a4e203…` · wordmark `0919e02e…`).

- [x] Assets restored byte-identical from `.tmp/traced-logo`
- [x] `FrozenRadrLogo` + agent freeze rule
- [x] Header / hero / Connect / footer / mobile / brand-test shots
- [ ] **Human approval** vs branding board (stop until approved)
