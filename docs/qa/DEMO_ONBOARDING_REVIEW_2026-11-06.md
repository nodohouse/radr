# Demo entry and onboarding review

Reviewed 6 November 2026 against the local source on `radr-product-premium`.

## Changes

- The public `/[locale]/demo` entry now presents the existing hotel and restaurant chooser, rather than an unrelated decision explainer.
- Both choices enter the actual product without a login. Entry restores the chosen operating world, role and location together through a fresh product load.
- Entry preserves unrelated preferences, tolerates malformed saved preferences, clears stale selected-decision context and uses today's operating period.
- Demo buttons wait for client readiness. First visits do not receive a false last-visited state.
- The chooser uses the proportional wordmark, readable brand colors and a visible return link on phones. A missing background image request was removed.
- The restaurant GM uses a fictional name instead of the owner's first name.

## Verification

- 4 onboarding/account-entry browser checks passed: required inputs, explicit choices, invalid timezone, password recovery validation, network failure recovery, draft persistence and back navigation. Preview created no workspace.
- 4 additional browser regressions passed in a clean final run: hotel and restaurant public entry, rendered workspace selection, preserved preferences, reload persistence, and complete preview onboarding into each corresponding demo without workspace writes.
- 8 product interaction checks passed, including guest needs, current versus incoming reservations, Live versus editing, decision evidence/futures/approval paths, Intelligence selection, Value and Memory filters, hotel Live and responsive product pages. Three checks interrupted by a stopped development server were rerun and passed.
- 23 unit checks passed across onboarding upload/schema behavior, demo boundaries, hotel sample data and scenario coherence.
- 48 route/viewport checks completed: 12 product routes in each of the two worlds at 390px and 1512px. All returned HTTP 200 with no detected horizontal overflow, application error or browser page error.
- Application TypeScript check (`tsconfig.app.json`), changed-file ESLint and whitespace checks passed before the final small readiness safeguard; final safeguard lint and browser regressions also passed.

Detailed route results and chooser screenshots are stored in `/workspace/work/qa/demo-onboarding-audit/`.

## Boundaries

This verifies the synthetic demos and setup preview, not live customer onboarding. Hosted account access remains disabled. Real account creation, password-reset email delivery, private evidence persistence and production connectors require their configured services and a separate end-to-end verification. No real customer workspace, upload, lead or outbound email was created. This is not an exhaustive security assessment or a guarantee that every possible interaction is defect-free.
