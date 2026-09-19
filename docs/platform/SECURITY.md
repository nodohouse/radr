# RADR Integration Security

Last updated: 2026-08-24

Supplements root `SECURITY.md` / `SECURITY_TODO.md` with integration-specific controls.

## What exists today

| Control | Status |
|---------|--------|
| Better Auth sessions | LIVE |
| Org membership authorization | LIVE |
| Private document storage | LIVE |
| Audit logs (sanitized metadata) | LIVE |
| Tenant isolation tests | LIVE |
| Integration credential encryption | PROPOSED |
| Inbound webhook signature verification | PROPOSED |
| Public API keys (hash + scopes) | PROPOSED |
| Rate limiting | IMPLEMENTED (`lib/security/rate-limit.ts`; Ask RADR + other API routes) |
| SOC 2 / ISO 27001 / PCI DSS certification | **NOT CLAIMED** |

Language: "Designed to support…" where accurate. Never claim certifications we do not have.

## Credential architecture (target)

```
Tenant
  → IntegrationConnection
      → Encrypted credentials (KMS / app-level encryption key)
```

Rules:

- Secrets from environment / secrets manager only
- Never in React / `NEXT_PUBLIC_*` / fixtures / screenshots
- Never return provider secrets to the browser after connect
- Support rotation, revocation, OAuth refresh, disconnect
- Docs use placeholders: `TOAST_CLIENT_ID=your_client_id`

## OAuth (generic, server-side)

1. Server creates `state` (+ PKCE where applicable)  
2. Provider authorization  
3. Callback verifies state  
4. Server exchanges code  
5. Encrypt tokens at rest  
6. Initial backfill  
7. Mark connection healthy  

No OAuth secret exchange in the frontend.

## Webhooks

Inbound: verify signature per **official provider docs** (raw body when required).
Then: idempotency → durable queue → normalize → domain recalc.

Never invent a universal signature scheme.

Outbound (proposed): HMAC signature, event IDs, retries, consumer idempotency.

## Data minimization / GDPR

Prefer: reservation ID, party size, time, status, booking source.  
Avoid: name, email, phone, private notes unless a specific workflow requires them.

Document retention, deletion, export, and tenant separation as product capabilities mature.

## PCI

Do not ingest PAN, CVV, or track data. Use payment-provider transaction identifiers only.

## Observability without leaking secrets

Log: request ID, connection ID, provider, tenant, duration, result, records, cursor, error class.  
Never log: credentials, access tokens, card data, unnecessary guest PII.

## Integration health states

`CONNECTED` · `SYNCING` · `HEALTHY` · `STALE` · `ERROR` · `DISCONNECTED`

Expose last successful sync, last attempt, latency, records, error summary → product Data Health.
