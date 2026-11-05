# Trust, legal and cookie implementation review

Content review: 5 November 2026. This is an implementation record, not legal approval.

## Public surfaces

Trust & Security (`/security`), Privacy (`/privacy`), Terms (`/terms`), Imprint (`/imprint`) and Cookies & Storage (`/cookies`) use the same server-rendered `LegalPageShell`. The shell provides a coherent public design, page navigation, stable section anchors, a sticky desktop contents list and readable mobile content. English content is explicit on non-English routes; no unreviewed translation is presented as authoritative.

The operating entity details remain intentionally empty in `components/marketing/config/company.ts`. The owner confirmed they are not ready. Do not invent an address, company registration, VAT ID, governing law, direct contact inbox or authorized representative. The public Imprint and legal documents explicitly state that confirmation and legal approval are pending. They are not launch-complete merely because the website design is complete.

## Evidence reviewed

| Public statement | Implementation evidence | Limits |
| --- | --- | --- |
| Session/password settings | `lib/auth.ts` | Configured code is not a deployment attestation. Customer recovery email is not implemented. |
| Organization and location authorization | `lib/authz.ts`, route guards | A workspace cookie alone does not grant access. |
| Headers and browser permissions | `lib/security/headers.ts`, `next.config.ts` | CSP currently permits inline scripts/styles and evaluation; no nonce-based strict policy claim. |
| Rate limiting | `lib/security/rate-limit.ts`, authentication configuration | Custom limiter is process-local; no distributed protection guarantee. |
| Private storage | `lib/storage.ts`, document APIs | Driver/provider-dependent. No automatic encryption-at-rest or malware-scanning attestation. |
| Upload contract | Document and onboarding upload routes | PDF/JPEG/PNG versus schema-validated contract/invoice CSV. Hosting limits can be lower. |
| Optional AI processing | `lib/ai/provider.ts`, orchestration | Optional configured OpenAI-compatible endpoint; no blanket zero-retention/no-training promise. |
| Report grant | `lib/marketing/reportGate.ts`, report request route | 30-minute HttpOnly cookie only after successful configured lead delivery. |
| Cookie choice | `lib/privacy/consent.ts`, `CookiePreferences.tsx` | Valid for 180 days; local record can remain until overwritten/cleared. No optional collector installed. |
| Locale | `i18n/routing.ts` | `radr_locale`, up to one year. |
| Workspace | `lib/identity/orgCookie.ts`, `lib/authz.ts` | `radr-org-id`, up to one year, checked against membership. |

`lib/privacy/disclosures.ts` is the shared public inventory used by the cookie dialog and the full storage page. It distinguishes cookies, local storage and session storage, provider/software roles, conditional feature use and validity versus physical deletion. Update it when storage changes. The report lead payload references `PRIVACY_NOTICE_VERSION` so successful requests record the current reviewed notice version.

## Cookie behavior

- Before a valid choice, optional categories remain off. Accept/reject are equally prominent and individual choices are available.
- Closing without saving preserves an existing choice, or leaves essential-only operation if none exists. A separate tab-session dismissal marker prevents the prompt reopening during policy navigation; that marker grants no optional consent.
- Saving, rejecting, reopening, withdrawing, expiry, malformed preferences and storage-failure behavior are verified. A failed persistence operation does not report a successful save.
- The native modal contains category descriptions, the full source-reviewed inventory, validity and withdrawal instructions. Native modal focus containment, Escape, focus restoration and mobile scrolling are exercised.
- Privacy and inventory links close the modal before navigation, preventing a retained overlay on the destination.
- Category consent is not future blanket consent, sales contact permission or email marketing subscription. New vendors/purposes require appropriate disclosures and consent-version review before activation.

## Remaining production work

The company identity, required jurisdiction-specific disclosures, verified public contact channels, applicable legal bases, retention/offboarding schedules, processor/subprocessor contracts and locations, transfer safeguards, operational security/incident ownership, backup/restore evidence and service commitments need owner and legal/operational confirmation. No certifications, monitoring coverage, response SLA or audited security posture were invented.

Do not treat this documentation pass as implementation of SSO/MFA, customer password recovery email, antivirus, regional residency, a distributed rate limiter, external connector execution, a data-subject request automation or a monitored vulnerability program.
