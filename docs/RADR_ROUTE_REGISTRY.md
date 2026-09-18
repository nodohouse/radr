# RADR Route Registry

Canonical product surface: **`/app/*`** via `ProductShell` (light-first).  
Service Map (`/app/service`) uses the same light product canvas.

Status legend: **NEW** · **MIXED** · **REDIRECT** · **DEPTH** · **LEGACY**

## Primary product (`/app`)

| Path | Status | Notes |
|------|--------|-------|
| `/app` | NEW | Control Center / TodayHome |
| `/app/findings` | NEW | Needs attention |
| `/app/findings/[id]` | NEW | Finding detail (progressive disclosure) |
| `/app/controls` | NEW | Actions — ready-to-decide list |
| `/app/controls/[id]` | DEPTH | Action detail |
| `/app/locations` | NEW | Location status |
| `/app/locations/[id]` | DEPTH | Location detail |
| `/app/service` | NEW | Service Map (light) |
| `/app/forecast` | NEW | Forecast windows |
| `/app/value` | NEW | Verified Value |
| `/app/data` | NEW | Connections |
| `/app/settings` | NEW | Settings |
| `/app/buy` | DEPTH | Territory lens |
| `/app/labor` | DEPTH | Territory lens |
| `/app/sell` | DEPTH | Territory lens |
| `/app/recover` | DEPTH | Territory lens |
| `/app/checks` | DEPTH | Reconciliation |
| `/app/checks/[id]` | DEPTH | Check detail |
| `/app/compare` | DEPTH | Location compare |
| `/app/glossary` | DEPTH | In-product glossary |
| `/app/performance` | REDIRECT | → `/app/forecast` |
| `/app/team` | REDIRECT | → `/app/settings` |
| `/app/signals` | REDIRECT | → `/app/findings` |
| `/app/signals/[id]` | REDIRECT | → `/app/findings/[id]` |

## Legacy authenticated tree → redirects

| Path | Redirect |
|------|----------|
| `/home` | `/app` |
| `/cases` | `/app/findings` |
| `/money` | `/app/value` |
| `/controls` | `/app/controls` |
| `/sources` | `/app/data` |
| `/documents` | `/app/data` |
| `/documents/[id]` | `/app/data` |
| `/scan` | `/sources` → `/app/data` |

## Nav (ProductNav)

- **Today:** `/app`, `/app/findings`, `/app/controls`
- **Operation:** `/app/locations`, `/app/service`, `/app/forecast`
- **Value:** `/app/value`
- **System:** `/app/data`, `/app/settings`

## Mobile tabs

Today · Work (`/app/findings`) · Locations · Value

## Out of product scope (this migration)

Marketing `[locale]/*`, auth, onboarding preview, `/mockups`, `/dev/*`, API routes.
