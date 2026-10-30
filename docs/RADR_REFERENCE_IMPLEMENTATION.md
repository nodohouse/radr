# RADR Reference Implementation Matrix

**Status:** LOCKED process · 2026-10-05  
**Rule:** Attached images are the specification. Preserve logic. Replace presentation.  
**Catalog:** `docs/visual-regression/RADR_Product_Vision_UI_Catalog.pdf` (V1.0 · Oct 2026)  
**References:** `docs/visual-regression/references/`  
**Baselines (current deploy):** `visual/current/` @ 1512×982  
**Prod:** https://prep-ten-zeta.vercel.app/app  

**Do not mark a screen complete until silhouette / density / rail / primary viz / typography match the reference at ~90–95%.**

---

## Canonical AppShell (ONE)

Derived from Settings / Reports / Operations / Guests / BOH mockups (PDF p9–p13):

| Zone | Spec |
| --- | --- |
| Left rail primary | Center · Decisions · Live · Operations · BOH · Guests · Intelligence · Value · Reports · Connections · Settings |
| Left rail footer | Mission line + atmospheric strip (mockup) |
| Top bar | Scope (vertical / location / persona) · Period · Search · Ask RADR · Account |
| Theme | Graphite · warm ivory · RADR green · editorial serif titles · sans UI · tabular nums |
| Viewport target | 1512 × 982 |

**Forbidden:** second nav generations · Memory / Service Map / Locations / Data Health / Dashboards as primary-rail islands · page-local chrome that redefines the shell.

Routes for Memory / Locations / Data Health / Dashboards remain reachable by URL / deep links during rebuild; they are **not** primary rail items until a mockup includes them.

---

## Implementation order (gated)

| Phase | Screen | Gate |
| --- | --- | --- |
| **A** | AppShell + tokens | Every route shows the SAME shell |
| **B** | GM Control Center | Side-by-side vs `02-gm-control-center.jpg` |
| **C** | CFO Control Center | Side-by-side vs `01-cfo-control-center.jpg` |
| **D** | Operations | vs `10-operations.png` |
| **E** | BOH | vs `11-back-of-house.png` |
| **F** | Live Venue | vs `05-live-venue.jpg` / pdf-p07 |
| **G** | Live Estate | vs `04-live-estate.jpg` |
| **H** | Guests | vs `09-guest-intelligence.png` |
| **I** | Hotel Pace | vs `03-hotel-revenue-pace.jpg` |
| **J** | Hotel Operations | vs `06-hotel-ops-housekeeping.jpg` / pdf-p08 |
| **K** | Reports | vs `08-reports.png` |
| **L** | Settings | vs `07-settings.png` |
| **M** | Intelligence / Decisions / Value / Memory | vs pdf-p14 storyboard + system |
| **N** | Connections / Data Health / Locations / Dashboards | derived from system language |

---

## Screen matrix

### 01 — CFO Control Center

| Field | Value |
| --- | --- |
| **REFERENCE** | `01-cfo-control-center.jpg` · PDF catalog 01 / pdf-p03 |
| **IMPLEMENTATION** | `/app` · persona `cfo` \| `finance` \| `owner` · vertical Restaurants · scope Group |
| **CURRENT** | `visual/current/cc-cfo-restaurant.png` |
| **PRESERVE** | `composeControlCenterBrief` · pulse · contribution bridge · NeedsYou / Verified Value · decision approve flow |
| **REMOVE** | GM operating pulse · kitchen / service narrative · CcCockpit legacy layout · duplicate LIVE/decision chrome strips above content |
| **REBUILD** | Editorial “CFO Control Center” · 4 executive metrics + sparklines · Portfolio Health table (all locations) · Revenue vs Plan bars · Contribution Margin Trend · right rail Active Decision / Needs Review / Verified Value |
| **DATA** | `getBusinessPulse` · `getContributionBridge` · `composeControlCenterBrief` · location rows |
| **INTERACTIONS** | Row → location / Decision · Review & Approve · View Simulation · period / scope persist |

---

### 02 — GM Control Center

| Field | Value |
| --- | --- |
| **REFERENCE** | `02-gm-control-center.jpg` · PDF catalog 02 / pdf-p04 |
| **IMPLEMENTATION** | `/app` · persona `gm` · vertical Restaurants · location scope (Berlin Mitte demo) |
| **CURRENT** | `visual/current/cc-gm-restaurant.png` |
| **PRESERVE** | NeedsYou ranking · decision CTAs · verified value · live operating metrics composers |
| **REMOVE** | Thin metric-only layouts · missing lower module grid · oversized status chrome |
| **REBUILD** | 7-metric strip · large Operating Pulse · right rail Active Decision / Needs Review / Verified Value · lower 3×2: Reservations & Walk-ins · Table Turns · Service Pressure · Kitchen Readiness · Stock Risk · Guest Issues |
| **DATA** | pulse · `LIVE_SCENARIO` · needsYou · house/service signals |
| **INTERACTIONS** | Pulse annotations · module → Service / House / Decisions · Approve & Notify · View Impact |

---

### 03 — Hotel Revenue / Pace

| Field | Value |
| --- | --- |
| **REFERENCE** | `03-hotel-revenue-pace.jpg` |
| **IMPLEMENTATION** | `/app` · hotel vertical · persona `revenue_manager` |
| **CURRENT** | `visual/current/cc-revenue-hotel.png` |
| **PRESERVE** | `HotelPaceCalendar` data · hotel decisions · canal house metrics |
| **REMOVE** | Sparse unused canvas · non-pace hotel CC as default for revenue persona |
| **REBUILD** | 7-card metric band · full Pace Calendar + legend · date inspector rail · Pace Trajectory · Apply Recommendation / View Simulation |
| **DATA** | `canalHouseLive` · hotel needsYou · pace day cells |
| **INTERACTIONS** | Day select → inspector · Apply Recommendation → decision |

---

### 04 — RADR Live · Estate

| Field | Value |
| --- | --- |
| **REFERENCE** | `04-live-estate.jpg` |
| **IMPLEMENTATION** | `/app/live` · `level=estate` · restaurant · CFO/COO default |
| **CURRENT** | `visual/current/live-estate-restaurant.png` |
| **PRESERVE** | `restaurantEstateEntities()` · inspector decision hooks · personaLive defaults · `__radrLiveSelect` |
| **REMOVE** | WebGL · Canvas2D primary · KPI-card estate nodes · improvised map geometry |
| **REBUILD** | Premium SVG night estate · architectural sites · labels · health · selected Berlin Mitte · right inspector · 2.5D/Top · Labels · Heatmap · Flows · idle/hover/select camera |
| **DATA** | spatial-live fixtures · LiveInspector entity model |
| **INTERACTIONS** | Hover lift · select zoom · Enter Venue transition · lens morph · Preview Impact |

---

### 05 — RADR Live · Venue

| Field | Value |
| --- | --- |
| **REFERENCE** | `05-live-venue.jpg` · `pdf-p07.png` |
| **IMPLEMENTATION** | `/app/live` · `level=venue` · GM default |
| **CURRENT** | `visual/current/live-venue-restaurant.png` |
| **PRESERVE** | `restaurantVenueZones` · simProgress · Ask RADR · decision IDs |
| **REMOVE** | Diamond/rectangle zones · WebGL VenueCanvas as primary |
| **REBUILD** | Hand-authored isometric restaurant (tables, bar, kitchen, terrace, delivery) · KPI band · Live Order Queue · Kitchen inspector tabs · Preview Impact animation |
| **DATA** | venue zones · LIVE_SCENARIO |
| **INTERACTIONS** | Zone hover/select · SVG camera · Approve & Deploy · Estate↔Venue continuity |

---

### 06 — Hotel Operations / Housekeeping

| Field | Value |
| --- | --- |
| **REFERENCE** | `06-hotel-ops-housekeeping.jpg` · `pdf-p08.png` |
| **IMPLEMENTATION** | `/app/live` hotel property · housekeeping / hotel_gm |
| **CURRENT** | `visual/current/live-hotel-ops.png` |
| **PRESERVE** | Hotel readiness decisions · attendant reassignment · property fixtures |
| **REMOVE** | Flat building stubs · text-only HK boards as primary Live |
| **REBUILD** | 2.5D building · floor select · room status · right rail Ready/At Risk/Throughput/Arrival Urgency/Decision · bottom property strip |
| **DATA** | hotel estate entities · HK decisions |
| **INTERACTIONS** | Floor pull-out · room click · Approve & Reassign · Building↔Floor Plan |

---

### 07 — Settings

| Field | Value |
| --- | --- |
| **REFERENCE** | `07-settings.png` |
| **IMPLEMENTATION** | `/app/settings` |
| **CURRENT** | `visual/current/settings.png` |
| **PRESERVE** | demoSettings · personas · autonomy · connections · policies · org switcher |
| **REMOVE** | Unstructured control walls · light/legacy chrome |
| **REBUILD** | Master/detail · Profile / Organization / Personas / Policies & autonomy / Access / Data · right rail org + system status + connections |
| **DATA** | `readDemoSettings` · DEMO_PERSONAS · sourcesForDemo · dataHealth |
| **INTERACTIONS** | Section nav · save · persona lens table · autonomy toggles |

---

### 08 — Reports

| Field | Value |
| --- | --- |
| **REFERENCE** | `08-reports.png` |
| **IMPLEMENTATION** | `/app/reports` |
| **CURRENT** | `visual/current/reports.png` |
| **PRESERVE** | Value / Decision / dashboard metric hooks |
| **REMOVE** | Template-card-only list |
| **REBUILD** | Library cards (All / Financial / Operations / Guests) · Recent Reports table · selected report preview rail · Scheduled delivery · Generate / Preview / Schedule / Export |
| **DATA** | Value ledger summaries · decision counts · location scope |
| **INTERACTIONS** | Select report → preview · Open report · schedule toggles |

---

### 09 — Guest Intelligence

| Field | Value |
| --- | --- |
| **REFERENCE** | `09-guest-intelligence.png` |
| **IMPLEMENTATION** | `/app/guests` |
| **CURRENT** | `visual/current/guests.png` |
| **PRESERVE** | Guest findings / recovery decision links |
| **REMOVE** | Sparse 4-KPI + thin table page |
| **REBUILD** | 5 metrics · segments chart · sentiment · behavior · RADR sees · Guest Spotlight · Recent Feedback · Create recovery Decision |
| **DATA** | Demo guest aggregates · findings · decision seeds |
| **INTERACTIONS** | Spotlight · Create recovery Decision · Export |

---

### 10 — Operations

| Field | Value |
| --- | --- |
| **REFERENCE** | `10-operations.png` |
| **IMPLEMENTATION** | `/app/service` · restaurant GM |
| **CURRENT** | `visual/current/operations.png` |
| **PRESERVE** | Service universe · Floor / Timeline / Recovery modes · decision deep links |
| **REMOVE** | Text-summary “Pressure Map” placeholder · VisionOperations KPI+list stub |
| **REBUILD** | Live floor spatial primary · next 120 minutes · service team · Active Decision rail · Needs Review · Operating Pulse |
| **DATA** | `getBerlinServiceUniverse` · connectedState · peak decision |
| **INTERACTIONS** | Floor/Timeline/Recovery · Review Decision · table/zone focus |

---

### 11 — Back of House

| Field | Value |
| --- | --- |
| **REFERENCE** | `11-back-of-house.png` |
| **IMPLEMENTATION** | `/app/house` · restaurant |
| **CURRENT** | `visual/current/house.png` |
| **PRESERVE** | `houseAttentionFor` · captures · gaps · decision status wiring |
| **REMOVE** | House-standards-as-homepage ledger · thin VisionBoh stub as final |
| **REBUILD** | Metric strip · Production Readiness table + flow · Prep Gaps · Incoming Supply · Decision rail · Station Pressure · 86 Risk · RADR sees · standards as drill-down |
| **DATA** | houseAttention · captures · kitchen metrics demo |
| **INTERACTIONS** | Approve & deploy · gap expand · capture simulate |

---

### 12 — Decisions / Intelligence / Value / Memory

| Field | Value |
| --- | --- |
| **REFERENCE** | PDF p14 storyboard + system language from CFO/Reports |
| **IMPLEMENTATION** | `/app/decisions` · `/app/intelligence` · `/app/value` · `/app/memory` |
| **CURRENT** | `visual/current/decisions.png` · `intelligence.png` · `value.png` · `memory.png` |
| **PRESERVE** | Decision store · Verified Value chains · memory playbooks · intel modules data |
| **REMOVE** | Oversized decision cards · Intelligence infinite module feed |
| **REBUILD** | Decisions: dense table (Decision · Location · Expected · Confidence · State). Intelligence: ranked findings + selected analysis + right evidence rail. Value/Memory: charts + proof, fewer paragraphs |
| **DATA** | Existing decision / value / memory / intel composers |
| **INTERACTIONS** | Row select · Review Decision · pin / promote |

---

### 13 — Connections / Data Health / Locations / Dashboards

| Field | Value |
| --- | --- |
| **REFERENCE** | No hero mockup — derive from Settings / Reports / CFO table grammar |
| **IMPLEMENTATION** | `/app/connections` · `/app/data-health` · `/app/locations` · `/app/dashboards` |
| **CURRENT** | matching files under `visual/current/` |
| **PRESERVE** | Connection catalog · health rows · location economics · dashboards store |
| **REMOVE** | Pre-vision chrome leftovers |
| **REBUILD** | Same tokens · density · tables · status chips as Reports/Settings |
| **DATA** | Existing product composers |
| **INTERACTIONS** | Existing deep links |

---

## Shell acceptance (Phase A)

- [ ] One `AppSidebar` config on every `/app/*` route (except enter/lab)
- [ ] One top bar (`GlobalOperatingHeader`) — no second nav
- [ ] Canonical primary items match Settings mockup list
- [ ] Dropdowns opaque / correct z-index
- [ ] Editorial display available via tokens; shell itself matches mockup density
- [ ] Screenshot matrix shows identical left rail across GM Center, Live, Operations, Settings

---

## Visual QA board

Dev-only: `/app/design-review` — REFERENCE vs IMPLEMENTATION pairs for phases B+.

---

## Anti-patterns (do not repeat)

- Restyling in place without matching silhouette
- Parallel shells / nav generations
- “Inspiration” deviation from attached artboards
- Shipping 14 screens before each passes side-by-side review
