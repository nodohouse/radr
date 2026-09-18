# LAB Recover seed — sales demo

**Path:** `/app/lab/control-center?seed=recover`

## Law

Sales demo = **exactly one** AP-matched credit → Trace → stop.

- No labor tour
- No GL chrome
- No Wait-12 on this seed
- Verified € only when sealed Trace chain exists
- Autopilot: draft credit request OK · never auto short-pay / auto-remit

## Sealed chain (D-4102 · €273 Verified)

`invoice_id` + `invoice_line_id(s)`
→ evidence (qty/price/UOM delta; GRN optional)
→ finding `recover.ap.credit_expected_unapplied`
→ `credit_memo_id`
→ `applied_to` (invoice_id or payment_id) + `doc_ref`
→ `verified_€` = `applied_amount` (not estimate)
→ `sealed_at`

Fixture: `TRACE_SUPPLIER_VERIFIED` in `labLineage.ts`  
Vendor: Bluefin Berlin · Site: Berlin Mitte · Aging: 11d  
INV-88421-L03 · CM-44102 · AP-POST-991 · €273 applied

## Buyer kill test

If UI shows Verified € without a Trace path Finance can match to AP → ship block.
