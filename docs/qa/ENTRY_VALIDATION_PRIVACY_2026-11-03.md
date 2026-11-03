# Entry validation, privacy choices, and sign-in safeguards

Login, signup, recovery, and reset buttons remain disabled until their required fields are valid. Native HTML constraints, client submit guards, and server credential-shape checks all apply. Login accepts existing passwords without applying signup's minimum length; new passwords require 10–128 characters and cannot consist entirely of whitespace. Reset confirmation must match. Auth messages remain non-enumerating, safe internal redirects remain in place, and passwords are never saved in browser drafts.

First-value onboarding requires a name, explicit role, organization name, explicit industry and location count, reporting currency, location name/city/country, and valid IANA timezone. A recognized city must match its selected country. Timezone is suggested but editable for multi-timezone countries. First priority and evidence method require explicit choices. Invalid drafts resume at the first incomplete earlier step. Older incomplete workspaces can fill missing profile information without attempting to create a second workspace.

Workspace creation validates required first-value data on the server. Progress patches check prerequisites against merged persisted state and reject completion without server analysis or an explicit demo choice. Client-supplied analysis results cannot overwrite server analysis. Authenticated onboarding mutations reject cross-origin browser requests. Existing tenant roles and upload checks remain active.

## Cookie behavior

- Marketing and auth pages show an accessible preference dialog, with equal accept/reject buttons and individual category choices.
- Essential sign-in/security/language preferences remain independent of optional analytics and marketing.
- No third-party analytics or ad tracker is installed. Existing calculator analytics hooks run only with valid analytics consent.
- Optional tracking defaults to denied. Preferences expire after 180 days; malformed, expired, future-dated, or storage-failed consent fails closed.
- Footer and auth legal area provide Cookie settings. Choices can be changed or withdrawn. Closing the panel does not grant consent.
- Before introducing a tracker, update the notice and vendor inventory, revise the consent version/key to obtain a fresh informed choice, and load scripts only after the relevant consent. This implementation does not claim legal certification.

## Sign-in security and remaining deployment requirements

Better Auth retains HttpOnly/Secure production cookies, SameSite=Lax, CSRF/origin protection, and safe return URLs. Sensitive auth responses use no-store. Password reset revokes other sessions. Endpoint-specific throttles are tighter for sign-in, signup, and recovery.

The present rate-limit storage is in-memory, so counters are per instance. A shared database/Redis limiter is required for robust distributed customer launch. Hosted identities still fail closed without persistent Postgres, and recovery delivery remains unavailable until an email provider is implemented/configured. This pass does not provision services, enable real hosted customer accounts, introduce MFA/SSO, or claim those capabilities are live.

## Verification

- Application TypeScript check and targeted ESLint pass without errors/warnings.
- 20 unit checks pass across entry rules, cookie parsing, security boundaries, and supplier/AP analysis.
- Four focused Playwright tests pass for field gating, explicit setup choices, cookie persistence/withdrawal, malformed API input, authenticated setup bypass attempts, and cross-origin rejection.
- Five full entry regression tests pass, including isolated local signup → scoped workspace → CSV upload → server analysis → completed setup → sign-out/sign-in, draft restoration, retryable save failures, and non-enumerating recovery.
- Four Axe WCAG A/AA states have zero violations: cookie dialog and login at 1512px and 390px. No horizontal overflow in those states.
- Test users and migrations use an isolated local PGlite database. No customer systems are modified and no real recovery email is sent.
