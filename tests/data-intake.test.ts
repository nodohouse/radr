import { describe, expect, it } from "vitest";
import {
  DATASETS,
  intakeTemplate,
  parseIntake,
  suggestMapping,
  validateIntake,
  type Dataset,
} from "@/lib/ingestion/intake";
const check = (text: string, kind: Dataset = "sales", file = "data.csv") => {
  const parsed = parseIntake(text, file);
  return validateIntake(parsed, kind, suggestMapping(parsed.headers, kind));
};
describe("structured data intake", () => {
  for (const kind of Object.keys(DATASETS) as Dataset[])
    it(`validates the ${kind} template`, () => {
      expect(check(intakeTemplate(kind), kind).ready).toBe(true);
    });
  it("reads BOM, CRLF, escaped quotes, multiline cells and semicolon exports", () => {
    const data = parseIntake(
      '\uFEFFsku;quantity;unit\r\n"oil; premium";2;"L"\r\n"line\nwith ""quotes""";3;kg\r\n',
      "data.csv",
    );
    expect(data.rows).toEqual([
      { sku: "oil; premium", quantity: "2", unit: "L" },
      { sku: 'line\nwith "quotes"', quantity: "3", unit: "kg" },
    ]);
  });
  it("supports JSON arrays, records envelopes and JSON Lines", () => {
    const record = { sku: "oil", quantity: 2, unit: "L" };
    for (const [text, name] of [
      [JSON.stringify([record]), "a.json"],
      [JSON.stringify({ records: [record] }), "a.json"],
      [JSON.stringify(record), "a.jsonl"],
    ])
      expect(check(text, "inventory", name).ready).toBe(true);
  });
  it("rejects malformed, nested, binary and unsupported input with a useful error", () => {
    for (const [text, name] of [
      ['a,b\n"unclosed,2', "a.csv"],
      ["a,b\n1,2,3", "a.csv"],
      ["a,a\n1,2", "a.csv"],
      ["__proto__,qty\n1,2", "a.csv"],
      ['[{"a":{"nested":1}}]', "a.json"],
      ["bad json", "a.json"],
      ["\0bytes", "a.csv"],
      ["hello", "a.pdf"],
    ])
      expect(() => parseIntake(text, name)).toThrow();
  });
  it("blocks invalid dates, ambiguous amounts, unsupported currency and duplicate rows", () => {
    const base = "id,date,amount,currency\n";
    for (const row of [
      "1,2026-02-30,10,EUR",
      "1,07/11/2026,10,EUR",
      '1,2026-11-07,"1,234",EUR',
      "1,2026-11-07,10,AAA",
    ])
      expect(check(base + row).ready).toBe(false);
    expect(
      check(base + "1,2026-11-07,10,EUR\n1,2026-11-07,10,EUR").invalidRows,
    ).toBe(1);
    expect(
      check(
        "id,startsAt,endsAt\na,2026-02-30T10:00:00Z,2026-03-02T10:00:00Z",
        "labor",
      ).ready,
    ).toBe(false);
  });
  it("requires complete distinct mappings and refuses ambiguous suggestions", () => {
    const parsed = parseIntake(
      "id,date,amount,total,currency\n1,2026-11-07,10,10,EUR",
      "data.csv",
    );
    const mapping = suggestMapping(parsed.headers, "sales");
    expect(mapping.amount).toBe("");
    expect(validateIntake(parsed, "sales", mapping).ready).toBe(false);
    expect(
      validateIntake(parsed, "sales", {
        id: "id",
        date: "date",
        amount: "amount",
        currency: "amount",
      }).duplicateMappings,
    ).toBe(true);
  });
  it("handles 10,000 rows and rejects larger imports", () => {
    const rows = Array.from(
      { length: 10000 },
      (_, i) => `${i},2026-11-07,10,EUR\n`,
    ).join("");
    expect(check("id,date,amount,currency\n" + rows).ready).toBe(true);
    expect(() =>
      parseIntake(
        "id,date,amount,currency\n" + rows + "10001,2026-11-07,10,EUR\n",
        "data.csv",
      ),
    ).toThrow(/10,000/);
  });
  it("preserves leading-zero identifiers and never evaluates formulas", () => {
    const parsed = parseIntake(
      "room,status\n001,ready\n=SUM(A1),ready",
      "data.csv",
    );
    expect(parsed.rows[0].room).toBe("001");
    expect(parsed.rows[1].room).toBe("=SUM(A1)");
  });
});
