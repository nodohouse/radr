"use client";

import { useEffect, useState } from "react";
import { DEMO, SIGNALS, formatEuro, type DemoSignal } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";
import { useScrollStage } from "../motion/useScrollStage";

function Artifact({ signal, phase }: { signal: DemoSignal; phase: number }) {
  const { source } = signal;
  return (
    <div className="rx-artifact" data-kind={source.kind} data-phase={phase}>
      <header>
        <span>{source.label}</span>
        <span>{signal.channelLabel}</span>
      </header>
      <p className="rx-artifact-line">{source.detail}</p>

      {source.kind === "schedule" ? (
        <div className="rx-bars" aria-hidden="true">
          {[6, 9, 11, 10].map((h, i) => (
            <div key={i} className="rx-bar-col">
              <i
                style={{ height: `${h * 8}%` }}
                data-over={i >= 2 && phase >= 2 ? "true" : "false"}
              />
              <span>{18 + i}:00</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rx-artifact-rows">
        <div>
          <span>{source.should.label}</span>
          <strong className="rx-money">{source.should.value}</strong>
        </div>
        <div data-flag={phase >= 2 ? "true" : "false"}>
          <span>{source.actual.label}</span>
          <strong className="rx-money">{source.actual.value}</strong>
        </div>
      </div>
    </div>
  );
}

function Panel({
  signal,
  active,
  reduced,
  signalIndex,
}: {
  signal: DemoSignal;
  active: boolean;
  reduced: boolean;
  signalIndex: number;
}) {
  const [phase, setPhase] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    if (reduced) {
      setPhase(3);
      return;
    }
    setPhase(0);
    const t = [
      window.setTimeout(() => setPhase(1), 220),
      window.setTimeout(() => setPhase(2), 560),
      window.setTimeout(() => setPhase(3), 900),
    ];
    return () => t.forEach(window.clearTimeout);
  }, [active, signal.id, reduced]);

  return (
    <div className="rx-cov-panel">
      <div className="rx-cov-scanline" key={signal.id} />
      <p className="rx-cov-progress">
        Signal {signal.id} · {signalIndex + 1} / {SIGNALS.length} · running total{" "}
        <strong className="rx-money">{`€${signal.runningTotal.toLocaleString("en-IE")}`}</strong>
      </p>
      <Artifact signal={signal} phase={phase} />
      <div className="rx-cov-detect" data-on={phase >= 2 ? "true" : "false"}>
        <p>
          <span className="rx-tri">△</span>{" "}
          <strong className="rx-money">{signal.source.unitDelta}</strong>
        </p>
        <p data-on={phase >= 3 ? "true" : "false"}>
          <span className="rx-tri">△</span>{" "}
          <span className="rx-money">
            {signal.amount}
            {signal.period}
          </span>{" "}
          <span className="rx-cov-title">{signal.title}</span>
        </p>
        <p className="rx-cov-line" data-on={phase >= 3 ? "true" : "false"}>
          {signal.action}
        </p>
      </div>
    </div>
  );
}

/**
 * Sticky product story through the SAME four signals as the hero.
 * BUY → RECOVER → LABOR → SELL — each explains one line of the €176,740 total.
 */
export function SectionCoverage() {
  const reduced = useReducedMotionSafe();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const u = () => setMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const desktop = !mobile && !reduced;
  const { rootRef, index, setIndex } = useScrollStage(
    SIGNALS.length,
    desktop,
  );

  const active = SIGNALS[index]!;
  const header = (showThread: boolean) => (
    <>
      <p className="rx-kicker">RADR / DEMO SCAN</p>
      <h2 className="rx-display rx-display-sm">
        Four signals.
        <br />
        One total.
      </h2>
      <p className="rx-lead-inv rx-lead-short">
        Continues from △ detection — same 18-location · 30-day scan.
        BUY opens with the €18,620 finding.
      </p>
      {showThread ? (
        <p className="rx-cov-thread" aria-live="polite">
          {index + 1} / {SIGNALS.length} signals ·{" "}
          <strong className="rx-money">
            {formatEuro(active.runningTotal)}
          </strong>{" "}
          identified
        </p>
      ) : (
        <p className="rx-cov-thread">
          {SIGNALS.length} / {SIGNALS.length} signals ·{" "}
          <strong className="rx-money">
            {formatEuro(DEMO.final)}
          </strong>{" "}
          identified
        </p>
      )}
    </>
  );

  if (mobile || reduced) {
    return (
      <section className="rx-cov rx-dark" id="coverage" data-nav-theme="dark">
        <div className="rx-shell">
          {header(false)}
          <div className="rx-cov-stack">
            {SIGNALS.map((s, i) => (
              <article key={s.id} className="rx-cov-card">
                <h3>
                  {s.channelLabel} · {s.amount}
                  {s.period}
                </h3>
                <Panel signal={s} active reduced={reduced} signalIndex={i} />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rx-cov rx-dark"
      id="coverage"
      ref={rootRef}
      data-nav-theme="dark"
      style={{ height: `${SIGNALS.length * 60}vh` }}
    >
      <div className="rx-cov-pin">
        <div className="rx-shell rx-cov-grid">
          <div className="rx-cov-left">
            {header(true)}
            <ul className="rx-cov-channels">
              {SIGNALS.map((s, i) => (
                <li key={s.id} data-on={i === index ? "true" : "false"}>
                  <button type="button" onClick={() => setIndex(i)}>
                    <span>{s.channelLabel}</span>
                    <span className="rx-cov-amt">
                      △ {s.amount}
                      {s.period}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Panel
            signal={SIGNALS[index]!}
            active
            reduced={reduced}
            signalIndex={index}
          />
        </div>
      </div>
    </section>
  );
}
