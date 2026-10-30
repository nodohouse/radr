# TYPOGRAPHY AUDIT — Visual System 3.0

**Date:** 2026-09-24  
**Method:** Chrome CDP `getComputedStyle` on production `/app?view=live` + code audit.

## Finding (P0) — before fix

| Element | Expected | Observed |
|---------|----------|----------|
| Nav `.rp-rail-link` | Instrument Sans · weight 400–450 | **System UI stack** · weight **600** |
| Logo / brand | Instrument Sans | System UI stack |
| Body / GM line | Instrument Sans | Mixed / system inheritance |
| Titles / metrics | Instrument Sans | Instrument Sans (OK) |

**Root cause:** Shell CSS used `var(--font-sans, …)` but `--font-sans` was never aliased to next/font’s `--font-body`. Bare `"Instrument Sans"` does not match next/font’s registered face. Nav also inherited overweight rules (600 inactive).

IBM Plex Mono: several faces `unloaded` until first mono use — OK for lazy load.

## Fix applied

1. Alias `--font-sans` / `--font-ui` / `--font-brand` → `var(--font-body)` / display stacks in `radr-brand-tokens.css`
2. Apply `${body.className}` on `<body>` so Instrument Sans is the document default
3. VS3 layer forces `font-family: var(--font-ui)` on shell + nav; weights 400 / 500 / 600
4. Cap product “bold” at 600

## Weight system (after)

| Role | Target |
|------|--------|
| Inactive nav | 400 |
| Hover nav | 500 |
| Active nav | 600 |
| Body | 400 |
| Metrics | 500 |
| Titles | 600 |

## PASS criteria

After deploy, CDP must show Instrument Sans (or next/font hashed family resolving to it) on:

- `.rp-rail-link`
- `.rp-ctx-title`
- `.rp-oday-time-h`
- `.rp-oday-gm-line`

Inactive nav weight ≤ 500; active ≤ 600.
