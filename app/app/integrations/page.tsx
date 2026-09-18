"use client";

import { useProduct } from "@/lib/product/store";
import { sourcesForRole } from "@/lib/radr/product/integrations";

export default function IntegrationsPage() {
  const { roleView } = useProduct();
  const rows = sourcesForRole(roleView);

  return (
    <div className="rp-integrations">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Integrations</p>
        <h1 className="rp-cc-title">Source health</h1>
        <p className="rp-cc-since">
          Source health, freshness and coverage
        </p>
      </header>

      <ul className="rp-int-list">
        {rows.map((r) => (
          <li key={r.id} data-status={r.status}>
            <strong>{r.name}</strong>
            <span className="rp-int-status">{r.status}</span>
            <span>{r.freshness}</span>
            <em>{r.coverage}</em>
            {r.impact ? (
              <em className="rp-int-impact">{r.impact}</em>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
