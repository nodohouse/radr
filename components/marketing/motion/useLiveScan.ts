"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  METER_TARGETS,
  POST_LOCK_CYCLE,
  SCAN_SCRIPT,
  type LiveSignal,
  type ScanMoment,
} from "../data/liveScan";
import {
  useDocumentVisible,
  useReducedMotionSafe,
} from "./useReducedMotionSafe";

const MAX_VISIBLE = 6;

export type LiveScanPhase = "scanning" | "moment" | "locked" | "cycling";

export type LiveScanState = {
  phase: LiveScanPhase;
  annualized: number;
  recoverable: number;
  value: number;
  /** Newest-first visible rows (max 6) */
  feed: LiveSignal[];
  active: LiveSignal | null;
  moment: ScanMoment | null;
  locked: boolean;
  signalCount: number;
  paused: boolean;
  setPaused: (v: boolean) => void;
  focusSignal: (s: LiveSignal | null) => void;
  focused: LiveSignal | null;
};

/**
 * Hero live-scan sequencer.
 * Discrete beats only: no 60fps React updates.
 * Meters lock at demo totals; post-lock cycles cosmetic signals.
 */
export function useLiveScan(armed: boolean): LiveScanState {
  const reduced = useReducedMotionSafe();
  const visible = useDocumentVisible();

  const [phase, setPhase] = useState<LiveScanPhase>(
    reduced ? "locked" : "scanning",
  );
  const [annualized, setAnnualized] = useState(
    reduced ? METER_TARGETS.annualized : 0,
  );
  const [recoverable, setRecoverable] = useState(
    reduced ? METER_TARGETS.recoverable : 0,
  );
  const [feed, setFeed] = useState<LiveSignal[]>(() =>
    reduced ? [...LIVE_FROM_SCRIPT].slice(-MAX_VISIBLE).reverse() : [],
  );
  const [active, setActive] = useState<LiveSignal | null>(
    reduced ? LIVE_FROM_SCRIPT[LIVE_FROM_SCRIPT.length - 1]! : null,
  );
  const [moment, setMoment] = useState<ScanMoment | null>(
    reduced
      ? {
          id: "m-done",
          kind: "complete",
          kicker: "Demo complete",
          headline: "Value on RADR",
          body: `Value identified at demo lock`,
        }
      : null,
  );
  const [locked, setLocked] = useState(reduced);
  const [signalCount, setSignalCount] = useState(
    reduced ? LIVE_FROM_SCRIPT.length : 0,
  );
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState<LiveSignal | null>(null);

  const beatRef = useRef(0);
  const cycleRef = useRef(0);
  const timerRef = useRef(0);
  const annRef = useRef(reduced ? METER_TARGETS.annualized : 0);
  const recRef = useRef(reduced ? METER_TARGETS.recoverable : 0);
  const lockedRef = useRef(reduced);

  const pushFeed = useCallback((signal: LiveSignal) => {
    setFeed((prev) => [signal, ...prev].slice(0, MAX_VISIBLE));
    setActive(signal);
  }, []);

  const focusSignal = useCallback((s: LiveSignal | null) => {
    setFocused(s);
    setPaused(Boolean(s));
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (!armed || !visible) {
      window.clearTimeout(timerRef.current);
      return;
    }
    if (paused) {
      window.clearTimeout(timerRef.current);
      return;
    }

    let cancelled = false;

    const schedule = (ms: number, fn: () => void) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const runPostLockCycle = () => {
      setPhase("cycling");
      setMoment(null);
      const signal =
        POST_LOCK_CYCLE[cycleRef.current % POST_LOCK_CYCLE.length]!;
      cycleRef.current += 1;
      pushFeed(signal);
      setSignalCount((c) => c + 1);
      schedule(3200, runPostLockCycle);
    };

    const runBeat = () => {
      if (lockedRef.current) {
        runPostLockCycle();
        return;
      }

      const beat = SCAN_SCRIPT[beatRef.current];
      if (!beat) {
        lockedRef.current = true;
        setLocked(true);
        setAnnualized(METER_TARGETS.annualized);
        setRecoverable(METER_TARGETS.recoverable);
        annRef.current = METER_TARGETS.annualized;
        recRef.current = METER_TARGETS.recoverable;
        setPhase("locked");
        schedule(1200, runPostLockCycle);
        return;
      }

      beatRef.current += 1;

      if (beat.type === "signal") {
        setPhase("scanning");
        setMoment(null);
        if (!lockedRef.current) {
          annRef.current = Math.min(
            METER_TARGETS.annualized,
            annRef.current + beat.signal.annualizedAdd,
          );
          recRef.current = Math.min(
            METER_TARGETS.recoverable,
            recRef.current + beat.signal.recoverableAdd,
          );
          setAnnualized(annRef.current);
          setRecoverable(recRef.current);
        }
        pushFeed(beat.signal);
        setSignalCount((c) => c + 1);
        schedule(beat.delayMs, runBeat);
        return;
      }

      if (beat.type === "moment") {
        setPhase("moment");
        setMoment(beat.moment);
        setActive(null);
        schedule(beat.delayMs, runBeat);
        return;
      }

      // lock
      lockedRef.current = true;
      setLocked(true);
      setPhase("locked");
      annRef.current = METER_TARGETS.annualized;
      recRef.current = METER_TARGETS.recoverable;
      setAnnualized(METER_TARGETS.annualized);
      setRecoverable(METER_TARGETS.recoverable);
      schedule(beat.delayMs, runBeat);
    };

    // Kick off after a short arm delay if at start
    const startDelay = beatRef.current === 0 && !lockedRef.current ? 900 : 0;
    schedule(startDelay || 16, runBeat);

    return () => {
      cancelled = true;
      window.clearTimeout(timerRef.current);
    };
  }, [armed, visible, paused, reduced, pushFeed]);

  const value = Math.min(
    METER_TARGETS.value,
    annualized + recoverable,
  );

  return {
    phase,
    annualized,
    recoverable,
    value,
    feed,
    active: focused ?? active,
    moment,
    locked,
    signalCount,
    paused,
    setPaused,
    focusSignal,
    focused,
  };
}

const LIVE_FROM_SCRIPT: LiveSignal[] = SCAN_SCRIPT.flatMap((b) =>
  b.type === "signal" ? [b.signal] : [],
);
