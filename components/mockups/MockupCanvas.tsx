"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const MOCKUP_W = 3840;
export const MOCKUP_H = 2160;

type Props = {
  children: ReactNode;
  /** Stable id for export targeting */
  id: string;
  className?: string;
};

/**
 * Fixed 3840×2160 presentation canvas.
 * Scales responsively in the browser; internal layout stays native 4K.
 */
export function MockupCanvas({ children, id, className = "" }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const { width, height } = stage.getBoundingClientRect();
    const next = Math.min(width / MOCKUP_W, height / MOCKUP_H);
    setScale(Number.isFinite(next) && next > 0 ? next : 1);
  }, []);

  useEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="mk-stage" ref={stageRef}>
      <div
        className={`mk-canvas radr ${className}`.trim()}
        data-mockup={id}
        data-export-root="true"
        style={{
          width: MOCKUP_W,
          height: MOCKUP_H,
          transform: `scale(${scale})`,
        }}
      >
        <div className="mk-grid" aria-hidden="true" />
        <div className="mk-vignette" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
