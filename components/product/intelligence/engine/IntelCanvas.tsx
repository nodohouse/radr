"use client";

import Link from "next/link";
import { useState } from "react";
import {
  causalChainForSku,
  chartPointsFor,
  evidenceForSku,
  formatEuro,
  moverForSlug,
  scaleExposure,
  shortSkuName,
  stateLabel,
  stateTone,
  type IntelFinding,
  type IntelFindingState,
  type IntelPeriod,
  type IntelSkuSlug,
} from "@/lib/radr/product/intelligenceEngine";
import { IntelPriceChart } from "./IntelPriceChart";
import { IntelDomainCanvas } from "./IntelDomainCanvas";

const PERIODS: { id: IntelPeriod; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
];

const SKU_IMG: Record<IntelSkuSlug, string> = {
  tuna: "/intelligence/skus/tuna.svg",
  "olive-oil": "/intelligence/skus/olive-oil.svg",
  chicken: "/intelligence/skus/chicken.svg",
  coke: "/intelligence/skus/coke.svg",
};

type Props = {
  finding: IntelFinding;
  state: IntelFindingState;
  sku: IntelSkuSlug;
  period: IntelPeriod;
  favorited: boolean;
  locationFocus: string | null;
  onSku: (s: IntelSkuSlug) => void;
  onPeriod: (p: IntelPeriod) => void;
  onFavorite: () => void;
  onAddDashboard: () => void;
  onLocationFocus: (id: string | null) => void;
};

export function IntelCanvas({
  finding,
  state,
  sku,
  period,
  favorited,
  locationFocus,
  onSku,
  onPeriod,
  onFavorite,
  onAddDashboard,
  onLocationFocus,
}: Props) {
  const [evOpen, setEvOpen] = useState<string | null>(null);
  const [spikeOpen, setSpikeOpen] = useState(false);
  const isCostMovers = finding.id === "cost-movers";
  const mover = moverForSlug(sku);
  const points = chartPointsFor(mover, period);
  const evidence = evidenceForSku(mover);
  const periodLabel = period.toUpperCase();
  const exposure = scaleExposure(
    isCostMovers ? mover.exposureEuro : finding.exposureEuro,
    period,
  );
  const chain = isCostMovers ? causalChainForSku(sku) : [];

  return (
    <section className="ie-canvas" aria-label="Finding analysis">
      <div className="ie-canvas-top">
        <div>
          <p className="ie-domain-k">{finding.domain.replace(/_/g, " ")}</p>
          <h2>{finding.question}</h2>
        </div>
        <div className="ie-canvas-actions">
          <button type="button" className="ie-link" onClick={onFavorite}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill={favorited ? "currentColor" : "none"}
              aria-hidden
            >
              <path
                d="M7 1.8l1.4 2.9 3.2.5-2.3 2.2.5 3.2L7 9.1 4.2 10.6l.5-3.2L2.4 5.2l3.2-.5L7 1.8z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            {favorited ? "Favorited" : "Favorite"}
          </button>
          <button type="button" className="ie-link" onClick={onAddDashboard}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Add to dashboard
          </button>
          {finding.decisionId ? (
            <Link
              href={`/app/decisions/${finding.decisionId}`}
              className="ie-link"
              data-tone="decision"
            >
              Review decision →
            </Link>
          ) : finding.liveLink ? (
            <Link href="/app/live" className="ie-link" data-tone="decision">
              View in Live →
            </Link>
          ) : finding.controlCenterNote ? (
            <Link href="/app?lens=contribution" className="ie-link" data-tone="decision">
              Control Center →
            </Link>
          ) : null}
        </div>
      </div>

      <div className="ie-obs">
        <strong>{finding.title}</strong>
        <span>{finding.summary}</span>
        <span className="ie-state" data-tone={stateTone(state)}>
          {stateLabel(state)}
        </span>
        <div className="ie-period" role="tablist" aria-label="Time range">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              data-active={period === p.id ? "true" : undefined}
              onClick={() => onPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isCostMovers ? (
        <>
          <div className="ie-skus" role="listbox" aria-label="Material SKUs">
            {(finding.skus ?? []).map((slug) => {
              const m = moverForSlug(slug);
              const active = slug === sku;
              return (
                <button
                  key={slug}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className="ie-sku"
                  data-active={active ? "true" : undefined}
                  onClick={() => {
                    setEvOpen(null);
                    setSpikeOpen(false);
                    onSku(slug);
                  }}
                >
                  <span className="ie-sku-top">
                    <img src={SKU_IMG[slug]} alt="" width={40} height={40} />
                    {active ? (
                      <span className="ie-sku-check" aria-hidden>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5l2 2 4-4"
                            stroke="#fff"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </span>
                  <strong>{shortSkuName(m)}</strong>
                  <em>
                    {m.changePct30d >= 0 ? "+" : ""}
                    {m.changePct30d.toFixed(1)}% ·{" "}
                    {formatEuro(scaleExposure(m.exposureEuro, period))}
                  </em>
                </button>
              );
            })}
          </div>

          <div className="ie-detail-head">
            <div>
              <h3>{shortSkuName(mover)}</h3>
              <p className="ie-detail-meta">
                {mover.vendor} · {mover.fillRatePct}% fill rate · {mover.leadTimeDays}d
                lead time
              </p>
            </div>
            <div className="ie-exposure">
              <strong>{formatEuro(exposure)}</strong>
              <span>EXPOSED ({periodLabel})</span>
            </div>
          </div>

          <IntelPriceChart
            points={points}
            contractRate={mover.contractRate}
            currentRate={mover.currentRate}
            onSpikeClick={() => setSpikeOpen(true)}
          />

          {spikeOpen ? (
            <div className="ie-ev-panel" role="region" aria-label="Source invoices">
              <h4>Source invoices · {shortSkuName(mover)}</h4>
              <ul>
                <li>
                  INV-44102 · €{mover.currentRate.toFixed(2)}/{mover.unit} · 120{" "}
                  {mover.unit} · Soho · New York
                </li>
                <li>
                  INV-44118 · €{(mover.currentRate - 0.05).toFixed(2)}/{mover.unit} · 90{" "}
                  {mover.unit} · Frankfurt
                </li>
                <li>
                  INV-44133 · €{mover.currentRate.toFixed(2)}/{mover.unit} · 210{" "}
                  {mover.unit} · Roma Norte · Mexico City
                </li>
              </ul>
              <button type="button" className="ie-link" onClick={() => setSpikeOpen(false)}>
                Close invoices
              </button>
            </div>
          ) : null}

          <div className="ie-causal" aria-label="Causal chain">
            {chain.map((step, i) => (
              <div key={step.label} className="ie-causal-step">
                {i > 0 ? <span className="ie-causal-arrow">→</span> : null}
                <div>
                  <em>{step.kind}</em>
                  <strong>{step.label}</strong>
                  <span>{step.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ie-evidence">
            {evidence.map((e) => (
              <button
                key={e.id}
                type="button"
                className="ie-ev"
                data-open={evOpen === e.id ? "true" : undefined}
                onClick={() => setEvOpen(evOpen === e.id ? null : e.id)}
              >
                <span className="ie-ev-k">{e.label}</span>
                <strong data-accent={e.accent}>{e.value}</strong>
                <span>{e.detail}</span>
              </button>
            ))}
          </div>

          {evOpen ? (
            <div className="ie-ev-panel" role="region" aria-label="Evidence detail">
              {evOpen === "contract" ? (
                <>
                  <h4>Contract · {mover.vendor}</h4>
                  <ul>
                    <li>
                      Unit rate €{mover.contractRate.toFixed(2)} / {mover.unit}
                    </li>
                    <li>Effective since 1 Mar 2026 · volume tier B</li>
                    <li>Last amendment: price lock · 90-day notice</li>
                  </ul>
                </>
              ) : null}
              {evOpen === "invoice" ? (
                <>
                  <h4>Invoices · normalized</h4>
                  <ul>
                    <li>
                      Avg invoiced €{mover.currentRate.toFixed(2)} / {mover.unit}
                    </li>
                    <li>PO + GRN match on unit conversion</li>
                    <li>Click chart spike for source invoice list</li>
                  </ul>
                </>
              ) : null}
              {evOpen === "locations" ? (
                <>
                  <h4>Affected locations</h4>
                  <ul>
                    <li>Frankfurt · 38% of exposure</li>
                    <li>Soho · New York · 27%</li>
                    <li>Roma Norte · Mexico City · 14% · Other 21%</li>
                  </ul>
                </>
              ) : null}
              {evOpen === "fill" || evOpen === "delivery" ? (
                <>
                  <h4>Supplier performance</h4>
                  <ul>
                    <li>
                      Fill rate {mover.fillRatePct}% · last 30 days
                    </li>
                    <li>On-time delivery 94%</li>
                    <li>
                      Lead time {mover.leadTimeDays} days · otherwise acceptable
                    </li>
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <IntelDomainCanvas
          finding={finding}
          period={period}
          locationFocus={locationFocus}
          onLocationFocus={onLocationFocus}
        />
      )}
    </section>
  );
}
