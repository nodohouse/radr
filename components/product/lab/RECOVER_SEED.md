# LAB Margin & Recovery seeds — sales demo

## Law

**Sales demo = one Decision card → Trace → stop.**

- No labor tour · no GL chrome · no Wait-12 / hotel on this path
- Verified € only when sealed Trace chain exists
- Incomplete chain → **Expected** only (no fake Verified)
- Autopilot: draft credit request OK · never auto short-pay / auto-remit
- Max 2–3 sources: invoice + contract + (POS or menu/recipe)

## Seeds

| Seed | Path | Story | Grade |
|------|------|-------|-------|
| `recover` | `?seed=recover` | Credit issued, never applied (D-4102) | **Verified** when sealed |
| `margin-response` | `?seed=margin-response` | Two sites, same supplier, different unit price (D-4108) | **Expected** until seal |

## Fixtures

### credit-not-applied — `TRACE_SUPPLIER_VERIFIED`

`invoice_id` + `invoice_line_id(s)`
→ evidence → finding `recover.ap.credit_expected_unapplied`
→ `credit_memo_id` → `applied_to` + `doc_ref`
→ `verified_€` = `applied_amount` → `sealed_at`

INV-88421-L03 · CM-44102 · AP-POST-991 · €273

### two-site-price-gap — `TRACE_TWO_SITE_EXPECTED`

INV-88421 (Mitte €7.45/L) · INV-88502 (Prenzlauer Berg €6.80/L) · CTR-OIL-2026  
Finding: `recover.ap.two_site_unit_price_gap` · €410 **Expected** (no CM apply yet)

## Buyer kill test

If UI shows Verified € without a Trace path Finance can match to AP → ship block.  
Coke / teaching demos only — discovery leads with *their* variance first.
