/**
 * Deterministic Supplier/AP variance analysis for onboarding MVP.
 * Golden acceptance: contract €6.80/L · invoice €7.45/L · 420 L → €273.
 *
 * LLMs are never used here.
 */

export type ParsedContractLine = {
  supplier: string;
  sku: string;
  unit: string;
  contractRate: number;
  currency: string;
};

export type ParsedInvoiceLine = {
  supplier: string;
  invoiceId: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  invoiceDate?: string;
};

export type SupplierApAnalysis =
  | {
      status: "decision";
      contract: ParsedContractLine;
      invoice: ParsedInvoiceLine;
      rateVariance: number;
      economicVariance: number;
      quantity: number;
      currency: string;
      material: boolean;
      threshold: number;
    }
  | {
      status: "below_materiality";
      economicVariance: number;
      currency: string;
      threshold: number;
      invoiceLines: number;
      contracts: number;
    }
  | {
      status: "no_variance";
      invoiceLines: number;
      contracts: number;
      currency: string;
      threshold: number;
    }
  | {
      status: "insufficient_evidence";
      missing: string[];
      message: string;
    }
  | {
      status: "unit_mismatch";
      message: string;
    }
  | {
      status: "unreadable";
      message: string;
    };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    const next = src[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

function headerIndex(headers: string[], aliases: string[]): number {
  const normalized = headers.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  for (const alias of aliases) {
    const key = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
    const idx = normalized.indexOf(key);
    if (idx >= 0) return idx;
  }
  return -1;
}

function num(raw: string): number | null {
  const cleaned = raw.replace(/[€$£,\s]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseContractCsv(text: string): ParsedContractLine[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0]!;
  const iSupplier = headerIndex(headers, ["supplier", "suppliername", "vendor"]);
  const iSku = headerIndex(headers, ["sku", "item", "product", "itemsku"]);
  const iUnit = headerIndex(headers, ["unit", "uom"]);
  const iRate = headerIndex(headers, [
    "contractrate",
    "rate",
    "unitprice",
    "price",
  ]);
  const iCurrency = headerIndex(headers, ["currency", "curr"]);
  if (iSupplier < 0 || iSku < 0 || iRate < 0) return [];

  const out: ParsedContractLine[] = [];
  for (const r of rows.slice(1)) {
    const rate = num(r[iRate] ?? "");
    if (rate == null) continue;
    out.push({
      supplier: r[iSupplier] ?? "",
      sku: r[iSku] ?? "",
      unit: (iUnit >= 0 ? r[iUnit] : "L") || "L",
      contractRate: rate,
      currency: (iCurrency >= 0 ? r[iCurrency] : "EUR") || "EUR",
    });
  }
  return out;
}

export function parseInvoiceCsv(text: string): ParsedInvoiceLine[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0]!;
  const iSupplier = headerIndex(headers, ["supplier", "suppliername", "vendor"]);
  const iInvoice = headerIndex(headers, [
    "invoiceid",
    "invoicenumber",
    "invoice",
  ]);
  const iSku = headerIndex(headers, ["sku", "item", "product", "itemsku"]);
  const iQty = headerIndex(headers, ["quantity", "qty"]);
  const iUnit = headerIndex(headers, ["unit", "uom"]);
  const iPrice = headerIndex(headers, [
    "unitprice",
    "price",
    "invoicerate",
    "rate",
  ]);
  const iCurrency = headerIndex(headers, ["currency", "curr"]);
  const iDate = headerIndex(headers, ["invoicedate", "date"]);
  if (iSupplier < 0 || iSku < 0 || iQty < 0 || iPrice < 0) return [];

  const out: ParsedInvoiceLine[] = [];
  for (const r of rows.slice(1)) {
    const qty = num(r[iQty] ?? "");
    const price = num(r[iPrice] ?? "");
    if (qty == null || price == null) continue;
    out.push({
      supplier: r[iSupplier] ?? "",
      invoiceId: (iInvoice >= 0 ? r[iInvoice] : "") || "UNKNOWN",
      sku: r[iSku] ?? "",
      quantity: qty,
      unit: (iUnit >= 0 ? r[iUnit] : "L") || "L",
      unitPrice: price,
      currency: (iCurrency >= 0 ? r[iCurrency] : "EUR") || "EUR",
      invoiceDate: iDate >= 0 ? r[iDate] : undefined,
    });
  }
  return out;
}

function normKey(supplier: string, sku: string): string {
  return `${supplier.trim().toLowerCase()}::${sku.trim().toLowerCase()}`;
}

/**
 * Analyze contract + invoice CSVs for Supplier/AP variance.
 * @param thresholdMajor currency major units (e.g. 100 for €100)
 */
export function analyzeSupplierApVariance(params: {
  contractCsv: string;
  invoiceCsv: string;
  thresholdMajor?: number;
}): SupplierApAnalysis {
  const threshold = params.thresholdMajor ?? 100;
  let contracts: ParsedContractLine[];
  let invoices: ParsedInvoiceLine[];
  try {
    contracts = parseContractCsv(params.contractCsv);
    invoices = parseInvoiceCsv(params.invoiceCsv);
  } catch {
    return { status: "unreadable", message: "Could not parse uploaded files." };
  }

  if (contracts.length === 0 && invoices.length === 0) {
    return {
      status: "unreadable",
      message: "Files could not be read as contract or invoice CSV.",
    };
  }
  if (contracts.length === 0) {
    return {
      status: "insufficient_evidence",
      missing: ["active contract term"],
      message:
        "Invoice data is present, but no matching contract lines were found.",
    };
  }
  if (invoices.length === 0) {
    return {
      status: "insufficient_evidence",
      missing: ["invoice lines"],
      message: "Contract data is present, but no invoice lines were found.",
    };
  }

  const byKey = new Map(contracts.map((c) => [normKey(c.supplier, c.sku), c]));
  let best:
    | {
        contract: ParsedContractLine;
        invoice: ParsedInvoiceLine;
        variance: number;
      }
    | undefined;

  for (const inv of invoices) {
    const contract = byKey.get(normKey(inv.supplier, inv.sku));
    if (!contract) continue;
    if (
      contract.unit.trim().toLowerCase() !== inv.unit.trim().toLowerCase()
    ) {
      return {
        status: "unit_mismatch",
        message: `Unit mismatch for ${inv.sku}: contract uses ${contract.unit}, invoice uses ${inv.unit}.`,
      };
    }
    const rateVar = inv.unitPrice - contract.contractRate;
    if (rateVar <= 0) continue;
    const economic = Math.round(rateVar * inv.quantity * 100) / 100;
    if (!best || economic > best.variance) {
      best = { contract, invoice: inv, variance: economic };
    }
  }

  const currency = invoices[0]?.currency || contracts[0]?.currency || "EUR";

  if (!best) {
    // Check if any invoice lacked a contract match entirely
    const unmatched = invoices.filter(
      (inv) => !byKey.has(normKey(inv.supplier, inv.sku)),
    );
    if (unmatched.length === invoices.length) {
      return {
        status: "insufficient_evidence",
        missing: ["matching contract for invoice SKUs"],
        message:
          "Invoices could not be matched to active contract lines by supplier and SKU.",
      };
    }
    return {
      status: "no_variance",
      invoiceLines: invoices.length,
      contracts: contracts.length,
      currency,
      threshold,
    };
  }

  if (best.variance < threshold) {
    return {
      status: "below_materiality",
      economicVariance: best.variance,
      currency,
      threshold,
      invoiceLines: invoices.length,
      contracts: contracts.length,
    };
  }

  return {
    status: "decision",
    contract: best.contract,
    invoice: best.invoice,
    rateVariance:
      Math.round(
        (best.invoice.unitPrice - best.contract.contractRate) * 100,
      ) / 100,
    economicVariance: best.variance,
    quantity: best.invoice.quantity,
    currency,
    material: true,
    threshold,
  };
}

export function formatMoneyMajor(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
