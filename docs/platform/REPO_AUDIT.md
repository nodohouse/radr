# Repo Architecture Audit · Developer Platform

Last updated: 2026-08-24

## Stack

Next.js 15 App Router · React 19 · Drizzle + PGlite/Postgres · Better Auth · Zod · Vitest

## Existing reusable infrastructure

| Asset | Path | Reuse |
|-------|------|-------|
| Auth sessions | `lib/auth.ts`, `app/api/auth/[...all]` | Human users |
| Authz | `lib/authz.ts` | Tenant checks for future API keys |
| Org / location schema | `lib/db/schema.ts` | Tenant root |
| Documents upload | `app/api/documents/**`, `lib/storage.ts` | File ingest LIVE path |
| Audit log | `lib/audit.ts` | Integration connect / sync events |
| Validation | `lib/validation.ts` | Ingest schema patterns |
| Ingest honesty (marketing) | `components/marketing/config/architecture.ts` | Align with registry |
| Demo connectors UI | `lib/product/demo/integrations.ts` | Keep demo-only; do not conflate |
| Currency helpers | `lib/radr/currency.ts` | Extend toward CurrencyService |
| Findings / reservations domain | `lib/radr/*` | Normalization targets for intelligence |

## Existing API routes (real)

- `POST/GET` Better Auth  
- `POST` onboarding  
- Documents upload / download / delete  

No public `/v1`, no inbound webhooks, no vendor adapters.

## Missing backend components (priority order)

1. IntegrationConnection + encrypted credentials schema  
2. Adapter interfaces + DemoReservationAdapter (this delivery)  
3. Normalizers + idempotent ingest persistence  
4. Queue / async worker for webhooks  
5. API key auth for `/v1`  
6. OpenAPI-aligned route handlers  
7. Provider adapters (incremental, after partnership)  
8. Outbound webhooks  
9. CurrencyService + FX provider  
10. Data Health backed by real sync metadata  

## Recommended implementation sequence

1. Foundation docs + registry + `/developers` (this pass)  
2. Schema for connections + credential encryption  
3. Secure ingest endpoints (reservations first) + fixtures  
4. Demo adapter end-to-end in sandbox  
5. Deputy or similar **public** API labor adapter (customer-supplied token) as first real connector  
6. Partner applications: Toast, SevenRooms, OpenTable in parallel commercially  
7. Payments (Stripe) + accounting (Xero) once OAuth vault exists  
8. Delivery / banking only with partner agreements  

## Risks / unknowns / partnerships

- Toast, SevenRooms, OpenTable, major delivery apps require **partner access**; timeline unknown  
- Regional POS (MICROS, Aloha) often custom / enterprise  
- Open banking requires explicit user authorization + suitable legal basis  
- `.env*` gitignore currently hides `.env.example`; fix with exception  
- Dual apps (`/app` demo vs `/(app)` live) must not expose integration secrets on ungated demo  
- Do not run 30 commercial integrations before platform is solid  

## What this pass ships

- `docs/platform/*` foundation  
- `docs/developers/**` structure  
- `lib/integrations/*` registry + adapters + demo  
- `openapi/radr-v1.yaml` (proposed)  
- `/developers` public page  
- `.env.example` placeholders + gitignore fix  
- README developer section  
