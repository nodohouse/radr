"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GUEST_FEEDBACK_THEMES,
  GUEST_OVERVIEW,
  GUEST_RECOMMENDATIONS,
  GUEST_SEGMENT_KPIS,
  GUEST_SENTIMENT,
  type GuestSegmentId,
} from "@/lib/radr/product/guestAttention";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { ValueWindowChart } from "./ValueWindowChart";
import type { GuestView } from "./GuestShell";

type Props = {
  segmentId: string | null;
  onSelectSegment: (id: GuestSegmentId) => void;
  onOpenView: (v: GuestView) => void;
  onOpenProfile: (guestId: string) => void;
};

export function GuestSegments({
  segmentId,
  onSelectSegment,
  onOpenView,
  onOpenProfile,
}: Props) {
  const [themeOpen, setThemeOpen] = useState<string | null>(null);
  const selected =
    GUEST_OVERVIEW.segments.find((s) => s.id === segmentId) ??
    GUEST_OVERVIEW.segments[0];
  const maxSent = Math.max(...GUEST_SENTIMENT);

  return (
    <div className="gi-segments">
      <header className="gi-view-head">
        <div>
          <p className="gi-kicker">Guest intelligence · Segments</p>
          <h2>Segments & Loyalty Intelligence</h2>
          <p>
            Understand who your guests are, what they value, and where loyalty
            and revenue opportunities exist.
          </p>
        </div>
      </header>

      <section className="gi-kpis" aria-label="Segment metrics">
        {GUEST_SEGMENT_KPIS.map((k) => (
          <div key={k.id} className="gi-kpi" data-tone={k.tone}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em data-tone={k.tone}>{k.delta}</em>
            <i className="gi-kpi-spark" aria-hidden />
          </div>
        ))}
      </section>

      <div className="gi-hero">
        <section className="gi-insight">
          <p className="gi-kicker gi-kicker-green">RADR insight</p>
          <h2>Regulars and terrace diners drive value between 20:10–20:40.</h2>
          <p className="gi-insight-body">
            Service pace is the constraint, not demand. Regulars, terrace, and
            occasion dining converge — protect ticket time to keep spend and
            repeat likelihood.
          </p>
          <ValueWindowChart />
        </section>
        <aside className="gi-judgment">
          <p className="gi-kicker">Prepared judgment</p>
          <h3>{GUEST_OVERVIEW.judgment.title}</h3>
          <p>{GUEST_OVERVIEW.judgment.body}</p>
          <p className="gi-expected">
            Expected · ~€{GUEST_OVERVIEW.judgment.expectedEuro} recoverable
          </p>
          <Link
            href={`/app/decisions/${DECISION_IDS.guestVoice}`}
            className="gi-btn-primary"
            style={{ marginTop: 16, width: "fit-content" }}
          >
            Take action →
          </Link>
        </aside>
      </div>

      <div className="gi-seg-mid">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Guest segments</h3>
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
                {GUEST_OVERVIEW.segments.map((s) => (
                  <tr
                    key={s.id}
                    data-active={selected.id === s.id ? "true" : undefined}
                    onClick={() => onSelectSegment(s.id)}
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
          {selected ? (
            <div className="gi-seg-detail">
              <h4>{selected.name}</h4>
              <p>
                Tonight’s covers and spend concentrate here. Repeat likelihood{" "}
                {selected.repeatLikelihood} · satisfaction {selected.satisfaction}.
                Preferred areas and menu affinities open in Memory when needed —
                not dumped on this surface.
              </p>
            </div>
          ) : null}
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>RADR recommendations</h3>
            <button
              type="button"
              className="gi-link"
              onClick={() => onOpenView("overview")}
            >
              View all →
            </button>
          </div>
          <ul className="gi-rec-list">
            {GUEST_RECOMMENDATIONS.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.title}</strong>
                  <p>{r.body}</p>
                </div>
                <span className={`gi-badge is-${r.tone === "pos" ? "handled" : "in_progress"}`}>
                  {r.impact}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="gi-seg-bot">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>High-potential guests tonight</h3>
          </div>
          <ul className="gi-hv">
            {GUEST_OVERVIEW.highValue.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() =>
                    t.guestId ? onOpenProfile(t.guestId) : onOpenView("floor")
                  }
                >
                  <span className="gi-avatar" aria-hidden>
                    {(t.guestName ?? t.table)
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <strong>
                      {t.guestName ?? t.table} · {t.tags[0]}
                    </strong>
                    <em>
                      {t.time} · Est. €{t.estEuro}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Feedback themes</h3>
            <span className="gi-muted">Live from tonight</span>
          </div>
          <ul className="gi-themes">
            {GUEST_FEEDBACK_THEMES.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setThemeOpen(t.id)}>
                  <span>{t.label}</span>
                  <div className="gi-theme-bar" aria-hidden>
                    <i style={{ width: `${t.pct}%` }} />
                  </div>
                  <strong>{t.pct}%</strong>
                </button>
              </li>
            ))}
          </ul>
          {themeOpen ? (
            <p className="gi-theme-note">
              Supporting quotes open in Feedback — sample size is tonight only;
              do not overinterpret.
            </p>
          ) : null}
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Guest sentiment trend</h3>
            <span className="gi-muted">Last 8 weeks</span>
          </div>
          <p className="gi-sentiment-value">
            <strong>4.6 / 5.0</strong>
            <em>+0.2 vs previous period</em>
          </p>
          <div className="gi-sentiment-chart" role="img" aria-label="8-week sentiment">
            {GUEST_SENTIMENT.map((v, i) => (
              <i
                key={i}
                style={{ height: `${(v / maxSent) * 100}%` }}
                title={String(v)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
