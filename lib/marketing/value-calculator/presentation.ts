import { DEFAULT_OPERATING } from "./assumptions";
import {
  optionById,
  LOCATION_OPTIONS,
  PCT_OPTIONS,
  PURCHASING_OPTIONS,
  DELIVERY_OPTIONS,
  OTA_OPTIONS,
  ROOM_REVENUE_OPTIONS,
  REVENUE_OPTIONS_USD,
  formatRevenueLabel,
  formatMoneyIntl,
} from "./ranges";
import { resolveEngineInput, type JourneyState } from "./journey";
import type { ValueCalculatorResult } from "./types";

export function financialInputs(j: JourneyState) {
  const v = j.vertical ?? "restaurant";
  const defaults = DEFAULT_OPERATING[v];
  const revenue = optionById(REVENUE_OPTIONS_USD, j.revenueId);
  const exact = j.revenueMode === "exact";
  const rows = [
    {
      label: "Annual revenue across all locations",
      supplied: exact
        ? Boolean(
            j.revenueExact &&
              Number.isFinite(j.revenueExact) &&
              j.revenueExact > 0 &&
              j.revenueExact <= 1e12,
          )
        : Boolean(revenue?.range),
      value:
        exact && j.revenueExact
          ? formatMoneyIntl(j.revenueExact, j.currency)
          : revenue?.range
            ? formatRevenueLabel(revenue, j.currency)
            : "Revenue needed",
    },
  ];
  const add = (
    label: string,
    options: typeof PCT_OPTIONS,
    id: string | null | undefined,
    fallback: number,
  ) => {
    const selected = optionById(options, id);
    rows.push({
      label,
      supplied: Boolean(selected?.range),
      value: selected?.range
        ? selected.label
        : `${Math.round(fallback * 1000) / 10}% model default`,
    });
  };
  add(
    "Labor cost / revenue",
    PCT_OPTIONS,
    j.laborId,
    defaults.laborPctOfRevenue,
  );
  add(
    "Purchasing / revenue",
    PURCHASING_OPTIONS,
    j.purchasingId,
    defaults.purchasingPctOfRevenue,
  );
  if (v !== "hotel") {
    add(
      "Food cost / revenue",
      PCT_OPTIONS,
      j.foodId,
      defaults.foodCogsPctOfRevenue,
    );
    add(
      "Delivery share",
      DELIVERY_OPTIONS,
      j.deliveryId,
      defaults.deliveryMixPct,
    );
  }
  if (v === "hotel" || v === "mixed") {
    add(
      "Room revenue / total revenue",
      ROOM_REVENUE_OPTIONS,
      j.roomRevenueShareId,
      defaults.roomRevenueShare,
    );
    add(
      "Third-party share of room revenue",
      OTA_OPTIONS,
      j.otaId,
      defaults.otaMixPct,
    );
  }
  return rows;
}

export function revenueDescription(j: JourneyState) {
  const input = resolveEngineInput(j);
  if (!input || input.annualRevenue <= 0) return "Revenue not provided";
  if (j.revenueMode === "exact")
    return `${formatMoneyIntl(input.annualRevenue, j.currency)} per year`;
  const range = optionById(REVENUE_OPTIONS_USD, j.revenueId);
  return range
    ? `${formatRevenueLabel(range, j.currency)} per year`
    : "Revenue not provided";
}

/** Download stays local. No form submission, financial-data upload or contact capture. */
export function valueMapCsv(j: JourneyState, result: ValueCalculatorResult) {
  const knownRevenue = (resolveEngineInput(j)?.annualRevenue ?? 0) > 0;
  const rows: (string | number)[][] = [
    ["RADR VALUE MAP", "Illustrative scenario, not verified savings"],
    [
      "Profile",
      j.example
        ? `Illustrative ${j.example} example, possibly edited`
        : "Visitor inputs",
    ],
    [
      "Currency",
      j.currency === "OTHER" ? "Unspecified currency units" : j.currency,
    ],
    ["Horizon", "Annual; all selected locations combined"],
    ["Operation", j.vertical ?? "Not provided"],
    [
      "Location context",
      optionById(LOCATION_OPTIONS, j.locationsId)?.label ?? "Not provided",
    ],
    ["Revenue input", revenueDescription(j)],
    [
      "Revenue used",
      knownRevenue ? resolveEngineInput(j)!.annualRevenue : "Not provided",
    ],
    ["Capture assumption", j.captureRate],
    [],
    [
      "Category",
      "Lower scenario",
      "Central scenario",
      "Higher scenario",
      "Annual base used",
      "Base assumed",
      "Central rate",
      "Overlap factor",
      "Portfolio factor",
      "Records to check",
    ],
    ...result.categories.map((c) => [
      c.label,
      ...(knownRevenue
        ? [c.low, c.modeled, c.high, c.calculation?.base ?? ""]
        : [
            "Revenue needed",
            "Revenue needed",
            "Revenue needed",
            "Revenue needed",
          ]),
      c.assumedBase ? "Model default" : "Supplied or revenue-derived",
      c.calculation?.rates.base ?? "",
      c.calculation?.overlapFactor ?? "",
      c.calculation?.portfolioFactor ?? "",
      c.evidenceNeeded.join("; "),
    ]),
    [
      "TOTAL ADJUSTED EXPOSURE",
      ...(knownRevenue
        ? [result.total.low, result.total.modeled, result.total.high]
        : ["Revenue needed", "Revenue needed", "Revenue needed"]),
    ],
    [
      "Modeled captured value, annual",
      knownRevenue ? result.captureScenario.capturedLow : "Revenue needed",
      knownRevenue ? result.captureScenario.capturedModeled : "Revenue needed",
    ],
    [
      "Annual budget, supplied by visitor",
      result.roi?.investment ??
        "Not supplied; see published RADR pricing separately",
    ],
    [
      "Illustrative net return, annual",
      result.roi?.netLow ?? "Not modeled",
      result.roi?.netModeled ?? "Not modeled",
    ],
    ["Verified value", 0, "No outcomes were checked by this calculator"],
    [],
    ["FINANCIAL INPUTS", "Value", "Source"],
    ...financialInputs(j).map((r) => [
      r.label,
      r.value,
      r.supplied ? "Visitor-selected" : "Model assumption / missing",
    ]),
    [],
    [
      "Assumptions",
      "Internal modeling assumptions, not researched industry loss rates",
    ],
    ["Methodology", "https://radrup.com/en/value-calculator/methodology"],
  ];
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value);
            if (typeof value === "string" && /^[=+\-@\t\r]/.test(text))
              text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
