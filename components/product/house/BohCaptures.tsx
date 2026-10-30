"use client";

import { useMemo, useState } from "react";
import type { HouseCapture, HouseSummary } from "@/lib/radr/product/houseAttention";
import type { BohView } from "./BohShell";
import { IconPlay, channelIcon } from "./BohIcons";

type Filter = "all" | "voice" | "camera" | "document" | "manual";

type Props = {
  house: HouseSummary;
  onOpenView: (v: BohView) => void;
  onOpenStockItem: (slug: string) => void;
  verdicts: Record<string, "confirmed" | "corrected">;
  onVerdict: (id: string, v: "confirmed" | "corrected") => void;
};

function channelOf(c: HouseCapture): Exclude<Filter, "all"> {
  if (c.channel === "note") return "manual";
  if (c.channel === "document" || c.channel === "manual") return c.channel;
  return c.channel;
}

const CARRY_MEDIA: Record<string, string> = {
  gap_oil_berlin: "/house/fryer-oil-buckets.jpg",
  gap_gloves_berlin: "/house/nitrile-gloves.jpg",
};

export function BohCaptures({
  house,
  onOpenView,
  onOpenStockItem,
  verdicts,
  onVerdict,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const handling = house.gaps.filter(
    (g) => g.attention === "handling" || g.attention === "watching",
  );
  const captures = useMemo(() => {
    const list = house.captures.filter((c) => c.status !== "stub");
    if (filter === "all") return list;
    return list.filter((c) => channelOf(c) === filter);
  }, [house.captures, filter]);

  const needsReview = captures.filter((c) => {
    const v = verdicts[c.id];
    if (v === "confirmed" || v === "corrected") return false;
    return c.confirmation === "pending";
  });

  const sources = useMemo(() => {
    const all = house.captures.filter((c) => c.status !== "stub");
    const counts = { voice: 0, camera: 0, document: 0, manual: 0 };
    for (const c of all) counts[channelOf(c)] += 1;
    const total = all.length || 1;
    return (Object.keys(counts) as Array<keyof typeof counts>).map((k) => ({
      key: k,
      n: counts[k],
      pct: Math.round((counts[k] / total) * 100),
    }));
  }, [house.captures]);

  return (
    <div className="boh-captures">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Captures & stock truth</p>
          <h2>Captures & stock truth</h2>
          <p>
            Convert messy back-of-house signals into operational truth — from
            voice, photos, documents and manual inputs.
          </p>
        </div>
      </header>

      <section className="boh-carrying" aria-label="What RADR is carrying">
        <h3>What RADR is carrying</h3>
        <div className="boh-carrying-grid">
          {handling.map((g) => (
            <article key={g.id} className="boh-carrying-card">
              {CARRY_MEDIA[g.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={CARRY_MEDIA[g.id]}
                  alt={g.item}
                  width={72}
                  height={72}
                />
              ) : null}
              <div>
                <div className="boh-carrying-top">
                  <strong>{g.item}</strong>
                  <span
                    className={`boh-badge is-${g.attention === "handling" ? "handling" : "watching"}`}
                  >
                    {g.attention === "handling" ? "RADR handling" : "Watching"}
                  </span>
                </div>
                <p className="boh-area">{g.area}</p>
                <div className="boh-did">
                  <span>What RADR already did</span>
                  <p>{g.radrDid}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="boh-captures-layout">
        <section className="boh-panel" aria-label="Captures feed">
          <div className="boh-panel-head">
            <h3>Captures</h3>
            <span className="boh-muted">Newest first</span>
          </div>
          <div className="boh-cap-filters">
            {(
              [
                ["all", "All"],
                ["voice", "Voice"],
                ["camera", "Camera"],
                ["document", "Document"],
                ["manual", "Manual"],
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

          {captures.map((c) => {
            const ch = channelOf(c);
            const verdict = verdicts[c.id];
            const confirmed =
              verdict === "confirmed" ||
              (!verdict && c.confirmation === "confirmed");
            const needs =
              !confirmed &&
              (verdict === "corrected" ? false : c.confirmation === "pending");
            return (
              <article key={c.id} className="boh-cap-row" data-channel={ch}>
                <div className={`boh-cap-icon is-${ch}`} aria-hidden>
                  {channelIcon(c.channel, { size: 16 })}
                </div>
                <div className="boh-cap-body">
                  <div className="boh-capture-top">
                    <span className="boh-capture-channel">
                      {ch.toUpperCase()} {c.when} · {c.by}
                    </span>
                    {confirmed ? (
                      <span className="boh-confirm">✓ Confirmed</span>
                    ) : needs ? (
                      <span className="boh-review">Needs review</span>
                    ) : (
                      <span className="boh-confirm">Corrected</span>
                    )}
                  </div>
                  <div className="boh-cap-cols">
                    <div>
                      <span className="boh-cap-label">Observed</span>
                      <p>{c.transcript}</p>
                    </div>
                    <div>
                      <span className="boh-cap-label">Interpreted</span>
                      <p>
                        {c.interpreted}
                        {c.confidence != null
                          ? ` · ${Math.round(c.confidence * 100)}% confidence`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="boh-capture-media">
                    {ch === "voice" ? (
                      <button type="button" className="boh-play" aria-label="Play voice">
                        <IconPlay />
                        <span>0:18</span>
                      </button>
                    ) : null}
                    {ch === "camera" ? (
                      <div className="boh-cap-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/house/sugar-shelf-empty.webp"
                          alt="Shelf capture — empty sugar bin"
                          width={72}
                          height={72}
                        />
                      </div>
                    ) : null}
                    {ch === "document" ? (
                      <div className="boh-cap-thumb is-doc">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/house/caster-sugar-bin.webp"
                          alt="Delivery note evidence"
                          width={72}
                          height={72}
                        />
                      </div>
                    ) : null}
                    {needs ? (
                      <div className="boh-capture-actions">
                        <button
                          type="button"
                          className="boh-btn-primary"
                          onClick={() => onVerdict(c.id, "confirmed")}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="boh-btn-secondary"
                          onClick={() => onVerdict(c.id, "corrected")}
                        >
                          Correct
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="boh-cap-rail">
          <section className="boh-panel boh-rail-alert">
            <div className="boh-panel-head">
              <h3>Needs review</h3>
              <span className="boh-count is-neg">{needsReview.length}</span>
            </div>
            {needsReview.length === 0 ? (
              <p className="boh-muted">Nothing waiting on you.</p>
            ) : (
              needsReview.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="boh-rail-item"
                  onClick={() => setFilter(channelOf(c))}
                >
                  {channelOf(c) === "camera" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/house/sugar-shelf-empty.webp"
                      alt=""
                      width={36}
                      height={36}
                    />
                  ) : null}
                  <span>
                    <strong>{c.interpreted?.split("·")[0] ?? c.transcript}</strong>
                    <em>
                      {channelOf(c)} · {c.when}
                    </em>
                  </span>
                </button>
              ))
            )}
          </section>

          <section className="boh-panel boh-conflict">
            <div className="boh-panel-head">
              <h3>Conflicting inputs</h3>
              <span className="boh-count is-amber">1</span>
            </div>
            <article>
              <strong>Caster sugar</strong>
              <ul>
                <li>
                  <span>Voice</span>
                  <em>2 kg</em>
                </li>
                <li>
                  <span>Delivery</span>
                  <em>2 kg</em>
                </li>
                <li>
                  <span>Camera</span>
                  <em>likely &lt;1 kg</em>
                </li>
                <li>
                  <span>Expected</span>
                  <em>4 kg</em>
                </li>
              </ul>
              <p>Stock truth unresolved. Confirm actual stock.</p>
            </article>
          </section>

          <section className="boh-panel boh-next">
            <h3>Recommended next step</h3>
            <p>
              Confirm actual caster sugar stock, then consider a top-up or
              Kreuzberg transfer before pastry pull.
            </p>
            <button
              type="button"
              className="boh-btn-primary"
              onClick={() => onOpenStockItem("caster-sugar")}
            >
              Open in inventory →
            </button>
          </section>

          <section className="boh-panel">
            <div className="boh-panel-head">
              <h3>Capture sources</h3>
              <span className="boh-muted">This period</span>
            </div>
            <ul className="boh-sources">
              {sources.map((s) => (
                <li key={s.key}>
                  <span>{s.key}</span>
                  <div className="boh-source-bar" aria-hidden>
                    <i style={{ width: `${s.pct}%` }} />
                  </div>
                  <strong>
                    {s.n} · {s.pct}%
                  </strong>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            className="boh-link"
            onClick={() => onOpenView("overview")}
          >
            ← Back to Overview
          </button>
        </aside>
      </div>
    </div>
  );
}
