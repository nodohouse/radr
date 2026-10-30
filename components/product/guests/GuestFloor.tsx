"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GUEST_ARRIVALS,
  GUEST_FLOOR_KPIS,
  GUEST_FLOOR_TABLES,
  GUEST_OVERVIEW,
  guestFloorTable,
  type GuestFloorTable,
} from "@/lib/radr/product/guestAttention";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { GuestView } from "./GuestShell";

type Props = {
  tableId: string | null;
  onSelectTable: (id: string) => void;
  onOpenView: (v: GuestView) => void;
  onOpenProfile: (guestId: string) => void;
};

const TONE_LABEL = {
  ok: "Seated",
  watch: "Watch",
  attention: "Needs you",
  vip: "VIP",
  first: "First visit",
  empty: "Open",
} as const;

function Inspector({
  t,
  onOpenProfile,
}: {
  t: GuestFloorTable;
  onOpenProfile: (id: string) => void;
}) {
  return (
    <aside className="gi-inspector">
      <div className="gi-inspector-head">
        <div>
          <h3>Table {t.n}</h3>
          <p>
            {t.party} guests · {t.seatedLabel ?? "—"} · Main dining
          </p>
        </div>
        <span className={`gi-badge is-${t.tone === "attention" ? "needs_attention" : t.tone === "watch" ? "in_progress" : "handled"}`}>
          {TONE_LABEL[t.tone]}
        </span>
      </div>

      <div className="gi-inspector-metrics">
        {t.segment ? (
          <div>
            <span>Segment</span>
            <strong>{t.segment}</strong>
          </div>
        ) : null}
        {t.spendPotential ? (
          <div>
            <span>Spend potential</span>
            <strong>{t.spendPotential}</strong>
          </div>
        ) : null}
        {t.visits != null ? (
          <div>
            <span>Visit history</span>
            <strong>{t.visits} visits</strong>
          </div>
        ) : null}
        {t.satisfaction ? (
          <div>
            <span>Satisfaction</span>
            <strong>{t.satisfaction}</strong>
          </div>
        ) : null}
      </div>

      {t.allergy ? (
        <div className="gi-allergy-banner">
          <strong>{t.allergy}</strong>
          <span>Kitchen informed · confirm before plating</span>
        </div>
      ) : null}

      <div className="gi-inspector-block">
        <h4>Guest details</h4>
        <ul>
          {t.occasion ? <li>Occasion · {t.occasion}</li> : null}
          {t.stage ? <li>Service · {t.stage}</li> : null}
          {(t.notes ?? []).map((n) => (
            <li key={n}>{n}</li>
          ))}
          {!t.occasion && !t.notes?.length && !t.stage ? (
            <li>Operational context only until profile opens.</li>
          ) : null}
        </ul>
      </div>

      {t.recommendation ? (
        <div className="gi-inspector-rec">
          <h4>Recommended action</h4>
          <p>{t.recommendation}</p>
          {t.recValue ? <em>Expected · {t.recValue}</em> : null}
          <div className="gi-judgment-actions">
            <Link
              href={`/app/decisions/${DECISION_IDS.guestVoice}`}
              className="gi-btn-primary"
            >
              Apply action
            </Link>
            {t.guestId ? (
              <button
                type="button"
                className="gi-btn-secondary"
                onClick={() => onOpenProfile(t.guestId!)}
              >
                Open profile
              </button>
            ) : null}
          </div>
        </div>
      ) : t.guestId ? (
        <button
          type="button"
          className="gi-btn-primary"
          onClick={() => onOpenProfile(t.guestId!)}
        >
          Open profile
        </button>
      ) : null}

      <div className="gi-inspector-block">
        <h4>Recovery nearby</h4>
        <ul className="gi-recovery-mini">
          {GUEST_OVERVIEW.recovery.map((r) => (
            <li key={r.id}>
              <strong>
                {r.table} · €{r.valueEuro}
              </strong>
              <span>{r.problem}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function GuestFloor({
  tableId,
  onSelectTable,
  onOpenView,
  onOpenProfile,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const selected =
    guestFloorTable(tableId) ??
    GUEST_FLOOR_TABLES.find((t) => t.id === "12") ??
    GUEST_FLOOR_TABLES[0];

  const counts = useMemo(() => {
    const c = { seated: 0, open: 0, watch: 0, attention: 0 };
    for (const t of GUEST_FLOOR_TABLES) {
      if (t.tone === "empty") c.open += 1;
      else if (t.tone === "attention") c.attention += 1;
      else if (t.tone === "watch") c.watch += 1;
      else c.seated += 1;
    }
    return c;
  }, []);

  const tip = hovered ? guestFloorTable(hovered) : null;

  return (
    <div className="gi-floor">
      <header className="gi-view-head">
        <div>
          <p className="gi-kicker">Guest intelligence · Live floor</p>
          <h2>Guest Floor Command</h2>
          <p>Who is at these tables and what matters to them — not kitchen load.</p>
        </div>
      </header>

      <section className="gi-kpis" aria-label="Floor metrics">
        {GUEST_FLOOR_KPIS.map((k) => (
          <div key={k.id} className="gi-kpi" data-tone={k.tone}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em data-tone={k.tone}>{k.delta}</em>
          </div>
        ))}
      </section>

      <div className="gi-floor-layout">
        <section className="gi-floor-stage">
          <div className="gi-floor-legend">
            <span>Main dining</span>
            <em>
              Seated {counts.seated} · Open {counts.open} · Watch {counts.watch} ·
              Needs attention {counts.attention}
            </em>
          </div>
          <div className="gi-floor-canvas">
            <picture>
              <source
                srcSet="/service/berlin-mitte-floorplan.webp"
                type="image/webp"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/service/berlin-mitte-floorplan@2x.jpg"
                alt="Soho · New York dining floor"
                width={1600}
                height={1000}
              />
            </picture>
            {GUEST_FLOOR_TABLES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`gi-marker is-${t.tone}${selected?.id === t.id ? " is-selected" : ""}`}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                onClick={() => onSelectTable(t.id)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`Table ${t.n} · ${t.signal ?? t.tone}`}
                aria-pressed={selected?.id === t.id}
              >
                <strong>{t.n}</strong>
                <span>
                  {t.party > 0 ? `${t.party}g` : "—"}
                </span>
                {t.signal ? <em>{t.signal}</em> : null}
              </button>
            ))}
            {tip && hovered !== selected?.id ? (
              <div
                className="gi-floor-tip"
                style={{ left: `${tip.x}%`, top: `${Math.max(8, tip.y - 12)}%` }}
              >
                <strong>Table {tip.n}</strong>
                <span>
                  {tip.segment ?? tip.signal} · {tip.spendPotential ?? tip.stage ?? "—"}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        {selected ? (
          <Inspector t={selected} onOpenProfile={onOpenProfile} />
        ) : null}
      </div>

      <div className="gi-floor-bottom">
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
          <ul className="gi-signals">
            {GUEST_OVERVIEW.signals.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => s.tableId && onSelectTable(s.tableId)}
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

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Upcoming arrivals</h3>
            <span className="gi-muted">Next 2h</span>
          </div>
          <ul className="gi-arrivals">
            {GUEST_ARRIVALS.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() =>
                    a.guestId ? onOpenProfile(a.guestId) : undefined
                  }
                >
                  <span className="gi-avatar" aria-hidden>
                    {a.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <strong>
                      {a.time} · {a.name}
                    </strong>
                    <em>
                      {a.guests} guests · {a.tags.join(" · ")}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
