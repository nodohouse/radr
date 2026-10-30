# PRODUCT POLISH AUDIT

Generated: 2026-09-22 · Beauty / UX / Enterprise polish pass (Part 1)

Evidence: current product code + `tmp/product-audit/` screenshots (Playwright, 6 viewports).  
Note: many screenshots are from ~00:43 local; Live/CFO surfaces in code advanced later the same day — call out where code ahead of screenshots.

Columns: UX · Visual · Product · Engineering · Missing · Fix · Priority (P0–P3).

---

## Cross-cutting (shell · brand · context)

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Shell context | Role / scope / period appear in top bar **and** page bodies (Overview org line, pulse kicker, Memory title “CFO · Group”, Intelligence filters) | “Viewing as CFO · Group” competes with scope chip; Demo badge + Ask + role switch crowd the right rail | Violates one-context-bar rule | `TopContextBar` + `RoleViewSwitcher` + page-level kickers all restate persona | Canonical bar: `[Org/Location ▾] [Role ▾] [Period ▾]`; rail avatar = initials only | Collapse to one bar; strip page-level role/scope duplicates; sidebar firstName OK only when rail expanded | **P0** |
| Ask / Butler naming | Launcher still **Ask RADR** | Same label in panel H1 + greeting | Brief requires **RADR Butler** / subline “Ask about your operation” | Strings in `TopContextBar`, `AppSidebar`, `AskRadr.tsx` | User-facing rename only (internal contracts can stay) | Replace visible copy; launcher `Butler · ⌘K` | **P0** |
| Brand tokens | App warm canvas largely matches marketing | Hard-coded `#0a0d0b` / `#00d978` still scattered in CSS/SVG | Shared token file exists (`app/radr-brand-tokens.css`) but not fully adopted | Dual sources: tokens + legacy `control-center.css` / intel CSS | Map charts/buttons to `--color-*` / `--chart-*` | Wire product CSS to tokens; kill one-offs | **P1** |
| Charts | Mostly light | Active pills / track dots use solid near-black (OK); lab still has mineral dark panels | Brief bans black/dark-green **graph panels** | `components/product/lab/lab.css` still `#070c09` chart worlds | Product Live trajectory uses warm SVG (`rp-live-traj-bg`) | Keep product charts warm; quarantine lab dark | **P1** |
| Electric green | Live dots / verified accents present | Overview still has many green deltas + Demo pill + live dots competing | Target 5–10% screen as accent | — | Discipline: NOW / LIVE / Verified / selected Future only | Reduce green on routine positive deltas; reserve electric for signal | **P2** |
| Mobile shell | Bottom tabs Center / Decisions / Value / More work | Overview stacks dense; context filters still duplicate | Mobile should be briefing-first | Tab “More” → locations only | Full-screen Butler sheet; Decision Why/Futures/Action tabs | Trim mobile CC chrome; Butler = sheet | **P1** |

---

## Control Center

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Overview | Brief headline + tension good; then **7 equal pulse cards** dilute judgment | Contribution bridge strong; Needs you / Outliers / Data Health fight for fold | Brief: above fold = tension + bridge + 2 needs you + 1 outlier — not 10 modules | Pulse strip + bridge + queue all above fold | Quieter system-proof line exists in code (`systemProof`) — easy to miss vs pulse | Collapse pulse below fold or to 3 hero metrics; elevate Needs you; prove line next to brief | **P0** |
| Overview — attention | Needs you card clear | Handling / Verified / Watching may sit below fold | “RADR is handling” labeled in `HandlingVerifiedWatching` — verify always visible | Drawer preview OK | Category examples (Settlement / Supplier follow-up…) thin | Keep Handling band above fold with category chips | **P1** |
| Live · CFO / Group | Code has `CfoLiveSurface` + group trajectory + money flow | Screenshots still show **Berlin restaurant Live** under CFO (stale QA) | Group Live must dominate with trajectory | `isCfo ? CfoLiveSurface` wired; screenshots predate | Re-capture QA; exceptions list + month-end narrative polish | Re-run Playwright; ensure CFO Live never falls through to Berlin day scene | **P0** |
| Live · Restaurant (Berlin) | KPI strip + 60m timeline exist | Trajectory may not dominate above fold vs KPI grid | Brief wants: trajectory → Orders now → Bestsellers → Stock → Next 60–180 | `LiveCommandSurface` has modules; fold still KPI-heavy | Orders/fees/contribution vs expected per channel; stockout € at risk | Make `LiveTrajectoryChart` hero; demote KPI row | **P0** |
| Live · Hotel (Canal) | Today / arrivals readiness strong | Vertical day scene ≠ full hotel Live command | Brief: Rev trajectory · Occ · ADR · RevPAR · channel · rooms | `HotelLiveSurface` + `verticalDay` Today scene | Pickup / OTA economics as first-class visuals | Align Canal Live tab with HotelLiveSurface grammar | **P1** |
| Live · Apartments (Chiado) | Turnovers flow clear | Gap-night Decision callout good | Brief: cleaning cost · OTA · contribution pace | `ApartmentLiveSurface` present | Access / maintenance depth | Same: trajectory + money flow native to apartments | **P1** |
| Performance | Bridge + location pulse useful | Scatter labels truncated (“Be…”) | Overlaps Overview bridge | Duplicate bridge on Overview + Performance | Clear job split: Overview = judgment, Performance = drivers only | Drop pulse strip from Performance; enlarge location table | **P1** |

---

## Decisions

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Decision Ledger | Status pills clear; rows readable | Dense text rows; impact buried right | Ledger ≠ command | — | Stronger money-first column | Lead with € / status / deadline; title secondary | **P2** |
| D-1911 Peak (`dec_peak_berlin`) | Headline WAIT 12 + €620 + deadline good | Why-now = **8 equal metric tiles**; prose repeats same logic | Brief: one causal relationship visual, not 4 prose blocks | `WhyNowCausal` grid + narrative + “relationship” section | Causal chain: inbound + walk-ins + delivery → kitchen → ticket → second turn → €620 | Replace tile soup with one relationship diagram; cut duplicate copy | **P0** |
| D-1911 Futures | Futures section exists | Not the signature NOW/+15/+30/+60 multi-metric switch | Brief: Seat now / Wait 12 / Kill demand × Contribution / Kitchen / Ticket / Turn risk | `FuturesTimeline` / `FuturesTrajectory` | Metric switcher UI | Build trajectory matrix interaction | **P0** |
| D-4102 Supplier (`dec_supplier_berlin`) | Contract vs invoice cards good | Still text-heavy “What was decided” | Golden economics present (€6.80 / €7.45 / 420 L / €273) | Verified path OK | Inline euro proof chain on Decision (not only Value expand) | Add compact Invoice→…→€273 strip | **P1** |
| D-7501 Margin Coke | Same Decision template | Text-forward | Menu economics story | — | Visual price ladder / margin bridge | Class-specific visual grammar | **P2** |
| D-2201 OTA Canal | Verified story clear | Hotel channel story under-visualized | Channel hold proof | — | Channel mix diagram | Hotel-native Decision layout | **P2** |
| D-1842 Tuna | Closed / historical OK | — | Library Decision, not flagship | — | — | Keep secondary | **P3** |
| D-7110 Menu peak | Cross-domain flagship | Same template as others | Should feel BUY×LABOR×SELL | — | Cross-lens diagram | Distinct layout for menu-peak | **P1** |
| D-7401 Guest voice | Closed | Soft evidence | Operating pattern | — | Guest quote visual | Light polish | **P3** |
| D-3104 Orphan Chiado | Apartment perishable | — | Gap-night Decision | — | Units timeline reuse | Link to apartment Live | **P2** |
| D-table recover | — | — | Recover class | — | — | Align with Recover lens | **P2** |

---

## Verified Value

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| `/app/value` Overview | Hero €6,103 + 7 outcomes + curve good | Curve strong; class/location bars quiet | Proof room almost there | Tabs Overview / Trend / By class / By location | Expandable euro trace only for D-4102; other rows → Decision only | Default-open D-4102 proof path; markers clickable on curve | **P0** |
| Value Trend / By class / By location | Tab IA clear | Charts understated | Breakdown OK | — | Cumulative + Decision markers parity | Unify chart component with Overview | **P2** |

---

## Locations

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Portfolio | Bubble chart readable | Legend + axes good; little table | Performance vs exposure OK | Truncation on Performance scatter elsewhere | Sortable location table under chart | Add dense table (rev, margin, exposure, needs you, verified) | **P1** |
| Berlin Mitte | Tabs Today/Live/Performance/Decisions/Value/Memory/Data | Live tab mirrors CC restaurant Live (duplicate) | Location should be vertical day + Decisions, not second Control Center | Context line repeats “CFO · Group” | Deep Live modules when scoped to Berlin | When location ≠ all, reuse LiveCommandSurface once; strip role from page header | **P1** |
| Canal House | Arrivals readiness bars + timeline strong | Hotel grammar distinct — good | Decision formed callout OK | — | Channel mix / ADR dilution visual | Add distribution economics block | **P1** |
| Chiado Collective | Turnovers flow excellent | Gap nights card clear | Apartment-native — good | — | Cleaning cost / OTA cost in KPI row | Add contribution / fee metrics | **P2** |

---

## Operating Memory

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| `/app/memory` Overview | Playbook funnel 12→5→4→3→V3 present as text | Forecast error = number row + bars, not uncertainty envelope | Learning visible but not “serious visual overhaul” | Hard-coded demo numbers | Visual evolution + narrowing envelope | Redesign featured playbook as evolution graphic; envelope for 14.2→6.8% | **P0** |
| Playbooks / Learnings / DNA tabs | Tabs exist | Secondary lists feel bolted on | Compounding story = one playbook | MemoryService not driving progression | Drive from MemoryService | Wire service; demote DNA jargon | **P1** |

---

## Intelligence

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Overview | 5 modules curated — good | Modules share same card chrome + RADR READ footer | Brief: native grammar per domain | Bento equalizes Settlement waterfall with list modules | Period Live/Today/7D/MTD duplicates shell period | Drop second period control when shell owns period; vary module chrome | **P1** |
| Revenue · demand | Trajectory module exists | — | — | — | — | Ensure trajectory is dominant | **P2** |
| Menu · margin | Top dishes + scatter good | Images help | Decision link D-7110 clear | Same card template | Stock state on dish rows | Keep; add stock chip | **P2** |
| Payments · reconciliation | Settlement bridge strong | Unexplained €395 clear | Decision formed OK | — | — | Keep as waterfall exemplar | **P2** |
| Live / Labor / Procurement / Channels / Reservations | Category tabs many | Catalog feel on some cats | Overview should stay curated 5–7 | `modulesForIntelligenceCategory` | Native visuals per cat | Per-cat grammar pass | **P1** |

---

## Connections

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Connected list | Status / freshness / unlocks / locations clear | **No vendor logos** — text-only rows | Brief **requires** official logos (Lightspeed, SevenRooms, Toast, Deliverect, Xero, Mews…) | `app/app/connections/page.tsx` renders name only | Local SVG / Simple Icons assets; 32–40px wells; fallback initials | Add logo well + catalog browse surface | **P0** |
| Catalog | Missing in product Connections | — | Connected vs browse catalog split required | Marketing/dev catalog exists separately | In-app browse for ecosystem vendors | Add “Browse catalog” without cluttering connected list | **P0** |

---

## Data Health

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| `/app/data-health` | Freshness · Completeness · Conflicts · Impact model correct | Dot meters OK; rows quiet | “2 sources need attention” but Xero stale may be missing from list vs Connections | Summary vs list mismatch risk | Tie degraded → Decision IDs (e.g. Deliverect → D-1911 / channel) | Dense meters; impact → Decision chips; include all degraded/stale | **P1** |

---

## Settings

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| `/app/settings` | Quiet list — good | Premium sparse | Demo tools gated (`isSyntheticData`) — good | Most rows non-navigating placeholders | Org / Users / Policies / Autonomy / Attention / Notifications / Preferences / Security mostly stubs | Keep boring; hide empty detail pages; deep-link only real ones | **P2** |

---

## RADR Butler (Ask RADR)

| Surface | UX issue | Visual issue | Product issue | Engineering issue | Missing data/capability | Fix | Priority |
|---|---|---|---|---|---|---|---|
| Empty state | Suggested Qs role-aware-ish | Panel labeled Ask RADR; greeting repeats title | Not Butler brand | Drawer width / margins need 480–540px / 16px audit | Rename + subline | Brand + layout pass | **P0** |
| Answer body | `AskAnswer` has structured blocks (metric, evidence, collapse) | Still can feel essay-adjacent on some intents | Brief wants ButlerHeadline / EvidenceList / MiniTrend / DecisionLink… | Partial componentization | MiniTrend; Decision-trace collapse; contribution driver table crispness | Finish block kit; ban long markdown dump | **P0** |
| Mobile Butler | Full-screen-ish on 430 | Close Esc OK | Should be sheet | — | Sticky composer | Sheet pattern | **P1** |

---

## Viewport / engineering QA (from interaction audit)

| Viewport | Core routes load | Ask open/close | Lens switch | Notes | Priority |
|---|---|---|---|---|---|
| desktop-1440 | PASS | PASS | PASS | Re-shoot Live/CFO after CfoLiveSurface | P0 |
| desktop-1280 | PASS | PASS | PASS | — | — |
| laptop-1024 | PASS | PASS | PASS | Scatter truncation | P1 |
| tablet-768 | PASS | PASS | PASS | — | — |
| mobile-430 | PASS | PASS | PASS | Dense Overview; duplicate context | P0 |
| mobile-390 | PASS | PASS | PASS | Same | P0 |

Interaction audit SSOT: `docs/PRODUCT_INTERACTION_AUDIT.md` (29/29 pass at last run). Screenshots: `tmp/product-audit/`.

---

## Priority backlog (finish order)

| # | Item | Priority |
|---|---|---|
| 1 | One context bar — remove role/scope duplication everywhere | P0 |
| 2 | Rename Ask RADR → RADR Butler (UI only) | P0 |
| 3 | Connections logos + catalog browse | P0 |
| 4 | Live: CFO trajectory hero (re-QA); Restaurant trajectory dominates fold | P0 |
| 5 | D-1911: one causal visual + Futures metric matrix | P0 |
| 6 | Value: default euro proof path (D-4102) | P0 |
| 7 | Memory: visual evolution + uncertainty envelope | P0 |
| 8 | Butler structured answer kit + drawer geometry | P0 |
| 9 | Overview: fewer equal modules above fold | P0 |
| 10 | Data Health ↔ Decision impact links; list completeness | P1 |
| 11 | Intelligence per-domain visual grammar; period de-dupe | P1 |
| 12 | Brand token adoption; kill remaining dark chart panels (lab OK) | P1 |
| 13 | Mobile briefing + Butler sheet | P1 |
| 14 | Hotel / apartment Live polish to brief | P1 |
| 15 | Decision class-specific layouts (menu peak, OTA, margin) | P2 |
| 16 | Settings stub hygiene | P2 |

---

## Acceptance snapshot (enterprise beauty test)

| Question | Current score | Blocker |
|---|---|---|
| Credible to Four Seasons / Accor / large group? | ~7/10 | No vendor logos; context noise; Live not always “alive” in QA shots |
| CFO gets Value / Direction / Action in 10s? | ~7.5/10 | Overview still card-heavy after brief |
| GM understands Live in 10s? | ~6.5/10 | Trajectory not always hero; Berlin vs Group confusion in stale QA |
| Would a world-class team ship Butler as-is? | ~5.5/10 | Naming + essay risk + incomplete blocks |
| Connections feel real? | ~4/10 | Text-only vendors |

**Verdict:** Architecture is close enough to **stop expanding**. Polish pass should execute the P0 backlog above — finish, don’t invent.

---

## Implementation progress (2026-09-22 evening)

| Item | Status |
|---|---|
| PRODUCT_POLISH_AUDIT.md | Done |
| Brand tokens locked into `.rp-root` → `--color-*` | Done |
| One context bar: Org/Location · Role · Live/Today/MTD | Done |
| Ask RADR → RADR Butler (shell + panel + subline) | Done |
| Connections logos + browse catalog | Done (Simple Icons + monogram wells) |
| Intelligence: removed duplicate period/scope/role | Done |
| Overview: bridge + 2 needs you + 1 outlier; pulse below fold | Done |
| Live: trajectory above KPI strip | Done |
| Data Health → Decision links (Deliverect, Xero) | Done |
| Settings demo tools already gated | Done |
| D-1911 causal + Futures matrix | In progress (agent) |
| Memory envelope + Value markers | In progress (agent) |
| Live MoneyFlow visual / hotel-apt polish | In progress (agent) |
| Screenshot QA redeploy | Pending |
