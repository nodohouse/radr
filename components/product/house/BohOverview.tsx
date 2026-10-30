"use client";

import Link from "next/link";
import type {
  HouseAttentionState,
  HouseCapture,
  HouseSummary,
} from "@/lib/radr/product/houseAttention";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import type { BohView } from "./BohShell";
import {
  IconAlert,
  IconBars,
  IconBox,
  IconCheck,
  IconPlay,
  IconSpark,
  IconTruck,
  channelIcon,
} from "./BohIcons";

type Props = {
  house: HouseSummary;
  statusFilter: HouseAttentionState | "all";
  onStatusFilter: (s: HouseAttentionState | "all") => void;
  onOpenActions: () => void;
  onOpenView: (v: BohView) => void;
  onOpenStockItem: (slug: string) => void;
  isHotel: boolean;
};

const RISK_LABEL = {
  critical: "Critical",
  risk: "At risk",
  watch: "Watching",
  ok: "On standard",
} as const;

function channelLabel(c: HouseCapture["channel"]) {
  if (c === "note") return "Note";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function itemSlug(item: string) {
  return item.toLowerCase().replace(/\s+/g, "-");
}

export function BohOverview({
  house,
  statusFilter,
  onStatusFilter,
  onOpenActions,
  onOpenView,
  onOpenStockItem,
  isHotel,
}: Props) {
  const hero =
    house.gaps.find((g) => g.attention === "needs_you") ?? house.gaps[0];
  const handling = house.gaps.filter(
    (g) => g.attention === "handling" || g.attention === "watching",
  );
  const captures = house.captures
    .filter((c) => c.status !== "stub")
    .slice(0, 2);
  const prep = house.prep;
  const prepPct = prep
    ? Math.round((prep.prepared / prep.required) * 100)
    : house.readiness.readinessPct;
  const stockRisks = house.stock.filter(
    (r) => r.risk === "critical" || r.risk === "risk",
  );
  const criticalGaps = house.gaps.filter((g) => g.attention === "needs_you");
  const deliveriesDue = house.deliveries.filter(
    (d) => d.status === "expected" || d.status === "short",
  );
  const nextDelivery =
    house.deliveries.find((d) => d.status === "expected") ?? deliveriesDue[0];
  const verified = house.verifications[0];

  const stockRows = [...house.stock]
    .filter((r) => {
      if (statusFilter === "all") return r.risk !== "ok";
      if (statusFilter === "needs_you") return r.risk === "critical";
      if (statusFilter === "handling") return r.risk === "risk";
      if (statusFilter === "watching") return r.risk === "watch";
      return r.risk === "ok";
    })
    .sort((a, b) => {
      const rank = { critical: 0, risk: 1, watch: 2, ok: 3 };
      return rank[a.risk] - rank[b.risk];
    })
    .slice(0, 5);

  const supplierName = (id: string) =>
    house.suppliers.find((s) => s.id === id)?.name ?? "—";

  return (
    <div className="boh-overview-wrap">
      <div className="boh-pills" role="group" aria-label="Attention posture">
        <button
          type="button"
          className={statusFilter === "needs_you" ? "boh-pill is-active" : "boh-pill"}
          data-tone="needs"
          onClick={() =>
            onStatusFilter(statusFilter === "needs_you" ? "all" : "needs_you")
          }
        >
          {house.needsYou} needs you
        </button>
        <button
          type="button"
          className={statusFilter === "handling" ? "boh-pill is-active" : "boh-pill"}
          data-tone="handling"
          onClick={() =>
            onStatusFilter(statusFilter === "handling" ? "all" : "handling")
          }
        >
          {house.handling} handling
        </button>
        <button
          type="button"
          className={statusFilter === "watching" ? "boh-pill is-active" : "boh-pill"}
          data-tone="watching"
          onClick={() =>
            onStatusFilter(statusFilter === "watching" ? "all" : "watching")
          }
        >
          {house.watching} watching
        </button>
        <button
          type="button"
          className={statusFilter === "ok" ? "boh-pill is-active" : "boh-pill"}
          data-tone="ok"
          onClick={() => onStatusFilter(statusFilter === "ok" ? "all" : "ok")}
        >
          {house.onStandard} on standard
        </button>
      </div>

      <section className="boh-ready" aria-label="Kitchen readiness">
        <button
          type="button"
          className="boh-ready-card"
          data-tone={prepPct < 80 ? "watch" : undefined}
          onClick={() => onOpenView("prep")}
        >
          <span>
            Prep readiness
            <IconSpark className="boh-ready-ico is-pos" />
          </span>
          <strong>{prepPct}%</strong>
          <em>
            {prep
              ? `${prep.prepared} of ${prep.required} portions ready`
              : house.readiness.readinessNote}
          </em>
        </button>
        <button
          type="button"
          className="boh-ready-card"
          data-tone={stockRisks.length ? "watch" : undefined}
          onClick={() => onOpenView("stock")}
        >
          <span>
            Stock risks
            <IconBox className="boh-ready-ico is-amber" />
          </span>
          <strong>{stockRisks.length}</strong>
          <em>
            {stockRisks.length
              ? "items below operational threshold"
              : "Nothing below par that matters"}
          </em>
        </button>
        <button
          type="button"
          className="boh-ready-card"
          data-tone={criticalGaps.length ? "alert" : undefined}
          onClick={onOpenActions}
        >
          <span>
            Critical gaps
            <IconAlert className="boh-ready-ico is-neg" />
          </span>
          <strong>{criticalGaps.length}</strong>
          <em>
            {criticalGaps[0]
              ? `${criticalGaps[0].item} · needs your call`
              : "Nothing needs you"}
          </em>
        </button>
        <button
          type="button"
          className="boh-ready-card"
          onClick={() => onOpenView("deliveries")}
        >
          <span>
            Deliveries due
            <IconTruck className="boh-ready-ico is-blue" />
          </span>
          <strong>{deliveriesDue.length}</strong>
          <em>
            {nextDelivery
              ? `Next delivery ${nextDelivery.expected}`
              : "None outstanding today"}
          </em>
        </button>
        <button
          type="button"
          className="boh-ready-card"
          onClick={() => onOpenView("prep")}
        >
          <span>
            Kitchen load forecast
            <IconBars className="boh-ready-ico is-pos" />
          </span>
          <strong>{house.readiness.loadValue}</strong>
          <em>{house.readiness.loadNote}</em>
        </button>
      </section>

      <div className="boh-overview">
        <div className="boh-col">
          {hero ? (
            <article className="boh-hero" aria-label="Needs action">
              <div className="boh-hero-top">
                <div>
                  <h2>{hero.item}</h2>
                  <p className="boh-hero-meta">{hero.area}</p>
                </div>
                <span className="boh-badge is-needs">Needs you</span>
              </div>
              <div className="boh-metrics">
                <div>
                  <span>House standard</span>
                  <strong>{hero.standardQty}</strong>
                </div>
                <div>
                  <span>Reported</span>
                  <strong className="boh-tone-neg">{hero.observedQty}</strong>
                </div>
                <div>
                  <span>Gap</span>
                  <strong className="boh-tone-neg">{hero.gapQty}</strong>
                </div>
                <div>
                  <span>Time to stockout</span>
                  <strong>{hero.timeToStockout ?? "—"}</strong>
                </div>
                <div>
                  <span>Expected usage tonight</span>
                  <strong>{hero.expectedUsageTonight ?? "—"}</strong>
                </div>
                <div>
                  <span>Service / economic exposure</span>
                  <strong>
                    {hero.exposureEuro != null ? `€${hero.exposureEuro}` : "—"}
                  </strong>
                </div>
              </div>
              {hero.exposureNote ? (
                <p className="boh-hero-meta" style={{ marginBottom: 12 }}>
                  {hero.exposureNote}
                </p>
              ) : null}
              <div className="boh-did">
                <span>What RADR already did</span>
                <p>{hero.radrDid}</p>
              </div>
              <button
                type="button"
                className="boh-btn-primary"
                onClick={onOpenActions}
              >
                Open actions →
              </button>
            </article>
          ) : null}

          <section className="boh-panel" aria-label="Captures">
            <div className="boh-panel-head">
              <h2>Captures</h2>
              <button
                type="button"
                className="boh-link"
                onClick={() => onOpenView("captures")}
              >
                View all →
              </button>
            </div>
            <div className="boh-cap-filters" role="group" aria-label="Capture type">
              {["All", "Voice", "Camera", "Document", "Manual"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={f === "All" ? "is-active" : undefined}
                  onClick={() => onOpenView("captures")}
                >
                  {f}
                </button>
              ))}
            </div>
            {captures.map((c) => {
              const ch = c.channel === "note" ? "manual" : c.channel;
              return (
                <article key={c.id} className="boh-capture boh-capture-rich">
                  <div className={`boh-cap-icon is-${ch}`} aria-hidden>
                    {channelIcon(c.channel, { size: 16 })}
                  </div>
                  <div className="boh-cap-body">
                    <div className="boh-capture-top">
                      <span className="boh-capture-channel">
                        {channelLabel(c.channel)} · {c.when} · {c.by}
                      </span>
                      {c.confirmation === "confirmed" ? (
                        <span className="boh-confirm">✓ Confirmed</span>
                      ) : (
                        <span className="boh-review">Needs review</span>
                      )}
                    </div>
                    <p>
                      <strong>Observed:</strong> {c.transcript}
                    </p>
                    {c.interpreted ? (
                      <p>
                        <strong>Interpreted:</strong> {c.interpreted}
                        {c.confidence != null
                          ? ` · ${Math.round(c.confidence * 100)}%`
                          : ""}
                      </p>
                    ) : null}
                    <div className="boh-capture-media">
                      {ch === "voice" ? (
                        <button type="button" className="boh-play" aria-label="Play voice capture">
                          <IconPlay />
                          <span>0:18</span>
                        </button>
                      ) : null}
                      {ch === "camera" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="boh-cap-thumb-inline"
                          src="/house/sugar-shelf-empty.webp"
                          alt="Shelf capture"
                          width={56}
                          height={56}
                        />
                      ) : null}
                      {c.confirmation === "pending" ? (
                        <div className="boh-capture-actions">
                          <button
                            type="button"
                            className="boh-btn-primary"
                            onClick={() => onOpenView("captures")}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="boh-btn-secondary"
                            onClick={() => onOpenView("captures")}
                          >
                            Correct
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="boh-panel" aria-label="Stock / Par">
            <div className="boh-panel-head">
              <h2>Stock / Par · key items</h2>
              <button
                type="button"
                className="boh-link"
                onClick={() => onOpenView("stock")}
              >
                View all →
              </button>
            </div>
            <div className="boh-table-wrap">
              <table className="boh-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>State</th>
                    <th>Area</th>
                    <th>Current</th>
                    <th>Par</th>
                    <th>Gap</th>
                    <th>Burn</th>
                    <th>Run-out</th>
                    <th>Next delivery</th>
                    <th>Supplier</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map((r) => {
                    const gap = Math.round((r.current - r.par) * 10) / 10;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => onOpenStockItem(itemSlug(r.item))}
                      >
                        <td className="boh-item">{r.item}</td>
                        <td>
                          <span
                            className={`boh-badge is-${r.risk === "critical" ? "critical" : r.risk === "risk" ? "risk" : "watching"}`}
                          >
                            {RISK_LABEL[r.risk]}
                          </span>
                        </td>
                        <td>{r.area}</td>
                        <td>
                          {r.current} {r.unit}
                        </td>
                        <td>
                          {r.par} {r.unit}
                        </td>
                        <td className={gap < 0 ? "boh-tone-neg" : undefined}>
                          {gap > 0 ? `+${gap}` : gap} {r.unit}
                        </td>
                        <td>
                          {r.burnPerHour} {r.unit}/h
                        </td>
                        <td>{r.runOut}</td>
                        <td>{r.nextDelivery.when}</td>
                        <td>{supplierName(r.supplierId)}</td>
                        <td>
                          <button
                            type="button"
                            className="boh-btn-secondary"
                            style={{
                              padding: "5px 10px",
                              fontSize: 12,
                              minHeight: 28,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStockItem(itemSlug(r.item));
                            }}
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="boh-col" aria-label="Handling and outcomes">
          <section className="boh-panel">
            <div className="boh-panel-head">
              <h3>What RADR is handling</h3>
            </div>
            <div className="boh-handling">
              {handling.map((g) => (
                <article key={g.id}>
                  <div className="boh-handling-top">
                    <div>
                      <h3>{g.item}</h3>
                      <p className="boh-area">{g.area}</p>
                    </div>
                    <span
                      className={`boh-badge is-${g.attention === "handling" ? "handling" : "watching"}`}
                    >
                      {g.attention === "handling" ? "RADR handling" : "Watching"}
                    </span>
                  </div>
                  <p>{g.radrDid}</p>
                </article>
              ))}
            </div>
          </section>

          {prep ? (
            <section className="boh-panel boh-prep-card">
              <div className="boh-panel-head">
                <h3>Prep & line capacity</h3>
                <button
                  type="button"
                  className="boh-link"
                  onClick={() => onOpenView("prep")}
                >
                  View all →
                </button>
              </div>
              <h3>{prep.title}</h3>
              <p className="boh-prep-where">
                {prep.where} · {prep.windowLeftMin} min left
              </p>
              <div className="boh-prep-bar" aria-hidden>
                <i style={{ width: `${prepPct}%` }} />
              </div>
              <div className="boh-prep-grid">
                <div>
                  <span>Required</span>
                  <strong>{prep.required}</strong>
                </div>
                <div>
                  <span>Prepared</span>
                  <strong>{prep.prepared}</strong>
                </div>
                <div>
                  <span>Remaining</span>
                  <strong>{prep.required - prep.prepared}</strong>
                </div>
                <div>
                  <span>Throughput</span>
                  <strong>{prep.throughput}/h</strong>
                </div>
                <div>
                  <span>Forecast</span>
                  <strong className="boh-tone-neg">{prep.forecastShort} short</strong>
                </div>
              </div>
              <p className="boh-prep-note">
                {prep.windowLeftMin} min left — short {prep.forecastNote}. RADR
                prepared reassign / reduce-promotion futures.
              </p>
            </section>
          ) : null}

          {verified ? (
            <section className="boh-panel boh-verified boh-verified-rich">
              <div className="boh-verified-head">
                <div className="boh-verified-mark" aria-hidden>
                  <IconCheck size={28} />
                </div>
                <span className="boh-badge is-handling">Verified</span>
              </div>
              {verified.historicalLabel ? (
                <p className="boh-hist-label">{verified.historicalLabel}</p>
              ) : null}
              <h3 style={{ marginBottom: 10 }}>{verified.title}</h3>
              <dl>
                <div>
                  <dt>Requested</dt>
                  <dd>{verified.requested}</dd>
                </div>
                <div>
                  <dt>Arrived</dt>
                  <dd>{verified.arrived}</dd>
                </div>
                <div>
                  <dt>Restored</dt>
                  <dd>{verified.restored}</dd>
                </div>
                <div>
                  <dt>Verified value</dt>
                  <dd className="boh-tone-pos">€{verified.verifiedEuro}</dd>
                </div>
              </dl>
              {!isHotel ? (
                <p className="boh-verified-note">
                  Berlin stockouts on caster sugar cluster on high-delivery
                  Fridays. Kreuzberg raised dry-store par — stockout frequency
                  −42%.
                </p>
              ) : null}
              <div style={{ marginTop: 12 }}>
                <Link href="/app/memory" className="boh-btn-primary">
                  Compare in Memory →
                </Link>
              </div>
            </section>
          ) : null}

          {hero?.decisionId ? (
            <section className="boh-panel">
              <div className="boh-panel-head">
                <h3>Decision</h3>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--boh-ink-soft)" }}>
                {displayDecisionId(hero.decisionId)} ·{" "}
                {hero.item} restore before pastry pull.
              </p>
              <Link
                href={`/app/decisions/${DECISION_IDS.casterSugar}`}
                className="boh-btn-primary"
              >
                Open {displayDecisionId(hero.decisionId)} →
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
