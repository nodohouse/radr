"use client";

import type { HouseSummary } from "@/lib/radr/product/houseAttention";
import type { BohView } from "./BohShell";

type Props = {
  house: HouseSummary;
  onOpenView: (v: BohView) => void;
  onOpenStockItem: (slug: string) => void;
  acked: Record<string, boolean>;
  onAck: (id: string) => void;
};

function slug(item: string) {
  return item.toLowerCase().replace(/\s+/g, "-");
}

const RISK_LABEL = {
  critical: "Critical",
  risk: "At risk",
  watch: "Watching",
  ok: "On standard",
} as const;

export function BohStock({
  house,
  onOpenView,
  onOpenStockItem,
  acked,
  onAck,
}: Props) {
  const rows = [...house.stock].sort((a, b) => {
    const rank = { critical: 0, risk: 1, watch: 2, ok: 3 };
    return rank[a.risk] - rank[b.risk];
  });

  return (
    <div className="boh-stock">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Par</p>
          <h2>Stock / Par</h2>
          <p>
            Current vs house standard — open an item for critical action when
            service is at risk.
          </p>
        </div>
      </header>

      <section className="boh-panel">
        <div className="boh-table-wrap">
          <table className="boh-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>State</th>
                <th>Area</th>
                <th>Current</th>
                <th>Par</th>
                <th>Gap</th>
                <th>Burn</th>
                <th>Run-out</th>
                <th>Next delivery</th>
                <th>Supplier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const gapN = Math.round((r.current - r.par) * 10) / 10;
                const sup = house.suppliers.find((s) => s.id === r.supplierId);
                return (
                  <tr
                    key={r.id}
                    onClick={() => onOpenStockItem(slug(r.item))}
                  >
                    <td className="boh-item">{r.item}</td>
                    <td>
                      <span
                        className={`boh-badge is-${r.risk === "critical" ? "critical" : r.risk === "risk" ? "risk" : r.risk === "watch" ? "watching" : "handling"}`}
                      >
                        {RISK_LABEL[r.risk]}
                      </span>
                    </td>
                    <td>{r.area}</td>
                    <td>
                      {r.current} {r.unit}
                    </td>
                    <td>
                      {r.par} {r.unit}
                    </td>
                    <td className={gapN < 0 ? "boh-tone-neg" : undefined}>
                      {gapN > 0 ? `+${gapN}` : gapN} {r.unit}
                    </td>
                    <td>
                      {r.burnPerHour} {r.unit}/h
                    </td>
                    <td>{r.runOut}</td>
                    <td>{r.nextDelivery.when}</td>
                    <td>{sup?.name ?? "—"}</td>
                    <td>
                      <div className="boh-row-acts">
                        <button
                          type="button"
                          className="boh-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStockItem(slug(r.item));
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="boh-btn-secondary"
                          disabled={!!acked[r.id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAck(r.id);
                          }}
                        >
                          {acked[r.id] ? "Acked" : "Ack"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <button
        type="button"
        className="boh-link"
        style={{ marginTop: 16 }}
        onClick={() => onOpenView("overview")}
      >
        ← Back to Overview
      </button>
    </div>
  );
}
