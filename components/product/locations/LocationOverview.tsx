"use client";

/**
 * Location Overview — command page. Clarity above, depth underneath.
 */

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { LocationIntel } from "@/lib/radr/location/composeLocationIntel";
import type { ChannelMix, HotelChannelMix } from "@/lib/radr/product/portfolioEconomics";
import {
  deriveLocationAttention,
  locationAttentionLabel,
} from "@/lib/radr/product/locationAttention";
import {
  MetricBlock,
} from "@/components/product/ui/MetricBlock";
import { formatOrdinal } from "@/lib/radr/format/ordinal";

function money(n: number) {
  return formatDecisionMoney(n);
}

function MixBar({
  mix,
  hotel,
}: {
  mix: ChannelMix | HotelChannelMix;
  hotel?: boolean;
}) {
  if (hotel) {
    const m = mix as HotelChannelMix;
    const parts = [
      ["Direct", m.directPct, "direct"],
      ["OTA", m.otaPct, "ota"],
      ["Corp", m.corporatePct, "corp"],
      ["Group", m.groupPct, "group"],
      ["Other", m.otherPct, "other"],
    ] as const;
    return (
      <div className="rp-loc-mix" aria-label="Revenue composition">
        <div className="rp-loc-mix-bar" role="img">
          {parts.map(([label, p, key]) =>
            p > 0 ? (
              <span key={key} style={{ width: `${p}%` }} data-ch={key} title={`${label} ${p}%`} />
            ) : null,
          )}
        </div>
        <ul>
          {parts.map(([label, p]) =>
            p > 0 ? (
              <li key={label}>
                <em>{label}</em> {p}%
              </li>
            ) : null,
          )}
        </ul>
      </div>
    );
  }
  const m = mix as ChannelMix;
  const parts = [
    ["Dine-in", m.dineInPct, "dine"],
    ["Delivery", m.deliveryPct, "delivery"],
    ["Takeaway", m.takeawayPct, "take"],
    ["Other", m.otherPct, "other"],
  ] as const;
  return (
    <div className="rp-loc-mix" aria-label="Revenue composition">
      <div className="rp-loc-mix-bar" role="img">
        {parts.map(([label, p, key]) =>
          p > 0 ? (
            <span key={key} style={{ width: `${p}%` }} data-ch={key} title={`${label} ${p}%`} />
          ) : null,
        )}
      </div>
      <ul>
        {parts.map(([label, p]) =>
          p > 0 ? (
            <li key={label}>
              <em>{label}</em> {p}%
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}

export function LocationOverview({ intel }: { intel: LocationIntel }) {
  const e = intel.economics;
  const hotel = intel.resolved.vertical === "hotel";
  const revDelta = e.revenue - e.revenuePlan;
  const contribDelta = e.contribution - e.contributionPlan;
  const drivers = (intel.outlier?.drivers ?? e.revenueDrivers)
    .slice(0, 3)
    .map((d) => ({
      label: "label" in d ? d.label : String(d),
      amount: "amount" in d ? d.amount : 0,
    }));
  const annualized = intel.procurement?.annualizedExposure ?? 0;
  const exposureShown = Math.max(
    e.exposure,
    annualized > 0 ? Math.round(annualized / 12) : 0,
  );
  const attention = deriveLocationAttention({
    needsYouCount: e.needsYou,
    activeExposureEuro: exposureShown,
    annualizedExposureEuro: annualized,
    outlierPolarity:
      intel.outlier?.polarity === "healthy"
        ? "neutral"
        : intel.outlier?.polarity ?? null,
  });
  const statusLabel =
    attention === "NEEDS_JUDGMENT" && e.needsYou > 0
      ? `${e.needsYou} need judgment`
      : locationAttentionLabel(attention);

  return (
    <div className="rp-loc-cmd">
      <header className="rp-loc-cmd-hero">
        <p className="rp-loc-cmd-statement">{intel.statement.line}</p>
        <p className="rp-loc-cmd-sub">{intel.statement.sub}</p>
      </header>

      <div className="rp-loc-cmd-rail" aria-label="Location metrics">
        <MetricBlock
          className="rp-loc-cmd-metric"
          tone={revDelta >= 0 ? "ok" : "neg"}
          label={hotel ? "Room revenue" : "Revenue"}
          value={money(e.revenue)}
          delta={`${revDelta >= 0 ? "+" : "−"}${((Math.abs(revDelta) / Math.max(1, e.revenuePlan)) * 100).toFixed(1)}%`}
        />
        <MetricBlock
          className="rp-loc-cmd-metric"
          tone={contribDelta >= 0 ? "ok" : "neg"}
          label="Contribution"
          value={money(e.contribution)}
          delta={`${contribDelta >= 0 ? "+" : "−"}${money(Math.abs(contribDelta))} vs plan`}
        />
        <MetricBlock
          className="rp-loc-cmd-metric"
          tone="ok"
          label="Verified value"
          value={money(e.verified)}
        />
        <MetricBlock
          className="rp-loc-cmd-metric"
          label="Active exposure"
          value={exposureShown > 0 ? money(exposureShown) : "—"}
        />
        <MetricBlock
          className="rp-loc-cmd-metric"
          tone={
            attention === "NEEDS_JUDGMENT" || attention === "ACTIONABLE"
              ? "warn"
              : "ok"
          }
          label="Status"
          value={statusLabel}
        />
      </div>

      {drivers.length > 0 && contribDelta < 0 ? (
        <section className="rp-loc-cmd-why" aria-label="Why">
          <p className="rp-cc-kicker">Why contribution is behind</p>
          <ul>
            {drivers.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <strong data-tone={d.amount < 0 ? "neg" : "pos"}>
                  {d.amount < 0 ? "−" : "+"}
                  {money(Math.abs(d.amount))}
                </strong>
              </li>
            ))}
          </ul>
        </section>
      ) : drivers.length > 0 && contribDelta > 0 ? (
        <section className="rp-loc-cmd-why" aria-label="Why">
          <p className="rp-cc-kicker">Why contribution is ahead</p>
          <ul>
            {drivers.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <strong data-tone={d.amount >= 0 ? "pos" : "neg"}>
                  {d.amount < 0 ? "−" : "+"}
                  {money(Math.abs(d.amount))}
                </strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {e.needsYou > 0 || intel.outlier?.polarity === "negative" ? (
        <section className="rp-loc-cmd-attn" aria-label="Needs judgment">
          <header>
            <p className="rp-cc-kicker">Attention</p>
            <h2>
              {e.needsYou > 0
                ? `${e.needsYou} need judgment`
                : "Material outlier — review options"}
            </h2>
          </header>
          <div className="rp-loc-cmd-attn-cta">
            {intel.outlier?.decisionId ? (
              <Link href={`/app/decisions/${intel.outlier.decisionId}`}>
                Review Decision
              </Link>
            ) : null}
            <Link href={intel.outlier?.futuresHref ?? "/app/compare"}>
              Compare Futures
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rp-loc-bridge" aria-label="Money bridge">
        <p className="rp-cc-kicker">Money flow · MTD</p>
        <h2>Gross → contribution</h2>
        <ol className="rp-loc-bridge-steps">
          <li>
            <span>Gross revenue</span>
            <strong>{money(e.bridge.revenue)}</strong>
          </li>
          <li data-tone="neg">
            <span>Discounts</span>
            <strong>{money(e.bridge.discounts)}</strong>
          </li>
          <li data-tone="neg">
            <span>Refunds / comps</span>
            <strong>{money(e.bridge.refundsComps)}</strong>
          </li>
          <li data-tone="neg">
            <span>{hotel ? "Channel fees" : "Delivery / channel fees"}</span>
            <strong>{money(e.bridge.channelFees)}</strong>
          </li>
          <li data-tone="neg">
            <span>Labor</span>
            <strong>{money(e.bridge.labor)}</strong>
          </li>
          <li data-tone="neg">
            <span>{hotel ? "Variable costs" : "COGS"}</span>
            <strong>{money(e.bridge.cogs)}</strong>
          </li>
          {e.bridge.otherOperating !== 0 ? (
            <li data-tone="neg">
              <span>
                {hotel
                  ? "Occupancy / other operating"
                  : "Other variable operating"}
              </span>
              <strong>{money(e.bridge.otherOperating)}</strong>
            </li>
          ) : null}
          <li data-tone="result">
            <span>Contribution</span>
            <strong>{money(e.bridge.contribution)}</strong>
          </li>
        </ol>
      </section>

      <div className="rp-loc-cmd-grid">
        <section>
          <p className="rp-cc-kicker">Revenue mix</p>
          <h2>Where money is made</h2>
          <MixBar mix={e.channelMix} hotel={hotel} />
          {!hotel && e.delivery ? (
            <p className="rp-loc-cmd-del">
              Delivery {money(e.delivery.gross)} gross · −
              {money(e.delivery.platformFees)} fees · −
              {money(e.delivery.refunds)} refunds ={" "}
              <strong>{money(e.delivery.net)} net</strong>
              {e.delivery.contribution < e.delivery.gross * 0.12 ? (
                <em> · Incremental contribution weak vs gross</em>
              ) : null}
            </p>
          ) : null}
        </section>

        {intel.leaks.length > 0 ? (
          <section>
            <p className="rp-cc-kicker">Leakage</p>
            <h2>Where money leaves</h2>
            <ul className="rp-loc-cmd-leaks">
              {intel.leaks.map((l) => (
                <li key={l.id}>
                  <span>{l.label}</span>
                  <strong data-tone="neg">{money(l.amount)}</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <p className="rp-cc-kicker">Location DNA</p>
          <h2>Operating fingerprint</h2>
          <dl className="rp-loc-dna">
            <div>
              <dt>Strongest days</dt>
              <dd>{intel.dna.strongestDays}</dd>
            </div>
            <div>
              <dt>Strongest daypart</dt>
              <dd>{intel.dna.strongestDaypart}</dd>
            </div>
            <div>
              <dt>Typical peak</dt>
              <dd>{intel.dna.typicalPeak}</dd>
            </div>
            {!hotel ? (
              <div>
                <dt>Delivery sensitivity</dt>
                <dd>{intel.dna.deliverySensitivity}</dd>
              </div>
            ) : (
              <div>
                <dt>Booking window</dt>
                <dd>{intel.dna.bookingWindow}</dd>
              </div>
            )}
            <div>
              <dt>Avg spend</dt>
              <dd>€{intel.dna.avgSpend.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Returning guests</dt>
              <dd>{intel.dna.returningGuestPct}%</dd>
            </div>
            <div>
              <dt>{hotel ? "Readiness bottleneck" : "Kitchen constraint"}</dt>
              <dd>
                {hotel ? intel.dna.readinessBottleneck : intel.dna.kitchenConstraint}
              </dd>
            </div>
            <div>
              <dt>Refund vulnerability</dt>
              <dd>{intel.dna.refundVulnerability}</dd>
            </div>
          </dl>
        </section>

        <section>
          <p className="rp-cc-kicker">Peers</p>
          <h2>How this location compares</h2>
          <ul className="rp-loc-peers">
            {intel.peers.map((p) => (
              <li key={p.metric}>
                <p className="rp-loc-peer-k">{p.metric}</p>
                <strong
                  className="rp-loc-peer-pct"
                  data-tone={
                    p.percentile < 40
                      ? "neg"
                      : p.percentile > 65
                        ? "pos"
                        : undefined
                  }
                >
                  {formatOrdinal(p.percentile)} percentile
                </strong>
                <p className="rp-loc-peer-why">
                  Comparable cohort: {p.why}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {intel.important.length > 0 ? (
        <section className="rp-loc-cmd-imp">
          <p className="rp-cc-kicker">Important this period</p>
          <ul>
            {intel.important.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {intel.transfers.length > 0 ? (
        <section className="rp-loc-learn rp-loc-cmd-learn">
          <header>
            <p className="rp-cc-kicker">Estate learning</p>
            <h2>Learn from the estate</h2>
          </header>
          <ul className="rp-loc-learn-list">
            {intel.transfers.map((t, i) => (
              <li key={`${t.pattern}-${i}`} data-verdict={t.verdict}>
                <p className="rp-loc-learn-pattern">{t.pattern}</p>
                <p className="rp-loc-learn-ctx">From {t.fromLabel}</p>
                {t.expectedMonthlyEuro > 0 ? (
                  <p className="rp-loc-learn-effect">
                    Potential <strong>+{money(t.expectedMonthlyEuro)}/mo</strong>
                  </p>
                ) : null}
                <Link href={t.href} className="rp-loc-learn-cta">
                  Compare Futures →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {intel.procurement ? (
        <section className="rp-loc-cmd-proc">
          <p className="rp-cc-kicker">Procurement</p>
          <h2>{intel.procurement.sku}</h2>
          <p>
            +{intel.procurement.change90dPct}% / 90D · Vendor €
            {intel.procurement.vendorPrice.toFixed(2)}/kg · Contract €
            {intel.procurement.contractPrice.toFixed(2)} · Exposure{" "}
            {money(intel.procurement.annualizedExposure)}/yr
          </p>
          <p className="rp-ccx-quiet">{intel.procurement.note}</p>
          <Link href="/app/intelligence?module=cost_movers">Compare Futures →</Link>
        </section>
      ) : null}
    </div>
  );
}
