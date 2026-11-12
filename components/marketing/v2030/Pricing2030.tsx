import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  planRegistrationHref,
  planSetupPreviewHref,
  type PublicPlanId,
  type DemoWorld,
} from "@/lib/marketing/conversionJourney";
import "@/app/pricing-journey.css";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";

const PLANS = [
  {
    id: "start",
    number: "01",
    name: "Core",
    tag: "Focused rollout",
    headline: "One priority. A complete Decision loop.",
    audience:
      "For a hospitality team starting with a defined operating problem and named locations.",
    price: "Annual subscription",
    priceNote: "Platform minimum + agreed location coverage",
    highlights: [
      "One agreed operating priority",
      "Evidence, review and outcome tracking",
      "Named locations and usage allowance",
    ],
  },
  {
    id: "expand",
    number: "02",
    name: "Expand",
    tag: "Multi-location",
    headline: "Connect the decisions across your estate.",
    audience:
      "For teams comparing locations and managing several operating priorities together.",
    price: "Annual subscription",
    priceNote: "Platform + multi-location coverage",
    highlights: [
      "Everything in Core, across locations",
      "Several agreed operating priorities",
      "Location comparisons and shared context",
    ],
  },
  {
    id: "enterprise",
    number: "03",
    name: "Enterprise",
    tag: "Portfolio scope",
    headline: "Group direction. Local accountability.",
    audience:
      "For groups coordinating multiple brands, entities and more complex rollout requirements.",
    price: "Portfolio agreement",
    priceNote: "Annual minimum + tailored estate scope",
    highlights: [
      "Everything in Expand",
      "Multi-brand and entity scope",
      "Governance and rollout requirements",
    ],
  },
] as const;
type Inclusion = { status: "included" | "scoped" | "excluded"; label: string };
const included = (label = "Included"): Inclusion => ({
  status: "included",
  label,
});
const scoped = (label = "Quoted separately"): Inclusion => ({
  status: "scoped",
  label,
});
const excluded: Inclusion = { status: "excluded", label: "Not included" };
const COMPARISON: {
  label: string;
  description: string;
  cells: [Inclusion, Inclusion, Inclusion];
}[] = [
  {
    label: "Decision workflow",
    description: "Review a priority, its evidence and the proposed next step.",
    cells: [included(), included(), included()],
  },
  {
    label: "Evidence and outcome tracking",
    description: "Keep the source evidence and follow what happened afterward.",
    cells: [included(), included(), included()],
  },
  {
    label: "Human review of actions",
    description: "An operator reviews proposed actions in every scope.",
    cells: [included(), included(), included()],
  },
  {
    label: "Operating priorities",
    description:
      "The problems RADR is scoped to examine, such as reconciliation or service pressure.",
    cells: [
      included("One agreed priority"),
      included("Several agreed priorities"),
      included("Group priorities"),
    ],
  },
  {
    label: "Location coverage",
    description: "The named restaurants, hotels or properties in your agreement.",
    cells: [
      included("Focused rollout"),
      included("Multi-location"),
      included("Portfolio-wide scope"),
    ],
  },
  {
    label: "Location comparisons",
    description: "Review differences and trends across your estate.",
    cells: [excluded, included(), included()],
  },
  {
    label: "Multi-brand and entity scope",
    description:
      "Coordinate the requirements of several brands or legal entities.",
    cells: [excluded, excluded, included()],
  },
  {
    label: "Group governance and rollout",
    description:
      "Agree portfolio policies, responsibilities and rollout milestones.",
    cells: [excluded, excluded, included("Tailored requirements")],
  },
  {
    label: "Usage allowance",
    description:
      "Data volume, refresh frequency and processing limits are defined in your quote.",
    cells: [
      included("Defined allowance"),
      included("Estate allowance"),
      included("Tailored allowance"),
    ],
  },
  {
    label: "Onboarding and custom work",
    description:
      "Data mapping, training and any non-standard integration work are scoped before setup.",
    cells: [scoped(), scoped(), scoped()],
  },
];

function InclusionCell({ value }: { value: Inclusion }) {
  return (
    <div className="rm-inclusion" data-status={value.status}>
      <span className="rm-inclusion-icon" aria-hidden="true">
        {value.status === "included" ? (
          <svg viewBox="0 0 20 20" width="18" height="18">
            <path
              d="m5 10 3.2 3.2L15 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : value.status === "scoped" ? (
          "○"
        ) : (
          "×"
        )}
      </span>
      <span>{value.label}</span>
    </div>
  );
}

const FAQ = [
  [
    "How much does RADR cost?",
    "RADR is quoted as an annual subscription with a platform minimum and agreed location coverage. Your quote states the total, billing schedule, included usage and support. Onboarding and any custom work are itemized separately. There is no published self-service rate or automatic charge on this website.",
  ],
  [
    "Can I explore RADR before committing?",
    "Yes. Register to explore the free restaurant or hotel demo at your own pace. It uses fictional data and does not connect your systems. A rollout using your own data is scoped and priced separately.",
  ],
  [
    "Why an annual agreement?",
    "Connecting evidence, reviewing decisions and tracking outcomes is an ongoing operating process. An annual scope gives your team a defined budget and a rollout plan. The start date, billing schedule, renewal and cancellation terms are stated in the written agreement before you commit.",
  ],
  [
    "What does onboarding cover?",
    "A separately priced setup scope covers the agreed data mapping, configuration, training and launch review. Any data cleanup, custom integration or historical backfill is itemized before work begins. Compatibility and delivery dates are confirmed first.",
  ],
  [
    "What happens if our usage or estate grows?",
    "Your quote defines named locations, evidence sources, data volumes, refresh frequency and processing allowances. Additional locations or work require an approved scope change and price. The agreement sets how a limit is handled; this website does not enable automatic overage billing.",
  ],
  [
    "Do you take a percentage of our savings?",
    "The standard model is a subscription, not a share of modeled or expected savings. A value estimate is not a billable outcome. Any alternative commercial arrangement would require a separate written agreement and an accepted verification method.",
  ],
  [
    "Are all integrations available immediately?",
    "Availability, source access, permissions and delivery milestones are confirmed before commitment. Package checkmarks describe the proposed commercial scope, not a promise that every provider connection or enterprise requirement is already available.",
  ],
  [
    "Can we start with a smaller scope?",
    "Yes. Core starts with one operating priority and named locations. Expand adds multi-location comparisons and several agreed priorities. Enterprise addresses portfolio requirements. Evidence, human review and outcome tracking remain part of every scope.",
  ],
];

export function Pricing2030({
  fromDemo = false,
  vertical = "restaurant",
}: {
  fromDemo?: boolean;
  vertical?: DemoWorld;
}) {
  const PlanLink = fromDemo ? NextLink : Link;
  const nextHref = (plan: PublicPlanId) =>
    fromDemo
      ? planSetupPreviewHref(plan, vertical)
      : planRegistrationHref(plan);
  return (
    <div className="radr radr-mineral rm-premium rm-pricing">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          {fromDemo ? (
            <div className="rx30-shell">
              <aside className="rm-demo-return">
                <div>
                  <small>YOUR NEXT STEP</small>
                  <strong>
                    From the {vertical} demo to your own operation.
                  </strong>
                  <p>
                    Choose a plan to preview setup. Your plan choice carries
                    into the setup preview. No subscription starts here.
                  </p>
                </div>
                <NextLink href="/app?stay=1">Back to the demo →</NextLink>
              </aside>
            </div>
          ) : null}
          <section
            className="rm-price-hero"
            data-nav-theme="light"
            aria-labelledby="pricing-title"
          >
            <div className="rx30-shell rm-price-hero-grid">
              <div>
                <p className="rx30-kicker">
                  Pricing · built around your operation
                </p>
                <h1 id="pricing-title">
                  One platform.
                  <br />
                  A clear <em>agreement.</em>
                </h1>
                <p className="rm-price-lead">
                  Explore the demo for free. When you are ready for your own
                  operation, agree an annual subscription, location coverage
                  and a clearly priced setup.
                </p>
                <div className="rx30-ctas">
                  <Link href="#plans" className="rx30-btn rx30-btn-primary">
                    Compare the plans <span aria-hidden="true">↓</span>
                  </Link>
                  <Link href="/demo" className="rx30-btn rm-price-secondary">
                    Explore the free demo →
                  </Link>
                </div>
              </div>
              <aside
                className="rm-price-quote"
                aria-label="How your quote is built"
              >
                <FrozenRadrLogo variant="mark" theme="dark" width={36} />
                <p className="rm-price-overline">
                  Your quote, clearly separated
                </p>
                <h2>
                  Know the scope.
                  <br />
                  Know the cost.
                </h2>
                <p>
                  One recurring subscription. One separately scoped setup.
                  The price and delivery are agreed before work begins.
                </p>
                <ol>
                  <li>
                    <span>01</span>Annual platform + location coverage
                  </li>
                  <li>
                    <span>02</span>Included processing + support allowance
                  </li>
                  <li>
                    <span>03</span>One-time onboarding + any custom work
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
                  Choose how much of your operation to cover. Every scope
                  includes evidence, human review and outcome tracking.
                  Locations, usage and delivery are agreed in your proposal.
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
                    <div className="rm-plan-scale" aria-hidden="true">
                      {[0, 1, 2].map((level) => (
                        <i
                          key={level}
                          data-on={level <= PLANS.indexOf(plan) || undefined}
                        />
                      ))}
                    </div>
                    <h3>{plan.name}</h3>
                    <p className="rm-plan-headline">{plan.headline}</p>
                    <p className="rm-plan-audience">{plan.audience}</p>
                    <div className="rm-plan-price">
                      <strong>{plan.price}</strong>
                      <span>{plan.priceNote}</span>
                    </div>
                    <ul
                      className="rm-plan-highlights"
                      aria-label={`${plan.name} scope highlights`}
                    >
                      {plan.highlights.map((highlight) => (
                        <li key={highlight}>
                          <svg viewBox="0 0 20 20" aria-hidden="true">
                            <path
                              d="m5 10 3.2 3.2L15 6.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <PlanLink className="rx30-btn" href={nextHref(plan.id)}>
                      {`Plan with ${plan.name}`}
                      <span aria-hidden="true">→</span>
                    </PlanLink>
                  </article>
                ))}
              </div>
              <p className="rm-availability">
                <strong>Choosing a scope starts a preview</strong> Review setup
                without starting a subscription. A written proposal confirms
                fees, source availability, delivery and responsibilities before
                any commitment.
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
              <h2 className="rx30-h2">What’s included. Side by side.</h2>
              <p className="rm-compare-intro">
                A focused rollout, connected multi-location decisions, or
                portfolio requirements. The scope grows; the evidence and
                review standard stays.
              </p>
              <div className="rm-compare-legend" aria-label="Comparison key">
                <InclusionCell
                  value={included("Included in the package scope")}
                />
                <InclusionCell value={scoped("Separately priced work")} />
                <InclusionCell value={excluded} />
              </div>
              <p className="rm-compare-hint" id="scope-scroll-hint">
                Swipe across to compare all three scopes{" "}
                <span aria-hidden="true">↔</span>
              </p>
              <div
                className="rm-compare-scroll"
                role="region"
                aria-label="Compare package inclusions"
                aria-describedby="scope-scroll-hint"
                tabIndex={0}
              >
                <table className="rm-compare-table">
                  <caption>
                    Checkmarks describe proposed package scope. Every plan has an
                    agreed usage allowance. Onboarding, non-standard integrations
                    and delivery are confirmed and priced before setup.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Your operating need</th>
                      {PLANS.map((p) => (
                        <th key={p.id} scope="col">
                          {p.name}
                          <span className="rm-compare-price">
                            {p.id === "enterprise"
                              ? "Portfolio quote"
                              : "Annual quote"}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">
                          {row.label}
                          <span className="rm-compare-description">
                            {row.description}
                          </span>
                        </th>
                        {row.cells.map((cell, index) => (
                          <td key={PLANS[index].id}>
                            <InclusionCell value={cell} />
                          </td>
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
                See the operation.
                <br />
                Then decide.
              </h2>
              <p>
                Explore the free demo. Build a rollout around what matters to
                you.
              </p>
              <Link href="/demo" className="rx30-btn rx30-btn-primary">
                Explore the free demo <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact?intent=pricing" className="rm-close-demo">
                Prepare your rollout brief →
              </Link>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
