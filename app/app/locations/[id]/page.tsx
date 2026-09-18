"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  formatCompactEuro,
  formatPts,
} from "@/lib/product/demo/command";
import { locationById } from "@/lib/product/demo/catalog";
import { getDashboard } from "@/lib/product/demo/dashboard";
import { useProduct } from "@/lib/product/store";
import { RADR_MOTION } from "@/lib/radr/motion";
import {
  OperatingPerformanceChart,
  buildOperatingSeries,
  type PerfMetric,
  type PerfPoint,
  type PerfRange,
} from "@/components/radr/OperatingPerformanceChart";
import { TextSep } from "@/components/TextSep";

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const { signals, setLocationScope, period } = useProduct();
  const loc = locationById(params.id);
  const [metric, setMetric] = useState<PerfMetric>("margin");
  const [range, setRange] = useState<PerfRange>("30d");
  const [day, setDay] = useState<PerfPoint | null>(null);

  useEffect(() => {
    if (params.id) setLocationScope(params.id);
  }, [params.id, setLocationScope]);

  const dash = useMemo(
    () => getDashboard(params.id, period),
    [params.id, period],
  );
  const row = dash.locations[0];
  const actions = useMemo(
    () =>
      signals
        .filter((s) => s.locationId === params.id)
        .filter((s) => s.status !== "VERIFIED" && s.status !== "RESOLVED")
        .slice(0, 3),
    [signals, params.id],
  );

  const series = useMemo(
    () =>
      buildOperatingSeries(metric, range, {
        revenue: row?.revenue ?? 24900,
        margin: row?.margin ?? 18.7,
        labor: row?.laborPct ?? 33.8,
        value: row?.verified ?? 18620,
      }),
    [metric, range, row],
  );

  if (!loc || !row) {
    return (
      <div className="rp-empty">
        <h3>Location not found</h3>
        <p>
          <Link href="/app/locations">Back</Link>
        </p>
      </div>
    );
  }

  const unit = metric === "revenue" || metric === "value" ? "euro" : "pct";
  const dayDelta =
    day && day.forecast !== 0
      ? ((day.actual - day.forecast) / Math.abs(day.forecast)) * 100
      : 0;

  return (
    <div className="rp-command rp-command-calm">
      <ul className="rp-primary rp-primary-sm" aria-label="Key metrics">
        <li>
          <em>Revenue</em>
          <TextSep srOnly>: </TextSep>
          <strong>{formatCompactEuro(row.revenue)}</strong>
          <TextSep srOnly />
          <span className={row.vsForecast >= 0 ? "rp-cc-pos" : "rp-cc-neg"}>
            {formatPts(row.vsForecast)} vs forecast
          </span>
        </li>
        <li>
          <em>Margin</em>
          <TextSep srOnly>: </TextSep>
          <strong>{row.margin.toFixed(1)}%</strong>
          <TextSep srOnly />
          <span className={row.marginVsPlan >= 0 ? "rp-cc-pos" : "rp-cc-neg"}>
            {formatPts(row.marginVsPlan)} vs plan
          </span>
        </li>
        <li>
          <em>Labor</em>
          <TextSep srOnly>: </TextSep>
          <strong>{row.laborPct.toFixed(1)}%</strong>
        </li>
        <li>
          <em>At risk</em>
          <TextSep srOnly>: </TextSep>
          <strong>{formatCompactEuro(row.valueAtRisk)}</strong>
        </li>
      </ul>

      <OperatingPerformanceChart
        metric={metric}
        range={range}
        series={series}
        unit={unit}
        onMetric={setMetric}
        onRange={setRange}
        onSelectDay={setDay}
      />

      <section className="rp-glance-look" aria-label="Territories">
        <p className="rp-glance-label">Where to look</p>
        <ul>
          {dash.territories.map((t) => (
            <li key={t.area}>
              <Link href={t.href}>
                <em>{t.area.toUpperCase()}</em>
                <TextSep srOnly />
                <strong>{formatCompactEuro(t.value)}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-glance-needs">
        <header>
          <p className="rp-glance-label">
            What needs attention
            <TextSep />
            {actions.length}
          </p>
          <Link href="/app/findings">All →</Link>
        </header>
        {actions.length === 0 ? (
          <p className="rp-muted">Nothing needs action here.</p>
        ) : (
          <ol>
            {actions.map((s) => (
              <li key={s.id}>
                <Link href={`/app/findings/${s.id}`}>
                  <em>{s.area.toUpperCase()}</em>
                  <TextSep srOnly />
                  <strong>{s.title}</strong>
                  <TextSep srOnly />
                  <span>{formatCompactEuro(s.impact)}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <AnimatePresence>
        {day ? (
          <motion.div
            className="rp-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={RADR_MOTION.tooltip}
          >
            <button
              type="button"
              className="rp-drawer-scrim"
              aria-label="Close"
              onClick={() => setDay(null)}
            />
            <motion.aside
              className="rp-drawer-panel rp-drawer-compact"
              role="dialog"
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={RADR_MOTION.panel}
            >
              <header>
                <h2>{day.fullLabel}</h2>
                <button
                  type="button"
                  className="rp-btn rp-btn-ghost"
                  onClick={() => setDay(null)}
                >
                  Close
                </button>
              </header>
              <dl className="rp-drawer-stats">
                <div>
                  <dt>Value</dt>
                  <dd>
                    {unit === "euro"
                      ? formatCompactEuro(day.actual)
                      : `${day.actual.toFixed(1)}%`}
                    <span className={dayDelta >= 0 ? "rp-cc-pos" : "rp-cc-neg"}>
                      {formatPts(dayDelta)} vs forecast
                    </span>
                  </dd>
                </div>
              </dl>
              <Link
                href="/app/findings"
                className="rp-btn rp-btn-primary"
                onClick={() => setDay(null)}
              >
                View day →
              </Link>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
