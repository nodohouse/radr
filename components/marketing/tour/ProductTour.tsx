"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { RADR_MOTION } from "@/lib/radr/motion/tokens";

type TourCtx = {
  open: boolean;
  startTour: () => void;
  closeTour: () => void;
};

const Ctx = createContext<TourCtx | null>(null);

export function useProductTour() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useProductTour requires ProductTourProvider");
  }
  return ctx;
}

export function useProductTourOptional() {
  return useContext(Ctx);
}

type Beat = {
  id: string;
  beat: string;
  line: string;
  sub?: string;
  green?: boolean;
  dwell: number;
};

/** Product-led beats only — no hospitality photography. */
const BEATS: Beat[] = [
  {
    id: "empty",
    beat: "00:00",
    line: "The tables look empty.",
    sub: "Berlin Mitte · 18:42 · dinner service",
    dwell: 3200,
  },
  {
    id: "arent",
    beat: "00:03",
    line: "They aren't.",
    sub: "38 covers inbound · kitchen 92% · 2 walk-ins waiting",
    dwell: 3800,
  },
  {
    id: "collision",
    beat: "00:07",
    line: "Capacity collision forming.",
    sub: "Arrival density × delivery × menu mix",
    dwell: 3600,
  },
  {
    id: "futures",
    beat: "00:11",
    line: "Three futures. One recommendation.",
    sub: "Seat now · Wait 12m · Pause delivery",
    dwell: 4000,
  },
  {
    id: "wait",
    beat: "00:15",
    line: "Wait 12 minutes.",
    sub: "€620 expected incremental contribution vs seat-now",
    green: true,
    dwell: 3800,
  },
  {
    id: "context",
    beat: "00:19",
    line: "GM adds context.",
    sub: "VIP party must sit by 18:50 — re-simulating",
    dwell: 3600,
  },
  {
    id: "approve",
    beat: "00:23",
    line: "Plan approved.",
    sub: "Seat VIP · hold second walk-in · maintain delivery throttle",
    green: true,
    dwell: 3400,
  },
  {
    id: "observe",
    beat: "00:27",
    line: "Reality observed.",
    sub: "€590 incremental contribution · peak held",
    dwell: 3600,
  },
  {
    id: "verify",
    beat: "00:31",
    line: "€590 verified.",
    sub: "STRONGLY_ATTRIBUTED · Decision Record closed",
    green: true,
    dwell: 3800,
  },
  {
    id: "memory",
    beat: "00:35",
    line: "Memory updates.",
    sub: "Peak hold when kitchen ≥90% and inbound ≥30 in <25m",
    dwell: 3600,
  },
  {
    id: "close",
    beat: "00:39",
    line: "Systems record. RADR decides.",
    sub: "Put one operating problem on RADR.",
    green: true,
    dwell: 5000,
  },
];

function ProductTourOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  const reduced = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const beat = BEATS[index]!;
  const isLast = index === BEATS.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, BEATS.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "p" || e.key === "P") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (reduced || paused || isLast) return;
    const t = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, BEATS.length - 1));
    }, beat.dwell);
    return () => clearTimeout(t);
  }, [index, paused, reduced, isLast, beat.dwell]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="rx-tour"
      role="dialog"
      aria-modal="true"
      aria-label="Watch RADR decide"
    >
      <div className="rx-tour-chrome">
        <span>RADR · Product story · Illustrative</span>
        <div className="rx-tour-chrome-actions">
          {!reduced ? (
            <button
              type="button"
              className="rx-tour-btn"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Play" : "Pause"}
            </button>
          ) : null}
          <button type="button" className="rx-tour-btn" onClick={onClose}>
            Close · Esc
          </button>
        </div>
      </div>

      <div className="rx-tour-stage">
        <div className="rx-tour-media rx-tour-media--mineral" aria-hidden="true" />
        <div className="rx-tour-copy">
          <p className="rx-tour-beat">{beat.beat}</p>
          <h2 className="rx-tour-line">{beat.line}</h2>
          {beat.sub ? (
            <p className="rx-tour-sub" data-green={beat.green ? "true" : undefined}>
              {beat.sub}
            </p>
          ) : null}
          {isLast ? (
            <NextLink href="/demo" className="rx-tour-close-cta" onClick={onClose}>
              Put one operating problem on RADR →
            </NextLink>
          ) : null}
        </div>
      </div>

      <div className="rx-tour-progress" role="tablist" aria-label="Story steps">
        {BEATS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className="rx-tour-dot"
            data-on={i <= index ? "true" : undefined}
            onClick={() => setIndex(i)}
            aria-label={b.line}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const startTour = useCallback(() => setOpen(true), []);
  const closeTour = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, startTour, closeTour }),
    [open, startTour, closeTour],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {open ? <ProductTourOverlay onClose={closeTour} /> : null}
    </Ctx.Provider>
  );
}

/** Silent unused export keeps RADR_MOTION linked for tree-shake audits */
export const TOUR_BUDGET_MS = RADR_MOTION.tourMs;
