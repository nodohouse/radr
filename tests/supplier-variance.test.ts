import { describe, expect, it } from "vitest";
import {
  buildSupplierVarianceScenario,
} from "@/lib/radr/scenarios/supplierVariance";
import {
  getSupplierVarianceScenario,
  getVerifiedValueFromScenarios,
  resetSupplierVarianceScenario,
  approveSupplierCredit,
  verifySupplierCredit,
  requestSupplierCreditApproval,
  executeSupplierCreditRequest,
  resetCancellationRecoveryScenario,
  verifyCancellationRecovery,
} from "@/lib/radr/scenarios/store";
import { runFindingEngine } from "@/lib/radr/findings/engine";
import { calculateSupplierVariance } from "@/lib/radr/calc";

describe("supplier variance vertical slice", () => {
  it("quantifies €118 from invoice vs contract lines", () => {
    const calc = calculateSupplierVariance({
      invoiceTotal: 2840,
      contractedTotal: 2722,
      lines: [
        { label: "Tomatoes", variance: 46 },
        { label: "Olive oil", variance: 38 },
        { label: "Fresh herbs", variance: 34 },
      ],
    });
    expect(calc.variance).toBe(118);
    expect(calc.recoverableValue).toBe(118);
    expect(calc.lines.reduce((s, l) => s + l.variance, 0)).toBe(118);
  });

  it("runs DETECT → APPROVE → VERIFY without inventing verified early", () => {
    resetCancellationRecoveryScenario("PROPOSED");
    resetSupplierVarianceScenario("DETECTED");
    expect(getSupplierVarianceScenario().verification).toBeNull();
    expect(getVerifiedValueFromScenarios().byTerritory.BUY).toBe(0);

    requestSupplierCreditApproval();
    expect(getSupplierVarianceScenario().phase).toBe("APPROVAL_REQUIRED");
    approveSupplierCredit();
    expect(getSupplierVarianceScenario().action?.status).toBe("IN_PROGRESS");
    executeSupplierCreditRequest();
    verifySupplierCredit();

    const done = getSupplierVarianceScenario();
    expect(done.phase).toBe("VERIFIED");
    expect(done.verification?.verifiedValue).toBe(118);
    expect(done.verification?.verifiedValue).toBeLessThanOrEqual(
      done.verification!.observedValue,
    );
    expect(getVerifiedValueFromScenarios().byTerritory.BUY).toBe(118);
  });

  it("engine merges supplier scenario finding for Berlin", () => {
    resetSupplierVarianceScenario("DETECTED");
    const findings = runFindingEngine("loc_ber");
    const buy = findings.find((f) => f.category === "supplier_price_variance");
    expect(buy?.financialImpact.primaryValue).toBe(118);
    expect(buy?.id).toBe("fnd_buy_loc_ber");
  });

  it("scenario finding matches detector money", () => {
    const s = buildSupplierVarianceScenario("DETECTED");
    expect(s.invoice.variance).toBe(118);
    expect(s.finding.financialImpact.recoverableValue).toBe(118);
  });

  it("cancellation verified stays 184 when supplier not verified", () => {
    resetSupplierVarianceScenario("DETECTED");
    verifyCancellationRecovery();
    expect(getVerifiedValueFromScenarios().verified).toBe(184);
  });
});
