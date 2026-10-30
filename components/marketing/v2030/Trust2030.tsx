"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { PUBLIC_AUTONOMY } from "@/lib/marketing/publicCanon";
import { stageSwap } from "@/lib/marketing/motion";
import { CinematicHeroShell } from "@/components/marketing/v2030/CinematicHeroShell";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";

const LINEAGE = [
  {
    id: "source",
    label: "Source data",
    tip: "POS, PMS, labor, invoices. systems of record.",
  },
  {
    id: "evidence",
    label: "Evidence",
    tip: "Normalized facts with freshness and sample.",
  },
  {
    id: "model",
    label: "Model",
    tip: "Deterministic calculation. Not generative invention.",
  },
  {
    id: "futures",
    label: "Futures",
    tip: "Compared options with expected outcomes.",
  },
  {
    id: "decision",
    label: "Decision",
    tip: "Recommended path with confidence and deadline.",
  },
  {
    id: "action",
    label: "Action",
    tip: "Prepared within policy. human when required.",
  },
  {
    id: "observed",
    label: "Observed",
    tip: "What the operation actually did.",
  },
  {
    id: "verified",
    label: "Verified",
    tip: "Sealed only when evidence supports the claim.",
  },
] as const;

const HEALTH = [
  {
    id: "healthy",
    label: "Healthy",
    confidence: 82,
    action: "Recommend / request approval",
  },
  {
    id: "degraded",
    label: "Degraded",
    confidence: 61,
    action: "Prepare only · human required",
  },
  {
    id: "stale",
    label: "Stale",
    confidence: 48,
    action: "High-risk action blocked",
  },
] as const;

const AUTONOMY_DETAIL: Record<
  number,
  { can: string; needs: string; why: string }
> = {
  0: {
    can: "Surface signals and operating state.",
    needs: "Human interprets and acts outside RADR.",
    why: "No material guest or financial impact yet.",
  },
  1: {
    can: "Explain drivers, confidence, and cost of doing nothing.",
    needs: "Human chooses whether to escalate.",
    why: "Understanding before commitment.",
  },
  2: {
    can: "Draft prepared action packages.",
    needs: "Human reviews payload before send.",
    why: "Reversible prep · no execution yet.",
  },
  3: {
    can: "Recommend a preferred future.",
    needs: "Human approves, rejects, or overrides.",
    why: "Material guest or economic impact.",
  },
  4: {
    can: "Execute within explicit policy bounds.",
    needs: "Human override always available.",
    why: "Earned trust · low-risk action class only.",
  },
  5: {
    can: "Execute and seal Verified Value when evidence closes.",
    needs: "Audit trail remains readable.",
    why: "Policy + confidence + action risk all clear.",
  },
};

const ASK = [
  {
    q: "What is most likely to hurt contribution tonight?",
    constraint: "Kitchen capacity",
    impact: "Pace seating protects more contribution than seating now",
    confidence: "82%",
    evidence: "Reservations · kitchen load · Friday peak sample",
  },
  {
    q: "Why is Floor 8 behind?",
    constraint: "Housekeeping readiness",
    impact: "Two rooms block the arrival wave",
    confidence: "79%",
    evidence: "Arrivals stack · room status · labor assignment",
  },
  {
    q: "What happens if we do nothing?",
    constraint: "Cost of doing nothing",
    impact: "Exposed contribution this service. shown before any recommendation",
    confidence: "Range · illustrative",
    evidence: "Expected vs observed path · no action sealed",
  },
] as const;

function useCountTo(target: number, enabled: boolean, reduced: boolean) {
  const [n, setN] = useState(reduced || !enabled ? target : 0);
  useEffect(() => {
    if (reduced) {
      setN(target);
      return;
    }
    setN(0);
    let frame = 0;
    const start = performance.now();
    const duration = 480;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);
  return n;
}

export function Trust2030() {
  const reduced = useReducedMotion() ?? false;
  const [autonomy, setAutonomy] = useState(3);
  const [health, setHealth] =
    useState<(typeof HEALTH)[number]["id"]>("healthy");
  const [lineage, setLineage] = useState(0);
  const [ask, setAsk] = useState(0);
  const h = HEALTH.find((x) => x.id === health) ?? HEALTH[0]!;
  const conf = useCountTo(h.confidence, true, reduced);
  const detail = AUTONOMY_DETAIL[autonomy] ?? AUTONOMY_DETAIL[3]!;
  const askItem = ASK[ask]!;
  const lineageItem = LINEAGE[lineage]!;

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <CinematicHeroShell>
            <p className="rx30-kicker">Trust & security</p>
            <h1
              className="rx30-h1"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                maxWidth: "14ch",
              }}
            >
              Governed by policy, confidence and{" "}
              <em>action risk.</em>
            </h1>
            <p className="rx30-lead" style={{ marginTop: "1.1rem" }}>
              Autonomy is governed by policy, confidence, and action risk. Not a
              single global switch. Economic values come from source data and
              deterministic calculation. Not generative invention.
            </p>
            <div className="rx30-ctas">
              <Link
                href={CTAS.seeInActionHref}
                className="rx30-btn rx30-btn-primary"
              >
                {CTAS.seeInAction} <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/contact?intent=sales"
                className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
              >
                Talk to RADR
              </Link>
            </div>
          </CinematicHeroShell>

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Autonomy</p>
              <h2 className="rx30-h2">
                Earned per action class. Not blanket.
              </h2>
              <div
                className="rx30-autonomy-rail"
                role="tablist"
                aria-label="Autonomy ladder"
              >
                {PUBLIC_AUTONOMY.map((l) => (
                  <button
                    key={l.level}
                    type="button"
                    role="tab"
                    data-on={autonomy === l.level ? "true" : undefined}
                    aria-selected={autonomy === l.level}
                    onClick={() => setAutonomy(l.level)}
                    onMouseEnter={() => setAutonomy(l.level)}
                    onFocus={() => setAutonomy(l.level)}
                  >
                    <em>{String(l.level).padStart(2, "0")}</em>
                    <strong>{l.label}</strong>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={autonomy}
                  className="rx30-autonomy-detail"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={stageSwap}
                >
                  <div>
                    <span>What RADR can do</span>
                    <strong>{detail.can}</strong>
                  </div>
                  <div>
                    <span>What needs human approval</span>
                    <strong>{detail.needs}</strong>
                  </div>
                  <div>
                    <span>Why</span>
                    <strong>{detail.why}</strong>
                  </div>
                </motion.div>
              </AnimatePresence>
              <p className="rx30-global-note" style={{ marginTop: "1rem" }}>
                Humans can approve, reject, change, pause, or override. Policies
                determine allowed action.
              </p>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Evidence lineage</p>
              <h2 className="rx30-h2">RADR shows its work.</h2>
              <p className="rx30-lead">
                Every material Decision can be traced from source evidence to
                verified outcome.
              </p>
              <div className="rx30-lineage rx30-lineage--live" aria-label="Evidence lineage">
                {LINEAGE.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    data-on={lineage === i ? "true" : undefined}
                    data-past={i < lineage ? "true" : undefined}
                    onClick={() => setLineage(i)}
                    onMouseEnter={() => setLineage(i)}
                    onFocus={() => setLineage(i)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="rx30-lineage-tip" aria-live="polite">
                {lineageItem.tip}
              </p>
            </div>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Data Health</p>
              <h2 className="rx30-h2">
                What changes when the data gets worse?
              </h2>
              <p className="rx30-lead">
                Evidence health → confidence → allowed action. Responsible AI is
                visible, not claimed.
              </p>
              <div className="rx30-health" role="tablist">
                {HEALTH.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="tab"
                    data-on={health === x.id ? "true" : undefined}
                    aria-selected={health === x.id}
                    onClick={() => setHealth(x.id)}
                  >
                    <strong>{x.label}</strong>
                    <span>
                      {x.confidence}% · {x.action}
                    </span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={health}
                  className="rx30-module-preview rx30-health-demo"
                  style={{ marginTop: "1rem" }}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={stageSwap}
                >
                  <p className="rx30-demo-label">Illustrative effect · PMS feed</p>
                  <div className="rx30-health-readout">
                    <div>
                      <span>Data Health</span>
                      <strong>{h.label}</strong>
                    </div>
                    <div>
                      <span>Confidence</span>
                      <strong>{conf}%</strong>
                    </div>
                    <div>
                      <span>Allowed action</span>
                      <strong>{h.action}</strong>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Ask RADR</p>
              <h2 className="rx30-h2">
                Natural language into structured operating truth.
              </h2>
              <p className="rx30-lead">
                Not a generic chatbot. Uses connected evidence, calculates,
                explains, and prepares action only when policy allows.
              </p>
              <div className="rx30-ask">
                {ASK.map((item, i) => (
                  <button
                    key={item.q}
                    type="button"
                    data-on={ask === i ? "true" : undefined}
                    onClick={() => setAsk(i)}
                  >
                    “{item.q}”
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={ask}
                  className="rx30-ask-answer rx30-ask-structured"
                  role="status"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={stageSwap}
                >
                  <div>
                    <span>Constraint</span>
                    <strong>{askItem.constraint}</strong>
                  </div>
                  <div>
                    <span>Expected impact</span>
                    <strong>{askItem.impact}</strong>
                  </div>
                  <div>
                    <span>Confidence</span>
                    <strong>{askItem.confidence}</strong>
                  </div>
                  <div>
                    <span>Evidence</span>
                    <strong>{askItem.evidence}</strong>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <p className="rx30-lead" style={{ margin: "0 auto" }}>
                No SOC 2 or ISO certification claims are made here. When formal
                certifications exist, they will be listed with dates and scope.
              </p>
              <div className="rx30-ctas">
                <Link href="/privacy" className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid">
                  Privacy Policy
                </Link>
                <Link
                  href="/contact?intent=sales"
                  className="rx30-btn rx30-btn-primary"
                >
                  Contact <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
