/**
 * Rank HiddenSignals for Control Center by horizon + materiality.
 * Cockpit only gets promoteToCockpit + NOW/TODAY (and THIS_WEEK when timely).
 * STRUCTURAL / MONTH stay in Insights — not the live attention budget.
 */

import type {
  HiddenSignal,
  HiddenSignalHorizon,
} from "@/lib/radr/domain/hiddenSignal";
import { DEMO_HIDDEN_SIGNALS } from "@/lib/radr/hiddenSignals/demo";
import { menuEconomicsHiddenSignals } from "@/lib/radr/menuEconomics/engine";
import { hotelEconomicsHiddenSignals } from "@/lib/radr/hotelEconomics/roomTypes";
import { residencesEconomicsHiddenSignals } from "@/lib/radr/residencesEconomics/units";
import type { DemoVertical } from "@/lib/radr/operating/resolveProfile";

export type CockpitHorizonFilter =
  | "NOW"
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "STRUCTURAL"
  | "ALL";

/** Map demo WhenScopeStrip values → cockpit horizon filter. */
export function mapDemoWhenToCockpitHorizon(
  raw: string | null | undefined,
): CockpitHorizonFilter {
  if (raw === "tonight" || raw === "day") return "TODAY";
  if (raw === "mtd") return "THIS_MONTH";
  if (raw === "ytd" || raw === "custom") return "STRUCTURAL";
  return "TODAY";
}

const HORIZON_ORDER: HiddenSignalHorizon[] = [
  "NOW",
  "TODAY",
  "THIS_WEEK",
  "THIS_MONTH",
  "STRUCTURAL",
];

function verticalKey(
  vertical: DemoVertical,
): HiddenSignal["vertical"] | null {
  if (vertical === "restaurant") return "restaurant";
  if (vertical === "boutique_hotel") return "hotel";
  if (vertical === "serviced_apartments") return "serviced_apartments";
  return null;
}

/** All engine + demo signals for a vertical (deduped by kind preference to engine). */
export function collectHiddenSignals(
  vertical: DemoVertical,
): HiddenSignal[] {
  const v = verticalKey(vertical);
  if (!v) return [];

  const engine =
    v === "restaurant"
      ? menuEconomicsHiddenSignals()
      : v === "hotel"
        ? hotelEconomicsHiddenSignals()
        : residencesEconomicsHiddenSignals();

  const demo = DEMO_HIDDEN_SIGNALS.filter((s) => s.vertical === v);
  const byKind = new Map<string, HiddenSignal>();
  for (const s of demo) byKind.set(s.kind, s);
  for (const s of engine) byKind.set(s.kind, s); // engine wins
  return [...byKind.values()];
}

function materialScore(s: HiddenSignal): number {
  const amount = Math.abs(s.valueAmount ?? 0);
  const horizonBoost =
    s.horizon === "NOW"
      ? 40
      : s.horizon === "TODAY"
        ? 30
        : s.horizon === "THIS_WEEK"
          ? 15
          : 0;
  const conf =
    s.confidenceBand === "HIGH" ? 10 : s.confidenceBand === "MEDIUM" ? 5 : 0;
  return amount + horizonBoost * 20 + conf;
}

/**
 * Signals allowed on the live cockpit for a when-horizon.
 * STRUCTURAL / MONTH never consume the attention budget here.
 */
export function rankHiddenSignalsForCockpit(input: {
  vertical: DemoVertical;
  whenHorizon?: CockpitHorizonFilter;
  maxAttention?: number;
}): HiddenSignal[] {
  const max = input.maxAttention ?? 3;
  const when = input.whenHorizon ?? "TODAY";
  const all = collectHiddenSignals(input.vertical);

  const allowedHorizons: HiddenSignalHorizon[] =
    when === "ALL"
      ? ["NOW", "TODAY", "THIS_WEEK"]
      : when === "NOW" || when === "TODAY"
        ? ["NOW", "TODAY"]
        : when === "THIS_WEEK"
          ? ["NOW", "TODAY", "THIS_WEEK"]
          : []; // MONTH / STRUCTURAL → insights only

  const cockpit = all
    .filter((s) => s.promoteToCockpit)
    .filter((s) => allowedHorizons.includes(s.horizon))
    .sort((a, b) => materialScore(b) - materialScore(a))
    .slice(0, max);

  return cockpit;
}

/** Longer-horizon / structural — Insights & Brief, not live CC budget. */
export function rankHiddenSignalsForInsights(input: {
  vertical: DemoVertical;
  max?: number;
}): HiddenSignal[] {
  const all = collectHiddenSignals(input.vertical);
  return all
    .filter(
      (s) =>
        s.horizon === "THIS_MONTH" ||
        s.horizon === "STRUCTURAL" ||
        !s.promoteToCockpit,
    )
    .sort((a, b) => {
      const hi =
        HORIZON_ORDER.indexOf(a.horizon) - HORIZON_ORDER.indexOf(b.horizon);
      if (hi !== 0) return hi;
      return materialScore(b) - materialScore(a);
    })
    .slice(0, input.max ?? 8);
}
