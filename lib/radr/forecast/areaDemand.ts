/**
 * Area demand index - explainable local pressure signal.
 */

export type AreaDemandDriver = {
  label: string;
  /** Percentage-point contribution to index vs typical. */
  deltaPct: number;
};

export type AreaDemandIndex = {
  locationId: string;
  level: "LOW" | "NORMAL" | "HIGH" | "VERY_HIGH";
  vsTypicalPct: number;
  drivers: AreaDemandDriver[];
  summary: string;
};

export function composeAreaDemandIndex(
  locationId: string,
  drivers: AreaDemandDriver[],
): AreaDemandIndex {
  const vsTypicalPct = Math.round(
    drivers.reduce((s, d) => s + d.deltaPct, 0) * 10,
  ) / 10;
  const level: AreaDemandIndex["level"] =
    vsTypicalPct >= 20
      ? "VERY_HIGH"
      : vsTypicalPct >= 8
        ? "HIGH"
        : vsTypicalPct <= -8
          ? "LOW"
          : "NORMAL";

  return {
    locationId,
    level,
    vsTypicalPct,
    drivers: drivers.filter((d) => d.deltaPct !== 0),
    summary:
      vsTypicalPct >= 0
        ? `+${vsTypicalPct}% vs typical Thursday`
        : `${vsTypicalPct}% vs typical Thursday`,
  };
}
