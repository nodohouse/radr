# Toast

**Last reviewed:** 2026-08-24  
**Official documentation:** https://doc.toasttab.com/  
**RADR status:** partner_access · planned  
**API access type:** PARTNER_API / CUSTOM / STANDARD (Toast program-dependent)

## Why RADR connects

Locations, orders/checks, line items, payments, discounts, refunds, tax, channels, timestamps.

## Authentication (placeholders)

```
TOAST_CLIENT_ID=your_client_id
TOAST_CLIENT_SECRET=your_client_secret
TOAST_WEBHOOK_SECRET=your_webhook_secret
```

Credentials are issued after Toast Integrations approval (partner/custom) or via Toast Web for standard API access; see official docs. Never put secrets in frontend code.

## Authentication flow

OAuth 2 client-credentials style machine client per Toast developer guide. Exact paths must be taken from current official docs at implementation time.

## RADR normalization

Toast Order → RadrOrder · LineItem → RadrOrderItem · Restaurant → RadrLocation

## Sync

Historical backfill + incremental + webhooks when available. Rate limits: follow Toast official limits; do not invent.

## Implementation

**Not shipped.** Adapter stubs only. Confirm partnership before coding endpoints.
