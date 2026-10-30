import { describe, expect, it } from "vitest";
import {
  analyzeSupplierApVariance,
  parseContractCsv,
  parseInvoiceCsv,
} from "@/lib/onboarding/supplierApAnalysis";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const contractTpl = readFileSync(
  join(process.cwd(), "public/templates/radr-contract-template.csv"),
  "utf8",
);
const invoiceTpl = readFileSync(
  join(process.cwd(), "public/templates/radr-invoice-template.csv"),
  "utf8",
);

describe("Supplier/AP onboarding analysis", () => {
  it("parses golden templates", () => {
    expect(parseContractCsv(contractTpl)).toHaveLength(1);
    expect(parseInvoiceCsv(invoiceTpl)).toHaveLength(1);
  });

  it("forms €273 Decision above €100 materiality (acceptance test 1)", () => {
    const result = analyzeSupplierApVariance({
      contractCsv: contractTpl,
      invoiceCsv: invoiceTpl,
      thresholdMajor: 100,
    });
    expect(result.status).toBe("decision");
    if (result.status === "decision") {
      expect(result.rateVariance).toBe(0.65);
      expect(result.quantity).toBe(420);
      expect(result.economicVariance).toBe(273);
      expect(result.material).toBe(true);
    }
  });

  it("returns nothing_needs_you path for clean equal rates (acceptance test 2)", () => {
    const cleanInvoice = invoiceTpl.replace("7.45", "6.80");
    const result = analyzeSupplierApVariance({
      contractCsv: contractTpl,
      invoiceCsv: cleanInvoice,
      thresholdMajor: 100,
    });
    expect(result.status).toBe("no_variance");
  });

  it("blocks Decision below materiality (acceptance test 4)", () => {
    // 20 L × €0.65 = €13
    const small = invoiceTpl.replace("420", "20");
    const result = analyzeSupplierApVariance({
      contractCsv: contractTpl,
      invoiceCsv: small,
      thresholdMajor: 100,
    });
    expect(result.status).toBe("below_materiality");
    if (result.status === "below_materiality") {
      expect(result.economicVariance).toBe(13);
    }
  });

  it("reports insufficient evidence without contracts (acceptance test 3)", () => {
    const result = analyzeSupplierApVariance({
      contractCsv: "supplier,sku,unit,contract_rate\n",
      invoiceCsv: invoiceTpl,
      thresholdMajor: 100,
    });
    expect(result.status).toBe("insufficient_evidence");
  });
});
