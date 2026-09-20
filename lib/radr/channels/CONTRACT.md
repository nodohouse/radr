# Channel Economics — contract

## Purpose

Answer **which channel creates value** — not only where sales come from.

RADR connects POS, delivery aggregators, takeaway, payments, refunds, promotions,
commissions, packaging, menu mix, COGS, and labor into a **revenue quality** picture.

A €50 dine-in order and a €50 delivery order are **not** economically identical.

## Terminology

| Use | Do not use |
|-----|------------|
| Live contribution (by channel) | “Profit by channel” |
| Contribution share vs revenue share | Ranking channels by revenue alone |
| Effective commission rate | Assuming contract rate = charged rate |
| Prepared pause / reprice | Auto-disable channels without approval |

## Double-count rule

POS and aggregator feeds may describe the **same** order. Reconciliation keys:

- provider order ID
- POS order ID
- settlement ID

Never add delivery gross twice into net sales or contribution.

## Confidence

Same vocabulary as Financial Operating Layer (`complete` | `estimated` | `partial` | `stale`).
COGS, packaging, and incremental labor are typically **estimated**. Commissions may be **partial** until settlement.

## Permissions / execution

- **Observe → Explain → Prepare → Approval** for pause delivery, radius, availability, reprice, menu remove, promo end, commission dispute.
- Never automatically disable a channel without explicit authorization and write-capable integration.
- Individual guest identity across platforms: only when matching is legitimate and confident.

## Phase 1 (shipped)

Berlin Mitte LIVE dinner demo:

- Revenue mix (dine-in / delivery / takeaway)
- Normalized `DeliveryChannel` provider breakdown (registry-backed IDs)
- Revenue share vs contribution share
- Per-channel contribution lines + dine-in vs delivery margin bridge
- Channel quality strip
- Compact live channel mix
- Delivery pressure + pause recommendation (approval required)
- Commission variance + promotion economics (demo)
- Delivery menu contribution outliers (demo)
- Role compact briefs (CFO / COO / Owner / Finance / GM)

## Explicitly later

Accounting category mappings, full settlement→bank→ledger trace, weather/footfall channel forecast,
cross-platform identity graphs, Ask RADR full intent suite, write adapters for pause/radius.
Scaffold types and CONTRACT notes keep Phase 1 honest.
