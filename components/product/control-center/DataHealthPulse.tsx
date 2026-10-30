"use client";

import Link from "next/link";

type Props = {
  summary: string;
  healthy: number;
  degraded: number;
  stale: number;
  since: { id: string; text: string }[];
};

/** Compact Data Health — Exon density on a bright hospitality surface. */
export function DataHealthPulse({
  summary,
  healthy,
  degraded,
  stale,
  since,
}: Props) {
  const total = Math.max(healthy + degraded + stale, 1);
  const hPct = (healthy / total) * 100;
  const dPct = (degraded / total) * 100;
  const sPct = (stale / total) * 100;

  const statuses = [
    { label: "POS · tickets", tone: stale > 0 && healthy < 6 ? "ok" : "ok" as const },
    {
      label: "Delivery channels",
      tone: (degraded > 0 ? "warn" : "ok") as "ok" | "warn" | "bad",
    },
    {
      label: "Accounting ledger",
      tone: (stale > 0 ? "bad" : "ok") as "ok" | "warn" | "bad",
    },
  ];

  return (
    <section className="rp-ccx-health-pulse" aria-label="Data Health">
      <header className="rp-ccx-panel-head">
        <p className="rp-ccx-k">Data Health</p>
        <Link href="/app/data-health">Open →</Link>
      </header>
      <p className="rp-ccx-health-summary">{summary}</p>
      <div
        className="rp-ccx-health-bar"
        role="img"
        aria-label={`${healthy} healthy, ${degraded} degraded, ${stale} stale`}
      >
        <i style={{ width: `${hPct}%` }} data-t="ok" />
        <i style={{ width: `${dPct}%` }} data-t="warn" />
        <i style={{ width: `${sPct}%` }} data-t="bad" />
      </div>
      <dl className="rp-ccx-health-counts">
        <div>
          <strong>{healthy}</strong>
          <em>Healthy</em>
        </div>
        <div>
          <strong>{degraded}</strong>
          <em>Degraded</em>
        </div>
        <div>
          <strong>{stale}</strong>
          <em>Stale</em>
        </div>
      </dl>
      <ul className="rp-ccx-health-status">
        {statuses.map((s) => (
          <li key={s.label}>
            <i className="rp-ccx-health-dot" data-t={s.tone} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <ul className="rp-ccx-since-list">
        {since.slice(0, 2).map((s) => (
          <li key={s.id}>{s.text}</li>
        ))}
      </ul>
    </section>
  );
}
