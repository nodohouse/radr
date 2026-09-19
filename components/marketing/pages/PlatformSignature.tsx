"use client";

/**
 * Platform signature — sticky Decision lifecycle + Futures + Verified + Memory.
 * One Decision object evolves. Scrubber + scroll. Permission ≠ lifecycle.
 */

import { useEffect, useRef, useState } from "react";
import {
  PHONE_GM_PERISHABLE,
  PHONE_VERIFIED,
  RadrPhone,
} from "@/components/marketing/scenes/home/RadrPhone";
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

const LIFE_COPY = [
  "€620 exposure appears from peak pressure.",
  "Drivers connect: inbound + delivery → kitchen load.",
  "Three trajectories diverge on a common timeline.",
  "Wait 12m highlights — reversible, highest contribution.",
  "Action receipt prepared for operator approval.",
  "Actual result overlays the Expected path.",
  "Value seals when evidence matches the Decision.",
  "Memory pattern joins the playbook.",
] as const;

const FUTURES = [
  {
    id: "seat",
    title: "Seat now",
    euro: "€0",
    note: "Kitchen →97% · 9 second turns lost",
    rec: false,
  },
  {
    id: "wait",
    title: "Wait 12m",
    euro: "+€620",
    note: "Protect peak · reversible",
    rec: true,
  },
  {
    id: "kill",
    title: "Kill delivery",
    euro: "+€180",
    note: "Over-corrects · guest friction",
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

const MEMORY_TIMES = [
  "Friday 18:42",
  "Friday 18:47",
  "Saturday 19:02",
  "Friday 18:39",
  "Thursday 19:11",
] as const;

export function PlatformSignature() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [life, setLife] = useState(0);
  const [future, setFuture] = useState(1);
  const [value, setValue] = useState(0);
  const [trust, setTrust] = useState(1);
  const [revoked, setRevoked] = useState(false);
  const sealed = life >= 6;

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(LIFE.length - 1, Math.floor(p * LIFE.length));
      setLife((prev) => (prev === next ? prev : next));
      setValue(Math.min(4, Math.floor(p * 5)));
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

  useEffect(() => {
    if (life >= 2 && life <= 3) setFuture(1);
  }, [life]);

  return (
    <div className="rx-psig">
      <div
        ref={rootRef}
        className="rx-psig-sticky"
        style={reduced ? { minHeight: "auto" } : undefined}
      >
        <section
          className="rx-psig-block rx-psig-sticky-pin"
          id="evidence"
          data-nav-theme="light"
        >
          <div className="rx-shell">
            <p className="rx-rec-k">The Decision object</p>
            <h2 className="rx-rec-h">The Decision should survive the moment.</h2>
            <p className="rx-rec-p">
              Most software stores the transaction. RADR stores why the Decision
              existed, what evidence supported it, what alternatives were
              considered, what action was chosen, what happened, and what should
              change next time.
            </p>

            <div
              className="rx-psig-life-scrub"
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
                  onClick={() => setLife(i)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div
              className="rx-psig-decision"
              data-sealed={sealed ? "true" : undefined}
              data-stage={LIFE[life]}
            >
              <header>
                <em>D-1911 · Berlin Mitte · Peak</em>
                <strong>{LIFE[life]}</strong>
              </header>
              <h3>Wait 12 minutes</h3>
              <p
                className="rx-psig-euro"
                data-grade={sealed ? "Verified" : "Expected"}
              >
                {sealed ? "€620 Verified" : "€620 Expected"}
              </p>
              <p>{LIFE_COPY[life]}</p>
              {life >= 2 ? (
                <div className="rx-psig-futures rx-psig-futures-inline">
                  {FUTURES.map((f, i) => (
                    <button
                      key={f.id}
                      type="button"
                      className="rx-psig-future"
                      data-on={future === i ? "true" : undefined}
                      data-rec={f.rec ? "true" : undefined}
                      onClick={() => setFuture(i)}
                    >
                      <strong>{f.title}</strong>
                      <em>{f.euro}</em>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section className="rx-psig-block rx-psig-band" data-nav-theme="light">
        <div className="rx-shell rx-psig-split">
          <div>
            <p className="rx-rec-k">Futures</p>
            <h2 className="rx-rec-h">Same baseline. Different paths.</h2>
            <p className="rx-rec-p">
              Expected contribution · capacity · risk · uncertainty — on a common
              scale.
            </p>
            <div className="rx-psig-futures">
              {FUTURES.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className="rx-psig-future"
                  data-on={future === i ? "true" : undefined}
                  data-rec={f.rec ? "true" : undefined}
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
          <RadrPhone state={PHONE_GM_PERISHABLE} />
        </div>
      </section>

      <section className="rx-psig-block" data-nav-theme="light">
        <div className="rx-shell rx-psig-split">
          <div>
            <p className="rx-rec-k">Verified Value</p>
            <h2 className="rx-rec-h">Follow the euro home.</h2>
            <div className="rx-psig-value" role="tablist">
              {VALUE.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={value === i}
                  data-on={value === i ? "true" : undefined}
                  data-done={i < value ? "true" : undefined}
                  onClick={() => setValue(i)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="rx-euro-chip" data-sealed={value === 4 ? "true" : undefined}>
              <strong>€273</strong>
              <em>{VALUE[value]}</em>
            </div>
            <p className="rx-psig-value-note">
              {value === 4
                ? "€273 recovered · matched to INV-88421 · AP-POST-991"
                : value === 3
                  ? "Linked to Decision D-4102 + prepared dispute"
                  : value === 2
                    ? "Credit memo observed on supplier ledger"
                    : value === 1
                      ? "€273 Expected if dispute path holds — not cash"
                      : "Contract variance identified across invoice + terms"}
            </p>
          </div>
          <RadrPhone state={PHONE_VERIFIED} />
        </div>
      </section>

      <section
        className="rx-psig-block rx-psig-band"
        id="autopilot"
        data-nav-theme="light"
      >
        <div className="rx-shell">
          <p className="rx-rec-k">Operating Memory → Autopilot</p>
          <h2 className="rx-rec-h">Trust is earned from what verified.</h2>

          <div className="rx-psig-memory-ribbon" aria-hidden="true">
            {[...MEMORY_TIMES, ...MEMORY_TIMES].map((t, i) => (
              <span key={`${t}-${i}`}>{t}</span>
            ))}
          </div>

          <div className="rx-psig-memory">
            <div>
              <strong>12</strong>
              <span>similar services</span>
            </div>
            <div>
              <strong>5</strong>
              <span>pattern matches</span>
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
          <p className="rx-psig-auto">
            Playbook v3 · <em>Auto-stage now allowed</em> · Always ask before
            sending material external actions.
          </p>

          <div
            className="rx-psig-trust-row"
            data-revoked={revoked ? "true" : undefined}
            role="group"
            aria-label="Autopilot permission"
          >
            {(["Suggest", "Stage", "Auto within policy"] as const).map(
              (label, i) => (
                <span
                  key={label}
                  data-on={!revoked && trust === i ? "true" : undefined}
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
                  role="button"
                  tabIndex={0}
                >
                  {label}
                </span>
              ),
            )}
          </div>
          <button
            type="button"
            className="rx-erail-dismiss"
            onClick={() => setRevoked(true)}
          >
            Simulate confidence drop → step back
          </button>
          <p className="rx-rec-p rx-rec-muted">
            Permission ladder is separate from Verified lifecycle. Trust can be
            revoked.
          </p>
        </div>
      </section>
    </div>
  );
}
