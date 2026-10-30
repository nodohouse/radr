# FEATURE_BASELINE

**Date:** 2026-10-02  
**Canonical:** https://prep-ten-zeta.vercel.app/app?stay=1  
**Pass:** Visual recomposition only — product frozen

## Gate

Every item below must remain present or equally reachable after the pass.  
FAIL if useful functionality disappears. Only TRUE DUPLICATE may leave Level 1.

---

## Global chrome

| Element | Type | Notes |
|---------|------|-------|
| Sidebar primary nav | links | Center, Decisions, Service, BOH, Intelligence, Memory, Value, Locations, Connections, Data Health, Settings, Butler |
| Mobile tab bar | nav | Mobile-only; hide on desktop (not delete) |
| RADR mark | link | → /app |
| Scope | control | Restaurants / Berlin Mitte (or All) |
| Role | control | GM / CFO / COO … |
| Period | control | Live / Today / MTD |
| Restaurants / Hotels | control | Demo org switch |
| Butler | button | Open Ask |
| User | control | Persona initial / name |
| LIVE clock | metric | 19:48 |
| Signals need judgment | button + tray | count + list |
| 146 evaluated | metric | may move to Status details tray |
| 141 cleared | metric | may move to Status details tray |
| Handling | button + tray | count + list |
| Watching | button + tray | count + list |
| € Verified | button + tray | amount + link to Value |

---

## Control Center `/app`

| Section / module | Contents | Interactions |
|------------------|----------|--------------|
| Command stage | Greeting + role lens line | Compress / relocate — persona via role control |
| Situation | Statement, why line, 5 drivers, In/Out/Net, Why → | Driver drills |
| Review Now | Policy, D-1911 primary, D-8204, D-7501, Review N → | Open Decision |
| Operating Pulse | NOW, pressure window, walk-ins, terrace, kitchen, delivery, timeline markers, Live Focus → | D-1911 marker |
| Contribution | −€4,780, diagnosis, COGS/Labor/Channels/Menu drivers, Why → | Driver / Decision open |
| Locations | Berlin, Kreuzberg, Hamburg (+ Options) | All →, Options |
| Menu pulse | 01–03 dishes: image, units, contrib, badge/pace | View Menu Intelligence → |
| History | Month/Year, heatmap calendar | Day cells |

### Situation drivers (must remain unique once each)

Sales · COGS · Labor · Channels · Menu Mix · In · Out · Net · Why →

### Review Now Decisions (all three)

D-1911 · D-8204 · D-7501 (+ policy / approval meta)

---

## Other routes (capability freeze)

| Route | Must remain reachable |
|-------|----------------------|
| `/app/service` | Time, Occupancy/Revenue/Pressure/Turns, floor, panel, Futures, Replay |
| `/app/locations` | Portfolio metrics + all columns (fold on narrow, not delete) |
| `/app/intelligence` (+ menu) | All domains / rank fields |
| `/app/memory` | Sample, errors, confidence, cases, interventions, outcomes |
| `/app/value` | Proof chain |
| `/app/settings` | Full left nav sections |
| BOH / Value / Decisions / Connections / Data Health | Existing modules |

---

## True duplicates only (may leave Level 1)

| Item | Why |
|------|-----|
| Menu Mix rendered twice in same Situation rail | Bug — keep one |
| Secondary desktop nav duplicating sidebar | Hide on desktop; keep mobile |
| Giant greeting repeating role/persona | Compact — role control remains |

---

## Post-pass checklist

- [x] Every baseline interaction still reachable  
- [x] No money / Decision / seed changes  
- [x] Menu Pulse rankings still visible  
- [x] Status details preserves evaluated / cleared  
- [x] Menu Mix unique once in Situation rail  
- [x] Desktop: one nav (sidebar); mobile tabs hidden ≥960px  
