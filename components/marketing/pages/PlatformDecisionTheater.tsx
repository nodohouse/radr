"use client";

/**
 * Flagship Platform experience — one Decision object evolves through stages.
 * Sticky + scrubber. Motion = causality only.
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
  "Observed",
  "Verified",
  "Learned",
] as const;

type Life = (typeof LIFE)[number];

const SIGNALS = [
  { k: "Occupancy", v: "89%", note: "event weekend" },
  { k: "OTA", v: "+11 pts", note: "channel mix" },
  { k: "Premium open", v: "4", note: "keys" },
  { k: "Direct pickup", v: "Ahead", note: "vs OTA" },
  { k: "Hist. fill", v: "73%", note: "direct" },
  { k: "Housekeeping", v: "Ready", note: "premium" },
] as const;

const FUTURES = [
  {
    id: "ota",
    title: "Open to OTA",
    euro: "€412",
    note: "Higher occupancy · weaker contribution",
    rec: false,
  },
  {
    id: "hold",
    title: "Hold direct",
    euro: "€620",
    note: "Protect premium · reversible",
    rec: true,
  },
  {
    id: "mix",
    title: "Mixed release",
    euro: "€480",
    note: "Partial OTA · residual direct risk",
    rec: false,
  },
] as const;

const VALUE = [
  "Identified",
  "Expected",
  "Observed",
  "Attributed",
  "Verified",
] as const;

const MEMORY = [
  "Fri 18:42",
  "Fri 18:47",
  "Sat 19:02",
  "Thu 19:11",
  "Fri 18:39",
] as const;

export function PlatformDecisionTheater() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [life, setLife] = useState(0);
  const [future, setFuture] = useState(1);
  const [trust, setTrust] = useState(1);
  const [revoked, setRevoked] = useState(false);
  const stage = LIFE[life]!;
  const sealed = life >= 6;

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
        style={reduced ? { minHeight: "auto" } : { minHeight: "520vh" }}
      >
        <div className="rx-pdt-pin">
          <div className="rx-shell">
            <header className="rx-pdt-head">
              <p className="rx-rec-k">One Decision</p>
              <h2 className="rx-rec-h">
                From first signal to lasting memory.
              </h2>
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
                  <em>D-2201 · Berlin Canal · Hotel</em>
                  <h3>
                    {stage === "Detected"
                      ? "Signals converging"
                      : stage === "Understood"
                        ? "Relationship forms"
                        : stage === "Futures"
                          ? "Paths diverge"
                          : stage === "Recommended"
                            ? "Hold direct"
                            : stage === "Approved"
                              ? "Prepared for the block"
                              : stage === "Observed"
                                ? "Actual overlays Expected"
                                : stage === "Verified"
                                  ? "€620 Verified"
                                  : "Playbook learns"}
                  </h3>
                </div>
                <div
                  className="rx-euro-chip"
                  data-sealed={sealed ? "true" : undefined}
                >
                  <strong>{sealed ? "€620" : "€620"}</strong>
                  <em>{sealed ? "Verified" : "Expected"}</em>
                </div>
              </header>

              <StageBody
                stage={stage}
                future={future}
                setFuture={setFuture}
                trust={trust}
                setTrust={setTrust}
                revoked={revoked}
                setRevoked={setRevoked}
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
  revoked,
  setRevoked,
}: {
  stage: Life;
  future: number;
  setFuture: (n: number) => void;
  trust: number;
  setTrust: (n: number) => void;
  revoked: boolean;
  setRevoked: (v: boolean) => void;
}) {
  if (stage === "Detected") {
    return (
      <div className="rx-pdt-stage">
        <p className="rx-pdt-stage-k">Raw signals · Decision not formed</p>
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
        <p className="rx-pdt-stage-k">Connections form</p>
        <div className="rx-pdt-graph" aria-hidden="true">
          <span>Premium inventory</span>
          <i />
          <span>Channel economics</span>
          <i />
          <span>Pickup</span>
          <i />
          <span>Housekeeping</span>
          <i />
          <span data-hot="true">Event demand</span>
        </div>
        <p className="rx-pdt-note">
          Occupancy looks healthy. Contribution path does not.
        </p>
      </div>
    );
  }

  if (stage === "Futures" || stage === "Recommended") {
    return (
      <div className="rx-pdt-stage">
        <p className="rx-pdt-stage-k">
          {stage === "Futures"
            ? "Same baseline · different paths"
            : "RADR default highlighted"}
        </p>
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
        {stage === "Recommended" ? (
          <p className="rx-pdt-note">
            Expected €620 · range €480–€690 · uncertainty: direct fill timing.
          </p>
        ) : null}
      </div>
    );
  }

  if (stage === "Approved") {
    return (
      <div className="rx-pdt-stage">
        <p className="rx-pdt-stage-k">Prepared actions attached</p>
        <ul className="rx-pdt-actions">
          <li>
            <em>Channel</em>
            <strong>Hold 4 premium · direct path</strong>
          </li>
          <li>
            <em>Housekeeping</em>
            <strong>Priority ready by 15:00</strong>
          </li>
          <li>
            <em>Revenue</em>
            <strong>Suppress OTA release for block</strong>
          </li>
        </ul>
      </div>
    );
  }

  if (stage === "Observed") {
    return (
      <div className="rx-pdt-stage">
        <p className="rx-pdt-stage-k">Actual overlays Expected</p>
        <div className="rx-pdt-overlay">
          <div>
            <em>Expected</em>
            <strong>€620</strong>
          </div>
          <div data-hot="true">
            <em>Observed</em>
            <strong>€598</strong>
          </div>
        </div>
        <p className="rx-pdt-note">
          3 of 4 premium filled direct · 1 late walk-in at negotiated rate.
        </p>
      </div>
    );
  }

  if (stage === "Verified") {
    return (
      <div className="rx-pdt-stage">
        <p className="rx-pdt-stage-k">Follow the euro home</p>
        <ol className="rx-pdt-value">
          {VALUE.map((v, i) => (
            <li key={v} data-on={i === 4 ? "true" : undefined} data-done={i < 4 ? "true" : undefined}>
              {v}
            </li>
          ))}
        </ol>
        <div className="rx-euro-chip" data-sealed="true">
          <strong>€598</strong>
          <em>Verified · attributed to D-2201</em>
        </div>
      </div>
    );
  }

  return (
    <div className="rx-pdt-stage">
      <p className="rx-pdt-stage-k">Memory joins the Decision</p>
      <div className="rx-pdt-memory-ribbon" aria-hidden="true">
        {[...MEMORY, ...MEMORY].map((t, i) => (
          <span key={`${t}-${i}`}>{t}</span>
        ))}
      </div>
      <div className="rx-pdt-memory-stats">
        <div>
          <strong>12</strong>
          <span>comparable</span>
        </div>
        <div>
          <strong>4</strong>
          <span>interventions</span>
        </div>
        <div data-hot>
          <strong>3</strong>
          <span>Verified favorable</span>
        </div>
      </div>
      <p className="rx-pdt-note">Playbook updated · Autopilot trust shifts</p>
      <div
        className="rx-psig-trust-row"
        data-revoked={revoked ? "true" : undefined}
      >
        {(["Suggest", "Stage", "Auto within policy"] as const).map((label, i) => (
          <span
            key={label}
            data-on={!revoked && trust === i ? "true" : undefined}
            role="button"
            tabIndex={0}
            onClick={() => {
              setTrust(i);
              setRevoked(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setTrust(i);
                setRevoked(false);
              }
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="rx-erail-dismiss"
        onClick={() => setRevoked(true)}
      >
        Confidence drops → step trust back
      </button>
    </div>
  );
}
