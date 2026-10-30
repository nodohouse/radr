# RADR — Navigation QA

**Date:** 2026-10-19  
**Scope:** One-product CTA + context matrix (Daylight surfaces)  
**Rule:** Design frozen — verify destination + context, not pixels.

Helpers SSOT: `lib/product/radrContext/navigateWithContext.ts`  
Aliases SSOT: `lib/radr/decision/aliases.ts`

---

## Legend

| Column | Meaning |
|--------|---------|
| Context | Expected vertical · scope · persona after click (when applicable) |
| Helper | Uses shared href helper / alias resolver |
| Status | PASS expected after one-product pass |

---

## Restaurant · Berlin Mitte · GM · Live

| Source | Control | Destination | Expected context | Helper | Status |
|--------|---------|-------------|------------------|--------|--------|
| GM Control Center | View all → (`gm-cc-needs-you-view-all`) | `/app/decisions?band=needs_you&stay=1` | Rest · Berlin · GM · Today · judgment | `decisionsNeedsYouHref` | PASS |
| GM Control Center | Review Decision | Peek → `/app/decisions/dec_peak_berlin` | Rest · Berlin · GM | Record id | PASS |
| GM Control Center | Verified Value | `/app/value?stay=1` | Rest · Berlin · MTD (route map) | `valueHref` | PASS |
| GM Control Center | Tonight revenue | `/app/intelligence?lens=sell&stay=1` | Rest · Berlin · GM | `intelligenceHref` | PASS |
| Decisions | View in Control Center | `/app?stay=1` | Rest · Berlin · GM | `controlCenterHref` | PASS |
| Decisions | Open detail / overflow | `/app/decisions/{id}` | Same Decision Record | alias resolve | PASS |
| Live inspector | Review Decision | `/app/decisions/{id}` | Rest · Berlin | Record | PASS |
| Operations (Service) | Open Decision | `/app/decisions?decision=dec_labor_berlin&stay=1` | Rest · Berlin | Record labor | PASS |
| Operations | Open Value | `/app/value?stay=1` | Rest · Berlin · MTD | stay | PASS |
| Locations | View in CC / Live / Decisions / Value / Memory | `/app?…` / live / decisions / value / memory | Rest · selected location | raw + scope | PASS* |
| Connections | Data Health → | `/app/data-health` | Rest · current | raw | PASS* |
| Memory | Source Decision / Data Health | decisions / data-health | Rest · current | raw | PASS* |
| Value | Open decision / View all | decisions | Rest · current | raw | PASS* |
| Sidebar | All primary nav | canonical routes | Rest · Berlin · GM preserved | AppShell | PASS |
| Reports | Nav → Reports | `/app/reports` | Shell + context; **body VISUAL FOLLOW-UP** | AppShell | PASS (shell) |

\* Locations/Memory/Value/Connections keep Product store; prefer adding `stay=1` when rewriting.

---

## Hotel · Canal House · GM · Today

| Source | Control | Destination | Expected context | Helper | Status |
|--------|---------|-------------|------------------|--------|--------|
| Hotel CC | Ready KPI | `/app/service` | Hotel · Canal · GM · Today | `operationsHref` | PASS |
| Hotel CC | Occ / ADR KPI | `/app/locations` | Hotel · Canal | `locationsHref` | PASS |
| Hotel CC | View all properties | `/app/locations` | Hotel | `locationsHref` | PASS |
| Hotel CC | Review decision | `/app/decisions?decision=…&stay=1` | Hotel · Canal · GM | `buildAppHref` | PASS |
| Hotel CC | Verified Value | `/app/value?stay=1` | Hotel · Canal · MTD | `valueHref` | PASS |
| Decisions | Flagship D-H-9201 | same id + €1,840 · 81% · 14:40 | Hotel · Canal | Record + fixture | PASS |
| Decisions | OTA row | `dec_ota_canal` (not `dec_hotel_ota_close_canal`) | Hotel · Canal | alias / fixture | PASS |
| House Readiness | Open Decision | `/app/decisions?decision=dec_hotel_readiness_canal` | Hotel · Canal | Record | PASS |
| Hotel Live | Decision / Operations | decisions / service | Hotel · Canal | raw + stay on intel | PASS |
| Deep link | `/app/decisions/dec_ota_canal` | Record D-2201 | Hotel · Canal | alias | PASS |
| Deep link | `/app/decisions/dec_hotel_ota_close_canal` | resolves → `dec_ota_canal` | Hotel · Canal | alias | PASS |

---

## Cross-cutting

| Flow | Expected | Status |
|------|----------|--------|
| GM Berlin Live → Decisions | AppShell · not CFO/All/MTD · D-1911 selected on needs_you | PASS |
| Persona switch (RoleViewSwitcher) | Explicit scope/period from persona card | PASS |
| `setRoleView` alone | Does **not** reset scope/period | PASS |
| `/app/control-center` | Redirect `/app?stay=1` CFO · All · MTD | PASS |
| Refresh `/app/decisions/dec_peak_berlin` | Restaurant · Berlin (not Canal / CFO) | PASS |
| Back from Decisions → CC | Prior route + store context | PASS (Playwright) |
| Vertical switch Restaurants ↔ Hotels | Scope registry swaps; invalid scope remapped | PASS (existing) |

---

## Decision ID aliases

| Alias | Canonical | Display |
|-------|-----------|---------|
| `dec_hotel_channel_canal` | `dec_ota_canal` | D-2201 |
| `dec_hotel_ota_close_canal` | `dec_ota_canal` | D-2201 |
| `dec_hotel_ota` | `dec_ota_canal` | D-2201 |
| `dec_labor_schedule` | `dec_labor_berlin` | D-1920 |
| `dec_service_capacity` | `dec_peak_berlin` | D-1911 |

`HOTEL_DECISION_IDS.channel === DECISION_IDS.ota` (intentional shared Record).

---

## Automated coverage

| Suite | Path |
|-------|------|
| P0 shell/context | `tests/one-product-context-p0.test.ts` |
| Decision catalog | `tests/one-product-decision-catalog.test.ts` |
| P1 deep link / Live reconcile | `tests/one-product-p1.test.ts`, `tests/berlin-live-gm-reconcile.test.ts` |
| Aliases | `tests/decision-id-aliases.test.ts` |
| Playwright context | `tests/e2e/one-product-context.spec.ts` |

---

## Manual spot-check (investor demo)

1. Enter Restaurants → Berlin Mitte GM Live CC  
2. View all Decisions → confirm AppShell + Berlin + GM + Peak  
3. Open D-1911 detail → refresh → still Berlin  
4. Back → CC  
5. Switch Hotels → Canal House → Decisions → D-H-9201  
6. Open `/app/control-center` → lands `/app` CFO group  
7. Reports → same shell; note visual follow-up body  
