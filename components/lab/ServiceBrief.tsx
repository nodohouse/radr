"use client";

import Link from "next/link";
import type { BriefRole, ServiceBrief as Brief } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";

const TABS: { id: BriefRole; label: string }[] = [
  { id: "foh", label: "FOH" },
  { id: "chef", label: "Chef" },
  { id: "gm", label: "GM" },
  { id: "cfo", label: "CFO" },
];

type Props = {
  brief: Brief;
  packet: BriefRole;
  onPacket: (role: BriefRole) => void;
  showDelta?: boolean;
};

export function ServiceBrief({ brief, packet, onPacket, showDelta = true }: Props) {
  const p = brief.packets[packet];
  return (
    <section className="lab-band" aria-labelledby="brief-title">
      <div className="lab-band-head">
        <div>
          <p className="lab-kicker">Service Brief · {brief.phaseLabel}</p>
          <h2 id="brief-title" className="lab-h lab-h2">
            {p.title}
          </h2>
          <p className="lab-lead">
            {p.lead} · {p.horizon}
          </p>
        </div>
      </div>
      <div style={{ padding: "0 1.1rem 1.15rem" }}>
        {showDelta ? (
          <div className="lab-delta">
            <p className="lab-kicker">Mid-service delta</p>
            <p style={{ margin: "0.2rem 0 0" }}>{brief.deltaNote}</p>
          </div>
        ) : null}
        <div className="lab-brief-tabs" role="tablist" aria-label="Brief role">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="lab-pill"
              data-on={packet === t.id}
              data-tone="acid"
              onClick={() => onPacket(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {p.items.map((item) => (
          <article key={item.id} className="lab-brief-item">
            <p className="lab-kicker">
              {item.status} · {item.when}
              {item.displayId ? ` · ${item.displayId}` : ""}
            </p>
            <p className="lab-h" style={{ fontSize: "1.12rem" }}>
              {item.check}
            </p>
            <p className="lab-lead">{item.detail}</p>
            {item.euro != null && item.grade ? (
              <BecauseMoney euro={item.euro} grade={item.grade} because={item.because} />
            ) : (
              <p className="lab-because">{item.because}</p>
            )}
            {item.decisionId ? (
              <Link
                className="lab-btn"
                href={`/app/lab/control-center?seed=${item.seed ?? "service"}&focus=${item.decisionId}`}
                style={{ marginTop: "0.55rem", display: "inline-flex" }}
              >
                Open {item.displayId}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
