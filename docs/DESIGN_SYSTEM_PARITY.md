# Design System Parity (/en × /app)

**Date:** 2026-09-24  
**Goal:** One DNA. Editorial storytelling on the website. Editorial instrumentation in the product.  
**Token SSOT:** `app/radr-brand-tokens.css`

---

## Locked identity

| Token | Value | Use |
|---|---|---|
| Display / UI font | Instrument Sans (`--font-body` / `--font-display`) | Never bare system Inter/Roboto |
| Mono | IBM Plex Mono | Territories, IDs, system labels only |
| Canvas (marketing) | `#F7FAF8` mineral light | Public surfaces |
| Surface | `#FFFFFF` | Cards / modules when needed |
| Ink | `#0A0D0B` | Primary text |
| Muted | `#626A65` | Context |
| RADR green | `#00D978` / deep `#00A85A` | Signal only — never full chrome |
| Product shell | Warm mineral light (`#F4F1EA` / ivory) | Default `/app` chrome — matches marketing DNA |
| Graphite instruments | `#0E1512` / `#08100C` | Selective judgment surfaces only (pulse cells, timeline, overlays) — not full-app dark |

**Doctrine:** One brand. Marketing and product share canvas, ink, green signal, type, radius, and chart grammar. Product uses selective graphite instruments for judgment density; do not bleach every dark instrument, and do not invent a second brand.

---

## Shared foundations (confirm / consolidate)

| Layer | Source | Status |
|---|---|---|
| Brand tokens | `app/radr-brand-tokens.css` | **SSOT** — extend, don’t fork |
| Visual system 3 | `docs/RADR_VISUAL_SYSTEM_3.md` · `app/radr-visual-system-3.css` | Active |
| Public CSS | `app/radr-public.css` · `app/home.css` · kinetic | Marketing |
| Product CSS | `app/product.css` · cockpit · command | Product |
| Primitives | `lib/design-system/` | Prefer shared over one-off |
| Charts | Same axes · crosshair · Actual > Forecast > Plan | Both |
| Buttons | `rx-btn` / product primary near-black or green CTA | Align labels |
| Status | Needs you · Handling · Watching · Verified | Shared vocabulary |
| Motion | Presence + hierarchy; no scroll-jacking on marketing | Keep |

---

## Known drift (fix)

| Issue | Marketing | Product | Action |
|---|---|---|---|
| Control Center visual | `GroupControlCenterMock` group list aesthetic | Compressed cockpit (`rp-cock`) | Rebuild mock from cockpit grammar |
| Needs-you chrome | “3 things need you” | “2 need your judgment” | Match product copy + count |
| Situation statement | Recovery / settlement cards | “Revenue is ahead. Contribution isn’t.” | Mirror product statement |
| Density | Editorial spacious | Dense instrumentation | OK — same type scale steps |
| Duplicate color literals | Some kinetic CSS | Some product CSS | Prefer token vars |
| Typography alias bugs | Historically fixed (`--font-sans`) | Watch regressions | See `TYPOGRAPHY_PARITY_AUDIT.md` |

---

## Component parity rule

> If the website shows a beautiful Decision / Verified Value / readiness visualization, the real product surface must look **at least as good**.

| Website artifact | Product must match or exceed |
|---|---|
| Hero Control Center mock | `/app` cockpit |
| Recovery €273 chain | Decision Room + `/app/value` |
| Futures compare | Decision Futures trajectories |
| Hotel readiness story | HotelCockpit + Live |
| Memory calibration | `/app/memory` |
| Integration → Decision flow | Connections + Decision evidence |

Marketing must never be visually better than the product for the same object.

---

## Visual rules (both)

- One idea per viewport (website)
- No wall of cards · no logo soup · no generic AI gradients · no cyber aesthetic
- Green = live / detected / verified signal only
- Absolute positioning only for overlays
- Charts: real axes; Findings as quiet dots
- Scroll belongs to the user (marketing)

---

## Type & radius philosophy

- Instrument Sans for UI copy; expressive but calm
- Large statements on website; compressed judgment language in product
- Radius: soft mineral, not pill-cluster SaaS
- Spacing rhythm: section breathing on `/en`; module grid on `/app` — same base unit scale

---

## Motion language

| Intent | Pattern |
|---|---|
| Presence | Soft fade / settle on hero product frame |
| Hierarchy | Stagger situation → judgment |
| Proof | Chain reveal Contract→Invoice→Verified |
| Avoid | Scroll traps · endless Lottie noise · neon pulse |

---

## Checklist before any `/en` visual change

1. Token already exists? Use it.  
2. Does `/app` already have the pattern? Reuse grammar.  
3. Will this make marketing prettier than product? If yes → product first.  
4. Freeze lifted? If no → docs only.

---

## Related

- `docs/RADR_VISUAL_SYSTEM_3.md`
- `docs/TYPOGRAPHY_PARITY_AUDIT.md`
- `docs/VISUAL_PARITY_QA.md`
- `docs/MARKETING_TO_PRODUCT_CROSSWALK.md`
- `docs/PRODUCT_VISUAL_COHERENCE_AUDIT.md`
