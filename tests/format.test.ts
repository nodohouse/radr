import { describe, expect, it } from "vitest";
import { formatMoney, formatStatus } from "@/lib/format";

describe("formatMoney", () => {
  it("formats whole euros without cents", () => {
    expect(formatMoney(481, "EUR")).toMatch(/481/);
    expect(formatMoney(481, "EUR")).toContain("€");
  });

  it("keeps cents when needed", () => {
    expect(formatMoney(11.5, "EUR", { cents: true })).toMatch(/11/);
  });
});

describe("formatStatus", () => {
  it("humanizes document statuses", () => {
    expect(formatStatus("UPLOADED")).toBe("Uploaded");
    expect(formatStatus("REQUIRES_REVIEW")).toBe("Requires review");
  });
});
