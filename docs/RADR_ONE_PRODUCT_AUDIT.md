# RADR — One Product Consistency Audit

**Status:** PASS 1 + P0 + P1 complete (2026-10-19)  
**Design freeze:** Approved Daylight surfaces are FROZEN. This pass fixes system coherence only.

### Implementation log

| ID | Fix | Status |
|----|-----|--------|
| P0-1 | Decisions uses ProductShell; private nav removed (`data-embedded`); `band=needs_you` | Done |
| P0-2 | Live estate no longer writes CFO / All locations | Done |
| P0-3 | Locations / House Readiness no longer force global period | Done |
| P0-4 | Canal House empty-copy gated; CC insight → `/app` | Done |
| — | `RoutePeriodSync` + `resolvePeriodForRoute` + `useRadrNavigation` | Done |
| — | Hotel dashboard brief no longer overwrites global persona/scope | Done |
| P0-5 | Dual Decision catalogs (Record vs workspace) | Done |
| P1-1 | House Readiness global Today write | Done (with P0-3) |
| P1-2 | Hotel dashboard brief global overwrite | Done (with P0) |
| P1-3 | `setRoleView` no longer auto-resets scope/period | Done |
| P1-4 | Deep-link Decision → `resolveDecisionContext` + `DecisionContextSync` | Done |
| P1-5 | `/app/control-center` → redirect `/app?stay=1` CFO lens | Done |
| P1-6 | Berlin Live SERIES ↔ GM CC canon (€18,420 / 124 / 26.1% / 92%) | Done |
| P1-8 | Key CTAs use `decisionsNeedsYouHref` / stay=1 helpers | Done (partial — primary CTAs) |
| P1-10 | Playwright `tests/e2e/one-product-context.spec.ts` | Done |

| P1-7 | OTA / channel ID aliases → `lib/radr/decision/aliases.ts` | Done |
| P1-9 | Reports body VISUAL FOLLOW-UP · AppShell via layout · `data-visual="follow-up"` | Done (no redesign) |
| — | CTA matrix `docs/RADR_NAVIGATION_QA.md` | Done |

Tests: `tests/one-product-*.test.ts`, `tests/berlin-live-gm-reconcile.test.ts`, `tests/decision-id-aliases.test.ts`, `tests/e2e/one-product-context.spec.ts`  
QA: `docs/RADR_NAVIGATION_QA.md`

---

## Executive summary

The approved UI is not the primary failure mode. Coherence fails under:

1. **Parallel Decisions shell** — `/app/decisions` suppresses canonical `AppSidebar` + `GlobalOperatingHeader` and mounts `RadrDecisions` chrome with **hard-coded** restaurant context: `Restaurants · All locations` / `CFO` / `MTD` (`lib/product/decisionsWorkspace/restaurantData.ts`).
2. **Global store mutations on route mount** — Locations forces MTD; Live estate forces CFO + all; House Readiness forces Today; hotel dashboards force Canal House + `hotel_gm`.
3. **Two Decision systems** — Decision Record store (`DECISION_IDS` / `dec_peak_berlin`) vs Decisions workspace ledger (`dec_labor_schedule`, etc.) with no shared ID space.
4. **CTA hrefs without context helper** — many `Link href="/app/…"` strings; context survives only if Product store was not overwritten elsewhere.
5. **Vertical isolation mostly in hydrate** — Canal House rejected on restaurant hydrate, but Decisions empty-state copy still says “Canal House ledger” on restaurant.

**P0 user story (confirmed in code):**

Berlin Mitte · GM · Live · Control Center → View all Decisions  
→ renders Decisions workspace labels **All locations / CFO / MTD** and **own nav**, not AppShell.

---

## Architecture facts (traced)

### App chrome

| Layer | Path | Role |
|-------|------|------|
| Root layout | `app/app/layout.tsx` | Wraps all `/app/**` in `ProductShell` |
| ProductShell | `components/product/ProductShell.tsx` | Owns AppSidebar + GlobalOperatingHeader when not suppressed |
| Lab layout | `app/app/lab/layout.tsx` | Nested `LabShell` |
| Legacy | `app/(app)/layout.tsx` | Pass-through retired |

**ProductShell suppresses canonical chrome when:**

- `/app/enter`
- `/app/control-center` (CFO-only bare page)
- pathname **exactly** `/app/decisions` (detail `/app/decisions/[id]` keeps AppShell)
- `/app/lab/*` except `/app/lab/live-v2`

### Context stores (today — fragmented)

| Store | Persistence | Fields |
|-------|-------------|--------|
| `lib/product/store.tsx` | `radr.scope.v1` session · `radr.prefs.v1` local | `roleView`, `locationScope`, `period`, lens, serviceTime |
| `lib/radr/demo/demoOrgSession.ts` | `radr.demoOrg.v1` session | `vertical`, `orgId` |
| Decisions workspace model | in-memory fixture | **hard-coded** context labels (not store) |
| Dashboard localStorage | dashboards key | pinned templates |

**No single `RadrContext` object.** No `routeRegistry`. No `navigateWithContext`.

### `?stay=1`

`store.tsx` hydrate: pins home/scope to org primary **only when no existing session**. Does not wipe session. `/app` DefaultLandingGate skips dashboard redirect when `stay=1`. Enter navigates to `/app?stay=1`.

---

## Route matrix (canonical product)

Legend — **New design?** = uses Daylight / approved body where known · **Legacy shell?** = parallel nav or suppressed AppShell · **Context bug?** = shell/body disagree or hard-coded wrong context

| Route | App shell | Vertical | Persona (expected) | Scope (expected) | Period (expected) | New design? | Legacy shell? | Context bug? | Data mismatch risk? | CTA bug risk? | Duplicate impl? | Action |
|-------|-----------|----------|--------------------|------------------|-------------------|-------------|---------------|--------------|---------------------|---------------|-----------------|--------|
| `/app` | AppShell | store | GM / hotel_gm / CFO lens | Berlin / Canal / all | Live/Today (lens) | YES (VisionGm / HotelGm / CFO) | NO | LOW if store clean | MED (catalog vs Live series) | MED | YES (CcCockpit legacy unused) | KEEP body · fix inbound context |
| `/app/enter` | Bare | chooser | — | — | — | YES | N/A | NO | NO | NO | NO | KEEP |
| `/app/decisions` | **Bare + RadrDecisions nav** | demo org | **Hard-coded CFO (rest)** | **Hard-coded All locations** | **Hard-coded MTD** | Partial (workspace UI) | **YES** | **P0 YES** | YES (workspace ≠ Record store) | YES | YES (Record vs workspace) | **UNIFY shell + bind store** |
| `/app/decisions/[id]` | AppShell | store | store | store / derive from Decision | store | YES (DecisionRecordView) | NO | MED (deep link) | YES if wrong store | MED | YES | Resolve context from Decision registry |
| `/app/live` | AppShell | store | **estate → forces CFO** | **estate → forces all** | Live | YES (HotelLive / LiveSpatial) | NO | **P0 on estate** | MED | MED | YES (HotelLive vs LiveSpatial) | Stop mount side-effects |
| `/app/service` | AppShell | store | store | store | **Hotel forces Today** | YES | NO | MED (period write) | LOW if canon | MED | YES (Service vs HouseReadiness) | Route-local period map · no global write |
| `/app/house` | AppShell | restaurant | store | store | today-ish | YES (BOH) | NO | LOW | MED | MED | NO | KEEP |
| `/app/guests` | AppShell | store | store | store | — | YES | NO | LOW | MED | MED | NO | KEEP |
| `/app/intelligence` | AppShell | store | store | store | store | YES | NO | LOW | MED | MED | NO | Preserve finding params |
| `/app/value` | AppShell | store | store | store | **inherits** (often MTD after Locations) | YES | NO | MED (inherited MTD) | MED | MED | NO | Route period map · no Locations bleed |
| `/app/memory` | AppShell | store | store | store | — | YES | NO | LOW | MED | MED | NO | KEEP |
| `/app/locations` | AppShell | store | store | store | **forces MTD** | YES | NO | **P1 YES** (global period) | MED (group vs single) | MED | NO | Stop forcing global period |
| `/app/locations/[id]` | AppShell | store | store | **sets scope to id** | inherits | YES | NO | LOW | LOW | LOW | NO | OK · intentional |
| `/app/connections` | AppShell | store | store | store | — | YES | NO | LOW | LOW | MED | NO | KEEP |
| `/app/data-health` | AppShell | store | store | store | — | YES | NO | LOW | LOW | MED | NO | Filter from Decision |
| `/app/dashboards` | AppShell | store | store | store | store | YES | NO | LOW | LOW | LOW | NO | KEEP |
| `/app/dashboards/[id]` | AppShell | store | **hotel brief → hotel_gm** | **→ loc_canal_house** | store | YES | NO | MED (mount write) | LOW if canon | LOW | NO | Dashboard defaults vs global |
| `/app/settings` | AppShell | store | store (reset→cfo) | store | store | YES | NO | LOW | NO | NO | NO | Restore context on leave |
| `/app/reports` | AppShell | store | store | store | store | **OLD body risk** | NO | LOW | HIGH | MED | YES | Shell OK · visual follow-up |
| `/app/control-center` | Bare CFO | — | CFO | — | — | CFO instrument | Parallel | MED | — | — | YES vs `/app` CFO | Redirect or adapt |
| `/app/lab/*` | LabShell | lab | — | — | — | Lab | YES | N/A | — | — | YES | Keep out of primary nav |
| Redirects (buy/labor/sell/recover/signals/findings/controls/data/integrations/performance/operations/team) | → canonical | — | — | — | — | — | — | — | — | — | — | Keep redirects · no old UI |

### Expected context (golden paths)

| Path | Expected vertical | Expected persona | Expected scope | Expected period |
|------|-------------------|------------------|----------------|-----------------|
| Rest GM Live CC | restaurant | gm | loc_berlin_mitte | Live/Today |
| Rest GM → Decisions | restaurant | gm | loc_berlin_mitte | Today (mapped from Live) |
| Rest GM → Value | restaurant | gm | loc_berlin_mitte | MTD (mapped) |
| Rest CFO Group | restaurant | cfo | all | MTD |
| Hotel GM Today CC | hotel | hotel_gm | loc_canal_house | Today |
| Hotel GM → Decisions | hotel | hotel_gm | loc_canal_house | Today |

---

## P0 findings (code-backed)

### P0-1 — Decisions parallel shell + hard-coded CFO / All / MTD

| Item | Fact |
|------|------|
| Shell | `ProductShell.tsx` `isRadrDecisions` → suppress AppSidebar/GOH |
| Labels | `restaurantData.ts`: `contextLabel: "Restaurants · All locations"`, `roleLabel: "CFO"`, `periodLabel: "MTD"` |
| Store usage | `RadrDecisions` reads `roleView` only for **hotel** persona lens; restaurant pills ignore store scope |
| CTA in | `VisionGmCockpit`: `/app/decisions?band=needs_you&stay=1` — band OK; context labels still fixture |

**Action:** Mount Decisions inside AppShell; bind pills to Product store + demo org; map Live→Today; delete/redirect parallel nav.

### P0-2 — Live estate mutates global persona/scope

`LiveSpatialShell.tsx`: on estate level → `setRoleView("cfo")` + `setLocationScope("all")`.

**Action:** Route-local view model only; never write global store on mount.

### P0-3 — Locations mutates global period to MTD

`LocationsShell.tsx`: `if (period !== "mtd") setPeriod("mtd")`.

**Action:** `resolvePeriodForRoute` display only; restore previous period on leave or use route-local period.

### P0-4 — Vertical entity leakage in copy

`RadrDecisions.tsx` empty state: “Canal House ledger” even when restaurant.

**Action:** Vertical-gated copy; resolver rejects invalid scopeId.

### P0-5 — Dual Decision catalogs

- Record: `dec_peak_berlin` (D-1911) etc.
- Workspace: `dec_labor_schedule` etc. — no overlap

Control Center opens Record IDs; Decisions list may not show same objects.

**Action:** One Decision registry; workspace becomes a view over Record store (or adapter).

---

## P1 findings

| ID | Issue | Where |
|----|-------|-------|
| P1-1 | House Readiness forces `period=today` globally | `HouseReadinessShell.tsx` |
| P1-2 | Hotel dashboard brief forces `hotel_gm` + Canal House | `dashboards/[id]/page.tsx` |
| P1-3 | `setRoleView` resets scope via `defaultScopeForRole` + period via lens | `store.tsx` |
| P1-4 | Deep link `/app/decisions/[id]` does not derive vertical/location from Decision | DecisionRecordView |
| P1-5 | `/app/control-center` bare CFO page vs `/app` CFO lens | Duplicate entry |
| P1-6 | Berlin metrics: GM catalog vs Live SERIES covers/labor diverge | `visionMeta` / `liveService` |
| P1-7 | `HOTEL_DECISION_IDS.channel` aliases `DECISION_IDS.ota` (`dec_ota_canal`) | Shared ID |
| P1-8 | No `navigateWithContext` — CTAs are raw hrefs | Many components |
| P1-9 | Reports / finance / forecast / ask / shift — AppShell OK, body gen mixed | Visual follow-up |
| P1-10 | Back/forward + refresh not proven against hard-coded Decisions labels | Needs Playwright |

---

## Control Center → Decisions (detailed)

```
VisionGmCockpit "View all"
  → /app/decisions?band=needs_you&stay=1

ProductShell: isRadrDecisions === true
  → NO AppSidebar, NO GlobalOperatingHeader

RadrDecisions:
  model = getDecisionsWorkspace("restaurants")
  pills show model.contextLabel / roleLabel / periodLabel
  = All locations / CFO / MTD   ← FIXTURE, not store
```

**Fix shape (do not implement in this audit):**

1. Remove chrome suppression for `/app/decisions` (or replace body-only).
2. Drive context from `useProduct` + `useDemoOrg`.
3. `resolvePeriodForRoute("/app/decisions", "live") → "today"`.
4. Honor `band=needs_you`.
5. Align ledger rows with Decision Record store (D-1911 etc.).

---

## Mount-time store writers (remove / replace)

| File | Mutation | Severity |
|------|----------|----------|
| `LocationsShell.tsx` | `setPeriod("mtd")` | P0/P1 |
| `LiveSpatialShell.tsx` | `setRoleView("cfo")`, `setLocationScope("all")` | P0 |
| `HouseReadinessShell.tsx` | `setPeriod("today")` | P1 |
| `dashboards/[id]/page.tsx` | hotel brief → `hotel_gm` + Canal | P1 |
| `locations/[id]/page.tsx` | `setLocationScope(id)` | OK (explicit) |
| `enter/page.tsx` | prefs + scope write | OK (enter) |
| `RoleViewSwitcher` / `DemoOrgSwitcher` | intentional user change | OK |

**Rule:** pages consume context; they do not silently overwrite it on mount.

---

## Canonical data (targets for later reconciliation)

### Berlin Mitte (approved)

19:48 · €18,420 · €6,870 · 124 covers · €148 · 26.1% · 112 / 93% / 12 walk-ins · kitchen 92%→97% @ 20:10 Grill · D-1911 €620 · 82% · 19:59 · Verified MTD canonical (€3,793 via aggregate)

Source: `restaurantGmControlCenterCanon.ts` + Decision Record peak · Live SERIES NOW aligned via `liveService.ts` import of `BERLIN_GM_LIVE_STATE`.

### Canal House (approved)

89% · €248 · €221 · 31/42 · 7 at risk · €1,840 · €6,710 VV · D-H-9201 81%

Source: `hotelDataset` / hotel Decisions / hotel CC canon.

---

## System shipped (minimal architecture)

1. Product store + demo org session (context) · `RoutePeriodSync` / `resolvePeriodForRoute`
2. `useRadrNavigation` / `navigateWithContext` href helpers
3. One AppShell on primary routes (Decisions embedded; `/app/control-center` redirects)
4. Decision Record SSOT + workspace merge (`withCanonicalRecords`) + `aliases.ts`
5. Entity resolvers (`resolveDecisionContext` / `DecisionContextSync`)
6. Playwright + unit gates · CTA QA doc
7. **No visual redesign** of frozen Daylight screens

---

## Definition of done (from brief — checklist)

- [x] 1 canonical AppShell on primary routes  
- [x] 1 canonical context system (Product store + demo org + period sync)  
- [x] No old nav via primary navigation (Decisions private nav removed)  
- [x] No Restaurant/Hotel mix (resolvers + hydrate guards)  
- [x] No unexpected persona/scope reset (`setRoleView` softened; mount writers removed)  
- [x] Route periods semantic (`RoutePeriodSync`)  
- [x] D-1911 / D-H-9201 identical everywhere (catalog merge + aliases)  
- [x] Berlin Live ↔ GM CC metrics reconcile  
- [x] Canal House D-H-9201 economics shared (existing crosslinks + tests)  
- [x] Verified Value CTAs preserve scope (`valueHref` / stay=1)  
- [x] CTAs preserve context (primary surfaces + `RADR_NAVIGATION_QA.md`)  
- [x] Back / forward / refresh / deep links (Playwright + resolvers)  
- [x] Reports wrapped in shell · marked VISUAL FOLLOW-UP (no redesign)  
- [ ] Approved screenshots re-captured in CI visual suite (manual/CI follow when convenient)  

**Pass closed for engineering consistency.** Remaining: opportunistic full CTA `stay=1` sweep on Locations/Memory secondary links; Reports Daylight redesign when approved mock exists.
