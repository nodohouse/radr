"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";

type Channel = {
  id: string;
  name: string;
  context: string;
  left: { label: string; value: string };
  right: { label: string; value: string };
  delta: string;
  impact: string;
  line: string;
};

const channels: Channel[] = [
  {
    id: "buy",
    name: "Buy",
    context: "Supplier / Avocado Hass 18ct",
    left: { label: "Agreed", value: "€31.20" },
    right: { label: "Paid", value: "€34.80" },
    delta: "€3.60 / case",
    impact: "€18,620 / year",
    line: "You paid more than agreed.",
  },
  {
    id: "labor",
    name: "Labor",
    context: "Thursday / Dinner",
    left: { label: "Demand", value: "11 staff" },
    right: { label: "Scheduled", value: "14 staff" },
    delta: "3 staff",
    impact: "€840 tonight",
    line: "You scheduled above demand.",
  },
  {
    id: "sell",
    name: "Sell",
    context: "Saturday / Dinner",
    left: { label: "Current", value: "€128k" },
    right: { label: "Potential", value: "€142k" },
    delta: "€14k / year",
    impact: "€14k opportunity",
    line: "You're leaving demand uncaptured.",
  },
  {
    id: "recover",
    name: "Recover",
    context: "Supplier credit",
    left: { label: "Expected", value: "€18,620" },
    right: { label: "Received", value: "€0" },
    delta: "€18,620",
    impact: "€18,620 recoverable",
    line: "You're owed this money.",
  },
];

function ChannelViz({ channel, active }: { channel: Channel; active: boolean }) {
  return (
    <div className="radr-cov-viz" data-active={active ? "true" : "false"}>
      <p className="radr-cov-context">{channel.context}</p>
      <div className="radr-cov-compare" data-open={active ? "true" : "false"}>
        <div className="radr-cov-col">
          <span>{channel.left.label}</span>
          <strong className="radr-money">{channel.left.value}</strong>
        </div>
        <div className="radr-cov-col" data-shift="true">
          <span>{channel.right.label}</span>
          <strong className="radr-money">{channel.right.value}</strong>
        </div>
      </div>
      <div className="radr-cov-bridge" aria-hidden="true" />
      <div className="radr-cov-delta">
        <span className="radr-tri">△</span>
        <strong className="radr-money">{channel.delta}</strong>
      </div>
      <p className="radr-cov-impact">
        <span className="radr-tri">△</span>{" "}
        <span className="radr-money">{channel.impact}</span>
      </p>
      <p className="radr-cov-line">{channel.line}</p>
    </div>
  );
}

export function SectionTerritories() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const u = () => setMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  useEffect(() => {
    if (mobile || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(
        channels.length - 1,
        Math.floor(progress * channels.length),
      );
      setIndex(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobile, reduced]);

  if (mobile || reduced) {
    return (
      <section
        className="radr-cov radr-cov--stack"
        id="coverage"
        data-nav-theme="dark"
      >
        <div className="radr-shell">
          <p className="radr-cat">Coverage</p>
          <h2 className="radr-h2 radr-h2-sm">
            RADR doesn&apos;t
            <br />
            watch one thing.
          </h2>
          <p className="radr-lead-inv">
            It watches everything that moves your margin.
          </p>
          <div className="radr-cov-stack">
            {channels.map((c) => (
              <article key={c.id} className="radr-cov-card">
                <header>
                  <span>{c.name}</span>
                  <span className="radr-cov-scan">● Scanning</span>
                </header>
                <ChannelViz channel={c} active />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="radr-cov"
      id="coverage"
      ref={rootRef}
      data-nav-theme="dark"
      style={{ height: `${channels.length * 100}vh` }}
    >
      <div className="radr-cov-pin">
        <div className="radr-shell radr-cov-grid">
          <div className="radr-cov-left">
            <p className="radr-cat">Coverage</p>
            <h2 className="radr-h2 radr-h2-sm">
              RADR doesn&apos;t
              <br />
              watch one thing.
            </h2>
            <p className="radr-lead-inv">
              It watches everything that moves your margin.
            </p>
            <ul className="radr-cov-channels">
              {channels.map((c, i) => (
                <li key={c.id} data-on={i === index ? "true" : "false"}>
                  <button type="button" onClick={() => setIndex(i)}>
                    <span>{c.name}</span>
                    <span className="radr-cov-scan">
                      {i === index ? "● Scanning" : "○ Standby"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="radr-cov-right">
            <div className="radr-cov-scanline" aria-hidden="true" key={index} />
            <ChannelViz channel={channels[index]!} active />
          </div>
        </div>
      </div>
    </section>
  );
}
