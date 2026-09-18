"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  lisbonAttention,
  lisbonHandling,
  lisbonTonight,
} from "@/lib/radr/demo/lisbonResidences";
import { formatEuro } from "@/lib/radr/money";

export function ResidencesAttentionBoard() {
  const pulse = lisbonTonight();
  const attention = lisbonAttention();
  const handling = lisbonHandling();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const open = useMemo(
    () => attention.filter((a) => !dismissed[a.id]),
    [attention, dismissed],
  );
  const stake = open.reduce((s, a) => s + a.stakeEuro, 0);

  return (
    <div className="rp-attention rp-hotel-attention">
      <header className="rp-attention-head">
        <p className="rp-hotel-glance-kicker">LISBON RESIDENCES · DEMO</p>
        <h1 className="rp-attention-title">Needs attention</h1>
        <p className="rp-attention-sub">
          {open.length === 0
            ? "Nothing needs you."
            : `${formatEuro(stake)} across ${open.length} item${open.length === 1 ? "" : "s"}.`}
        </p>
      </header>
      <ul className="rp-hotel-attn-list">
        {open.map((item, i) => (
          <li key={item.id} className="rp-hotel-attn-row">
            <p className="rp-hotel-attn-idx">
              {String(i + 1).padStart(2, "0")}
            </p>
            <div className="rp-hotel-attn-main">
              <p className="rp-hotel-attn-kicker">{item.kicker}</p>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              {item.radrDid ? (
                <p className="rp-hotel-attn-did">
                  WHAT RADR ALREADY DID · {item.radrDid}
                </p>
              ) : null}
            </div>
            <div className="rp-hotel-attn-money">
              <strong>{formatEuro(item.stakeEuro)}</strong>
              <span>{item.stakeLabel}</span>
            </div>
            <div className="rp-hotel-attn-cta">
              <Link href={item.href} className="rp-hotel-attn-go">
                {item.cta}
              </Link>
              <button
                type="button"
                className="rp-hotel-attn-dismiss"
                onClick={() =>
                  setDismissed((d) => ({ ...d, [item.id]: true }))
                }
              >
                Later
              </button>
            </div>
          </li>
        ))}
      </ul>
      <section className="rp-hotel-handling">
        <p className="rp-hotel-sec-label">
          {pulse.radrHandling} items RADR is handling
        </p>
        <ul className="rp-hotel-handling-list">
          {handling.map((h) => (
            <li key={h.id}>
              <strong>{h.status}</strong>
              <span>{h.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
