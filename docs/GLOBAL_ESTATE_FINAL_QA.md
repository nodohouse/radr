# Global Estate — Final QA

**Date:** 2026-10-20  
**Mode:** Truth + coherence only. Visual design frozen.  
**SSOT:** `lib/radr/demo/estateRegistry.ts` (`DemoEstateRegistry`)

Companion: `docs/LIVE_RENDERING_ALIGNMENT_AUDIT.md` · prior migration: `docs/GLOBAL_ESTATE_MIGRATION_AUDIT.md`

---

## 1. Definition of done

| Gate | Pass criteria |
|------|----------------|
| Counts | Every portfolio surface derives `10` restaurants / `10` hotels from registry — never typed literals |
| Scope match | Group shell ↔ portfolio body; single-site shell ↔ single-site body |
| Currency | Single-site = local currency; group = explicit `GROUP REPORTING · USD` |
| Timezone | Per-entity IANA timezone; local daypart from deterministic demo clock |
| Hero identity | `loc_berlin_mitte` → Soho · New York; `loc_canal_house` → Mercer House · New York — no mixed Berlin/Canal labels |
| Gateway | `?vertical=` emphasizes without layout fork; counts from `estateCount()` |
| Search | Resolves all 20 sites; selection updates vertical · scope · currency · timezone |
| Cross-route | CC · Live · Ops · Decisions · Intelligence · Value · Memory · Dashboards share same entity |
| Shell | Identity / city / persona render once — no duplicated context row |

---

## 2. Canonical estate (must match registry)

### Restaurants (10)

| Display | City · District | TZ | CCY | Hero ID |
|---------|-----------------|----|-----|---------|
| Soho · New York | New York · Soho | America/New_York | USD | `loc_berlin_mitte` |
| West Hollywood · Los Angeles | LA · West Hollywood | America/Los_Angeles | USD | `loc_berlin_kreuzberg` |
| Roma Norte · Mexico City | Mexico City · Roma Norte | America/Mexico_City | MXN | `loc_hamburg_hafen` |
| Jardins · São Paulo | São Paulo · Jardins | America/Sao_Paulo | BRL | `loc_frankfurt_westend` |
| Soho · London | London · Soho | Europe/London | GBP | `loc_munich_altstadt` |
| DIFC · Dubai | Dubai · DIFC | Asia/Dubai | AED | `loc_koln_ehrenfeld` |
| Tanjong Pagar · Singapore | Singapore · Tanjong Pagar | Asia/Singapore | SGD | `loc_dusseldorf_medienhafen` |
| Shibuya · Tokyo | Tokyo · Shibuya | Asia/Tokyo | JPY | `loc_stuttgart_mitte` |
| Central · Hong Kong | Hong Kong · Central | Asia/Hong_Kong | HKD | `loc_hk_central` |
| Surry Hills · Sydney | Sydney · Surry Hills | Australia/Sydney | AUD | `loc_sydney_surry` |

### Hotels (10)

| Display | City | TZ | CCY | Hero ID |
|---------|------|----|-----|---------|
| Mercer House · New York | New York | America/New_York | USD | `loc_canal_house` |
| Sunset House · Los Angeles | Los Angeles | America/Los_Angeles | USD | *(registry)* |
| Polanco House · Mexico City | Mexico City | America/Mexico_City | MXN | |
| Shoreditch House · London | London | Europe/London | GBP | |
| Downtown House · Dubai | Dubai | Asia/Dubai | AED | |
| Marina House · Singapore | Singapore | Asia/Singapore | SGD | |
| Shinjuku House · Tokyo | Tokyo | Asia/Tokyo | JPY | |
| Harbour House · Hong Kong | Hong Kong | Asia/Hong_Kong | HKD | |
| Surry House · Sydney | Sydney | Australia/Sydney | AUD | |
| Waterfront House · Cape Town | Cape Town | Africa/Johannesburg | ZAR | |

Group reporting: `GROUP_REPORTING_CURRENCY_CODE = USD` + `DEMO_FX_TO_USD` (deterministic). Store local + reporting amounts; never silent € conversion on NYC pages.

---

## 3. Known contradictions (PASS 2 backlog)

### Count literals / stale 8

| Location | Issue | Fix |
|----------|-------|-----|
| `HotelGmControlCenter.tsx` ~299 | `{n} of 8` | `of ${estateCount("hotel")}` or omit denominator if always full |
| `dataHealthProofEngine.ts` | `locationCount: 8` ×5 | Derive from org / registry |
| `tests/portfolio-totals-reconcile.test.ts` | expects `8` | Expect `10` + registry |
| `tests/demo-scenario-coherence.test.ts` | `cc.locationCount` → 8 | Align to 10 |
| `lib/product/demo/dashboard.ts` | `group ? 18` | `estateCount(r)+estateCount(h)` |
| `connectionsProofEngine.ts` | `"5 locations"` coverageLabel | Registry-derived coverage |
| Lab `LiveV2Prototype` | `"3 of 8 need attention"` | Out of product path — quarantine or fix |

### Currency leakage (€ on local NYC / Mercer)

| Surface | Issue |
|---------|-------|
| `VisionHotelPace.tsx`, `visionMeta.ts`, `PaceSurfaces.tsx`, `HotelLiveSurface.tsx` | Hardcoded `€` ADR/RevPAR |
| `DecisionPeek.tsx`, `CcCockpit.tsx`, `BohOverview.tsx`, `PostShiftLiveSurface.tsx` | Euro literals on restaurant hero paths |
| `LocationsBubbleChart.tsx`, `LocationOverview.tsx` | `€` formatters |

**Rule:** Format via venue profile / estate currency for the active scope. Group CFO may show USD reporting with explicit label.

### Timezone

| Check | Status |
|-------|--------|
| Hero demo clock `America/New_York` | Migrated |
| Per-site daypart on estate Live pins | Verify `EstateWorld` / portfolio clocks use entity TZ |
| Simultaneous “Live 19:48” across cities | Fail if one clock shared |

### Scope shell vs body

| Risk | Where to assert |
|------|-----------------|
| Group header + single-site metrics | Locations engine, CC cockpits, Live estate vs venue |
| Single-site shell + portfolio table | Hotel GM CC property table when scope is one property |

### Duplicate context text

| Risk | Audit |
|------|-------|
| Persona + city repeated in shell and page body | `GlobalOperatingHeader`, CC heroes, Live chrome |
| Same city line twice in header strip | Scope selector + breadcrumb + page kicker |

### Gateway

| Check | Status |
|-------|--------|
| Counts from `enterWorlds` ← `estateCount` | Wired |
| `?vertical=restaurant\|hotel` preselect | Wired (`selected` state) |
| Visual emphasis (border / elevate / CTA) | **PASS 3** — confirm `GatewayWorldCard` `selected` styles are strong enough without layout fork |
| Auto-enter `go=1` | Wired |

### Cross-route hero identity

Assert for `loc_berlin_mitte` / `loc_canal_house`:

- Display never says Berlin / Canal House / Amsterdam on product `/app/*`
- Decision copy may keep fixture IDs (`dec_peak_berlin`) but human labels = New York
- No Mercer + Canal House room detail mix

### Search

Global search must index all registry entities; picking a result must write vertical + location scope + prefs consistently (no stale prior city).

---

## 4. Surfaces that must read registry

| Surface | Expected source |
|---------|-----------------|
| Gateway cards | `ENTER_WORLDS` ← `estateCount` |
| Location switcher / scope strip | `organizations` ← registry |
| Locations overview / bubble / hotel portfolio | portfolio economics ← org locations |
| Hotel Live estate strip | `hotelLive` estate ← org |
| Restaurant Live estate pins | Must reconcile with registry (or map registry → pin coords) |
| Settings / connections coverage | registry length |
| Control Center group totals | `NORTHSTAR_*` / org length = 10 |

**Ban:** route-local city arrays that diverge from registry.

---

## 5. Money model (group)

```
localAmount + localCurrency
reportingAmount + reportingCurrency (= USD)
fxRate = DEMO_FX_TO_USD[local]
```

UI: single-site never shows naked reporting currency without saying so. Group always shows `GROUP REPORTING · USD`.

---

## 6. Daypart expectation (demo clock)

With deterministic “now” anchored per site TZ (example dinner in NYC):

| City | Expected local state (illustrative) |
|------|-------------------------------------|
| New York | Dinner / peak |
| London | Late / wind-down |
| Dubai | Late night / closed |
| Tokyo | Breakfast / opening |
| Sydney | Lunch |

Do not stamp one wall-clock string on all pins.

---

## 7. Test matrix (estate)

| Test | Assert |
|------|--------|
| `location-completeness` | 10 + 10 |
| `portfolio-totals-reconcile` | counts = registry; no 8 |
| `connection-estate-coverage` | full vertical coverage |
| Gateway / enterWorlds | `estateCount` matches card copy |
| Currency format helpers | NYC → `$` / USD; London → £; group → USD label |
| Display names | No Berlin / Amsterdam / Canal House in product display helpers |
| Search index | 20 entities resolvable |

---

## 8. Implementation order (this doc owns PASS 2–4)

1. **PASS 2** — Kill `of 8` / `locationCount: 8` / € on hero local / TZ daypart mismatches  
2. **PASS 3** — Gateway selected emphasis if weak  
3. **PASS 4** — Duplicate shell identity strings  
4. Then Live alignment (see companion audit)

### Progress (2026-10-20) — CLOSED

| Item | Status |
|------|--------|
| Docs PASS 1 | Done |
| Counts `of 8` → registry | Done |
| Live estate pins = 10 registry | Done |
| Hero money `$` via `formatDecisionMoney` | Done (marketing traces frozen €) |
| Gateway selected elevate + CTA | Done |
| Gateway counts from `estateCount` | Done |
| Per-site daypart clocks on estate map | Done — `estateDaypart.ts` per pin |
| Duplicate shell identity | Done — GOH owns scope/role; body keeps LIVE/clock only |
| Search all 20 sites | Done — `estateLocationsAsCatalog` default + `assertEstateSearchCoverage` |

**Definition of done (estate):** met.

---

## 9. Visual freeze reminder

Do **not** change gateway art direction, CC layout, card radii, colors, typography, or nav — only fix clipping, wrong text, invalid context, and responsive breakage.
