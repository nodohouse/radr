# RADR Provider Matrix

Last updated: 2026-08-24

**Rule:** Populate capabilities only from official provider documentation or confirmed partner access. Never infer from marketing pages alone. RADR implementation status is separate from "provider has an API".

## Status legend

| Status | Meaning |
|--------|---------|
| `available` | Production RADR integration exists |
| `beta` | Works but restricted / early |
| `building` | Actively being implemented in RADR |
| `planned` | Architecture support planned; not built |
| `custom` | Possible via custom / customer-provided access |
| `partner_access` | Requires provider partnership / authorization before RADR can implement |

## Access type

`PUBLIC_API` · `PARTNER_API` · `CUSTOMER_SUPPLIED` · `WEBHOOK` · `FILE_EXPORT` · `CUSTOM`

## Capability matrix (RADR implementation)

Legend: ✓ planned target once access exists · – not expected · ? confirm with official docs before coding

| Provider | Category | Access type | RADR status | Orders | Reservations | Waitlist | Labor | Invoices | Payouts |
|----------|----------|-------------|-------------|--------|--------------|----------|-------|----------|---------|
| RADR Demo Reservations | reservations | PUBLIC_API (synthetic) | **available** | – | ✓ | ✓ | – | – | – |
| Files / CSV / Documents | custom | FILE_EXPORT | **available** | ✓* | ✓* | – | ✓* | ✓* | ✓* |
| Toast | pos | PARTNER_API / CUSTOM | planned + partner_access | ✓ | – | – | – | – | ? |
| Square | pos | PUBLIC_API (confirm scopes) | planned | ✓ | – | – | – | – | ✓ |
| Lightspeed Restaurant | pos | PARTNER_API (confirm) | planned | ✓ | – | – | – | – | – |
| Clover | pos | PARTNER_API (confirm) | planned | ✓ | – | – | – | – | – |
| Oracle MICROS / Simphony | pos | PARTNER / CUSTOM | planned + partner_access | ✓ | – | – | – | – | – |
| NCR Aloha | pos | PARTNER / CUSTOM | planned + partner_access | ✓ | – | – | – | – | – |
| TouchBistro | pos | confirm | planned | ✓ | – | – | – | – | – |
| SumUp POS | pos | confirm | planned | ✓ | – | – | – | – | – |
| Revel Systems | pos | confirm | planned | ✓ | – | – | – | – | – |
| Epos Now | pos | confirm | planned | ✓ | – | – | – | – | – |
| OpenTable | reservations | PARTNER_API | planned + partner_access | – | ✓ | ? | – | – | – |
| SevenRooms | reservations | PARTNER_API | planned + partner_access | – | ✓ | ✓ | – | – | – |
| Resy | reservations | PARTNER / CUSTOM | planned + partner_access | – | ✓ | ? | – | – | – |
| TheFork | reservations | PARTNER (confirm) | planned | – | ✓ | ? | – | – | – |
| Quandoo | reservations | confirm | planned | – | ✓ | ? | – | – | – |
| Zenchef | reservations | confirm | planned | – | ✓ | ? | – | – | – |
| CoverManager | reservations | confirm | planned | – | ✓ | ? | – | – | – |
| Deputy | labor | PUBLIC_API | planned | – | – | – | ✓ | – | – |
| Planday | labor | confirm | planned | – | – | – | ✓ | – | – |
| 7shifts | labor | confirm | planned | – | – | – | ✓ | – | – |
| Fourth | labor | PARTNER (confirm) | planned | – | – | – | ✓ | – | – |
| Personio | labor | PUBLIC_API (confirm) | planned | – | – | – | ✓ | – | – |
| Workday / UKG | labor | ENTERPRISE / PARTNER | custom | – | – | – | ✓ | – | – |
| Xero | accounting | PUBLIC_API (OAuth) | planned | – | – | – | – | ✓ | – |
| QuickBooks Online | accounting | PUBLIC_API (OAuth) | planned | – | – | – | – | ✓ | – |
| Sage | accounting | confirm | planned | – | – | – | – | ✓ | – |
| NetSuite | accounting | PARTNER / CUSTOM | custom | – | – | – | – | ✓ | – |
| DATEV | accounting | PARTNER / CUSTOM | custom | – | – | – | – | ✓ | – |
| SAP | accounting | ENTERPRISE | custom | – | – | – | – | ✓ | – |
| Stripe | payments | PUBLIC_API | planned | – | – | – | – | – | ✓ |
| Adyen | payments | PARTNER | planned + partner_access | – | – | – | – | – | ✓ |
| Mollie | payments | PUBLIC_API | planned | – | – | – | – | – | ✓ |
| Worldline | payments | PARTNER (confirm) | planned | – | – | – | – | – | ✓ |
| Uber Eats / Deliveroo / DoorDash / Just Eat / Wolt / Glovo | delivery | PARTNER | planned + partner_access | ✓ | – | – | – | – | ✓ |
| MarketMan / Apicbase / Choco / … | purchasing | confirm | planned | – | – | – | – | ✓ | – |
| TrueLayer / Tink / Plaid | banking | PARTNER + user consent | planned + partner_access | – | – | – | – | – | ✓ |
| Open-Meteo | external | PUBLIC_API | planned | – | – | – | – | – | – |
| PredictHQ | external | PARTNER / commercial | planned | – | – | – | – | – | – |

\* File ingest supports many entity types via mapping contracts; not automatic vendor sync.

## Reviewed official sources (sample)

| Provider | Official docs | Notes | Reviewed |
|----------|---------------|-------|----------|
| Toast | https://doc.toasttab.com/ | Partner / custom / standard API access paths; OAuth client credentials | 2026-08-24 |
| SevenRooms | https://api-docs.sevenrooms.com/ | Docs gated; partnership form for new integrators | 2026-08-24 |
| OpenTable | https://www.opentable.com/restaurant-solutions/api-partners/ | Partner network required | 2026-08-24 |
| Deputy | https://developer.deputy.com/ | Public REST API; OAuth or permanent token | 2026-08-24 |

## Registry source of truth

Typed registry: `lib/integrations/registry.ts`  
Marketing `/developers` and docs **must** import from this registry; no duplicate hardcoded lists.
