"use client";

import Link from "next/link";
import type { BriefRole, FloorNote, LabWorld, RoleLens } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";

type Props = {
  world: LabWorld;
  lens: RoleLens;
  onOpenBrief: (packet: BriefRole) => void;
};

export function RoleBand({ world, lens, onOpenBrief }: Props) {
  if (lens.role === "gm") {
    return (
      <section className="lab-band" aria-labelledby="role-title">
        <div className="lab-band-head">
          <div>
            <p className="lab-kicker">Role band · GM</p>
            <h2 id="role-title" className="lab-h lab-h2">
              Who’s coming · what to hold
            </h2>
            <p className="lab-lead">FOH Brief is the packet. Floor map is not a KPI wall.</p>
          </div>
          <button type="button" className="lab-btn lab-btn-acid" onClick={() => onOpenBrief("foh")}>
            Open FOH Brief
          </button>
        </div>
        <div className="lab-role-grid">
          {world.floor.map((n: FloorNote) => (
            <article key={n.id} className="lab-note">
              <p className="lab-note-k">{n.label}</p>
              <p className="lab-h" style={{ fontSize: "1.15rem" }}>
                {n.value}
              </p>
              <p className="lab-because">{n.because}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (lens.role === "cfo") {
    return (
      <section className="lab-band" aria-labelledby="role-title">
        <div className="lab-band-head">
          <div>
            <p className="lab-kicker">Role band · CFO</p>
            <h2 id="role-title" className="lab-h lab-h2">
              Win / loss · Recover
            </h2>
            <p className="lab-lead">
              Pulse already told in / out / forecast. Floor map is not the hero.
            </p>
          </div>
          <Link className="lab-btn lab-btn-acid" href="/app/lab/control-center?seed=recover&role=cfo">
            Open Recover
          </Link>
        </div>
        <div className="lab-role-grid">
          {world.winLoss.map((row) => (
            <Link key={row.id} href={row.href} className="lab-story">
              <p className="lab-story-k">{row.title}</p>
              <BecauseMoney {...row.money} />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="lab-band" aria-labelledby="role-title">
      <div className="lab-band-head">
        <div>
          <p className="lab-kicker">Role band · C-level</p>
          <h2 id="role-title" className="lab-h lab-h2">
            Three money themes
          </h2>
          <p className="lab-lead">Minimal ops noise. Verified only with lineage.</p>
        </div>
        <Link className="lab-btn" href="/app/lab/value?band=verified">
          Open ledger
        </Link>
      </div>
      <div className="lab-role-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {world.themes.map((t) => (
          <Link key={t.id} href={t.href} className="lab-theme">
            <p className="lab-note-k">{t.wedge}</p>
            <p className="lab-h" style={{ fontSize: "1.12rem" }}>
              {t.title}
            </p>
            <BecauseMoney {...t.money} />
          </Link>
        ))}
      </div>
    </section>
  );
}
