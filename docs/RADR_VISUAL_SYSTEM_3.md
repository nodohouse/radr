# RADR Visual System 3.0

**Date:** 2026-09-24  
**Scope:** Authenticated product (`/app`) only. Marketing frozen.

## Intent

Remove Grafana / Datadog / BI card-grid grammar. RADR should read as operating intelligence: time, causality, selectivity, proof — not monitoring chrome.

## Typography (SSOT = marketing)

| Token | Value |
|-------|--------|
| Brand / UI / numbers | **Instrument Sans** via `next/font` `--font-body` / `--font-display` |
| Mono (states only) | IBM Plex Mono |
| `--font-sans` / `--font-ui` / `--font-brand` | Aliased to next/font vars (never bare family name alone) |

### Weights

| Role | Weight |
|------|--------|
| Body / inactive nav | 400 |
| Book / secondary | 450 |
| Medium / hover / metrics | 500 |
| Semibold / active / titles | 600 |
| Bold | **600 max** (no 700 in product UI) |

### Scale

| Role | Token / size |
|------|----------------|
| Display / editorial | `--fs-display` · 40–52px |
| Hero metric | `--fs-hero-metric` · 36–48px |
| Page / Live title | ~26–34px |
| Section | `--fs-section` · 20–24px |
| Module | `--fs-module` · 17px |
| Body | `--fs-body` · 15.5px |
| Label | `--fs-label` · 13px |
| Meta floor | `--fs-meta` · 12px |

## Surfaces

- Canvas: warm ivory `#F7FAF8`
- Modules: soft tonal panels, **hairline or no border** — not card soup
- Green: NOW / LIVE / Decision / Verified only (~5–10% of UI)

## Module types

| Type | Behavior |
|------|----------|
| Hero instrument | Dominant, little chrome (Live trajectory, Overview situation) |
| Decision surface | Tension, economics, time |
| Intelligence instrument | Visualization-first |
| System utility | Calm, functional (Settings, Data Health) |

## Files

- `app/radr-brand-tokens.css` — tokens + font aliases
- `app/radr-visual-system-3.css` — product layer (loaded last)
- `app/layout.tsx` — `body.className` applies Instrument Sans to document

## Motifs

- **Attention compression:** reviewed → handled → need judgment
- **Editorial brief:** situation sentence before KPI wall
- **Temporal Live:** chips off-plot; trajectory is protagonist
