"use client";

import { useState } from "react";
import {
  GUEST_FEEDBACK_THEMES,
  GUEST_OVERVIEW,
  GUEST_SENTIMENT,
} from "@/lib/radr/product/guestAttention";
import type { GuestView } from "./GuestShell";

type Props = {
  onOpenView: (v: GuestView) => void;
  onOpenFloorTable: (tableId: string) => void;
};

export function GuestFeedback({ onOpenView, onOpenFloorTable }: Props) {
  const [filter, setFilter] = useState<"all" | "needs" | "handled">("all");
  const maxSent = Math.max(...GUEST_SENTIMENT);
  const signals = GUEST_OVERVIEW.signals.filter((s) => {
    if (filter === "needs")
      return s.state === "needs_attention" || s.state === "in_progress";
    if (filter === "handled") return s.state === "handled";
    return true;
  });

  return (
    <div className="gi-feedback">
      <header className="gi-view-head">
        <div>
          <p className="gi-kicker">Guest intelligence · Feedback</p>
          <h2>Feedback & signals</h2>
          <p>Material guest signals only — not every comment.</p>
        </div>
      </header>

      <div className="gi-feedback-layout">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Live guest signals</h3>
          </div>
          <div className="gi-signal-filters">
            {(
              [
                ["all", "All"],
                ["needs", "Needs attention"],
                ["handled", "Handled"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={filter === id ? "is-active" : undefined}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="gi-signals">
            {signals.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() =>
                    s.tableId
                      ? onOpenFloorTable(s.tableId)
                      : onOpenView("floor")
                  }
                >
                  <span className={`gi-dot is-${s.state}`} aria-hidden />
                  <span className="gi-signal-body">
                    <strong>
                      {s.table} · {s.label}
                    </strong>
                    <em>{s.category}</em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="gi-side">
          <section className="gi-panel">
            <div className="gi-panel-head">
              <h3>Themes</h3>
            </div>
            <ul className="gi-themes">
              {GUEST_FEEDBACK_THEMES.map((t) => (
                <li key={t.id}>
                  <div className="gi-theme-row">
                    <span>{t.label}</span>
                    <div className="gi-theme-bar" aria-hidden>
                      <i style={{ width: `${t.pct}%` }} />
                    </div>
                    <strong>{t.pct}%</strong>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="gi-panel">
            <div className="gi-panel-head">
              <h3>Sentiment · 8 weeks</h3>
            </div>
            <p className="gi-sentiment-value">
              <strong>4.6 / 5.0</strong>
              <em>+0.2 vs prior</em>
            </p>
            <div className="gi-sentiment-chart">
              {GUEST_SENTIMENT.map((v, i) => (
                <i key={i} style={{ height: `${(v / maxSent) * 100}%` }} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
