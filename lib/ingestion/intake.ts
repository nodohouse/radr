/** Pure intake preview: no uploads, execution, persistence or formula evaluation. */
export type Dataset =
  | "sales"
  | "invoices"
  | "inventory"
  | "reservations"
  | "rooms"
  | "labor";
type Field = {
  key: string;
  label: string;
  kind: "text" | "number" | "date" | "currency";
  required?: boolean;
  aliases: string[];
};
export const DATASETS: Record<Dataset, { label: string; fields: Field[] }> = {
  sales: {
    label: "Sales & transactions",
    fields: [
      field("id", "Transaction ID", "text", true, ["orderid", "transactionid"]),
      field("date", "Business date", "date", true, ["date", "businessdate"]),
      field("amount", "Sales amount", "number", true, [
        "amount",
        "gross",
        "revenue",
        "total",
      ]),
      field("currency", "Currency", "currency", true, [
        "currency",
        "currencycode",
      ]),
    ],
  },
  invoices: {
    label: "Invoices & purchasing",
    fields: [
      field("id", "Invoice ID", "text", true, ["invoiceid", "invoicenumber"]),
      field("supplier", "Supplier", "text", true, ["supplier", "vendor"]),
      field("sku", "Product / SKU", "text", true, ["sku", "product", "item"]),
      field("quantity", "Quantity", "number", true, ["quantity", "qty"]),
      field("unitPrice", "Unit price", "number", true, [
        "unitprice",
        "price",
        "rate",
      ]),
      field("currency", "Currency", "currency", true, ["currency"]),
    ],
  },
  inventory: {
    label: "Inventory & stock",
    fields: [
      field("sku", "Product / SKU", "text", true, ["sku", "product", "item"]),
      field("quantity", "Quantity", "number", true, [
        "quantity",
        "qty",
        "stock",
        "onhand",
      ]),
      field("unit", "Unit", "text", true, ["unit", "uom"]),
    ],
  },
  reservations: {
    label: "Reservations",
    fields: [
      field("id", "Booking ID", "text", true, ["bookingid", "reservationid"]),
      field("startsAt", "Arrival / service time", "date", true, [
        "startsat",
        "arrival",
        "checkin",
        "servicetime",
      ]),
      field("guests", "Guest count", "number", true, [
        "guests",
        "covers",
        "partysize",
      ]),
    ],
  },
  rooms: {
    label: "Rooms & housekeeping",
    fields: [
      field("room", "Room ID", "text", true, ["room", "roomid", "roomnumber"]),
      field("status", "Room status", "text", true, [
        "status",
        "roomstatus",
        "readiness",
      ]),
    ],
  },
  labor: {
    label: "Labor & shifts",
    fields: [
      field("id", "Staff ID", "text", true, ["staffid", "employeeid"]),
      field("startsAt", "Shift start", "date", true, [
        "startsat",
        "shiftstart",
        "start",
      ]),
      field("endsAt", "Shift end", "date", true, ["endsat", "shiftend", "end"]),
    ],
  },
};
function field(
  key: string,
  label: string,
  kind: Field["kind"],
  required: boolean,
  aliases: string[],
): Field {
  return { key, label, kind, required, aliases };
}
export type ParsedIntake = {
  headers: string[];
  rows: Record<string, string>[];
  suggested: Dataset | null;
};
export const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 10000;
const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function csv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const push = () => {
    row.push(cell);
    cell = "";
    closed = false;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += ch;
      continue;
    }
    if (ch === '"') {
      if (cell || closed)
        throw new Error(
          "Unexpected quote. Quote the entire cell and double any quotes inside it.",
        );
      quoted = true;
    } else if (ch === delimiter) push();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      push();
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
    } else {
      if (closed && ch.trim())
        throw new Error("Unexpected text after a quoted cell.");
      if (!closed) cell += ch;
    }
    if (rows.length > MAX_ROWS + 1)
      throw new Error("Use a file with at most 10,000 data rows.");
  }
  if (quoted)
    throw new Error(
      "A quoted cell is not closed. Check the export and try again.",
    );
  push();
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function parseIntake(text: string, filename: string): ParsedIntake {
  if (new TextEncoder().encode(text).length > MAX_BYTES)
    throw new Error(
      "This preview supports files up to 2 MB. Split the export into smaller files.",
    );
  text = text.replace(/^\uFEFF/, "");
  if (!text.trim() || text.includes("\0"))
    throw new Error(
      "Choose a non-empty UTF-8 text export. Binary spreadsheets and scanned documents need a dedicated extractor.",
    );
  const ext = filename.split(".").pop()?.toLowerCase();
  let headers: string[];
  let values: unknown[][];
  if (["json", "jsonl", "ndjson"].includes(ext || "")) {
    let parsed: unknown;
    try {
      parsed =
        ext === "json"
          ? JSON.parse(text)
          : text
              .split(/\r?\n/)
              .filter((s) => s.trim())
              .map((s) => JSON.parse(s));
    } catch {
      throw new Error("Invalid JSON. Check the export syntax and try again.");
    }
    const records = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "records" in parsed
        ? parsed.records
        : null;
    if (
      !Array.isArray(records) ||
      !records.length ||
      records.some((r) => !r || typeof r !== "object" || Array.isArray(r))
    )
      throw new Error(
        "JSON must contain an array of records, or an object with a records array.",
      );
    if (
      records.some((r) =>
        Object.values(r).some((v) => v !== null && typeof v === "object"),
      )
    )
      throw new Error(
        "Nested JSON needs flattening first. Export one record per row with simple column values.",
      );
    headers = [...new Set(records.flatMap((r) => Object.keys(r)))];
    values = records.map((r) =>
      headers.map((h) => (Object.hasOwn(r, h) ? r[h] : "")),
    );
  } else if (["csv", "tsv"].includes(ext || "")) {
    const firstLine = text.split(/\r?\n/)[0];
    const delimiter =
      ext === "tsv"
        ? "\t"
        : [",", ";", "\t"].sort(
            (a, b) => firstLine.split(b).length - firstLine.split(a).length,
          )[0];
    const table = csv(text, delimiter);
    headers = (table.shift() || []).map((h) => h.trim());
    values = table;
  } else
    throw new Error(
      "Choose CSV, TSV, JSON or JSON Lines. Excel, PDF, images, audio and video require a dedicated extraction step; they are not silently converted here.",
    );
  if (
    !headers.length ||
    headers.length > 100 ||
    headers.some(
      (h) =>
        !h.trim() ||
        h.length > 200 ||
        ["__proto__", "constructor", "prototype"].includes(h.toLowerCase()),
    ) ||
    new Set(headers.map((h) => h.trim().toLowerCase())).size !== headers.length
  )
    throw new Error(
      "Use 1–100 unique, non-empty column headers. Reserved names are not allowed.",
    );
  if (!values.length || values.length > MAX_ROWS)
    throw new Error("Use between 1 and 10,000 data rows.");
  const rows = values.map((r, i) => {
    if (r.length !== headers.length)
      throw new Error(
        `Row ${i + 2} has ${r.length} cells; expected ${headers.length}. Check delimiters and quoting.`,
      );
    return Object.fromEntries(
      headers.map((h, j) => [h, String(r[j] ?? "").trim()]),
    );
  });
  const ranked = (Object.keys(DATASETS) as Dataset[])
    .map((kind) => ({
      kind,
      score: Object.values(suggestMapping(headers, kind)).filter(Boolean)
        .length,
    }))
    .sort((a, b) => b.score - a.score);
  return {
    headers,
    rows,
    suggested:
      ranked[0].score >= 2 && ranked[0].score > ranked[1].score
        ? ranked[0].kind
        : null,
  };
}
export function suggestMapping(
  headers: string[],
  kind: Dataset,
): Record<string, string> {
  return Object.fromEntries(
    DATASETS[kind].fields.map((f) => {
      const matches = headers.filter((h) =>
        [normalized(f.key), ...f.aliases].includes(normalized(h)),
      );
      return [f.key, matches.length === 1 ? matches[0] : ""];
    }),
  );
}
export type IntakeIssue = { row: number; field: string; message: string };
export function validateIntake(
  input: ParsedIntake,
  kind: Dataset,
  mapping: Record<string, string>,
) {
  const issues: IntakeIssue[] = [];
  const add = (issue: IntakeIssue) => {
    if (issues.length < 100) issues.push(issue);
  };
  let invalidRows = 0;
  const seen = new Set<string>();
  const mapped = DATASETS[kind].fields
    .map((f) => mapping[f.key])
    .filter(Boolean);
  const missing = DATASETS[kind].fields
    .filter(
      (f) =>
        f.required &&
        (!mapping[f.key] || !input.headers.includes(mapping[f.key])),
    )
    .map((f) => f.label);
  const duplicateMappings = new Set(mapped).size !== mapped.length;
  const rows = input.rows.map((row, index) => {
    let invalid = false;
    const out: Record<string, string | number> = {};
    const fail = (label: string, message: string) => {
      invalid = true;
      add({ row: index + 2, field: label, message });
    };
    for (const f of DATASETS[kind].fields) {
      const value = row[mapping[f.key]] || "";
      out[f.key] = value;
      if (!value) {
        if (f.required) fail(f.label, "A value is required.");
        continue;
      }
      if (f.kind === "number") {
        if (
          !/^-?\d+(\.\d+)?$/.test(value) ||
          !Number.isFinite(Number(value)) ||
          Math.abs(Number(value)) > 1e12
        )
          fail(
            f.label,
            "Use a plain number such as 1234.50. Currency signs and ambiguous separators need correction.",
          );
        else {
          out[f.key] = Number(value);
          if (["quantity", "guests"].includes(f.key) && Number(value) < 0)
            fail(f.label, "Use a non-negative quantity.");
          if (
            f.key === "guests" &&
            (!Number.isInteger(Number(value)) || Number(value) < 1)
          )
            fail(f.label, "Guest count must be a positive whole number.");
        }
      }
      if (
        f.kind === "currency" &&
        !Intl.supportedValuesOf("currency").includes(value)
      )
        fail(
          f.label,
          "Use a supported three-letter currency code, such as EUR or USD.",
        );
      if (f.kind === "date") {
        const validShape =
          f.key === "date"
            ? /^\d{4}-\d{2}-\d{2}$/
            : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
        const parsed = new Date(value);
        const day = new Date(value.slice(0, 10));
        const validCalendar =
          Number.isFinite(day.getTime()) &&
          day.toISOString().slice(0, 10) === value.slice(0, 10);
        if (
          !validCalendar ||
          !validShape.test(value) ||
          !Number.isFinite(parsed.getTime()) ||
          (f.key === "date" && parsed.toISOString().slice(0, 10) !== value)
        )
          fail(
            f.label,
            f.key === "date"
              ? "Use a valid YYYY-MM-DD date."
              : "Use an ISO timestamp with a timezone, such as 2026-11-07T18:00:00+01:00.",
          );
      }
    }
    if (
      kind === "labor" &&
      typeof out.startsAt === "string" &&
      typeof out.endsAt === "string" &&
      Date.parse(out.endsAt) <= Date.parse(out.startsAt)
    )
      fail("Shift end", "Shift end must be after shift start.");
    if (
      kind === "rooms" &&
      ![
        "ready",
        "dirty",
        "occupied",
        "maintenance",
        "cleaning",
        "out_of_order",
        "inspected",
      ].includes(String(out.status).toLowerCase())
    )
      fail(
        "Room status",
        "Map to ready, dirty, occupied, maintenance, cleaning, out_of_order or inspected.",
      );
    // Exact repeated source rows are flagged; legitimate multi-line invoices remain possible.
    const key = JSON.stringify(Object.entries(out).sort());
    if (seen.has(key))
      fail(
        "Record",
        "Exact duplicate row. Confirm whether this should be included once.",
      );
    seen.add(key);
    if (invalid) invalidRows++;
    return out;
  });
  return {
    rows,
    issues,
    invalidRows,
    missing,
    duplicateMappings,
    ready: !missing.length && !duplicateMappings && invalidRows === 0,
  };
}
export function intakeTemplate(kind: Dataset) {
  const examples: Record<Dataset, string[]> = {
    sales: ["sale-001", "2026-11-07", "125.50", "EUR"],
    invoices: ["inv-001", "Example supplier", "olive-oil", "10", "6.80", "EUR"],
    inventory: ["olive-oil", "10", "L"],
    reservations: ["booking-001", "2026-11-07T18:00:00+01:00", "4"],
    rooms: ["310", "ready"],
    labor: [
      "staff-001",
      "2026-11-07T14:00:00+01:00",
      "2026-11-07T22:00:00+01:00",
    ],
  };
  return (
    DATASETS[kind].fields.map((f) => f.key).join(",") +
    "\n" +
    examples[kind].join(",")
  );
}
