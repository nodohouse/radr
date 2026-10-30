# RADR product consistency audit

Baseline captured before UI/data edits for this pass. Reference: latest clean light backend mockups and the final product consistency brief. Date: 31 October 2026.

All 14 routes rendered locally at **1512 × 982**. Captured viewport screenshots, visible text, headings, CTAs, browser title, browser errors and overflow. Inspected the eight-page contact sheet and the six-detail contact sheet. Baseline: no page errors or horizontal overflow in this desktop run.

## Systemic findings

- Every captured route has browser title `RADR · Control Center`. It is a static metadata artifact, not a visible footer on these captured screens.
- Shell contains one subtle illustrative-demo label; do not add one beside every number.
- The estate registry is the source for location currency. Hero legacy IDs represent Soho/Mercer House in New York; older EUR fixtures were not migrated consistently. Correcting their denomination is a demo-fixture migration, not an invented 1:1 FX conversion.
- Decision Records already provide the source dataset. Add shared derived selectors and formatting boundaries, not a second writable demo database.
- Control Center remains the visual approval gate under section 44. Repair shared data truth before changing later page compositions.

## control-center

- Route: `/app`
- Purpose: Brief prioritized work.
- Primary question: What needs me?
- Headline: Your day in focus, Daniel.
- Numbers and Decision counts: 3 needs attention; 1 in progress; 11 total scoped records.
- Monetary labels captured: $184, $3,793, $620
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: 3Decisions need attentionPrioritized for your role and locationSee decisions; $184Expected valueIn progress · awaiting verificationFollow 1 decision; $3,793Verified contributionMonth to date · evidence linkedSee verified outcomes; View value record; Review recommended action
- Hierarchy / visual inconsistencies: First viewport matches clean hierarchy. Expected card covers only in-progress value, so qualifier is essential.
- Data inconsistencies: Primary uses USD620 and medium confidence; deeper representations disagree.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Keep three metrics + one chart + one decision.

## live

- Route: `/app/live`
- Purpose: Show current operating state.
- Primary question: What is happening now?
- Headline: Tonight at a glance.
- Numbers and Decision counts: No decision count; 124 covers, 18 min tickets, 78% occupancy.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: Dining room; Terrace; Bar; Private dining; 14/4; 228m; 34/4; 422m; 5Free; 64/4
- Hierarchy / visual inconsistencies: Large dark floor schematic precedes demand/alerts and dominates default viewport.
- Data inconsistencies: Separate 14 min KDS evidence, 18 min average tickets and 91/92% kitchen snapshots need context, not forced equality.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Move floor to existing detail route after Control Center approval.

## decisions

- Route: `/app/decisions`
- Purpose: Prioritize decision judgment.
- Primary question: What should we do?
- Headline: Know what deserves a yes.
- Numbers and Decision counts: All 11 = needs 3 + in progress 1 + resolved/learned 7 + watching 0.
- Monetary labels captured: $620, $186, $168, $184, $0, $690, $1,590, $610, $280, $273, $350
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: Open detailed workspace; All decisions11; Needs you3; In progress1; Verified7; Watching0
- Hierarchy / visual inconsistencies: Default all shows 11 large rows. Needs-you priority is not the default.
- Data inconsistencies: Verified tab includes learned/closed and zero-value outcomes; label should be Resolved. Counts are duplicated predicates.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: One shared partition selector; reuse existing filtering and prioritize needs judgment.

## operations

- Route: `/app/service`
- Purpose: Check service readiness.
- Primary question: Can we run today?
- Headline: Keep your operation on track.
- Numbers and Decision counts: 5 assigned staff, 4 delayed tables, 92% kitchen load.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: Open service floor; All areas; Kitchen; Floor; Bar; JohnFloorTable 6 follow-uphigh; MariaBar3 drinks queuedbusy; KevinKitchen5 startersbusy; SofiaFloorTables 10–13ok; LenaPassExpedite T8/T2high
- Hierarchy / visual inconsistencies: Schedule/task/issue hierarchy is broadly aligned but lower detail remains dense.
- Data inconsistencies: Native service detail renders EUR despite same Soho context.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Currency fix first; progressive disclosure in next approved visual stage.

## intelligence

- Route: `/app/intelligence`
- Purpose: Explain signals leading to Decisions.
- Primary question: Why is this happening?
- Headline: Signals into decisions.
- Numbers and Decision counts: 4 scoped signals; 4 recommendations; 0 watch risks.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: 4Signals detectedAcross the current demo evidenceView signals; 4Prepared recommendationsReady for closer reviewSee recommendations; 0Signals to watchEvidence or operating riskReview risks; 1Cost movers4 SKUs drifting vs contract93%; 2Menu margin destroyersTruffle pasta · volume +22% · contribution −3.2pp82%; 3Terrace conversionTerrace strong · pace limits 20:10–20:4080%; Explore selected signal
- Hierarchy / visual inconsistencies: Relationship panel is decorative and risk section lacks a clear zero-state.
- Data inconsistencies: 93% finding confidence is not D-1911 decision confidence; must not substitute one for the other.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Retain scoped signals; distinguish finding/decision confidence.

## value

- Route: `/app/value`
- Purpose: Prove economic outcomes.
- Primary question: Did it work?
- Headline: Track value. Verify the outcome.
- Numbers and Decision counts: 6 positive verified outcomes; headline USD3793; expected USD184.
- Monetary labels captured: $184, $3,793, $690, $1,590, $350, $280
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: $184Expected valuePending verification across current decisionsView details; $3,793Verified valueRealized this monthSee outcomes; ◇Service capacity1 verified decisions$690; ◇Procurement1 verified decisions$1,590; ◇Operating pattern1 verified decisions$350; ◇Cancellation recovery1 verified decisions$280; View evidence
- Hierarchy / visual inconsistencies: Visible four category rows total USD2910 rather than the full USD3793.
- Data inconsistencies: Hidden driver categories are omitted without a remaining-value row. Expected/observed/verified remain distinct in model.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Expose complete derived breakdown without inventing totals.

## memory

- Route: `/app/memory`
- Purpose: Surface learned operating responses.
- Primary question: What have we learned?
- Headline: Your operating memory, always on.
- Numbers and Decision counts: 6 learnings; 3 playbooks; 3 operating patterns.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: See all; ▤Friday Peak CapacitySoho · New York · Friday dinner peak · V4; ▤Wine Attach LiftRoma Norte · Mexico City · dinner · V3; ▤Supplier-first StrategyGroup · peak conditions · V1
- Hierarchy / visual inconsistencies: Stream/playbooks are cohesive, but dense supporting metadata remains.
- Data inconsistencies: Canonical source strings retain legacy EUR and high-level confidence terms; preserve scoped record linkage.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Currency/source cleanup before future visual migration.

## data-health

- Route: `/app/data-health`
- Purpose: Explain evidence trust.
- Primary question: Can RADR trust the inputs?
- Headline: Your evidence, in focus.
- Numbers and Decision counts: 5 sources = 3 healthy + 1 degraded + 1 stale; 2 issues; 3 affected decisions.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: View all; Xerostale6h agolow; Deliverectdegraded4m agomedium; Lightspeedhealthy40s agohigh; SevenRoomshealthy2m agohigh; Toast KDShealthy40s agohigh; View details
- Hierarchy / visual inconsistencies: Four metrics and source table fit. Confidence/action implications need explicit bounded copy.
- Data inconsistencies: Health impact uses independent confidence-before/after examples; no universal automatic confidence change exists. Do not claim it.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Use actual source dependencies and explain approval constraints; no fake trust certification.

## decision-detail

- Route: `/app/decisions/dec_peak_berlin`
- Purpose: Summarize a canonical Decision.
- Primary question: What action should we review?
- Headline: Peak capacity collision
- Numbers and Decision counts: D-1911; 6 evidence items; expected USD620; medium confidence.
- Monetary labels captured: $620
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: ▤Reservations inbound38 covers · next 22mReservations · Observed 2m ago; ▤KDS ticket time14 min ↑KDS · Observed 40s ago; ▤Open-order loadLivePOS · Live; ▤Delivery demand+31% vs planDelivery · Observed 4m ago; View all evidence; Review prepared action; Evidence; State; Futures; Recommendation
- Hierarchy / visual inconsistencies: Clean evidence/action hierarchy. Four metrics contain long text and generic labels.
- Data inconsistencies: Correct header currency, but linked native detail and evidence contain euros.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Same source-backed money and confidence across overview and deep view.

## decision-deep

- Route: `/app/decisions/dec_peak_berlin?layout=detail`
- Purpose: Inspect evidence, futures, policy, action.
- Primary question: Why this Decision and what happens next?
- Headline: Hold next seating wave for 12 min
- Numbers and Decision counts: D-1911; expected620; baseline0; alternatives180/other model values.
- Monetary labels captured: $620, €620, €0, €80, €340, €40, €120, €180, $0, $180, €410
- Currency: Mixed USD/EUR: FAIL.
- Labels / CTAs: Control Center; Decisions; Recommendation; Why now; Futures; Baseline; Action; Current decision; Historical replay; Incremental vs seat-now
- Hierarchy / visual inconsistencies: Long dense single-page room; analytics/alternatives and baseline all expanded.
- Data inconsistencies: USD620 header; EUR620/EUR0/EUR180 inside same room. Hardcoded baseline values and replay repeat source economics.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center; Control Center is a legitimate ancestor link in the Decision breadcrumb, not a route title.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Repair source denominations and derive baseline/replay from canonical scenario.

## live-detail

- Route: `/app/live?layout=detail`
- Purpose: Explore floor and time state.
- Primary question: Where is pressure building?
- Headline: No H1; floor overlays supply the live narrative.
- Numbers and Decision counts: Venue snapshot; USD420 exposure; time19:48; kitchen91%.
- Monetary labels captured: $420
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: ← Estate; Estate; Venue; GM; CFO; Operations; Financial; NOW; +30; +60
- Hierarchy / visual inconsistencies: Floor fills viewport; overlays/time controls compete. Existing map remains detail only.
- Data inconsistencies: Live snapshot exposure differs from D-1911 incremental620 and must stay separately labeled.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Do not equate exposure with expected decision contribution.

## service-detail

- Route: `/app/service?table=t8&layout=detail`
- Purpose: Inspect table/team/task context.
- Primary question: What intervention is needed here?
- Headline: Keep your operation on track.
- Numbers and Decision counts: 6 opportunities; recoverable498; expected peak620; Table8 waits19min.
- Monetary labels captured: €498, €620, €84
- Currency: Legacy EUR under New York context: FAIL.
- Labels / CTAs: Recoverable value€498From 6 opportunities; Kitchen load92%+18% (high); Occupancy78%+12% vs last hour; Walk-ins (next 2h)21+8 vs forecast; Apply plan; Details; Floor; Timeline; Kitchen; Staff
- Hierarchy / visual inconsistencies: Simultaneous KPI strip, plan, floor, timeline, inspector, pressure and demand.
- Data inconsistencies: Recoverable498/expected620 and table amounts are EUR under Soho. They are different economic measures, not additive.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Normalize Soho currency; later progressive disclosure using existing details.

## health-detail

- Route: `/app/data-health?source=toast-kds&layout=detail`
- Purpose: Trace source health to evidence.
- Primary question: Which evidence affects this Decision?
- Headline: Can RADR trust the evidence?
- Numbers and Decision counts: 5 sources, 3 affected decisions, 2 affected sources.
- Monetary labels captured: No money headline in this view.
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: 3Healthyof 5 sources; 1Degradedof 5 sources; 1Staleof 5 sources; 3Decisions affectedacross 2 sources; D-4102; D-1911; D-7110; Xero; Deliverect; Lightspeed
- Hierarchy / visual inconsistencies: Source table plus confidence map/dependency blocks makes a dense audit surface.
- Data inconsistencies: Source scores/impact examples do not automatically override stored Decision confidence; label clearly.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Use explicit affected-record links and policy context.

## location-detail

- Route: `/app/locations?location=loc_berlin_mitte`
- Purpose: Inspect one venue in estate context.
- Primary question: Where is attention needed?
- Headline: Locations
- Numbers and Decision counts: 1 scoped location; USD147964 revenue; USD43121 contribution.
- Monetary labels captured: $43, $147,964, $43,121, $974, $8,400, $1,200, $900, $400, $200
- Currency: USD symbols where present; reporting/source context requires explicit labeling.
- Labels / CTAs: Overview; Performance; Exposure; Profitability; Watchlist; View recommended actions →; Contribution; Revenue; Attention; Margin
- Hierarchy / visual inconsistencies: Portfolio analytics dominate selected-venue drill-down; grammar says 1 location need attention.
- Data inconsistencies: Operational finance catalogue totals are not verified decision value; labels must remain distinct.
- Footer / breadcrumb: visible demo disclaimer is shared; document title incorrectly fixed to Control Center.
- Result: **FAIL** (global title artifact plus page-specific findings above).
- Required correction: Correct singular labels and retain local/reporting currency context.

## Verification plan

Check D-1911 in Control Center, Decisions, evidence/action room, replay, Futures, Live/service links and search. Compare location, source currency, primary expected value, confidence, lifecycle, action, observed and verified outcomes. Prove count partitions and full value breakdowns from the same selected records. Test local currencies separately from explicitly converted USD group reporting. Capture an after contact sheet and update the result matrix without overwriting this baseline.

Baseline artifacts: the full-size `contact-sheet-before.png` and `details-before.png` composites in `/workspace/work/qa/consistency-audit/`, plus the named drill-down screenshots. Structured text excerpts are recorded in the per-page audit above.

## Data repair results and staged visual status

Additional source audit finding: native service detail previously declared a table intervention verified automatically after 4.8 seconds and claimed a link to Value without evidence. This is removed. The existing action prepares the selected table intervention for operator review; no timer creates a verified outcome. Historical canonical verification remains separate.

The repair uses the existing Decision store and estate registry, not a parallel database. Shared count partitions, source-currency formatting, reporting conversion and evidence-health constraints now serve the existing surfaces.

| Check | Result after repair |
| --- | --- |
| D-1911 current expected amount | USD620 across brief, list, detail, native evidence/futures and Soho service references |
| D-1911 current confidence | Medium; required degraded delivery source caps data confidence and autonomy. Scenario confidence is separately labeled and derived from the chosen canonical scenario, not a duplicated 82% literal |
| D-1911 outcomes | Awaiting evidence in current lifecycle; a historical/canonical after-service example does not upgrade the active record |
| Decision partitions | 11 scoped records = 3 needs judgment + 1 in motion + 7 resolved + 0 watching. Default opens the 3 needs-judgment records; existing All view exposes 11 |
| Value reconciliation | USD690 +1590 +350 +280 +273 +610 = USD3793. All categories are displayed; zero-value outcomes are not described as positive-value verified results |
| Local vs reporting money | Local source currency retained; mixed group source currencies converted once through the canonical illustrative FX table and explicitly labeled |
| Empty Value scope | No invented USD3793 history and no false Verified badge without proof |
| Data Health dependencies | Visible dependency IDs match affected-count IDs; unsupported confidence percentages and unsupported trust-change delta removed |
| Metadata artifact | Server route metadata replaces the inherited Control Center title outside that page |
| Screenshot QA | Fourteen desktop routes captured at 1512×982, including details. Contact sheets below show eight main surfaces together |
| Mobile brief | Priority Decision/action appears before metrics; no horizontal overflow at 390px |

### Visual gate

Control Center: **READY FOR REVIEW**, not implicitly approved. Shared rail, search, cards and light tokens remain the foundation. Live, Decisions detail, Operations detail and location analytics still have the density/progressive-disclosure findings recorded above; their later composition passes are **PENDING CONTROL CENTER APPROVAL**, per section 44. Do not mark those visual findings PASS merely because currency/data checks pass.

### Review artifacts

- [Before contact sheet](qa/RADR_APP_BEFORE.png)
- [After shared data and consistency repairs](qa/RADR_APP_AFTER_DATA_PASS.png)
- Detailed current captures and structured route/text results: `/workspace/work/qa/consistency-after/`

### Checks

The focused product/currency/scope set includes the new Ask currency checks. The final broad run passed 856 tests with the same 29 failures recorded before this work, and no new failure names. Those existing failures include legacy geography, marketing copy/structure, locale parity and old reporting expectations; this pass does not claim a green full suite. App TypeScript and targeted lint are checked separately before deployment.

### Per-page follow-up status

These are **current New York demo** data checks, not certification of every legacy/lab mode or a production integration. PASS means the repaired currency/title/selected-record assertions passed for the captured route. It does not close the baseline visual findings.

| Surface | Current data/title check | Visual status |
| --- | --- | --- |
| Control Center | PASS: USD620 top Decision; shared3 needs count; month-to-date value3793 | READY FOR APPROVAL |
| Live | PASS: named Soho snapshot; route title Live | PENDING: floor still dominates default viewport |
| Decisions | PASS: 3 needs /1 in motion /7 resolved =11; default needs view | PENDING: broader list/detail composition review |
| Operations | PASS: Soho table/service money USD; route title Operations | PENDING: progressive disclosure |
| Intelligence | PASS: 4 scoped signals; source and Decision confidence are distinct | PENDING: relationship and empty-risk presentation |
| Value | PASS: full six-category3793 reconciliation; no synthetic empty history | PENDING: approved composition refinement |
| Memory | PASS: scoped6 learnings /3 playbooks /3 patterns; route title Memory | PENDING: reduce supporting density |
| Data Health | PASS:5 sources,3 affected Decision IDs; real source status and qualitative confidence limits | PENDING: approved composition refinement |
| Decision summary | PASS: canonical D-1911 ID/Soho/USD620/Medium/current unverified lifecycle | PENDING: final detail hierarchy |
| Decision deep | PASS: no EUR under Soho; baseline/Futures/replay derive canonical economics | PENDING: progressive disclosure |
| Live deep | PASS: snapshot exposure remains distinct from D-1911 expected contribution | PENDING: competing overlays |
| Service deep | PASS: currencies fixed; preparation does not auto-verify after timer | PENDING: progressive disclosure |
| Health detail | PASS: dependencies reconcile; no invented Decision confidence percentage transition | PENDING: audit-detail density |
| Location drill-down | PASS: venue operating finance stays distinct from Verified Value; route title Locations | PENDING: selected-venue hierarchy |


### Final release verification

- 74 focused tests passed across the current product, currency, scope and Ask suites.
- Full suite: 856 passed, 29 failed; failure names match the recorded pre-existing 29-case baseline. No new failures remain. Old Ask test expectations were updated where they incorrectly treated historical scenario verification as current proof.
- Application TypeScript passed. Targeted lint has zero errors; three existing unused-variable warnings remain in the legacy AI modules.
- Current Ask recovery and ledger answers now read the same scoped Decision records as the app. An approved D-6671 stays expected184, observed pending, verified0 until the record is verified. Source/group currency and organization scope are preserved.
- Public Ask API authorization remains capped to its existing Soho demo scope. The UI reports unsupported locations instead of silently labeling a Soho answer as another property or group. This does not expand public access or change LIVE tenancy rules.
- Service preparation was observed beyond the former 4.8-second auto-verification interval and remained unverified. Main Decision filters showed3 /11 /7; visible Value category amounts summed3793. Browser errors and horizontal overflow: none in the checked flows.

[Control Center review capture](qa/RADR_CONTROL_CENTER_REVIEW.png)
