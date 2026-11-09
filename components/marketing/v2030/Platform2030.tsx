"use client";
import { ProductBriefPreview } from "./ProductBriefPreview";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";
import { PlatformWorkspaceShowcase } from "./PlatformWorkspaceShowcase";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";

const ARCHITECTURE = [
  {
    n: "01",
    title: "Evidence becomes context",
    body: "Source systems feed one operating model: baselines, freshness, and drivers.",
  },
  {
    n: "02",
    title: "Context becomes a Decision",
    body: "Futures compared. Cost of doing nothing made explicit. Confidence visible.",
  },
  {
    n: "03",
    title: "Decisions become outcomes",
    body: "Prepare or act within policy. Seal Verified Value only when evidence supports it.",
  },
] as const;

const DECISION_STEPS = [
  {
    title: "Evidence",
    heading: "Demand is ahead. Capacity is not.",
    body: "See demand and kitchen pressure together, so a busy room is not mistaken for a healthy service.",
    label: "The signal",
    value: "Kitchen pressure",
    foot: "Illustrative operating context",
  },
  {
    title: "Understand",
    heading: "Find the constraint behind the number.",
    body: "The question is not simply how many covers are coming. It is whether the kitchen can absorb the next seating wave without eroding the service.",
    label: "The constraint",
    value: "Next seating wave",
    foot: PUBLIC_RESTAURANT.displayName,
  },
  {
    title: "Futures",
    heading: "Compare the next move before making it.",
    body: "Keep the seating pace, or give the kitchen room to recover. The demo makes the trade-off visible before an operator chooses a path.",
    label: "One alternative",
    value: "Pace by 12 min",
    foot: "Modeled service scenario",
  },
  {
    title: "Recommendation",
    heading: "A specific call. Economics attached.",
    body: "Pace the next seating wave by 12 minutes. Keep the expected economic effect and confidence next to the recommendation, rather than buried in a separate dashboard.",
    label: "Expected protected",
    value: PUBLIC_RESTAURANT.expectedFormatted,
    foot: `Tonight · modeled · ${PUBLIC_RESTAURANT.confidenceLabel} confidence`,
  },
  {
    title: "Action",
    heading: "The operator stays in control.",
    body: "Review the evidence, compare the response and decide what happens next. Explore the process safely in the interactive demo.",
    label: "Your role",
    value: "Review the call",
    foot: "No external execution in this demo",
  },
  {
    title: "Verification",
    heading: "An expectation is not a verified outcome.",
    body: "Compare the expectation with the evidence after service. This separate completed-service example shows how protected value is reviewed.",
    label: "Completed-service example",
    value: PUBLIC_RESTAURANT.verifiedFormatted,
    foot: "Protected tonight · illustrative evidence trail",
  },
] as const;

const GOVERNANCE = [
  {
    title: "Confidence",
    body: "Every material recommendation shows how sure RADR is, and what would change the call.",
  },
  {
    title: "Policies",
    body: "Autonomy is per Decision type. Material external actions stay approval-gated unless you say otherwise.",
  },
  {
    title: "Approvals",
    body: "Prepared packages arrive ready to review: economics, options, and default clear.",
  },
  {
    title: "Auditability",
    body: "Evidence chain stays attached from detection through Verified Value.",
  },
] as const;

export function Platform2030() {
  const [beat, setBeat] = useState(0);
  const story = DECISION_STEPS[beat]!;

  return (
    <div className="radr radr-mineral rm-premium rm-platform">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page rm-page-hero-grid"
            data-nav-theme="light"
            aria-labelledby="rx30-plat-title"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <div className="rx30-shell rx30-bleed-copy rx30-bleed-copy--solo">
              <p className="rx30-kicker">Platform</p>
              <h1 id="rx30-plat-title" className="rx30-bleed-h1">
                Every signal.
                <br />
                One <em>decision layer.</em>
              </h1>
              <p className="rx30-bleed-lead">
                Connect source systems. Understand the operation. Prepare better
                Decisions. Act with control. Verify what happened. Remember what
                worked.
              </p>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/solutions"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore value leaks
                </Link>
              </div>
            </div>
            <aside className="rm-page-hero-visual">
              <ProductBriefPreview />
            </aside>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">01 · Decision architecture</p>
              <h2 className="rx30-h2">
                How evidence becomes operating context.
              </h2>
              <div className="rx30-flow-grid" style={{ marginTop: "2rem" }}>
                {ARCHITECTURE.map((f) => (
                  <article key={f.n}>
                    <em>{f.n}</em>
                    <strong>{f.title}</strong>
                    <span>{f.body}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">02 · The Decision</p>
              <h2 className="rx30-h2">
                From the first signal to the final proof.
              </h2>
              <div className="rm-decision-story">
                <div className="rm-decision-story-context">
                  <span>
                    {PUBLIC_RESTAURANT.decisionId} ·{" "}
                    {PUBLIC_RESTAURANT.contextLine}
                  </span>
                  <span>Synthetic walkthrough</span>
                </div>
                <div
                  className="rm-story-steps"
                  role="group"
                  aria-label="Follow a Decision"
                >
                  {DECISION_STEPS.map((step, i) => (
                    <button
                      key={step.title}
                      type="button"
                      aria-pressed={beat === i}
                      onClick={() => setBeat(i)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {step.title}
                    </button>
                  ))}
                </div>
                <div className="rm-story-content" key={beat}>
                  <div>
                    <p className="rm-story-label">{story.title}</p>
                    <h3>{story.heading}</h3>
                    <p>{story.body}</p>
                  </div>
                  <aside aria-label="Decision context">
                    <div className="rm-story-chart" aria-hidden="true">
                      <svg viewBox="0 0 300 95" fill="none">
                        <path
                          d="M0 76H300M0 43H300M0 10H300"
                          stroke="#ffffff20"
                        />
                        <path
                          d="M0 82L30 70L60 74L90 50L120 59L150 35L180 45L210 18L240 30L270 8L300 17"
                          stroke="#41f6a1"
                          strokeWidth="3"
                        />
                        <path
                          d="M0 80L300 36"
                          stroke="#82baff"
                          strokeDasharray="5 6"
                        />
                      </svg>
                    </div>
                    <span>{story.label}</span>
                    <strong>{story.value}</strong>
                    <small>{story.foot}</small>
                  </aside>
                </div>
              </div>
            </div>
          </section>

          <PlatformWorkspaceShowcase />

          <section className="rx30-pain" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">04 · Governance</p>
              <h2 className="rx30-h2">Control stays with the operator.</h2>
              <div className="rx30-pain-grid rx30-principles">
                {GOVERNANCE.map((g) => (
                  <article key={g.title} className="rx30-principle">
                    <strong>{g.title}</strong>
                    <span>{g.body}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">05 · Verified outcomes</p>
              <h2 className="rx30-h2">Expected · Observed · Verified.</h2>
              <p className="rx30-lead">
                RADR never blurs the three. Verified Value seals only when
                downstream evidence supports the economic outcome.
              </p>
              <div className="rx30-flow-grid" style={{ marginTop: "1.75rem" }}>
                <article>
                  <em>01</em>
                  <strong>Expected</strong>
                  <span>What the Decision forecasted before action.</span>
                </article>
                <article>
                  <em>02</em>
                  <strong>Observed</strong>
                  <span>What the operation actually recorded afterward.</span>
                </article>
                <article>
                  <em>03</em>
                  <strong>Verified</strong>
                  <span>
                    What evidence confirms, and Memory can learn from.
                  </span>
                </article>
              </div>
            </div>
          </section>

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">
                See the Decision layer in your operation.
              </h2>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/solutions"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Explore value leaks
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
