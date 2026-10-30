# PRODUCT_INTERACTION_INVENTORY

Feature freeze baseline for the **Global Product Design + Interaction Completion Pass**.  
Canonical product: `https://prep-ten-zeta.vercel.app/app`

**Shell SSOT:** `ProductShell` → `GlobalOperatingHeader` (+ drawer `AppSidebar` / mobile `MobileTabBar`).  
**Nav SSOT:** `lib/product/appNav.ts` — `HEADER_PRIMARY_NAV` + `HEADER_MORE_NAV`.

Visual generation: **NEW** = Control Center northstar language · **LEGACY** = pre-northstar chrome / card stacks / `PageHeader`.

---

## Global chrome (all authenticated `/app` except lab / enter)

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `*` | Brand | link | RADR | Home | `/app` | yes | NEW | P2 |
| `*` | Primary nav | nav | Center…Locations | Navigate | HEADER_PRIMARY_NAV | yes | NEW | P0 |
| `*` | More ▾ | menu | More | Utility menu | Connections / Data Health / Settings (+ Dashboards) | **partial** — bare labels, no health state, no groups | NEW | **P0** |
| `*` | Scope | button | Org · location | Location switcher | modal | yes | NEW | P0 |
| `*` | Role | menu | GM / CFO… | Switch persona | store `roleView` | yes (synthetic) | NEW | P1 |
| `*` | Period | menu | Live / Today / MTD | Horizon | store `period` | yes | NEW | P1 |
| `*` | World | radio | Restaurants / Hotels | Demo vertical | DemoOrgSwitcher | yes | NEW | P1 |
| `*` | Ask RADR | button | Ask RADR | Butler overlay | AskRadr | yes | NEW | P1 |
| `*` | User | link | Initials | Settings | `/app/settings` | yes | NEW | P2 |
| `*` | LIVE strip | status | LIVE · clock | Ambient | — | yes | NEW | P0 |
| `*` | Signals tray | button | N signals | Needs-you list → Decision | `/app/decisions/[id]` | yes | NEW | P0 |
| `*` | Handling / Watching / Verified | trays | Counts | Preview + deep link | Decision / Value | yes | NEW | P1 |
| `*` (tablet) | Hamburger | button | Open nav | Drawer | AppSidebar | yes | NEW | P1 |
| `*` (mobile) | Tab More | tab | More | **Currently → Locations** | `/app/locations` | **misleading** | NEW | **P0** |

---

## `/app` — Control Center

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app` | Situation | CTA | Why? | Intel explorer | drawer | yes | NEW | P0 |
| `/app` | Review Now | list | Decision rows | Peek Decision | DecisionPreviewDrawer | yes | NEW | P0 |
| `/app` | Peek → full | CTA | Open Decision | Full case | `/app/decisions/[id]` | yes | NEW | P0 |
| `/app` | Operating Pulse | button | Open Live Focus | Focus live | `?focus=live` | yes | NEW | P1 |
| `/app` | Pulse LIVE/NOW | chrome | LIVE ticker | Ambient | — | **duplicate vs GOH LIVE** | NEW | P1 |
| `/app` | Contribution | button | Explore | Metric explorer | drawer | yes | NEW | P1 |
| `/app` | Locations strip | link | Location | Detail | `/app/locations/[id]` | yes | NEW | P1 |
| `/app` | Menu Pulse | link | View Menu Intelligence | Menu intel | `/app/intelligence/menu` | yes | NEW | P1 |
| `/app` | History | tabs | Month / Year | Horizon | local | yes | NEW | P2 |
| `/app` | Estate Watchlist | rows | Location attention | Locations | `/app/locations` | yes | NEW | P1 |

---

## `/app/decisions` · `/app/decisions/[id]`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/decisions` | Band tabs | tabs | Needs your judgment / In motion / Resolved | Filter | local | yes | Mixed | P0 |
| `/app/decisions` | Case rows | link | Decision title | Open Decision | `/app/decisions/[id]` | yes | Mixed — cards still heavy | P0 |
| `/app/decisions/[id]` | Surface tabs | tabs | Current / Replay | Toggle | local | yes | Mixed | P0 |
| `/app/decisions/[id]` | Futures options | buttons | Wait 12 / Seat now… | Select option | selected | **run-on euro strings** | LEGACY viz | **P0** |
| `/app/decisions/[id]` | Exact matrix | table | Option economics | Compare | — | **concatenated fields** | LEGACY | **P0** |
| `/app/decisions/[id]` | Primary CTA | button | Approve prepared plan | Advance | store | yes | Mixed | P0 |
| `/app/decisions/[id]` | Why / evidence | disclosure | Expand | Progressive | local | yes | Mixed | P1 |

---

## `/app/service` · `/app/house`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/service` | Time / Mode | tabs | Time · Mode | Floor lens | local | yes | Mixed | P0 |
| `/app/service` | Replay | control | Historical Replay | Scrub | local | yes | Mixed | P1 |
| `/app/service` | Table | select | Table N | Drawer | detail | yes | Mixed | P0 |
| `/app/service` | Options | buttons | Wait 12 / Seat now | Decision handoff | D-1911 | **run-on labels** | LEGACY | **P0** |
| `/app/service` | Zone pressure | gauges | Main / Bar / Terrace | Context | — | yes | Mixed | P1 |
| `/app/house` | Attention bands | sections | Needs you / Handling / Watching | Hierarchy | — | yes | Mixed | P0 |
| `/app/house` | Area filters | tabs | Prep / Deliveries / Waste | Filter | local | yes | Mixed | P1 |
| `/app/house` | Capture | buttons | Voice / Camera / Document / Manual | Capture sim | store | yes | Mixed | P1 |
| `/app/house` | Gap rows | accordion | Item | Expand + Decision | `/app/decisions/[id]` | **run-on headings** | Mixed | **P0** |

---

## `/app/intelligence` · `/app/intelligence/menu`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/intelligence` | Category tabs | tabs | Overview / Live / Menu… | `?cat=` | URL | yes | Mixed | P0 |
| `/app/intelligence` | Modules | cards | Module titles | Detail / pin / dashboard | module UI | yes | Mixed — equal cards | P0 |
| `/app/intelligence` | Supplier Variance | module | Supplier variance | Same module multi-category | catalog | **true duplicate surfacing** | Mixed | **P0** |
| `/app/intelligence` | Favorites | toggle | Favorite | Pin | local | yes | Mixed | P1 |
| `/app/intelligence` | Add to dashboard | button | Add | Dashboard widget | dashboards | yes | Mixed | P1 |
| `/app/intelligence/menu` | Rank grid | table | Dish rows | Select | detail | **run-on at narrow** | Mixed | P0 |
| `/app/intelligence/menu` | Peak mode | toggle | Peak | Lens | local | yes | Mixed | P1 |

---

## `/app/memory` · `/app/value`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/memory` | Lens tabs | tabs | Overview / Playbooks… | Filter | local | yes | Mixed | P0 |
| `/app/memory` | Calibration | viz | Forecast error | Chart | — | **text N= list, not chart** | LEGACY | **P0** |
| `/app/memory` | Playbook V3→V4 | flow | What changed | Narrative | — | weak composition | Mixed | P0 |
| `/app/value` | Hero | metric | €3,793 Verified | Proof | — | yes | NEW-ish | P0 |
| `/app/value` | Trace this euro | accordion | Decision € | Expand | openId | yes | NEW-ish | P0 |
| `/app/value` | Misses | list | Honest miss | Awareness | — | yes | NEW-ish | P1 |

---

## `/app/locations` · `/app/locations/[id]` · `/app/compare`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/locations` | Sort | buttons | Exposure / Contribution… | Sort | local | yes | Mixed | P1 |
| `/app/locations` | Estate table | table | Location economics | Columns | — | **run-on city cells** | Mixed | **P0** |
| `/app/locations` | Learn CTA | link | Compare test → | Compare + transfer | `/app/compare?…&transfer=` | data OK; Suspense risk | Mixed | **P0** |
| `/app/locations/[id]` | Tabs | tabs | Overview / Live / Performance | Panels | local | yes | Mixed | P0 |
| `/app/compare` | Suspense | status | Loading comparison… | Resolve `useSearchParams` | CompareInner | **can stick** | LEGACY | **P0** |
| `/app/compare` | Transfer brief | section | Wine attach… | Evidence → Futures → CTA | `xfer_wine_hamburg` | yes when mounted | Mixed | P0 |
| `/app/compare` | Create test Decision | link | Create test Decision | Playbook Decision | decisionHref | yes | Mixed | P0 |
| `/app/compare` | Metric tabs | tabs | Revenue… | Chart metric | local | yes | LEGACY | P1 |

---

## `/app/connections` · `/app/data-health` · `/app/settings` · `/app/dashboards`

| route | element | type | label | expected action | destination/state | working? | visual generation | priority |
|---|---|---|---|---|---|---|---|---|
| `/app/connections` | Source rows | list | Vendor status | Capability | — | yes | LEGACY | P1 |
| `/app/connections` | Browse catalog | toggle | Catalog | Unconnected | browse | yes | LEGACY | P2 |
| `/app/data-health` | Trust rows | list | Freshness… | Trust matrix | Deliverect degraded · Xero stale | yes | Mixed | P0 |
| `/app/data-health` | Affected Decisions | links | D-1911 / D-4102 | Decision | `/app/decisions/…` | yes | Mixed | P1 |
| `/app/settings` | Section nav | nav | Org…Developer | `?section=` | sections | **IA incomplete vs spec** | Mixed | **P0** |
| `/app/settings` | Save controls | forms | Persist | prefs | yes | Mixed | P1 |
| `/app/dashboards` | Library | CRUD | Dashboards | Editor | `/app/dashboards/[id]` | yes | Mixed | P2 |

---

## Data Health counts (More menu)

| Count | Sources (restaurant demo) |
|---|---|
| 1 degraded | Deliverect |
| 1 stale | Xero |
| Summary | `1 degraded · 1 stale` |

Surfaced today: AppSidebar foot, CC health chip. **Not** in desktop More ▾.

---

## P0 flags (release gate)

1. **More menu** — bare / incomplete; must be premium utility menu with health state.
2. **Compare Suspense** — harden so Hamburg→Berlin Mitte never infinite-loads.
3. **Futures / Service options run-on** — `Seat€0€0…` / concatenated fields.
4. **Supplier Variance duplicate** — remove true duplicate surfacing.
5. **BOH / Menu / Locations run-on** — semantic composition required.
6. **Settings IA** — full left nav sections must be visible.
7. **Legacy page personality** — Decisions / Service / BOH / Intel / Memory / Compare must catch CC northstar.

---

## Feature preservation rule

Do **not** delete useful capabilities. Only remove true duplicates. After redesign, re-diff this inventory — every row marked `working? = yes` must remain reachable.
