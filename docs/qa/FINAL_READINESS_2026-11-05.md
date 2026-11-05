# RADR website: final-stage UX and security review

Reviewed 5 November 2026. Scope: public marketing site, journal, calculator, pricing, company, developer and trust pages, account-entry and onboarding preview, plus the server boundaries supporting these flows. No real customer records, leads or outbound emails were created. Public deployment is a Vercel preview, not production promotion.

## Product and design corrections

- The journal previously used three different horizontal alignments for its header, promotion and article cards. All now share one 1240px composition, expanding to 1440px on large displays with responsive gutters.
- A broad `.rx-res-section h2` rule added section-sized margins inside card headings. Card headings now have zero margins, consistent type and padding, a fixed media measure, and an equal-height reading/action area.
- Three columns on desktop, two on tablet and one on phones reduce stretched cards and unbalanced category gaps. Sparse topics use two balanced cards or a single horizontal story rather than leaving orphan cards. The lead story uses a balanced split rather than an oversized empty row.
- Free editorial content now appears before the playbook promotion on the journal index. The playbook remains accessible later in the page and elsewhere on the site.
- Long articles use a wide editorial composition: section headings in the left column, readable paragraphs in the right column, and paired research/calculation panels. Smaller screens return to a single reading flow.
- Thumbnail image size hints now reflect their actual displayed widths. No image of a generated person was introduced; the frozen logo assets were not changed.

Locale parity was reconciled across all 17 namespaces for German, Dutch, French and Spanish. Missing company/platform copy was translated, obsolete navigation/architecture keys removed, and the legacy Decision example corrected to keep USD 620 expected value separate from USD 590 illustrative protected value. Blog copy no longer uses em dashes. Journal closing actions now lead to the actual platform and calculator.

## Security findings and fixes

1. **Known vulnerable dependencies:** updated Next.js to 15.5.29, Better Auth to 1.7.18, Zod to 4.6.7-compatible releases, and Vitest to 5.1.0. The Node baseline is now `^22.12.0 || ^24.0.0 || >=26.0.0`, matching the supported toolchain. Node types and Drizzle tooling were updated accordingly. A clean lockfile resolution avoided forcing incompatible optional framework peers.
2. **Nested vulnerable build dependencies:** scoped overrides use PostCSS 8.5.32, the legacy esbuild-kit helper's esbuild 0.25.12, and the TypeScript ESLint parser's minimatch 11.0.1. The parser uses the named `minimatch` API, retained by the patched version. The rest of ESLint's older minimatch API is not overridden. Recheck these overrides when upgrading the parent packages. ESLint and the Drizzle CLI are verified after the changes.
3. **Production `unsafe-eval`:** removed JavaScript eval permission from production CSP while preserving development HMR. Existing frame, object, base URI, form, HTTPS and transport restrictions remain. Inline scripts/styles are still permitted for the existing App Router setup; this is not a nonce-based CSP.
4. **Public tool-preview boundary:** the synthetic REST preview is disabled outside DEMO, throttled in DEMO, rejects cross-origin POSTs and invalid/oversized JSON, and retains the existing non-executable write-tool gate. It does not become a production tenant API.
5. **Unbounded JSON buffering:** report, Ask RADR and tool requests now use a streamed byte limit, including absent or misleading Content-Length and multibyte input. Oversized inputs fail with 413 before full buffering.
6. **Rate-limiter retention:** expired entries are swept, storage is capped at 10,000 active keys, and a saturated limiter rejects new keys without evicting existing limits. This remains a per-process limiter, not a distributed abuse-prevention service.
7. **QA bypass in production:** the middleware's local QA unlock is ignored when NODE_ENV is production. The intentionally public synthetic demo and onboarding preview remain available.
8. **Organization API error handling:** anonymous membership requests previously threw an uncaught authorization error and produced 500. They now return JSON 401. Organization selection validates bounded input, rejects cross-origin requests and verifies membership using the server identity before setting the cookie. Responses are explicitly private/no-store. No unauthorized data exposure was observed in the original failure.

## Verification approach

`playwright.release.config.ts` runs 100 independent automated sessions: ten fictional hospitality roles, each with ten input/device variants. These are simulations, not 100 human participants or a statistical usability study. Every session visits the homepage, platform, solutions, full calculator, pricing, sales-intent destination, company, a research article and the playbook form. All ten platform surfaces and all five solution problems are exercised across the matrix. Currencies, annual-revenue bands and five viewport sizes vary; calculated totals are checked against the deterministic engine, with independent arithmetic unit regressions also run.

Separate checks cover:

- 36 route/viewport combinations at phone, desktop and 4K sizes, including Axe accessibility checks, horizontal overflow, page errors, journal alignment and loaded images.
- Login/recovery validation, required onboarding choices and location details, cookie rejection and preference changes.
- Production security headers, absent/tampered report grants, cross-origin and oversized requests, anonymous private API access, write-tool gating and the production QA-bypass restriction.
- Authorization, tenant isolation, uploads, signed report grants, bounded input, calculator arithmetic, guest fixture integrity and tool contracts in unit tests.
- Targeted committed-secret patterns in application, library, public and script files. No matches were found; this is not a full repository-history secret scan.
- npm advisory-registry scans of production and full dependency trees. Both final scans reported zero known advisories. This is a point-in-time dependency result, not proof that the application has no vulnerabilities.

Raw reports and screenshots are stored in `/workspace/work/qa/`, including `radr-release-100.json`, `radr-release-visual.json`, `radr-release-http.json`, `radr-security-after.json` and `radr-security-all-after.json`. Final run outcomes are recorded in the publication metadata and release-results artifact after the checks complete. Tests use an isolated local production build; no destructive or load testing is performed against the hosted site.

## Before enabling real customer accounts or lead capture

The public experience remains an honest synthetic-data demo. Lead delivery was explicitly deferred by the user and remains disabled. Hosted account storage, password-reset email, persistent private uploads and commercial connectors require their actual production services/configuration; no fake successes were added. Company-specific legal identity details remain pending as previously requested.

A distributed rate limiter, nonce-based CSP and independent penetration test are appropriate before handling real multi-tenant customer data at scale. This review is an engineering/code/browser audit and does not certify the system or replace those controls.
