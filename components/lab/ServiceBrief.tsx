"use client";

import { BRIEF_TABS, getServiceBrief } from "@/lib/lab/briefs";
import { formatEuro } from "@/lib/lab/format";
import { seedForDecision } from "@/lib/lab/ids";
import { useLab } from "@/lib/lab/store";
import type { BriefItem } from "@/lib/lab/types";

function Item({ item, onOpen }: { item: BriefItem; onOpen: (item: BriefItem) => void }) {
  return (
    <li className="lab-brief-item" data-status={item.status}>
      <div className="lab-brief-check" aria-hidden="true">
        {item.status === "done" ? "✓" : item.status === "do" ? "→" : "·"}
      </div>
      <div className="lab-brief-body">
        <div className="lab-brief-top">
          <strong>{item.check}</strong>
          <span className="lab-brief-when">{item.when}</span>
        </div>
        <p className="lab-brief-detail">{item.detail}</p>
        <p className="lab-brief-because">because {item.because}</p>
        <div className="lab-brief-meta">
          {item.euro != null && item.grade ? (
            <span data-grade={item.grade}>
              {formatEuro(item.euro)} · {item.grade}
            </span>
          ) : null}
          {item.displayId ? (
            <button type="button" className="lab-brief-open" onClick={() => onOpen(item)}>
              {item.displayId} · Why
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function ServiceBrief() {
  const { state, nav, setBriefPacket, setSeed, setCenterView, setMode } = useLab();
  const brief = getServiceBrief(state.seed);
  const packet = brief.packets[nav.briefPacket];

  const open = (item: BriefItem) => {
    const seed = item.seed ?? (item.decisionId ? seedForDecision(item.decisionId) : null);
    if (seed) setSeed(seed);
    setCenterView("ops");
    setMode("why");
  };

  return (
    <section className="lab-brief">
      <header className="lab-brief-head">
        <div>
          <p className="lab-k">Service Brief</p>
          <h2 className="lab-brief-title">{brief.phaseLabel}</h2>
          <p className="lab-brief-delta">{brief.deltaNote}</p>
        </div>
        <div className="lab-brief-tabs" role="tablist" aria-label="Brief packet">
          {BRIEF_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={nav.briefPacket === tab.id}
              data-on={nav.briefPacket === tab.id || undefined}
              onClick={() => setBriefPacket(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <div className="lab-brief-packet">
        <p className="lab-brief-packet-k">{packet.title}</p>
        <p className="lab-brief-packet-lead">{packet.lead}</p>
        <p className="lab-brief-horizon">{packet.horizon}</p>
        <ul className="lab-brief-list">
          {packet.items.map((item) => (
            <Item key={item.id} item={item} onOpen={open} />
          ))}
        </ul>
      </div>
    </section>
  );
}
