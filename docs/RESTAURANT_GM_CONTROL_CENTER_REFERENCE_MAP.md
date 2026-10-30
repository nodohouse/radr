# Restaurant GM Control Center — Reference Map

**Route:** `/app` · restaurant vertical · GM · Berlin Mitte · Live 19:48 · Dinner  
**Status:** PASS 1–6 + Playwright gate · `tmp/restaurant-gm-cc-pass2-1512x982.png`  
**Visual SSOT:** approved mockup (`assets/RADR_Restaurant_Operations_Dashboard-*.jpg`)  
**Logic SSOT:** D-1911 (`dec_peak_berlin`) + `restaurantGmControlCenterCanon`

## Thesis

Control Center = 5–10s operating brief.

WHAT MATTERS → WHAT IS ABOUT TO BREAK → WHY → WHAT TO DO → WHAT CHANGES → WHAT RADR ALREADY PROVED

Not: POS dump · Operations table map · Live spatial · Intelligence deep dive · Decision ledger.

## P0 bugs (must clear)

| # | Bug | Disposition |
|---|-----|-------------|
| 1 | Header can show `Restaurants / Canal House · Amsterdam` | **FIX** — clamp scope to active org; never resolve hotel ids under restaurant vertical |
| 2 | Rail recommends “Add 1 FOH” while grill is the constraint | **FIX** — D-1911 hold / pace seating 12 min only |
| 3 | Reservations `112 / 12` ambiguous | **FIX** — `112 booked` + `12 walk-ins` / `93% booked capacity` |
| 4 | Duplicate / stale Decision framing | **KEEP** single `dec_peak_berlin` |
| 5 | Shared hotel CSS/imports in restaurant path | **GUARD** — no Canal House copy in restaurant CC |

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| D-1911 Peak | `lib/radr/decision/demos/peak.ts` · `CANON_PEAK` | **KEEP** — Wait 12 / pace seating · €620 · 19:59 |
| Brief composer | `lib/radr/product/controlCenterMetrics.ts` | **KEEP** — Needs You · Verified aggregate |
| Experience rank | `lib/radr/product/experienceComposer.ts` | **KEEP** — peak first for GM |
| Live clock | `LIVE_SCENARIO` · 19:48 | **KEEP** |
| Verified MTD | `deriveValueAggregate` → €3,793 | **KEEP** — never invent CC-only value |
| GM metric lock | `GM_CATALOG` / new canon | **ALIGN** to Berlin dinner state |
| App shell / nav | `AppSidebar` · `GlobalOperatingHeader` | **KEEP** — no mockup nav labels |

## Old presentation (RECOMPOSE / REMOVE)

| Surface | Disposition |
|---------|-------------|
| `VisionGmCockpit` FOH hardcode | **REMOVE** |
| Rich module grid (Stock / Floor / Table turns…) | **REMOVE** from CC — belongs in Operations |
| Bare hero without atmosphere card | **RECOMPOSE** — Tonight Revenue surface |
| Pulse events (142 covers / Grill ~94%) | **ALIGN** — 124 covers · Grill at capacity |
| Neon primary CTA | **RECOMPOSE** — deep premium green · Review Decision |
| Labor Needs You when labor beats plan | **REMOVE** — use delivery/grill-aligned sources |

## Composition (GM · Berlin Mitte · Live)

```
VisionGmCockpit
├── Header (title · context · weather)
├── HeroRevenue (TONIGHT REVENUE · €18,420 · On track · atmosphere)
├── KpiStrip (Contribution · Covers · Avg check · Labor · Reservations)
├── Conclusion (Dinner is ahead. / Grill becomes the constraint at 20:10.)
├── OperatingPulse (actual · forecast · constraint · NOW · events)
└── Rail
    ├── RadrDecision (D-1911 · pace 12 min · €620 · 82% · 19:59 · Why now)
    ├── NeedsYou (≤3 · Peak first)
    └── VerifiedValue (MTD €3,793)
```

## Canonical numbers

| Metric | Value |
|--------|-------|
| Clock | 19:48 |
| Service | Dinner |
| Weather | 22°C · Partly cloudy |
| Revenue | €18,420 · +12.6% vs plan |
| Contribution | €6,870 · +14.2% vs plan |
| Covers | 124 · +8.8% vs plan |
| Avg check | €148 · +3.5% vs plan |
| Labor | 26.1% · −2.3 pp vs plan (favorable) |
| Reservations | 112 booked · 93% capacity · 12 walk-ins |
| Kitchen now | 92% |
| Kitchen peak | 97% @ 20:10 · Grill |
| Decision | D-1911 · Hold next seating wave 12 min |
| Expected | €620 |
| Confidence | 82% |
| Deadline | 19:59 |
| Verified MTD | €3,793 · +18.6% vs prior MTD |

## Decision copy (logic over mockup)

Mockup FOH CTA is **rejected**.

| Field | Value |
|-------|-------|
| ID | `dec_peak_berlin` / D-1911 |
| Title | Peak capacity collision |
| Action | Hold next seating wave for 12 min |
| Why | Grill load peaks ~20:10 while inbound covers stay above plan |
| Not | Add FOH (does not relieve kitchen bottleneck) |

## Cross-links

| Control | Target |
|---------|--------|
| Hero revenue | Intelligence / financial context · Berlin · Tonight |
| Conclusion / constraint | Intelligence · service capacity · or Operations |
| Review Decision / Peak Needs You | `/app/decisions/dec_peak_berlin` |
| Why now | Rail expand (evidence) |
| Verified Value | `/app/value` |
| Pulse constraint band | Decision preview · Operations |

## Implementation order

1. ~~PASS 1 — this map + P0 audit~~
2. PASS 2 — static GM CC @ 1512×982 + corrected Decision
3. PASS 3 — Operating Pulse wire
4. PASS 4 — D-1911 Decision wire
5. PASS 5 — Needs You
6. PASS 6 — Verified Value
7. PASS 7 — Data Health confidence degrade
8. PASS 8 — Persona / location adaptation
9. PASS 9 — Playwright + visual gate

## Regression

Hotel Control Center / Canal House paths must remain unchanged.
Canonical nav must not adopt mockup Home/Forecast/Staffing labels.
