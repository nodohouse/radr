"use client";

import Link from "next/link";
import { formatEuro } from "@/lib/lab/format";
import { pinsFor } from "@/lib/lab/modules";
import { HOTEL_FLOOR, ROLE_LENSES, SERVICE_FLOOR, THEMES, WIN_LOSS } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";

export function RoleBand() {
  const { nav, state, setCenterView, setSeed, goCatalog } = useLab();
  const lens = ROLE_LENSES[nav.role];
  const pins = pinsFor(nav.pinnedIds);
  const floor = state.seed === "hotel" ? HOTEL_FLOOR : SERVICE_FLOOR;

  return (
    <section className="lab-role" data-role={nav.role}>
      {lens.showFloor && state.seed !== "recover" ? (
        <div className="lab-floor">
          <header className="lab-section-head">
            <div>
              <p className="lab-k">
                {state.seed === "hotel" ? "Who’s arriving · what to hold" : "Who’s coming · what to hold"}
              </p>
              <h2>{state.seed === "hotel" ? "Front office" : "FOH implications"}</h2>
            </div>
            {lens.showBrief ? (
              <button type="button" className="lab-section-link" onClick={() => setCenterView("brief")}>
                {state.seed === "hotel" ? "Open Front-office Brief" : "Open FOH Brief"}
              </button>
            ) : null}
          </header>
          <div className="lab-floor-row">
            {floor.map((n) => (
              <article key={n.id} className="lab-floor-card" data-hot={n.hot || undefined}>
                <em>{n.label}</em>
                <strong>{n.value}</strong>
                <p>because {n.because}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {lens.showWinLoss ? (
        <div className="lab-winloss-wrap">
          <header className="lab-section-head">
            <div>
              <p className="lab-k">Win / loss</p>
              <h2>Where we protected · where we leak</h2>
            </div>
          </header>
          <div className="lab-winloss">
            {WIN_LOSS.map((w) => (
              <article key={w.kind} className="lab-winloss-card" data-kind={w.kind}>
                <em>{w.label}</em>
                <strong>
                  {formatEuro(w.euro)} {w.grade}
                </strong>
                <p>because {w.because}</p>
                {w.kind === "loss" ? (
                  <button type="button" onClick={() => setSeed("recover")}>
                    {w.cta}
                  </button>
                ) : (
                  <Link href={w.href}>{w.cta}</Link>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {lens.showThemes ? (
        <div className="lab-themes">
          <header className="lab-section-head">
            <div>
              <p className="lab-k">Portfolio</p>
              <h2>Three money themes</h2>
            </div>
          </header>
          <div className="lab-theme-row">
            {THEMES.map((t) => (
              <Link key={t.id} href={t.href} className="lab-theme">
                <em>{t.wedge}</em>
                <strong>{t.title}</strong>
                <span data-grade={t.grade}>
                  {formatEuro(t.euro)} · {t.grade}
                </span>
                <p>because {t.because}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="lab-pins">
        <header className="lab-section-head">
          <div>
            <p className="lab-k">My modules</p>
            <h2>
              {nav.role === "gm" ? "Sell + Labor pins" : nav.role === "cfo" ? "Recover + Buy pins" : "Material pins"}
            </h2>
          </div>
          <button type="button" className="lab-section-link" onClick={goCatalog}>
            Edit in Catalog
          </button>
        </header>
        <div className="lab-pin-row">
          {pins.map((m) => (
            <Link key={m.id} href={m.href} className="lab-pin">
              <em>
                {m.displayId} · {m.category}
              </em>
              <strong>{m.title}</strong>
              <span data-grade={m.grade}>
                {m.euro > 0 ? formatEuro(m.euro) : m.euroLabel} · {m.grade}
              </span>
              <p>because {m.because}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
