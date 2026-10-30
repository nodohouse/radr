# Dashboard Interaction Audit

| Action | Path | Status |
| --- | --- | --- |
| Review N Decisions | HumanHandoff master + headline | Wired → `?band=needs_you` |
| Needs judgment headline | `HumanHandoffHeadline` | Wired |
| Decision badge | Sidebar navAttention | Needs_you only (existing) |
| Business Pulse metric | Click → `?focus=pulse` | Wired |
| Live Focus | `?focus=live` | Wired |
| Performance Focus | `?focus=performance` | Wired |
| Calendar click | `?focus=history` | Wired |
| Create dashboard | `/app/dashboards` | Demo localStorage |
| Customize | `?edit=1` | Add / resize / remove / save / cancel |
| Add widget | Intelligence picker | Wired |
| Pin / unpin | Library + detail | Wired; sidebar Pinned section |
| Templates | Library | Wired |
| Drag-drop grid | — | Deferred; size select in edit mode |
| Unsaved warn | — | Cancel restores draft; full beforeunload TBD |
| Playwright suite | `tests/e2e/cc4-dashboard-audit.spec.ts` | **10/10 pass** @ 1440 |

## Known gaps

1. ~~True drag-and-drop grid~~ — `@dnd-kit` sortable reorder + size select
2. ~~Widget renders live Intelligence modules~~ — `renderIntelModule`
3. DB persistence for signed-in (schema ready; API routes TBD)
4. ~~Settings → Navigation & dashboards~~ — Preferences panel
5. Playwright — `tests/e2e/cc4-dashboard-audit.spec.ts`
