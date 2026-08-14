"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signalByChannel } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";
import { useScrollStage } from "../motion/useScrollStage";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { RadrWordmark } from "../RadrWordmark";

const STAGES = [
  {
    id: "detect",
    n: "01",
    label: "Detect",
    title: "Find the difference.",
    copy: "RADR continuously compares what happened with what should have happened.",
  },
  {
    id: "explain",
    n: "02",
    label: "Explain",
    title: "Understand why it matters.",
    copy: "RADR traces the issue back to the source and quantifies the impact.",
  },
  {
    id: "act",
    n: "03",
    label: "Act",
    title: "Know what to do next.",
    copy: "RADR gives the next action with evidence attached.",
  },
  {
    id: "learn",
    n: "04",
    label: "Learn",
    title: "Don't fix the same thing twice.",
    copy: "RADR turns resolved issues into permanent controls.",
  },
  {
    id: "verify",
    n: "05",
    label: "Verify",
    title: "Prove the value.",
    copy: "RADR checks whether the financial impact was actually realized.",
  },
] as const;

const WORKFLOW = [
  "New",
  "Assigned",
  "In review",
  "Resolved",
  "Verified",
] as const;

const FLYWHEEL = [
  { t: "Signal detected", d: "Difference found" },
  { t: "Human resolves", d: "Action taken" },
  { t: "Pattern learned", d: "Institutional knowledge" },
  { t: "Control created", d: "Caught earlier next time" },
  { t: "Verified value", d: "Proof of impact" },
] as const;

const STACK = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue",
] as const;

type Buy = ReturnType<typeof signalByChannel>;

function StageVisual({ stage, buy }: { stage: number; buy: Buy }) {
  return (
    <div className="rx-howp-visual" data-stage={stage}>
      <div className="rx-howp-scan" aria-hidden="true" />

      {stage === 0 ? (
        <article className="rx-howp-card">
          <header>
            <span>Signal 001 · DETECT</span>
            <span className="rx-howp-prio">Priority 01</span>
          </header>
          <h3>{buy.title}</h3>
          <p className="rx-howp-item">{buy.source.detail}</p>
          <div className="rx-howp-rows">
            <div>
              <em>Contract price</em>
              <strong className="rx-money">{buy.source.should.value}</strong>
            </div>
            <div data-flag="true">
              <em>Invoice price</em>
              <strong className="rx-money">{buy.source.actual.value}</strong>
            </div>
          </div>
          <p className="rx-howp-ping">
            <span className="rx-tri">△</span> {buy.source.unitDelta}
          </p>
          <p className="rx-howp-impact">
            <span className="rx-tri">△</span> {buy.amount}
            {buy.period}
          </p>
        </article>
      ) : null}

      {stage === 1 ? (
        <article className="rx-howp-card">
          <header>
            <span>02 · EXPLAIN</span>
            <span>High impact</span>
          </header>
          <h3>{buy.title}</h3>
          <dl className="rx-howp-facts">
            <div>
              <dt>Supplier</dt>
              <dd>FreshCo</dd>
            </div>
            <div>
              <dt>Item</dt>
              <dd>{buy.source.detail}</dd>
            </div>
            <div>
              <dt>Contract</dt>
              <dd className="rx-money">{buy.source.should.value}</dd>
            </div>
            <div>
              <dt>Invoice</dt>
              <dd className="rx-money">{buy.source.actual.value}</dd>
            </div>
            <div>
              <dt>Volume</dt>
              <dd>5,172 cases / year</dd>
            </div>
          </dl>
          <div className="rx-howp-impact-block">
            <em>Annual impact</em>
            <strong className="rx-money">{buy.amount}</strong>
          </div>
        </article>
      ) : null}

      {stage === 2 ? (
        <article className="rx-howp-card">
          <header>
            <span>03 · ACT</span>
            <span>Actionable</span>
          </header>
          <p className="rx-howp-meta-label">Recommended action</p>
          <h3>Review supplier charge</h3>
          <p className="rx-howp-meta-label">Evidence ready</p>
          <ul className="rx-howp-evidence">
            <li>✓ Contract.pdf</li>
            <li>✓ Invoice #48291</li>
            <li>✓ Purchase history</li>
            <li>✓ Supplier statement</li>
          </ul>
          <div className="rx-howp-workflow" aria-label="Finding workflow">
            {WORKFLOW.map((w, i) => (
              <span key={w} data-on={i <= 1 ? "true" : "false"}>
                {w}
              </span>
            ))}
          </div>
          <p className="rx-howp-assign">Assigned · Finance Manager</p>
          <p className="rx-howp-action">{buy.action}</p>
        </article>
      ) : null}

      {stage === 3 ? (
        <article className="rx-howp-card">
          <header>
            <span>04 · LEARN</span>
            <span>Control</span>
          </header>
          <p className="rx-howp-meta-label">Resolution</p>
          <h3>Supplier corrected pricing</h3>
          <div className="rx-howp-control">
            <em>Control created</em>
            <strong>
              Invoice price
              <br />
              must match
              <br />
              contract price
            </strong>
            <p>Next mismatch · flag automatically</p>
          </div>
        </article>
      ) : null}

      {stage === 4 ? (
        <article className="rx-howp-card rx-howp-card--verify">
          <div className="rx-howp-verify-flow">
            <div className="rx-howp-verify-step" data-step="expected">
              <em>Expected recovery</em>
              <strong className="rx-money">{buy.amount}</strong>
            </div>
            <div className="rx-howp-verify-line" aria-hidden="true" />
            <div className="rx-howp-verify-step" data-step="received">
              <em>Received</em>
              <strong className="rx-money">{buy.amount}</strong>
            </div>
            <p className="rx-howp-verified">✓ Verified</p>
            <div className="rx-howp-impact-block">
              <strong className="rx-money">{buy.amount}</strong>
              <em>Added to verified value</em>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

/**
 * How RADR works — one BUY signal through Detect→Verify.
 * Sticky progressive story on desktop; stacked on mobile.
 */
export function HowPage() {
  const buy = signalByChannel("buy");
  const reduced = useReducedMotionSafe();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const u = () => setMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const sticky = !reduced;
  const { rootRef, index, setIndex } = useScrollStage(STAGES.length, sticky);
  const stage = STAGES[index]!;

  return (
    <div className="radr">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-how-hero" data-nav-theme="dark">
          <div className="rx-shell rx-how-hero-inner">
            <p className="rx-kicker">How RADR works</p>
            <h1 className="rx-page-title">
              From signal
              <br />
              to verified value.
            </h1>
            <p className="rx-lead-inv rx-lead-short">
              RADR finds the difference, explains what it means, gives you the
              next action, learns from the resolution and verifies the value.
            </p>
            <div className="rx-page-signal">
              <span>Signal 001 · {buy.title}</span>
              <strong className="rx-money">
                <span className="rx-tri">△</span> {buy.amount}
                {buy.period}
              </strong>
            </div>
          </div>
        </section>

        {reduced ? (
          <section className="rx-howp-mobile" data-nav-theme="dark">
            <div className="rx-shell">
              {STAGES.map((s, i) => (
                <article key={s.id} className="rx-howp-mobile-card">
                  <p className="rx-howp-stage-kicker">
                    {s.n} / {s.label.toUpperCase()}
                  </p>
                  <h2 className="rx-howp-stage-title">{s.title}</h2>
                  <p className="rx-howp-copy">{s.copy}</p>
                  <StageVisual stage={i} buy={buy} />
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            className={`rx-howp-story${mobile ? " rx-howp-story--mobile" : ""}`}
            ref={rootRef}
            data-nav-theme="dark"
            style={{ height: `${STAGES.length * (mobile ? 85 : 75)}vh` }}
          >
            <div className="rx-howp-pin">
              {mobile ? (
                <div className="rx-shell rx-howp-mobile-stage">
                  <p className="rx-howp-mobile-prog">
                    {stage.n} / 0{STAGES.length}
                  </p>
                  <p className="rx-howp-stage-kicker">
                    {stage.n} / {stage.label.toUpperCase()}
                  </p>
                  <h2 className="rx-howp-stage-title">{stage.title}</h2>
                  <p className="rx-howp-copy">{stage.copy}</p>
                  <StageVisual key={index} stage={index} buy={buy} />
                </div>
              ) : (
                <div className="rx-shell rx-howp-grid">
                  <aside className="rx-howp-rail" aria-label="RADR loop progress">
                    <div className="rx-howp-rail-track" aria-hidden="true">
                      <i
                        style={{
                          height: `${((index + 0.5) / STAGES.length) * 100}%`,
                        }}
                      />
                    </div>
                    <ul>
                      {STAGES.map((s, i) => (
                        <li key={s.id} data-on={i === index ? "true" : "false"}>
                          <button type="button" onClick={() => setIndex(i)}>
                            <span>{s.n}</span>
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </aside>

                  <div className="rx-howp-copycol">
                    <p className="rx-howp-stage-kicker">
                      {stage.n} / {stage.label.toUpperCase()}
                    </p>
                    <h2 className="rx-howp-stage-title">{stage.title}</h2>
                    <p className="rx-howp-copy">{stage.copy}</p>
                  </div>

                  <StageVisual key={index} stage={index} buy={buy} />
                </div>
              )}
            </div>
          </section>
        )}

        <section className="rx-howp-loop" data-nav-theme="dark">
          <div className="rx-shell rx-howp-loop-inner">
            <p className="rx-kicker">The RADR loop</p>
            <h2 className="rx-howp-loop-title">
              Detect.
              <br />
              Explain.
              <br />
              Act.
              <br />
              Learn.
              <br />
              Verify.
            </h2>
            <ol className="rx-howp-flow">
              {STAGES.map((s) => (
                <li key={s.id}>
                  <strong>{s.label}</strong>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
            <p className="rx-howp-closer">
              Find it.
              <br />
              Fix it.
              <br />
              Keep it fixed.
            </p>
          </div>
        </section>

        <section className="rx-howp-depth" data-nav-theme="dark">
          <div className="rx-shell rx-howp-depth-grid">
            <div>
              <p className="rx-kicker">Flywheel</p>
              <h2 className="rx-display rx-display-sm">
                RADR gets
                <br />
                smarter.
              </h2>
              <p className="rx-lead-inv rx-lead-short">
                Every resolved finding becomes institutional knowledge.
              </p>
            </div>
            <ol className="rx-howp-flywheel">
              {FLYWHEEL.map((f, i) => (
                <li key={f.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{f.t}</strong>
                    <em>{f.d}</em>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-howp-arch" data-nav-theme="dark">
          <div className="rx-shell">
            <p className="rx-kicker">Architecture</p>
            <h2 className="rx-display rx-display-sm">
              Your stack.
              <br />
              On RADR.
            </h2>
            <div className="rx-howp-arch-board">
              <ul className="rx-howp-arch-stack">
                {STACK.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className="rx-howp-arch-hub">
                <RadrWordmark size="md" />
                <p>Detect · Explain · Act · Learn · Verify</p>
                <strong>Verified value</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="rx-howp-compare" data-nav-theme="dark">
          <div className="rx-shell rx-howp-compare-grid">
            <div>
              <p className="rx-kicker">Category</p>
              <h2 className="rx-display rx-display-sm">
                Why RADR
                <br />
                wins.
              </h2>
            </div>
            <ul className="rx-howp-compare-list">
              <li>
                <em>Traditional BI</em>
                <span>Shows what happened</span>
              </li>
              <li>
                <em>Alerts</em>
                <span>Tell you something changed</span>
              </li>
              <li>
                <em>Consultants</em>
                <span>Find issues periodically</span>
              </li>
              <li data-win="true">
                <em>RADR</em>
                <span>
                  Continuously finds the difference, quantifies value, drives
                  action, learns and verifies
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section className="rx-howp-not" data-nav-theme="dark">
          <div className="rx-shell rx-howp-not-inner">
            <p className="rx-kicker">Clarity</p>
            <h2 className="rx-display rx-display-sm">RADR is not</h2>
            <ul>
              <li>another dashboard</li>
              <li>another alert feed</li>
              <li>another reconciliation project</li>
              <li>another consultant report</li>
            </ul>
            <p className="rx-howp-not-close">
              RADR continuously watches the operation and turns differences into
              verified value.
            </p>
            <div className="rx-ctas">
              <Link href="/solutions" className="rx-btn rx-btn-primary">
                See what RADR finds <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact" className="rx-btn rx-btn-ghost">
                See RADR in action
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
