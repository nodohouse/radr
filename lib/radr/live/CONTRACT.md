# Live Shift contracts

## Intent

Reconstruct the economic state of the current hospitality shift from normalized operating events. Backend owns recognition and aggregation; clients subscribe to `ShiftEconomicState`.

## Environments

| Mode | Behavior |
|------|----------|
| DEMO / SANDBOX | Deterministic illustrative stream (`demoStream.ts`). Always labeled **Illustrative live data**. |
| LIVE | Enabled only when `NEXT_PUBLIC_LIVE_SHIFT_FEEDS=true` and `NEXT_PUBLIC_FEATURE_LIVE_SHIFT` is not `false`. Never invent production numbers. |

## Recognition (no double counting)

1. `SALE` / settled `DELIVERY_ORDER` — recognize gross + net once (stable event id).
2. `PAYMENT` with `settlementOfSaleId` — increments `paymentsReceived` only.
3. `REFUND` / `VOID` — reverse net (and gross for VOID).
4. `DISCOUNT` / `COMP` — leakage buckets; reduce net once.
5. `CHECK_OPENED` — open value only until a SALE settles that check.
6. `DEPOSIT` — held value; not net sales until earned.
7. `FEE` — delivery/platform fees; not net sales.

## Transport (future LIVE)

Prefer WebSocket or SSE subscription to location+service topic. Polling only as fallback. Surface source freshness on every frame.

## Types

See `types.ts`: `OperatingEvent`, `ShiftEconomicState`, `WhatChangedWindow`, `RevenueBridge`.
