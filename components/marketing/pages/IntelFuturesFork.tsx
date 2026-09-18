"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { money } from "@/data/demo";
import type { CanonDecision } from "@/lib/radr/decision/demo/canonical";
import { futuresFromCanon } from "@/lib/radr/decision/futures";

type Mode = "options" | "decided";

/**
 * Futures beat — paths first, rank on ask.
 * compact: quieter copy for progressive landing.
 */
export function IntelFuturesFork({
  decision,
  exposureLabel = "EXPOSURE",
  compact = false,
  onRanked,
}: {
  decision: CanonDecision;
  exposureLabel?: string;
  compact?: boolean;
  /** Called when paths are ranked — parent can rest on Decision climax. */
  onRanked?: () => void;
}) {
  const bundle = useMemo(() => futuresFromCanon(decision), [decision]);
  const [mode, setMode] = useState<Mode>("options");
  const [selected, setSelected] = useState<string | null>(null);

  const pickId =
    mode === "decided" ? bundle.recommendedScenarioId : selected;
  const pick =
    bundle.scenarios.find((s) => s.id === pickId) ??
    bundle.scenarios.find((s) => s.id === bundle.recommendedScenarioId) ??
    bundle.scenarios[0]!;
  const recommended = bundle.scenarios.find((s) => s.recommended) ?? pick;
  const baseline = bundle.scenarios.find((s) => s.isNoAction);
  const vsBaseline =
    baseline && pick.id !== baseline.id
      ? pick.expectedContribution - baseline.expectedContribution
      : null;

  return (
    <div className="rx-intel-futures" data-mode={mode} data-compact={compact ? "true" : "false"}>
      <div className="rx-intel-futures-head">
        <p className="rx-intel-k">
          Futures
          <span>{mode === "options" ? "vs do nothing" : "ranked"}</span>
        </p>
      </div>

      {!compact ? (
        <p className="rx-intel-futures-sit">
          {mode === "options" ? (
            <>
              Every path vs <strong>do nothing</strong>. Risk-adjusted — not max
              €. <em>WAIT can win.</em>
            </>
          ) : (
            <>Strongest risk-adjusted path — not the highest number.</>
          )}
        </p>
      ) : null}

      <ul className="rx-intel-forks" role="list">
        {bundle.scenarios.map((s) => {
          const on =
            mode === "options"
              ? selected
                ? s.id === selected
                : true
              : s.id === bundle.recommendedScenarioId;
          const dim = mode === "decided" && !s.recommended;
          return (
            <li
              key={s.id}
              data-on={on && !dim ? "true" : "false"}
              data-dim={dim ? "true" : "false"}
            >
              <button
                type="button"
                className="rx-intel-fork"
                data-rec={
                  s.recommended && mode === "decided" ? "true" : "false"
                }
                data-baseline={s.isNoAction ? "true" : "false"}
                aria-pressed={
                  selected === s.id || (mode === "decided" && !!s.recommended)
                }
                onClick={() => {
                  setMode("options");
                  setSelected(s.id);
                }}
              >
                <em>
                  {s.isNoAction
                    ? "Do nothing"
                    : s.recommended && mode === "decided"
                      ? "Chosen"
                      : "Path"}
                </em>
                <strong>{s.label}</strong>
                <span className="rx-intel-fork-eur">
                  {money(s.expectedContribution)}
                  <i>expected</i>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {mode === "options" && selected ? (
        <p className="rx-intel-fork-preview">
          {pick.isNoAction ? (
            <>Cost of doing nothing</>
          ) : (
            <>
              vs do nothing{" "}
              <strong>
                {vsBaseline != null && vsBaseline >= 0 ? "+" : ""}
                {vsBaseline != null ? money(vsBaseline) : ""}
              </strong>
            </>
          )}
        </p>
      ) : null}

      <div className="rx-intel-futures-actions">
        {mode === "options" ? (
          <button
            type="button"
            className="rx-btn rx-btn-primary"
            onClick={() => {
              setMode("decided");
              setSelected(bundle.recommendedScenarioId);
              onRanked?.();
            }}
          >
            Rank paths
          </button>
        ) : (
          <button
            type="button"
            className="rx-btn rx-btn-ghost"
            onClick={() => {
              setMode("options");
              setSelected(null);
            }}
          >
            Paths again
          </button>
        )}
        <Link href="/product/futures" className="rx-intel-futures-more">
          Futures →
        </Link>
      </div>

      {mode === "decided" ? (
        <>
          <div className="rx-intel-ask">
            <div className="rx-intel-ask-value">
              <strong className="rx-econ-risk">
                {money(decision.exposureEuro)}
              </strong>
              <em>{exposureLabel}</em>
            </div>
            <div className="rx-intel-ask-body">
              <p className="rx-intel-ask-kicker">RADR recommends</p>
              <p className="rx-intel-ask-what">{recommended.label}</p>
              <p className="rx-intel-ask-prep">{decision.prepared}</p>
              <p className="rx-intel-ask-id">
                {decision.displayId}
                {baseline ? (
                  <> · {money(bundle.incrementalVsNoAction)} vs do nothing</>
                ) : null}
              </p>
            </div>
          </div>

          <p className="rx-intel-verify-line">
            <em>Verify</em>
            Observed vs expected {money(decision.expectedProtectedEuro)} · then
            remember
          </p>
        </>
      ) : null}
    </div>
  );
}
