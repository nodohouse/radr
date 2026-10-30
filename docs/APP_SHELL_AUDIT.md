# App Shell Audit

**Date:** 2026-10-05  
**Rule:** Exactly one authenticated shell. No route-local chrome.

## Canonical implementation

| Layer | File | Role |
|-------|------|------|
| Root | `app/app/layout.tsx` | Wraps all `/app/*` in `ProductShell` |
| Shell | `components/product/ProductShell.tsx` | Providers + `ShellChrome` |
| Nav | `components/product/shell/AppSidebar.tsx` | Left operating rail (primary + utility) |
| Context | `components/product/shell/GlobalOperatingHeader.tsx` | Scope · role · period · world · Ask RADR |
| Telemetry | `OperatingStrip` in GOH | LIVE · DECISION · HANDLING · WATCHING · VERIFIED · WITHIN EXPECTATIONS |
| Mobile | `MobileTabBar` | Phone-only primary tabs; utilities via rail sheet |

## Confirmed single path

- `/app` Control Center
- `/app/decisions` + `/app/decisions/[id]` Decision Room (same shell @1440)
- `/app/service` · `/app/house` · `/app/intelligence` · `/app/memory` · `/app/value`
- `/app/locations` · `/app/connections` · `/app/data-health` · `/app/dashboards` · `/app/settings`

Exceptions (intentional, no product chrome):

- `/app/lab/*` — lab root
- `/app/enter` — enter experience

## Legacy inventory

| Artifact | Status |
|----------|--------|
| `ProductNav.tsx` | Deprecated wrapper → `AppSidebar` only; no other imports |
| `HEADER_MORE_NAV` | Alias of `RAIL_UTILITY_NAV` — not a separate UI |
| Mobile “Menu” | Opens utility rail sheet (Connections / Data Health / Dashboards / Settings) — not a second nav system |
| Demo org in GOH | Replaced by `WorldSwitcher` (no DEMO kicker); DEMO switcher remains in account menu only |
| `.rp-nav` / `.rp-topbar` in `product.css` | Legacy CSS; not mounted by `ProductShell` v2 |

## Delete / do not reintroduce

- Second header with More + Demo org + alternate telemetry
- Route-local `ProductNav` mounts
- Parallel dark/light shells per Decision Room

## Visual frame (2026-10-05)

- Outer chrome: marketing `--bg-deep` `#08100c` (rail)
- Workspace canvas: `#f7faf8`
- Focus surfaces: `#ffffff` + hairline
