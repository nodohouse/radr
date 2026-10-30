# RADR — Legacy UI Inventory

**Status:** Companion to `RADR_ONE_PRODUCT_AUDIT.md` · inventory only · **no deletions yet**  
**Date:** 2026-10-19  
**Rule:** Removing legacy UI ≠ deleting functionality. Map before delete.

---

## Shell / layout components

| Component | Path | Verdict | Notes |
|-----------|------|---------|-------|
| ProductShell | `components/product/ProductShell.tsx` | **KEEP** | Canonical app chrome host |
| AppSidebar | `components/product/shell/AppSidebar.tsx` | **KEEP** | Approved hover-expand nav |
| GlobalOperatingHeader | (under product shell) | **KEEP** | Top context controls |
| RadrDecisions private nav | `components/product/decisions/workspace/RadrDecisions.tsx` | **MIGRATE** | Parallel nav with Financials / People & Labor / F&B / Guests & Channels / RADR Intelligence — suppress via ProductShell today |
| CfoControlCenter private nav | `lib/product/cfoControlCenter/*Data.ts` + CFO page | **MIGRATE** | Same old nav labels; `/app/control-center` bare |
| LabShell | `components/product/lab/LabShell.tsx` | **KEEP** | Lab only · not primary nav |
| ProductPageShell | `components/product/ui/ProductPageShell.tsx` | **SHARED LOGIC ONLY** | Page frame helper · keep if used by Daylight pages |
| ProductNav | `components/product/ProductNav.tsx` | **AUDIT** | Likely leftover · confirm imports |
| AppNav | `components/AppNav.tsx` | **AUDIT** | Likely marketing/auth · confirm |
| PublicShell / SiteNav | `components/marketing/*` | **KEEP** | Marketing freeze · out of scope |
| DevelopersShell | `components/developers/DevelopersShell.tsx` | **KEEP** | Separate surface |
| LightAuthShell / AuthPageShell | `components/*` | **KEEP** | Auth |
| *Page-local Shells* (LiveSpatial, HotelLive, Service, HouseReadiness, Boh, Guest, Intel, Value, Memory, Locations, Connections, DataHealth, Dashboards, Settings, RadrLive) | `components/product/**/` | **KEEP** | Body composition shells — **must not** remount AppSidebar or mutate global context on mount |

---

## Old-generation navigation labels (still in fixtures)

Reachable when Decisions / CFO bare shells mount:

| Label | href | Destination today | Action |
|-------|------|-------------------|--------|
| Financials | `/app/finance` | redirect / finance page | Map into Value / Dashboards · do not expose in primary nav |
| People & Labor | `/app/labor` | redirect | Map into Intelligence / Decisions labor |
| Food & Beverage | `/app/buy` | redirect → buy lens | Intelligence BUY |
| Guests & Channels | `/app/guests` | Guests (OK) | Keep Guests in canonical nav only |
| RADR Intelligence | `/app/intelligence` | Intelligence (OK) | Label → **Intelligence** only |

Sources:

- `lib/product/decisionsWorkspace/restaurantData.ts`
- `lib/product/cfoControlCenter/restaurantData.ts`
- `lib/product/cfoControlCenter/hotelData.ts`

**Verdict:** Remove from any mounted chrome. Keep data/links as adapters if needed.

---

## Control Center bodies

| Component | Verdict | Notes |
|-----------|---------|-------|
| VisionGmCockpit | **KEEP** | Approved Restaurant GM Daylight |
| Hotel GM Control Center | **KEEP** | Approved Hotel surface |
| CfoControlCenter | **KEEP** | CFO lens body · must use AppShell not bare parallel nav |
| CcCockpit | **UNUSED / SHARED LOGIC ONLY** | Graphite instrument; tests reference; not primary `/app` for GM |
| HotelCockpit | **SHARED LOGIC ONLY** | Parity baseline · confirm if still mounted |

---

## Decisions

| Artifact | Verdict | Notes |
|----------|---------|-------|
| RadrDecisions workspace UI | **MIGRATE** | Keep ledger/inspector UX if approved; strip private shell; bind store |
| DecisionRecordView `/app/decisions/[id]` | **KEEP** | Canonical detail · unify IDs with workspace |
| `decisionsWorkspace/restaurantData.ts` hard-coded CFO/All/MTD | **MIGRATE** | Labels become derived from RadrContext |
| `DECISION_IDS` / Decision Record store | **KEEP** | Become SSOT |
| Workspace decision IDs (`dec_labor_schedule`, …) | **MIGRATE or MERGE** | Map or retire duplicates |

---

## Live / Operations

| Component | Verdict | Notes |
|-----------|---------|-------|
| LiveSpatialShell | **KEEP** | Stop estate→CFO/all mutation |
| HotelLiveShell | **KEEP** | Hotel Live |
| RadrLiveShell | **AUDIT** | Older Live · confirm if still routed |
| ServiceShell | **KEEP** | Restaurant Operations |
| HouseReadinessShell | **KEEP** | Hotel Ops · stop forcing global Today |
| BohShell | **KEEP** | BOH |

---

## Other product bodies

| Area | Verdict |
|------|---------|
| Guests / Intelligence / Value / Memory / Locations / Connections / Data Health / Dashboards / Settings engines | **KEEP** |
| Reports (`VisionReports`) | **KEEP body · VISUAL FOLLOW-UP** · `/app/reports` marked `data-visual="follow-up"` · AppShell via layout |
| Lab surfaces | **KEEP** out of primary nav |

---

## Duplicate / conflicting data sources

| Domain | Sources | Verdict |
|--------|---------|---------|
| Berlin GM KPIs | `restaurantGmControlCenterCanon` vs Live SERIES vs Intelligence fixtures | **MIGRATE → one registry** |
| Canal House KPIs | hotel dataset vs hotel CC vs Decisions hotelData | **MIGRATE → one registry** |
| Verified Value | Control Center aggregate vs Value page vs Decision outcome | **MIGRATE → one ledger** |
| D-1911 / peak | Decision Record vs CC card vs (missing workspace) | **ONE store** |
| D-H-9201 | hotel Decisions / hotel CC | **ONE store** |

---

## Redirect-only legacy routes (do not render old UI)

buy · labor · sell · recover · signals · findings · controls · data · integrations · performance · operations · team · finance (partial)

**Verdict:** Keep redirects · never mount old nav chrome.

---

## Priority cleanup order (after P0 shell/context)

1. Decisions private nav + CFO fixture labels  
2. CFO Control Center private nav (if still bare)  
3. Mount-time store writers  
4. Dual Decision catalogs  
5. Metric registry reconciliation  
6. Unused shells (CcCockpit / RadrLive) once import graph proves dead  

---

## Do not delete until mapped

Any page that still has unique workflows (approve flow, futures compare, evidence tabs) must land on:

- current route sub-view, or  
- drawer/tab, or  
- preserved component under AppShell  

Document mapping in PR before file deletion.
