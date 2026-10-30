# Typography Parity Audit — /en vs /app

**Method:** CDP `getComputedStyle` + `document.fonts` on production  
**URLs:** `prep-ten-zeta.vercel.app/en` · `prep-ten-zeta.vercel.app/app`  
**Date:** 2026-09-24

---

## Font loading

| Check | Marketing | App | Match? | Fix |
| --- | --- | --- | --- | --- |
| Family loaded | Instrument Sans `400–700` variable | Instrument Sans `400–700` variable | YES | — |
| next/font vars on `<body>` | `__variable_*` + `className` | Same | YES | Keep `body.className` in `app/layout.tsx` |
| Fallback | Instrument Sans Fallback | Same | YES | — |
| Mono | IBM Plex Mono present | Same (lazy) | YES | — |
| `font-optical-sizing` | `auto` | `auto` | YES | — |
| `font-synthesis` | body allows synthesis | shell `none` (intentional) | PARTIAL | Keep product `none` to stop synthetic bold |

---

## Element parity

### Body

| | Marketing | App (pre-pass prod) | Match? | Fix |
| --- | --- | --- | --- | --- |
| family | Instrument Sans | Instrument Sans | YES | — |
| size | **16px** | **16px** body / **15.5px** editorial p | PARTIAL | `--fs-body: 1rem` (was `.96875rem`) |
| weight | 400 | 400 | YES | — |
| line-height | 24px (1.5) | 24px body | YES | — |
| color | `#0A0D0B` | `#0A0D0B` | YES | — |
| canvas | `#F7FAF8` | `#F7FAF8` | YES | — |

### Display / hero statement

| | Marketing H1 | App editorial H2 | Match? | Fix |
| --- | --- | --- | --- | --- |
| family | Instrument Sans | Instrument Sans | YES | — |
| size | ~29.6px (hero) | ~37.6px (CC brief) | OK denser | Keep larger for operating brief |
| weight | **680** | **600** | INTENTIONAL | Cap product at 600; marketing may use 680 axis |
| tracking | **≈ −0.04em** | ≈ −0.035em | CLOSE | `--tracking-display: -0.04em` |
| synthesis | default | `none` | YES (app) | Enforce on `.rp-shell-v2` |

### Page title / nav chrome

| | Marketing nav brand | App `.rp-ctx-title` | Match? | Fix |
| --- | --- | --- | --- | --- |
| family | Instrument Sans | Instrument Sans (+ system-ui listed) | YES | Prefer `--font-brand` only |
| size | 18px wordmark | 24px title | OK | Product needs stronger page name |
| weight | 400 | 500 | YES | — |

### Sidebar / nav links

| | Marketing | App rail | Match? | Fix |
| --- | --- | --- | --- | --- |
| inactive weight | ~400 | label **450** (`product-density`) | YES | Keep 400–450 |
| hover | — | **500** | YES | — |
| active | — | **600** | YES | No giant pill; hairline inset only |
| family | Instrument Sans | Instrument Sans | YES | Kill any `system-ui` alone |

### Metrics

| | Marketing | App `.rp-metric-delta-val` | Match? | Fix |
| --- | --- | --- | --- | --- |
| family | Instrument Sans | Instrument Sans | YES | — |
| weight | — | **520** | YES | Stay ≤600 |
| tracking | tight | ≈ −0.04em | YES | tabular-nums |

### Buttons

| | Marketing primary | App | Match? | Fix |
| --- | --- | --- | --- | --- |
| weight | **550** | varies | PARTIAL | Align primary actions to 550 |
| radius | pill or 10–12px | mixed | PARTIAL | Prefer pill / `--radius-md` |
| fill | near-black OR green CTA | mixed greens | PARTIAL | Near-black for primary; green = signal |

---

## Weight principle (enforced)

| Role | Target | Status |
| --- | --- | --- |
| Body | 400–450 | OK |
| Inactive nav | 400–450 | OK (450 label) |
| Hover nav | 500 | OK |
| Active nav | 550–600 | OK (600) |
| Module title | 500–550 | Fixed via VS3 (was shouty) |
| Large display | 500–600 | OK (600) |
| Avoid 700 | — | Cap `--fw-bold: 600` |

---

## Residual risks

1. **CSS cascade** — older `product.css` / `radr.css` rules can reintroduce `font-weight: 700` or bare `system-ui`. VS3 loads last under `/app`.
2. **Duplicate Instrument Sans in stacks** — cosmetic; next/font still resolves correctly.
3. **Marketing weight 680 vs product 600** — by design; product stays restrained.

---

## Verdict

**Font family parity: PASS**  
**Weight restraint: PASS after VS3 + density**  
**Body size parity: FIXED** (`--fs-body` → `1rem`)  
**Tracking display: FIXED** (`--tracking-display`)

Do not call complete on font alone — see `VISUAL_PARITY_QA.md` for composition.
