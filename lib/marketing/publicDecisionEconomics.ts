/**
 * Public Decision economics façade — ONE read path for marketing surfaces.
 * Amounts always flow from canonical Decisions / publicMoney fixtures.
 */

import {
  CANON_CREATED,
  CANON_LABOR,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_PLAYBOOK,
  CANON_SUPPLIER,
  CANON_TABLE,
  verifiedEuro,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import {
  MONEY_D1911_EXPECTED,
  MONEY_D1911_OBSERVED,
  MONEY_D1911_VERIFIED,
  MONEY_D2201_EXPECTED,
  MONEY_D2201_EXPOSURE,
  MONEY_D2201_VERIFIED,
  MONEY_D3104_EXPECTED,
  MONEY_D3104_OBSERVED,
  MONEY_D3104_VERIFIED,
  MONEY_D4102_EXPECTED,
  MONEY_D4102_VARIANCE,
  MONEY_D4102_VERIFIED,
  formatPublicMoney,
  type PublicMoney,
} from "@/lib/marketing/publicMoney";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type PublicDecisionEconomics = {
  displayId: string;
  decision: CanonDecision;
  identified: number;
  exposed: number;
  expected: number;
  recoverable: number;
  observed: number;
  verified: number;
  /** Primary public euro for sealed demos (verified when > 0, else expected/exposed). */
  primary: number;
  money: {
    variance?: PublicMoney;
    exposure?: PublicMoney;
    expected?: PublicMoney;
    observed?: PublicMoney;
    verified?: PublicMoney;
  };
};

function fromCanon(
  d: CanonDecision,
  money: PublicDecisionEconomics["money"],
): PublicDecisionEconomics {
  const exposed = d.exposureEuro;
  const expected = d.expectedProtectedEuro;
  const verified = verifiedEuro(d);
  const observed =
    d.observedContributionEuro ??
    (verified > 0 ? verified : d.actualProtectedEuro);
  return {
    displayId: d.displayId,
    decision: d,
    identified: exposed,
    exposed,
    expected,
    recoverable: expected,
    observed,
    verified,
    primary: verified > 0 ? verified : expected > 0 ? expected : exposed,
    money,
  };
}

export const ECON_D1911 = fromCanon(CANON_PEAK, {
  expected: MONEY_D1911_EXPECTED,
  observed: MONEY_D1911_OBSERVED,
  verified: MONEY_D1911_VERIFIED,
});

export const ECON_D4102 = fromCanon(CANON_SUPPLIER, {
  variance: MONEY_D4102_VARIANCE,
  expected: MONEY_D4102_EXPECTED,
  verified: MONEY_D4102_VERIFIED,
});

export const ECON_D3104 = fromCanon(CANON_ORPHAN, {
  expected: MONEY_D3104_EXPECTED,
  observed: MONEY_D3104_OBSERVED,
  verified: MONEY_D3104_VERIFIED,
});

export const ECON_D2201 = fromCanon(CANON_OTA, {
  exposure: MONEY_D2201_EXPOSURE,
  expected: MONEY_D2201_EXPECTED,
  verified: MONEY_D2201_VERIFIED,
});

export const ECON_D5208 = fromCanon(CANON_PLAYBOOK, {});
export const ECON_D1920 = fromCanon(CANON_LABOR, {});
export const ECON_D4410 = fromCanon(CANON_CREATED, {});
export const ECON_D6671 = fromCanon(CANON_TABLE, {});

export const PUBLIC_DECISION_ECONOMICS = {
  "D-1911": ECON_D1911,
  "D-4102": ECON_D4102,
  "D-3104": ECON_D3104,
  "D-2201": ECON_D2201,
  "D-5208": ECON_D5208,
  "D-1920": ECON_D1920,
  "D-4410": ECON_D4410,
  "D-6671": ECON_D6671,
} as const;

export type PublicDecisionDisplayId = keyof typeof PUBLIC_DECISION_ECONOMICS;

export function publicDecisionEconomics(
  displayId: PublicDecisionDisplayId,
): PublicDecisionEconomics {
  return PUBLIC_DECISION_ECONOMICS[displayId];
}

export function euro(amount: number): string {
  return formatDecisionMoney(amount);
}

export function euroMoney(m: PublicMoney): string {
  return formatPublicMoney(m);
}

/** Settlement gap used on public rails — Expected €9,814 − Actual €9,521 */
export const SETTLEMENT_GAP_EURO = 293;
export const SETTLEMENT_REFUNDS_EXPLAINED_EURO = 91;
