# Login and first-value onboarding

2 November 2026. User requested work on login and the onboarding funnel following approval of the Control Center design system.

## Entry and visual system

Login, account creation, password recovery and reset use the approved immutable mark, Manrope, the same blue/green canvas, defined glass panels and green action treatment as the product. The entry illustration is a labelled conceptual evidence-to-decision graphic, without invented financial numbers. Account setup and illustrative demo exploration are distinct paths. The demo no longer implies that a live system is connected or that an account is required to view the public Northstar demo.

The active first-value funnel has a six-stage journey: role, organization, first location, focus, evidence and first decision. It has explicit current/completed states, back navigation where safe, a session-only pre-workspace draft, a workspace scope summary and focus transfer to the new step heading. Returning to an earlier input does not create a second workspace. Once created, progress persists through the authenticated API and failed saves remain on the current step with a retryable error. Controls stay disabled during a save rather than appearing to accept an ignored click.

The public `/onboarding/preview` now renders this same active funnel with an explicit preview flag. It does not create accounts or workspaces, upload files, or fabricate analysis. The demo handoff opens the canonical restaurant/hotel gateway with labelled synthetic Northstar data. The older legacy funnel remains available for existing sessions.

## Functional corrections

- Enabled native email/password validation and fixed async failure handling so entry forms recover from network errors. Password visibility controls remain accessible. Login no longer imposes the new-account minimum on existing passwords.
- Auth requests stay on the current origin. Hosted preview origins use their own deployment/branch host rather than routing credentials to a production URL. Session authorization and Better Auth cookie/security defaults are retained.
- Invitation acceptance failures no longer silently claim success. Redirect destinations are checked with the safe internal-path helper, including encoded backslashes/control characters. Signed-in workspace setup routes to onboarding. Auth/setup preview pages are not indexed.
- Full name, industry and role lens now persist when the workspace is created, instead of disappearing with pre-workspace navigation.
- Replaced onboarding's broken CSV/XLSX-to-PDF/image upload handoff with an authenticated, scoped CSV endpoint. It supports UTF-8 contract/invoice CSVs up to 1 MB, checks parsed rows plus currency/unit columns, enforces upload permission, writes private evidence and an audit event, and rejects unsupported formats. The original general document uploader's format boundary remains unchanged.
- Analysis uses the selected document IDs within the authenticated workspace rather than silently switching to newer unrelated uploads. The result shows its supplier, item, unit rates and quantity, and labels the amount as expected invoice variance rather than verified recovery. It does not reuse a synthetic demo Decision ID. The final button truthfully opens Control Center rather than claiming to navigate into a different canonical Decision.
- PGlite is externalized from Next's server bundle to fix its URL/WASM runtime failure in local signup. The migration script now uses Next's installed environment loader instead of an unavailable dotenv import.

## Verified boundaries

An isolated local database and private file directory were used; no real customers or provider accounts were contacted. A browser test creates a real local Better Auth account, creates the workspace, confirms saved role/name/industry, uploads contract and invoice CSVs, obtains the deterministic EUR273 fixture variance, reloads that result, inspects its evidence, finishes setup, signs out and signs in again. It also confirms rejected progress saves do not advance the step. Recovery tests mock transport and send no email.

Seven browser checks passed, including the two Control Center regressions. Twenty-five unit checks passed for CSV boundaries, deterministic analysis, auth/tenancy and hosted account/redirect rules. Twelve auth/setup screen scans plus three hosted-state scans have zero WCAG A/AA Axe violations and no horizontal overflow at 390px. Configured application TypeScript, targeted ESLint and whitespace checks pass. The migration command was verified against the isolated PGlite database.

## Hosted activation status

The connected Vercel `prep` project has auth-secret configuration but no persistent database, private upload store or email provider configured. No new paid service or external account was provisioned by this change.

Consequently hosted account forms explicitly explain that account access is not configured, while demo and setup-preview paths remain available. The auth API returns a clear non-cacheable 503 instead of writing identities into temporary PGlite storage. Local development remains able to use PGlite. Private onboarding uploads on Vercel also require the existing S3 storage driver. Password recovery remains conditional and does not claim email delivery; production recovery is visibly unavailable while the existing sender implementation is a placeholder.

For customer activation, connect a persistent Postgres `DATABASE_URL`, run the existing migrations, configure the private S3-compatible storage driver, and implement/configure a recovery-email sender. Auth secret alone is not sufficient. Hosted customer signup, durable uploads and email delivery are therefore not claimed as verified live services. Browser flow verification is local; the Vercel preview is a visual/review deployment.

## Captures

[Login](visual-qa/entry/login.jpg) · [Workspace signup](visual-qa/entry/signup.jpg) · [Hosted login status](visual-qa/entry/hosted-login.jpg) · [Welcome](visual-qa/entry/welcome.jpg) · [Role](visual-qa/entry/role.jpg) · [Organization](visual-qa/entry/organization.jpg) · [Location](visual-qa/entry/location.jpg) · [Focus](visual-qa/entry/focus.jpg) · [Evidence](visual-qa/entry/evidence.jpg) · [CSV upload](visual-qa/entry/upload.jpg)
