"use client";

/**
 * Recover → Prevent → Optimize → Autopilot
 * Scroll-linked: same leak object evolves.
 */

import { useEffect, useRef, useState } from "react";
import { PROGRESSION, type ProgressionStage } from "@/lib/radr/problemFamilies";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  titles: Record<ProgressionStage, string>;
  bodies: Record<ProgressionStage, string>;
};

const SCENE: Record<
  ProgressionStage,
  { badge: string; euro: string; grade: string; lines: string[] }
> = {
  RECOVER: {
    badge: "Leak already happened",
    euro: "€273",
    grade: "exposed",
    lines: ["Invoice above contract", "Credit never applied", "Value sits in AP"],
  },
  PREVENT: {
    badge: "Same pattern · earlier",
    euro: "€273",
    grade: "at risk",
    lines: [
      "Precursor: UOM drift on last 2 invoices",
      "RADR surfaces before pay-run",
      "Dispute window still open",
    ],
  },
  OPTIMIZE: {
    badge: "Compare Futures",
    euro: "€273",
    grade: "Expected",
    lines: ["Dispute", "Absorb", "Renegotiate", "One path recommended"],
  },
  AUTOPILOT: {
    badge: "Trusted within policy",
    euro: "€273",
    grade: "auto-stage",
    lines: [
      "Suggest → Stage → Auto within policy",
      "Material send still asks",
      "Trust can be revoked",
    ],
  },
};

export function ProgressionLadder({
  kicker,
  title,
  lead,
  titles,
  bodies,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ProgressionStage>("RECOVER");
  const idx = PROGRESSION.findIndex((p) => p.stage === active);
  const scene = SCENE[active];

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight * 0.4;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(
        PROGRESSION.length - 1,
        Math.floor(p * PROGRESSION.length),
      );
      const stage = PROGRESSION[next]!.stage;
      setActive((prev) => (prev === stage ? prev : stage));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="rx-prog rx-prog-evolving"
      style={reduced ? undefined : { minHeight: "160vh" }}
    >
      <div className="rx-prog-pin">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
        {lead ? <p className="rx-rec-p">{lead}</p> : null}

        <div className="rx-prog-track" role="tablist" aria-label="Progression">
          {PROGRESSION.map((step, i) => (
            <button
              key={step.stage}
              type="button"
              role="tab"
              aria-selected={active === step.stage}
              data-on={active === step.stage ? "true" : undefined}
              data-past={i < idx ? "true" : undefined}
              className="rx-prog-step"
              onClick={() => setActive(step.stage)}
            >
              <em>{titles[step.stage]}</em>
            </button>
          ))}
        </div>

        <div className="rx-prog-scene" data-stage={active} aria-hidden="true">
          <div className="rx-prog-scene-obj">
            <span>{scene.badge}</span>
            <div
              className="rx-euro-chip"
              data-sealed={active === "AUTOPILOT" ? "true" : undefined}
            >
              <strong>{scene.euro}</strong>
              <em>{scene.grade}</em>
            </div>
          </div>
          <div className="rx-prog-scene-chips">
            {scene.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          {active === "OPTIMIZE" ? (
            <div className="rx-prog-forks" style={{ display: "flex" }}>
              <i />
              <i data-rec="true" />
              <i />
            </div>
          ) : null}
          {active === "AUTOPILOT" ? (
            <div className="rx-prog-auto" style={{ display: "flex" }}>
              <span>Suggest</span>
              <span data-on="true">Stage</span>
              <span data-on="true">Auto within policy</span>
            </div>
          ) : null}
        </div>

        <article className="rx-prog-panel" data-stage={active}>
          <h3>{titles[active]}</h3>
          <p>{bodies[active]}</p>
        </article>
      </div>
    </div>
  );
}
