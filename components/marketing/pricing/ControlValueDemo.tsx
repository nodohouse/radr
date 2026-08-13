"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { controlDemos, pricingConfig, type DemoId } from "./config";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";

type Phase = "ready" | "exit" | "in";

export function ControlValueDemo() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<DemoId>("delivery");
  const [phase, setPhase] = useState<Phase>("ready");
  const timers = useRef<number[]>([]);
  const demo = controlDemos.find((d) => d.id === active)!;

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clear(), [clear]);

  function select(id: DemoId) {
    if (id === active && phase === "ready") return;
    clear();
    if (reduced) {
      setActive(id);
      setPhase("ready");
      return;
    }
    setPhase("exit");
    timers.current.push(
      window.setTimeout(() => {
        setActive(id);
        setPhase("in");
      }, 120),
      window.setTimeout(() => setPhase("ready"), 280),
    );
  }

  return (
    <section className="px-value" id="control-value">
      <div className="prep-shell px-value-layout">
        <div>
          <p className="prep-kicker">Control</p>
          <h2 className="px-section-title">
            What does {pricingConfig.control.priceLabel}
            <br />
            actually do?
          </h2>
          <p className="prep-lead">
            Click a check. RADR rearranges the same surface — evidence first,
            money last.
          </p>
          <div className="px-value-tabs" role="tablist" aria-label="Control examples">
            {controlDemos.map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={active === d.id}
                className="px-value-tab"
                data-active={active === d.id ? "true" : "false"}
                onClick={() => select(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="prep-panel px-value-panel"
          data-ready="true"
          data-flagged="true"
          data-phase={phase}
          role="tabpanel"
          aria-label={demo.label}
        >
          <div className="prep-panel-head">
            <span className="prep-panel-brand">RADR</span>
            <span className="prep-chip-status">
              {demo.status === "Building" ? "Building" : "Requires review"}
            </span>
          </div>
          <p className="ask-context">{demo.context}</p>
          {demo.punch ? <p className="px-value-punch">{demo.punch}</p> : null}
          <div className="prep-qty">
            {demo.rows.map((row) => (
              <div
                key={row.label}
                className="prep-qty-row"
                data-on="true"
                data-signal={row.signal ? "true" : "false"}
              >
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="prep-rule" />
          <div className="prep-outcome" data-on="true">
            <p className="prep-outcome-label">{demo.outcome.label}</p>
            <p className="prep-outcome-value">{demo.outcome.value}</p>
            <p className="prep-outcome-sub">{demo.outcome.sub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
