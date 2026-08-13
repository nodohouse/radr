"use client";

import { useEffect, useState } from "react";
import { useInView } from "../motion/useInView";

const TARGET = 4_284_620;

function format(n: number) {
  return `€${Math.round(n).toLocaleString("en-IE")}`;
}

export function SectionVerifiedValue() {
  const { ref, inView, reduced } = useInView<HTMLElement>({ threshold: 0.35 });
  const [value, setValue] = useState(reduced ? TARGET : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(TARGET);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 2200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(TARGET * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  return (
    <section
      className="radr-verified"
      id="group"
      ref={ref}
      data-nav-theme="dark"
    >
      <div className="radr-shell radr-verified-inner">
        <p className="radr-cat">Small deltas. Serious money.</p>
        <p className="radr-verified-num radr-money">{format(value)}</p>
        <p className="radr-verified-label">
          <span className="radr-tri">△</span> Verified value
        </p>
        <p className="radr-verified-note">Illustrative demo · not a customer claim</p>
      </div>
    </section>
  );
}
