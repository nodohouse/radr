# Marketing Design Source of Truth

**Canonical surface:** https://prep-ten-zeta.vercel.app/en  
**Captured:** 2026-09-24 via CDP (`document.fonts` + `getComputedStyle`)  
**Do not invent an app palette.** Product inherits these values.

---

## Font family

| Token | Value |
| --- | --- |
| Primary UI / display | **Instrument Sans** (variable, weight axis `400–700`) |
| Fallback metric | `Instrument Sans Fallback` (next/font size-adjust) |
| Mono / system labels | **IBM Plex Mono** `400 / 500 / 600` |
| Loading | `next/font/google` → CSS vars `--font-display`, `--font-body`, `--font-mono` |

**Computed body `font-family`:**  
`"Instrument Sans", "Instrument Sans Fallback"`

**Optical sizing:** `auto`  
**Marketing `font-synthesis` (body):** `weight style small-caps` (browser default)  
**Product rule:** `font-synthesis: none` under `.rp-shell-v2` to prevent fake bold.

---

## Type samples (computed on /en)

### Body

| Property | Value |
| --- | --- |
| `font-size` | `16px` |
| `font-weight` | `400` |
| `line-height` | `24px` (1.5) |
| `letter-spacing` | `normal` |
| `color` | `rgb(10, 13, 11)` → `#0A0D0B` |

### Display H1 (`.rx-he-recover-title`)

| Property | Value |
| --- | --- |
| `font-size` | `29.6px` (viewport-dependent; clamp in CSS) |
| `font-weight` | `680` (variable axis) |
| `line-height` | `34.04px` (~1.15) |
| `letter-spacing` | `-1.184px` ≈ **`-0.04em`** |
| `color` | `#0A0D0B` |

### Wordmark / brand link

| Property | Value |
| --- | --- |
| `font-size` | `18px` |
| `font-weight` | `400` |
| `color` | `#00D978` |

### Primary button (`.rx-btn.rx-btn-primary`)

| Property | Value |
| --- | --- |
| Background | `#0A0D0B` |
| Color | `#F7FAF8` |
| `font-size` | `14px` |
| `font-weight` | `550` |
| `border-radius` | `980px` (pill) |
| Padding | `11.2px 21.6px` |

### Secondary / ghost button (`.rx-btn.rx-btn-ghost`)

| Property | Value |
| --- | --- |
| Background | `rgba(255,255,255,0.45)` |
| Border | `1px solid rgba(10,13,11,0.18)` |
| Radius | pill |
| Weight | `550` |

### Nav CTA solid (`.rx-nav-cta`)

| Property | Value |
| --- | --- |
| Background | `#00D978` |
| Color | `#04140C` |
| Radius | `10px` |
| Weight | `600` |
| Size | `12.48px` |
| Transition | `background/color/border-color 0.18s` |

---

## Color tokens (`:root` — shared `radr-brand-tokens.css`)

| Token | Hex / value |
| --- | --- |
| `--color-canvas` | `#f7faf8` |
| `--color-canvas-elevated` | `#fbfdfc` |
| `--color-surface` | `#ffffff` |
| `--color-surface-subtle` | `#eef4f0` |
| `--color-text` | `#0a0d0b` |
| `--color-text-secondary` | `#626a65` |
| `--color-text-muted` | `#7a827d` |
| `--color-text-inverse` | `#f7faf8` |
| `--color-brand` / electric | `#00d978` |
| `--color-brand-deep` | `#00a85a` |
| `--color-brand-muted` | `rgba(0,217,120,0.12)` |
| `--color-border` | `rgba(10,13,11,0.08)` → `#0a0d0b14` |
| `--color-border-strong` | `rgba(10,13,11,0.14)` → `#0a0d0b24` |
| `--color-hairline` | `rgba(10,13,11,0.06)` → `#0a0d0b0f` |
| `--semantic-positive` | `#0f7a45` |
| `--semantic-negative` | `#b42318` |
| `--semantic-warning` | `#b54708` |
| `--semantic-verified` | `#00a85a` |
| `--semantic-live` | `#00d978` |
| `--semantic-stale` | `#9aa39c` |

**Body background (computed):** `rgb(247, 250, 248)` = `#F7FAF8`

---

## Radius

| Token | Value |
| --- | --- |
| `--radius-xs` | `0.25rem` |
| `--radius-sm` | `0.375rem` |
| `--radius-md` | `0.625rem` (10px) |
| `--radius-lg` | `0.875rem` |
| `--radius-xl` | `1rem` |
| `--radius-pill` | `999px` |

---

## Spacing

| Token | Value |
| --- | --- |
| `--space-1` … `--space-8` | `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 2.75 / 4 rem` |
| Hero section padding (sample) | `~119px 0 15px` (editorial top air) |

---

## Motion

| Token | Value |
| --- | --- |
| `--motion-fast` | `0.15s` |
| `--motion-base` | `0.22s` |
| `--motion-slow` | `0.42s` |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--ease-emphasis` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Nav brand transition | `transform 0.18s` + `--ease-out` |

---

## Depth

| Token | Value |
| --- | --- |
| `--shadow-soft` | `0 1px 0 rgba(10,13,11,0.04)` |
| `--shadow-float` | `0 12px 40px rgba(10,13,11,0.08)` |
| `--shadow-focus` | `0 0 0 3px rgba(0,217,120,0.28)` |

Marketing surfaces prefer **tonal separation** over floating cards.

---

## Chart grammar (shared tokens)

| Role | Token |
| --- | --- |
| Observed | `--chart-primary` `#0a0d0b` |
| Brand / verified | `--chart-brand` / `--chart-verified` `#00a85a` |
| Compare / forecast | `--chart-compare` / `--chart-forecast` `#9aa39c` |
| Warning | `--chart-warning` `#b54708` |

---

## Navigation treatment

- Transparent / mineral canvas bleed
- Wordmark in brand green, weight 400
- Ghost + solid CTAs; solid recovery CTA uses RADR green fill
- No heavy sidebar chrome on marketing

---

## Section width / rhythm

- One idea → space → next idea
- Large top padding on hero (~120px)
- Statements first; product UI / proof second
- Max content often full-bleed with internal wraps; avoid equal card grids

---

## Icon style

- Sparse line icons where present
- Green used as **signal**, not chrome
- Prefer geometric markers over decorative illustration noise

---

## Source files (code)

| File | Role |
| --- | --- |
| `app/radr-brand-tokens.css` | Shared `:root` tokens (/en + /app) |
| `app/globals.css` | Imports brand tokens |
| `app/layout.tsx` | Instrument Sans + IBM Plex Mono via next/font |
| `app/home.css` / `app/radr.css` | Marketing composition (FROZEN) |

---

## Inheritance contract

`/app` must consume the same:

- Instrument Sans (not Inter / Geist / system)
- `#F7FAF8` canvas, `#0A0D0B` ink, `#00D978` brand green
- Radius / motion / hairline borders
- Weight restraint (product caps display at **600**, avoids **700**)

Product adds density and instruments — not a second brand.
