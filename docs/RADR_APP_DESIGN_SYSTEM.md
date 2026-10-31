# RADR app design system

Status: phase 1 implemented for review. Control Center approval is the gate before composing the remaining app pages. This document follows the user-supplied RADR master product, design and implementation brief of 30 October 2026.

## Product foundation

RADR is hospitality operating intelligence above existing systems of record. Metrics provide context; Decisions are the product; verified outcomes provide proof; memory retains the learning. Every surface must lead to its one job:

| Surface | Question |
| --- | --- |
| Control Center | What needs me? |
| Live | What is happening now? |
| Decisions | What should we do? |
| Operations | Can we run today? |
| Intelligence | Why is this happening? |
| Value | Did it work? |
| Memory | What have we learned? |
| Data Health | Can RADR trust the inputs? |

Personas are lenses over shared records. Restaurant and hotel contexts use the same architecture but distinct operating grammar and economics. Never substitute restaurant service metrics for hotel readiness data.

## Visual authority

The eight clean light images in `RADR_backend_mockups.zip` define composition. Read the UI inside the pictured tablet, not the device frame or its blue background, as the product reference. Older dark compositions are not the final direction. The latest palette and navigation request applies the landing page’s blue and vibrant green to this light product composition.

Approved immutable logo masters are rendered through `FrozenRadrLogo`; `ProductBrand` is the shared product wrapper. The light master includes its approved green focal dot. Never redraw artwork, adjust the dot, type a replacement wordmark, or size its height independently.

## Tokens and compatibility

`app/radr-app-system.css` is the current app shell and shared component design contract. Tokens use `--app-*` names. Existing native detail engines still depend on legacy stylesheets; they remain compatibility code until their scheduled migration. Do not create another page-specific theme or append an independent palette. Move repeated presentation into the shared primitives and these tokens.

| Token | Value | Use |
| --- | --- | --- |
| `--app-bg` | `#f3f7ff` | Landing-page paper canvas |
| `--app-nav` | `#0a2564` | Deep blue navigation |
| `--app-surface` | `#ffffff` | Cards and product surfaces |
| `--app-ink` | `#091d49` | Primary navy typography |
| `--app-muted` | `#526582` | Supporting copy |
| `--app-quiet` | `#5c717e` | Metadata |
| `--app-border` | `#d9e5fb` | Cool blue borders |
| `--app-green` | `#08794f` | Accessible healthy text |
| `--app-signal` | `#00ed87` | Vibrant green fills with navy text |
| `--app-mint` | `#e4fff2` | Healthy field |
| `--app-blue` | `#1755ed` | Landing-page blue, analytical context |
| `--app-amber` | `#8e5f1a` | Watch, stale, degraded |
| `--app-red` | `#a54444` | Material urgent risk only |

The landing palette is sourced from the current marketing `vibrant.css`. Neon green is an accent fill, not small text on white. Shared legacy engines and portalled Ask controls inherit the same palette.

## Navigation and top bar

The desktop rail has nine primary destinations: Control Center, Live, Decisions, Operations, Back of House, Intelligence, Value, Memory, Data Health. Icons use the shared 20-unit outline SVG family at 18px. Selection uses vibrant green with navy text against a solid deep blue rail. No gradient rail or glow.

On fine pointers at 1100px and above the rail rests at 80px and expands to 248px on hover or keyboard focus, overlaying content without shifting it. Leaving the rail retracts it; keyboard focus holds it open. Escape closes supporting menus, releases the pin and returns focus to main content. The optional pin reserves 248px in the layout. Width transitions last 220ms and labels 150ms; reduced motion disables them. Coarse pointers retain a full 232px rail. Tablet and phone keep their drawer and dismissing scrim.

Use only the standalone approved symbol at 44px, with compact 18px top spacing. The dark-background approved variant retains its green focal dot. Logo masters remain immutable.

The compact organization selector exposes supporting areas. The footer shows actual available source health, never a fictitious all-connected status. Hotel coverage without a health snapshot links to evidence health without assigning restaurant scores.

Top bar: local object search, location/estate context, persona lens, Ask RADR and profile. Dates are contextual. The Control Center does not display a live clock or an unrelated period switch while its verified chart is month to date. Remove controls without meaningful behavior: the old notification bell opened Ask and has been replaced by an explicitly labeled Ask RADR action.

Search and Ask are distinct. Search indexes scoped Decisions, signals, Memory, organization locations and app destinations; Cmd/Ctrl+K opens it. Ask RADR provides questions and answers; Cmd/Ctrl+J opens it. Search uses a native modal with Escape, keyboard containment and focus restoration. The list is a bounded local index, not a claim of backend-wide enterprise search.

## Grid and spacing

Desktop acceptance viewport: **1512 × 982**. Canvas content is at most 1200px wide, centered with 44px horizontal padding. Use a 4px spacing base; common steps are 8, 12, 16, 24, 32, 40 and 48px. Card groups have 18px gutters and page sections 24px separation. Default first viewport: two to four metrics, one main visual and one attention panel.

Control Center: heading, three summary cards, then a 1.55:1 chart/action grid. No full-width dark hero, second decision queue, extra evidence table or decorative operating visualization. Evidence stays inside the selected Decision. The primary Decision follows the existing role priority ordering, not whichever example has the largest number.

## Typography

One family: Manrope, inherited from the app layout. Heading 38px/1.17 with moderate negative tracking and weight 550; metric 44px, tabular figures; normal copy 14px; supporting metadata 11–12px; small labels 10px. Avoid using uppercase metadata as long body copy. No monospace financial-terminal aesthetic.

At tablet widths, headings reduce to 32px and metrics to 38px. On phones headings are 29px. Never compress long operational copy into illegible tiny text to preserve a desktop grid.

## Shared primitives and card hierarchy

`ReferenceUI.tsx` provides Heading, Metric, Panel, StatusPill, TextLink and Chart; `ProductShell` provides the application frame. Reuse these when migrating subsequent surfaces. Keep data derivation outside presentation.

Small controls: 9px radius. Cards: 14px. Large surfaces: 18px. All use thin 1px cool borders. Cards are white with almost no shadow. Only a temporary overlay may use a restrained separation shadow. Depth comes from spacing and hierarchy, not gradients and lighting effects.

Each metric has one number, one label, one short qualifier and at most one destination. A card may be a single link; never nest buttons or links inside a card link.

StatusPill tones are neutral, attention, healthy, watch and risk. Text accompanies color, and decorative status dots are hidden from assistive technology. Green does not make an expected value verified.

## Charts and evidence semantics

Charts and icons are native SVG, never raster mockup screenshots. An electric blue line with pale green fill, green bars and subtle grid lines is the default. Labels represent actual model periods. Cumulative events on the same date use that date's final cumulative value once. Empty scopes show an honest empty state, not invented history.

Expected, observed and verified are distinct states. Control Center shows expected value awaiting verification separately from verified contribution month to date. The chart and card must reconcile with the same selected record set. The top Decision uses its own evidence-backed primary metric and confidence; mockup example amounts never override the record store.

Observed is shown only when an observation exists. A future Value migration must show pending/partial observation explicitly rather than converting expected to observed or verified. Financial values need currency, horizon and scope. Demo results remain illustrative; show `ILLUSTRATIVE DEMO` once in the shell. No external writes are implied.

Autonomy is action-specific. Confidence, Data Health and policy govern available actions. Data degradation can require approval or block execution. Never label RADR globally as an autonomy level or bypass an approval path for appearance.

## Motion and accessibility

Motion lasts 150–300ms: tint, opacity, or at most 2–4px translation. No bounce, glow or gratuitous animation. Respect reduced motion. Use semantic links for navigation and buttons for state, visible focus, sufficient color contrast, accessible dialog names and clear empty states. The page owns its heading; the top bar must not introduce a second H1.

## Responsive rules

1100px and above: persistent left rail. 960–1099px: drawer navigation. Under 960px: phone bottom navigation with the full rail in a sheet. Below 701px: stack overview cards and chart/action sections. Keep Decision status and next action prominent; do not squeeze the desktop workspace into the phone. Portalled dialogs use explicit colors and fonts rather than unresolved shell-scoped CSS variables.

## Acceptance and staged rollout

1. Implement shell, sidebar, top bar, shared cards, Control Center.
2. Render at 1512 × 982 and compare with `radr_control_center_dashboard.png`: spacing, card size, type, hierarchy, borders, density, alignment.
3. Check 1024px tablet and 390px phone, keyboard flow, search, scope selection and record navigation. Confirm numbers remain scoped and expected/verified remain separate.
4. Present the concrete Control Center preview for approval, as required by section 53 of the master brief.
5. After approval, migrate Live, Decisions, Operations, Intelligence, Value, Memory and Data Health in that order. Render and record the same comparison for each page before moving on.

Phase 1 does not certify all legacy engines as production-ready. Existing product rules remain authoritative; this pass does not add live integrations, claim real customers, or enable external execution.

### Phase 1 reference comparison

Compared the native Control Center at 1512 × 982 with the UI inside `radr_control_center_dashboard.png`. The tablet shell and example financial figures are deliberately excluded from implementation.

| Dimension | Implemented comparison |
| --- | --- |
| Spacing | Heading above one three-card row, followed by the chart/action row; 18px horizontal gutters and 24px section gaps |
| Card size | Three equal metric columns; chart/action split 1.55:1; all primary content fits the 982px desktop viewport |
| Type | Human heading, prominent tabular amounts, secondary labels, restrained metadata; one family |
| Hierarchy | Needs attention, expected awaiting verification, verified contribution; one top Decision |
| Border | Thin neutral cool 1px border, 14px card corners; no permanent card shadows |
| Density | Five primary cards total; removed the dark full-width feature block, evidence column, second queue and duplicated value headline |
| Alignment | Shared left edge for heading, cards and chart; solid 232px left navigation with eight destinations |

A second stable browser pass reported zero page errors and zero horizontal overflow at 1512px, 1024px and 390px. Object search located D-1911 and Ask RADR opened separately at each width. Application type checking and 35 focused product/scope tests passed. This is an implemented preview awaiting Control Center visual approval, not a declaration that later page migrations are complete.

Small-label contrast check: the quiet text token is 5.10:1 on white and 4.64:1 on the pale navigation surface. Action green is 4.81:1 on white. Chart labels use the same quiet token instead of the older low-contrast hardcoded gray. This token check does not certify every legacy page for accessibility.

## Product consistency contract (31 October 2026)

The Decision store remains the only writable demo dataset. Canonical scenario definitions seed its Decision records. Do not create an independent `demoData` store or duplicate headline numbers in components. The canonical demo-data layer consists of existing estate/Decision/source registries plus these shared derived selectors:

- `decisionSummary(records)`: one disjoint partition for cards and filters. All = needs judgment + in motion + resolved + watching. Resolved includes learned/closed and zero-value outcomes; it is not a synonym for positive verified value.
- `moneyContext(records, role)`: local operator amounts remain in source currency. Group/finance views use USD reporting and identify other source currencies plus illustrative FX. Rates come only from the estate registry. Convert and round each record once, then sum the same amounts in cards, categories and charts.
- `currencyForRecord(record)`: inherit the canonical venue currency; explicit group or legacy European cases carry source denomination on the record. Correcting New York fixtures from legacy EUR labels to USD is a fixture migration, not a claimed 1:1 FX conversion.
- `deriveValueAggregate` / `buildValueOverview` / `buildVerifiedValueTrend`: same scoped records and currency context. Show the complete category breakdown, or explicitly reconcile a remainder; never silently omit categories. Do not fabricate a trend when a scope has no verified outcomes.
- `applyDecisionEvidenceHealth`: active recommendations using required degraded sources have capped data/decision confidence and require human approval. Required stale sources limit preparation. Historical sealed verified outcomes retain their evidence-backed result. Do not invent before/after confidence percentages or upgrade freshness labels independently.

Expected, observed and verified remain separate. Preparing a table intervention does not verify an outcome. The old service-detail timer that declared verification after 4.8 seconds is removed; review/preparation waits for evidence and makes no external writes.

Page titles are server metadata derived from the route, including canonical Decision IDs. Control Center is not the label for Live, Value or other pages. Show temporal controls only when the report actually responds to them; fixed demo snapshots and month-to-date charts must not expose a misleading date selector.

On phones the Control Center priority Decision and next action precede financial context and the chart. Desktop stays three metrics, one proof chart and one top Decision.

The section-44 approval gate remains active. Later page composition changes require the Control Center direction to be approved; shared data corrections are not a claim that later density issues have been redesigned.


Ask uses the same current record truth: pending recovery is not historical verified recovery, and its month ledger is the scoped Value aggregate. The public demo's existing server authorization is limited to Soho; unsupported UI scopes receive a clear availability response instead of a silently substituted location. LIVE server tenancy and permissions remain authoritative.

Ask labels its response-quality score as **Answer confidence**. It is not the selected Decision’s confidence or verification state. Never substitute that answer score for the record-level confidence shown in Decisions.

## Landing palette and navigation verification (31 October 2026)

The user explicitly requested landing-page colors and expanding navigation. Browser checks passed for idle 80px, expanded 248px, retraction, pin/unpin, keyboard focus and Escape. Hover does not shift content. Tablet 1024px, phone 390px and coarse-pointer desktop checks passed without horizontal overflow or browser page errors. Exact blue and green computed values match the landing palette. Application TypeScript, targeted navigation/chart ESLint and diff whitespace checks passed. Financial derivation and record state are unchanged; the full business test suite was not rerun for this presentation change.

## Live venue explorer (31 October 2026)

The user explicitly authorized an interactive spatial redesign of Live. Its first main surface is the existing operating floor, presented with CSS perspective, raised table surfaces and blue/green brand colors. Four zone selectors retain canonical demo table positions, statuses and evidence. Clicking a table focuses the camera and updates the existing inspector. Camera controls provide bounded 75–200% zoom, rotation, top view and reset. Native buttons support keyboard and touch; reduced motion removes camera transitions. This is a schematic perspective model, not a surveyed building or new telemetry. The compact shared preview keeps its original presentation.

TypeScript and targeted ESLint passed. Chromium checks confirmed table selection, zoom, rotation, top view, reset, and no phone horizontal overflow or page errors. This presentation change does not alter financial records, approval rules, source health or integrations.

Back of House is a primary navigation destination beside Operations, per the user’s explicit request. It uses the existing house icon and `/app/house` route, with active selection on its subroutes. It is removed from the supporting workspace menu; mobile BOH access remains available.

## Whole-product consistency pass (31 October 2026)

The user explicitly requested improvements across every navigation section, including supporting workspace destinations. This authorizes the shared and section-level changes in this pass. The existing record stores, approval paths, source-health logic and scoped financial calculations remain authoritative.

All entry points now share `Heading` from `ReferenceUI`: the existing navigation icon, section label, one H1, contextual description and optional real action. Connections, Locations, Guests, Dashboards, Settings, Back of House and hotel Operations use this same component rather than private heading styles. The frozen logo and compact rail spacing are unchanged.

Shared cards use 18px corners, blue borders and restrained depth. Verified-value cards use a navy-to-blue surface, white amounts and green evidence links. Intelligence gives the selected insight a distinct blue surface and exposes selection to assistive technology. Charts use a restrained gradient, native SVG points and deterministic accessible point titles. Legacy overview CSS is wrapped in `:where` so it no longer outranks the authoritative shared system or produces white text on a white feature card.

All native detail engines inherit the same Manrope font, ink, blue actions, accessible green text, borders and surface tokens. This includes BOH, Guests, Connections, Dashboards, Settings, Locations, Value, Memory, Intelligence, Data Health, hotel Live and House Readiness. Semantic risk colors remain distinct.

Back of House introduces the user's staff-app capture workflow: Capture, Review, Act. The capture action opens the real existing evidence feed. The interface explicitly says the staff-app connection is planned; it does not claim video interpretation, transcription, inventory updates or an active device connection. The restaurant and hotel variants use different operating copy.

Phone metrics form compact two-column groups; odd final summaries span both columns. Redundant top-bar page titles are hidden on phones. Wide evidence tables scroll inside their own containers; Guest panels have explicit minimum-width containment. Visible keyboard focus and reduced-motion behavior are retained.

Validation: application TypeScript, targeted ESLint and diff whitespace checks passed. The corrected desktop route sweep covered all 14 navigation destinations with one main heading each, no page errors and no page overflow. Phone and tablet sweeps checked the same destinations. Interaction checks covered decision search/status reset, Intelligence selection, BOH captures/stock, Settings sections and verified-card presence. Hotel checks covered Operations, BOH, Guests and the existing Live route. A chart hydration issue and feature-card contrast conflict were found during review and corrected before publishing. No new business logic or external integration was introduced; the full business test suite was not rerun for this presentation pass.

## Control Center arrival brief (31 October 2026)

The user's latest request explicitly replaces the earlier five-card Control Center composition. The entry page must communicate the important operating picture on first arrival, while keeping Decisions as the primary product. This section is the current Control Center composition authority; the earlier phase-one density restriction does not apply to this authorized rebuild.

The arrival hierarchy is: scoped greeting and attention summary; one visually dominant priority Decision beside service/arrival readiness; judgment and economic summary; six operating-coverage cards; estate attention when multiple contexts have active decisions; remaining judgment queue and work in motion; verified proof, watching and priority evidence; operating memory. The priority Decision uses the existing role ordering, never an independently ranked example. Its action opens the real Decision record and makes no external write. The no-action consequence, confidence, primary metric, deadline and evidence come from that record.

Restaurant readiness uses the existing Soho service snapshot: revenue and contribution today, covers, occupancy, kitchen load and labor ratio. Hotel readiness uses canonical property performance and the same House Readiness model as Operations: occupancy, ADR, RevPAR, rooms ready/due, arrivals and inspection backlog. Snapshot currency comes from the estate registry. These are explicitly named, timestamped demo venue snapshots. They appear only when the selected scope contains that venue. All-location/comparison views label the snapshot as featured-venue context rather than estate totals. Unsupported scopes show an availability state instead of substituting Soho or Mercer House.

Financial summary uses the existing `deriveValueAggregate` and `buildValueOverview`: needs-judgment count, active exposure with mixed horizons identified, expected in-motion value awaiting verification, and evidence-linked verified contribution month to date. Active value creation is disclosed on the judgment summary when present. The proof chart uses the same cumulative verified series as Value. No new monetary rollup or FX logic is introduced.

Operating coverage organizes active decision titles, types and economic lenses into service/rooms, labor/housekeeping, stock/supplies, guest experience and revenue/distribution. One Decision can touch multiple areas; the UI says so. Zero active records never means a confirmed healthy operating area. The sixth card counts scoped evidence references and flags active records with low data confidence or stale, missing or unknown evidence. It does not fabricate a hotel source-health score or replace Data Health. Estate attention counts active and needs-judgment records by canonical location/context, with no invented location performance scores.

A navy-to-blue priority surface, green primary action, white readiness surface and restrained economic band establish visual hierarchy. Cards below support exploration without competing with the next Decision. Restaurant, hotel, unsupported-scope and portfolio paths retain the same shared navigation and type system. The mobile document order leads with the priority Decision before financial summaries.

Validation: application TypeScript, targeted Control Center ESLint and whitespace checks pass. Chromium checks cover 1512px desktop, 1024px tablet and 390px phone; all have one main heading, six coverage cards, no page errors and no horizontal page overflow. The priority action opens its record. Verified contribution reconciles with Value. Unsupported location selection hides the featured readiness facts. Hotel performance/readiness and CFO portfolio attention paths were checked separately. This presentation rebuild does not change financial records, state transitions, source integrations or approval rules.

## Glass surface treatment (31 October 2026)

The user explicitly authorized the queued glass-panel pass. Shared light dashboard surfaces use translucent white gradients, a fine bright edge, inset highlights and restrained blue-tinted depth over a static blue/green canvas. Control Center priority and verified-value surfaces retain their dark blue hierarchy and readable green accents. The navigation, logo, typography, layout, financial semantics, scope and approval behavior are unchanged.

The shared system covers overview cards and native BOH, Guests, Connections, Dashboards, Locations and Settings panels. Inner panels do not stack blur filters. Desktop blur is 16px; phone surfaces are more opaque with 8px blur. The operating header is frosted separately. Unsupported browsers use opaque white panels, while reduced-transparency preferences disable panel blur. No continuous animation or pointer-following effect is added.

Glass verification: Chromium checked Control Center, Intelligence, Value, BOH, Connections and Settings at 1512px, 1024px and 390px (18 route/viewport combinations), with no page errors or horizontal page overflow. Computed styles confirmed 8px phone blur and an opaque white, unblurred panel when reduced transparency is emulated. A final Control Center pass checked the ambient canvas behind the transparent frame, desktop/tablet/phone blur and keyboard focus on the priority action. This CSS-only pass changes no component behavior or financial calculation.

## Spatial layout studio (31 October 2026)

The user requested a floor-plan editor under Live, restaurant drag-and-drop, generated hotel levels/rooms, plan uploads and direct spatial gestures with few camera buttons. `/app/live/plan` is the shared editor for both verticals. The navigation reads Live & floor plan. Restaurant Live links to Build your floor plan; hotel Live links to Build your property. The editor is a normal scrollable app page rather than an immersive Live container.

The editor renders real WebGL geometry through a client-only, dynamically imported React Three Fiber scene. Restaurants start from a schematic dining-room template and can place tables, counters, storage and walls. Hotels generate an exact requested room count across 1–20 levels with a central corridor and at most 60 rooms per level/500 objects total. Users can add levels, select one level or the whole building, rename objects, edit positions/dimensions and drag objects on the floor plane. Level footprints are stable, explicit dimensions so tracing references do not stretch when furniture moves. Geometry is schematic until checked against measured plans.

Interaction: drag background to orbit, right-drag to pan, wheel/pinch to zoom, hover for context, click to select and inspect, and click a slab to enter a level. Clicking an object in view mode focuses the camera. Fit view is the only persistent camera button. A focused viewport also supports +/- zoom and 0 to fit. Edit mode exposes a small drag/tap palette and a keyboard-accessible object picker and dimension fields. Undo retains 20 geometry edits, including a full drag gesture as one undo, and supports Cmd/Ctrl+Z outside text fields.

CSV and versioned JSON generate positioned geometry after validation. CSV columns are floor, kind, label, x, z, width, depth. JSON exports preserve level dimensions, object geometry and labels. PNG/JPG/WebP can be placed as temporary tracing references; there is no claim of automatic room/wall reconstruction from images or PDFs. Upload limits are 10 MB, image dimensions 4096×4096, 20 levels and 500 objects. Invalid imports leave the current draft intact. Reference images are browser-local object URLs and are not included in saved/exported JSON.

Drafts save in browser storage under organization and scope. This is device/browser-local persistence, not shared team storage or a live PMS/POS floor-plan write. JSON export/import provides manual sharing. Geometry drafts do not change Decision records, room readiness, inventory, financial values or operating evidence. WebGL failures fall back to a usable SVG top view with object selection and position editing. Rendering is demand-driven, DPR is capped at 1.5, labels appear only on hover/selection, and there is no idle animation.

Validation: 16 focused parser/generator tests cover exact uneven room distribution, schema round trips, malformed CSV, unknown kinds, duplicate IDs, invalid sizes, limits and exclusion of operating state. Application TypeScript and targeted ESLint pass. Chromium checks confirm actual mesh dragging, native palette drop, undo, wheel zoom, touch pinch, hotel generation, room editing, persistence after reload, CSV import, image tracing, rejected-import preservation, JSON export and keyboard object selection. Desktop, 1024px and 390px layouts have no page overflow. WebGL-disabled Chromium retains the top-view editor. Final browser flows reported no page errors.

### Spatial editor visual refinement

Following the user's report of overlaps and poor visual finish, the editor now reserves separate bands for instructions and camera controls outside the 3D canvas. The inspector uses document scrolling rather than an independently clipped 650px scroller. On desktop the model remains in view beside the inspector; on narrow screens the inspector sits below it. The object palette collapses after selection. Repeated promotional canvas copy is removed, property labels are larger, the grid is lighter and less dense, and table geometry includes thin tabletops, legs and chairs rather than solid blocks.

World labels have bounded dimensions, a local stacking range and viewport clipping. Only one object context label is shown at a time, preventing selected/hover labels from competing or covering page controls. Browser checks at 1512px, 1024px and 390px confirm instructions end before the canvas, controls start after it, no nested inspector scroll and no horizontal page overflow. A final label-size check prevents narrow vertical wrapping. Drag/drop, undo, wheel zoom, hotel generation and reference upload passed again after the restructuring. TypeScript and targeted ESLint pass.

The editor also reserves layout width when desktop navigation expands, instead of allowing the rail to cover the page heading or workspace. This adjustment is scoped to the editor; reduced-motion preferences disable its width transition.

Camera fitting now includes canvas aspect ratio and refits on viewport changes, avoiding cropped floor plans on phones. The change preserves direct wheel/pinch exploration and object dragging.

### Drag-first floor arrangement

The user's latest direction is Canva-like simplicity. The editor now opens in top-down arrangement mode with the palette already visible. Objects can be dragged immediately; empty-space dragging pans rather than rotating the plan. Scroll/pinch zoom remains available. There is no initial Edit layout step. A single optional 3D preview switch exposes spatial exploration, with Arrange floor returning to the editable level. Hotels start on an editable level rather than an overlapping whole-building plan.

Precision coordinates, dimensions, object lookup, imports and generation are disclosed only when requested. The everyday selection actions are rename, duplicate and remove; Undo is visible in the toolbar. The default instructions are reduced to drag and zoom. Browser checks confirmed immediate palette access, hidden precision fields, direct top-down dragging, duplication and undo, switching between arrangement and 3D, and a phone layout without horizontal overflow or page errors. TypeScript and targeted lint pass. Local draft persistence and the underlying import schema are unchanged.

Tap-to-add places new objects in an available area of the current level instead of stacking them at the canvas centre. Explicit palette drops and dragging remain direct positioning operations.

### Reliable native dragging

After the user reported that both existing-object dragging and palette dragging still failed, arrangement was moved out of WebGL entirely. `PlanCanvas` renders the editable floor as native SVG with DOM pointer capture, larger object hit areas, direct mouse/finger dragging, keyboard arrow nudging, pan, wheel zoom and two-finger pinch. The optional 3D preview remains separate. Editing works with WebGL disabled; there is no non-draggable GPU fallback in the arrangement path.

Palette dragging now uses the same pointer model for mouse and touch rather than browser HTML5 drag-and-drop. A transient drag preview follows the pointer; dropping inside the floor places the object using the SVG screen transform. Dragging near screen edges scrolls the page to help reach the floor on phones. Tapping still adds into an available space. The navigation's Live & floor plan entry opens the actual editor rather than the older read-only Live overview, which remains reachable through Back to Live.

Permanent Playwright regressions in `tests/e2e/layout-drag.spec.ts` verify existing furniture dragging and reload persistence, palette drop and undo, and touch dragging of both existing furniture and new palette objects. All three passed using Chromium with WebGL disabled. Separate browser checks verified wheel/pinch zoom, mobile tap-to-add, and no page errors. TypeScript, targeted ESLint and diff checks pass. Geometry and browser-local persistence semantics remain unchanged.

### Restaurant material visualization

The user requested a more restaurant-like service floor with a high-quality rendered surface. The restaurant editor now uses a generated, top-down oak parquet and honed-stone material beneath its editable objects. The generated master remains outside the repository; the application asset is an optimized 1536×1024 WebP (approximately 325 KB) at `public/layout-materials/restaurant-oak-floor.webp`.

Furniture remains native, individually draggable geometry. Restaurant tables use warm wood, green upholstered chairs, soft depth and decorative plate/linen details, with readable identifiers and unchanged selection outlines. The same floor material and warmer furniture colors appear in optional 3D preview. These are illustrative materials, not a survey or photograph of a real venue. Hotel layouts are unchanged. User-supplied tracing images take priority over the decorative restaurant material.

The material and place-setting layers do not intercept pointer events. TypeScript and targeted lint pass. The three mouse/touch drag regression tests pass with WebGL disabled. Browser checks confirm successful asset loading, no page errors or page overflow at desktop and phone widths, and a rendered 3D preview.

### Live floor direct navigation

The restaurant Live overview reuses the native floor canvas and oak material in read-only mode. Dragging empty space or a table pans the camera, wheel/pinch zooms, and double-click fits the floor. Clicking a table retains its evidence inspector. Keyboard users can select tables with Enter/Space, pan with arrow keys on a table, and use +/−/0 from the floor region to zoom or fit. No camera button toolbar is required. Table geometry and operating evidence remain unchanged; editing remains in the separate floor studio.

Five Chromium regression tests pass: Live mouse pan/zoom/selection/zone switch, Live touch pan/pinch with unchanged table coordinates, and the three existing editor drag/persistence/palette/touch tests. Mobile has no horizontal page overflow. TypeScript and targeted lint pass. This is an illustrative demo snapshot, with no writes to external operating systems.
