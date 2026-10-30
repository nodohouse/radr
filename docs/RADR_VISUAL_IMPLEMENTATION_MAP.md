# RADR Visual Implementation Map

**Status:** Phases A–F shipped to production (2026-10-05). SVG Live · Vision CC · Hotel Pace · Ops/BOH/Guests/Reports. Iterate fidelity vs references.  
**Source of truth:** Attached mockups + `docs/visual-regression/RADR_Product_Vision_UI_Catalog.pdf` (V1.0 · Oct 2026)  
**Product base:** https://prep-ten-zeta.vercel.app/app  
**Rule:** Reproduce presentation. Preserve product logic. No WebGL for Live.

---

## Global art direction (from catalog)

| Token | Spec |
| --- | --- |
| Environment | Deep graphite / warm near-black |
| Type | Warm ivory primary · muted secondary · **serif display titles** · sans UI · **tabular numerals** |
| Accent | RADR green = live / healthy / selected / verified / primary CTA |
| Caution | Restrained amber |
| Adverse | Restrained red |
| Density | Premium density · full canvas · contextual right rails · progressive disclosure |
| Live tech | **2.5D SVG/DOM + Motion or GSAP only** — no WebGL |
| Motion | Hover 120–180ms · Overlay 200–280ms · Lens 250–400ms · Spatial focus 450–700ms |

---

## Current app → reference alignment (summary)

| Catalog # | Reference file | Primary route today | Persona / vertical | Gap |
| --- | --- | --- | --- | --- |
| 01 | `01-cfo-control-center.jpg` | `/app` (role `cfo` / `finance` / `owner`) | CFO · Restaurant group | Present cockpit ≠ mockup composition |
| 02 | `02-gm-control-center.jpg` | `/app` (role `gm`) | GM · Restaurant location | Operating Pulse + modules exist but layout differs |
| 03 | `03-hotel-revenue-pace.jpg` | `/app` (role `revenue_manager`) + hotel vertical | Revenue Manager · Hotel | Pace calendar in CC fragments; not flagship page |
| 04 | `04-live-estate.jpg` | `/app/live` level=estate | CFO/COO · Restaurant | Canvas2D/WebGL experiments → **replace with SVG estate** |
| 05 | `05-live-venue.jpg` | `/app/live` level=venue | GM · Restaurant | Canvas2D venue → **rebuild as SVG 2.5D venue** |
| 06 | `06-hotel-ops-housekeeping.jpg` | `/app/live` hotel + `/app/service` + `/app/house` | Housekeeping / Hotel GM | No building-stack Live yet |
| 07 | PDF p9 (image) | `/app/settings` | All | Settings exists; restyle |
| 08 | PDF p10 (image) | *missing dedicated Reports* · nearest `/app/dashboards`, `/app/value` | All | **New Reports surface** or restyle dashboards |
| 09 | PDF p11 (image) | *partial* · guests live in Service / Intelligence | GM / Guest ops | **New or promote Guest Intelligence** |
| 10 | PDF p12 (image) | `/app/service` | Service / GM | Restyle to Operations command |
| 11 | PDF p13 (image) | `/app/house` | Chef / BOH | Restyle kitchen command center |
| 12 | PDF p14 (image) | Decisions / Intelligence / Memory / Value | All | Storyboard coverage for remainder |

Reference assets live in `docs/visual-regression/references/`.

---

## Shared shell (every mockup)

### REFERENCE
All six JPGs + PDF catalog (left rail + top bar).

### ROUTE
Shell around all `/app/*` (except `/app/enter`, `/app/lab`).

### PERSONA / VERTICAL
Persistent: `roleView`, location scope, period, restaurant|hotel org (`useDemoOrg` / product store).

### COMPONENTS (existing)
- `components/product/ProductShell.tsx`
- `components/product/shell/AppSidebar.tsx`
- `components/product/shell/GlobalOperatingHeader.tsx`
- `lib/product/appNav.ts` (`RAIL_PRIMARY_NAV`, `RAIL_UTILITY_NAV`)
- `components/product/ask/AskRadr*`
- Role / Location / Period switchers

### EXISTING DATA
- `lib/product/store.tsx` — role, scope, period
- `lib/radr/product/demoOrg.ts`, `lib/radr/demo/organizations.ts`
- Decision / attention composers under `lib/radr/product/*`

### REQUIRED NEW / RESTYLED
- Design tokens: `styles/radr-tokens` (or `app/radr-product-tokens.css` evolution)
- Serif display + tabular numeral roles
- Slim branded rail matching mockups (triangle mark, green active bar, mountain footer)
- Shared primitives: MetricBand, RightRail, DecisionCard, StatusPill, Table, Sparkline, Select/Popover
- Motion tokens CSS variables

### REQUIRED INTERACTIONS
- Exactly one active nav destination
- Persona/vertical/scope persist across routes
- ⌘K → Ask RADR (existing)
- No accidental context reset on navigation

### PHASE
**A**

---

## 01 — CFO Control Center

### REFERENCE
`docs/visual-regression/references/01-cfo-control-center.jpg` · PDF catalog 01

### ROUTE
`/app` when `roleView ∈ {cfo, finance, owner}` and restaurant vertical  
(Default control center already switches experience by role — restyle, don’t fork a dead route.)

### PERSONA / VERTICAL
CFO · Restaurant group · MTD / period selector

### COMPONENTS (existing)
- `components/product/control-center/ControlCenter.tsx` / `CcCockpit.tsx` / `CcOverviewDashboard.tsx`
- `OperatingPulseParts.tsx` (`LocationPulseTable`, `BusinessPulseStrip`, …)
- `ValueMovementChart.tsx`, Decision peek/drawers
- `lib/radr/product/experienceComposer.ts`, `businessPulse.ts`, `controlCenterMetrics.ts`

### EXISTING DATA
- Group pulse / location rows / exposure / vs plan
- Decisions needing review + Verified Value ledger hooks (`/app/value`, decision store)

### REQUIRED NEW COMPONENTS
- CFO metric band (Revenue · Contribution · Margin · Exposure + sparklines)
- Portfolio Health table (thumbnail · covers · labor · exposure · state pills)
- Revenue vs Plan grouped bars
- Contribution Margin Trend line
- Right rail: Active Decision · Needs Review · Verified Value (fixed composition)

### REQUIRED INTERACTIONS
- Scope = group / all locations
- Row hover → soft highlight; click → location drill or Decision
- Review & Approve → existing decision approve flow
- View Simulation → Decision futures / preview (existing decision surfaces)

### PHASE
**B**

---

## 02 — GM Control Center

### REFERENCE
`docs/visual-regression/references/02-gm-control-center.jpg` · PDF catalog 02

### ROUTE
`/app` when `roleView ∈ {gm, fb_operator, …}` restaurant · location-scoped

### PERSONA / VERTICAL
GM · Berlin Mitte (demo) · Today

### COMPONENTS (existing)
- Same Control Center stack + `OperatingField`, pulse chart parts
- Service / kitchen readiness signals from live operating composers
- Stock / guest issue fragments exist across Service + House + Findings

### EXISTING DATA
- `lib/radr/product/liveOperating.ts`, glance/priority, location attention
- Reservations / covers / labor demo metrics
- Active Decision queue for location

### REQUIRED NEW COMPONENTS
- GM metric strip (7 metrics as mockup)
- Operating Pulse (wide) with pressure windows + annotations
- Lower module grid: Reservations & Walk-ins · Table Turns · Service Pressure · Kitchen Readiness · Stock Risk · Guest Issues
- Right rail: Active Decision · Needs Review · Verified Value

### REQUIRED INTERACTIONS
- Pulse crosshair / annotation hover
- Module → deep link (Service, House, Decisions) without losing scope
- Approve & Notify / View Impact → decision + Ask RADR

### PHASE
**B**

---

## 03 — Hotel Revenue / Pace

### REFERENCE
`docs/visual-regression/references/03-hotel-revenue-pace.jpg` · PDF catalog 03

### ROUTE
`/app` when hotel vertical + `roleView = revenue_manager`  
(Optional later alias `/app/pace` only if CC routing becomes too crowded — prefer persona-default on `/app`.)

### PERSONA / VERTICAL
Revenue Manager · Amsterdam Canal House · Next 30 days

### COMPONENTS (existing)
- `HotelCockpit.tsx`
- `MiniOperatingCalendar.tsx` / `HotelPaceCalendar`
- Hotel decision demos (`lib/radr/demo/hotelDecisions.ts`, canal house fixtures)

### EXISTING DATA
- Occupancy / ADR / RevPAR / pickup / forecast variance (hotel demo)
- Pace day selection state (calendar)
- Channel mix + demand drivers (partial)

### REQUIRED NEW COMPONENTS
- 7-card hotel metric band
- Full-width Pace Calendar (status legend: On pace · Compressed · Soft · Event · Decision)
- Pace Trajectory chart
- Date inspector: Occupancy · ADR · Rooms remaining · Pickup · Demand drivers · Channel mix · Decision CTA

### REQUIRED INTERACTIONS
- Click day → inspector updates (no navigation)
- Apply Recommendation → decision action
- View Simulation → futures/impact

### PHASE
**D**

---

## 04 — RADR Live · Estate

### REFERENCE
`docs/visual-regression/references/04-live-estate.jpg` · PDF catalog 04 · PDF p15 motion spec

### ROUTE
`/app/live` · `level=estate` · restaurant (CFO/COO defaults already in `personaLive.ts`)

### PERSONA / VERTICAL
CFO / COO / Owner · Restaurant portfolio · Financial lens default for CFO

### COMPONENTS (existing)
- `components/product/radr-live/RadrLiveShell.tsx`
- `EstateScene.tsx` (SVG cards — **delete presentation**)
- Fixtures: `restaurantEstateEntities()` in `lib/radr/spatial-live/fixtures.ts`
- Inspector: `LiveInspector.tsx`

### EXISTING DATA
- 8 Northstar restaurant locations · severity · revenue · contribution · exposure · decisionIds
- Persona defaults: estate + financial for CFO

### REQUIRED NEW COMPONENTS
- SVG 2.5D night city / abstract estate landscape
- Location as architectural site object (not KPI card)
- Floating callout labels + sparklines
- Heatmap / flows / 2.5D·Top toggles (toolbar)
- Estate inspector: hero · Overview tabs · metrics · RADR sees · Active Decision
- Motion: hover lift · select zoom/pan via SVG `viewBox`/transform · inspector slide

### REQUIRED INTERACTIONS
- Hover site → label + soft lift (120–180ms)
- Click → camera-like focus (450–700ms) + inspector
- Enter Venue → continuous transition to venue world (catalog signature)
- Lens Financial ↔ Operations overlay morph (250–400ms)
- No WebGL · no page reload

### PHASE
**C**

---

## 05 — RADR Live · Venue

### REFERENCE
`docs/visual-regression/references/05-live-venue.jpg` · PDF catalog 05 · PDF p15

### ROUTE
`/app/live` · `level=venue` · restaurant (GM default)

### PERSONA / VERTICAL
GM · Berlin Mitte · Operations · Live

### COMPONENTS (existing)
- `VenueSpatialCanvas.tsx` (Canvas2D — **replace presentation with SVG 2.5D**)
- `VenueCanvas.tsx` / R3F (keep offline; not primary)
- Layout: `lib/radr/spatial-live/venueLayout.ts`
- Zones fixtures: `restaurantVenueZones()`
- Decision simulation hooks already on `LiveInspector` (delivery preview)

### EXISTING DATA
- Zones: Main Dining · Bar · Terrace · Kitchen · Delivery
- Metrics, severity, radrSees, decisionIds, expectedValue, confidence
- `simProgress` for preview impact

### REQUIRED NEW COMPONENTS
- Hand-authored SVG restaurant world (tables, bar, kitchen stations, plants, circulation)
- Zone groups with hit targets
- Flow strokes: Dining→Kitchen→Pass→Dining · Delivery→Kitchen→Pickup
- Bottom KPI band + Live Order Queue (as mockup)
- Kitchen inspector composition matching reference
- Preview Impact animation (BEFORE → AFTER world state)

### REQUIRED INTERACTIONS
- Idle breathing + operational pulses
- Hover zone micro-motion
- Select → SVG “camera” transform 500–700ms + inspector
- Review Decision / Ask RADR / Preview Impact
- Estate ↔ Venue continuity

### PHASE
**C**

---

## 06 — Hotel Operations Live / Housekeeping

### REFERENCE
`docs/visual-regression/references/06-hotel-ops-housekeeping.jpg` · PDF catalog 06

### ROUTE
`/app/live` when hotel vertical · property level  
Secondary: `/app/service` (Operations) · `/app/house` (House language)

### PERSONA / VERTICAL
`housekeeping_manager` / `hotel_gm` · Property (Canal House / Grand Aurora demo)

### COMPONENTS (existing)
- Hotel Live surfaces under `components/product/live/Hotel*`
- `HotelAttentionBoard`, readiness flows, property boards
- Housekeeping decision IDs in hotel demo

### EXISTING DATA
- Floor / room readiness demo
- Arrival urgency · attendant counts (partial)
- Hotel decisions (reassign attendants)

### REQUIRED NEW COMPONENTS
- SVG building stack (Roof…B1)
- Selected floor pull-out + room status cells
- Floor list rail
- Right rail: Ready / At Risk / Inspect / Maintenance · Throughput · Arrival Urgency · Decision
- Bottom property readiness strip

### REQUIRED INTERACTIONS
- Floor select → slide/separate floor
- Room click → detail
- Approve & Reassign → decision
- Building View ↔ Floor Plan toggle

### PHASE
**D**

---

## 07 — Settings

### REFERENCE
PDF catalog 07 (image page in catalog PDF)

### ROUTE
`/app/settings`

### PERSONA / VERTICAL
All

### COMPONENTS (existing)
- `app/app/settings/page.tsx` + settings sections

### EXISTING DATA
- Org, preferences, demo org switcher hooks

### REQUIRED NEW
- Master/detail settings chrome
- Persona lens defaults (role → scope → period → Live level → lens)
- Autonomy / approval / connections / data sections as mockup IA

### PHASE
**F**

---

## 08 — Reports

### REFERENCE
PDF catalog 08

### ROUTE
**Gap:** no first-class `/app/reports`  
Nearest: `/app/dashboards`, `/app/value`, export paths

### PERSONA / VERTICAL
All

### EXISTING DATA
- Dashboards widgets · Value ledger · Decision impact

### REQUIRED NEW
- `/app/reports` (or promote Dashboards) with template cards, Generate/Preview/Schedule/Export
- Wire to existing Value / Decision / location metrics

### PHASE
**F**

---

## 09 — Guest Intelligence

### REFERENCE
PDF catalog 09

### ROUTE
**Gap / partial:** guest issues appear in Service & Findings; no dedicated Guest Intelligence page matching mockup  
Candidate: new `/app/guests` or Intelligence child

### EXISTING DATA
- Guest voice / findings demos · satisfaction signals

### REQUIRED NEW
- Guest Intelligence page: satisfaction · volume · return · spend · segments · feedback · patterns → Decisions

### PHASE
**E**

---

## 10 — Operations (Restaurant)

### REFERENCE
PDF catalog 10 · Service mockup family

### ROUTE
`/app/service`

### PERSONA / VERTICAL
GM / Service · Restaurant · next 120 minutes

### COMPONENTS (existing)
- `app/app/service/page.tsx`
- `components/product/live/*`, service map CSS, floor canvases

### EXISTING DATA
- Live operating windows · waitlist · turning tables · labor pressure

### REQUIRED NEW
- Restyle to Operations command composition (pressure map · next window · alerts · recoverable capacity)
- Keep event handlers / deep links to Decisions

### PHASE
**E**

---

## 11 — Back of House / Kitchen

### REFERENCE
PDF catalog 11

### ROUTE
`/app/house`

### PERSONA / VERTICAL
Head chef / kitchen / GM

### COMPONENTS (existing)
- `app/app/house/page.tsx` · house CSS · stock gap attention

### EXISTING DATA
- Kitchen load · prep · stock risk · orders (demo)

### REQUIRED NEW
- Station live view · production flow · stock alerts · active orders · BOH Decisions
- Kitchen command-center density matching catalog

### PHASE
**E**

---

## 12 — Extended family (Decisions · Intelligence · Value · Memory)

### REFERENCE
PDF catalog 12 + product doctrine

### ROUTES
| Surface | Route |
| --- | --- |
| Decisions ledger | `/app/decisions` |
| Decision detail | `/app/decisions/[id]` |
| Intelligence | `/app/intelligence` (+ menu/margin children) |
| Verified Value | `/app/value` |
| Memory | `/app/memory` |
| Connections | `/app/connections` |
| Data Health | `/app/data-health` |
| Ask RADR | `/app/ask` + global ⌘K |

### EXISTING DATA
- Decision store · findings · memory calibration · verified value events · connections matrix

### REQUIRED NEW
- Visual restyle only for ledger / detail / intel / value to match storyboard density
- Preserve Decision loop: Recommendation → Why → Evidence → Futures → Action → Outcome → Verification → Memory

### PHASE
**F** (with continuous Verified Value appearance from Phase B onward)

---

## Navigation IA (mockup vs current)

| Mockup label (restaurant) | Current href | Notes |
| --- | --- | --- |
| RADR Live / Live | `/app/live` | Keep |
| CFO / GM Control Center | `/app` | Same route; persona paints layout |
| Operations | `/app/service` | Relabel in rail for restaurant if needed |
| People / Team | `/app/team` (exists) | Promote into primary rail if mockup requires |
| Menu | `/app/intelligence/menu` | Keep as Menu destination |
| Procurement / Buy | `/app/buy` | Map label |
| Guest Intelligence | **new or** Intelligence child | Gap |
| Reports | **new or** `/app/dashboards` | Gap |
| Settings | `/app/settings` | Keep |
| Decisions | `/app/decisions` | Keep (may sit under Control / Proof) |
| BOH | `/app/house` | Keep |
| Value / Memory / Connections / Data Health | existing | Keep; may be utility rail |

**Hotel rail remaps** already partially in `railPrimaryNavForVertical` (Operations / House / Properties). Extend to match hotel mockups (Revenue Manager, Rooms & Rates, etc.) without breaking URLs.

---

## Data / logic preservation checklist

Do not drop when restyling:

- [ ] Restaurant ↔ Hotel org switch
- [ ] Persona (`roleView`) persistence
- [ ] Location / group scope
- [ ] Period
- [ ] Decision approve / dismiss / deep link
- [ ] Expected Value + Verified Value
- [ ] Operating Memory
- [ ] Ask RADR
- [ ] Connections + Data Health
- [ ] Intelligence pins / findings
- [ ] Live Estate ↔ Venue state
- [ ] Demo fixtures & shared Decision IDs (`dec_peak_berlin`, etc.)

---

## Implementation order (locked)

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| **A** | Tokens · shell · nav · primitives · typography · tables · right rail | Side-by-side shell vs any mockup rail/header ≈90% |
| **B** | CFO CC · GM CC | Screenshot QA vs `01` / `02` at 1512×982 |
| **C** | Live Estate · Live Venue · simulation · estate→venue | SVG only · motion grammar · QA vs `04` / `05` |
| **D** | Hotel Pace · Hotel Ops Live | QA vs `03` / `06` |
| **E** | Operations · BOH · Guest Intelligence | QA vs PDF 09–11 |
| **F** | Reports · Settings · Intelligence · Decisions · Value/Memory polish | QA vs PDF 07–08 + 12 |

**Do not start Phase B until Phase A tokens/shell land.**  
**Do not mark a page done without** `docs/visual-regression/` reference · implementation · notes.

---

## Technical constraints (documented)

| Constraint | Closest alternative |
| --- | --- |
| WebGL unreliable in target browsers | SVG/DOM 2.5D + Motion/GSAP for all Live |
| Mockups show photoreal 3D interiors/buildings | Stylized vector architecture that matches silhouette/density — not PNG wallpaper |
| Reports / Guest Intelligence pages missing | Add routes; wire existing metrics/decisions; do not fake screenshots |
| Serif display not in current product fonts | Add approved display face to design system (match mockups; avoid Inter-only UI) |
| One Control Center route for many personas | Persona-conditioned layout packs on `/app` rather than duplicate apps |

---

## Visual regression workspace

```
docs/visual-regression/
  RADR_Product_Vision_UI_Catalog.pdf
  references/
    01-cfo-control-center.jpg
    02-gm-control-center.jpg
    03-hotel-revenue-pace.jpg
    04-live-estate.jpg
    05-live-venue.jpg
    06-hotel-ops-housekeeping.jpg
  implementations/   # screenshots per page (to add during build)
  notes/             # comparison notes (to add during build)
```

---

## Next action

**Await confirmation of this map**, then start **Phase A** (global design system + shared shell only).
