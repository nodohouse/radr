# Hotel Decisions — Reference Map

**Route:** `/app/decisions` · hotel vertical · GM · Canal House · Today  
**Status:** PASS 1–7 complete · persona lenses (GM · CFO · Revenue · HK · FO · Ops) on same Decisions UI · visual gate `tmp/hotel-decisions-pass2-1512x982.png`  
**Visual SSOT:** `tmp/hotel-decisions-mockup-ssot.jpg` (approved composition)  
**Logic SSOT:** Canal House demo · `D-H-9201` · €1,840 · 81% · 14:40 — **not** mockup €180k / 87%

## Thesis

Hotel Decisions = judgment + execution layer of RADR.

Same Decision engine as Restaurants. Hotel operating grammar only.

Not: task list · approval inbox · recommendation feed · restaurant clone with hotel labels.

## Component map

| Surface | Path | Disposition |
|---------|------|-------------|
| `RadrDecisions` | `components/product/decisions/workspace/RadrDecisions.tsx` | **SHARED ENGINE** — KEEP LOGIC · hotel uses adapter data |
| `radr-decisions.css` | same folder | **RECOMPOSE UI** — Daylight tokens · hotel density overrides |
| `getDecisionsWorkspace` | `lib/product/decisionsWorkspace/` | **HOTEL ADAPTER** — `hotelData.ts` · do not hardcode restaurant in hotel mode |
| `restaurantData.ts` | same | **KEEP** — restaurants only |
| `DecisionLedger` / `DecisionRecordView` | `components/product/decisions/` | **KEEP** — detail route `/app/decisions/[id]` |
| ProductShell bare chrome for `/app/decisions` | `ProductShell.tsx` | **KEEP** — Decisions ships own nav (mockup-faithful) |
| AppSidebar hotel rail | `appNav` / `AppSidebar` | **ALIGN** — hotel-native labels elsewhere; Decisions workspace nav mirrors mockup |
| `hotelDecisions.ts` | `lib/radr/demo/` | **KEEP LOGIC** — align display IDs to `D-H-9201` |
| `DECISION_IDS.hotelReadiness` | `lib/radr/decision/ids.ts` | **CANONICAL ID** — `dec_hotel_readiness_canal` · display `D-H-9201` |
| `HotelGmControlCenter` Active Decision | control-center | **CROSS-LINK** — same id / €1,840 / 81% / 14:40 |
| `houseReadinessModel` Apply Suggestion | house-readiness | **CROSS-LINK** — open existing `D-H-9201` · never duplicate |

## Classification

| Kind | Items |
|------|--------|
| **SHARED** | Decision states · approve / request changes / futures · inspector tabs · ledger tabs · search/sort shell |
| **KEEP LOGIC** | Confidence · exposure · readiness 31/42 · verified MTD €6,710 · autonomy / policy hooks (later passes) |
| **RECOMPOSE UI** | KPI strip (property-scale) · Property column · Status/Progress on judgment · hotel nav · inspector copy |
| **HOTEL ADAPTER** | `hotelDecisionsWorkspace` · hotel drivers · hotel decision classes · Canal House thumbs |
| **REMOVE (hotel mode)** | Menu mix · Food waste · Table cancellation · Kitchen · covers · dine-in · delivery · restaurant €M group KPIs |
| **MISSING (later passes)** | Compare Futures 3-way · Request Changes staffing stepper · Data Health confidence degrade · Policy deep-link · bulk actions · persona priority filters · Playwright suite |

## Restaurant leakage to purge in hotel mode

| Leak | Source | Fix |
|------|--------|-----|
| €1.8M / €642k / €180k / 87% | Mockup generation + restaurant labor row | Canonical €12.4k strip · D-H-9201 €1,840 / 81% |
| `Adjust labor scheduling` as default | `restaurantData` | Hotel default = `dec_hotel_readiness_canal` |
| Driver `Menu mix` / `Food waste` | restaurant ledger | Hotel drivers only |
| Nav: Kitchen / F&B / BOH | restaurant Decisions nav | Hotel: Operations · Housekeeping · Arrivals · Guests · Properties |
| Subtitle “Turn insights into impact” | restaurant | Hotel: “Turn hotel operating intelligence into measurable impact.” |
| Display `D-HK-1402` | `DECISION_DISPLAY_IDS` | **`D-H-9201`** product-wide |
| Impact to date labeled as Today | period ambiguity | Label **Verified Value MTD** / **Impact to date (MTD)** |

## Canonical Canal House · GM · Today

| Metric | Value |
|--------|-------|
| Clock | 14:20 |
| Occupancy | 89% |
| ADR / RevPAR | €248 / €221 |
| Ready / Due / At risk | 31 / 42 / 7 |
| Arrivals | 42 |
| Exposure | €1,840 |
| Verified MTD | €6,710 |
| Active Decision | **D-H-9201** REASSIGN 2 HOUSEKEEPERS |
| Expected protected | up to €1,840 (range €1,250 – €1,840) |
| Confidence | 81% |
| Deadline | 14:40 (20m remaining at 14:20) |

## KPI strip (property scope — not group)

| KPI | Value |
|-----|-------|
| Total opportunity | €12.4k · Across 9 open Hotel Decisions |
| Needs your judgment | 3 · €3.2k potential protected value |
| In motion | 4 · €5.1k expected value |
| Resolved | 8 · €6.7k verified value MTD |
| Impact to date | €6.71k · +14% vs prior MTD |

## Flagship row + inspector (PASS 2)

**D-H-9201 — Reassign 2 housekeepers**

- Description: Move 2 housekeepers from lower-priority floors to Floor 3 before the arrival wave.
- Impact: +€1,840 protected contribution
- Driver: Housekeeping
- Property: Canal House · Amsterdam
- Status: Needs review · Progress 0% · Deadline Before 14:40
- Why: Floor 3 behind · 42 arrivals · 7 at risk · Floors 1–2 spare capacity
- Outcomes: +4 rooms ready · −35 min avg delay · +€1,840 protected · guest satisfaction no material impact
- Before/After: 31/42 → 35/42 · 7 → 3 at risk · 22m → 8m delay
- CTA: Approve Decision · Request changes

## Implementation order

1. **PASS 1** — this map ✅  
2. **PASS 2** — static Hotel GM overview + inspector · screenshot 1512×982 ✅  
3. **PASS 3** — table interaction ✅  
4. **PASS 4** — Approve / Request Changes / Decline / Progress ✅  
5. **PASS 5** — Compare Futures (deterministic) ✅  
6. **PASS 6** — Control Center · House Readiness · Live · Intelligence · Value · Memory · Data Health · Policy ✅  
7. **PASS 7** — CFO / Revenue / Housekeeping / Front Office / Ops lenses ✅  


## Final gate

Five-second test: 3 need judgment · ~€3.2k · D-H-9201 most urgent · €1,840 · 81% · 14:40 · Approve / change / futures.
