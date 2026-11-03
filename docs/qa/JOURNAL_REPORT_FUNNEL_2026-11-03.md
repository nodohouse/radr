# RADR Journal and gated report funnel

Four original English articles were added for restaurant leaders, hotel operators, and hospitality CFOs. Topics: constrained kitchen capacity and menu mix, occupancy versus hotel contribution, the live forecast gap, and supplier-credit evidence. New content contains no invented industry statistics or customer claims. The journal cards and articles use concept illustrations clearly labeled as such. English-only article/report pages use English canonical URLs and sitemap entries; existing translated articles remain available.

The companion publication, **The Hospitality Decision Playbook**, is an 11-page PDF with 1,961 words, an evidence scorecard, a 30-day pilot, and a reusable Decision record worksheet. It embeds Manrope and the approved immutable RADR mark. D-1911 and D-7110 are clearly labeled synthetic examples. The private PDF is included in the download function trace, outside public static assets.

## Lead and access flow

1. `/en/resources/hospitality-decision-playbook` requires name, work email, company, role, location count, and an explicit report + sales-follow-up request.
2. Newsletter updates are a separate unchecked optional choice. Optional cookie consent is not a prerequisite.
3. POST `/api/reports/request` validates fields and consent, checks origin, applies a five-per-minute best-effort limit and a honeypot, and delivers the request to the configured lead receiver.
4. Only a successful receiver response unlocks a signed HttpOnly/Secure production cookie for 30 minutes. Cookie and URL contain no contact details. Retries reuse a request identifier unless fields change.
5. GET `/api/reports/download` rejects missing, expired, or altered grants. Successful responses use attachment disposition, no-store, noindex, and a fixed private PDF path. Failed downloads can be retried without resubmitting the lead during the grant window.

## Activation required

The inspected preview project has no configured report/contact lead receiver. No live lead was submitted during this task. The report page therefore clearly states that requests are not accepting submissions, and the API returns 503 without issuing a grant. It never treats a mailto draft or ephemeral server log as a captured lead.

Configure these in the intended Vercel project/environment:

- `REPORT_LEAD_WEBHOOK_URL`, or existing `CONTACT_WEBHOOK_URL` as fallback. Use an HTTPS receiver that persists the lead before acknowledging success.
- Optional `REPORT_LEAD_WEBHOOK_TOKEN` for a Bearer-authenticated receiver.
- `REPORT_DOWNLOAD_SECRET` with at least 32 random characters, or the existing `BETTER_AUTH_SECRET` fallback. The fallback derives a purpose-specific HMAC key.

The receiver gets JSON containing `fullName`, `email`, `company`, `role`, `locations`, `requestContact`, `marketingOptIn`, `source: "radr-report"`, `reportId`, `receivedAt`, `requestId`, `privacyNoticeVersion`, and `followUpRequested`. The request ID is also sent as `Idempotency-Key`; the receiver should deduplicate it. A contact request does not automatically subscribe the person to marketing updates. No auto-response email or CRM integration is claimed until connected.

The existing contact form continues to use its existing delivery path. This report endpoint can share its receiver, distinguished by source and interest. In-memory rate limiting is best-effort per instance; use shared counters before higher-volume launch.

## Verification

- Eight unit checks pass for signed grants, expiry/tampering, required consent, missing delivery setup, honeypots, origin rejection, original article length, and private PDF placement.
- Four Playwright tests pass: article/report navigation, delivered local lead → real browser PDF download, upstream failure → no grant, and mobile navigation/layout.
- Six desktop/mobile Axe WCAG A/AA states pass with zero violations and no horizontal overflow. No browser runtime exceptions in the visual review.
- Application TypeScript and targeted ESLint pass.
- PDF inspection: 11 pages, selectable text, embedded fonts, approved vector mark. Cover and worked-example layouts reviewed.
- Delivery tests use an isolated loopback receiver and synthetic contact details, never a live sales inbox.

Regeneration: `pip install reportlab fonttools brotli`, start a local Next build/dev once to cache the Manrope Latin font, then run `python scripts/generate-hospitality-report.py`. Review the PDF when source content or approved brand assets change.
