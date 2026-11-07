"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CAPTURE_SIGNALS, type CapturedSignal } from "./captureSignals";

type Face = "front" | "back" | "turning";
type Card = CapturedSignal & { left: number; top: number; slot: string };
type Rect = { left: number; top: number; right: number; bottom: number };

function intersects(a: Rect, b: Rect, gap = 12) {
  return (
    a.left < b.right + gap &&
    a.right > b.left - gap &&
    a.top < b.bottom + gap &&
    a.bottom > b.top - gap
  );
}

/** Pick a free corner, never a random coordinate over text or product controls. */
function placeCard(
  stage: HTMLElement,
  face: Face,
  previous: string,
): Pick<Card, "left" | "top" | "slot"> | null {
  const device = stage.querySelector(`.rsc-face-${face} .rsc-tablet`);
  if (!device) return null;
  const bounds = device.getBoundingClientRect();
  const origin = stage.getBoundingClientRect();
  const screen =
    device.querySelector(".rsc-screen")?.getBoundingClientRect() || bounds;
  const small = innerWidth <= 720;
  const width = small ? 190 : 224;
  const height = small ? 76 : 88;
  const protectedRects = Array.from(
    document.querySelectorAll(
      ".rm-hero-copy, .rx-nav, .rm-loop, .rsc-full-demo, .rsc-reduced-switch",
    ),
  ).map((node) => node.getBoundingClientRect());
  const candidates = [
    { slot: "top-left", left: bounds.left + 24, top: screen.top - height - 8 },
    {
      slot: "top-right",
      left: bounds.right - width - 24,
      top: screen.top - height - 8,
    },
    { slot: "bottom-left", left: bounds.left + 20, top: bounds.bottom + 18 },
    {
      slot: "bottom-right",
      left: bounds.right - width - 20,
      top: bounds.bottom + 18,
    },
    {
      slot: "left",
      left: bounds.left - width - 18,
      top: bounds.top + bounds.height * 0.55,
    },
    {
      slot: "right",
      left: bounds.right + 18,
      top: bounds.top + bounds.height * 0.3,
    },
  ]
    .map((candidate) => ({
      ...candidate,
      left: Math.min(innerWidth - width - 18, Math.max(18, candidate.left)),
    }))
    .filter((candidate) => {
      const rect = {
        ...candidate,
        right: candidate.left + width,
        bottom: candidate.top + height,
      };
      // Keep card text outside the screen, with room for the gentle tablet motion.
      return (
        !intersects(rect, screen, 6) &&
        !protectedRects.some((r) => intersects(rect, r)) &&
        candidate.top >= 12 &&
        rect.bottom <= innerHeight - 12
      );
    });
  const fresh = candidates.filter((candidate) => candidate.slot !== previous);
  const choices = fresh.length ? fresh : candidates;
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  return chosen
    ? {
        left: chosen.left - origin.left,
        top: chosen.top - origin.top,
        slot: chosen.slot,
      }
    : null;
}

export function CaptureInsights({
  capture,
  moving,
  reduced,
  face,
}: {
  capture: CapturedSignal | null;
  moving: boolean;
  reduced: boolean;
  face: Face;
}) {
  const root = useRef<HTMLDivElement>(null);
  const seen = useRef("");
  const previousSlot = useRef("");
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    const key = capture ? `${capture.index}-${capture.cycle}` : "";
    setCard(null);
    if (!key || seen.current === key) return;
    seen.current = key;
    if (!moving || reduced || face === "turning") return;
    const stage = root.current?.parentElement;
    if (!stage) return;
    const position = placeCard(stage, face, previousSlot.current);
    if (!position) return;
    previousSlot.current = position.slot;
    setCard({ ...capture!, ...position });
    const timer = window.setTimeout(() => setCard(null), 2400);
    return () => clearTimeout(timer);
  }, [capture, moving, reduced, face]);

  // Resizing can invalidate a formerly safe corner. Fade it out and await the next catch.
  useEffect(() => {
    const clear = () => setCard(null);
    window.addEventListener("resize", clear);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear);
    };
  }, []);

  const signal = card ? CAPTURE_SIGNALS[card.index] : null;
  const allergy = CAPTURE_SIGNALS.find((signal) => signal.id === "allergy")!;
  return (
    <div
      ref={root}
      className="rsc-capture-layer"
      aria-hidden="true"
      data-nosnippet=""
      data-running={moving && !reduced}
    >
      {reduced && face === "front" && (
        <div className="rsc-operation-peek rsc-capture-static">
          <span>
            <i />
            Guest note · {allergy.source}
          </span>
          <strong>{allergy.title}</strong>
          <small>{allergy.detail}</small>
        </div>
      )}
      <AnimatePresence mode="wait">
        {card && signal && (
          <motion.div
            key={`${card.index}-${card.cycle}`}
            className="rsc-operation-peek rsc-capture-card"
            data-signal={signal.id}
            data-slot={card.slot}
            style={{ left: card.left, top: card.top }}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>
              <i>
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="m2.5 6 2.2 2.2 4.8-4.7" />
                </svg>
              </i>
              Caught · {signal.source}
            </span>
            <strong>{signal.title}</strong>
            <small>{signal.detail}</small>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
