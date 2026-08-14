"use client";

import { useEffect, useState } from "react";
import { SIGNALS } from "@/components/marketing/data/demo";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

/** Subtle rotating finding for auth left panel — one active at a time. */
export function AuthSignalPreview() {
  const reduced = useReducedMotionSafe();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SIGNALS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduced]);

  const signal = SIGNALS[index]!;

  return (
    <div className="rx-auth-preview" aria-hidden="true">
      <p className="rx-auth-preview-scan">
        <span className="rx-live-dot" /> Scanning operation…
      </p>
      <article className="rx-auth-preview-card" key={signal.id}>
        <p className="rx-auth-preview-ch">{signal.channelLabel}</p>
        <p className="rx-auth-preview-amt">
          <span className="rx-tri">△</span> {signal.amount}
          {signal.period}
        </p>
        <p className="rx-auth-preview-title">{signal.title}</p>
      </article>
    </div>
  );
}
