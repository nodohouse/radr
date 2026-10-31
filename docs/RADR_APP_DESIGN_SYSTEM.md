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

The desktop rail has exactly eight primary destinations: Control Center, Live, Decisions, Operations, Intelligence, Value, Memory, Data Health. Icons use the shared 20-unit outline SVG family at 18px. Selection uses vibrant green with navy text against a solid deep blue rail. No gradient rail or glow.

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
