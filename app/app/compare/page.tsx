"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import {
  buildCompareHref,
  getLocationComparison,
  parseComparisonLocationIds,
  type CompareMetric,
} from "@/lib/radr/comparisonService";
import { formatCompactEuro, formatPts } from "@/lib/product/demo/command";
import { AskThis } from "@/components/product/ask/AskThis";
import { PageHeader } from "@/components/product/PageHeader";

const METRIC_OPTIONS: { id: CompareMetric; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "margin", label: "Margin" },
  { id: "covers", label: "Covers" },
  { id: "avgSpend", label: "Avg spend" },
  { id: "labor", label: "Labor" },
  { id: "cancellations", label: "Cancellations" },
  { id: "valueAtRisk", label: "Value at risk" },
];

function metricValue(
  row: {
    revenue: number;
    margin: number;
    covers: number;
    avgSpend: number;
    labor: number;
    cancellations: number;
    valueAtRisk: number;
  },
  metric: CompareMetric,
): number {
  switch (metric) {
    case "revenue":
      return row.revenue;
    case "margin":
      return row.margin;
    case "covers":
      return row.covers;
    case "avgSpend":
      return row.avgSpend;
    case "labor":
      return row.labor;
    case "cancellations":
      return row.cancellations;
    case "valueAtRisk":
      return row.valueAtRisk;
  }
}

function formatMetric(metric: CompareMetric, value: number): string {
  if (metric === "margin" || metric === "labor") return `${value.toFixed(1)}%`;
  if (metric === "covers" || metric === "cancellations") return String(value);
  if (metric === "avgSpend") return `€${value.toFixed(0)}`;
  return formatCompactEuro(value);
}

function CompareInner() {
  const params = useSearchParams();
  const router = useRouter();
  const {
    period,
    setPeriod,
    setComparisonLocationIds,
    setLocationScope,
    openLocationSwitcher,
    clearComparison,
  } = useProduct();
  const [metric, setMetric] = useState<CompareMetric>("revenue");
  const [ready, setReady] = useState(false);

  const ids = useMemo(
    () => parseComparisonLocationIds(params.get("locations")),
    [params],
  );

  useEffect(() => {
    setComparisonLocationIds(ids);
    setReady(true);
  }, [ids, setComparisonLocationIds]);

  const removeLocation = (id: string) => {
    const next = ids.filter((x) => x !== id);
    if (next.length >= 2) {
      setComparisonLocationIds(next);
      router.replace(buildCompareHref(next));
      return;
    }
    clearComparison();
    if (next.length === 1) {
      setLocationScope(next[0]!);
      router.push("/app");
      return;
    }
    router.push("/app");
  };

  const comparison = useMemo(
    () =>
      getLocationComparison({
        locationIds: ids,
        period,
        allowedLocationIds: "all",
      }),
    [ids, period],
  );

  if (!ready) {
    return (
      <div className="rp-compare" aria-busy="true">
        <p className="rp-kicker">Compare locations</p>
        <h1 className="rp-title">Loading comparison…</h1>
        <div className="rp-compare-skel" />
      </div>
    );
  }

  if (!comparison.ok) {
    return (
      <div className="rp-compare rp-compare-error">
        <p className="rp-kicker">Comparison</p>
        <h1 className="rp-title">Comparison could not be loaded</h1>
        <p className="rp-lede">{comparison.message}</p>
        <div className="rp-btn-row">
          <button
            type="button"
            className="rp-btn rp-btn-primary"
            onClick={openLocationSwitcher}
          >
            Edit locations
          </button>
          <button
            type="button"
            className="rp-btn"
            onClick={() => {
              clearComparison();
              router.push("/app");
            }}
          >
            Return to Overview
          </button>
        </div>
      </div>
    );
  }

  const { locations } = comparison;
  const activeMetric = metric;
  const maxSeries = Math.max(
    ...locations.flatMap((l) => l.revenueSeries.map((p) => p.value)),
    1,
  );
  const chartH = 160;

  return (
    <div className="rp-compare rp-attention">
      <PageHeader
        title="Compare locations"
        sub={
          comparison.sameCity && comparison.cityLabel
            ? `${comparison.cityLabel} · ${locations.length} locations`
            : `${locations.length} locations side by side`
        }
      />
      <header className="rp-compare-head">
        <ul className="rp-compare-tags">
          {locations.map((r) => (
            <li key={r.id} style={{ borderColor: r.color }}>
              <i style={{ background: r.color }} />
              <span>{r.name}</span>
              <button
                type="button"
                className="rp-compare-tag-x"
                aria-label={`Remove ${r.name} from comparison`}
                onClick={() => removeLocation(r.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="rp-compare-controls">
          <label className="rp-cc-select">
            <span className="sr-only">Period</span>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value as
                    | "today"
                    | "yesterday"
                    | "wtd"
                    | "mtd"
                    | "ytd",
                )
              }
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="wtd">7D</option>
              <option value="mtd">30D / MTD</option>
              <option value="ytd">YTD</option>
            </select>
          </label>
          <div className="rp-compare-metric-tabs" role="tablist">
            {METRIC_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={activeMetric === m.id}
                data-active={activeMetric === m.id ? "true" : "false"}
                onClick={() => setMetric(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rp-compare-edit"
            onClick={openLocationSwitcher}
          >
            Edit comparison
          </button>
        </div>
        {comparison.mixedCurrency ? (
          <p className="rp-compare-fx">
            Group reporting currency · EUR · local amounts converted for
            comparison.
          </p>
        ) : null}
      </header>

      <section className="rp-compare-summary" aria-label="Executive summary">
        <p>{comparison.summary}</p>
        <AskThis
          query="Why is this comparison showing the gap it shows?"
          label="Ask RADR why"
          entityLabel="Location comparison"
        />
      </section>

      <section className="rp-compare-side" aria-label="Metric summary">
        <h2>
          {METRIC_OPTIONS.find((m) => m.id === activeMetric)?.label ??
            "Metric"}
        </h2>
        <ul>
          {locations.map((r) => {
            const v = metricValue(r, activeMetric);
            const vsCity =
              activeMetric === "margin" && comparison.cityAvgMargin != null
                ? v - comparison.cityAvgMargin
                : null;
            return (
              <li key={r.id}>
                <span>
                  <i style={{ background: r.color }} />
                  {r.shortName}
                </span>
                <strong>{formatMetric(activeMetric, v)}</strong>
                {vsCity != null ? (
                  <em>
                    {vsCity >= 0 ? "+" : ""}
                    {formatPts(vsCity)} vs city
                  </em>
                ) : null}
              </li>
            );
          })}
        </ul>
        {activeMetric === "margin" ? (
          <p className="rp-compare-baseline">
            {comparison.cityAvgMargin != null
              ? `City avg ${comparison.cityAvgMargin.toFixed(1)}% · `
              : null}
            Group avg {comparison.groupAvgMargin.toFixed(1)}%
          </p>
        ) : null}
      </section>

      <section className="rp-compare-chart" aria-label="Revenue trend">
        <h2>Revenue · last 30 days</h2>
        <p className="rp-compare-chart-sub">
          {comparison.mixedCurrency
            ? "Indexed in group reporting EUR"
            : "Multi-location trend"}
        </p>
        <svg
          className="rp-compare-lines"
          viewBox={`0 0 400 ${chartH}`}
          role="img"
          aria-label="Revenue trend by location"
        >
          {locations.map((loc) => {
            const pts = loc.revenueSeries
              .map((p, i) => {
                const x =
                  (i / Math.max(loc.revenueSeries.length - 1, 1)) * 380 + 10;
                const y = chartH - 12 - (p.value / maxSeries) * (chartH - 28);
                return `${x},${y}`;
              })
              .join(" ");
            return (
              <polyline
                key={loc.id}
                fill="none"
                stroke={loc.color}
                strokeWidth="2.2"
                points={pts}
              />
            );
          })}
        </svg>
        <ul className="rp-compare-legend">
          {locations.map((r) => (
            <li key={r.id}>
              <i style={{ background: r.color }} />
              {r.shortName}
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-compare-metrics" aria-label="Comparison metrics">
        {[
          {
            key: "findings",
            label: "Open findings",
            fmt: (r: (typeof locations)[0]) => String(r.openFindings),
          },
          {
            key: "var",
            label: "Value at risk",
            fmt: (r: (typeof locations)[0]) => formatCompactEuro(r.valueAtRisk),
          },
          {
            key: "margin",
            label: "Operating margin",
            fmt: (r: (typeof locations)[0]) => `${r.margin.toFixed(1)}%`,
          },
          {
            key: "labor",
            label: "Labor %",
            fmt: (r: (typeof locations)[0]) => `${r.labor.toFixed(1)}%`,
          },
          {
            key: "canc",
            label: "Cancellations",
            fmt: (r: (typeof locations)[0]) => String(r.cancellations),
          },
          {
            key: "rev",
            label: "Revenue",
            fmt: (r: (typeof locations)[0]) => formatCompactEuro(r.revenue),
          },
        ].map((m) => (
          <article key={m.key} className="rp-compare-metric">
            <h2>{m.label}</h2>
            <ul>
              {locations.map((r) => (
                <li key={r.id}>
                  <span>
                    <i style={{ background: r.color }} />
                    {r.shortName}
                  </span>
                  <strong>{m.fmt(r)}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="rp-compare" aria-busy="true">
          <p className="rp-kicker">Compare locations</p>
          <h1 className="rp-title">Loading comparison…</h1>
        </div>
      }
    >
      <CompareInner />
    </Suspense>
  );
}
