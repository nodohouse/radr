"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveV2Persona, LiveV2ZoneId } from "./liveV2Data";

type Props = {
  persona: LiveV2Persona;
  selectedId: LiveV2ZoneId | null;
  animState: string;
  renderCount: number;
};

export function PerfHud({
  persona,
  selectedId,
  animState,
  renderCount,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    setMounted(true);
    last.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      frames.current += 1;
      if (now - last.current >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)));
        frames.current = 0;
        last.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (process.env.NODE_ENV === "production" || !mounted) return null;

  return (
    <div className="lv2-perf" data-warn={fps > 0 && fps < 50 ? "true" : undefined}>
      <div>FPS {fps || "—"}</div>
      <div>renders {renderCount}</div>
      <div>persona {persona.toUpperCase()}</div>
      <div>zone {selectedId ?? "—"}</div>
      <div>anim {animState}</div>
    </div>
  );
}
