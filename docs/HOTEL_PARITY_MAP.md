# Hotel Parity Map — Full Vertical Transfer

**Date:** 2026-10-14  
**Principle:** One RADR · one design system · two operating grammars.  
**Order:** PASS 1 (this map) → PASS 2 Dashboard Browser → … → PASS 10 Settings → E2E.

SSOT companions:
- `lib/radr/vertical/experienceProfile.ts`
- `docs/VERTICAL_EXPERIENCE_PROFILE.md`
- `docs/VERTICAL_PARITY_ARCHITECTURE.md`
- Restaurant dashboards: `docs/DASHBOARDS_REFERENCE_MAP.md`

---

## Core rule

| Do | Do not |
|----|--------|
| Express shared engine through hotel operations | Paste hotel words on restaurant UI |
| Reuse AppShell · tables · charts · Decision / Value / Memory | Fork HotelButton / HotelDashboardBuilder |
| Hotel-native metrics · widgets · templates · lexicon | Mix covers / kitchen / delivery into hotel core |
| Parameterize via vertical config | Scatter hundreds of `if (hotel)` branches |

Shared loop: **CONNECT → OBSERVE → UNDERSTAND → FIND VALUE → EXPLAIN → DECIDE → ACT → VERIFY → REMEMBER**

Hotel grammar: **DEMAND → INVENTORY → RATE → CHANNEL → ARRIVAL → ROOM READINESS → SERVICE → LABOR → GUEST → COST → VALUE**

---

## Parity matrix

| SURFACE | RESTAURANT STATUS | HOTEL STATUS | SHARED UI | HOTEL-NATIVE LOGIC | MISSING | NEXT ACTION |
|---------|-------------------|--------------|-----------|--------------------|---------|-------------|
| Shell / AppShell | APPROVED | SHARED | AppShell · nav · top context | Vertical labels (Properties · House) | Nav: BOH→Housekeeping wording polish | KEEP + HOTEL ADAPTER |
| Control Center | APPROVED (Daylight) | APPROVED (PASS 4) | CfoControlCenter · HotelCockpit | Contribution · Northstar properties · readiness / OTA | GM cockpit polish later | KEEP |
| Dashboards Browser | APPROVED | PARTIAL (5 templates · restaurant previews) | DashboardsShell · Library · CSS | Hotel template set · roles · previews | CFO · Front Office · Morning Brief · Portfolio · hotel mini-previews · hotel role filter | **PASS 2 — THIS** |
| Dashboard Builder | APPROVED | APPROVED (PASS 3) | DashboardBuilder · catalog | Hotel categories · Ask RADR · persona auto-arrange | Deeper maintenance / F&B widgets later | KEEP |
| Live Estate | APPROVED | APPROVED (PASS 5) | Live shell · time modes | Property estate · exposure · Canal House hero | — | KEEP |
| Live Property | APPROVED (floor) | APPROVED (PASS 5) | Live instruments | Floor/room readiness · arrivals · horizons | — | KEEP |
| Operations | APPROVED (service) | PARTIAL | Ops shell | Arrivals · readiness · HK · FO | Room readiness command · arrival pressure | PASS 6 |
| House / BOH | APPROVED (kitchen) | PARTIAL (House label) | Exception rails | Housekeeping · maintenance | Do not call “BOH” | PASS 6 — RECOMPOSE |
| Guests | APPROVED | PARTIAL | Guest architecture | Stay · VIP · upgrade · recovery | Hotel profile fields | PASS 6–7 |
| Intelligence | APPROVED | PARTIAL | Findings · Futures | RevPAR · readiness · channel findings | Hotel domain nav · examples | PASS 7 |
| Decisions | APPROVED | PARTIAL | Decision Ledger | Rate · HK reassign · readiness · channel | D-9201 class polish | PASS 7 |
| Value | APPROVED | PARTIAL | Value proof | Room / OTA / HK / upgrade classes | Traceable hotel proof paths | PASS 8 |
| Memory | APPROVED | PARTIAL | Operating Memory | Arrival / HK / OTA DNA | Hotel playbooks | PASS 8 |
| Locations → Properties | APPROVED | PARTIAL (label) | Locations architecture | Property health · Occ/ADR/RevPAR | Performance × Exposure hotel axes | PASS 9 |
| Connections | APPROVED | PARTIAL | Connection table | PMS · RMS · channel · HK feeds | Hotel catalog completeness | PASS 9 |
| Data Health | APPROVED | PARTIAL | Health architecture | PMS stale → Decision confidence | Hotel evidence examples | PASS 9 |
| Settings / Governance | APPROVED (engine) | PARTIAL | Settings engine | Property · floors · HK · rate policies | Hotel sections in settings | PASS 10 |
| Autonomy / Operators | SKELETON | SKELETON | Autonomy ladder | HK / Revenue / FO operators | Hotel digital workers | PASS 10 |

**Disposition legend:** KEEP · RECOMPOSE · SHARED COMPONENT · HOTEL ADAPTER · REMOVE · MISSING

---

## Route parity (canonical — no `/hotel-app`)

| Route | Restaurant reference | Hotel-native equivalent | Disposition |
|-------|----------------------|-------------------------|-------------|
| `/app` · Control Center | Restaurant CC | Hotel CC (portfolio / property) | RECOMPOSE PASS 4 |
| `/app/dashboards` | Restaurant library | Hotel library (same engine) | **HOTEL ADAPTER PASS 2** |
| `/app/dashboards/[id]` | Builder / view | Same builder · hotel widgets | PASS 3 |
| `/app/live` | Estate / floor | Estate / property floors | PASS 5 |
| `/app/operations` · `/app/service` | Floor / service | Hotel ops · readiness · arrivals | PASS 6 |
| `/app/house` | BOH / kitchen | Housekeeping / property ops | RECOMPOSE PASS 6 |
| `/app/guests` | Guest intelligence | Hotel guest / stay | PASS 6–7 |
| `/app/intelligence` | BUY/LABOR/SELL/RECOVER lenses | Hotel domains (revenue · rooms · HK…) | PASS 7 |
| `/app/decisions` | Decision Ledger | Same ledger · hotel classes | KEEP + ADAPTER |
| `/app/value` | Verified Value | Hotel value classes | PASS 8 |
| `/app/memory` | Operating Memory | Hotel DNA | PASS 8 |
| `/app/locations` | Locations | Properties | HOTEL ADAPTER PASS 9 |
| `/app/connections` | Connectors | Hotel catalog | PASS 9 |
| `/app/data-health` | Evidence health | Hotel feeds | PASS 9 |
| `/app/settings` | Governance | Hotel config | PASS 10 |

Vertical from canonical context (`demoOrgSession` / prefs) — not route fork.

---

## Vertical adapter (target)

```
VerticalConfig {
  id, terminology, personas, templates,
  metricRegistry, widgetRegistry,
  intelligenceDomains, decisionClasses, valueClasses,
  liveConfig, settingsConfig, forbiddenTerms
}
RestaurantConfig | HotelConfig
```

Today: `experienceProfile.ts` + scattered filters. Evolve toward one config consumed by shared UI. Do not invent parallel Finding/Decision/Value models.

---

## Dashboard Browser — PASS 2 scope (ONLY)

Reuse exact approved Restaurant Browser:

Header · Pinned · My dashboards · Templates · Recently used · Search · Create · same cards · same CSS.

### Hotel templates (required)

| ID | Name | Persona | Preview | Status |
|----|------|---------|---------|--------|
| `dash_hotel_gm` | Hotel General Manager | GM | hotel-gm | EXPAND META |
| `dash_hotel_cfo` | Hotel CFO | CFO | hotel-cfo | **ADD** |
| `dash_hotel_revenue` | Revenue Manager | Revenue | hotel-revenue | KEEP + hotel preview |
| `dash_hotel_ops` | Hotel Operations | Ops | hotel-ops | KEEP + hotel preview |
| `dash_hotel_front_office` | Front Office | Front Office | hotel-fo | **ADD** |
| `dash_hotel_hk` | Housekeeping | Housekeeping | hotel-hk | KEEP + hotel preview |
| `dash_hotel_morning_brief` | Morning Brief | GM / Ops | hotel-brief | **ADD** |
| `dash_hotel_portfolio` | Portfolio Performance | Owner / COO | hotel-portfolio | **ADD** (replace/supersede `dash_hotel_coo` as portfolio) |

`dash_hotel_coo` → migrate content into Portfolio Performance; keep ID alias or remap.

### Hotel category pills (library)

Leadership · Revenue · Operations · Rooms · Finance · Guests  
(Hide restaurant Kitchen / Service when `industry=hotel`.)

### Hotel role filter

GM · CFO · Revenue · Operations · Front Office · Housekeeping · Owner

### Mini previews

Native HTML/SVG only — **no restaurant preview art**, no screenshots.

| Template | Preview content |
|----------|-----------------|
| GM | Occ · ADR · RevPAR · readiness |
| CFO | Revenue vs plan · contribution · Verified Value |
| Revenue | Pace / pickup chart |
| Operations | Property readiness strip |
| Front Office | Arrival timeline |
| Housekeeping | Room readiness grid |
| Morning Brief | Overnight → today priorities |
| Portfolio | Property health bubbles |

### Screenshot gate

`tmp/hotel-dashboards-pass2-1512x982.png` — approve before PASS 3.

---

## Hotel metric registry (canonical — later passes)

| id | label | formula note |
|----|-------|--------------|
| occupancy | Occupancy | rooms sold / rooms available |
| adr | ADR | room revenue / rooms sold |
| revpar | RevPAR | room revenue / rooms available |
| room_revenue | Room revenue | — |
| contribution | Contribution | Prefer over GOP unless P&L supports GOP |
| room_readiness | Room readiness | ready / sellable |
| pickup | Pickup | booking additions |
| ota_share | OTA share | channel mix |
| verified_value | Verified Value | evidence chain |

**OOO/OOS:** one company rule for available-room denominator — document in metric registry (PASS 3+). Do not invent per-chart methods.

---

## Hotel Decision / Value examples (later)

- **D-9201** Arrival readiness collision — HK reassignment · readiness 94%→99% · €1,240 protected  
- Value: expected → observed → verified with PMS + HK + arrival evidence  
- Memory: Friday arrivals early · OTA mix ceiling · HK after group departures  

---

## Demo canon (deterministic)

| Field | Value |
|-------|-------|
| Hero property | Amsterdam Centrum (`loc_canal_house` or successor) |
| Demo time | 14:18 LIVE |
| Rooms | 184 |
| Occupancy | 87% |
| ADR | €214 |
| RevPAR | €186 |
| Arrivals / Departures | 46 / 38 |
| Room readiness | 91% |
| Rooms at risk | 8 |
| VIP | 4 |
| OOO | 3 |
| Exposure | €1,240 |
| Active Decisions | 2 |

Refresh must preserve values. No `Math.random()`.

---

## Terminology QA

Hotel UI must not leak: covers · table turns · kitchen · menu · delivery · BOH (as primary) · restaurant prep.  
Restaurant UI must not leak: ADR · RevPAR · housekeeping · check-in (unless F&B hotel module).

---

## Implementation passes

1. ~~PASS 1 — this map~~  
2. ~~PASS 2 — Hotel Dashboard Browser~~ · `tmp/hotel-dashboards-pass2-1512x982.png` · approved  
3. ~~PASS 3 — Builder hotel registry · Ask RADR · auto-layout~~ · `tmp/hotel-dashboards-pass3-*-1512x982.png`  

4. ~~PASS 4 — Hotel Control Center~~ · `tmp/hotel-cc-pass4-*-1512x982.png`  
5. ~~PASS 5 — Live estate / property~~ · `tmp/hotel-live-pass5-*-1512x982.png`  

6. PASS 6 — Operations · Housekeeping · Front Office  
7. PASS 7 — Intelligence / Decisions  
8. PASS 8 — Value / Memory  
9. PASS 9 — Properties / Connections / Data Health  
10. PASS 10 — Settings · operators · autonomy  
11. Final E2E + screenshot parity + data reconciliation  

**Do not regress Restaurant.** Shared primitive changes require restaurant visual smoke.

---

## PASS 2 file touch list

| File | Action |
|------|--------|
| `docs/HOTEL_PARITY_MAP.md` | CREATE (this) |
| `lib/product/dashboards.ts` | ADD hotel templates · hotel default pins |
| `lib/radr/product/dashboardsProofEngine.ts` | Hotel META · categories · preview kinds · role helpers |
| `components/product/dashboards/engine/DashboardMiniPreview.tsx` | Hotel SVG previews |
| `components/product/dashboards/engine/DashboardsLibrary.tsx` | Hotel roles / categories via `isHotel` |
| `components/product/dashboards/engine/DashboardsShell.tsx` | Expand HOTEL_IDS · pass `isHotel` |
| `lib/product/dashboardSharing.ts` | Default shares for new templates |
| `tmp/hotel-dashboards-pass2-1512x982.png` | Screenshot gate |
