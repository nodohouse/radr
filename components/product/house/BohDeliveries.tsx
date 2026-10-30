"use client";

import { useState } from "react";
import type { HouseSummary } from "@/lib/radr/product/houseAttention";
import type { BohView } from "./BohShell";

type Props = {
  house: HouseSummary;
  onOpenView: (v: BohView) => void;
  received: Record<string, boolean>;
  onReceive: (id: string) => void;
};

export function BohDeliveries({
  house,
  onOpenView,
  received,
  onReceive,
}: Props) {
  const [selected, setSelected] = useState(house.deliveries[0]?.id ?? "");
  const active =
    house.deliveries.find((d) => d.id === selected) ?? house.deliveries[0];

  return (
    <div className="boh-deliveries">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Inbound</p>
          <h2>Deliveries</h2>
          <p>Expected, short, arrived — dock truth before it hits the line.</p>
        </div>
      </header>

      <div className="boh-del-layout">
        <section className="boh-panel">
          <div className="boh-panel-head">
            <h3>Today</h3>
            <span className="boh-muted">{house.deliveries.length} shipments</span>
          </div>
          <ul className="boh-del-list">
            {house.deliveries.map((d) => {
              const done = received[d.id] || d.status === "arrived";
              return (
                <li
                  key={d.id}
                  data-status={d.status}
                  data-active={d.id === active?.id ? "true" : undefined}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelected(d.id);
                  }}
                >
                  <div>
                    <strong>{d.supplier}</strong>
                    <p>{d.note}</p>
                  </div>
                  <div className="boh-del-meta">
                    <span
                      className={`boh-badge is-${done ? "handling" : d.status === "short" || d.status === "late" ? "critical" : "risk"}`}
                    >
                      {done && d.status !== "arrived" ? "received" : d.status}
                    </span>
                    <em>
                      {d.arrived ? `Arrived ${d.arrived}` : `Due ${d.expected}`}
                    </em>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {active ? (
          <aside className="boh-panel boh-del-detail">
            <div className="boh-panel-head">
              <h3>{active.supplier}</h3>
              <span
                className={`boh-badge is-${active.status === "short" ? "critical" : active.status === "arrived" ? "handling" : "risk"}`}
              >
                {active.status}
              </span>
            </div>
            <div className="boh-metrics">
              <div>
                <span>Expected</span>
                <strong>{active.expected}</strong>
              </div>
              <div>
                <span>Arrived</span>
                <strong>{active.arrived ?? "—"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{received[active.id] ? "Received" : active.status}</strong>
              </div>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--boh-ink-soft)" }}>
              {active.note}
            </p>
            <div className="boh-capture-actions">
              {active.status !== "arrived" && !received[active.id] ? (
                <button
                  type="button"
                  className="boh-btn-primary"
                  onClick={() => onReceive(active.id)}
                >
                  Mark received
                </button>
              ) : (
                <span className="boh-confirm">✓ On dock / in house</span>
              )}
              {active.status === "short" ? (
                <button type="button" className="boh-btn-secondary">
                  Report short
                </button>
              ) : null}
              <button
                type="button"
                className="boh-btn-secondary"
                onClick={() => onOpenView("stock")}
              >
                Open stock
              </button>
            </div>
          </aside>
        ) : null}
      </div>

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
