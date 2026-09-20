"use client";

import type {
  ChartDayCase,
  OpTerritory,
  VenueLocation,
} from "@/lib/radr/operatingHero";
import { DEMO_ORG } from "@/lib/radr/demoModel";
import { GROUP_LEADERBOARD } from "@/lib/radr/operatingHero";
import { LocationSwitcher } from "./LocationSwitcher";
import { OperatingChart } from "./OperatingChart";
import { TextSep } from "@/components/TextSep";

type Props = {
  location: VenueLocation;
  onLocationChange: (id: string) => void;
  highlightTerritory: OpTerritory | null;
  onChartDayClick: (day: ChartDayCase) => void;
  onOpenTerritory: (t: OpTerritory) => void;
  ready: boolean;
};

const ATTENTION: Record<
  OpTerritory,
  { title: string; money: string; territory: OpTerritory }
> = {
  buy: { title: "Supplier invoice discrepancy", money: "€118", territory: "buy" },
  labor: { title: "Peak service capacity", money: "€290", territory: "labor" },
  sell: { title: "Terrace weather opportunity", money: "€420", territory: "sell" },
  recover: { title: "Table 14 verified", money: "€184", territory: "recover" },
};

/**
 * Operating heart: five questions, Level 1 only.
 * How are we doing → How does that compare → What changed → What needs attention.
 */
export function OperationCore({
  location,
  onLocationChange,
  highlightTerritory,
  onChartDayClick,
  onOpenTerritory,
  ready,
}: Props) {
  const vs =
    location.marginVsPlan >= 0
      ? `+${location.marginVsPlan.toFixed(1)} pts vs plan`
      : `${location.marginVsPlan.toFixed(1)} pts vs plan`;

  const peers = GROUP_LEADERBOARD.filter(
    (p) => Math.abs(p.rank - location.rank) <= 1,
  ).slice(0, 3);

  const cue =
    ATTENTION[highlightTerritory ?? "buy"] ?? ATTENTION.buy;

  return (
    <div className="rx-om-core" data-ready={ready ? "true" : "false"}>
      <LocationSwitcher location={location} onChange={onLocationChange} />

      {/* 1 · How are we doing */}
      <div className="rx-om-core-margin">
        <strong>{location.margin.toFixed(1)}%</strong>
        <TextSep srOnly>: </TextSep>
        <em>Operating margin</em>
        <TextSep />
        <span
          className="rx-om-core-vs"
          data-pos={location.marginVsPlan >= 0 ? "true" : "false"}
        >
          {vs}
        </span>
      </div>

      {/* 2 · How does that compare */}
      <p className="rx-om-core-rank">
        <strong>
          #{location.rank} of {DEMO_ORG.locations}
        </strong>
        <TextSep />
        <span className="rx-om-core-peers" aria-label="Nearby peers">
          {peers.map((p, i) => (
            <em key={p.name} data-self={p.rank === location.rank ? "true" : "false"}>
              {i > 0 ? <TextSep /> : null}
              {p.name.split(" ")[0]} {p.margin.toFixed(1)}%
            </em>
          ))}
        </span>
      </p>

      {/* 3 · What changed */}
      <div className="rx-om-core-chart">
        <OperatingChart
          currency={location.currency}
          highlightTerritory={highlightTerritory}
          onDayClick={onChartDayClick}
        />
      </div>

      {/* 4 · What needs attention: one cue; click opens depth */}
      <button
        type="button"
        className="rx-om-core-attention"
        onClick={() => onOpenTerritory(cue.territory)}
      >
        <em>{cue.territory.toUpperCase()}</em>
        <TextSep />
        <strong>{cue.title}</strong>
        <TextSep />
        <span>{cue.money}</span>
      </button>
    </div>
  );
}
