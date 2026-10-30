# Dashboard System

Canonical Control Center is **not** user-editable.

Users build **My dashboards**; orgs can share.

## Model

```
Dashboard { id, organizationId, ownerUserId, name, description,
  visibility, roleTemplate, scope, defaultPeriod, layout, timestamps }

DashboardWidget { id, dashboardId, intelligenceModuleId,
  x, y, width, height, configuration, scopeOverride, periodOverride, order }
```

Widgets point at `INTELLIGENCE_REGISTRY` — no duplicated calculations.

## Visibility

`PRIVATE` · `SHARED` · `ROLE` · `ORGANIZATION`

Dashboard share ≠ data authorization. Scoped rendering still enforces tenant / role / location.

## Demo vs signed-in

| Mode | Persistence |
| --- | --- |
| Demo | `localStorage` key `radr.dashboards.v1` |
| Signed-in | Drizzle tables `dashboards`, `dashboard_widgets`, `user_dashboard_pins` |

## Templates

GM · CFO · Friday Dinner · Restaurant Live · Hotel Ops · Head Chef

## Pinning

- ☆ **Pin dashboard to navigation** (sidebar Pinned section)
- Module action: **+ Add to dashboard** (different semantics)
- Max ~6 pins; overflow → More dashboards…

## Routes

- `/app/dashboards` — library
- `/app/dashboards/[id]` — view
- `/app/dashboards/[id]?edit=1` — customize (add / resize / remove / save / cancel)

## Mobile

View excellent. Advanced drag/resize deferred to desktop. Edit CTA: “Customize on desktop” may be added later.

## Code

- `lib/product/dashboards.ts`
- `app/app/dashboards/page.tsx`
- `app/app/dashboards/[id]/page.tsx`
- `lib/db/schema.ts` — dashboard tables
