"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  buildOrphanFutures,
  ORPHAN_FUTURES_ACTUAL,
} from "@/lib/radr/decision/futures";
import {
  CANON_ORPHAN,
  expectedMetricLabel,
  observedMetricLabel,
  verifiedEuro,
  verifiedMetricLabel,
} from "@/lib/radr/decision/demo/canonical";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/home.css";
import "@/app/econ.css";
import "@/app/kinetic.css";

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
  fut_orphan_wait: "Wait 24h · direct",
};

const TIME_MARKS = [
  {
    id: "72h",
    label: "72H",
    actions: "All paths open",
    net: "Full recoverability",
    risk: "Low urgency",
  },
  {
    id: "48h",
    label: "48H",
    actions: "Discount still viable",
    net: "Recoverability narrowing",
    risk: "Channel pressure rising",
  },
  {
    id: "24h",
    label: "24H",
    actions: "OTA release costly",
    net: "Direct window critical",
    risk: "High opportunity cost",
  },
  {
    id: "checkin",
    label: "CHECK-IN",
    actions: "Night nearly fixed",
    net: "Residual only",
    risk: "Irreversible soon",
  },
] as const;

/**
 * Futures page — temporal field, not scenario rows.
 */
export function FuturesChapter() {
  const bundle = useMemo(() => buildOrphanFutures(), []);
  const [selected, setSelected] = useState(bundle.recommendedScenarioId);
  const [why, setWhy] = useState(false);
  const [timeIdx, setTimeIdx] = useState(1);
  const time = TIME_MARKS[timeIdx]!;
  const pick =
    bundle.scenarios.find((s) => s.id === selected) ?? bundle.scenarios[0]!;
  const recommended = bundle.scenarios.find((s) => s.recommended)!;
  const maxEv = bundle.scenarios.reduce((best, s) =>
    s.expectedContribution > best.expectedContribution ? s : best,
  );
  const notMaxPick = recommended.id !== maxEv.id;

  const paths = bundle.scenarios.map((s) => {
    const geom = PATH_BY_ID[s.id] ?? {
      d: "M40 160 C 150 158, 260 120, 560 110",
      band: 28,
    };
    return { id: s.id, ...geom };
  });

  const axis = bundle.temporal ?? [];

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-fut-field-scene" data-nav-theme="dark">
          <div className="rx-fut-field-media" aria-hidden="true">
            <Image
              src="/demo/facilities/lisbon-onebed.jpg"
              alt=""
              fill
              sizes="100vw"
              className="rx-fut-field-img"
              style={{ objectPosition: "50% 42%" }}
              priority
            />
            <div className="rx-fut-field-veil" />
          </div>

          <div className="rx-shell rx-fut-field-inner">
            <header className="rx-cinema-head rx-cinema-head-on-dark">
              <p className="rx-cinema-kicker">
                Platform · Futures · {CANON_ORPHAN.displayId} · DEMO · ILLUSTRATIVE
              </p>
              <h2 className="rx-cinema-title">
                Don&apos;t guess the next move.
                <br />
                Play it forward.
              </h2>
              <p className="rx-fut-field-sit">
                {bundle.situation.slice(0, 2).join(" · ")}
              </p>
              <p className="rx-fut-field-intel">
                RADR ranks risk-adjusted paths — not raw max €.
                {notMaxPick ? (
                  <>
                    {" "}
                    {`Highest on paper: ${maxEv.label} (${formatDecisionMoney(maxEv.expectedContribution)}).`}
                  </>
                ) : null}
              </p>
            </header>

            <div className="rx-fut-time-scrub" role="group" aria-label="Time to check-in">
              {TIME_MARKS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  data-on={timeIdx === i ? "true" : undefined}
                  onClick={() => setTimeIdx(i)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <dl className="rx-fut-time-meta">
              <div>
                <dt>Available actions</dt>
                <dd>{time.actions}</dd>
              </div>
              <div>
                <dt>Expected net</dt>
                <dd>{time.net}</dd>
              </div>
              <div>
                <dt>Risk</dt>
                <dd>{time.risk}</dd>
              </div>
            </dl>

            <div className="rx-fut-field-canvas">
              <div className="rx-fut-field-axis" aria-hidden="true">
                {axis.length > 0
                  ? axis.map((t) => <span key={t.at}>{t.at}</span>)
                  : (
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
                  const on = p.id === selected;
                  const rec = p.id === bundle.recommendedScenarioId;
                  return (
                    <g key={String(p.id)}>
                      <path
                        className="rx-fut-band"
                        d={p.d}
                        data-on={on ? "true" : "false"}
                        data-rec={rec ? "true" : undefined}
                        style={{ strokeWidth: p.band }}
                      />
                      <path
                        className="rx-fut-line"
                        d={p.d}
                        data-on={on ? "true" : "false"}
                        data-rec={rec ? "true" : undefined}
                      />
                    </g>
                  );
                })}
              </svg>
              <ul className="rx-fut-field-ends">
                {bundle.scenarios.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-on={selected === s.id ? "true" : "false"}
                      data-rec={s.recommended ? "true" : undefined}
                      data-base={s.isNoAction ? "true" : undefined}
                      onClick={() => setSelected(s.id)}
                    >
                      <em>
                        {s.recommended
                          ? "RADR plan"
                          : (END_LABEL[s.id] ?? s.label)}
                      </em>
                      <strong>
                        {formatDecisionMoney(s.expectedContribution)}
                        {s.id === maxEv.id && notMaxPick ? (
                          <small> · max €</small>
                        ) : null}
                      </strong>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selected === maxEv.id && notMaxPick ? (
              <p className="rx-fut-field-pass" role="status">
                Not selected — {maxEv.expectedGuestImpact} guest impact ·{" "}
                {maxEv.expectedCapacityImpact} capacity · {maxEv.operationalRisk}{" "}
                operational risk. RADR plan: {recommended.label} (
                {formatDecisionMoney(recommended.expectedContribution)}).
              </p>
            ) : null}

            <div className="rx-fut-field-why">
              <button
                type="button"
                className="rx-btn rx-btn-ghost rx-btn-on-dark"
                onClick={() => setWhy((w) => !w)}
                aria-expanded={why}
              >
                Why this one?
              </button>
              {why ? (
                <dl className="rx-fut-field-trust">
                  <div>
                    <dt>Expected</dt>
                    <dd>{formatDecisionMoney(pick.expectedContribution)}</dd>
                  </div>
                  <div>
                    <dt>Operational risk</dt>
                    <dd>{pick.operationalRisk}</dd>
                  </div>
                  <div>
                    <dt>Guest impact</dt>
                    <dd>{pick.expectedGuestImpact}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{pick.expectedCapacityImpact}</dd>
                  </div>
                  <div>
                    <dt>Likely range</dt>
                    <dd>
                      {formatDecisionMoney(pick.downside)}–
                      {formatDecisionMoney(pick.upside)}
                    </dd>
                  </div>
                  <div>
                    <dt>RADR pick</dt>
                    <dd>
                      {pick.recommended
                        ? "Risk-adjusted best"
                        : `Pass · plan is ${recommended.label}`}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              After the window · {CANON_ORPHAN.displayId} · DEMO · ILLUSTRATIVE
            </p>
            <dl className="rx-plat10-outcome">
              <div>
                <dt>{expectedMetricLabel(CANON_ORPHAN)}</dt>
                <dd>{formatDecisionMoney(ORPHAN_FUTURES_ACTUAL.simulatedEuro)}</dd>
              </div>
              <div>
                <dt>{observedMetricLabel(CANON_ORPHAN)}</dt>
                <dd>
                  {formatDecisionMoney(
                    CANON_ORPHAN.observedContributionEuro ??
                      ORPHAN_FUTURES_ACTUAL.actualEuro,
                  )}
                </dd>
              </div>
              <div>
                <dt>{verifiedMetricLabel(CANON_ORPHAN)}</dt>
                <dd className="rx-econ-verified">
                  {formatDecisionMoney(verifiedEuro(CANON_ORPHAN))}
                </dd>
              </div>
            </dl>
            <p className="rx-fut-model-updated">
              vs take-now counterfactual{" "}
              {formatDecisionMoney(
                CANON_ORPHAN.counterfactualContributionEuro ?? 78,
              )}{" "}
              · MODEL UPDATED
            </p>
            <div className="rx-ch-ctas">
              <NextLink href="/product/memory" className="rx-btn rx-btn-primary">
                Operating Memory <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/demo" className="rx-btn rx-btn-ghost">
                {CTAS.compareFutures}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
