"use client";

/**
 * Service Brief — role packets for ~90m. Checklist protocol, not a dump.
 */

import { useLab } from "./LabContext";
import {
  briefForSeed,
  type BriefItem,
  type BriefPacket,
} from "./labServiceBrief";

const PACKETS: BriefPacket[] = ["foh", "chef", "gm", "cfo"];

function ItemRow({
  item,
  onOpen,
}: {
  item: BriefItem;
  onOpen: (i: BriefItem) => void;
}) {
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
          {item.euro != null ? (
            <span data-grade={item.grade}>
              €{item.euro.toLocaleString("en-IE")} · {item.grade}
            </span>
          ) : null}
          {item.displayId ? (
            <button
              type="button"
              className="lab-brief-open"
              onClick={() => onOpen(item)}
            >
              {item.displayId} · Why
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function ServiceBrief() {
  const {
    state,
    nav,
    setBriefPacket,
    setSeed,
    goDecision,
    goValue,
  } = useLab();
  const model = briefForSeed(state.seed);
  const packet = model.packets[nav.briefPacket];

  const openItem = (item: BriefItem) => {
    if (item.seed) {
      setSeed(item.seed);
      return;
    }
    if (item.grade === "Verified") {
      goValue("verified");
      return;
    }
    if (item.decisionId) goDecision(item.decisionId, "why");
  };

  return (
    <section className="lab-brief">
      <header className="lab-brief-head">
        <div>
          <p className="lab-brief-k">Service Brief</p>
          <h2 className="lab-brief-title">{model.phaseLabel}</h2>
          <p className="lab-brief-delta">{model.deltaNote}</p>
        </div>
        <div className="lab-brief-tabs" role="tablist" aria-label="Brief packet">
          {PACKETS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={nav.briefPacket === p}
              data-on={nav.briefPacket === p ? "true" : undefined}
              onClick={() => setBriefPacket(p)}
            >
              {p === "foh" ? "FOH" : p === "cfo" ? "CFO" : p === "gm" ? "GM" : "Chef"}
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
            <ItemRow key={item.id} item={item} onOpen={openItem} />
          ))}
        </ul>
      </div>
    </section>
  );
}
