# RADR Normalized Data Model

Last updated: 2026-08-24

## Principles

- Money as `{ amountMinor: number, currency: string }`; never untyped floats for money.
- Every record carries provenance: `sourceProvider`, `sourceConnectionId`, `externalId`, `ingestedAt`.
- Prefer operational evidence over guest PII.
- Derived values keep lineage so users can ask: where did this number come from?

## Core entities

### Organization
Tenant root. Fields: `id`, `name`, `reportingCurrency`, `createdAt`.

### Location
`id`, `organizationId`, `name`, `city`, `country`, `timezone`, `currency`, `externalIds[]`.

### ServicePeriod
`id`, `locationId`, `date`, `daypart?`, `opensAt`, `closesAt`.

### Reservation
`id`, `locationId`, `externalId`, `serviceTime`, `partySize`, `status`,
`bookingChannel?`, `tableExternalId?`, `section?`, `deposit?`, `cancelledAt?`,
`noShow?`, `sourceUpdatedAt`, provenance…

**Avoid by default:** guest name, phone, email, private notes.

### WaitlistEntry
`id`, `locationId`, `requestedAt`, `requestedServiceTime`, `partySize`, `status`,
`seatingPreference?`, `quotedWaitMinutes?`, `actualWaitMinutes?`, `source`,
`reservationId?`.

Used for: cancellation recovery, capacity, lost demand, service pressure.

### Table / Floor
Floor geometry + table capacity for Service Map (existing demo: `lib/radr/floorModel.ts`).

### Order / OrderItem
POS check: totals, channel, items, modifiers, discounts, tax, service charges, timestamps.

### Payment / Refund
Provider transaction IDs, amounts, fees; **never** PAN/CVV.

### LaborShift
Role/location IDs, scheduled vs actual times, breaks, labor cost, FOH/BOH. Minimize HR PII.

### Supplier / Contract / PurchaseOrder / Invoice / InvoiceLine / Credit
BUY territory. Keep source accounting identifiers. Never overwrite accounting-source truth.

### DeliveryOrder / Payout
Marketplace gross, fees, adjustments, expected vs actual payout → RECOVER.

### Forecast / Finding / Recommendation / Action / Verification
Intelligence layer outputs with lineage pointers to source evidence.

### IntegrationConnection / DataSource / DataSync
Connection health, cursors, last success/error (PROPOSED schema).

### CurrencyRate
`from`, `to`, `rate`, `asOf`, `provider`. Do not silently convert; store original currency.

## Money example

```json
{
  "amountMinor": 16600,
  "currency": "EUR"
}
```

## Provenance example

```json
{
  "sourceProvider": "demo_reservations",
  "sourceConnectionId": "conn_demo",
  "externalId": "res_abc123",
  "sourceUpdatedAt": "2026-08-24T18:02:00+02:00",
  "ingestedAt": "2026-08-24T18:02:11Z"
}
```

## Lineage example (€166 at risk)

1. Reservation: provider external id  
2. Expected spend: POS historical model  
3. Replacement probability: RADR cancellation model  
4. Waitlist: matching waitlist entries  
5. Last calculated: timestamp  

## Existing code touchpoints

- Demo findings / exposure: `lib/radr/priorityFindings.ts`, `servicePulse.ts`
- Reservation demo: `lib/radr/reservationDemo.ts`, `reservationModel.ts`
- Currency helpers: `lib/radr/currency.ts`
- Tenant tables today: `lib/db/schema.ts` (org, location, documents; not full model above)
