"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type {
  LocationRow,
  LocationsOverviewModel,
  LocationsSort,
  LocationUiState,
} from "@/lib/radr/product/locationsProofEngine";
import { filterLocationRows } from "@/lib/radr/product/locationsProofEngine";
import { LocationsBubbleChart } from "./LocationsBubbleChart";

type Props = {
  model: LocationsOverviewModel;
  sort: LocationsSort;
  onSort: (s: LocationsSort) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  query: string;
  onQuery: (q: string) => void;
  healthFilter: LocationUiState | "all" | null;
  onHealthFilter: (f: LocationUiState | "all" | null) => void;
  onRecommendedActions: () => void;
};

const SORTS: { id: LocationsSort; label: string }[] = [
  { id: "contribution", label: "Contribution" },
  { id: "revenue", label: "Revenue" },
  { id: "exposure", label: "Exposure" },
  { id: "attention", label: "Attention" },
  { id: "margin", label: "Margin" },
];

function Spark({ values, tone }: { values: number[]; tone: LocationRow["trendTone"] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 64;
  const h = 22;
  const span = Math.max(max - min, 1);
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 2) + 1;
      const y = h - 2 - ((v - min) / span) * (h - 4);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const stroke =
    tone === "up" ? "#00a85a" : tone === "down" ? "#d4534a" : "#8a928d";
  return (
    <svg className="le-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HealthDonut({
  health,
  total,
  active,
  onSelect,
}: {
  health: LocationsOverviewModel["health"];
  total: number;
  active: LocationUiState | "all" | null;
  onSelect: (f: LocationUiState | "all" | null) => void;
}) {
  const parts: { key: LocationUiState | "on_track"; n: number; color: string; label: string }[] = [
    { key: "on_track", n: health.onTrack, color: "#00a85a", label: "On track" },
    { key: "outperforming", n: health.outperforming, color: "#0b5c38", label: "Outperforming" },
    { key: "watch", n: health.watch, color: "#d4923a", label: "Watch" },
    { key: "needs_attention", n: health.needsAttention, color: "#d4534a", label: "Needs attention" },
  ];
  const sum = parts.reduce((s, p) => s + p.n, 0) || 1;
  let acc = 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="le-health">
      <div className="le-donut-wrap">
        <svg viewBox="0 0 100 100" className="le-donut" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0ef" strokeWidth="12" />
          {parts.map((p) => {
            const len = (p.n / sum) * c;
            const dash = `${len} ${c - len}`;
            const rot = (acc / sum) * 360 - 90;
            acc += p.n;
            return (
              <circle
                key={p.key}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeLinecap="butt"
                transform={`rotate(${rot} 50 50)`}
                className="le-donut-seg"
                opacity={active && active !== "all" && active !== p.key ? 0.35 : 1}
              />
            );
          })}
        </svg>
        <div className="le-donut-center">
          <strong>{total}</strong>
          <span>Locations</span>
        </div>
      </div>
      <ul className="le-health-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <button
              type="button"
              data-active={active === p.key ? "true" : undefined}
              onClick={() => onSelect(active === p.key ? "all" : p.key)}
            >
              <i style={{ background: p.color }} />
              {p.n} {p.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LocationsOverview({
  model,
  sort,
  onSort,
  selectedId,
  onSelect,
  query,
  onQuery,
  healthFilter,
  onHealthFilter,
  onRecommendedActions,
}: Props) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const visible = filterLocationRows(model.rows, query, healthFilter);

  return (
    <div className="le-overview">
      <div className="le-hero">
        <LocationsBubbleChart
          rows={model.rows}
          selectedId={selectedId}
          onSelect={onSelect}
        />

        <aside className="le-summary" aria-label="Portfolio MTD summary">
          <p className="le-k">Portfolio · {model.periodLabel}</p>
          <div className="le-kpis">
            <div>
              <span>Revenue</span>
              <strong>{model.revenueFormatted}</strong>
              <em data-tone={model.revenueVsPlanPct >= 0 ? "pos" : "neg"}>
                {model.revenueVsPlanPct >= 0 ? "+" : ""}
                {model.revenueVsPlanPct}% vs plan
              </em>
            </div>
            <div>
              <span>Contribution</span>
              <strong>{model.contributionFormatted}</strong>
              <em data-tone={model.contributionVsPlanPct >= 0 ? "pos" : "neg"}>
                {model.contributionVsPlanPct >= 0 ? "+" : ""}
                {model.contributionVsPlanPct}% vs plan
              </em>
            </div>
            <div>
              <span>Locations</span>
              <strong>{model.locationCount}</strong>
              <em data-tone="neg">{model.needAttentionCount} {model.needAttentionCount===1?"needs":"need"} attention</em>
            </div>
            <div>
              <span>Avg. contribution / location</span>
              <strong>{model.avgContributionFormatted}</strong>
              <em data-tone="pos">+{model.avgContributionDeltaPct}% vs prior</em>
            </div>
          </div>

          <div className="le-insight">
            <p className="le-k">Key insight</p>
            <p>{model.insight}</p>
            <button type="button" className="le-cta" onClick={onRecommendedActions}>
              View recommended actions →
            </button>
          </div>
        </aside>
      </div>

      <section className="le-table-card" aria-label="Locations table">
        <div className="le-table-toolbar">
          <div className="le-sort" role="group" aria-label="Sort by">
            <span>Sort by</span>
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                data-active={sort === s.id ? "true" : undefined}
                onClick={() => onSort(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search locations…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search locations"
          />
        </div>

        <div className="le-table-wrap">
          <table className="le-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Location</th>
                <th>Revenue</th>
                <th>vs Plan</th>
                <th>Contribution</th>
                <th>vs Plan</th>
                <th>Margin</th>
                <th>Exposure</th>
                <th>Trend</th>
                <th>Attention</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr
                  key={row.id}
                  data-state={row.state}
                  data-active={selectedId === row.id ? "true" : undefined}
                  onClick={() => onSelect(row.id)}
                >
                  <td className="le-rank">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <strong>{row.name}</strong>
                    <span>{row.city}</span>
                  </td>
                  <td className="le-num">{formatDecisionMoney(row.revenue)}</td>
                  <td
                    className="le-num"
                    data-tone={row.revenueVsPlanPct >= 0 ? "pos" : "neg"}
                  >
                    {row.revenueVsPlanPct >= 0 ? "+" : ""}
                    {row.revenueVsPlanPct}%
                  </td>
                  <td className="le-num">{formatDecisionMoney(row.contribution)}</td>
                  <td
                    className="le-num"
                    data-tone={row.contributionVsPlanPct >= 0 ? "pos" : "neg"}
                  >
                    {row.contributionVsPlanPct >= 0 ? "+" : ""}
                    {row.contributionVsPlanPct}%
                  </td>
                  <td className="le-num">{row.marginPct}%</td>
                  <td className="le-num">{formatDecisionMoney(row.exposure)}</td>
                  <td>
                    <Spark values={row.trend} tone={row.trendTone} />
                  </td>
                  <td>
                    <span className="le-badge" data-state={row.state}>
                      {row.attentionLabel}
                    </span>
                  </td>
                  <td className="le-actions">
                    <button
                      type="button"
                      aria-label={`Actions for ${row.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(menuId === row.id ? null : row.id);
                      }}
                    >
                      ···
                    </button>
                    {menuId === row.id ? (
                      <div className="le-menu" role="menu">
                        <Link href={row.detailHref} role="menuitem">
                          Open location
                        </Link>
                        <Link href={row.liveHref} role="menuitem">
                          View in Live
                        </Link>
                        <Link href={row.diagnosisHref} role="menuitem">
                          View diagnosis
                        </Link>
                        <Link href={row.decisionsHref} role="menuitem">
                          Review Decisions
                        </Link>
                        <Link href={row.valueHref} role="menuitem">
                          View Value
                        </Link>
                        <Link href={row.memoryHref} role="menuitem">
                          View Memory
                        </Link>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="le-bottom">
        <section className="le-panel" aria-labelledby="le-att-h">
          <h2 id="le-att-h">
            {model.attention.length}{" "}
            {model.attention.length === 1 ? "location needs" : "locations need"}
            attention
          </h2>
          <ul className="le-att-list">
            {model.attention.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onSelect(a.id)}>
                  <strong>{a.name}</strong>
                  <span>{a.headline}</span>
                  <em>
                    {a.revenueVsPlanPct >= 0 ? "+" : ""}
                    {a.revenueVsPlanPct}% revenue ·{" "}
                    {a.contributionVsPlanPct >= 0 ? "+" : ""}
                    {a.contributionVsPlanPct}% contribution
                  </em>
                  <span className="le-att-drivers">
                    {a.drivers.slice(0, 3).map((d) => d.label).join(" · ")}
                  </span>
                </button>
                <Link href={a.diagnosisHref} className="le-link">
                  View diagnosis →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="le-panel" aria-labelledby="le-opp-h">
          <h2 id="le-opp-h">Largest contribution upside</h2>
          <p className="le-quiet">Expected opportunities — not verified</p>
          <ol className="le-opp-list">
            {model.opportunities.map((o) => (
              <li key={o.locationId}>
                <Link href={o.href}>
                  <span className="le-rank">{String(o.rank).padStart(2, "0")}</span>
                  <div>
                    <strong>{o.name}</strong>
                    <span>{o.label}</span>
                  </div>
                  <em>+{formatDecisionMoney(o.euro)}</em>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="le-panel" aria-labelledby="le-health-h">
          <h2 id="le-health-h">Portfolio health</h2>
          <p className="le-quiet">Distribution of locations</p>
          <HealthDonut
            health={model.health}
            total={model.locationCount}
            active={healthFilter}
            onSelect={onHealthFilter}
          />
        </section>
      </div>
    </div>
  );
}
