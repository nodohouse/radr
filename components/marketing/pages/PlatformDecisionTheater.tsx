"use client";

/**
 * Flagship Platform — one Decision persists through every stage.
 * Vertical switch proves: different operations, same RADR engine.
 * Scroll may update stage. Click may update stage. Visitor can scroll past.
 * No scroll capture. Runway capped (~180vh).
 */

import { useEffect, useRef, useState } from "react";
import { EconomicRail } from "@/components/marketing/kinetic/EconomicRail";
import { HospitalityContextSwitch } from "@/components/marketing/kinetic/HospitalityContextSwitch";
import { HOME_RAIL } from "@/lib/marketing/economicRail";
import {
  decisionForVertical,
  platformEconomics,
  platformSceneFor,
  type HospitalityVertical,
} from "@/lib/marketing/hospitalityContext";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import "@/app/kinetic.css";

const LIFE = [
  "Detected",
  "Understood",
  "Futures",
  "Recommended",
  "Approved",
  "Observed",
  "Verified",
  "Learned",
] as const;

type Life = (typeof LIFE)[number];

export function PlatformDecisionTheater() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<HospitalityVertical>("restaurant");
  const [life, setLife] = useState(0);
  const [future, setFuture] = useState(1);
  const [trust, setTrust] = useState(1);

  const decision = decisionForVertical(vertical);
  const econ = platformEconomics(decision);
  const scene = platformSceneFor(vertical);
  const stage = LIFE[life]!;
  const sealed = life >= 6;

  const chipByStage: Record<Life, { euro: string; grade: string }> = {
    Detected: { euro: econ.primaryEuro, grade: econ.primaryGrade },
    Understood: { euro: econ.primaryEuro, grade: econ.primaryGrade },
    Futures: { euro: econ.expected, grade: "PATHS OPEN" },
    Recommended: { euro: econ.expected, grade: "EXPECTED" },
    Approved: { euro: econ.expected, grade: "PREPARED" },
    Observed: { euro: econ.observed, grade: "OBSERVED" },
    Verified: { euro: econ.verified, grade: "VERIFIED" },
    Learned: { euro: econ.verified, grade: "IN MEMORY" },
  };
  const chip = chipByStage[stage];

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(LIFE.length - 1, Math.floor(p * LIFE.length));
      setLife((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  useEffect(() => {
    setFuture(scene.futures.findIndex((f) => f.rec));
    setLife(0);
  }, [vertical]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage === "Futures" || stage === "Recommended") {
      const rec = scene.futures.findIndex((f) => f.rec);
      if (rec >= 0) setFuture(rec);
    }
  }, [stage, scene.futures]);

  const scrollToStage = (i: number) => {
    setLife(i);
    const el = rootRef.current;
    if (!el || reduced) return;
    const total = el.offsetHeight - window.innerHeight;
    const y =
      el.getBoundingClientRect().top +
      window.scrollY +
      (i / LIFE.length) * total +
      4;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="rx-pdt">
      <EconomicRail
        items={HOME_RAIL.filter((x) =>
          ["peak", "premium", "orphan", "d4102", "verified"].includes(x.id),
        )}
        durationSec={44}
        variant="compact"
        ariaLabel="Platform economic signals"
      />

      <div
        ref={rootRef}
        className="rx-pdt-runway"
        style={reduced ? { minHeight: "auto" } : { minHeight: "180vh" }}
      >
        <div className="rx-pdt-pin">
          <div className="rx-shell">
            <header className="rx-pdt-head">
              <p className="rx-rec-k">One Decision · same engine</p>
              <h2 className="rx-rec-h">Different operations. Same RADR.</h2>
              <HospitalityContextSwitch
                value={vertical}
                onChange={setVertical}
                size="compact"
                ariaLabel="Platform hospitality environment"
              />
            </header>

            <div
              className="rx-pdt-scrub"
              role="tablist"
              aria-label="Decision lifecycle"
            >
              {LIFE.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={life === i}
                  data-on={life === i ? "true" : undefined}
                  data-done={i < life ? "true" : undefined}
                  onClick={() => scrollToStage(i)}
                >
                  {s}
                </button>
              ))}
            </div>

            <article
              className="rx-pdt-object"
              data-stage={stage}
              data-sealed={sealed ? "true" : undefined}
              data-vertical={vertical}
            >
              <header className="rx-pdt-object-head">
                <div>
                  <em>
                    {econ.id} · {econ.property} · {econ.verticalLabel} · DEMO
                  </em>
                  <h3>{scene.heads[stage]}</h3>
                </div>
                <div
                  className="rx-euro-chip"
                  data-sealed={sealed ? "true" : undefined}
                  key={`${vertical}-${stage}-${chip.euro}`}
                >
                  <strong>{chip.euro}</strong>
                  <em>{chip.grade}</em>
                </div>
              </header>

              <StageBody
                stage={stage}
                scene={scene}
                econ={econ}
                future={future}
                setFuture={setFuture}
                trust={trust}
                setTrust={setTrust}
              />
            </article>

            <p className="rx-pdt-skip">
              <button type="button" onClick={() => scrollToStage(LIFE.length - 1)}>
                Skip to verified
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageBody({
  stage,
  scene,
  econ,
  future,
  setFuture,
  trust,
  setTrust,
}: {
  stage: Life;
  scene: ReturnType<typeof platformSceneFor>;
  econ: ReturnType<typeof platformEconomics>;
  future: number;
  setFuture: (n: number) => void;
  trust: number;
  setTrust: (n: number) => void;
}) {
  if (stage === "Detected") {
    return (
      <div className="rx-pdt-stage">
        <ul className="rx-pdt-signals">
          {scene.signals.map((s) => (
            <li key={s.k}>
              <em>{s.k}</em>
              <strong>{s.v}</strong>
              <span>{s.note}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (stage === "Understood") {
    return (
      <div className="rx-pdt-stage">
        <div className="rx-pdt-graph" aria-hidden="true">
          {scene.understand.nodes.flatMap((n, i) => {
            const node = (
              <span
                key={n}
                data-hot={n === scene.understand.hot ? "true" : undefined}
              >
                {n}
              </span>
            );
            if (i >= scene.understand.nodes.length - 1) return [node];
            return [node, <i key={`${n}-sep`} />];
          })}
        </div>
        <p className="rx-pdt-note">{scene.understand.line}</p>
      </div>
    );
  }

  if (stage === "Futures" || stage === "Recommended") {
    return (
      <div className="rx-pdt-stage">
        <div className="rx-pdt-futures">
          {scene.futures.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className="rx-pdt-future"
              data-on={future === i ? "true" : undefined}
              data-rec={f.rec && stage === "Recommended" ? "true" : undefined}
              data-dim={
                stage === "Recommended" && !f.rec ? "true" : undefined
              }
              onClick={() => setFuture(i)}
              onMouseEnter={() => setFuture(i)}
            >
              <strong>{f.title}</strong>
              <em>{f.euro}</em>
              <span>{f.note}</span>
              {f.rec ? <i>REC</i> : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "Approved") {
    return (
      <div className="rx-pdt-stage">
        <ul className="rx-pdt-actions">
          {scene.actions.map((a) => (
            <li key={a.em}>
              <em>{a.em}</em>
              <strong>{a.strong}</strong>
            </li>
          ))}
        </ul>
        <div className="rx-pdt-floor-proj" style={{ marginTop: "1rem" }}>
          {scene.roles.map((r) => (
            <div key={r.em} data-hot={r.hot ? "true" : undefined}>
              <em>{r.em}</em>
              <strong>{r.strong}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "Observed") {
    return (
      <div className="rx-pdt-stage">
        <div className="rx-pdt-overlay">
          <div>
            <em>Expected</em>
            <strong>{econ.expected}</strong>
          </div>
          <div data-hot="true">
            <em>Observed</em>
            <strong>{econ.observed}</strong>
          </div>
        </div>
        <p className="rx-pdt-note">{econ.variance}</p>
      </div>
    );
  }

  if (stage === "Verified") {
    return (
      <div className="rx-pdt-stage">
        <ol className="rx-pdt-value">
          {(
            ["Exposure", "Expected", "Observed", "Attributed", "Verified"] as const
          ).map((v, i) => (
            <li
              key={v}
              data-on={i === 4 ? "true" : undefined}
              data-done={i < 4 ? "true" : undefined}
            >
              {v}
            </li>
          ))}
        </ol>
        <div className="rx-euro-chip" data-sealed="true">
          <strong>{econ.verified}</strong>
          <em>
            {econ.id} · {econ.variance}
          </em>
        </div>
      </div>
    );
  }

  return (
    <div className="rx-pdt-stage">
      <div className="rx-pdt-memory-stats">
        <div>
          <strong>18</strong>
          <span>similar cases</span>
        </div>
        <div>
          <strong>12</strong>
          <span>path held</span>
        </div>
        <div data-hot>
          <strong>v3</strong>
          <span>playbook</span>
        </div>
      </div>
      <div className="rx-psig-trust-row">
        {(["Suggest", "Stage", "Auto within policy"] as const).map((label, i) => (
          <span
            key={label}
            data-on={trust === i ? "true" : undefined}
            role="button"
            tabIndex={0}
            onClick={() => setTrust(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTrust(i);
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
