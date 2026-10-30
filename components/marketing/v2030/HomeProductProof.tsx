"use client";

/**
 * Native product proof — Control Center / Live / Decisions / Value.
 * Demonstrates RADR without raster screenshots.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";

type Tab = "control" | "live" | "decisions" | "value";

const TABS: { id: Tab; label: string }[] = [
  { id: "control", label: "Control Center" },
  { id: "live", label: "Live" },
  { id: "decisions", label: "Decisions" },
  { id: "value", label: "Value" },
];

export function HomeProductProof() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("control");
  const r = PUBLIC_RESTAURANT;

  return (
    <section
      className="rx-proof rx-chapter"
      aria-labelledby="rx-proof-title"
    >
      <div className="rx30-shell">
        <header className="rx-proof-intro">
          <p className="rx30-kicker">See RADR at work</p>
          <h2 id="rx-proof-title" className="rx30-h2">
            From signal
            <br />
            to outcome.
          </h2>
        </header>

        <div className="rx-proof-frame">
          <p className="rx-proof-demo-tag">Illustrative RADR demo</p>
          <div className="rx-proof-chrome">
            <div className="rx-proof-brand">
              <FrozenRadrLogo variant="mark" theme="dark" width={22} decorative />
              <span>RADR</span>
            </div>
            <div className="rx-proof-tabs" role="tablist" aria-label="Product surfaces">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  data-on={tab === t.id ? "true" : undefined}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="rx-proof-live">
              <i aria-hidden /> LIVE
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="rx-proof-body"
              role="tabpanel"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "control" ? <ControlPane /> : null}
              {tab === "live" ? <LivePane /> : null}
              {tab === "decisions" ? <DecisionsPane /> : null}
              {tab === "value" ? <ValuePane /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ControlPane() {
  const r = PUBLIC_RESTAURANT;
  return (
    <div className="rx-proof-brief">
      <aside className="rx-proof-brief-rail">
        <p className="rx-proof-label">Estate</p>
        <strong>{r.displayName}</strong>
        <span>{r.clockLine}</span>
        <div className="rx-proof-brief-estate">
          <div>
            <em>Demand</em>
            <b data-tone="blue">+21%</b>
          </div>
          <div>
            <em>Kitchen</em>
            <b data-tone="amber">Rising</b>
          </div>
          <div>
            <em>Labor</em>
            <b data-tone="amber">Tight</b>
          </div>
        </div>
      </aside>
      <div className="rx-proof-brief-main">
        <article className="rx-proof-card rx-proof-card--need">
          <p className="rx-proof-label">What needs you</p>
          <strong>{r.actionCompact}</strong>
          <span>
            {r.decisionId} · {r.expectedFormatted} expected · {r.confidencePct}% confidence
          </span>
        </article>
        <div className="rx-proof-brief-row">
          <article className="rx-proof-card">
            <p className="rx-proof-label">RADR is handling</p>
            <strong>3 watching</strong>
            <span>Inventory · Labor · Delivery</span>
          </article>
          <article className="rx-proof-card rx-proof-card--verified">
            <p className="rx-proof-label">Verified since last check</p>
            <strong>{r.verifiedFormatted}</strong>
            <span>Protected value</span>
          </article>
        </div>
      </div>
    </div>
  );
}

function LivePane() {
  const r = PUBLIC_RESTAURANT;
  return (
    <div className="rx-proof-grid rx-proof-grid--live">
      <div className="rx-proof-live-meta">
        <strong>{r.displayName}</strong>
        <span>{r.clockLine}</span>
      </div>
      <ul className="rx-proof-pressure">
        <li data-tone="blue">
          <span>Demand</span>
          <strong>+21%</strong>
        </li>
        <li data-tone="amber">
          <span>Kitchen</span>
          <strong>Rising</strong>
        </li>
        <li data-tone="amber">
          <span>Labor</span>
          <strong>Stretched</strong>
        </li>
        <li data-tone="red">
          <span>Inventory</span>
          <strong>Tight</strong>
        </li>
      </ul>
      <svg className="rx-proof-mini-chart" viewBox="0 0 360 120" aria-hidden>
        <path
          d="M8 90 C40 88 70 80 100 70 C140 55 170 40 210 42 C250 44 290 30 350 18"
          fill="none"
          stroke="#4B9FFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M8 95 C50 94 90 88 130 78 C180 64 230 55 350 40"
          fill="none"
          stroke="#00D978"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function DecisionsPane() {
  const r = PUBLIC_RESTAURANT;
  return (
    <article className="rx-proof-decision">
      <header>
        <span className="rx-proof-id">{r.decisionId}</span>
        <span className="rx-proof-badge">Recommendation</span>
      </header>
      <h3>{r.actionCompact}</h3>
      <p>{r.situation}</p>
      <div className="rx-proof-decision-meta">
        <div>
          <span>Expected</span>
          <strong>{r.expectedFormatted}</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{r.confidencePct}%</strong>
        </div>
        <div>
          <span>Evidence</span>
          <strong>5 signals</strong>
        </div>
        <div>
          <span>Futures</span>
          <strong>Pace vs open</strong>
        </div>
      </div>
    </article>
  );
}

function ValuePane() {
  const r = PUBLIC_RESTAURANT;
  return (
    <div className="rx-proof-value">
      <ol>
        <li data-tone="blue">
          <span>Expected</span>
          <strong>{r.expectedFormatted}</strong>
          <em>Modeled at decide</em>
        </li>
        <li data-tone="amber">
          <span>Observed</span>
          <strong>+$605</strong>
          <em>During service</em>
        </li>
        <li data-tone="green">
          <span>Verified</span>
          <strong>{r.verifiedFormatted}</strong>
          <em>Matched outcome</em>
        </li>
      </ol>
      <p className="rx-proof-value-note">
        Verified Value requires an evidence chain. Never claimed without it.
      </p>
    </div>
  );
}
