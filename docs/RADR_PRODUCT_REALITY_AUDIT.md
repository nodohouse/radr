# RADR Product Reality Audit

**Date:** 2026-08-28  
**Scope:** Full repository. Marketing must not claim production readiness beyond this document.  
**Rule:** Status labels are absolute. Demo polish ≠ production capability.

## Status vocabulary

| Status | Meaning |
|--------|---------|
| WORKING | Real path in auth-gated product or infrastructure; usable for real orgs |
| PARTIAL | Real code + UI, but incomplete, demo-backed, or not enforced |
| DEMO ONLY | Full experience on synthetic Northstar data under `/app` only |
| BUILDING | Explicitly marked building in UI / sources |
| PLANNED | Designed / documented; no shipping runtime |
| NOT IMPLEMENTED | No usable product surface |
| BROKEN | Exists but fails or misleads when used |

## Architecture (two products)

| Surface | Path | Auth | Role today |
|---------|------|------|------------|
| Demo Control Center | `/app/*` | Public | Polished product vision on synthetic data |
| Production shell | `/(app)/*` → `/home`, `/cases`, `/money`, `/sources`… | Session required | Honest empty states + document upload |
| Marketing | `/`, `/product`, `/pricing`… | Public | Must reconcile to this audit |
| Developers | `/developers/*` | Public | Design preview docs |
| Onboarding | `/onboarding`, `/onboarding/preview` | Session (preview ungated) | Creates real org + location |

**Environment model** (`lib/radr/env.ts`): `DEMO` (default) · `SANDBOX` (not shipped) · `LIVE`.  
**Billing:** `billingLive: false`. No Stripe SaaS checkout.  
**Integrations SSOT:** `lib/integrations/registry.ts` (only Demo Reservations + Files are `available`).

---

## Feature audit

### Control Center — DEMO ONLY
- **Paths:** `app/app/page.tsx`, `components/product/ControlCenter.tsx`, `lib/product/demo/*`
- **Evidence:** Full interactive overview (brief, findings, chart, territories) on synthetic catalog. Chrome: `RADR · Demo`.
- **Demo:** yes · **Production:** no equivalent (`/home` is empty attention shell)

### Morning Brief / Executive Brief — PARTIAL
- **Paths:** `lib/radr/brief/morningBrief.ts`, `components/product/ExecutiveBrief.tsx`
- **Evidence:** Real brief builder wired into Control Center for Berlin demo scope. No email delivery. Notification prefs only architectural.
- **Demo:** yes · **Production:** no

### BUY — DEMO ONLY
- **Paths:** `app/app/buy/page.tsx` → `TerritoryWorkspace`
- **Evidence:** KPIs/signals from demo dashboard. No live supplier ingest.

### LABOR — DEMO ONLY
- **Paths:** `app/app/labor/page.tsx`
- **Evidence:** Same TerritoryWorkspace pattern; Butler labor tools read demo snapshots.

### SELL — DEMO ONLY
- **Paths:** `app/app/sell/page.tsx`
- **Evidence:** Same pattern.

### RECOVER — DEMO ONLY
- **Paths:** `app/app/recover/page.tsx`, `lib/radr/scenarios/cancellationRecovery.ts`
- **Evidence:** Deepest demo story (Table 14 cancel → waitlist → seat → verify). Still synthetic.

### Findings / signals / cases — PARTIAL
- **Demo:** `/app/signals`, `/app/findings/[id]`, findings engine + cancel-recovery timeline · WORKING UI on fake data
- **Production:** `/cases` · honest empty (“No fake cases”)

### Actions / controls — PARTIAL
- **Demo:** in-memory actions (`lib/radr/actions/service.ts`), `/app/controls`, Needs Attention cards
- **Production:** `/controls` empty. Settings mark Controls as DEMO.
- **Note:** Demo sometimes shows hardcoded control counts. Treat as illustrative.

### Verified Value / Money — PARTIAL
- **Demo:** `/app/value` · Table 14 €184 with provenance · `Illustrative demo` badge
- **Production:** `/money` · empty; explicitly refuses invented savings

### Reservations intelligence — DEMO ONLY
- **Paths:** `lib/radr/reservationDemo.ts`, `DemoReservationAdapter`, `ReservationPulse`
- **Labels:** Simulated reservation intelligence · Demo

### Waitlist — PARTIAL
- **Paths:** `lib/radr/domain/waitlist.ts`, `waitlistRecovery.ts`, DB `waitlistEntries`, Butler `get_waitlist`
- **Evidence:** Domain + matching algorithm + demo numbers. No commercial waitlist sync. No dedicated waitlist page.

### Cancellation recovery — DEMO ONLY
- **Paths:** `lib/radr/scenarios/cancellationRecovery.ts`, findings detail
- **Labels:** `environment: "DEMO"` · Simulated time
- **Evidence:** Full detect → match → accept → seat → POS → verify loop on scenario store

### Forecast — PARTIAL
- **Paths:** `app/app/forecast/page.tsx`, `lib/radr/forecast/service.ts`, `FORWARD_WEEK` pulse
- **Evidence:** Real `computeForecast()` over demo operating context; UI also hard-wires pulse numbers. No live demand feed.

### Service Map / floor plan — DEMO ONLY
- **Paths:** `app/app/service/page.tsx`, `ServiceMap.tsx`, `berlinFloor.ts`
- **Labels:** Simulated floor intelligence · Demo · Not a live POS / reservation feed

### Location comparison — DEMO ONLY
- **Paths:** `app/app/compare/page.tsx`, `comparisonService.ts`
- **Evidence:** Compare over demo catalog; FX notes illustrative

### Multi-location views — DEMO ONLY
- **Paths:** `/app/locations`, group Control Center scope, 18 synthetic locations
- **Production:** Onboarding creates one location; no group intelligence on real tenants

### Ask RADR / Butler — PARTIAL
- **Paths:** `app/api/ask-radr/route.ts`, `lib/ai/*`, `lib/radr/butler/*`, `components/product/ask/*`
- **Evidence:**
  - Always tool-grounded on demo operating data
  - OpenAI optional (`OPENAI_API_KEY`) for intent/plan only; numbers never invented by LLM
  - Rate limit 30/min; DEMO anonymous capped to Berlin + location_manager
  - 16 Ask tools (location, group, revenue, margin, reservations, waitlist, cancellations, service, labor, suppliers, findings, verified value, forecast, compare, freshness…)
- **Marketing rule:** Label PRODUCT PREVIEW or SIMULATED EXAMPLE. Do not claim production AI.

### Data provenance / explanations — PARTIAL
- **Paths:** `lib/radr/provenance.ts`, `MetricExplain.tsx`, terminology registry
- **Evidence:** Works in demo (tooltips, cancellation provenance). No live provider lineage.

### Data health / sources — PARTIAL
- **Demo:** `/app/data` · simulated health + fake upload animation
- **Production:** `/sources` · Live document upload; connectors marked Building

### Notifications — PLANNED
- **Paths:** `lib/platform/notifications.ts`
- **Evidence:** Preference model only. No email/Slack senders. Settings: no delivery claimed.

### Onboarding — WORKING
- **Paths:** `OnboardingFunnel`, `lib/onboarding.ts`, `/api/onboarding`, `/onboarding/preview`
- **Evidence:** Creates org + location + OWNER membership + audit entries. Can route to `/app` (explore) or `/home` (production shell).

### Authentication — WORKING (email reset incomplete)
- **Paths:** `lib/auth.ts` (better-auth), `/api/auth/[...all]`, login/signup/forgot/reset
- **Evidence:** Email/password + sessions + rate limits. Password reset logs URL in dev; production email provider not wired. **Does not gate `/app`.**

### RBAC / permissions — PARTIAL
- **Paths:** `lib/platform/rbac.ts`, `lib/authz.ts` (OWNER/ADMIN/MEMBER for uploads)
- **Evidence:** Org roles enforce uploads. Butler uses scope permissions. `/app` settings: role views **not enforced** on demo.

### Integrations — PARTIAL
- **SSOT:** `lib/integrations/registry.ts`
- **Available:** `radr-demo-reservations` (synthetic), `files-csv` (document upload)
- **Everything else:** planned / partner_access / custom (Toast, Square, OpenTable, SevenRooms, Deputy, Xero, Stripe payments ingest, delivery apps, warehouse…)
- **Shipped adapter code:** Demo Reservation only
- **Contradiction risk:** Demo UI (`lib/product/demo/integrations.ts`) shows CONNECTED for providers that registry marks planned

### Developer API — DEMO ONLY / design preview
- **Paths:** `/developers/api`, `openapi/radr-v1.yaml`
- **Labels:** Design preview · proposed until authenticated handlers ship
- **Evidence:** No `/api/v1/*` handlers. Example host invalid.

### Webhooks — PLANNED
- **Paths:** docs + `signWebhookPayload` / `verifyWebhookSignature` in security helpers
- **Evidence:** Crypto helpers + docs. No outbound runtime or inbound webhook route.

### Custom connector — PLANNED
- **Paths:** `/developers/connectors`
- **Evidence:** Architecture narrative only

### CSV / file import — PARTIAL
- **Evidence:** Auth-gated document upload to private storage works. Structured CSV→domain mapping documented, not automated. Demo data page fakes mapping steps.

### Warehouse connectivity — PLANNED
- **Registry:** `byod-warehouse` status `custom`. Architecture only.

### Billing / Stripe subscriptions — NOT IMPLEMENTED
- **Paths:** `lib/platform/billing.ts` (types + 14-day trial stub), `pricingConfig.billingLive: false`
- **Evidence:** No `stripe` package. No Checkout. Stripe in registry = planned **payments data** connector, not RADR SaaS billing.
- **Labels:** COMING SOON / Billing not live

### Team management — DEMO ONLY (UI) / PARTIAL (org)
- **Demo:** `/app/team` uses demo user catalog
- **Real:** Membership created at onboarding; no invite/admin UI

### Audit log — PARTIAL
- **Paths:** `lib/audit.ts`, `auditLogs` schema
- **Evidence:** Writes on org create + document upload/delete. No product UI to view logs.

### Live / sandbox architecture — PARTIAL
- Sandbox not available unless flag set; labeled COMING SOON. LIVE not implied without config.

### Demo environment — WORKING
- Explicit Demo / Simulated labels throughout `/app`. Primary shipped product experience today.

---

## Status tally

| Status | Approx. count |
|--------|---------------|
| WORKING | 3 (Auth, Onboarding, Demo environment) |
| PARTIAL | ~12 |
| DEMO ONLY | ~12 |
| PLANNED | ~5 |
| BUILDING | marked on prod Sources connectors |
| NOT IMPLEMENTED | Billing, production intelligence content |

---

## Marketing honesty gates

1. Never say a commercial provider is CONNECTED unless `registry.status === "available"` and a real adapter exists.
2. Never sell Verified Value, Findings, Forecast, Service Map, or Ask RADR as live production without live tenant data.
3. Ask RADR on marketing = PRODUCT PREVIEW / SIMULATED EXAMPLE.
4. `/app` is a demo. Primary commercial CTA should open demo or request access, not imply paid product is live.
5. Pricing must say billing is not live until Stripe checkout exists.

---

## Related documents

- [`RADR_FEATURE_MATRIX.md`](./RADR_FEATURE_MATRIX.md) — marketing / pricing source of truth + proposed IA
- `docs/platform/PROVIDER_MATRIX.md` — provider detail
- `lib/radr/terminology.ts` — product vocabulary SSOT
