"use client";

/**
 * Flagship Platform — one Decision (D-1911) persists through every stage.
 * Signal → Understanding → Futures → Recommend → Approve → Floor → Observe → Verify → Memory.
 */

import { useEffect, useRef, useState } from "react";
import { EconomicRail } from "@/components/marketing/kinetic/EconomicRail";
import { HOME_RAIL } from "@/lib/marketing/economicRail";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import "@/app/kinetic.css";

const LIFE = [
  "Detected",
  "Understood",
  "Futures",
  "Recommended",
  "Approved",
  "Floor",
  "Observed",
  "Verified",
  "Learned",
] as const;

type Life = (typeof LIFE)[number];

const DEC = {
  id: "D-1911",
  property: "Berlin Mitte",
  title: "Peak capacity collision",
  exposure: "€620",
  expected: "€620",
  observed: "€590",
  verified: "€590",
  variance: "−€30 · −4.8%",
} as const;

const SIGNALS = [
  { k: "Floor occ.", v: "78%", note: "walk-ins waiting" },
  { k: "Kitchen", v: "92%", note: "KDS pressure" },
  { k: "Inbound", v: "38", note: "covers" },
  { k: "Delivery", v: "Open", note: "throttle candidate" },
  { k: "Tables free", v: "2", note: "not free capacity" },
  { k: "Deadline", v: "18:53", note: "decision window" },
] as const;

const FUTURES = [
  {
    id: "seat",
    title: "Seat now",
    euro: "€0",
    note: "Fills fast · burns second turn",
    rec: false,
  },
  {
    id: "wait",
    title: "Wait 12 minutes",
    euro: "€620",
    note: "Protect contribution · reversible",
    rec: true,
  },
  {
    id: "hard",
    title: "Hard stop",
    euro: "€180",
    note: "Safer · leaves money on table",
    rec: false,
  },
] as const;

const EURO_BY_STAGE: Record<Life, { euro: string; grade: string }> = {
  Detected: { euro: DEC.exposure, grade: "EXPOSED" },
  Understood: { euro: DEC.exposure, grade: "EXPOSED" },
  Futures: { euro: DEC.expected, grade: "PATHS OPEN" },
  Recommended: { euro: DEC.expected, grade: "EXPECTED" },
  Approved: { euro: DEC.expected, grade: "PREPARED" },
  Floor: { euro: DEC.expected, grade: "IN SERVICE" },
  Observed: { euro: DEC.observed, grade: "OBSERVED" },
  Verified: { euro: DEC.verified, grade: "VERIFIED" },
  Learned: { euro: DEC.verified, grade: "IN MEMORY" },
};

const HEAD_BY_STAGE: Record<Life, string> = {
  Detected: "Signals converging",
  Understood: "Empty tables ≠ capacity",
  Futures: "Three paths",
  Recommended: "Wait 12 minutes",
  Approved: "Prepared for the floor",
  Floor: "FOH · hold T12 · VIP inbound",
  Observed: "€590 observed",
  Verified: "€590 protected",
  Learned: "Playbook joins D-1911",
};

export function PlatformDecisionTheater() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [life, setLife] = useState(0);
  const [future, setFuture] = useState(1);
  const [trust, setTrust] = useState(1);
  const stage = LIFE[life]!;
  const sealed = life >= 7;
  const chip = EURO_BY_STAGE[stage];

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
    if (stage === "Futures" || stage === "Recommended") setFuture(1);
  }, [stage]);

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
          ["d4102", "settle", "room", "verified"].includes(x.id),
        )}
        durationSec={44}
        variant="compact"
        ariaLabel="Platform economic signals"
      />

      <div
        ref={rootRef}
        className="rx-pdt-runway"
        style={reduced ? { minHeight: "auto" } : { minHeight: "560vh" }}
      >
        <div className="rx-pdt-pin">
          <div className="rx-shell">
            <header className="rx-pdt-head">
              <p className="rx-rec-k">One Decision · {DEC.id}</p>
              <h2 className="rx-rec-h">Same object. Every stage.</h2>
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
            >
              <header className="rx-pdt-object-head">
                <div>
                  <em>
                    {DEC.id} · {DEC.property} · Restaurant · DEMO
                  </em>
                  <h3>{HEAD_BY_STAGE[stage]}</h3>
                </div>
                <div
                  className="rx-euro-chip"
                  data-sealed={sealed ? "true" : undefined}
                  key={`${stage}-${chip.euro}`}
                >
                  <strong>{chip.euro}</strong>
                  <em>{chip.grade}</em>
                </div>
              </header>

              <StageBody
                stage={stage}
                future={future}
                setFuture={setFuture}
                trust={trust}
                setTrust={setTrust}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageBody({
  stage,
  future,
  setFuture,
  trust,
  setTrust,
}: {
  stage: Life;
  future: number;
  setFuture: (n: number) => void;
  trust: number;
  setTrust: (n: number) => void;
}) {
  if (stage === "Detected") {
    return (
      <div className="rx-pdt-stage">
        <ul className="rx-pdt-signals">
          {SIGNALS.map((s) => (
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
          <span>Reservations</span>
          <i />
          <span>KDS</span>
          <i />
          <span>Delivery</span>
          <i />
          <span>Menu econ</span>
          <i />
          <span data-hot="true">Table turns</span>
        </div>
      </div>
    );
  }

  if (stage === "Futures" || stage === "Recommended") {
    return (
      <div className="rx-pdt-stage">
        <div className="rx-pdt-futures">
          {FUTURES.map((f, i) => (
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
          <li>
            <em>Floor</em>
            <strong>Hold 2 tables · 12 minutes</strong>
          </li>
          <li>
            <em>Delivery</em>
            <strong>Throttle until 18:54</strong>
          </li>
          <li>
            <em>Menu</em>
            <strong>Feature fast dish</strong>
          </li>
        </ul>
      </div>
    );
  }

  if (stage === "Floor") {
    return (
      <div className="rx-pdt-stage">
        <div className="rx-pdt-floor-proj">
          <div>
            <em>GM</em>
            <strong>Wait 12 · €620 at stake</strong>
          </div>
          <div data-hot="true">
            <em>FOH</em>
            <strong>Hold T12 · VIP 18:50 · allergy note</strong>
          </div>
          <div>
            <em>Kitchen</em>
            <strong>Cold station 92% · feature fast dish</strong>
          </div>
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
            <strong>{DEC.expected}</strong>
          </div>
          <div data-hot="true">
            <em>Observed</em>
            <strong>{DEC.observed}</strong>
          </div>
        </div>
        <p className="rx-pdt-note">{DEC.variance}</p>
      </div>
    );
  }

  if (stage === "Verified") {
    return (
      <div className="rx-pdt-stage">
        <ol className="rx-pdt-value">
          {(["Exposure", "Expected", "Observed", "Attributed", "Verified"] as const).map(
            (v, i) => (
              <li
                key={v}
                data-on={i === 4 ? "true" : undefined}
                data-done={i < 4 ? "true" : undefined}
              >
                {v}
              </li>
            ),
          )}
        </ol>
        <div className="rx-euro-chip" data-sealed="true">
          <strong>{DEC.verified}</strong>
          <em>Protected · {DEC.id}</em>
        </div>
      </div>
    );
  }

  return (
    <div className="rx-pdt-stage">
      <div className="rx-pdt-memory-stats">
        <div>
          <strong>18</strong>
          <span>similar nights</span>
        </div>
        <div>
          <strong>12</strong>
          <span>wait held</span>
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
