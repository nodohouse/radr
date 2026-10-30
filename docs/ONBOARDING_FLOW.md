# ONBOARDING FLOW

**Status:** Phase E thin foundation + existing first-value MVP  
**Principle:** Onboarding = guided Settings. No parallel onboarding-data SSOT.

## Built now

### Entry paths

```mermaid
flowchart TD
  Auth[Sign in / Sign up with invite]
  Auth --> PostAuth[resolvePostAuthDestination]
  PostAuth --> Invite[Accept invitation]
  PostAuth --> Create[Create org via /onboarding]
  PostAuth --> Select[Multi-org /select-org]
  PostAuth --> Cont[Continue onboarding]
  PostAuth --> App[/app Control Center]
  Invite --> App
  Select --> App
```

### First-value funnel (existing)

`/onboarding` → FirstValueFunnel (supplier/AP path) → org + location rows + progress jsonb → `/app?welcome=1`

Creates real `organizations`, `locations`, owner membership, `location_access` (all), `authentication_policies` stub.

### Schema-driven engine (foundation)

| Type | Path |
|------|------|
| Flow / step defs | `lib/onboarding/engine/types.ts` |
| Self-serve catalog | `lib/onboarding/engine/flows/selfServe.ts` |
| Bindings → settings keys | `lib/onboarding/engine/bindings.ts` |
| Progress only | `lib/onboarding/engine/progress.ts` |

Self-serve steps (v1): `role` → `organization` → `location` → `connect` (optional) → `go_live`.

Progress fields on `organizations.onboarding`: `schemaVersion`, `flowVersion`, `flowId`, `currentStepId`, `completedStepIds`, `skippedStepIds`, `lastCompletedAt`. Material values live on org/location columns via bindings.

## Role / vertical branching (designed, partially deferred)

| Branch | Behavior now | Later |
|--------|--------------|-------|
| Role lens | Stored in onboarding state / prefs | Users & Access settings |
| Restaurant vs hotel vs apartments | First location fields | Adaptive skip + capacity forms |
| Org size 100+ | Same create path | Import from POS/PMS |
| IT vs GM | Same funnel | Collaborative Setup Center tasks |

## Enterprise path (deferred)

Sales creates org → IT invited → SSO/SCIM → import locations → pilot locations. Not built.

## Deferred (explicit)

Full adaptive wizard · Setup Center UI · Connection OAuth · Workforce/autonomy/notifications setup · Activation analytics dashboard · Full Settings editors

## After Decisions persistence

Resume full adaptive onboarding + reusable Settings forms that consume the same bindings / SETTINGS_SCHEMA_MAP keys.
