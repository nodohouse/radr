# Settings Reference Map — Governance Control Plane

**Route:** `/app/settings`  
**Status:** PASS 1–9 complete · full governance control plane  
**Visual SSOT:** attached Settings mockup (Daylight · left settings nav · summary cards · org panel · governance rail · demo controls)  
**Screenshot:** `tmp/settings-pass2-1512x982.png`

## Thesis

RADR Settings = **enterprise governance control plane** — not a long configuration form.

WHO · WHERE · HOW RADR interprets · WHO can access · WHAT needs approval · WHAT may automate · WHAT interrupts · WHO changed what.

Persona lens ≠ access role. Autonomy is action-specific. Data Health gates execution.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Demo settings SSOT | `lib/radr/product/demoSettings.ts` | **KEEP LOGIC** — org fields · policies · autonomy · notifications · attention · `approvalAuthorityFor` · Decision deep links |
| Section routing | `parseSettingsRoute` / `buildSettingsHref` / `?section=` · `?policy=` | **KEEP** — move into engine |
| Demo org switcher | `DemoOrgSwitcher` · `demoOrgSession` | **KEEP LOGIC** — Restaurant / Hotel industry toggle |
| Persona demo controls | `personas.ts` · `setRoleView` | **KEEP LOGIC** — lens only, not RBAC |
| Product prefs | `lib/product/store.tsx` · `radr.prefs.v1` | **KEEP** — time format / roleView |
| Dashboard prefs | `lib/product/dashboards.ts` landing + pins | **MOVE** — Preferences later under Organization / Access |
| Connections embed | `sourcesForDemo` | **RECOMPOSE** → Integrations governance (link to `/app/connections`) |
| Data Health embed | `dataHealthRowsForRole` | **LINK OUT** → `/app/data-health` (not a Settings nav item in mockup) |
| Attention preview | `selectNeedsJudgment` | **KEEP** for Attention section (PASS 7) |
| Schema target | `docs/SETTINGS_SCHEMA_MAP.md` | **ALIGN** gradually |

## Old presentation (REMOVE / RECOMPOSE)

| Old (`app/app/settings/page.tsx` + `.rp-settings-*`) | Disposition |
|-----------------------------------------------------|-------------|
| Monolith ~1.4k-line page | **SPLIT** → `settings/engine/*` |
| Giant pale-green config panel / dead whitespace | **REMOVE** |
| 15-item nav (Connections · Data Health · Preferences · Security · Developer) | **RECOMPOSE** → 12 mockup sections |
| Static Context / Forecasting / Workforce copy stacks | **REPLACE** per pass |
| Fake security audit table | **REPLACE** → Audit Trail (PASS 8) |
| Duplicate AppShell chrome | **KEEP** global shell only |

## Canonical left navigation (mockup)

| Section | URL `?section=` | Detail |
|---------|-----------------|--------|
| Organization | `organization` | Name · currency · timezone |
| Locations | `locations` | Operating model per venue |
| Context | `context` | Locale · calendars · external signals |
| Forecasting | `forecasting` | Horizons · comparisons · thresholds |
| Workforce | `workforce` | Human roles · labor targets |
| Users & Access | `access` / `users` | Roles · invitations · scopes |
| Policies & Approvals | `policies` | Thresholds · owners · approval rules |
| Autonomy | `autonomy` | Observe → prepare → approve → execute |
| Attention | `attention` | Materiality · prioritization · noise |
| Notifications | `notifications` | Channels · quiet hours · escalation |
| Integrations | `integrations` | Connection governance · permissions |
| Audit Trail | `audit` | Changes · actions · approvals · exports |

**Aliases:** `access` → users · `connections` → integrations · `security` → audit · `data-health` → integrations (with Data Health CTA)

## Deterministic demo summary (PASS 2)

| Metric | Value |
|--------|-------|
| Organization | Northstar Restaurants / Northstar Hotels (industry toggle) |
| Currency | EUR |
| Timezone | Europe/Berlin |
| Locations (group story) | **24** · 22 restaurants · 2 hotels |
| Access personas (demo lens) | **6** |
| Policies active | **12** · 4 categories |

## Component plan

```
components/product/settings/engine/
  SettingsShell.tsx
  SettingsNav.tsx
  SettingsSummaryCards.tsx
  SettingsOrganization.tsx
  SettingsGovernanceRail.tsx
  SettingsDemoControls.tsx
  SettingsSectionStub.tsx   # later sections until their pass
  settings-engine.css
lib/radr/product/settingsProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Organization Overview · `tmp/settings-pass2-1512x982.png`~~
3. ~~PASS 3 — Locations + Context + Forecasting · `tmp/settings-pass3-*-1512x982.png`~~
4. ~~PASS 4 — Users & Access~~
5. ~~PASS 5 — Policies & Approvals~~
6. ~~PASS 6 — Autonomy / RADR Operators~~
7. ~~PASS 7 — Attention + Notifications~~
8. ~~PASS 8 — Integrations + Audit Trail~~
9. ~~PASS 9 — Playwright · `tests/e2e/settings-engine.spec.ts`~~
