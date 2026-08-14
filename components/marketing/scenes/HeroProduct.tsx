"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO, formatEuro } from "../data/demo";
import { METER_TARGETS } from "../data/liveScan";
import { useLiveScan } from "../motion/useLiveScan";
import { LiveFeedRow } from "../primitives/LiveFeedRow";
import { LiveSignalDetail } from "../primitives/LiveSignalDetail";
import { MissionTypewriter } from "../primitives/MissionTypewriter";
import { RadarScanner } from "../primitives/RadarScanner";
import { ValueCounter } from "../primitives/ValueCounter";
import { RadrWordmark } from "../RadrWordmark";

export function HeroProduct() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(Boolean(e?.isIntersecting)),
      { threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const scan = useLiveScan(inView);
  const detail = scan.focused ?? (scan.paused ? scan.active : null);

  const radarFindings = scan.feed.slice(0, 3).map((s) => ({
    id: s.id,
    amount:
      s.annualizedAdd > 0
        ? formatEuro(s.annualizedAdd)
        : s.recoverableAdd > 0
          ? formatEuro(s.recoverableAdd)
          : s.rawLabel,
    period: s.annualizedAdd > 0 ? " / yr" : "",
    title: s.title,
    tag: s.tag,
  }));

  const radarIndex = scan.active
    ? radarFindings.findIndex((f) => f.id === scan.active!.id)
    : -1;

  return (
    <section
      ref={sectionRef}
      className="rx-hero"
      id="product"
      data-nav-theme="dark"
    >
      <div className="rx-hero-atmosphere" aria-hidden="true" />
      <div className="rx-hero-radar-wrap" aria-hidden="true">
        <RadarScanner
          armed={inView && !scan.paused}
          activeIndex={radarIndex}
          findings={radarFindings}
          pingKey={scan.active?.id}
        />
      </div>

      <div className="rx-shell rx-hero-grid">
        <div className="rx-hero-copy">
          <RadrWordmark
            size="hero"
            animate={inView}
            className="rx-hero-mark"
          />
          <p className="rx-kicker">Margin intelligence</p>
          <h1 className="rx-hero-title">
            Nothing off
            <br />
            the RADR.
          </h1>
          <MissionTypewriter className="rx-hero-type" />
          <div className="rx-ctas">
            <a href="#coverage" className="rx-btn rx-btn-primary">
              See what RADR finds <span aria-hidden="true">→</span>
            </a>
            <a href="/how" className="rx-btn rx-btn-ghost">
              How it works
            </a>
          </div>
          <p className="rx-hero-beachhead">Built first for hospitality.</p>
        </div>

        <aside
          className="rx-hero-feed"
          aria-label="Illustrative demo scan"
          onMouseLeave={() => {
            if (scan.focused) scan.focusSignal(null);
          }}
        >
          <div className="rx-feed-meta">
            <p className="rx-feed-label">
              <span
                className="rx-live-dot"
                data-on={scan.phase !== "locked" || !scan.paused ? "true" : "false"}
              />{" "}
              RADR / LIVE
            </p>
            <p className="rx-feed-scope">
              {DEMO.locations} locations · 30-day demo scan
            </p>
          </div>

          <div className="rx-live-meters">
            <div className="rx-live-meter">
              <span>Identified exposure</span>
              <ValueCounter
                value={scan.value}
                className="rx-live-meter-value"
                duration={0.45}
              />
            </div>
            <div className="rx-live-meter-split">
              <div>
                <span>Annualized</span>
                <ValueCounter value={scan.annualized} duration={0.4} />
              </div>
              <div>
                <span>Recoverable now</span>
                <ValueCounter value={scan.recoverable} duration={0.4} />
              </div>
            </div>
            <p className="rx-live-meter-note">
              Illustrative demo · value on RADR locks at{" "}
              {formatEuro(METER_TARGETS.value)}
            </p>
          </div>

          <div className="rx-live-stage">
            {scan.moment && !scan.focused ? (
              <div
                className="rx-live-moment"
                data-kind={scan.moment.kind}
                key={scan.moment.id}
              >
                {scan.moment.kicker ? (
                  <p className="rx-kicker">{scan.moment.kicker}</p>
                ) : null}
                <h2>
                  {scan.moment.headline.split("\n").map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h2>
                {scan.moment.body ? <p>{scan.moment.body}</p> : null}
              </div>
            ) : null}

            {detail ? <LiveSignalDetail signal={detail} /> : null}

            <div
              className="rx-feed-list rx-live-feed"
              data-dim={scan.moment && !detail ? "true" : "false"}
            >
              {scan.feed.length === 0 ? (
                <p className="rx-live-waiting">Scanning operation…</p>
              ) : (
                scan.feed.map((s, i) => (
                  <LiveFeedRow
                    key={`${s.id}-${i}`}
                    signal={s}
                    active={scan.active?.id === s.id || scan.focused?.id === s.id}
                    onEnter={(sig) => scan.focusSignal(sig)}
                    onLeave={() => scan.focusSignal(null)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rx-hero-total">
            <em>
              {scan.locked ? "Value identified" : "Demo scan"}
            </em>
            <small>
              {scan.locked
                ? `Next scan · continuous · ${scan.signalCount} signals seen`
                : `${Math.min(scan.signalCount, 27)} signals · climbing`}
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}
