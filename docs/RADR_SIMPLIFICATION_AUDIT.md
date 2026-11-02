# RADR simplification audit

Date: 2026-11-02. Scope: existing product, no new product modules or integrations.

## Review sequence and gates

All screenshots are 1512×982. Before editing, captured Control Center, Decisions and Value as density references, plus all three target surfaces. Reviewed Back of House before starting Connections; reviewed Connections before starting Live detail. Each gate passed with summary metrics and urgency separated from evidence. Final review repeats the ten-page comparison after the shared light-color correction. The benchmark layouts and workflows remain intact.

[Ten-page contact sheet](qa/simplification/RADR-contact-sheet.png) · [Before/after comparison](qa/simplification/RADR-before-after.png)

| Surface | Before | After | Gate finding |
| --- | --- | --- | --- |
| Back of House | [Before](qa/simplification/boh-before.png) | [After](qa/simplification/boh-after.png) | Three metrics, one attention surface; no first-view stock table or capture hero. |
| Connections | [Before](qa/simplification/connections-before.png) | [After](qa/simplification/connections-after.png) | Four metrics, one coverage panel and concise issues; catalog absent from default. |
| Live detail | [Before](qa/simplification/live-before.png) | [After](qa/simplification/live-detail-after.png) | Click opens one focused drawer; critical facts before four secondary tabs. |

## What moved and why

### Back of House

- Removed the capture-app introduction, capture feed, full inventory table, parallel prep detail and historical outcome cards from the first view.
- Retained the underlying camera/voice/note capture evidence, confirmation/correction paths, stock, action alternatives, prep, deliveries and waste views.
- Stock is now six columns: item with state, on hand, par, runout risk, supplier and action. Further operational detail remains in item evidence and existing prep/delivery views.
- Existing supplier contacts have their own secondary view. Existing verifications have a separate History view showing requested, arrived, restored, expected, observed, verified and disruption. Historical restoration is never shown as resolution of today's unresolved shortage.
- Default risk and exception counts derive from current stock/delivery rows, not duplicated headline literals. Readiness derives from prep quantities or the existing readiness record.
- Current Decision links use the actual gap Decision ID, including the hotel readiness Decision. Captures and stock evidence remain reachable independently of approval.
- Fixed legacy Berlin/Canal House labels and euro glyphs in these New York demo fixtures and their detailed BOH views. Legacy internal `*Euro` field names remain for compatibility; displayed amounts are native USD, not an undisclosed FX conversion.

### Connections

- Removed the full provider catalog, filters, wide technical table, coverage donut and multiple unlock panels from the default viewport.
- Coverage overview now groups POS, reservations, labor, finance, procurement and PMS applicability. Each group explains its operating impact and opens source evidence or relevant catalog options.
- System evidence and Browse integrations retain the existing detailed provider table, menus, dependencies, filters, search, catalog and demo setup workflow. No provider write or sync was added.
- Connected and issue counts now derive from the model rows; availability derives from actual catalog status. Eight connected sources include six healthy sources and two with recorded issues; these are not eight healthy sources.
- The existing 84% coverage is explicitly a modeled demo coverage measure, separate from Data Health's 78/100 mean evidence confidence over five reviewed sources. Their denominators and meanings differ.
- Hotel source checks remain unrecorded. Hotel integration options are collapsed on Connections, while the embedded Data Health catalog stays open. Available providers never become fabricated connected-source claims.

### Live

- Removed the permanently open guest/order/timeline inspector from the default operating overview. The read-only floor stays the primary operating visual; urgent pressure appears before it.
- Table click or keyboard activation opens a native modal drawer. Native focus containment, Escape dismissal and focus restoration keep background interaction separate from table detail.
- Status, seated duration, current course, check total, reported allergies, booking occasion/access needs, next reservation and next action remain immediate.
- Guest contains relationship and disclosed preferences; Order contains course/status/elapsed risk and an explicitly requested itemized list; Timeline contains previous/current/next service and turnover estimates; Notes contains source-bound current/incoming booking evidence.
- Missing allergies remain “not recorded,” never “none.” Current Sesame and incoming Peanuts records stay separate. Incoming birthday/access needs remain tied to the next booking.
- Floor markers remain visible without opening the drawer. Drag, touch pan and pinch/wheel zoom still change the camera only. Floor editing remains a separate route.
- Hotel room overview is now a compact stay/risk brief; full guest evidence and chronological stay history remain in existing tabs. Room tab keyboard navigation was added without changing room models.

## Shared presentation

Warm ivory base, pale blue-gray navigation, mint selection, navy text, thin separators, restrained shadow, green Decision action and analytical blue evidence. The approved immutable logo asset uses its light-background variant. No logo geometry, typography asset, navigation destinations, finance model or benchmark page composition changed. There is no generic Control Center breadcrumb on unrelated routes; the home document title is intentionally Control Center and other document titles use their page identity.

## Canonical Decision trace

Fresh-session source of truth: `getDecisionRecord("dec_peak_berlin")`, displayed D-1911, Peak capacity collision, Soho · New York (`loc_berlin_mitte` is a retained internal alias). Lifecycle `AWAITING_APPROVAL`, displayed Recommended/Needs you depending on attention context. User-facing confidence MEDIUM. `primaryMetricOf` returns USD 620 expected incremental contribution, tonight's dinner service, versus seat-now. No observed or verified outcome is recorded in the current Decision. The canonical fixture's historical scenario numbers are not current verified value.

| Surface | Trace result |
| --- | --- |
| Control Center | D-1911, Soho · New York, $620 expected incremental contribution; hold next seating wave 12 minutes; awaiting judgment. |
| Live | Same Soho operating snapshot and capacity pressure. Default floor does not independently restate D-1911 economics or confidence; table needs/checks are separate records. |
| Decisions | D-1911 card and record detail share $620, MEDIUM confidence, Recommended status, 19:59 deadline and the same action. No euro amount or verified claim. |
| Operations | Same service operating model and capacity response. No separate D-1911 monetary/confidence override is rendered. |
| Back of House | Current shortage is D-8204, not D-1911. D-1911 is not relabeled as a stock Decision. Historical stock verification remains separate. |
| Intelligence | Existing mapped Terrace conversion signal links to D-1911; selected detail derives its title, location, state, recommendation and MEDIUM confidence from that Decision. Signal category is not a second Decision title. |
| Value | Under All records, D-1911 shows $620 expected, Observed not recorded, Verified pending / Not Verified. It is absent from the default verified-only ledger. |
| Memory | Existing Friday peak playbook links to D-1911 as a comparable-service learning reference. Historical association and samples do not verify the current awaiting-approval Decision. No competing D-1911 monetary outcome is rendered. |
| Data Health | Deliverect's mapped Decision dependency is D-1911. Source health/confidence is separate from Decision confidence and does not change its value, currency or approval state. |

No euro symbol appears in the visible default main content of any of the ten reviewed New York routes. The D-1911 detail has no euro symbol. Removed the peak fixture’s stale “coverage High / freshness Good” prose so it no longer contradicts its current MEDIUM source bands. No page-specific D-1911 monetary or confidence constant was introduced.

## Verification

TypeScript and targeted ESLint checks run against the edited surfaces. Browser regression coverage includes benchmark Control Center, source-health remediation, restaurant/hotel source isolation, guest booking markers, current/incoming allergy separation, mouse/touch pan and zoom, keyboard tabs, drawer dismissal/focus restoration, BOH secondary views, integration browsing/search, core analysis/ledger/memory workflows and phone-width checks. Screenshots are captured with Chromium at the required resolution. All external execution and connected-provider activity remain explicitly illustrative demo behavior.
