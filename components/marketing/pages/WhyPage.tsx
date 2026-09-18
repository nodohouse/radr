"use client";

import { useEffect, useState, type ReactNode } from "react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { CATEGORY, CTAS } from "@/lib/marketing/brand";
import {
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_SUPPLIER,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import { money } from "@/data/demo";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  RESEARCH_FACTS,
  WHY_NOW_RESEARCH,
  type ResearchFactId,
} from "@/data/research/researchFacts";
import { useInView } from "@/components/marketing/motion/useInView";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import "@/app/product-chapters.css";
import "@/app/motion.css";
import "@/app/kinetic.css";

const FRAGMENTS = [
  { label: "PMS", value: "Nearly full", action: "Sell remaining", tone: "screen" },
  { label: "Revenue", value: "Demand strong", action: "Raise rate", tone: "sheet" },
  { label: "Channel", value: "OTA +11", action: "Distribution cost rising", tone: "sheet" },
  { label: "Booking", value: "Direct pickup ahead", action: "Wait", tone: "signal" },
  { label: "Housekeeping", value: "Premium ready", action: "No readiness constraint", tone: "sheet" },
  { label: "Events", value: "Compression", action: "Inventory more valuable", tone: "receipt" },
] as const;

const RECORD_SYSTEMS = [
  "PMS",
  "POS",
  "Reservations",
  "Labor",
  "Inventory",
  "Accounting",
] as const;

const RADR_FLOW = [
  "Evidence",
  "Futures",
  "Decision",
  "Outcome",
  "Memory",
] as const;

const LEAKS = [
  { amt: 84, label: "Turnover exception" },
  { amt: 210, label: "Channel mix drag" },
  { amt: CANON_SUPPLIER.exposureEuro, label: "Supplier variance" },
  { amt: CANON_PEAK.actualProtectedEuro, label: "Peak capacity" },
  { amt: 96, label: "Labor mismatch" },
  { amt: verifiedEuro(CANON_ORPHAN), label: "Orphan recovery" },
] as const;

const LIFECYCLE = [
  {
    id: "evidence",
    label: "Evidence",
    lines: ["89% occupancy", "OTA +11 pts", "Direct pickup ahead"],
  },
  {
    id: "futures",
    label: "Futures",
    lines: ["Release to OTA", "Hold direct", "Rate adjustment"],
  },
  {
    id: "decision",
    label: "Decision",
    lines: ["Hold 4 premium rooms direct"],
  },
  {
    id: "action",
    label: "Action",
    lines: ["Channel hold prepared", "Approved"],
  },
  {
    id: "outcome",
    label: "Outcome",
    lines: [
      `Observed ${formatDecisionMoney(CANON_OTA.actualProtectedEuro)}`,
    ],
  },
  {
    id: "verify",
    label: "Verified Value",
    lines: [
      `${formatDecisionMoney(CANON_OTA.actualProtectedEuro)} verified protected`,
      "DEMO · ILLUSTRATIVE",
    ],
  },
  {
    id: "memory",
    label: "Memory",
    lines: ["Event-weekend playbook updated"],
  },
] as const;

const OBJECTIONS = [
  {
    q: "Does RADR replace our PMS, POS or RMS?",
    a: "No. Those systems remain sources of operational truth and execution. RADR connects evidence across them to understand and record Decisions.",
  },
  {
    q: "Is this just BI with AI?",
    a: "No. BI primarily helps explain what happened. RADR models what could happen next, evaluates feasible responses, records what was chosen, observes the outcome and verifies what changed.",
  },
  {
    q: "What if RADR is wrong?",
    a: "Predictions are estimates, not guarantees. RADR exposes evidence and uncertainty, supports operator context and compares expected outcomes with reality so future Decisions can be better informed.",
  },
  {
    q: "Do we need a complete tech stack?",
    a: "No. RADR should support APIs and real-time feeds, but also CSVs, spreadsheets, PDFs and operator context. Missing evidence remains visible.",
  },
  {
    q: "How do you know RADR created the value?",
    a: "RADR stores the baseline, selected response, observed outcome, counterfactual and verification method. Expected value and Verified Value are never treated as the same thing.",
  },
] as const;

function MarketStat({ id }: { id: ResearchFactId }) {
  const s = RESEARCH_FACTS[id];
  return (
    <li className="rx-why-stat">
      <strong>{s.metric}</strong>
      <span className="rx-why-stat-label">{s.displayLabel}</span>
      <p>
        {s.metric} {s.statement}
      </p>
      <span className="rx-why-stat-meta">
        {s.population} · {s.publicationDate}
      </span>
      <a
        className="rx-why-stat-src"
        href={s.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Source · {s.publisher}
        <em>{s.report}</em>
      </a>
    </li>
  );
}

function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rx-why-disclose" data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="rx-why-disclose-btn"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide" : label}
      </button>
      {open ? <div className="rx-why-disclose-body">{children}</div> : null}
    </div>
  );
}

/** One Decision object traveling through time — D-2201. */
function DecisionLifecycle() {
  const [step, setStep] = useState(0);
  const current = LIFECYCLE[step]!;

  return (
    <div className="rx-why-life">
      <p className="rx-why-life-id">
        {CANON_OTA.displayId} · {CANON_OTA.property} · DEMO · ILLUSTRATIVE
      </p>

      <div className="rx-why-life-object" key={current.id} data-stage={current.id}>
        <div className="rx-why-life-stamp">
          <em>{current.label}</em>
          <span>
            Stage {step + 1} / {LIFECYCLE.length}
          </span>
        </div>
        <strong>{CANON_OTA.displayId}</strong>
        <p className="rx-why-life-persist">Same Decision · still open</p>
        <ul>
          {current.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <ol className="rx-why-life-rail" aria-label="Anatomy of a Decision">
        {LIFECYCLE.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              data-on={i === step ? "true" : "false"}
              data-done={i < step ? "true" : "false"}
              onClick={() => setStep(i)}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="rx-why-life-nav">
        <button
          type="button"
          className="rx-btn rx-btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="rx-btn rx-btn-primary"
          disabled={step >= LIFECYCLE.length - 1}
          onClick={() => setStep((s) => Math.min(LIFECYCLE.length - 1, s + 1))}
        >
          {step >= LIFECYCLE.length - 1 ? "Complete" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function LeakLedger() {
  const reduced = useReducedMotionSafe();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.28 });
  const [shown, setShown] = useState(reduced ? LEAKS.length : 0);
  const [resolved, setResolved] = useState(reduced);

  useEffect(() => {
    if (!inView || reduced) return;
    setShown(0);
    setResolved(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= LEAKS.length) {
        window.clearInterval(id);
        window.setTimeout(() => setResolved(true), 520);
      }
    }, 520);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  return (
    <div className="rx-why-ledger" ref={ref}>
      <p className="rx-why-ledger-kicker">Decision Ledger · DEMO · ILLUSTRATIVE</p>
      <ul className="rx-why-leaks" aria-live="polite">
        {LEAKS.map((l, i) => (
          <li key={l.label} data-in={i < shown ? "true" : "false"}>
            <span className="rx-why-leak-when">Event</span>
            <strong>{money(l.amt)}</strong>
            <em>{l.label}</em>
          </li>
        ))}
      </ul>
      <p className="rx-why-leaks-resolve" data-on={resolved ? "true" : "false"}>
        Individually small.
        <br />
        Collectively material.
      </p>
    </div>
  );
}

/**
 * Why RADR — five acts. Hierarchy + polish only.
 */
export function WhyPage() {
  const [openQ, setOpenQ] = useState<number | null>(null);

  return (
    <div className="radr radr-mineral rx-ch-light">
      <SiteNav />
      <main>
        {/* ACT 1 */}
        <section className="rx-ch-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Why RADR</p>
            <h1 className="rx-ch-title">
              Hospitality doesn&apos;t have a data problem.
              <br />
              It has a decision problem.
            </h1>
            <p className="rx-ch-lead" style={{ marginTop: "1rem" }}>
              Hospitality digitized its records before it digitized its judgment.
            </p>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-why-frag-lead">
              Six systems. Six answers.
              <br />
              One Decision.
            </p>

            <div className="rx-why-converge" aria-label="Signals converging into one Decision">
              <ul className="rx-why-vectors">
                {FRAGMENTS.map((f) => (
                  <li key={f.label} data-tone={f.tone}>
                    <em>{f.label}</em>
                    <strong>{f.value}</strong>
                    <span>{f.action}</span>
                  </li>
                ))}
              </ul>
              <div className="rx-why-converge-core">
                <i aria-hidden="true" />
                <strong>{CANON_OTA.displayId}</strong>
                <em>One Decision</em>
                <p>Hold 4 premium rooms direct</p>
                <span>DEMO · ILLUSTRATIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACT 2 — Decision Gap */}
        <section className="rx-why-gap-sec" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">{CATEGORY.decisionGap}</p>
            <h2 className="rx-why-gap-title">
              The gap between
              <br />
              what your systems know
              <br />
              and what your operation decides.
            </h2>
            <p className="rx-why-gap-lead">
              Between those two, margin disappears.
            </p>

            <div className="rx-why-gap-flow rx-why-gap-kinetic">
              <div>
                <em>Systems of record</em>
                <ul className="rx-why-chip-row">
                  {RECORD_SYSTEMS.map((s, i) => (
                    <li
                      key={s}
                      className="radr-m-arrive"
                      data-on="true"
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <span>What is true?</span>
                <p className="rx-why-gap-blank">
                  Decision object: <em>blank</em>
                </p>
              </div>
              <strong className="rx-why-gap-arrow">→ gap →</strong>
              <div data-radr="true">
                <em>RADR</em>
                <strong>Persistent Decision forms</strong>
                <ol className="rx-why-flow-seq">
                  {RADR_FLOW.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="rx-why-gap-blank" data-filled="true">
                  Not another central database — the Decision between systems.
                </p>
              </div>
            </div>

            <p className="rx-why-replace-h" style={{ marginTop: "2rem" }}>
              RADR doesn&apos;t replace your operating stack.
            </p>
            <p className="rx-why-replace-sub">
              It closes the gap between what your systems know and what your
              operation decides.
            </p>
          </div>
        </section>

        {/* ACT 3 — dominant judgment moment */}
        <section className="rx-why-sodr rx-why-sodr-hero" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="rx-why-sodr-title">
              Systems of record store facts.
              <br />
              RADR stores judgment.
            </h2>
            <p className="rx-why-sodr-line">
              A system of decision record for hospitality.
            </p>

            <Disclosure label="Anatomy of a Decision">
              <DecisionLifecycle />
            </Disclosure>
          </div>
        </section>

        {/* ACT 4 — compounding */}
        <section className="rx-why-margin" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Small Decisions · compounding economics</p>
            <h2 className="rx-why-margin-h">
              Margin rarely disappears
              <br />
              in one big moment.
              <br />
              <span>It leaks out one Decision at a time.</span>
            </h2>
            <p className="rx-why-illus">
              DEMO · ILLUSTRATIVE — not customer results
            </p>
            <LeakLedger />
            <p className="rx-why-leaks-thesis">
              In an industry this large, small operating decisions compound into
              large economic outcomes.
            </p>

            <Disclosure label="How memory compounds">
              <p className="rx-why-disclose-note">
                RADR becomes more useful because it remembers how this operation
                actually behaves. Every verified Decision adds to Operating
                Memory — what tends to work here, under which conditions, with
                what uncertainty, and with what economic result.
              </p>
            </Disclosure>
          </div>
        </section>

        {/* ACT 5 — Why now → climax → CTA */}
        <section className="rx-why-now" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Why now</p>
            <h2 className="rx-why-now-h">
              Hospitality has digitized its records.
              <br />
              It has not yet digitized its judgment.
            </h2>
            <p className="rx-why-gap-lead">
              The industry doesn&apos;t lack revenue. It loses margin between
              systems and Decisions.
            </p>
            <ul className="rx-why-stats">
              {WHY_NOW_RESEARCH.map((id) => (
                <MarketStat key={id} id={id} />
              ))}
            </ul>
            <p className="rx-why-now-caveat">
              Industry context shown to illustrate operating scale; not an
              estimate of RADR&apos;s addressable market.
            </p>

            <Disclosure label="Questions we&apos;d ask too">
              <ul className="rx-why-faq">
                {OBJECTIONS.map((row, i) => {
                  const open = openQ === i;
                  return (
                    <li key={row.q} data-open={open ? "true" : "false"}>
                      <button
                        type="button"
                        className="rx-why-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenQ(open ? null : i)}
                      >
                        {row.q}
                      </button>
                      {open ? <p className="rx-why-faq-a">{row.a}</p> : null}
                    </li>
                  );
                })}
              </ul>
            </Disclosure>

            <div className="rx-why-climax">
              <p className="rx-why-climax-h">
                The next layer
                <br />
                is Decision.
              </p>
              <p className="rx-why-climax-sub">
                Your systems record the operation.
                <br />
                RADR learns how the operation decides.
              </p>
              <div className="rx-ch-ctas">
                <NextLink href="/demo" className="rx-btn rx-btn-primary">
                  {CTAS.primaryProduct} <span aria-hidden="true">→</span>
                </NextLink>
                <Link href="/product" className="rx-btn rx-btn-ghost">
                  Platform
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
