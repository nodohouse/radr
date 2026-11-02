import {parseContractCsv, parseInvoiceCsv, parseCsv} from "./supplierApAnalysis";

export const MAX_ONBOARDING_CSV_BYTES = 1024 * 1024;

/** The first-value analysis accepts UTF-8 CSV, not arbitrary documents or XLSX. */
export function validateOnboardingCsv(bytes: Uint8Array, filename: string, kind: "CONTRACT" | "INVOICE") {
  if (!filename.toLowerCase().endsWith(".csv")) throw new Error("Use a CSV export. XLSX and PDF are not supported in this analysis.");
  if (!bytes.length || bytes.length > MAX_ONBOARDING_CSV_BYTES) throw new Error("Choose a non-empty CSV file up to 1 MB.");
  let text: string;
  try { text = new TextDecoder("utf-8", {fatal:true}).decode(bytes); }
  catch { throw new Error("Save your CSV as UTF-8 and try again."); }
  if (text.includes("\0")) throw new Error("This file is not a readable CSV export.");
  const raw = parseCsv(text), header = (raw[0] || []).map(value=>value.toLowerCase().replace(/[^a-z]/g,""));
  const currencyIndex = header.findIndex(value=>value==="currency"||value==="curr"), unitIndex = header.findIndex(value=>value==="unit"||value==="uom");
  if (currencyIndex<0 || unitIndex<0) throw new Error("Include currency and unit columns so amounts can be compared correctly. Use the downloadable template.");
  if (raw.slice(1).some(row=>!row[unitIndex]?.trim() || !/^[A-Z]{3}$/.test(row[currencyIndex]?.trim() || ""))) throw new Error("Every row needs an explicit currency code and unit. Blank values are not assumed to be EUR or litres.");
  const numericColumns = header.map((value,index)=>["contractrate","rate","unitprice","price","quantity","qty","invoicerate"].includes(value)?index:-1).filter(index=>index>=0);
  if (raw.slice(1).some(row=>numericColumns.some(index=>row[index]?.includes(",")))) throw new Error("Use decimal points and no thousands separators in numeric columns. Follow the downloadable CSV template.");
  const rows = kind === "CONTRACT" ? parseContractCsv(text) : parseInvoiceCsv(text);
  if (!rows.length) throw new Error(`No valid ${kind === "CONTRACT" ? "contract" : "invoice"} rows found. Use the downloadable template and check the required columns.`);
  if (rows.length !== raw.length-1) throw new Error("Some rows contain invalid numbers. Correct them before uploading; partial data is not silently analyzed.");
  return {mimeType:"text/csv", filename: filename.replace(/[^\w.\- ]/g, "_").slice(-120), rows:rows.length};
}
