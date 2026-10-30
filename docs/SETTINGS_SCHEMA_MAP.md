# SETTINGS SCHEMA MAP

Canonical configuration keys for RADR. Onboarding bindings and future Settings routes share these keys.

**Inheritance (designed):** SYSTEM_DEFAULT → ORGANIZATION → GROUP → LOCATION → decision override. Resolver not shipped this slice — document only.

| Canonical key | Scope | Default | Onboarding step | Future settings route | Permission | Product surfaces |
|---------------|-------|---------|-----------------|----------------------|------------|------------------|
| `organization.name` | org | — | organization | Settings → Organization | `settings.edit` | Shell, audit |
| `organization.slug` | org | from name | (auto) | Settings → Organization | `org.admin` | URLs, invites |
| `organization.country` | org | — | organization | Settings → Organization | `settings.edit` | Locale/context |
| `organization.currency` | org | — | organization | Settings → Organization | `settings.edit` | Money display |
| `organization.timezone` | org | UTC | organization | Settings → Organization | `settings.edit` | Live clocks |
| `organization.fiscalYearStart` | org | null | — | Settings → Organization | `settings.edit` | Finance (later) |
| `organization.plan` | org | pilot | — | Internal | `org.admin` | Entitlements |
| `organization.status` | org | active | — | Security / admin | `org.admin` | Access |
| `location.name` | location | — | location | Settings → Locations → profile | `location.edit` | Live, Decisions |
| `location.country` | location | — | location | Settings → Locations | `location.edit` | Context |
| `location.city` | location | — | location | Settings → Locations | `location.edit` | Context |
| `location.timezone` | location | UTC | location | Settings → Locations | `location.edit` | Operating day |
| `location.currency` | location | — | location | Settings → Locations | `location.edit` | Money |
| `location.openingHours` | location | null | — (later) | Settings → Locations → Operating model | `location.edit` | Live 2.0 |
| `location.servicePeriods` | location | null | — | Settings → Locations → Operating model | `location.edit` | Live |
| `membership.roleId` | membership | viewer | invite / create | Settings → Users & Access | `user.manage` | Authz |
| `membership.roleLens` | membership prefs | — | role | Settings → Users (lens) | self / `settings.edit` | Control Center lens |
| `location_access.scope` | membership | all | invite | Settings → Users & Access | `user.manage` | Authz |
| `auth_policy.mfaRequired` | org | false | — | Settings → Security | `security.manage` | Sign-in (future) |
| `auth_policy.ssoEnforced` | org | false | — | Settings → Security | `security.manage` | Sign-in (future) |
| `auth_policy.allowedDomains` | org | [] | — | Settings → Security | `security.manage` | Sign-in (future) |
| `connections.integrations` | org | [] | connect (skip ok) | Settings → Connections | `integration.manage` | Data Health |
| `setup.activation` | org progress | — | go_live | Setup Center (later) | — | Control Center |

## Notes

- `organizations.onboarding` jsonb is **progress/UI only**, not a second settings store.
- `/app/settings` today is mostly demo prefs — must be replaced to edit these keys after Decisions persistence.
- Materiality / autonomy / notification policies: map later; do not invent parallel keys in onboarding jsonb.
