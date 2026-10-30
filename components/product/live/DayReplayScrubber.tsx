"use client";

/**
 * Day Replay scrubber — only show what RADR knew at scrub time.
 * Live → Decision → Outcome → Verified → Memory.
 */

import { useMemo, useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { DayReplay } from "@/lib/radr/product/operatingDay";

export function DayReplayScrubber({
  replay,
  onOpenDecision,
  onClose,
}: {
  replay: DayReplay;
  onOpenDecision?: (id: string) => void;
  onClose: () => void;
}) {
  const maxMin = useMemo(() => {
    const last = replay.beats[replay.beats.length - 1];
    return last?.minuteFromOpen ?? 360;
  }, [replay.beats]);

  const [minute, setMinute] = useState(() => {
    const decision = replay.beats.find((b) => b.kind === "decision");
    return decision?.minuteFromOpen ?? 138;
  });

  const visible = useMemo(
    () =>
      replay.beats.filter(
        (b) => (b.minuteFromOpen ?? 0) <= minute,
      ),
    [replay.beats, minute],
  );

  const current = visible[visible.length - 1] ?? replay.beats[0];
  const verifiedUnlocked = visible.some((b) => b.kind === "release");
  const clockFromMin = (m: number) => {
    const [oh, om] = replay.openClock.split(":").map(Number);
    const total = (oh ?? 17) * 60 + (om ?? 0) + m;
    const h = Math.floor(total / 60) % 24;
    const mins = total % 60;
    return `${String(h).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return (
    <div className="rp-replay" role="dialog" aria-label="Day replay">
      <header className="rp-replay-head">
        <div>
          <p className="rp-live-k">Day replay</p>
          <h3>{replay.title}</h3>
          <p className="rp-replay-clock">
            Scrub · {clockFromMin(minute)} · showing only what RADR knew then
          </p>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="rp-replay-scrub">
        <span>{replay.openClock}</span>
        <input
          type="range"
          min={0}
          max={maxMin}
          step={6}
          value={minute}
          aria-label="Scrub operating day"
          onChange={(e) => setMinute(Number(e.target.value))}
        />
        <span>{replay.closeClock}</span>
      </div>

      <div className="rp-replay-nums">
        <div>
          <strong>{formatDecisionMoney(replay.revenueActual)}</strong>
          <span>Revenue · end of day</span>
        </div>
        <div>
          <strong>{formatDecisionMoney(replay.contributionActual)}</strong>
          <span>Contribution</span>
        </div>
        <div data-semantic="verified" data-locked={!verifiedUnlocked}>
          <strong>
            {verifiedUnlocked
              ? formatDecisionMoney(replay.verifiedEuro)
              : "—"}
          </strong>
          <span>{verifiedUnlocked ? "Verified" : "Verification pending"}</span>
        </div>
      </div>

      {current ? (
        <div className="rp-replay-now" data-kind={current.kind}>
          <time>{current.at}</time>
          <strong>{current.label}</strong>
          <span>{current.detail}</span>
          {current.knownAtTime && current.knownAtTime.length > 0 ? (
            <ul>
              {current.knownAtTime.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <ol className="rp-replay-beats">
        {replay.beats.map((b) => {
          const unlocked = (b.minuteFromOpen ?? 0) <= minute;
          return (
            <li
              key={`${b.at}-${b.label}`}
              data-kind={b.kind}
              data-locked={!unlocked}
            >
              <time>{b.at}</time>
              <div>
                <strong>{unlocked ? b.label : "···"}</strong>
                <span>{unlocked ? b.detail : "Not yet known"}</span>
              </div>
            </li>
          );
        })}
      </ol>

      {verifiedUnlocked ? (
        <p className="rp-replay-out">{replay.outcome}</p>
      ) : (
        <p className="rp-replay-out" data-pending="true">
          Outcome and Verified Value unlock only after evidence arrives — no
          future leakage.
        </p>
      )}

      {onOpenDecision ? (
        <button
          type="button"
          className="rp-replay-cta"
          onClick={() => onOpenDecision("dec_peak_berlin")}
          disabled={!visible.some((b) => b.kind === "decision")}
        >
          Open Decision Focus →
        </button>
      ) : null}
    </div>
  );
}
