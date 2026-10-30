"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  GuestKpiId,
  GuestOverviewModel,
  GuestSegmentId,
  GuestSignalState,
} from "@/lib/radr/product/guestAttention";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type { GuestView } from "./GuestShell";
import { ValueWindowChart } from "./ValueWindowChart";

type Props = {
  model: GuestOverviewModel;
  onOpenView: (v: GuestView) => void;
  onOpenFloorTable: (tableId: string) => void;
  onOpenSegment: (id: GuestSegmentId) => void;
  onOpenProfile: (guestId: string) => void;
};

const STATE_LABEL: Record<GuestSignalState, string> = {
  needs_attention: "Needs attention",
  in_progress: "In progress",
  handled: "Handled",
  opportunity: "Opportunity",
  positive: "Positive",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function GuestOverview({
  model,
  onOpenView,
  onOpenFloorTable,
  onOpenSegment,
  onOpenProfile,
}: Props) {
  const [activeKpi, setActiveKpi] = useState<GuestKpiId | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [signalFilter, setSignalFilter] = useState<"all" | "needs" | "handled">(
    "all",
  );

  const needsN = model.signals.filter((s) => s.state === "needs_attention").length;
  const handledN = model.signals.filter((s) => s.state === "handled").length;
  const signals = model.signals.filter((s) => {
    if (signalFilter === "needs")
      return s.state === "needs_attention" || s.state === "in_progress";
    if (signalFilter === "handled") return s.state === "handled";
    return true;
  });

  return (
    <div className="gi-overview">
      <section className="gi-kpis" aria-label="Guest metrics">
        {model.kpis.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`gi-kpi${activeKpi === k.id ? " is-active" : ""}`}
            data-tone={k.tone}
            onClick={() =>
              setActiveKpi((prev) => (prev === k.id ? null : k.id))
            }
          >
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em data-tone={k.tone}>{k.delta}</em>
            <i className="gi-kpi-spark" aria-hidden />
          </button>
        ))}
      </section>

      {activeKpi ? (
        <div className="gi-kpi-panel" role="status">
          {activeKpi === "satisfaction" && (
            <p>
              Satisfaction 4.6 / 5.0 · themes: food quality, service pace,
              atmosphere. Ticket time is the main drag on first-visit scores.
            </p>
          )}
          {activeKpi === "covers" && (
            <p>
              {model.kpis[1].delta} · VIP and group mix concentrated after 20:00
              on terrace and dining room.
            </p>
          )}
          {activeKpi === "return" && (
            <p>
              Returning guests contribute 36% of covers and the majority of
              expected check uplift tonight.
            </p>
          )}
          {activeKpi === "check" && (
            <p>
              Expected €52 / cover · returners lift check ~32% vs first visit.
              Terrace + occasion dining lead average spend.
            </p>
          )}
          {activeKpi === "recoverable" && (
            <p>
              €460 recoverable from active opportunities — mostly ticket-time
              recovery on Tables 7 and first-visit capture on Table 11.
            </p>
          )}
        </div>
      ) : null}

      <div className="gi-hero">
        <section className="gi-insight">
          <p className="gi-kicker gi-kicker-green">RADR insight</p>
          <h2>{model.insight.headline}</h2>
          <p className="gi-insight-body">{model.insight.body}</p>
          <ValueWindowChart />
          <p className="gi-window-caption">{model.insight.windowLabel}</p>
        </section>

        <aside className="gi-judgment">
          <p className="gi-kicker">Prepared judgment</p>
          <h3>{model.judgment.title}</h3>
          <p>{model.judgment.body}</p>
          <p className="gi-expected">
            Expected · ~€{model.judgment.expectedEuro} recoverable value
          </p>
          <div className="gi-judgment-actions">
            <Link
              href={`/app/decisions/${model.judgment.decisionId}`}
              className="gi-btn-primary"
            >
              Take action →
            </Link>
            <button
              type="button"
              className="gi-btn-secondary"
              onClick={() => setCompareOpen((v) => !v)}
              aria-expanded={compareOpen}
            >
              Compare impact
            </button>
          </div>
          {compareOpen ? (
            <div className="gi-compare">
              <div>
                <span>Do nothing</span>
                <ul>
                  <li>
                    Ticket time <strong>{model.compare.doNothing.ticket}</strong>
                  </li>
                  <li>
                    Recoverable{" "}
                    <strong>{model.compare.doNothing.recoverable}</strong>
                  </li>
                  <li>
                    Repeat likelihood{" "}
                    <strong>{model.compare.doNothing.repeat}</strong>
                  </li>
                </ul>
              </div>
              <div data-tone="pos">
                <span>RADR action</span>
                <ul>
                  <li>
                    Ticket time{" "}
                    <strong>{model.compare.radrAction.ticket}</strong>
                  </li>
                  <li>
                    Recoverable{" "}
                    <strong>{model.compare.radrAction.recoverable}</strong>
                  </li>
                  <li>
                    Repeat likelihood{" "}
                    <strong>{model.compare.radrAction.repeat}</strong>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
          <Link
            href={`/app/decisions/${model.judgment.decisionId}`}
            className="gi-link"
          >
            Open {displayDecisionId(model.judgment.decisionId)} →
          </Link>
        </aside>
      </div>

      <div className="gi-bottom">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Guest segments</h3>
            <button
              type="button"
              className="gi-link"
              onClick={() => onOpenView("segments")}
            >
              See all segments →
            </button>
          </div>
          <div className="gi-table-wrap">
            <table className="gi-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Share</th>
                  <th>Satisfaction</th>
                  <th>Avg spend</th>
                  <th>Repeat</th>
                  <th>Tonight’s takeaway</th>
                </tr>
              </thead>
              <tbody>
                {model.segments.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onOpenSegment(s.id)}
                  >
                    <td className="gi-item">{s.name}</td>
                    <td>{s.share}</td>
                    <td>{s.satisfaction}</td>
                    <td>{s.avgSpend}</td>
                    <td>{s.repeatLikelihood}</td>
                    <td className="gi-takeaway">{s.takeaway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Live guest signals</h3>
            <button
              type="button"
              className="gi-link"
              onClick={() => onOpenView("feedback")}
            >
              View all →
            </button>
          </div>
          <div className="gi-signal-filters">
            <button
              type="button"
              className={signalFilter === "all" ? "is-active" : undefined}
              onClick={() => setSignalFilter("all")}
            >
              All ({model.signals.length})
            </button>
            <button
              type="button"
              className={signalFilter === "needs" ? "is-active" : undefined}
              onClick={() => setSignalFilter("needs")}
            >
              Needs attention ({needsN})
            </button>
            <button
              type="button"
              className={signalFilter === "handled" ? "is-active" : undefined}
              onClick={() => setSignalFilter("handled")}
            >
              Handled ({handledN})
            </button>
          </div>
          <ul className="gi-signals">
            {signals.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() =>
                    s.tableId ? onOpenFloorTable(s.tableId) : onOpenView("floor")
                  }
                >
                  <span className={`gi-dot is-${s.state}`} aria-hidden />
                  <span className="gi-signal-body">
                    <strong>
                      {s.table} · {s.label}
                    </strong>
                    <em>{s.category}</em>
                  </span>
                  <span className={`gi-badge is-${s.state}`}>
                    {STATE_LABEL[s.state]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="gi-side">
          <section className="gi-panel">
            <div className="gi-panel-head">
              <h3>High-value tables tonight</h3>
              <button
                type="button"
                className="gi-link"
                onClick={() => onOpenView("floor")}
              >
                View floor →
              </button>
            </div>
            <ul className="gi-hv">
              {model.highValue.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() =>
                      t.guestId
                        ? onOpenProfile(t.guestId)
                        : onOpenFloorTable(t.tableId)
                    }
                  >
                    <span className="gi-avatar" aria-hidden>
                      {initials(t.guestName ?? t.table)}
                    </span>
                    <span>
                      <strong>
                        {t.table} · {t.guests} guests
                      </strong>
                      <em>
                        {t.tags.join(" · ")} · {t.time}
                      </em>
                    </span>
                    <span className="gi-est">Est. €{t.estEuro}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="gi-panel">
            <div className="gi-panel-head">
              <h3>Service recovery</h3>
            </div>
            <ul className="gi-recovery">
              {model.recovery.map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>
                      {r.table} · {r.problem}
                    </strong>
                    <p>{r.suggested}</p>
                  </div>
                  <div className="gi-recovery-meta">
                    <em>€{r.valueEuro}</em>
                    <Link
                      href={`/app/decisions/${model.judgment.decisionId}`}
                      className="gi-btn-secondary"
                    >
                      Take action
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
