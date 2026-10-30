# PRODUCT SURFACE INVENTORY

**Generated:** 2026-09-30 (Wave A0 refresh — programmatic route crawl)  
**Product URL:** https://prep-ten-zeta.vercel.app/app?stay=1  
**Program:** Product Consolidation + Full QA

Status vocabulary: `CURRENT` · `LEGACY` · `DUPLICATE` · `UNUSED` · `BROKEN` · `REDIRECT`

---

## 1. Worlds

| World | Org ID | Vertical | Locations | Enter |
|---|---|---|---|---|
| Northstar Restaurants | `org_northstar_restaurants` | restaurant | 8 / 8 | `/app/enter` |
| Northstar Hotels | `org_northstar_hotels` | hotel | 8 / 8 | `/app/enter` |
| Legacy mixed | `org_northstar` | mixed | pilot 3 of 12 | Internal only — not on enter |

SSOT: `components/product/useDemoOrg.ts` · `lib/radr/demo/organizations.ts`

---

## 2. Roles × worlds

| Display | Persona | RoleView | Default scope | Worlds |
|---|---|---|---|---|
| Sarah | gm_berlin | gm | Berlin Mitte | Restaurants |
| Marcus | coo_all | coo | All | Both |
| Elena | cfo_group | cfo | Group | Both |
| Nina | hotel_gm_canal | hotel_gm | Canal House | Hotels |

Matrix: **2 worlds × 3 primary roles** × every major route.

---

## 3. Location tabs (locked IA)

SSOT: `lib/radr/product/experienceComposer.ts` → `locationTabsFor`

| Vertical | Tabs |
|---|---|
| Restaurant | Overview · Live · Performance · Decisions · Value · Memory · Data |
| Hotel | Overview · Live · Performance · Decisions · Value · Memory · Data |
| Apartment (legacy Chiado) | Overview · Live · Performance · Channels · Decisions · Value · Memory · Data |

Hotel **Distribution** folded into Live/Overview (not a peer tab).  
`"today"` remains type alias only → Overview.

---

## 4. Primary navigation

SSOT: `lib/product/appNav.ts`

| Section | Items |
|---|---|
| Control | Center `/app` · Decisions · Value |
| House | Back of house `/app/house` |
| Operate | Locations · Service Map · Memory · Intelligence |
| System | Connections · Data Health |
| Explore | Butler `/app/ask` |
| Utility | Settings · Dashboards · Location switcher · Period · Demo org/role |

Mobile: Center · Decisions · BOH · More

---

## 5. Route crawl (`app/app/**/page.tsx` — 51 routes)

### CURRENT (primary product)

| Route | Component surface | Worlds | Status |
|---|---|---|---|
| `/app` | Control Center | Both | CURRENT |
| `/app/decisions` | Decision Ledger | Both | CURRENT |
| `/app/decisions/[id]` | Decision Room | Both | CURRENT |
| `/app/value` | Verified Value | Both | CURRENT |
| `/app/house` | Back of house | Both | CURRENT |
| `/app/locations` | Portfolio | Both | CURRENT |
| `/app/locations/[id]` | Location detail | Both | CURRENT |
| `/app/service` | Service Map | Restaurant-first | CURRENT |
| `/app/memory` | Operating Memory | Both | CURRENT |
| `/app/intelligence` | Intelligence hub | Both | CURRENT |
| `/app/intelligence/menu` | Menu Intelligence | Restaurant | CURRENT |
| `/app/intelligence/margin` | Margin response | Restaurant | CURRENT |
| `/app/connections` | Connections | Both | CURRENT |
| `/app/data-health` | Data Health | Both | CURRENT |
| `/app/settings` | Governance | Both | CURRENT |
| `/app/dashboards` | Dashboard list | Both | CURRENT |
| `/app/dashboards/[id]` | Dashboard builder | Both | CURRENT |
| `/app/ask` | Butler | Both | CURRENT |
| `/app/compare` | Estate compare | Both | CURRENT |
| `/app/enter` | World enter | Both | CURRENT |

### REDIRECT / LEGACY (thin or archived)

| Route | Status |
|---|---|
| `/app/buy` `/app/labor` `/app/sell` `/app/recover` | REDIRECT → intelligence lenses |
| `/app/findings` `/app/findings/[id]` | REDIRECT → decisions |
| `/app/signals` `/app/signals/[id]` | LEGACY |
| `/app/controls` `/app/controls/[id]` | LEGACY |
| `/app/data` | LEGACY (upload orphan risk) |
| `/app/integrations` | LEGACY vs `/app/connections` |
| `/app/forecast` `/app/performance` `/app/finance` | LEGACY |
| `/app/calibration` `/app/glossary` `/app/team` | LEGACY |
| `/app/checks` `/app/checks/[id]` | LEGACY |
| `/app/shift/pre` `/app/shift/post` | LEGACY |
| `/app/m` `/app/design-review` | UNUSED / EXPERIMENTAL |
| `/app/lab/*` | EXPERIMENTAL (shell skipped) |

---

## 6. Settings sections (all must route)

| ID | Label |
|---|---|
| organization | Organization |
| locations | Locations |
| context | Context |
| forecasting | Forecasting |
| workforce | Workforce |
| policies | Policies & approvals |
| autonomy | Autonomy |
| attention | Attention |
| notifications | Notifications |
| users | Users & access |
| connections | Connections |
| data-health | Data health |
| preferences | Preferences |
| security | Security |
| developer | Developer |

SSOT: `app/app/settings/page.tsx` NAV array.

---

## 7. Decision IDs (display only in UI)

Restaurant flagships: D-1911 · D-8204 · D-7501 · D-4102 · D-1842  
Hotel flagships: D-HK-1402 · D-2201  

Never render raw `dec_*` / `loc_*` / `dash_*` / `org_*` in customer copy.

---

## 8. Wave A convention status (2026-09-30)

| Item | Status |
|---|---|
| Location 7-tab IA | DONE |
| MoneyImpact + D-1842 €1,640 | DONE (`lib/radr/decision/economics/moneyImpact.ts`) |
| Frankfurt AttentionState | DONE (`deriveLocationAttention`) |
| Restaurant world Amsterdam/Lisbon purge | MOSTLY DONE (CfoLiveSurface hotel-gated) |
| Metric primitives | IN PROGRESS |
| Copy / raw ID audits | IN PROGRESS |
| Economic invariants | IN PROGRESS |

---

## 9. Gate rule

READY only when Wave D audits show **P0 = 0** and **P1 = 0**.  
Marketing remains frozen.
