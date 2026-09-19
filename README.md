# RADR

Hospitality operating and financial intelligence. Next.js App Router.

## Apps

| Surface | Path | Notes |
|---------|------|-------|
| Marketing site | `/`, `/product`, `/developers`, … | Public |
| Control Center demo | `/app` | Ungated demo; synthetic data |
| Authenticated product | `/home`, `/documents`, … | Better Auth session |

## Local setup

```bash
cp .env.example .env.local
# Fill BETTER_AUTH_SECRET (openssl rand -hex 32)
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:3000

## Environment

See `.env.example`. **Never commit real secrets.** Integration placeholders use empty values only.

## Developer platform

- Public hub: [`/developers`](http://localhost:3000/developers)
- Foundation docs: `docs/platform/`
- Engineer docs: `docs/developers/`
- Provider registry (SSOT): `lib/integrations/registry.ts`
- Adapter contracts: `lib/integrations/adapters/`
- Reference adapter: `lib/integrations/demo/DemoReservationAdapter.ts`
- Proposed OpenAPI: `openapi/radr-v1.yaml` (not live until handlers ship)

### Add an integration

Follow `docs/developers/ADDING_AN_INTEGRATION.md`. Confirm official provider docs before coding endpoints. Do not mark a provider `available` until shipped and validated.

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run db:migrate
```

## Security

See `SECURITY.md`, `SECURITY_TODO.md`, and `docs/platform/SECURITY.md`.

No SOC 2 / ISO / PCI certification claims unless obtained.
