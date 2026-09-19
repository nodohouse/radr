/**
 * Economic Clock — value decays with time.
 * Priority uses VALUE × URGENCY × PROBABILITY × REVERSIBILITY (internal).
 */

export type ValueDecayPoint = {
  at: string;
  label: string;
  valueEuro: number;
};

export type EconomicClock = {
  decisionId: string;
  title: string;
  vertical: "restaurant" | "hotel" | "apartment";
  nowValueEuro: number;
  decideBy: string;
  deterioratesAfter?: string;
  decay: ValueDecayPoint[];
  unitLabel: string;
};

export function tableCancellationClock(): EconomicClock {
  return {
    decisionId: "dec_table_recover_berlin",
    title: "Table cancelled",
    vertical: "restaurant",
    nowValueEuro: 184,
    decideBy: "Now",
    decay: [
      { at: "18:58", label: "Now", valueEuro: 184 },
      { at: "19:10", label: "+12 min", valueEuro: 166 },
      { at: "19:25", label: "+27 min", valueEuro: 112 },
      { at: "19:45", label: "+47 min", valueEuro: 48 },
      { at: "20:00", label: "Service", valueEuro: 0 },
    ],
    unitLabel: "recoverable contribution",
  };
}

export function tunaEconomicClock(): EconomicClock {
  return {
    decisionId: "dec_tuna_berlin",
    title: "Tuna shortfall",
    vertical: "restaurant",
    nowValueEuro: 1840,
    decideBy: "17:15",
    deterioratesAfter: "17:30",
    decay: [
      { at: "17:15", label: "Decide by", valueEuro: 1640 },
      { at: "17:30", label: "Deteriorates", valueEuro: 1180 },
      { at: "18:00", label: "+45 min", valueEuro: 640 },
      { at: "19:30", label: "Peak", valueEuro: 0 },
    ],
    unitLabel: "expected protected",
  };
}

export function hotelChannelClock(): EconomicClock {
  return {
    decisionId: "dec_ota_canal",
    title: "Premium sold through high-cost channel",
    vertical: "hotel",
    nowValueEuro: 4200,
    decideBy: "Before noon",
    decay: [
      { at: "NOW", label: "Hold window open", valueEuro: 3100 },
      { at: "72h", label: "Release pressure", valueEuro: 1800 },
      { at: "Sold", label: "Margin diluted", valueEuro: 0 },
    ],
    unitLabel: "contribution at risk to mix",
  };
}

export function orphanNightClock(): EconomicClock {
  return {
    decisionId: "dec_orphan_chiado",
    title: "One-night gap",
    vertical: "apartment",
    nowValueEuro: 164,
    decideBy: "≥72h ahead",
    decay: [
      { at: "72h+", label: "Recoverable", valueEuro: 164 },
      { at: "48h", label: "Fading", valueEuro: 98 },
      { at: "Check-in", label: "Expired", valueEuro: 0 },
    ],
    unitLabel: "net opportunity",
  };
}

export type Reversibility = "easy" | "moderate" | "hard";

/**
 * Internal priority — do not expose formula.
 * Safety override handled by caller.
 */
export function economicPriorityScore(input: {
  valueEuro: number;
  urgency01: number;
  probability01: number;
  reversibility: Reversibility;
  actionable01?: number;
  confidence01?: number;
  roleRelevance01?: number;
  safetyOverride?: boolean;
}): number {
  if (input.safetyOverride) return 1e9;
  const rev =
    input.reversibility === "easy"
      ? 1
      : input.reversibility === "moderate"
        ? 0.75
        : 0.45;
  const materiality = Math.min(1, input.valueEuro / 5000);
  return (
    materiality *
    input.urgency01 *
    input.probability01 *
    rev *
    (input.actionable01 ?? 1) *
    (input.confidence01 ?? 0.8) *
    (input.roleRelevance01 ?? 1)
  );
}

export function valueAtDecay(
  clock: EconomicClock,
  atLabel: string,
): number | undefined {
  return clock.decay.find((d) => d.at === atLabel || d.label === atLabel)
    ?.valueEuro;
}
