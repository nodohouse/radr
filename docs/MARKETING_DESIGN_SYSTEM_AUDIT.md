# Marketing Design System Audit

**Status:** Canonical · extracted from live `/en` implementation (not guessed)  
**Live:** https://prep-ten-zeta.vercel.app/en  
**Date:** 2026-10-05

Primary files:

| File | Role |
|------|------|
| `app/radr-brand-tokens.css` | Shared brand tokens (`:root`) |
| `app/radr.css` | `.radr` marketing system · `--bg` / `--signal` · Operating Pulse |
| `app/radr-public.css` | Public primitives (`--rx-*`) |
| `app/layout.tsx` | Fonts: Instrument Sans (`--font-display` / `--font-body`), IBM Plex Mono, Newsreader (product editorial only) |
| `components/radr/RadrDeltaGlyph.tsx` | Canonical △ SVG (`viewBox="0 0 100 90"`) |
| `components/radr/RadrWordmark.tsx` | R△DR lockup |
| `components/marketing/SiteNav.tsx` | Public nav DNA |
| `lib/marketing/operatingPulse.ts` | Ticker vocabulary |

Product **must** consume these tokens via `app/radr-product-tokens.css` aliases.  
Do **not** invent `#B9FF2C`, dark `#111411` rail, or cream `#f4f1ea` / `#fffcf7` as a second canvas.

---

## Typography

| Role | Family | Token | Notes |
|------|--------|-------|-------|
| Brand / UI / Display | Instrument Sans | `--type-display`, `--type-body` ← `--font-display` / `--font-body` | Marketing H1 is Instrument — **not** a separate serif |
| Mono / eyebrows | IBM Plex Mono | `--type-mono` ← `--font-mono` | Uppercase micro labels · `0.12em` tracking |
| Editorial (product interpretation) | Instrument Sans at display scale | `--rp-type-editorial` | Same family as marketing; larger size + tight tracking. Newsreader is loaded but **not** marketing SSOT for public H1 |

### Public type scale (`radr-public.css`)

| Role | Token | Approx |
|------|-------|--------|
| Display | `--rx-display` | `clamp(2.6rem, 5.8vw, 4.25rem)` · ~620 · `-0.04em` · lh 1.05 |
| Statement | `--rx-statement` | `clamp(1.75rem, 3.6vw, 2.55rem)` · ~560 · `-0.03em` |
| Product number | `--rx-product-num` | `clamp(3.25rem, 8vw, 5.75rem)` · tabular |
| Body | `--rx-body` | `clamp(1.05rem, 1.25vw, 1.2rem)` · lh 1.55 |
| Micro / eyebrow | `--rx-micro` | `0.72rem` · mono · `0.12em` · uppercase |

### Product type modes (required)

| Mode | Use | Treatment |
|------|-----|-----------|
| **Editorial interpretation** | Situation, Memory accuracy, Value hero, Intel questions | Instrument · `--rx-statement` / `--fs-display` · weight 500–600 · `-0.03em`…`-0.04em` |
| **Operational interface** | Nav, tables, tabs, forms, metadata | Instrument · body / meta · high legibility |
| **Numeric / economic** | Money, %, clocks, counts | Tabular nums · strong scale contrast · never run-on with labels |

Weights in product UI: 400 / 450 / 500 / 600 — **never 700**.

---

## Color (exact)

| Role | Hex / value | Token |
|------|-------------|-------|
| Canvas | `#f7faf8` | `--color-canvas`, `--bg`, `--rx-canvas` |
| Surface | `#ffffff` | `--color-surface` |
| Surface subtle | `#eef4f0` | `--color-surface-subtle` |
| Canvas elevated | `#fbfdfc` | `--color-canvas-elevated` |
| Ink | `#0a0d0b` | `--color-text` |
| Muted | `#626a65` | `--color-text-secondary` |
| Strong mute | `#3f4642` | `--muted-strong` |
| Quiet | `#7a827d` | `--color-text-muted` |
| **RADR green (signal)** | `#00d978` | `--color-brand`, `--signal`, `--rx-live` |
| Verified / deep green | `#00a85a` | `--color-brand-deep`, `--semantic-verified` |
| Adverse red | `#b42318` | `--semantic-negative` |
| Watch amber | `#b54708` | `--semantic-warning` |
| Border | `rgba(10, 13, 11, 0.08)` | `--color-border` |
| Hairline | `rgba(10, 13, 11, 0.06)` | `--color-hairline` |
| Sidebar / rail | `#f1f6f3` | `--radr-sidebar` |

### Brand signal usage (selective)

Green `#00d978` only for: logo mark · LIVE · selected intervention · recommended Future · Verified confirmation · active accent.  
**Not** every positive number (use `--semantic-positive` / ink).

### Surface depth hierarchy (product)

| Level | Role | Treatment |
|-------|------|-----------|
| **L0** | Canvas | `#f7faf8` |
| **L1** | Open working surface | `#ffffff` + hairline |
| **L2** | Contained module | `#ffffff` on L0 with `border: 1px solid var(--color-border)` + optional `--shadow-soft` |
| **L3** | Focus / active object | `#ffffff` + stronger border `rgba(10,13,11,0.14)` OR `color-mix(signal 12%, white)` tint + green indicator |

If L1/L2 cannot be distinguished from L0 without staring → FAIL.

---

## Logo

| Item | Spec |
|------|------|
| Asset | `RadrDeltaGlyph` SVG — stroke triangle, `currentColor` |
| viewBox | `0 0 100 90` · path `M50 8 L90 81 H10 Z` · strokeWidth 14 · round joins |
| Marketing color | `#00d978` (`--signal`) |
| Wordmark | `RadrWordmark` = R + △ + D + R |
| Product rail | Standalone △ mark · same glyph · same green |
| Optical note | Visual mass sits low in the box (base stroke) — nudge `translateY(-1px)` in rail mark for optical center |

Do **not** recreate the triangle with CSS borders if the glyph exists.

---

## Radius / shadow / spacing / motion

| Token | Value |
|-------|-------|
| `--radius-xs`…`--radius-lg` | `0.25` / `0.375` / `0.625` / `0.875` rem |
| `--radius-module` | `0.5rem` |
| `--shadow-soft` | `0 1px 0 rgba(10, 13, 11, 0.04)` |
| `--shadow-float` | `0 12px 40px rgba(10, 13, 11, 0.08)` |
| `--shadow-focus` | `0 0 0 3px rgba(0, 217, 120, 0.28)` |
| Spacing | 4–64px scale (`--space-4px`…`--space-64px`) |
| `--motion-fast` / `--motion-base` | `150ms` / `220ms` |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |

---

## Navigation DNA

- Public: sparse horizontal `SiteNav` on mineral light
- Product: thin left rail (`#f1f6f3`) — architectural, not Slack/admin dark
- Active: subtle tint + small green indicator — no giant pills
- CTAs: text + `→` · primary fill green sparingly

---

## Operating Pulse (marketing ticker)

Status leads: `DECISION` · `VERIFIED` · `ACTION` · `MEMORY` · `WITHIN EXPECTATIONS` · `RADR HANDLING`

Example: `DECISION · BERLIN MITTE · WAIT 12 MINUTES · +€620 expected`

App LIVE strip must reuse this vocabulary — not six KPI pills.

---

## Buttons / links

- Primary: signal green fill · near-black ink · restrained radius
- Secondary: hairline on canvas
- Drilldowns: text + `→`
