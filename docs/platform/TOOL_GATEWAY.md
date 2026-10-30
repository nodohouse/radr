# RADR Tool Gateway

**Status:** Developer preview (2026.09)  
**Not** production MCP hosting. **Not** enterprise OAuth.

## Purpose

One domain truth layer consumed by:

- Control Center / Live / Value (UI)
- Ask RADR
- REST preview (`/api/tools/[name]`)
- MCP adapter (`lib/radr/tools/mcpAdapter.ts`)

```
Domain selectors → Tool Gateway → UI | Ask | REST | MCP
```

## Contracts

Each call returns:

| Field | Meaning |
|---|---|
| `tool` | Stable tool name |
| `version` | Gateway version |
| `tenantScope` | Org id |
| `locationScope` | Location or `all` |
| `period` | live / today / wtd / mtd / ytd |
| `evidenceState` | OBSERVED · MODELED · ACCRUED · SETTLED · MIXED |
| `provenance` | Source refs |
| `data` | Structured payload |
| `error` | Null on success |
| `gated` | True for write tools (disabled in preview) |
| `requestId` | Trace id |
| `latencyMs` | Observation |

## Read tools

`get_group_pulse` · `get_location_status` · `get_live_service` · `get_revenue_pace` · `get_money_flow` · `get_inventory_risk` · `get_decisions` · `get_decision` · `get_decision_trace` · `get_futures` · `get_verified_value` · `get_data_health` · `get_operating_memory` · `explain_variance`

Verified Value SoT: Decision ledger (`deriveValueAggregate` / `canonicalVerifiedTotal`) — not scenario-only fixtures.

## Gated write tools (preview stubs)

`approve_decision` · `prepare_supplier_dispute` · `release_inventory` · `adjust_channel_availability` · `prepare_shift_change` · `send_operator_message`

These return `gated: true` until RBAC + approval policy + audit are production-ready.

## Economics honesty

Economic amounts come from source data, deterministic calculations, and approved models — not generative invention. LLMs may interpret, summarize, classify, explain, and draft. They do not invent financial values, evidence, settlements, contract rates, inventory, forecasts, or Verified Value.

## Observability

`lib/radr/tools/observe.ts` records sanitized call metadata (no secrets / PII payloads).

## Versioning

`TOOL_GATEWAY_VERSION` in `contracts.ts`. Prefer additive changes. Deprecate tools with adapter aliases before removal.
