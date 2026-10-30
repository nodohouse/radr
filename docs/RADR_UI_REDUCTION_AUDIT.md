# RADR UI reduction audit

**Purpose:** Remove presentation duplication. Preserve 100% of product value via progressive disclosure.

**Rule:** CONCLUSION → WHY → EVIDENCE → DECISION (default shows the answer).

---

## Global

| Change | Before | After | Value preserved |
|--------|--------|-------|-----------------|
| Operating status strip | Defined in GOH; Daylight-hidden | Remains unmounted + CSS-hidden on all Daylight routes | Compression still in CC body / Decisions / Value |
| Green contrast | Bright `#00d978` used for small text | `--dl-green-text` / `--dl-green-signal` / `--dl-green-wash` | Same semantics; readable text |
| Serif discipline | Instrument Serif on conclusions | **All product serif removed** — Geist only; hierarchy via weight/tracking | Same conclusions, modern stack |
| AppShell nav | Live → lab; Memory/Locations/Health/Dashboards orphaned | Primary + More: Memory, Locations, Connections, Data Health, Dashboards, Settings | All routes same shell |
| Live | Non-interactive / lab-only | `/app/live` = interactive V2 (zones, camera, GM/CFO, sim, estate, timeline) | Full intelligence retained |

---

## `/app` Control Center (GM / CFO)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Repeated location + clock in head meta when GOH already shows scope/period | Context once | GOH scope + period; one page context line |
| “RADR Intelligence” eyebrow + redundant service clock chips | Duplicate of LIVE clock / weather | Single line: `Berlin Mitte · Dinner · LIVE 19:48` + weather |
| Equal 6-card metric band (prior pass) | Already demoted to tonight + compact | Compact metrics remain |

---

## `/app/settings`

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Kicker “Settings” + headline “Settings” + “How RADR is governed” triple | Triple title | One title: **Settings** · sub: How RADR is governed |
| Long governance paragraph | Word-count | Short optional line |

---

## `/app/dashboards`

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Kicker “Dashboards” + “My dashboards” title + section “My dashboards” | Triple label | **Dashboards** · Your operating views · sections My / Templates |
| Long “Control Center stays…” lede | Prose | Implied by product |

---

## `/app/intelligence`

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Lead module fully expanded + every other module expandable with full body | Too much simultaneous surface | LEFT findings list · CENTER one analysis · RIGHT RADR brief |
| Favorite / Add to Dashboard under every row | Repeated actions | Header actions on selected finding only |
| Long overview lede | Word-count | Question title only |

---

## `/app/value`

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Class sum + location sum echoing hero € | Same number 3× | Hero once; class/location/time via lens tabs (not all at once on overview) |
| Chart + both breakdowns on overview | Competing primaries | Overview = hero + trend; class/location lenses for breakdowns |
| Trace: all chains competing | Cognition load | Left outcomes list · right selected chain only |

---

## Secondary routes (Connections, Data Health, Locations, Guests, Reports)

| Route | Reduction | Preserved behind |
|-------|-----------|------------------|
| Connections | No status chrome; first 3–4 unlocked metrics + View all | Expansion |
| Data Health | Trust question + table; degraded/stale dominant | Full rows |
| Locations | Persona hierarchy (GM health vs CFO table) | Estate as tertiary |
| Guests | Pulse + 3-column composition | Segments/feedback/Decision |
| Reports | Grouped templates; less identical rows | Preview / Schedule on select |

### `/app/connections` (2025-10-07 pass)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Kicker “What can RADR access?” + duplicate title stack | Double headline | **Connections** once · estate line + Data Health link |
| Combined “Status · freshness” column | Competing scan columns | **Status** and **Freshness** as separate columns |
| Full unlock chip list in grid | Row height noise | First **4** metrics + **View all (n)** expand per row |
| Column label “Dependent Decisions” | Decision chrome on infra page | **Decision dependency** links unchanged |

### `/app/data-health` (2025-10-07 pass)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Kicker “Data Health” above trust question | Triple framing | **Can RADR trust the evidence?** as sole title |
| Subline “Decision impact” | Decision strip language | **Evidence in use** column + affected decision links |
| Healthy rows same weight as stale | Attention hierarchy | Degraded/stale sorted first, inset bar + wash; connected/demo rows quiet (62% opacity until hover) |
| Healthy count as loudest stat | Calm when trust is good | Smaller muted **Healthy** count in summary band |

### `/app/locations` (2025-10-07 pass)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Kicker “Locations” + competing section kickers (Economics, Pulse, Estate learning, Procurement) | Equal section labels | One page title; section **h2** only |
| Same section order for GM and CFO | Wrong hierarchy | **`data-persona="gm-single"`**: health → exposure → economics → estate (tertiary tag) · **`portfolio`**: economics table first, then matrix/intel, watchlist, learning |
| Full estate KPI rail on multi-site CFO view | Competes with portfolio table | **Compact** hero (title + scope) when portfolio primary |

### `/app/guests` (2025-10-07 pass)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| Wide segment table + stacked rail | Two primaries | Top **pulse** band · **Segments** (left) · **Service floor** (center) · **RADR read + judgment** (right) |
| “Pattern → Decision” label | Decision chrome | **Prepared judgment** + Open judgment link |
| Long CRM-style header | Word-count | One **Guests** title · Berlin scope line |

### `/app/reports` (2025-10-07 pass)

| Removed / merged | Why | Still available |
|------------------|-----|-----------------|
| “Reports” kicker + “Executive workspace” title | Double headline | **Reports** once |
| Three prose groups + identical card rows | Six equal templates | **Executive · Operations · Finance · Guests** groups |
| Always-visible Preview / Schedule buttons | Row chrome | Template **sheet preview**; **Preview · Generate · Schedule** on hover/focus/select |

---

## Investor / operator test

- [x] One primary question per page
- [x] Bright green not used for small body text
- [x] No global LIVE/HANDLING strip on Settings / Reports / Connections / Data Health / Dashboards / Guests / Locations
- [x] Intelligence selection model (not all expanded)
- [x] Value hero euro once per viewport
