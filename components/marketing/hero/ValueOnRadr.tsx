"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { animate, useMotionValue } from "motion/react";
import { RadrWordmark } from "@/components/radr/RadrWordmark";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";
import { TextSep } from "@/components/TextSep";

const fmt = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export type ValueOnRadrHandle = {
  pulseCapture: (euro: number) => void;
  clearFlash: () => void;
};

/**
 * VALUE ON RADR: text updated via refs (no React commit per tick / flash).
 */
export const ValueOnRadr = forwardRef<
  ValueOnRadrHandle,
  { value: number }
>(function ValueOnRadr({ value }, ref) {
  const display = useMotionValue(value);
  const numRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeFlashRef = useRef<HTMLParagraphElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      pulseCapture: (euro: number) => {
        if (badgeRef.current) {
          badgeRef.current.textContent = `€${euro.toLocaleString("en-IE")}`;
        }
        rootRef.current?.setAttribute("data-flash", "true");
        badgeFlashRef.current?.setAttribute("data-flash", "true");
      },
      clearFlash: () => {
        rootRef.current?.setAttribute("data-flash", "false");
        badgeFlashRef.current?.setAttribute("data-flash", "false");
      },
    }),
    [],
  );

  useEffect(() => {
    if (numRef.current) numRef.current.textContent = fmt.format(value);
  }, []);

  useEffect(() => {
    let lastWrite = 0;
    const from = display.get();
    const controls = animate(from, value, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        display.set(v);
        const now = performance.now();
        if (now - lastWrite < 70 && v !== value) return;
        lastWrite = now;
        if (numRef.current) numRef.current.textContent = fmt.format(v);
      },
      onComplete: () => {
        if (numRef.current) numRef.current.textContent = fmt.format(value);
      },
    });
    return () => controls.stop();
  }, [value, display]);

  return (
    <div ref={rootRef} className="rx-value" data-flash="false">
      <div className="rx-value-aura" aria-hidden="true" />
      <p className="rx-value-kicker">
        <span className="rx-value-kicker-label">Value on</span>
        <RadrWordmark variant="luminous" size="md" className="rx-value-wm" />
      </p>
      <p className="rx-value-main">
        <span className="rx-value-main-num" ref={numRef} />
      </p>
      <p
        className="rx-value-badge"
        data-flash="false"
        ref={badgeFlashRef}
      >
        <span className="rx-value-badge-mark" aria-hidden="true">
          <RadrDeltaGlyph />
        </span>
        <span className="rx-value-badge-amt" ref={badgeRef}>
          €332
        </span>
      </p>
      <p className="rx-value-sub">
        <span>€684k identified</span>
        <TextSep />
        <span>€58.9k verified</span>
      </p>
    </div>
  );
});
