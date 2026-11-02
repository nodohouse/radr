# Product-wide Control Center design rollout

2 November 2026. The user explicitly approved extending the Control Center's visual system and decision-first product structure to Live, Decisions, Operations, Back of House, Intelligence, Value, Memory, Data Health, Connections and the settings reached from the avatar.

## Shared material and reading order

`app/radr-workspace-system.css` is the shared rollout layer after the existing Control Center material and opaque navigation styles. It applies the same blue/green canvas, Manrope typography, glass panel fills, defined edges, restrained shadows, green action treatment, readable metadata and segmented controls. Engine-specific settings, back-of-house, hotel operations and connection tokens inherit this palette. The Control Center's existing composition and approved brand geometry remain intact.

Every primary section begins with its purpose, a compact focus, supporting evidence or trust context, and a route to the next step. `WorkspaceFocus` uses the same canonical records, location selection, role scope and priority order as the Control Center. The scope hook was extracted unchanged into `useDecisionScope`; the original export remains available. No new totals, rankings, financial models, source-health scores or integration writes were introduced.

| Section | Focus and next step |
| --- | --- |
| Live | Current service/arrival decision beside its impact, with a compact strip that leaves room for the actual floor or room view. |
| Decisions | The first record in the current filtered/sorted view; the focus follows status, lens and search. |
| Operations | Readiness and capacity constraints, then the relevant scoped decision and prepared response. |
| Back of House | Stock/supplier evidence and the matching scoped decision; captures remain observations to review. |
| Intelligence | The selected signal's linked decision. Changing a signal or lens updates the focus rather than retaining an unrelated priority. |
| Value | A scoped recorded outcome and its canonical metric. Expected and verified amounts remain distinct; negative verified values retain a red treatment. |
| Memory | Outcome-linked evidence and operating lessons, with supporting and contradicting observations preserved. |
| Data Health | Source quality before approval, with source-cohort scope kept distinct from Decision scope. |
| Connections | Evidence coverage and source limits, then a route to quality review. Hotel integration options remain unmeasured rather than claiming live connections. |
| Settings | Organization, access and decision guardrails; local preference saving is explicitly labelled on this device. |

The avatar still opens the real settings engine. Its section navigation, editable preferences, policies, autonomy, audit and demo-persona controls remain available. Persona buttons now retain their button semantics inside a labelled group, fixing invalid pressed-state ARIA.

## Readability and responsive corrections

Small pale text in decision status, evidence, pressure, source quality and hotel integration labels now uses the shared readable secondary colour and larger type. Amber/red/green statuses retain distinct semantic meanings with readable foregrounds. The hotel arrival chart has an accessible name.

A phone-specific hotel Live defect was found during review: the fixed-height twin could collapse the room map while metrics extended past the screen. At narrow widths the view now scrolls vertically, metrics wrap, the map retains 430px height, and the inspector follows the map. The existing floor gestures, guest context and plan-editing destination remain unchanged. Phone focus panels omit the longer explanatory note to keep the important action closer to the operating content.

## Validation

- Eleven browser regression checks passed: settings entry/persistence, filtered focus links, restaurant/hotel route matrix, attention brief, compactness and opaque navigation. The focused four-check workspace suite was rerun after the final phone refinement, including assertions for the visible room-map height and metric bounds.
- Twenty WCAG A/AA Axe scans across ten restaurant and ten hotel section combinations have zero violations after targeted fixes. Both worlds have zero horizontal document overflow at 390px. Scrollable floor/source collections remain intentionally scrollable within their own containers.
- The configured `tsconfig.app.json` type check, targeted ESLint and whitespace checks pass.
- The demo's financial values, decision confidence, record IDs, evidence chain, status transitions, approval requirements and provider boundaries are preserved.
- Local browser verification and native Vercel deployment build status are the verification boundaries. The environment's outbound policy prevents direct browser access to Vercel previews.

## Review captures

[Settings](visual-qa/workspace/restaurant-settings.jpg) · [Live](visual-qa/workspace/restaurant-live.jpg) · [Decisions](visual-qa/workspace/restaurant-decisions.jpg) · [Operations](visual-qa/workspace/restaurant-service.jpg) · [Back of House](visual-qa/workspace/restaurant-house.jpg) · [Intelligence](visual-qa/workspace/restaurant-intelligence.jpg) · [Value](visual-qa/workspace/restaurant-value.jpg) · [Memory](visual-qa/workspace/restaurant-memory.jpg) · [Data Health](visual-qa/workspace/restaurant-data-health.jpg) · [Connections](visual-qa/workspace/restaurant-connections.jpg)

[Hotel Live](visual-qa/workspace/hotel-live.jpg) · [Hotel Operations](visual-qa/workspace/hotel-service.jpg) · [Hotel Connections](visual-qa/workspace/hotel-connections.jpg) · [Hotel phone view](visual-qa/workspace/hotel-live-phone.jpg)
