import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";

const PLANS = [
  {
    id: "start",
    number: "01",
    name: "Recovery Pilot",
    tag: "Start focused",
    headline: "One problem. A clear proof path.",
    audience: "For operators evaluating RADR on a defined economic problem.",
    scope: "2–3 locations · agreed Decision class",
    focus: "Supplier / AP or reconciliation",
    evidence: "A scoped evidence package and outcome review",
    governance: "Named operator reviews each proposed action",
    next: "A go / no-go review before expanding",
    cta: "Discuss a pilot",
  },
  {
    id: "expand",
    number: "02",
    name: "Expand",
    tag: "Broader operations",
    headline: "One Decision layer. More of your operation.",
    audience:
      "For teams exploring ongoing coverage across more locations and systems.",
    scope: "Multiple locations · broader operating scope",
    focus: "Additional Decision classes, agreed together",
    evidence: "Cross-system context and a continuing value trail",
    governance: "Operating roles and approval rules scoped together",
    next: "Broader coverage as evidence supports it",
    cta: "Discuss Expand",
  },
  {
    id: "enterprise",
    number: "03",
    name: "Enterprise",
    tag: "Group scope",
    headline: "A shared picture. Local accountability.",
    audience:
      "For hospitality groups with multiple brands, entities or operating models.",
    scope: "Portfolio · multi-entity requirements",
    focus: "Group priorities and location-level accountability",
    evidence: "Portfolio reporting requirements and audit needs",
    governance: "Group policies and access requirements",
    next: "A tailored rollout and governance plan",
    cta: "Discuss Enterprise",
  },
] as const;
const ROWS = [
  ["Operating footprint", "scope"],
  ["Primary focus", "focus"],
  ["Evidence & review", "evidence"],
  ["Control & responsibility", "governance"],
  ["What happens next", "next"],
] as const;
const FAQ = [
  [
    "How much does RADR cost?",
    "Pricing is quoted after an initial scope review. There is no published monthly rate today. Your proposal defines the locations, evidence sources, responsibilities, delivery and commercial terms before you commit.",
  ],
  [
    "Are these three different products?",
    "No. These are three ways to scope a commercial conversation around the same RADR Decision layer. The main difference is the operating footprint and the governance you need.",
  ],
  [
    "What can I try today?",
    "Explore the interactive demo, compare decisions and review the evidence behind them. The demo uses sample data and does not change connected systems. Ask the team to confirm integration availability for your operation.",
  ],
  [
    "Are the scopes shown here available to buy immediately?",
    "Start with a scope conversation. We confirm availability, integration feasibility and delivery milestones in your agreement before you commit.",
  ],
  [
    "Can we start with a pilot and expand later?",
    "Yes, that is the intended progression. Define a focused problem first, agree how outcomes will be reviewed, then discuss a separate expansion scope if the evidence supports it. No savings or return is guaranteed.",
  ],
  [
    "What should we prepare for a pricing conversation?",
    "Bring your location count, operating model, current systems and one economic problem you want to examine. The Value Map can help structure that conversation; its modeled estimates are not a quote or verified savings.",
  ],
];

export function Pricing2030() {
  return (
    <div className="radr radr-mineral rm-premium rm-pricing">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rm-price-hero"
            data-nav-theme="light"
            aria-labelledby="pricing-title"
          >
            <div className="rx30-shell rm-price-hero-grid">
              <div>
                <p className="rx30-kicker">
                  Pricing · one product, three scopes
                </p>
                <h1 id="pricing-title">
                  Start focused.
                  <br />
                  Expand on <em>evidence.</em>
                </h1>
                <p className="rm-price-lead">
                  A clear starting point for your operation. A commercial scope
                  that grows with the work RADR is asked to do.
                </p>
                <div className="rx30-ctas">
                  <Link href="#plans" className="rx30-btn rx30-btn-primary">
                    Compare the scopes <span aria-hidden="true">↓</span>
                  </Link>
                  <Link
                    href="/contact?intent=sales"
                    className="rx30-btn rm-price-secondary"
                  >
                    Talk through pricing →
                  </Link>
                </div>
              </div>
              <aside
                className="rm-price-quote"
                aria-label="How your quote is built"
              >
                <FrozenRadrLogo variant="mark" theme="dark" width={36} />
                <p className="rm-price-overline">
                  Your operation sets the scope
                </p>
                <h2>
                  Custom quote.
                  <br />
                  Clear agreement.
                </h2>
                <p>
                  No published rate today. We agree the work, availability and
                  terms with you first.
                </p>
                <ol>
                  <li>
                    <span>01</span>Locations & operating model
                  </li>
                  <li>
                    <span>02</span>Evidence sources & Decision scope
                  </li>
                  <li>
                    <span>03</span>Responsibilities & delivery milestones
                  </li>
                </ol>
                <Link href="/value-calculator">
                  Prepare your Value Map <span aria-hidden="true">→</span>
                </Link>
              </aside>
            </div>
          </section>
          <section
            className="rm-plan-section"
            id="plans"
            aria-labelledby="plan-title"
            data-nav-theme="light"
          >
            <div className="rx30-shell">
              <div className="rm-section-heading">
                <div>
                  <p className="rx30-kicker">Find your starting point</p>
                  <h2 id="plan-title" className="rx30-h2">
                    Different scope.
                    <br />
                    The same Decision layer.
                  </h2>
                </div>
                <p>
                  The demo shows the broader operating vision. Begin with one
                  measurable problem, such as supplier credits or
                  reconciliation. Expand only after reviewing the evidence.
                </p>
              </div>
              <div className="rm-plan-grid">
                {PLANS.map((plan) => (
                  <article
                    key={plan.id}
                    className="rm-plan-card"
                    data-featured={plan.id === "expand" ? "true" : undefined}
                  >
                    <div className="rm-plan-top">
                      <span>{plan.number}</span>
                      <span>{plan.tag}</span>
                    </div>
                    <h3>{plan.name}</h3>
                    <p className="rm-plan-headline">{plan.headline}</p>
                    <p className="rm-plan-audience">{plan.audience}</p>
                    <div className="rm-plan-price">
                      <strong>Custom quote</strong>
                      <span>Scope & terms agreed with you</span>
                    </div>
                    <dl>
                      <div>
                        <dt>Footprint</dt>
                        <dd>{plan.scope}</dd>
                      </div>
                      <div>
                        <dt>Primary focus</dt>
                        <dd>{plan.focus}</dd>
                      </div>
                      <div>
                        <dt>Next step</dt>
                        <dd>{plan.next}</dd>
                      </div>
                    </dl>
                    <Link
                      className="rx30-btn"
                      href={`/contact?intent=sales&plan=${plan.id}`}
                    >
                      {plan.cta}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
              <p className="rm-availability">
                <strong>Agree the scope first</strong> Confirm integration
                availability, delivery milestones and responsibilities with the
                team before you commit. Explore the product through the demo.
              </p>
            </div>
          </section>
          <section
            className="rm-comparison-section"
            id="compare"
            data-nav-theme="light"
          >
            <div className="rx30-shell">
              <p className="rx30-kicker">The differences, at a glance</p>
              <h2 className="rx30-h2">Compare what changes.</h2>
              <p className="rm-compare-hint" id="scope-scroll-hint">
                Swipe across to compare all three scopes{" "}
                <span aria-hidden="true">↔</span>
              </p>
              <div
                className="rm-compare-scroll"
                role="region"
                aria-label="Compare proposed engagement scopes"
                aria-describedby="scope-scroll-hint"
                tabIndex={0}
              >
                <table className="rm-compare-table">
                  <caption>
                    Proposed scope comparison. All capabilities and delivery
                    subject to agreement.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Your operating need</th>
                      {PLANS.map((p) => (
                        <th key={p.id} scope="col">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(([label, key]) => (
                      <tr key={key}>
                        <th scope="row">{label}</th>
                        {PLANS.map((p) => (
                          <td key={p.id}>{p[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section className="rm-pricing-faq" data-nav-theme="light">
            <div className="rx30-shell rm-pricing-faq-grid">
              <div>
                <p className="rx30-kicker">Before we talk</p>
                <h2 className="rx30-h2">
                  Good questions.
                  <br />
                  Straight answers.
                </h2>
                <Link href="/developers#integrations">
                  Check integration availability →
                </Link>
              </div>
              <div>
                {FAQ.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
          <section className="rm-price-close" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Start with the right problem</p>
              <h2>
                Let’s scope the work
                <br />
                that matters to you.
              </h2>
              <p>Your systems. Your locations. One focused conversation.</p>
              <Link
                href="/contact?intent=sales"
                className="rx30-btn rx30-btn-primary"
              >
                Talk to RADR <span aria-hidden="true">→</span>
              </Link>
              <Link href="/demo" className="rm-close-demo">
                Explore the demo →
              </Link>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
