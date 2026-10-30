# RADR QA Audit

**Date:** 2026-10-05 (Phase 1 final + Live V1)  
**Preview:** local `http://127.0.0.1:3020/app` · https://prep-ten-zeta.vercel.app/app  
**Suite:** `tests/e2e/radr-click-everything.spec.ts`  
**Artifacts:** `tmp/radr-qa/`  
**Last clean run:** issues.json empty · restaurant crawl + locations + Ask RADR green after Live nav add

---

## Phase gate

| Phase | Status |
|---|---|
| 1 — Stabilize + click-everything QA | **Complete** — P0/P1 in suite matrix cleared |
| 2 — RADR Live V1 | **Shipped locally** — `/app/live` 2.5D spatial layer |
| 3 — Design-system consolidation | Next — targeted polish only, no redesign |

---

## Principle

One application context: **vertical × persona × scope × period**.  
Navigation must never silently redefine who the user is.

---

## Suite coverage

| Matrix cell | Status |
|---|---|
| Restaurants × every persona × every primary route (incl. `/app/live`) | Pass |
| Hotels × all personas × every primary route | Pass |
| Exactly one `aria-current=page` | Pass |
| Persona / scope / vertical persistence | Pass |
| Restaurant ↔ Hotel toggle | Pass |
| Service deep links + tab URL sync + back/forward | Pass |
| Decisions ledger open + parent nav active | Pass |
| Location deep links retain persona | Pass |
| Ask RADR open / Escape / opaque panel | Pass |
| Settings sections | Pass |
| Tables sort / overflow | Pass |
| Dashboards templates | Pass |
| Dropdown opacity (persona / period) | Pass |

Primary routes: Center · Decisions · **Live** · Service · BOH · Intelligence · Memory · Value · Locations · Connections · Data Health · Dashboards · Settings

---

## Issue log

### QA-P0-001 — Persona/scope flipped across routes
- **Severity:** P0 · **Status:** fixed  
- `useLayoutEffect` restore + `data-context-ready`; e2e waits for ready

### QA-P0-002 — Persona dropdown transparent / bleed
- **Severity:** P0 · **Status:** fixed  
- Portal to `document.body` + shared opaque float tokens

### QA-P0-003 — Nav order shuffled by persona
- **Severity:** P0 · **Status:** fixed  
- Stable `RAIL_PRIMARY_NAV` only

### QA-P0-005 — Location deep link forced GM
- **Route:** `/app/locations/[id]` · Restaurant · CFO · Group  
- **Expected:** remain CFO · **Actual:** `ensureDemoOrgForVertical` wrote `roleView: "gm"`  
- **Severity:** P0 · **Status:** fixed — deep links never overwrite persona

### QA-P1-001 — Service Group shell vs Berlin body
- **Status:** fixed — breadcrumb `Group / {primary} / Service`

### QA-P1-002 — Service tabs did not own URL
- **Status:** fixed — `?view=` + URL-first paint

### QA-P1-003 — GM “N locations need attention”
- **Status:** fixed — Estate insight labeling

### QA-P1-004 — Service SVG hydration mismatch
- **Status:** fixed — `aria-label` on zone rects

### QA-P1-005 — Memory duplicate React keys
- **Status:** fixed — DNA keys `name·pattern`

### QA-P1-006 — Ask RADR layering on graphite
- **Status:** fixed — command z-token + opaque panel

### QA-P2-001 — Dual world radios
- **Status:** open (intentional Operating world + DEMO)

### QA-P2-002 — axe / 1512 / multi-entry Decision paths
- **Status:** open — extend after Live polish

---

## RADR Live V1

**Route:** `/app/live`  
**Code:** `components/product/radr-live/*` · `lib/radr/spatial-live/*`  
(Kept separate from `lib/radr/live` shift-economics stream.)

| Capability | V1 |
|---|---|
| Estate (8 restaurants / 8 hotels) | Yes |
| Restaurant venue zones | Yes |
| Hotel property floors + Floor 7 rooms | Yes |
| Persona default level | Yes |
| Inspector → Decision / Location / Ask | Yes |
| SIMULATED LIVE label | Yes |
| Three.js / employee tracking / BIM | No |

Demo flow: CFO Estate → Berlin Mitte intervene → Review Decision → switch GM → Venue Kitchen → Hotels GM → Floor 7 readiness Decision.

---

## Re-run

```bash
PRODUCT_QA_BASE_URL=http://127.0.0.1:3020 \
  npx playwright test tests/e2e/radr-click-everything.spec.ts --project=desktop-1440
```
