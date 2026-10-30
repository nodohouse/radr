# Restaurant × Hotel Parity

**Date:** 2026-09-24  
**Thesis:** One Decision architecture. Two deep operating worlds.  
**Orgs:** Northstar Restaurants · Northstar Hotels  
**Technical SSOT:** `docs/VERTICAL_PARITY_ARCHITECTURE.md` · `lib/radr/vertical/experienceProfile.ts`

---

## Investor test

Switch org in `/app`. If it feels like the same dashboard with relabeled KPIs → **FAIL**.  
If it feels like the same Decision platform running two businesses → **PASS**.

**Current:** Control Center **PASS**. Intelligence / Memory **FAIL** (restaurant residue on hotel).

---

## Shared architecture (must not fork)

```
Evidence → Finding → Materiality → Futures → Decision
  → Action → Outcome → Verification → Verified Value → Memory
```

Attention bands, autonomy ladder, Verified Value methodology, and nav structure are shared.

What changes per vertical: **data · operating model · visualization · lexicon · Decision classes**.

---

## Restaurant world — required depth

| Capability | Product status | Website may show? |
|---|---|---|
| Control Center situation + needs you | **DEMO ready** | Yes — preferred hero |
| Live / pressure window / Now+Next | **DEMO ready** | Yes |
| Menu economics + rankings + PUSH/HOLD/REWORK | **DEMO ready** | Yes (concrete tuna/truffle) |
| Basket / upsell | **DEMO partial** | Careful |
| Inventory / prep / labor | **DEMO partial** | Concrete examples only |
| Procurement / invoice recovery (D-4102) | **DEMO sealed** | Yes — flagship Verified Value |
| Decisions + Futures (D-1911 WAIT 12) | **DEMO ready** | Yes |
| Verified Value ledger | **DEMO ready** | Yes |
| Operating Memory | **DEMO ready** | Yes |
| Connections honesty | **PARTIAL** | Registry badges |

### Restaurant concrete examples (prefer these)

- “2 Decisions need your judgment.”
- “Revenue is ahead. Contribution isn’t.”
- “WAIT 12 MINUTES · Kitchen →97% · +€620 expected.”
- “Tuna is #1 seller. Truffle Pasta wins contribution per kitchen minute. HOLD tuna promo at peak.”
- “Contract €6.80 · Invoice €7.45 · €273 disputed → Verified.”

### Restaurant 5-second GM test

How is service? What next? Kitchen? Staffing? Stock? Menu? What needs me?

---

## Hotel world — required depth

| Capability | Product status | Website may show? |
|---|---|---|
| Hotel Control Center | **DEMO ready** | Yes |
| 24h Live / arrival–readiness | **DEMO partial** | Yes if matches HotelLiveSurface |
| Arrivals / ready / at risk | **DEMO ready** (CC) | Yes — 42 / 31 / 7 |
| Pickup / occupancy / ADR / RevPAR | **DEMO partial** | Only numbers product shows |
| Housekeeping bottleneck Decision | **DEMO ready** | Yes |
| Distribution / OTA / channel | **DEMO partial** | Commission-avoided story exists |
| Hotel Decision catalog | **DEMO ready** | Yes |
| Verified Value (hotel) | **DEMO partial** | Prefer sealed hotel VV IDs |
| Hotel Memory | **WEAK** | Not until residue cleared |
| Hotel Intelligence hub | **WEAK** — restaurant residue | **No equal homepage claim yet** |
| Hotel Locations depth | **PARTIAL** | Deepen before full hotels page |

### Hotel concrete examples (prefer these)

- “CHECK-IN IS ON TRACK. ROOM READINESS ISN'T.”
- “42 arrivals · 31 ready · 7 at risk · Floor 3 behind.”
- “Reassign 2 housekeepers? Compare Futures.”
- “Trade show pickup +11% · late arrival risk.”
- “€1,840 OTA commission avoided” (only if sealed in product).

### Hotel 5-second tests

**GM:** How full? Rooms ready? Check-in? At risk? Staffing? Needs me?  
**Revenue:** Pickup? Pace? ADR? RevPAR? Net channel? Remaining inventory? Decision?

---

## Language QA (hard)

| Hotel UI must not primary-show | Restaurant UI must not primary-show |
|---|---|
| covers · tables · kitchen → · dish · delivery+ | ADR · RevPAR · room nights · housekeeping · check-in |

Playwright: `tests/e2e/vertical-parity.spec.ts` · `docs/VERTICAL_PARITY_QA.md`.

---

## Website equal-weight rule

Homepage **Restaurants | Hotels** toggle is **blocked** until:

1. Hotel Intelligence shows hotel modules (not Menu/restaurant default)
2. Hotel Memory shows hotel playbooks / calibration language
3. At least one hotel Verified Value chain is as crisp as D-4102
4. Locations hotel day scene matches readiness grammar

Until then: hotel may appear as a **strong secondary section** using only CC-proven claims — not “equal deep product” copy.

---

## Composition map

```
DemoOrgSwitcher
  → useDemoOrg()
  → ControlCenter
       restaurant → CcCockpit
       hotel      → HotelCockpit
  → Focus live
       restaurant → LiveCommandSurface
       hotel      → HotelLiveSurface
```

---

## Parity work remaining (product before website)

1. Hotel Intelligence verticalization  
2. Hotel Memory + Year-on-RADR hotel lens  
3. Hotel Locations readiness flow polish  
4. Hotel Verified Value flagship seal (readiness or channel)  
5. Green Playwright vertical-parity both orgs  
6. Then: website Hotels section + `/en/hotels` page  

Restaurant non-regression: D-1911 · Menu Pulse · D-4102 must stay intact after every hotel pass.
