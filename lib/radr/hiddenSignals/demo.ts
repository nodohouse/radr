/**
 * Demo HiddenSignals — cross-system meaning, not single-metric alerts.
 */

import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { parseHiddenSignal } from "@/lib/radr/domain/hiddenSignal";

/** Homepage / brief exemplars. */
export const DEMO_HIDDEN_SIGNALS: HiddenSignal[] = [
  parseHiddenSignal({
    id: "hs_menu_bestsellers_weak",
    kind: "BESTSELLER_WEAK_ECONOMICS",
    vertical: "restaurant",
    horizon: "THIS_MONTH",
    headline: "Your bestseller is not your best dish.",
    what: "Tuna Tataki is #1 by sales (8,420 units · €151,560 revenue). Truffle Pasta produces +34% contribution per kitchen minute with lower waste and faster ticket time.",
    whyMatters:
      "During peak service, promoting volume leaders can increase kitchen pressure while leaving contribution on the table.",
    valueLabel: "Annualized opportunity",
    valueAmount: 8420,
    valuePositive: true,
    recommendation:
      "Increase Truffle Pasta prominence during peak periods — menu placement and server prompt.",
    epistemic: "HISTORICALLY_FOLLOWED",
    sampleSize: 8420,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "POS + recipe cost + ticket timing joined across 12 months. Kitchen burden estimated from prep standards.",
    evidence: [
      { label: "Tataki volume rank", value: "#1", kind: "ACTUAL" },
      { label: "Tataki contribution margin", value: "62.2%", kind: "ACTUAL" },
      { label: "Tataki stockouts", value: "17", kind: "ACTUAL" },
      {
        label: "Pasta vs Tataki · contribution / kitchen min",
        value: "+34%",
        kind: "ESTIMATE",
      },
      { label: "Pasta waste", value: "Lower vs Tataki", kind: "ACTUAL" },
    ],
    systemsJoined: ["POS", "Recipes", "Inventory", "Ticket times"],
    promoteToCockpit: false,
  }),
  parseHiddenSignal({
    id: "hs_hotel_occ_quality",
    kind: "OCCUPANCY_WEAK_ECONOMICS",
    vertical: "hotel",
    horizon: "THIS_MONTH",
    headline: "Occupancy is up. Economics are weaker.",
    what: "Occupancy +6 pts looks strong. OTA mix +11 pts drove distribution cost +€8,420. Contribution −2.1%.",
    whyMatters:
      "Filling rooms through high-fee channels can raise occupancy while eroding contribution — PMS occupancy alone hides the quality of demand.",
    valueLabel: "Distribution cost swing",
    valueAmount: 8420,
    valuePositive: false,
    recommendation:
      "Protect direct / corporate share on shoulder dates · review OTA promotions that fill without contribution.",
    epistemic: "ASSOCIATED",
    sampleSize: 28,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "PMS occupancy + channel manager fees + accounting contribution over 28 comparable nights.",
    evidence: [
      { label: "Occupancy vs prior", value: "+6 pts", kind: "ACTUAL" },
      { label: "OTA mix shift", value: "+11 pts", kind: "ACTUAL" },
      { label: "Distribution cost", value: "+€8,420", kind: "ACTUAL" },
      { label: "Contribution", value: "−2.1%", kind: "ACTUAL" },
    ],
    systemsJoined: ["PMS", "Channel manager", "Accounting"],
    promoteToCockpit: false,
  }),
  parseHiddenSignal({
    id: "hs_orphan_not_random",
    kind: "ORPHAN_NIGHT_PATTERN",
    vertical: "serviced_apartments",
    horizon: "TODAY",
    headline: "This empty night is not random.",
    what: "1-night Tuesday gaps fill historically at 64% when minimum stay is relaxed ≥3 days ahead. Median profitable price €148.",
    whyMatters:
      "Treating every gap as noise leaves perishable nights closed. Pattern + price + lead time turns an empty night into a decision.",
    valueLabel: "Orphan night opportunity",
    valueAmount: 164,
    valuePositive: true,
    recommendation:
      "Open 1-night inventory on Unit 24 Tuesday at €148–€164 · disclose constraints.",
    epistemic: "EXPECTED",
    sampleSize: 47,
    confidenceBand: "MEDIUM",
    confidenceExplanation:
      "47 comparable Tuesday gaps over 18 months. Fill probability conditional on lead time ≥3 days.",
    evidence: [
      { label: "Gap type", value: "1-night · Tuesday", kind: "ACTUAL" },
      { label: "Historical fill", value: "64%", kind: "BASELINE" },
      { label: "Lead-time rule", value: "≥3 days ahead", kind: "INFERENCE" },
      { label: "Median profitable price", value: "€148", kind: "BASELINE" },
    ],
    systemsJoined: ["PMS", "Channel manager", "Pricing"],
    promoteToCockpit: true,
  }),
  parseHiddenSignal({
    id: "hs_weather_operation",
    kind: "WEATHER_OPERATING_RESPONSE",
    vertical: "restaurant",
    horizon: "TODAY",
    trigger: "Warm dry forecast · Thursday",
    headline: "Weather changed the operation.",
    what: "Based on 38 comparable services: terrace demand +23%, walk-ins +16%, aperitif sales +19%. Current staffing insufficient 18:30–20:00.",
    whyMatters:
      "Weather is the trigger. The intelligence is demand shift, capacity constraint, and net economics — not the forecast itself.",
    valueLabel: "Expected net opportunity",
    valueAmount: 348,
    valuePositive: true,
    recommendation: "Add one FOH · 18:30–20:00 · prioritize terrace + aperitif.",
    epistemic: "EXPECTED",
    sampleSize: 38,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "38 warm-dry Thursday services at this location. Staffing vs covers from labor + reservations + POS.",
    evidence: [
      { label: "Comparable services", value: "38", kind: "SAMPLE" },
      { label: "Terrace demand", value: "+23%", kind: "BASELINE" },
      { label: "Walk-ins", value: "+16%", kind: "BASELINE" },
      { label: "Aperitif sales", value: "+19%", kind: "BASELINE" },
      { label: "Gross opportunity", value: "€420", kind: "ESTIMATE" },
      { label: "Cost to capture", value: "€72", kind: "ESTIMATE" },
      { label: "Expected net", value: "€348", kind: "ESTIMATE" },
    ],
    systemsJoined: ["Weather", "Reservations", "Labor", "POS"],
    promoteToCockpit: true,
  }),
];

export function hiddenSignalsForVertical(
  vertical: HiddenSignal["vertical"],
): HiddenSignal[] {
  return DEMO_HIDDEN_SIGNALS.filter((s) => s.vertical === vertical);
}

export function homepageHiddenSignalStories(): HiddenSignal[] {
  return [
    DEMO_HIDDEN_SIGNALS[0]!,
    DEMO_HIDDEN_SIGNALS[1]!,
    DEMO_HIDDEN_SIGNALS[2]!,
  ];
}
