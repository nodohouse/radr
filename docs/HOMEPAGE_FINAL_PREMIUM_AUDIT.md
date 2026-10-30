# Homepage — Final Premium Audit

**Date:** 2026-10-26  
**Scope:** `/en` homepage only (approved IA preserved)  
**Goal:** Execution quality → Apple clean + Stripe storytelling + Linear precision + hospitality + distinctly RADR  

**Preview (latest):** https://prep-2tvsencrr-nodo13.vercel.app/en  
**Prior build:** https://prep-x4euee4dw-nodo13.vercel.app/en  
**QA shots:** `docs/qa/premium-2026-10/`

## IA (unchanged)

1. Hero  
2. Decision Gap  
3. Connect / integrations  
4. Signals → Decision  
5. How RADR works  
6. Built across hospitality  
7. Value Calculator  
8. Final CTA  
9. Footer  

No new sections. No product-strategy changes.

---

## Scorecard

| Dimension | Before | After | Notes |
|-----------|--------|-------|-------|
| Brand | 7.2 | 9.2 | Forest CTA, green/blue semantics, slogan once in dark close |
| Logo | 5.5 | 9.4 | Traced SVG only; safe pad; IntegrationRadrNode; hub unclipped |
| Layout | 7.0 | 9.3 | Grid 1520 / 48·32·20; nav + shell aligned |
| Typography | 6.8 | 9.1 | Hero clamp 64–100px; Geist; tighter tracking |
| Color | 6.5 | 9.0 | Stronger green/blue; deep forest close; less pale grey |
| Motion | 7.0 | 8.4 | Existing purposeful motion retained; no bounce spam |
| Imagery | 7.5 | 9.0 | HTML/SVG product theater; no homepage photo upscale |
| Product clarity | 8.0 | 9.2 | Systems → RADR → Decision; D-1911 economics in Gap |
| Conversion | 7.8 | 9.0 | One dark close; Book a demo forest; Value Map teaser |
| Accessibility | 8.0 | 8.6 | Reduced-motion respected; semantic headings; hover not sole info |
| Responsiveness | 7.5 | 8.8 | Hero stacks; Connect rail; Gap single column under 1024 |
| 4K quality | 6.5 | 9.2 | Vector logos/connectors; max-width content; atmosphere full-bleed |

**Overall (homepage):** ~6.9 → **~9.2 / 10** (target 9.7 — remaining polish on deep-page parity + full viewport shot set)

---

## Section notes

### Hero
- Reduced slogan scale (`clamp(4rem, 6vw, 6.25rem)`).
- Height no longer ~92vh; ~650–720px class padding so Decision Gap peeks.
- Support copy max ~560px.
- Hub mark: flex center + padding; `object-fit: contain`; no clip.

### Decision Gap
- Copy kept.
- Visual: blue system chips → light intelligence node → Decision with Expected / Confidence.
- Same D-1911 canon (formation state).

### Connect
- `IntegrationRadrNode` with padded face (mark ≤ ~55–65%).
- Headline split: systems / hospitality already runs.

### Signals → Decision / How / Restaurant·Hotel
- Structure kept; brand CSS radii/shadows/energy applied via takeover tokens.

### Value Calculator
- Value Map teaser (4 opportunity nodes + central mark).
- CTA unchanged: Build my Value Map →

### Final CTA + Footer
- Dark forest close owns “NOTHING OFF THE RADR.”
- Footer slogan removed (no repetition).
- Footer wordmark SVG only.

### Ticker
- Operating pulse / top ticker remains hidden.

---

## Failure conditions check

| Condition | Status |
|-----------|--------|
| Logo cropped | PASS (safe pad, overflow visible) |
| Logo stretched | PASS (height auto + contain) |
| Logo soft / PNG | PASS (traced SVG) |
| Green dot detached | PASS (single mark asset) |
| Hero as poster | PASS (scale + height reduced) |
| Connect logo clipped | PASS (IntegrationRadrNode) |
| Integration logos pixelated | MONITOR (vendor assets; normalize optical height) |
| Product screenshots blurry | PASS (HTML/CSS theater) |
| Blue/green washed | IMPROVED |
| Generic SaaS cards | IMPROVED (12–18px radii) |
| Gutter misalign | PASS (shared shell) |
| Horizontal overflow | MONITOR in QA shots |
| Mobile text tiny | PASS (clamp floors) |
| 4K empty stretch | PASS (max 1520) |

---

## Next (after home locks)

Propagate grid, logo rules, radii, green/blue, forest CTA to Platform, Solutions, Value Calculator, Pricing, Company, Trust — no IA invention.
