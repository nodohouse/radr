"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type {
  MoneyFlowReport,
  OrderFlowReport,
  DeliveryStreamReport,
  StockWatchReport,
  SinceChangedReport,
  OrderRateReport,
  EvidenceClass,
  CancellationFlow,
  CoverFlowStage,
  ResourceSignal,
  LiveSourceFreshness,
} from "@/lib/radr/product/liveFlows";
import type { ExternalSignal } from "@/lib/radr/product/externalSignals";

function evidenceTag(e: EvidenceClass) {
  return (
    <em className="rp-live-ev" data-ev={e}>
      {e === "ESTIMATED" ? "EST." : e}
    </em>
  );
}

export function MoneyFlowViz({
  data,
  title = "Money flow",
}: {
  data: MoneyFlowReport;
  title?: string;
}) {
  const reductions = data.steps.filter((s) => s.kind === "reduction");
  const result = data.steps.find((s) => s.kind === "result");
  const maxSrc = Math.max(...data.sources.map((s) => s.amount), 1);
  const leakage = reductions.filter((r) =>
    /discount|refund|fee|comp|cancel/i.test(r.label),
  );
  const costs = reductions.filter(
    (r) => !/discount|refund|fee|comp|cancel/i.test(r.label),
  );
  const maxRed = Math.max(
    ...reductions.map((r) => Math.abs(r.amount)),
    1,
  );

  return (
    <section
      className="rp-live-mod rp-money-flow"
      data-visual="true"
      data-editorial="true"
      aria-label={title}
    >
      <p className="rp-live-k">{title}</p>
      <p className="rp-money-gross">
        <strong>{formatDecisionMoney(data.grossRevenue)}</strong>
        <span>Revenue in</span>
      </p>

      <div
        className="rp-money-bands"
        role="img"
        aria-label="Money in through leakage and cost to contribution"
      >
        <div className="rp-money-band" data-band="in">
          <p className="rp-money-band-k">Money in</p>
          <ul className="rp-money-sources">
            {data.sources.map((s) => (
              <li key={s.id}>
                <div className="rp-money-meta">
                  <span>{s.label}</span>
                  {evidenceTag(s.evidence)}
                </div>
                <strong>{formatDecisionMoney(s.amount)}</strong>
                <i
                  className="rp-money-bar"
                  data-kind="inflow"
                  style={{ width: `${(s.amount / maxSrc) * 100}%` }}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>

        {leakage.length > 0 ? (
          <div className="rp-money-band" data-band="leak">
            <p className="rp-money-band-k">Leakage</p>
            <ul className="rp-money-steps">
              {leakage.map((r) => (
                <li key={r.id} data-kind="reduction">
                  <div className="rp-money-meta">
                    <span>{r.label}</span>
                    {evidenceTag(r.evidence)}
                  </div>
                  <strong>−{formatDecisionMoney(Math.abs(r.amount))}</strong>
                  <i
                    className="rp-money-bar"
                    data-kind="reduction"
                    style={{
                      width: `${(Math.abs(r.amount) / maxRed) * 100}%`,
                    }}
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {costs.length > 0 ? (
          <div className="rp-money-band" data-band="cost">
            <p className="rp-money-band-k">Cost</p>
            <ul className="rp-money-steps">
              {costs.map((r) => (
                <li key={r.id} data-kind="reduction">
                  <div className="rp-money-meta">
                    <span>{r.label}</span>
                    {evidenceTag(r.evidence)}
                  </div>
                  <strong>−{formatDecisionMoney(Math.abs(r.amount))}</strong>
                  <i
                    className="rp-money-bar"
                    data-kind="reduction"
                    style={{
                      width: `${(Math.abs(r.amount) / maxRed) * 100}%`,
                    }}
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result ? (
          <div className="rp-money-band" data-band="out">
            <p className="rp-money-band-k">Contribution</p>
            <div className="rp-money-result">
              <strong>{formatDecisionMoney(result.amount)}</strong>
              <span>pace · {evidenceTag(result.evidence)}</span>
            </div>
          </div>
        ) : (
          <div className="rp-money-band" data-band="out">
            <p className="rp-money-band-k">Contribution</p>
            <div className="rp-money-result">
              <strong>{formatDecisionMoney(data.contributionPace)}</strong>
              <span>pace</span>
            </div>
          </div>
        )}
      </div>

      <p className="rp-live-mod-read">{data.radrRead}</p>
    </section>
  );
}

export function OrdersNowPanel({ data }: { data: OrderFlowReport }) {
  const maxRev = Math.max(...data.channels.map((c) => c.revenue), 1);
  return (
    <section className="rp-live-mod" aria-label="Orders right now">
      <p className="rp-live-k">Orders right now · last 30m</p>
      <div className="rp-live-hero-nums" data-cols="3">
        <div>
          <strong>{data.last30mOrders}</strong>
          <span>orders</span>
        </div>
        <div>
          <strong>
            {data.last30mDeltaPct >= 0 ? "+" : ""}
            {data.last30mDeltaPct}%
          </strong>
          <span>vs expected</span>
        </div>
        <div>
          <strong>{formatDecisionMoney(data.last30mContribution)}</strong>
          <span>contrib est.</span>
        </div>
      </div>
      <ul className="rp-order-flow">
        {data.channels.slice(0, 4).map((c) => {
          const contribEst =
            c.feeDragEuro != null ? c.revenue - c.feeDragEuro : null;
          return (
            <li key={c.id}>
              <div className="rp-order-top">
                <strong>{c.label}</strong>
                <em>
                  {c.orders}
                  {c.pending != null ? ` · ${c.pending} pending` : ""} ·{" "}
                  {formatDecisionMoney(c.revenue)}
                </em>
              </div>
              <i
                className="rp-order-share"
                style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                aria-hidden="true"
              />
              <span>
                {c.sharePct}% share
                {c.feeDragEuro != null
                  ? ` · fees ${formatDecisionMoney(c.feeDragEuro)}`
                  : ""}
                {contribEst != null
                  ? ` · contrib ~${formatDecisionMoney(contribEst)}`
                  : ""}
                {c.vsComparableOrders
                  ? ` · ${c.vsComparableOrders >= 0 ? "+" : ""}${c.vsComparableOrders} vs Fri`
                  : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="rp-live-mod-read">
        Gross {formatDecisionMoney(data.last30mGross)} · channel fees{" "}
        {formatDecisionMoney(data.last30mFees)} · contribution est.{" "}
        {formatDecisionMoney(data.last30mContribution)}.
      </p>
    </section>
  );
}

export function DeliveryStreamCard({ data }: { data: DeliveryStreamReport }) {
  return (
    <section className="rp-live-mod" aria-label="Delivery stream">
      <p className="rp-live-k">
        Delivery stream ·{" "}
        <span data-fresh={data.freshnessSeconds > 180}>
          {data.freshnessLabel}
        </span>
      </p>
      <div className="rp-live-horizon-proj">
        <div>
          <strong>{data.ordersReceived}</strong>
          <span>received</span>
        </div>
        <div>
          <strong>{data.ordersPending}</strong>
          <span>pending</span>
        </div>
        <div>
          <strong>{formatDecisionMoney(data.feesEuro)}</strong>
          <span>fees est.</span>
        </div>
      </div>
      <p className="rp-live-mod-read">{data.radrRead}</p>
    </section>
  );
}

export function StockWatchPanel({ data }: { data: StockWatchReport }) {
  return (
    <section className="rp-live-mod rp-stock-watch" aria-label="Stock watch">
      <p className="rp-live-k">Stock watch</p>
      {data.items.map((item) => {
        const need = Math.max(item.expectedDemand, 1);
        const pct = Math.min(100, (item.remaining / need) * 100);
        return (
          <div key={item.id} className="rp-stock-item" data-state={item.state}>
            <div className="rp-stock-head">
              <strong>{item.label}</strong>
              <em className="rp-live-ev" data-ev={item.evidence}>
                {item.evidence}
              </em>
            </div>
            <p className="rp-stock-remain">
              {item.remaining} {item.unit} remaining · burn {item.burnPerHour}/h
            </p>
            <div className="rp-stock-bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
            <p className="rp-stock-proj">
              Expected demand {item.expectedDemand}
              {item.projectedStockoutAt
                ? ` · projected stockout ${item.projectedStockoutAt}`
                : ""}
            </p>
            <p className="rp-stock-affect">
              Affects {item.affectedDishes.join(" · ")} · available{" "}
              {item.availableEquivalentDishes} vs {item.expectedDishDemand}{" "}
              expected ·{" "}
              <strong>{formatDecisionMoney(item.revenueAtRisk)} at risk</strong>
            </p>
            <p className="rp-live-mod-read">
              {item.radrRead}
              {item.relatedDecisionId ? (
                <>
                  {" "}
                  <Link href={`/app/decisions/${item.relatedDecisionId}`}>
                    {displayDecisionId(item.relatedDecisionId)} →
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        );
      })}
    </section>
  );
}

export function SinceChangedStrip({ data }: { data: SinceChangedReport }) {
  return (
    <section className="rp-since-changed" aria-label={data.sinceLabel}>
      <p className="rp-live-k">{data.sinceLabel}</p>
      <ul>
        {data.items.map((i) => (
          <li key={i.id}>
            <span>{i.label}</span>
            <strong>{i.delta}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OrderRateMini({ data }: { data: OrderRateReport }) {
  const max = Math.max(
    ...data.buckets.map((b) =>
      Math.max(b.actual ?? 0, b.expected, b.forecast ?? 0),
    ),
    1,
  );
  return (
    <section className="rp-live-mod" aria-label="Orders per 15 minutes">
      <p className="rp-live-k">Orders / 15m</p>
      <div className="rp-order-rate" role="img" aria-label="Order rate">
        {data.buckets.map((b) => (
          <div key={b.label} className="rp-order-rate-col">
            {b.actual != null ? (
              <i
                className="rp-order-rate-actual"
                style={{ height: `${(b.actual / max) * 100}%` }}
              />
            ) : null}
            {b.forecast != null ? (
              <i
                className="rp-order-rate-fc"
                style={{ height: `${(b.forecast / max) * 100}%` }}
              />
            ) : null}
            <em>{b.label.slice(0, 5)}</em>
          </div>
        ))}
      </div>
      <p className="rp-live-mod-read">{data.radrRead}</p>
    </section>
  );
}

export function CancellationFlowViz({ data }: { data: CancellationFlow }) {
  return (
    <section className="rp-live-mod" aria-label="Cancellation recovery">
      <p className="rp-live-k">Cancellations</p>
      <div className="rp-cancel-flow">
        <div>
          <strong>{data.cancelled}</strong>
          <span>cancelled</span>
        </div>
        <i aria-hidden="true">→</i>
        <div>
          <strong>{data.waitlistFilled}</strong>
          <span>waitlist</span>
        </div>
        <div>
          <strong>{data.directRebook}</strong>
          <span>rebook</span>
        </div>
        <div data-tone="neg">
          <strong>{data.unrecovered}</strong>
          <span>unrecovered</span>
        </div>
      </div>
      <ul className="rp-live-cancel">
        <li>
          <strong>{formatDecisionMoney(data.revenueAffected)}</strong>
          <span>revenue affected</span>
        </li>
        <li>
          <strong>{formatDecisionMoney(data.recovered)}</strong>
          <span>recovered</span>
        </li>
        <li data-tone="neg">
          <strong>{formatDecisionMoney(data.exposed)}</strong>
          <span>still exposed</span>
        </li>
      </ul>
      <p className="rp-live-mod-read">
        {data.radrRead}
        {data.relatedDecisionId ? (
          <>
            {" "}
            <Link href={`/app/decisions/${data.relatedDecisionId}`}>
              Recovery →
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}

export function CoverFlowViz({ stages }: { stages: CoverFlowStage[] }) {
  const main = stages.filter((s) => !s.branch);
  const branches = stages.filter((s) => s.branch);
  return (
    <section className="rp-live-mod" aria-label="Cover flow">
      <p className="rp-live-k">Cover flow</p>
      <div className="rp-live-cover-flow">
        {main.map((s, i) => (
          <span key={s.id} style={{ display: "contents" }}>
            <div>
              <strong>{s.count}</strong>
              <span>{s.label}</span>
            </div>
            {i < main.length - 1 ? <i aria-hidden="true">→</i> : null}
          </span>
        ))}
      </div>
      <div className="rp-cover-branches">
        {branches.map((b) => (
          <em key={b.id}>
            {b.label} {b.count}
          </em>
        ))}
      </div>
    </section>
  );
}

export function SourceFreshnessStrip({
  sources,
}: {
  sources: LiveSourceFreshness[];
}) {
  return (
    <ul className="rp-live-src-fresh" aria-label="Source freshness">
      {sources.map((s) => (
        <li key={s.id} data-state={s.state}>
          <span>{s.label}</span>
          <strong>
            {s.seconds < 60
              ? `${s.seconds}s`
              : s.seconds < 3600
                ? `${Math.round(s.seconds / 60)}m`
                : `${Math.round(s.seconds / 3600)}h`}
          </strong>
        </li>
      ))}
    </ul>
  );
}

export function ResourceWatchPanel({
  resources,
}: {
  resources: ResourceSignal[];
}) {
  if (resources.length === 0) return null;
  return (
    <section className="rp-live-mod" aria-label="Resource watch">
      <p className="rp-live-k">Resource watch</p>
      <ul className="rp-resource-watch">
        {resources.map((r) => (
          <li key={r.id}>
            <strong>{r.label}</strong>
            <span>
              {r.currentQuantity} {r.unit} · demand {r.forecastDemand} · remaining{" "}
              {r.projectedRemaining}
            </span>
            {r.projectedConstraintAt ? (
              <em>
                Constraint {r.projectedConstraintAt} ·{" "}
                {formatDecisionMoney(r.economicImpact)} impact · {r.evidenceState}
              </em>
            ) : (
              <em>{r.evidenceState}</em>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExternalDemandCards({
  signals,
}: {
  signals: ExternalSignal[];
}) {
  if (signals.length === 0) return null;
  return (
    <div className="rp-live-ext" aria-label="Weather and events">
      {signals.map((s) => (
        <article key={s.id} className="rp-live-mod" data-type={s.type}>
          <p className="rp-live-k">
            {s.type === "weather" ? "Weather" : "Event"} · MODELED
          </p>
          <strong className="rp-live-ext-label">{s.label}</strong>
          <p className="rp-live-mod-read">{s.expectedOperationalEffect}</p>
          <p className="rp-live-ext-delta">
            Demand {s.demandDeltaPct >= 0 ? "+" : ""}
            {s.demandDeltaPct}% · {s.confidence} confidence
          </p>
        </article>
      ))}
    </div>
  );
}
