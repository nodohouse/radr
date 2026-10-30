"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BerlinServiceUniverse } from "@/lib/radr/service/universe";
import { matchesForOpportunity } from "@/lib/radr/service/universe";
import { canOfferRecovery } from "@/lib/radr/service/matchEngine";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { setServiceView } from "@/lib/radr/product/connectedState";

type Props = { universe: BerlinServiceUniverse };

export function ServiceRecovery({ universe }: Props) {
  const [activeId, setActiveId] = useState(
    universe.opportunities[0]?.id ?? null,
  );
  const active = universe.opportunities.find((o) => o.id === activeId) ?? null;
  const matches = useMemo(
    () => (active ? matchesForOpportunity(active.id) : []),
    [active],
  );
  const demandById = useMemo(() => {
    const m = new Map(universe.demand.map((d) => [d.id, d]));
    return m;
  }, [universe.demand]);

  const openEuro = universe.opportunities
    .filter((o) => o.state === "open" || o.state === "prepared")
    .reduce((s, o) => s + o.expectedContributionEuro, 0);

  return (
    <div className="rp-srv">
      <header className="rp-srv-hero">
        <p className="rp-svc-kicker">Recoverable tonight</p>
        <h2 className="rp-srv-hero-figure">
          <strong>{formatDecisionMoney(universe.summary.recoverableEuro)}</strong>
          <span>Recoverable tonight</span>
        </h2>
        <p className="rp-srv-hero-lede">
          What value can still be captured — through connected reservation systems.
        </p>
        <ul className="rp-srv-hero-metrics">
          <li>
            <strong>{universe.opportunities.length}</strong>
            <span>opportunities</span>
          </li>
          <li>
            <strong>{universe.summary.waitingCount}</strong>
            <span>compatible parties waiting</span>
          </li>
          {openEuro !== universe.summary.recoverableEuro ? (
            <li data-tone="value">
              <strong>{formatDecisionMoney(openEuro)}</strong>
              <span>open now</span>
            </li>
          ) : null}
        </ul>
        <p className="rp-srv-sources" aria-label="Waiting by source">
          {universe.waitingBySource.map((s) => (
            <em key={s.source}>
              <b>{s.source}</b>
              <i>{s.count}</i>
            </em>
          ))}
        </p>
      </header>

      <div className="rp-srv-layout">
        <ul className="rp-srv-queue" aria-label="Recovery queue">
          {universe.opportunities.map((o) => {
            const tables = o.tableIds
              .map((t) => t.replace(/^t/i, ""))
              .join(" · ");
            return (
              <li key={o.id}>
                <article
                  className="rp-srv-card"
                  data-active={activeId === o.id ? "true" : undefined}
                  data-impact={o.operationalImpact}
                  aria-label={`Opportunity · Table ${tables} · ${o.start}`}
                >
                  <header>
                    <div className="rp-srv-card-id">
                      <button
                        type="button"
                        className="rp-srv-card-title"
                        aria-pressed={activeId === o.id}
                        onClick={() => setActiveId(o.id)}
                      >
                        <span className="rp-srv-card-time">{o.start}</span>
                        <span className="rp-srv-card-table">Table {tables}</span>
                      </button>
                      <p className="rp-srv-source">
                        {o.source.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="rp-srv-card-value">
                      <strong>
                        {formatDecisionMoney(o.expectedContributionEuro)}
                      </strong>
                      <span>expected</span>
                    </div>
                  </header>
                  <dl>
                    <div>
                      <dt>Fits</dt>
                      <dd>
                        {o.partySizeFit.min === o.partySizeFit.max
                          ? o.partySizeFit.min
                          : `${o.partySizeFit.min}–${o.partySizeFit.max}`}{" "}
                        guests
                      </dd>
                    </div>
                    <div>
                      <dt>Compatible demand</dt>
                      <dd>{o.compatibleDemandIds.length} parties</dd>
                    </div>
                    <div>
                      <dt>Pressure</dt>
                      <dd data-impact={o.operationalImpact}>
                        {o.operationalImpact}
                      </dd>
                    </div>
                    <div>
                      <dt>Confidence</dt>
                      <dd>{Math.round(o.confidence * 100)}%</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="rp-srv-cta-inline"
                    onClick={() => setActiveId(o.id)}
                  >
                    Prepare recovery →
                  </button>
                </article>
              </li>
            );
          })}
        </ul>

        <aside className="rp-srv-detail" aria-label="Match engine">
          {active ? (
            <>
              <header>
                <p className="rp-svc-kicker">
                  Table {active.tableIds.map((t) => t.replace(/^t/i, "")).join(" · ")}{" "}
                  · {active.start}
                </p>
                <h3>Matching demand</h3>
                <p>
                  Ranked for fit, wait, contribution, and policy — explainable,
                  not opaque favoritism.
                </p>
              </header>
              <ol className="rp-srv-matches">
                {matches.map((m) => {
                  const d = demandById.get(m.demandId);
                  if (!d) return null;
                  const flexMin = d.flexibility.latestMinutes;
                  const window =
                    d.waitMinutes != null && d.waitMinutes > 0
                      ? `${d.waitMinutes} min waiting`
                      : flexMin != null
                        ? `${d.preferredTime} ±${flexMin}m`
                        : d.preferredTime;
                  return (
                    <li key={m.demandId}>
                      <span className="rp-srv-rank">{m.rank}</span>
                      <div className="rp-srv-match-body">
                        <strong>Party {d.partyLabel}</strong>
                        <dl className="rp-srv-match-facts">
                          <div>
                            <dt>Guests</dt>
                            <dd>{d.partySize}</dd>
                          </div>
                          <div>
                            <dt>Window</dt>
                            <dd>{window}</dd>
                          </div>
                          <div>
                            <dt>Fit</dt>
                            <dd>{m.fitPct}%</dd>
                          </div>
                        </dl>
                        <p>{m.reason}</p>
                        <em>via {d.source.replace(/_/g, " ")}</em>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {canOfferRecovery(active) ? (
                <div className="rp-srv-actions">
                  <p>
                    RADR can <strong>prepare</strong> notify / offer through the
                    connected reservation system — ActionGateway. No duplicate SMS
                    stack.
                  </p>
                  <p className="rp-srv-policy">
                    Auto-act only when policy allows: contribution &gt; €100 ·
                    confidence &gt; 85% · guest impact low · pressure under
                    threshold · no protected inventory.
                  </p>
                  {active.decisionId ? (
                    <Link
                      href={`/app/decisions/${active.decisionId}`}
                      className="rp-svc-cta"
                    >
                      Open {displayDecisionId(active.decisionId)} →
                    </Link>
                  ) : (
                    <Link
                      href={`/app/decisions/${DECISION_IDS.tableRecover}`}
                      className="rp-svc-cta"
                    >
                      Open recovery Decision →
                    </Link>
                  )}
                  <button
                    type="button"
                    className="rp-svc-cta-sec"
                    onClick={() => setServiceView("floor")}
                  >
                    View on Floor →
                  </button>
                </div>
              ) : (
                <p className="rp-srv-blocked">
                  Recovery offer blocked — demand unavailable or confidence below
                  threshold.
                </p>
              )}
            </>
          ) : (
            <p className="rp-srv-empty">Select a recoverable gap.</p>
          )}
        </aside>
      </div>

      <section className="rp-srv-walkins" aria-label="Walk-in queue">
        <header>
          <p className="rp-svc-kicker">Walk-in queue</p>
          <h3>Waiting on the floor</h3>
        </header>
        <ul>
          {universe.walkIns.map((w) => (
            <li key={w.id}>
              <strong>{w.partyLabel}</strong>
              <span>{w.partySize} guests</span>
              <span>{w.waitMinutes} min waiting</span>
              <span>Est. {w.estimatedSeatMinutes} min</span>
              <em>
                {w.compatibleTableIds
                  .map((t) => t.replace(/^t/i, "T"))
                  .join(" / ")}
              </em>
              <i data-state={w.state}>{w.state}</i>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
