/**
 * Book-matchable Trace lineage for LAB.
 * No Trace → no Verified grade on that line.
 * Recover seed: one applied AP credit → Value Trace → Verified recovered.
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
  note: "Expected until contribution matches after service.",
  because: "Modeled contribution if Wait-12 holds — not cash until verified after service",
};

/**
 * Recover demo — one AP-matched credit with a complete Value Trace.
 * Invoice → evidence → finding → credit applied → Verified recovered.
 * Path: ?seed=recover → Value Trace. No labor / GL / Wait-12 on this seed.
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
    { label: "Invoice", value: "INV-88421" },
    { label: "Invoice line", value: "INV-88421-L03 · frying oil 420 L" },
    { label: "Credit memo", value: "CM-44102" },
    { label: "Applied to", value: "INV-88421" },
    { label: "AP posting", value: "AP-POST-991" },
    { label: "Vendor", value: "Bluefin Berlin · site Berlin Mitte" },
    { label: "Aging", value: "11 days · opened 06 Sep" },
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
      value: "Contract CTR-OIL-2026 €6.80/L · Δ €0.65/L",
      because: "Price delta is the recoverable amount — qty and UOM matched",
    },
    {
      id: "finding",
      label: "Finding",
      value: "Contract price variance · €273 exposed",
      because: "Invoice exceeds contract · credit not yet applied",
    },
    {
      id: "credit_memo",
      label: "Credit memo",
      value: "CM-44102 · €273 applied",
      because: "Supplier issued credit equal to the line variance",
    },
    {
      id: "applied",
      label: "Applied",
      value: "Applied to INV-88421 · AP-POST-991",
      because: "Finance can match this post to the same invoice in AP",
    },
    {
      id: "verified",
      label: "Verified €",
      value: "€273 recovered · matched 2026-09-17",
      because: "Verified euro equals applied cash — not an estimate",
    },
  ],
  window: "Recover · verified 17 Sep · Berlin Mitte",
  matchChecklist: [
    { label: "Match INV-88421 line L03 variance in AP", done: true },
    { label: "Credit memo CM-44102 posted to supplier ledger", done: true },
    { label: "Applied to INV-88421 · AP-POST-991", done: true },
    { label: "Verified €273 recovered", done: true },
  ],
  note: "One recovery: leak → decision → action → credit → Verified.",
  because: "INV-88421 line variance matched CM-44102 applied to the same invoice",
};

/** @deprecated alias — recover seed uses Verified Trace */
export const TRACE_SUPPLIER_EXPECTED = TRACE_SUPPLIER_VERIFIED;

/** Example Verified line — tuna (not the Recover flagship). */
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
  if (id === TRACE_TWO_SITE_EXPECTED.decisionId || id === "d-4108")
    return TRACE_TWO_SITE_EXPECTED;
  if (id === TRACE_TUNA_VERIFIED.decisionId || id === "d-1842")
    return TRACE_TUNA_VERIFIED;
  return null;
}

/**
 * Two sites · same supplier · different unit price.
 * Expected only — incomplete until credit is applied.
 */
export const TRACE_TWO_SITE_EXPECTED: TraceLineage = {
  decisionId: "dec_two_site_oil",
  displayId: "D-4108",
  amountEuro: 410,
  grade: "Expected",
  hasTrace: true,
  sealed: false,
  sourceSystem: "AP · Contract · Multi-site invoice",
  documentRefs: [
    { label: "invoice_id · Mitte", value: "INV-88421" },
    { label: "invoice_id · Prenzlauer Berg", value: "INV-88502" },
    { label: "contract", value: "CTR-OIL-2026 €6.80/L" },
    { label: "vendor", value: "Bluefin Berlin · 2 sites" },
  ],
  chain: [
    {
      id: "invoice_a",
      label: "Invoice · Mitte",
      value: "INV-88421 · oil €7.45/L",
      because: "Site A billed above contracted unit price",
    },
    {
      id: "invoice_b",
      label: "Invoice · Prenzlauer Berg",
      value: "INV-88502 · oil €6.80/L",
      because: "Site B matches contract on the same week",
    },
    {
      id: "evidence",
      label: "Evidence",
      value: "Same vendor · same SKU · Δ €0.65/L · ~630 L gap week",
      because: "Systems calculate the multi-site unit-price variance",
    },
    {
      id: "finding",
      label: "Finding",
      value: "recover.ap.two_site_unit_price_gap",
      because: "Finance-owned wound — not a GM night-of decision",
    },
  ],
  window: "Recover · Expected · 2 sites",
  matchChecklist: [
    { label: "Match both invoices to CTR-OIL-2026", done: true },
    { label: "Confirm same SKU / UOM across sites", done: true },
    { label: "Credit memo applied", done: false },
    { label: "Verified € recovered", done: false },
  ],
  note: "Expected until the credit is applied. One recovery → Verified.",
  because:
    "Bluefin oil €7.45/L at Mitte vs €6.80/L at Prenzlauer Berg on the same contract week",
};

export const LAB_SEEDS = {
  service: {
    id: "service" as const,
    label: "Service · Wait 12",
    path: "/app/lab/control-center?seed=service",
  },
  recover: {
    id: "recover" as const,
    label: "Recover · credit → Trace",
    path: "/app/lab/control-center?seed=recover",
  },
  marginResponse: {
    id: "margin-response" as const,
    label: "Margin Response · two-site gap",
    path: "/app/lab/control-center?seed=margin-response",
  },
};
