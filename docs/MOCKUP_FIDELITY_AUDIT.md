# Mockup fidelity audit — RADR homepage

Reference: final homepage visual mockup (1512×982 canonical).
Implementation: `Homepage2030` + `RadrAtmosphere` + `homepage-mockup.css`.

## Method

1. Implement chapter  
2. Screenshot 1512×982  
3. Diff vs mockup  
4. Fix  
5. Re-capture  

---

## PASS 1 — Global atmosphere

| | |
|---|---|
| **REFERENCE** | One continuous blue/green luminous field through all chapters; no hard section cuts |
| **IMPLEMENTATION** | `RadrAtmosphere` — base `#F7FAF8` + layered radial fields + long SVG signal paths |
| **DIFFERENCES** | Atmosphere intensity tuned toward mockup; section backgrounds forced transparent under `.rx30--fidelity` |
| **FIXES** | Removed per-section solid fills; bridges transparent |

## PASS 2 — Navigation

| | |
|---|---|
| **REFERENCE** | Mark left · Platform / Solutions / Value Calculator / Pricing / Company · Login + Book a demo |
| **IMPLEMENTATION** | Existing `SiteNav` mark-only lockup |
| **DIFFERENCES** | Structure already matches; chrome polish via premium CSS |
| **FIXES** | No IA change |

## PASS 3 — Hero

| | |
|---|---|
| **REFERENCE** | ~40/60 copy/visual · systems rows · RADR core (no “RADR” label) · dark Next Decision module · Review Decision → |
| **IMPLEMENTATION** | `rx30-bleed-grid--fidelity` 40/60 · `HeroConnectMap` dark module · 4–5s motion · InlineRadrMark @ 1cap |
| **DIFFERENCES** | Motion faster (4.2s hold); evidence + metrics in Decision |
| **FIXES** | Removed zone “RADR” label; play icon on secondary CTA |

## PASS 4 — Decision Gap

| | |
|---|---|
| **REFERENCE** | Raw signals → Operating state → Compare futures (Do nothing vs Pace) |
| **IMPLEMENTATION** | `DecisionGapContinue` engine surface + futures cards |
| **DIFFERENCES** | Glass canvas over atmosphere |
| **FIXES** | Labels renamed to Raw signals / Compare futures |

## PASS 5 — Connect

| | |
|---|---|
| **REFERENCE** | Integrations → RADR core (Normalize…) → Decision layer |
| **IMPLEMENTATION** | Marquee + `IntegrationRadrNode` operating context |
| **DIFFERENCES** | Fragment “knows” chips retained as narrative aid |
| **FIXES** | Transparent chapter over atmosphere |

## PASS 6 — Signals → Decision

| | |
|---|---|
| **REFERENCE** | Live signals · Operating context graph · RADR Decision |
| **IMPLEMENTATION** | Unified `rx-sig-frame` + 19:48 marker |
| **DIFFERENCES** | Glass frame |
| **FIXES** | Transparent section bg |

## PASS 7 — Product showcase

| | |
|---|---|
| **REFERENCE** | “From signal / to outcome.” · large dark product frame · CC / Live / Decisions / Value |
| **IMPLEMENTATION** | `HomeProductProof` native shell |
| **DIFFERENCES** | Headline line break matched |
| **FIXES** | Transparent chapter |

## PASS 8–10 — Hospitality / Value / Final CTA

| | |
|---|---|
| **REFERENCE** | Dual operating models · Value Map nodes with $/% · dark network close |
| **IMPLEMENTATION** | RH shell · Value Map mockup metrics · close CTAs Book demo / See platform |
| **DIFFERENCES** | Prefer native product surfaces over photos when assets unavailable |
| **FIXES** | Atmosphere close field + existing network SVG |

## Measurement — Inline A

| Metric | Value |
|---|---|
| Target | Black-stroke height = 1cap ±1% |
| Measured ratio | ~1.000 (prior pass 0.9999) |
| Component | `InlineRadrMark` ink-tight viewBox |

## Screenshots

- `.tmp/review/mockup-fidelity/` — first fidelity pass  
- `.tmp/review/mockup-fidelity2/` — Value + Final CTA rebuild  

## PASS — Value Calculator (strict)

| | |
|---|---|
| **REFERENCE** | Left: eyebrow + “What is your operation leaving behind?” + CTA · Right: orbit Value Map with 4 opportunity nodes + center RADR |
| **IMPLEMENTATION** | `rx-value` 2-col · `HomeValueMap` orbit · +$28K / +12% / +3–6% / +0.4 · Start here priority |
| **DIFFERENCES** | Node card style still slightly denser than mockup circles; connector glow intensity may need +1 pass |
| **FIXES** | Separated text column from map; spacious min-height 540px; value→close ramp |

## PASS — Final CTA (strict)

| | |
|---|---|
| **REFERENCE** | Deep forest · green eyebrow · NOTHING OFF THE RADR · See RADR in action + Book a demo · expansive blue/green network |
| **IMPLEMENTATION** | `HomeCloseCta` · `rx-close` min-height ~420–560 · network SVG · atmosphere close-ramp |
| **DIFFERENCES** | Network density vs mockup globe-like field still lighter; footer separation depends on site footer chrome |
| **FIXES** | Dedicated cinematic section (not tiny banner); continuous darkening via atmosphere |

## Remaining material gaps (do not claim complete)

1. Connect Decision-layer column vs mockup list layout  
2. Hospitality photo cards vs native product shells  
3. Value Map nodes are rectangular glass cards (mockup leans circular)  
4. Final CTA network still below mockup density  
5. Full-page side-by-side overlay not yet pixel-locked chapter-by-chapter
