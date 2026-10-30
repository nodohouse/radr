/** Money presentation for the existing canonical Decision dataset, not another store. */
import type { RoleView } from "@/lib/product/types";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { DEMO_FX_TO_USD, getEstateEntity, type DemoEstateCurrency } from "@/lib/radr/demo/estateRegistry";
import { toCanonicalLocationId } from "./locationIds";

export function sourceCurrency(locationId: string): DemoEstateCurrency {
  return getEstateEntity(toCanonicalLocationId(locationId))?.currency ?? "USD";
}
export function currencyForRecord(record: DecisionRecord): DemoEstateCurrency {
  return record.sourceCurrency ?? sourceCurrency(record.locationId);
}
export function moneyContext(records: DecisionRecord[], role: RoleView) {
  const sourceCurrencies = [...new Set(records.map(currencyForRecord))];
  const group = ["owner","regional","coo","cfo","finance","revenue_manager"].includes(role) || sourceCurrencies.length > 1;
  const currency: DemoEstateCurrency = group ? "USD" : sourceCurrencies[0] ?? "USD";
  return {
    currency,
    sourceCurrencies,
    label: group ? `Reporting currency USD${sourceCurrencies.some(code=>code!=="USD") ? ` · sources ${sourceCurrencies.join(", ")} · illustrative FX` : ""}` : `Local currency ${currency}`,
    toDisplay(record: DecisionRecord, amount: number) {
      const from = currencyForRecord(record);
      if (from === currency) return amount;
      // Round every converted record once, then sum those same displayed amounts.
      return Math.round(amount * DEMO_FX_TO_USD[from] / DEMO_FX_TO_USD[currency]);
    },
  };
}
