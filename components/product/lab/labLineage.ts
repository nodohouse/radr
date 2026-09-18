/**
 * Book-matchable Trace lineage for LAB.
 * No Trace → no Verified grade on that line.
 * Sales demo (recover): ONE sealed AP credit → Trace → stop.
 */

export type MoneyGrade = "Expected" | "Verified" | "Unverified";

export type TraceChainLink = {
  id: string;
  label: string;
  value: string;
  because: string;
};

export type TraceLineage = {
  decisionId: string;
  displayId: string;
  amountEuro: number;
  grade: MoneyGrade;
  /** Absent → UI must not show Verified */
  hasTrace: boolean;
  /** Sealed = Verified € allowed */
  sealed: boolean;
  sealedAt?: string;
  sourceSystem: string;
  documentRefs: { label: string; value: string }[];
  /** Full Eng lineage for Recover sales demo */
  chain?: TraceChainLink[];
  window: string;
  matchChecklist: { label: string; done: boolean }[];
  note: string;
  because: string;
};

/** D-1911 Wait-12 — modeled contribution. Expected only. Not sales Recover path. */
export const TRACE_PEAK_EXPECTED: TraceLineage = {
  decisionId: "dec_peak_berlin",
  displayId: "D-1911",
  amountEuro: 620,
  grade: "Expected",
  hasTrace: true,
  sealed: false,
  sourceSystem: "POS · Kitchen · Delivery (modeled)",
  documentRefs: [
    { label: "Basis", value: "Wait-12 vs seat-now contribution delta" },
    { label: "Sample", value: "12 comparable Friday services" },
    { label: "Verify via", value: "POS contribution · turn close · delivery settlement" },
  ],
  window: "Tonight · decide by 18:53",
  matchChecklist: [
    { label: "POS contribution delta after service", done: false },
    { label: "Second-turn completion count", done: false },
    { label: "Delivery settlement adjustment (if throttled)", done: false },
  ],
  note: "Not Verified Value — no ledger match yet.",
  because: "Modeled contribution if Wait-12 holds — not cash until Trace seals after service",
};

/**
 * SALES DEMO — one AP-matched credit with sealed chain.
 * invoice_line → evidence → finding → credit_memo applied + doc_ref → Verified € = applied_amount.
 * Path: ?seed=recover → Trace → stop. No labor / GL / Wait-12 on this seed.
 */
export const TRACE_SUPPLIER_VERIFIED: TraceLineage = {
  decisionId: "dec_supplier_berlin",
  displayId: "D-4102",
  amountEuro: 273,
  grade: "Verified",
  hasTrace: true,
  sealed: true,
  sealedAt: "2026-09-17T14:22:00Z",
  sourceSystem: "AP · Contract · Invoice · Credit memo",
  documentRefs: [
    { label: "invoice_id", value: "INV-88421" },
    { label: "invoice_line_id", value: "INV-88421-L03 · frying oil 420 L" },
    { label: "credit_memo_id", value: "CM-44102" },
    { label: "applied_to", value: "INV-88421" },
    { label: "doc_ref", value: "AP-POST-991" },
    { label: "vendor", value: "Bluefin Berlin · site Berlin Mitte" },
    { label: "aging", value: "11 days · opened 06 Sep" },
  ],
  chain: [
    {
      id: "invoice",
      label: "Invoice",
      value: "INV-88421 · line L03 · €7.45/L × 420 L",
      because: "Vendor billed above contracted unit price on frying oil",
    },
    {
      id: "evidence",
      label: "Evidence",
      value: "Contract CTR-OIL-2026 €6.80/L · Δ €0.65/L · optional GRN DN-39104",
      because: "Price delta is the recoverable amount — qty and UOM matched",
    },
    {
      id: "finding",
      label: "Finding",
      value: "recover.ap.credit_expected_unapplied",
      because: "Credit was expected on the stack but not yet cashed to books",
    },
    {
      id: "credit_memo",
      label: "Credit memo",
      value: "CM-44102 · €273 applied_amount",
      because: "Supplier issued credit equal to the line variance",
    },
    {
      id: "applied",
      label: "Applied",
      value: "applied_to INV-88421 · doc_ref AP-POST-991",
      because: "Finance can match this post to the same invoice in AP",
    },
    {
      id: "verified",
      label: "Verified €",
      value: "€273 = applied_amount · sealed_at 2026-09-17",
      because: "Verified euro equals applied cash — not an estimate",
    },
  ],
  window: "Recover · sealed 17 Sep · Berlin Mitte",
  matchChecklist: [
    { label: "Match INV-88421 line L03 variance in AP", done: true },
    { label: "Credit memo CM-44102 posted to supplier ledger", done: true },
    { label: "applied_to INV-88421 · doc_ref AP-POST-991", done: true },
    { label: "Verified €273 = applied_amount", done: true },
  ],
  note: "Sales demo = this one credit → Trace → stop.",
  because: "INV-88421 line variance matched CM-44102 applied to the same invoice",
};

/** @deprecated use TRACE_SUPPLIER_VERIFIED for sales Recover seed */
export const TRACE_SUPPLIER_EXPECTED = TRACE_SUPPLIER_VERIFIED;

/** Example Verified line — tuna (not Recover sales path). */
export const TRACE_TUNA_VERIFIED: TraceLineage = {
  decisionId: "dec_tuna_berlin",
  displayId: "D-1842",
  amountEuro: 1590,
  grade: "Verified",
  hasTrace: true,
  sealed: true,
  sealedAt: "2026-09-12T22:10:00Z",
  sourceSystem: "POS · Inventory",
  documentRefs: [
    { label: "POS close", value: "SVC-0912-BM · peak contribution" },
    { label: "Stock adjustment", value: "INV-ADJ-441 · shortfall covered" },
  ],
  window: "Verified · night of 12 Sep",
  matchChecklist: [
    { label: "POS contribution protected vs seat-now baseline", done: true },
    { label: "Inventory adjustment closed", done: true },
  ],
  note: "Peak contribution protected · POS close",
  because: "POS close matched stock adjustment on the same service night",
};

export function traceForDecision(id: string): TraceLineage | null {
  if (id === TRACE_PEAK_EXPECTED.decisionId || id === "d-1911")
    return TRACE_PEAK_EXPECTED;
  if (id === TRACE_SUPPLIER_VERIFIED.decisionId || id === "d-4102")
    return TRACE_SUPPLIER_VERIFIED;
  if (id === TRACE_TUNA_VERIFIED.decisionId || id === "d-1842")
    return TRACE_TUNA_VERIFIED;
  return null;
}

export const LAB_SEEDS = {
  service: {
    id: "service" as const,
    label: "Service · Wait 12",
    path: "/app/lab/control-center?seed=service",
  },
  recover: {
    id: "recover" as const,
    label: "Recover · one credit → Trace",
    path: "/app/lab/control-center?seed=recover",
  },
};
