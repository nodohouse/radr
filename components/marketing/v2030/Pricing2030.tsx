import { PricingFitGuide } from "./PricingFitGuide";
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
import "@/app/pricing-compact.css";

// Proposed launch packages. Selection remains a setup preview, not checkout.
const PLANS = [
  {
    id: "start",
    number: "01",
    name: "Core",
    tag: "One location",
    headline: "Your daily operation. One clear picture.",
    audience: "For an independent restaurant, hotel or hospitality venue.",
    price: "Pricing coming soon",
    priceNote: "Monthly plan · 1 location",
    highlights: [
      "Evidence, Decisions and outcome tracking",
      "Supported structured data imports",
      "Guided setup and documentation",
    ],
  },
  {
    id: "expand",
    number: "02",
    name: "Expand",
    tag: "Up to 5 locations",
    headline: "See the differences. Connect the decisions.",
    audience:
      "For growing groups that want a shared view across their locations.",
    price: "Pricing coming soon",
    priceNote: "Monthly plan · up to 5 locations",
    highlights: [
      "Everything in Core, across 5 locations",
      "A shared operating picture",
      "Location comparisons and shared context",
    ],
  },
  {
    id: "enterprise",
    number: "03",
    name: "Portfolio",
    tag: "Up to 20 locations",
    headline: "A wider view. The same simple setup.",
    audience:
      "For larger hospitality groups managing a broader location estate.",
    price: "Pricing coming soon",
    priceNote: "Monthly plan · up to 20 locations",
    highlights: [
      "Everything in Expand, across 20 locations",
      "The same guided setup and documentation",
      "A consolidated portfolio view",
    ],
  },
] as const;
type Inclusion = { status: "included" | "pending" | "excluded"; label: string };
const included = (label = "Included"): Inclusion => ({
  status: "included",
  label,
});
const pending: Inclusion = {
  status: "pending",
  label: "Published before launch",
};
const excluded: Inclusion = { status: "excluded", label: "Not included" };
const COMPARISON: {
  label: string;
  description: string;
  cells: [Inclusion, Inclusion, Inclusion];
}[] = [
  {
    label: "Location capacity",
    description: "A location is one restaurant, hotel or operating venue.",
    cells: [
      included("1 location"),
      included("Up to 5 locations"),
      included("Up to 20 locations"),
    ],
  },
  {
    label: "Decision workflow",
    description: "Review priorities, evidence and proposed next steps.",
    cells: [included(), included(), included()],
  },
  {
    label: "Evidence and outcome tracking",
    description: "Follow what happened, with source evidence attached.",
    cells: [included(), included(), included()],
  },
  {
    label: "Your team stays in control",
    description: "Your operators review proposed actions in the product.",
    cells: [included(), included(), included()],
  },
  {
    label: "Guided setup",
    description:
      "Follow the product checklist and prepare your own supported data files.",
    cells: [included(), included(), included()],
  },
  {
    label: "Documentation",
    description:
      "Use setup guidance, file requirements and integration availability notes.",
    cells: [included(), included(), included()],
  },
  {
    label: "Location comparisons",
    description:
      "Compare performance and operating context across your locations.",
    cells: [excluded, included(), included()],
  },
  {
    label: "Portfolio overview",
    description: "A consolidated view for a larger location estate.",
    cells: [excluded, excluded, included()],
  },
  {
    label: "Structured data allowance",
    description:
      "Numeric data and processing limits will be published with final pricing.",
    cells: [pending, pending, pending],
  },
  {
    label: "Setup fee",
    description:
      "The proposed packages use the same guided setup, without a separate implementation engagement.",
    cells: [
      included("No setup fee"),
      included("No setup fee"),
      included("No setup fee"),
    ],
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
        ) : value.status === "pending" ? (
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
    "When will pricing be available?",
    "Monthly prices and numeric usage allowances are being finalized. They will be published before paid activation, so you can compare standard packages without requesting a custom quote. Selecting a plan here previews setup; it does not start a payment or subscription.",
  ],
  [
    "Can I explore RADR before choosing a plan?",
    "Yes. Register for the free fictional restaurant or hotel demo and explore at your own pace. There is no immediate pricing prompt or automatic conversion to a paid plan.",
  ],
  [
    "Do I need a sales call or an onboarding specialist?",
    "The standard setup path is self-guided: choose your operation, follow the checklist and prepare supported data files. Your team owns its data and reviews proposed actions. The packages do not include a dedicated account manager, data-cleaning service or bespoke implementation.",
  ],
  [
    "Is there a separate setup fee?",
    "Guided setup and documentation are part of the proposed packages, rather than a separately sold implementation service. Final subscription terms will be published before paid activation. There is no setup charge on this preview.",
  ],
  [
    "What does a location mean?",
    "A location is one restaurant, hotel or operating venue. Core is designed for one location, Expand for up to five and Portfolio for up to twenty. A hotel's rooms are part of that hotel's location, rather than separate locations.",
  ],
  [
    "What if I need more locations or data?",
    "Choose a larger standard package when its location capacity fits. Data and processing limits, capacity upgrades and billing terms will be published before paid activation. No automatic overage charge is enabled in this preview.",
  ],
  [
    "Can RADR connect to any system automatically?",
    "Check the documented file requirements and provider availability first. A provider logo does not guarantee a live connection. The packages do not include building custom integrations or a managed data-migration service.",
  ],
  [
    "Do you take a percentage of our savings?",
    "No percentage of modeled or expected savings is part of these packages. The proposed model is a standard subscription. Expected value remains separate from an evidenced, verified outcome.",
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
                  Pricing · standard monthly packages
                </p>
                <h1 id="pricing-title">
                  One platform. <em>Simple plans.</em>
                </h1>
                <p className="rm-price-lead">
                  Choose your location capacity. Every package includes
                  evidence, Decisions and outcome tracking.
                </p>
              </div>
              <nav className="rm-price-jumps" aria-label="Pricing shortcuts">
                <Link href="#compare">
                  Compare all features <span aria-hidden="true">↓</span>
                </Link>
                <Link href="/demo">
                  Explore the free demo <span aria-hidden="true">→</span>
                </Link>
              </nav>
            </div>
          </section>
          <section
            className="rm-plan-section"
            id="plans"
            aria-labelledby="plan-title"
            data-nav-theme="light"
          >
            <div className="rx30-shell">
              <h2 id="plan-title" className="rm-plans-label">
                Choose your package
              </h2>
              <div className="rm-plan-grid">
                {PLANS.map((plan) => (
                  <article
                    key={plan.id}
                    id={`plan-${plan.id}`}
                    className="rm-plan-card"
                    data-featured={plan.id === "expand" ? "true" : undefined}
                  >
                    <div className="rm-plan-top">
                      <h3>{plan.name}</h3>
                      <span>{plan.tag}</span>
                    </div>
                    <p className="rm-plan-headline">{plan.headline}</p>
                    <div className="rm-plan-price">
                      <strong>{plan.price}</strong>
                      <span>{plan.priceNote}</span>
                    </div>
                    <p className="rm-plan-quick-feature">
                      {plan.id === "start"
                        ? plan.highlights[0]
                        : plan.highlights[2]}
                    </p>
                    <details className="rm-plan-inclusions">
                      <summary>
                        What’s included <span aria-hidden="true">+</span>
                      </summary>
                      <ul
                        className="rm-plan-highlights"
                        aria-label={`${plan.name} package highlights`}
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
                      <p className="rm-plan-audience">{plan.audience}</p>
                    </details>
                    <PlanLink className="rx30-btn" href={nextHref(plan.id)}>
                      {`Preview ${plan.name}`}
                      <span aria-hidden="true">→</span>
                    </PlanLink>
                  </article>
                ))}
              </div>
              <p className="rm-availability">
                <strong>Monthly pricing is being finalized</strong> Prices and
                usage limits will be published before paid activation. Explore
                the packages and preview setup now. No payment or subscription
                starts here.
              </p>
              <div className="rm-price-tools">
                <details className="rm-price-tool-fit">
                  <summary>
                    Help me choose by location count{" "}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <PricingFitGuide />
                </details>
                <details className="rm-price-tool-setup">
                  <summary>
                    How the packages and setup work{" "}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <aside
                    className="rm-price-quote"
                    aria-label="How the packages work"
                  >
                    <FrozenRadrLogo variant="mark" theme="dark" width={36} />
                    <p className="rm-price-overline">
                      Built for self-guided setup
                    </p>
                    <h2>
                      Choose a plan.
                      <br />
                      Make your move.
                    </h2>
                    <p>
                      One subscription for the product. Guided setup and clear
                      documentation, with your team in control.
                    </p>
                    <ol>
                      <li>
                        <span>01</span>Clear monthly location capacity
                      </li>
                      <li>
                        <span>02</span>Defined structured data allowance
                      </li>
                      <li>
                        <span>03</span>Guided setup, without a setup fee
                      </li>
                    </ol>
                    <Link href="/value-calculator">
                      Prepare your Value Map <span aria-hidden="true">→</span>
                    </Link>
                  </aside>
                </details>
              </div>
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
                One location, a growing group or a wider portfolio. Compare the
                capacity and product features in each standard package.
              </p>
              <div className="rm-compare-legend" aria-label="Comparison key">
                <InclusionCell value={included("Included in the package")} />
                <InclusionCell value={pending} />
                <InclusionCell value={excluded} />
              </div>
              <p className="rm-compare-hint" id="scope-scroll-hint">
                Swipe across to compare all three plans{" "}
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
                    Proposed standard packages with guided setup and
                    documentation. Monthly prices and usage limits are pending.
                    Provider availability follows the documented connection
                    status.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Your operating need</th>
                      {PLANS.map((p) => (
                        <th key={p.id} scope="col">
                          {p.name}
                          <span className="rm-compare-price">
                            Price pending
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
                <p className="rx30-kicker">Before you choose</p>
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
                Explore at your own pace. Choose the capacity your operation
                needs.
              </p>
              <Link href="/demo" className="rx30-btn rx30-btn-primary">
                Explore the free demo <span aria-hidden="true">→</span>
              </Link>
              <Link href="#plans" className="rm-close-demo">
                Compare the plans ↑
              </Link>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
