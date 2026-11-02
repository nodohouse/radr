"use client";

import Link from "next/link";
import type { HouseAttentionState, HouseSummary } from "@/lib/radr/product/houseAttention";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type { BohView } from "./BohShell";

type Props = {
  house: HouseSummary;
  statusFilter: HouseAttentionState | "all";
  onStatusFilter: (s: HouseAttentionState | "all") => void;
  onOpenActions: () => void;
  onOpenView: (v: BohView) => void;
  onOpenStockItem: (slug: string) => void;
  isHotel: boolean;
};

export function BohOverview({ house, onOpenView, onOpenStockItem, isHotel }: Props) {
  const risks = house.stock.filter(r => r.risk === "critical" || r.risk === "risk");
  const pending = house.deliveries.filter(d => d.status !== "arrived");
  const exceptions = pending.filter(d => ["late", "short", "damaged", "unverified"].includes(d.status));
  const hero = house.gaps.find(g => g.attention === "needs_you") ?? house.gaps[0];
  const prep = house.prep;
  const readiness = prep ? Math.round(prep.prepared / prep.required * 100) : house.readiness.readinessPct;
  return <div className="simp-house">
    <section className="simp-metrics" aria-label="Today's readiness">
      <button onClick={() => onOpenView("stock")}><span>Stock at risk</span><strong>{risks.length}</strong><small>Items below operating standard</small></button>
      <button onClick={() => onOpenView("prep")}><span>{isHotel ? "Room readiness" : "Prep readiness"}</span><strong>{readiness}%</strong><small>{house.readiness.readinessNote}</small></button>
      <button onClick={() => onOpenView("deliveries")}><span>Delivery exceptions</span><strong>{exceptions.length}</strong><small>{pending.length} deliveries awaiting resolution</small></button>
    </section>
    <section className="simp-attention" aria-label="Needs attention today">
      <header><span className="rs-eyebrow">NEEDS ATTENTION TODAY</span><span className="boh-muted">Current observations · illustrative demo</span></header>
      {hero ? <div className="simp-house-decision"><div><span className="boh-badge is-needs">{hero.attention === "needs_you" ? "Needs you" : hero.attention === "handling" ? "RADR is handling" : "Watching"}</span><h2>{hero.item}</h2><p>{hero.area} · {hero.observedQty} on hand against {hero.standardQty} standard.</p><p>{hero.humanNeed || hero.radrDid}</p></div><div className="simp-house-action"><span>Run-out estimate</span><strong>{hero.timeToStockout || "Not available"}</strong>{hero.decisionId ? <Link className="boh-btn-primary" href={`/app/decisions/${hero.decisionId}`}>Review {displayDecisionId(hero.decisionId)} →</Link> : <button className="boh-btn-primary" onClick={() => onOpenStockItem(hero.item.toLowerCase().replace(/\s+/g,"-"))}>Review options →</button>}<button className="boh-link" onClick={() => onOpenStockItem(hero.item.toLowerCase().replace(/\s+/g,"-"))}>Stock evidence →</button></div></div> : <p>No unresolved stock gaps in this snapshot.</p>}
      <div className="simp-house-signals">
        <button onClick={() => onOpenView("prep")}><span>{isHotel ? "Readiness" : "Prep bottleneck"}</span><strong>{prep ? prep.title : house.readiness.title}</strong><small>{prep ? `${prep.forecastShort} forecast short · ${prep.windowLeftMin} min left` : house.readiness.readinessNote}</small><b>Review readiness →</b></button>
        <button onClick={() => onOpenView("deliveries")}><span>Deliveries</span><strong>{exceptions.length ? `${exceptions.length} ${exceptions.length === 1 ? "exception" : "exceptions"} to resolve` : "No recorded delivery exceptions"}</strong><small>{(exceptions[0] || pending[0])?.note || "Review the delivery record for confirmations."}</small><b>Review deliveries →</b></button>
      </div>
    </section>
    <p className="simp-footnote">Camera, voice and notes remain in Captures. Verified outcomes are kept in History, separate from today’s risks.</p>
  </div>;
}
