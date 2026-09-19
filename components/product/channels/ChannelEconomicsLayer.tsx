"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import type {
  ChannelEconomicsState,
  DeliveryChannel,
  SalesChannelEconomics,
} from "@/lib/radr/channels";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

function pct(n: number) {
  return `${n.toFixed(1).replace(".", ",")}%`;
}

type Props = {
  state: ChannelEconomicsState;
  /** Viewing-as role for compact brief */
  roleView?: string;
};

/**
 * Channel Economics - which channel creates value.
 */
export function ChannelEconomicsLayer({ state, roleView }: Props) {
  const [provider, setProvider] = useState<DeliveryChannel | null>(null);
  const delivery = state.channels.find((c) => c.kind === "delivery");
  const brief =
    state.roleBriefs.find((b) => b.role === roleView) ??
    state.roleBriefs.find((b) => b.role === "cfo");

  return (
    <div className="rp-ch" data-tour-target="channel-economics">
      {brief ? (
        <section className="rp-ch-brief" aria-label="Role brief">
          <p className="rp-ch-kicker">Channel economics</p>
          <p className="rp-ch-brief-title">{brief.headline}</p>
          <ul className="rp-ch-brief-lines">
            {brief.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rp-ch-mix" aria-label="Revenue mix">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Revenue mix</p>
          <p className="rp-ch-sec-title">Where sales come from tonight</p>
        </header>
        <ul className="rp-ch-mix-list">
          {state.channels.map((c) => (
            <ChannelMixRow key={c.kind} channel={c} />
          ))}
        </ul>
      </section>

      <section className="rp-ch-share" aria-label="Revenue vs contribution share">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Revenue quality</p>
          <p className="rp-ch-sec-title">Revenue share vs contribution share</p>
        </header>
        <WhyLine why="A channel can look large in sales and small in contribution once fees, packaging, and mix land" />
        <ul className="rp-ch-share-list">
          {state.channels.map((c) => (
            <li key={c.kind}>
              <span className="rp-ch-share-label">{c.label}</span>
              <span className="rp-ch-share-pair">
                <strong>{pct(c.revenueSharePct)}</strong>
                <em>of revenue</em>
              </span>
              <span className="rp-ch-share-pair" data-signal="true">
                <strong>{pct(c.contributionSharePct)}</strong>
                <em>of contribution</em>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {delivery?.providers?.length ? (
        <section className="rp-ch-providers" aria-label="Delivery providers">
          <header className="rp-ch-sec-head">
            <p className="rp-ch-kicker">Delivery</p>
            <p className="rp-ch-sec-title">
              {eur(delivery.netSales)} gross sales · by provider
            </p>
          </header>
          <ul className="rp-ch-provider-list">
            {delivery.providers.map((p) => (
              <li key={p.providerId}>
                <button
                  type="button"
                  className="rp-ch-provider-row"
                  onClick={() => setProvider(p)}
                >
                  <span>{p.providerName}</span>
                  <strong>{eur(p.grossSales)}</strong>
                  <em>
                    {pct(p.contributionMarginPct)} margin ·{" "}
                    {pct(p.contributionSharePct)} of contribution
                  </em>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rp-ch-compare" aria-label="Dine-in vs delivery">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Comparison</p>
          <p className="rp-ch-sec-title">Dine-in vs delivery margin</p>
        </header>
        <div className="rp-ch-compare-metrics">
          <div>
            <span>Dine-in</span>
            <strong>{pct(state.comparison.dineInMarginPct)}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>{pct(state.comparison.deliveryMarginPct)}</strong>
          </div>
          <div data-tone="watch">
            <span>Difference</span>
            <strong>
              {state.comparison.differencePts.toFixed(1).replace(".", ",")} pts
            </strong>
          </div>
        </div>
        <ul className="rp-ch-bridge">
          {state.comparison.why.map((step) => (
            <li key={step.id}>
              <span>{step.label}</span>
              <strong>
                {step.pts.toFixed(1).replace(".", ",")} pts
              </strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-ch-quality" aria-label="Channel quality">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Quality</p>
          <p className="rp-ch-sec-title">Not ranked by revenue alone</p>
        </header>
        <div className="rp-ch-quality-grid">
          {(delivery?.providers ?? []).map((p) => (
            <article key={p.providerId}>
              <p className="rp-ch-quality-name">{p.providerName}</p>
              <dl>
                <div>
                  <dt>Revenue share</dt>
                  <dd>{pct(p.revenueSharePct)}</dd>
                </div>
                <div>
                  <dt>Contribution share</dt>
                  <dd>{pct(p.contributionSharePct)}</dd>
                </div>
                <div>
                  <dt>Margin</dt>
                  <dd>{pct(p.contributionMarginPct)}</dd>
                </div>
                <div>
                  <dt>AOV</dt>
                  <dd>{eur(p.averageOrderValue)}</dd>
                </div>
                <div>
                  <dt>Refund rate</dt>
                  <dd>{pct(p.refundRatePct)}</dd>
                </div>
                <div>
                  <dt>Promo-funded</dt>
                  <dd>{pct(p.promoFundedSalesPct)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rp-ch-pressure" aria-label="Delivery pressure">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Delivery pressure</p>
          <p className="rp-ch-sec-title">
            {state.pressure.activeOrders} active orders · kitchen{" "}
            {state.pressure.kitchenLoad}
          </p>
        </header>
        <WhyLine why={state.pressure.why} />
        <ul className="rp-ch-pressure-stats">
          <li>
            <span>Dine-in ticket times</span>
            <strong>+{state.pressure.dineInTicketDeltaMin} min</strong>
          </li>
          <li>
            <span>Delivery contribution</span>
            <strong>{eur(state.pressure.deliveryContributionPerHour)}/hour</strong>
          </li>
          <li>
            <span>Dine-in at risk</span>
            <strong>{eur(state.pressure.dineInContributionAtRisk)}</strong>
          </li>
        </ul>
      </section>

      <section className="rp-ch-pause" aria-label="Pause delivery decision">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Prepared decision</p>
          <p className="rp-ch-sec-title">
            Pause delivery {state.pauseDecision.windowLabel}
          </p>
        </header>
        <WhyLine why={state.pauseDecision.why} />
        <ul className="rp-ch-pause-econ">
          <li>
            <span>Delivery contribution lost</span>
            <strong>
              {eur(state.pauseDecision.expectedDeliveryContributionLost)}
            </strong>
          </li>
          <li>
            <span>Dine-in contribution protected</span>
            <strong>
              {eur(state.pauseDecision.expectedDineInContributionProtected)}
            </strong>
          </li>
          <li data-signal="true">
            <span>Net expected value</span>
            <strong>+{eur(state.pauseDecision.netExpectedValue)}</strong>
          </li>
        </ul>
        <p className="rp-ch-pause-note">
          Recommendation: Pause · requires approval · RADR will not disable
          channels without authorization
        </p>
        <Link href={state.pauseDecision.href} className="rp-ch-link">
          Review for approval
        </Link>
      </section>

      <section className="rp-ch-recon" aria-label="Delivery reconciliation">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Reconciliation</p>
          <p className="rp-ch-sec-title">
            Recoverable {eur(state.recoverableAmount)}
          </p>
        </header>
        <ul className="rp-ch-recon-list">
          {state.reconciliation.map((row) => (
            <li key={row.providerId} data-status={row.status}>
              <span>{row.providerName}</span>
              <strong>
                {row.status === "reconciled"
                  ? "Reconciled"
                  : row.amount != null
                    ? `${eur(row.amount)} ${row.amountLabel ?? ""}`
                    : row.status}
              </strong>
              <Link href={row.href}>Open</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-ch-promo" aria-label="Promotion economics">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Promotion</p>
          <p className="rp-ch-sec-title">
            {state.promotion.label} · {state.promotion.providerName}
          </p>
        </header>
        <WhyLine why={state.promotion.why} />
        <ul className="rp-ch-promo-stats">
          <li>
            <span>Gross incremental</span>
            <strong>{eur(state.promotion.grossIncrementalSales)}</strong>
          </li>
          <li>
            <span>Restaurant-funded</span>
            <strong>{eur(state.promotion.restaurantFundedDiscount)}</strong>
          </li>
          <li>
            <span>Net incremental value</span>
            <strong data-signal="true">
              +{eur(state.promotion.netIncrementalValue)}
            </strong>
          </li>
        </ul>
      </section>

      <section className="rp-ch-menu" aria-label="Delivery menu engineering">
        <header className="rp-ch-sec-head">
          <p className="rp-ch-kicker">Delivery menu</p>
          <p className="rp-ch-sec-title">Contribution by dish</p>
        </header>
        <ul className="rp-ch-menu-list">
          {state.menuItems.map((item) => (
            <li key={item.id} data-tone={item.tone}>
              <span>{item.name}</span>
              <strong>
                {item.tone === "low"
                  ? `${eur(item.contribution)} · ${pct(item.marginPct)}`
                  : eur(item.contribution)}
              </strong>
              <WhyLine why={item.why} />
              {item.recommendation ? (
                <em className="rp-ch-menu-rec">{item.recommendation}</em>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="rp-ch-footnote">
        Channel economics measures revenue quality. Live contribution is not
        profit. POS and aggregator orders are deduped - never double-counted.
      </p>

      {provider ? (
        <ProviderSheet provider={provider} onClose={() => setProvider(null)} />
      ) : null}
    </div>
  );
}

function ChannelMixRow({ channel }: { channel: SalesChannelEconomics }) {
  return (
    <li>
      <span className="rp-ch-mix-label">{channel.label}</span>
      <strong>{eur(channel.netSales)}</strong>
      <em>{pct(channel.revenueSharePct)}</em>
    </li>
  );
}

function ProviderSheet({
  provider,
  onClose,
}: {
  provider: DeliveryChannel;
  onClose: () => void;
}) {
  return (
    <div className="rp-fol-sheet" role="presentation">
      <button
        type="button"
        className="rp-fol-sheet-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        className="rp-fol-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={provider.providerName}
      >
        <header className="rp-fol-sheet-head">
          <p className="rp-fol-sheet-kicker">{provider.providerName}</p>
          <button
            type="button"
            className="rp-fol-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <p className="rp-fol-sheet-amount">
          <strong>{eur(provider.contribution)}</strong>
          <span>contribution · {pct(provider.contributionMarginPct)}</span>
        </p>
        <ul className="rp-ch-sheet-lines">
          {provider.lines.map((line) => (
            <li key={line.id} data-kind={line.kind}>
              <span>{line.label}</span>
              <strong>
                {line.kind === "margin"
                  ? pct(line.amount)
                  : line.kind === "less"
                    ? `−${eur(line.amount)}`
                    : eur(line.amount)}
              </strong>
            </li>
          ))}
        </ul>
        <p className="rp-ch-sheet-meta">
          Commission expected {pct(provider.expectedCommissionPct)} · charged{" "}
          {pct(provider.chargedCommissionPct)}
          {provider.commissionVarianceAmount > 0.5
            ? ` · variance ${eur(provider.commissionVarianceAmount)}`
            : null}
        </p>
        <WhyLine why="Orders matched on provider + POS IDs before contribution is attributed" />
      </aside>
    </div>
  );
}
