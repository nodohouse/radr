"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import {
  getCostMovers,
  getTunaVendorForks,
  primaryCostMover,
  type CostMoverHorizon,
  type VendorSkuCostMover,
} from "@/lib/radr/procurement/costMovers";
import "./cost-movers.css";

const HORIZONS: CostMoverHorizon[] = ["7D", "30D", "90D", "1Y"];

export function CostMovers({ compact }: { compact?: boolean }) {
  const movers = useMemo(() => getCostMovers(), []);
  const [activeId, setActiveId] = useState(primaryCostMover().skuId);
  const [horizon, setHorizon] = useState<CostMoverHorizon>("30D");
  const active = movers.find((m) => m.skuId === activeId) ?? movers[0]!;
  const forks = getTunaVendorForks();

  return (
    <div className="rp-cost-movers" data-compact={compact ? "true" : undefined}>
      <div className="rp-cost-movers-head">
        <p className="rp-cost-movers-k">Procurement exposure</p>
        <div className="rp-cost-movers-horizons" role="tablist" aria-label="Price horizon">
          {HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              role="tab"
              aria-selected={horizon === h}
              data-active={horizon === h ? "true" : undefined}
              onClick={() => setHorizon(h)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <ul className="rp-cost-movers-rail">
        {movers.map((m) => (
          <li key={m.skuId}>
            <button
              type="button"
              className="rp-cost-movers-chip"
              data-active={m.skuId === activeId ? "true" : undefined}
              onClick={() => setActiveId(m.skuId)}
            >
              <strong>{m.name.split("·")[0]?.trim() ?? m.name}</strong>
              <span>
                {m.changePct30d >= 0 ? "+" : ""}
                {m.changePct30d.toFixed(1)}% · {formatDecisionMoney(m.exposureEuro)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <CostMoverHero mover={active} horizon={horizon} />

      {active.skuId === "sku_tuna_bluefin" ? (
        <section className="rp-cost-movers-forks" aria-label="Tuna vendor futures">
          <p className="rp-cost-movers-k">Vendor choice · tuna peak</p>
          <ul>
            {forks.map((f) => (
              <li key={f.id} data-rec={f.recommended ? "true" : undefined}>
                <div>
                  <strong>{f.vendor}</strong>
                  <span>{f.note}</span>
                </div>
                <em>{formatDecisionMoney(f.expectedContributionEuro)} protected</em>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CostMoverHero({
  mover,
  horizon,
}: {
  mover: VendorSkuCostMover;
  horizon: CostMoverHorizon;
}) {
  const series = mover.priceSeries[horizon];
  const max = Math.max(...series.flatMap((p) => [p.contract, p.paid]), 1);
  const w = 320;
  const h = 120;
  const pad = 8;

  const xAt = (i: number) =>
    pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
  const yAt = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const contractPts = series.map((p, i) => `${xAt(i)},${yAt(p.contract)}`).join(" ");
  const paidPts = series.map((p, i) => `${xAt(i)},${yAt(p.paid)}`).join(" ");

  return (
    <article className="rp-cost-movers-hero">
      <header>
        <div>
          <h3>{mover.name}</h3>
          <p>
            {mover.vendor} · {mover.fillRatePct}% fill · {mover.leadTimeDays}d lead
          </p>
        </div>
        <div className="rp-cost-movers-exposure">
          <strong>{formatDecisionMoney(mover.exposureEuro)}</strong>
          <span>exposed</span>
        </div>
      </header>

      <svg
        className="rp-cost-movers-chart"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`${mover.name} contract vs paid ${horizon}`}
      >
        <polyline points={contractPts} className="rp-cost-movers-contract" fill="none" />
        <polyline points={paidPts} className="rp-cost-movers-paid" fill="none" />
      </svg>

      <div className="rp-cost-movers-rates">
        <span>
          Contract €{mover.contractRate.toFixed(2)}/{mover.unit}
        </span>
        <span data-up={mover.currentRate > mover.contractRate ? "true" : undefined}>
          Paid €{mover.currentRate.toFixed(2)}/{mover.unit}
        </span>
      </div>

      <p className="rp-cost-movers-read">{mover.radrRead}</p>
      {mover.relatedDecisionId ? (
        <Link href={`/app/decisions/${mover.relatedDecisionId}`} className="rp-cost-movers-link">
          Open {displayDecisionId(mover.relatedDecisionId)} →
        </Link>
      ) : null}
    </article>
  );
}
