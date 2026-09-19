"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CANON_ORPHAN } from "@/lib/radr/decision/demo/canonical";
import { buildOrphanFutures } from "@/lib/radr/decision/futures";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

const PATH_BY_ID: Record<string, { d: string; band: number }> = {
  fut_orphan_discount: {
    d: "M40 160 C 150 175, 300 200, 560 210",
    band: 40,
  },
  fut_orphan_ota: {
    d: "M40 160 C 160 168, 280 155, 560 152",
    band: 32,
  },
  fut_orphan_wait: {
    d: "M40 160 C 140 150, 220 70, 560 48",
    band: 28,
  },
};

const END_LABEL: Record<string, string> = {
  fut_orphan_discount: "Discount now",
  fut_orphan_ota: "OTA release now",
  fut_orphan_wait: "Wait 24h · direct first",
};

const END_STORY: Record<string, string> = {
  fut_orphan_discount: "Fills fast · burns floor",
  fut_orphan_ota: "Fills · pays distribution tax",
  fut_orphan_wait: "Do nothing yet · prefer direct",
};

type Mode = "options" | "decided";

/**
 * Scene 04 — Futures as a temporal field.
 * First: three options. Then: RADR helps decide.
 */
export function SectionFutures() {
  const bundle = useMemo(() => buildOrphanFutures(), []);
  const [mode, setMode] = useState<Mode>("options");
  const [selected, setSelected] = useState<string | null>(null);
  const [why, setWhy] = useState(false);

  const pickId =
    mode === "decided"
      ? bundle.recommendedScenarioId
      : selected;
  const pick =
    bundle.scenarios.find((s) => s.id === pickId) ??
    bundle.scenarios.find((s) => s.id === bundle.recommendedScenarioId) ??
    bundle.scenarios[0]!;

  const paths = bundle.scenarios.map((s) => {
    const geom = PATH_BY_ID[s.id] ?? {
      d: "M40 160 C 150 158, 260 120, 560 110",
      band: 28,
    };
    return { id: s.id, ...geom };
  });

  const axis = bundle.temporal ?? [];

  function explore(id: string) {
    setMode("options");
    setSelected(id);
    setWhy(false);
  }

  function askRadr() {
    setMode("decided");
    setSelected(bundle.recommendedScenarioId);
    setWhy(true);
  }

  return (
    <section
      className="rx-fut-field-scene"
      data-nav-theme="dark"
      id="futures"
      data-mode={mode}
    >
      <div className="rx-fut-field-media" aria-hidden="true">
        <Image
          src=""
          alt=""
          fill
          sizes="100vw"
          className="rx-fut-field-img"
          style={{ objectPosition: "50% 42%" }}
        />
        <div className="rx-fut-field-veil" />
      </div>

      <div className="rx-shell rx-fut-field-inner">
        <header className="rx-cinema-head rx-cinema-head-on-dark">
          <p className="rx-cinema-kicker">RADR Futures</p>
          <h2 className="rx-cinema-title">
            Three options.
            <br />
            One Decision.
          </h2>
          <p className="rx-fut-field-sit">
            {CANON_ORPHAN.property} · one-night gap · Tuesday · 72h until
            arrival
          </p>
          <p className="rx-fut-field-intel">
            {mode === "options"
              ? "Explore each path through time. Then ask RADR which one holds."
              : "RADR compared the three futures — and chose wait."}
          </p>
        </header>

        <p className="rx-fut-field-step" aria-live="polite">
          {mode === "options" ? (
            <>
              <em>1</em> Options
              <span aria-hidden="true">→</span>
              <strong>2 Decision</strong>
            </>
          ) : (
            <>
              <span>1 Options</span>
              <span aria-hidden="true">→</span>
              <em>2</em> Decision
            </>
          )}
        </p>

        <div className="rx-fut-field-canvas" aria-label="Futures trajectories">
          <div className="rx-fut-field-axis" aria-hidden="true">
            {axis.length > 0 ? (
              axis.map((t) => <span key={t.at}>{t.at}</span>)
            ) : (
              <>
                <span>NOW</span>
                <span>CHECK-IN</span>
              </>
            )}
          </div>

          <svg
            className="rx-fut-field-svg"
            viewBox="0 0 600 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {paths.map((p) => {
              const exploring = mode === "options";
              const on =
                exploring && selected
                  ? p.id === selected
                  : exploring
                    ? true
                    : p.id === bundle.recommendedScenarioId;
              const rec =
                mode === "decided" && p.id === bundle.recommendedScenarioId;
              return (
                <g key={String(p.id)}>
                  <path
                    className="rx-fut-band"
                    d={p.d}
                    data-on={on ? "true" : "false"}
                    data-rec={rec ? "true" : undefined}
                    data-equal={exploring && !selected ? "true" : undefined}
                    style={{ strokeWidth: p.band }}
                  />
                  <path
                    className="rx-fut-line"
                    d={p.d}
                    data-on={on ? "true" : "false"}
                    data-rec={rec ? "true" : undefined}
                    data-equal={exploring && !selected ? "true" : undefined}
                  />
                </g>
              );
            })}
          </svg>

          <ul className="rx-fut-field-ends" aria-label="Three options">
            {bundle.scenarios.map((s) => {
              const isPick =
                mode === "decided"
                  ? s.id === bundle.recommendedScenarioId
                  : selected === s.id;
              const isRec = s.id === bundle.recommendedScenarioId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    data-on={isPick ? "true" : "false"}
                    data-rec={mode === "decided" && isRec ? "true" : undefined}
                    onClick={() => explore(s.id)}
                  >
                    <span className="rx-fut-opt-kicker">
                      {mode === "decided" && isRec
                        ? "RADR Decision"
                        : "Option"}
                    </span>
                    <em>{END_LABEL[s.id] ?? s.label}</em>
                    <span className="rx-fut-opt-story">
                      {END_STORY[s.id] ?? s.note}
                    </span>
                    <strong>
                      {formatDecisionMoney(s.expectedContribution)}
                      <small>expected contribution</small>
                    </strong>
                    {s.id === "fut_orphan_wait" &&
                    CANON_ORPHAN.recommendedRateEuro != null ? (
                      <span className="rx-fut-opt-story">
                        €{CANON_ORPHAN.recommendedRateEuro} recommended rate
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rx-fut-field-why">
          {mode === "options" ? (
            <button
              type="button"
              className="rx-btn rx-btn-primary"
              onClick={askRadr}
            >
              Ask RADR to decide
            </button>
          ) : (
            <button
              type="button"
              className="rx-btn rx-btn-ghost rx-btn-on-dark"
              onClick={() => {
                setMode("options");
                setSelected(null);
                setWhy(false);
              }}
            >
              Back to options
            </button>
          )}

          {mode === "decided" ? (
            <button
              type="button"
              className="rx-btn rx-btn-ghost rx-btn-on-dark"
              onClick={() => setWhy((w) => !w)}
              aria-expanded={why}
            >
              {why ? "Hide tradeoffs" : "Why this one?"}
            </button>
          ) : null}

          {why && mode === "decided" ? (
            <dl className="rx-fut-field-trust">
              <div>
                <dt>Chosen</dt>
                <dd>Wait 24h · direct first</dd>
              </div>
              <div>
                <dt>Expected</dt>
                <dd>{formatDecisionMoney(pick.expectedContribution)}</dd>
              </div>
              <div>
                <dt>Vs discount</dt>
                <dd>
                  +
                  {formatDecisionMoney(
                    pick.expectedContribution -
                      (bundle.scenarios.find(
                        (s) => s.id === "fut_orphan_discount",
                      )?.expectedContribution ?? 0),
                  )}
                </dd>
              </div>
              <div>
                <dt>Why wait</dt>
                <dd>Direct often arrives · cleaning absorbed · OTA only if pace drops</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
