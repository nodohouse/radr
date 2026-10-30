"use client";

/**
 * Tonight's Movers + capacity-aware Upsell — SELL × OPS × CONTRIBUTION.
 */

import Image from "next/image";
import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { berlinMenuItems } from "@/data/demo/menuIntelligence";
import { getTopDishes } from "@/lib/radr/intelligence/topDishes";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";

type Mover = {
  name: string;
  imageSrc: string | null;
  units: number;
  revenue: number;
  contribution: number;
  vsExpected: number;
  state: string;
};

type Upsell = {
  pair: string;
  imageSrc: string | null;
  basketFreq: string;
  avgBasket: string;
  incremental: string;
  attachLift: string;
  promote: boolean;
  holdReason: string | null;
};

function movers(): Mover[] {
  const report = getTopDishes("tonight");
  return report.rows
    .slice()
    .sort((a, b) => Math.abs(b.vsComparablePct) - Math.abs(a.vsComparablePct))
    .slice(0, 4)
    .map((d) => {
      const item = berlinMenuItems().find((m) => m.itemId === d.itemId);
      const stockout = item?.historicalDemand?.toLowerCase().includes("limit")
        ? "Stock watch"
        : d.vsComparablePct > 8
          ? "Hot"
          : d.vsComparablePct < -5
            ? "Soft"
            : "On pace";
      return {
        name: d.name,
        imageSrc: d.imageSrc,
        units: d.units,
        revenue: d.revenue,
        contribution: d.contribution,
        vsExpected: d.vsComparablePct,
        state: stockout,
      };
    });
}

function upsells(): Upsell[] {
  const tuna = berlinMenuItems().find((m) => m.itemId === "mi_tuna_tataki");
  const negroni = berlinMenuItems().find((m) => m.itemId === "mi_negroni");
  const pasta = berlinMenuItems().find((m) => m.itemId === "mi_truffle_pasta");
  const wine = berlinMenuItems().find((m) => m.itemId === "mi_wine_glass");

  const peakHold =
    LIVE_SCENARIO.clockLabel >= "19:30" &&
    Boolean(tuna?.ingredientConstraints?.length);

  return [
    {
      pair: "Tuna Tataki + Negroni",
      imageSrc: tuna?.imageSrc ?? negroni?.imageSrc ?? null,
      basketFreq: "19% of tuna covers",
      avgBasket: "€44",
      incremental: `+€${negroni?.contribution ?? 9}`,
      attachLift: "+6pp vs house cocktail",
      promote: !peakHold,
      holdReason: peakHold
        ? "Hold · Tuna stocks out ~21:18 · kitchen at peak"
        : null,
    },
    {
      pair: "Truffle Pasta + House wine",
      imageSrc: pasta?.imageSrc ?? wine?.imageSrc ?? null,
      basketFreq: "23% attach",
      avgBasket: "€48",
      incremental: "+€11",
      attachLift: "+4pp dessert path",
      promote: true,
      holdReason: null,
    },
  ];
}

export function TonightMoversPanel() {
  const rows = movers();
  const pairs = upsells();

  return (
    <div className="rp-movers" aria-label="Tonight's movers">
      <header className="rp-movers-head">
        <p className="rp-live-k">Tonight&apos;s movers</p>
        <Link href="/app/intelligence/menu">Menu →</Link>
      </header>
      <ul className="rp-movers-list">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="rp-movers-img">
              {r.imageSrc ? (
                <Image src={r.imageSrc} alt="" width={48} height={48} />
              ) : (
                <span data-empty="true" />
              )}
            </span>
            <div className="rp-movers-body">
              <strong>{r.name}</strong>
              <span>
                {r.units} · {formatDecisionMoney(r.revenue)} ·{" "}
                {formatDecisionMoney(r.contribution)}
              </span>
            </div>
            <div className="rp-movers-meta">
              <em data-pos={r.vsExpected >= 0 ? "true" : undefined}>
                {r.vsExpected >= 0 ? "+" : ""}
                {r.vsExpected}%
              </em>
              <span>{r.state}</span>
            </div>
          </li>
        ))}
      </ul>

      <header className="rp-movers-head">
        <p className="rp-live-k">Upsell · basket</p>
        <span>SELL × OPS</span>
      </header>
      <ul className="rp-upsell-list">
        {pairs.map((p) => (
          <li key={p.pair} data-hold={!p.promote ? "true" : undefined}>
            <span className="rp-movers-img">
              {p.imageSrc ? (
                <Image src={p.imageSrc} alt="" width={40} height={40} />
              ) : (
                <span data-empty="true" />
              )}
            </span>
            <div className="rp-movers-body">
              <strong>{p.pair}</strong>
              <span>
                {p.basketFreq} · avg {p.avgBasket} · {p.incremental} ·{" "}
                {p.attachLift}
              </span>
              {p.holdReason ? (
                <em className="rp-upsell-hold">{p.holdReason}</em>
              ) : (
                <em className="rp-upsell-go">Ready to promote</em>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
