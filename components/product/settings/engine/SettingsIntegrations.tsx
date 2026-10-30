"use client";

import Link from "next/link";

export function SettingsIntegrations() {
  const rows = [
    { name: "Toast", access: "READ", note: "POS · tickets · settlement" },
    { name: "Xero", access: "READ", note: "AP · ledger · no write" },
    {
      name: "Delivery pack",
      access: "READ + throttle prepare",
      note: "Channel intake · prepare only",
    },
    {
      name: "Supplier portal",
      access: "PREPARE WRITE",
      note: "PO prepare · execute blocked",
    },
  ];

  return (
    <section className="se-panel" data-settings-integrations="true">
      <header className="se-panel-head">
        <div>
          <h2>Integrations</h2>
          <p>
            Connection governance and action permissions. Secrets never appear
            here — manage connectors in Connections; trust in Data Health.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/app/connections" className="se-docs">
            Manage Connections →
          </Link>
          <Link href="/app/data-health" className="se-docs">
            Data Health →
          </Link>
        </div>
      </header>

      <div className="se-table-wrap">
        <table className="se-table" aria-label="Integration permissions">
          <thead>
            <tr>
              <th>System</th>
              <th>Permission</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  <span className="se-pill" data-tone="override">
                    {r.access}
                  </span>
                </td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
