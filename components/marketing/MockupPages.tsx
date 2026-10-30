import { BrandPortrait, PlanPortrait } from "./PremiumBrandPanels";
import { OperatingCanvas } from "./OperatingCanvas";
import { RouteChapterBand } from "./SiteExperience";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "./MarketingShell";
import { MockupFooter } from "./MockupFooter";
import {
  PortfolioPreview,
  DataFoundation,
  Glyph,
  RolePreview,
  Sparkline,
} from "./MockupVisuals";
import {
  OperatingTable,
  InsightPanel,
  OperationSelector,
  OperationProvider,
} from "./MockupInteractive";
import { MockupCalculator } from "./MockupCalculator";
import { pricingConfig, faqItems } from "./pricing/config";
import { MotionScene } from "./MotionScene";
import { SolutionsStory } from "./SolutionsStory";
import "./mockup-pages.css";

function Buttons({
  primary = "Book a demo",
  href = "/contact",
  secondary = "Explore the platform",
  secondaryHref = "/how",
}: {
  primary?: string;
  href?: string;
  secondary?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mx-buttons">
      <Link className="mx-button" href={href}>
        {primary}
        <span aria-hidden="true">→</span>
      </Link>
      <Link className="mx-button mx-button-outline" href={secondaryHref}>
        {secondary}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
function Heading({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: React.ReactNode;
  copy?: string;
}) {
  return (
    <div className="mx-section-copy">
      <p className="mx-kicker">{kicker}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
function MockHero({
  kind,
  title,
  copy,
  children,
}: {
  kind: string;
  title: React.ReactNode;
  copy: string;
  children?: React.ReactNode;
}) {
  return (
    <>
    <section className={`mx-hero mx-hero-${kind}`} id="overview">
      <div className="mx-wrap mx-hero-grid">
        <div>
          <p className="mx-kicker">
            {kind === "platform"
              ? "HOSPITALITY OPERATING INTELLIGENCE"
              : kind === "solutions"
                ? "SOLUTIONS FOR HOSPITALITY"
                : kind.toUpperCase()}
          </p>
          <h1>{title}</h1>
          <p>{copy}</p>
          <Buttons
            primary={kind === "pricing" ? "Compare plans" : "Book a demo"}
            href={kind === "pricing" ? "#plans" : "/contact"}
            secondary={
              kind === "company" ? "Our story" : kind === "pricing" ? "Talk to us" : "Explore the platform"
            }
            secondaryHref={
              kind === "pricing"
                ? "/contact"
                : kind === "company"
                ? "#mission"
                : kind === "platform"
                  ? "#foundation"
                  : "/how"
            }
          />
        </div>
        {children}
      </div>
    </section>
    <RouteChapterBand />
    </>
  );
}
export function MockupBottomCTA() {
  return (
    <section className="mx-bottom-cta">
      <div className="mx-wrap">
        <p className="mx-kicker">YOUR NEXT OPPORTUNITY IS IN THE DETAILS.</p>
        <h2>
          See{" "}
          <Image
            className="mx-wordmark"
            src="/brand/radr-wordmark-balanced-white.svg"
            width={240}
            height={55}
            alt="RADR"
          />{" "}
          in action<span>.</span>
        </h2>
        <p>
          Supplier discrepancies. Missed credits. Revenue opportunities.
          <br />
          See where your team should look next.
        </p>
        <Buttons />
      </div>
    </section>
  );
}
export function MockupPlatform() {
  return (
    <PageShell>
      <div className="mx-page ps-page">
        <MockHero
          kind="platform"
          title={
            <>
              Connect signals.
              <br />
              Create decisions.
              <br />
              Verify value<span>.</span>
            </>
          }
          copy="RADR turns your hospitality data into a real-time operating intelligence layer, across restaurants, hotels, and multi-site groups."
        >
          <PortfolioPreview />
        </MockHero>
        <section
          className="mx-section mx-dark mx-curved-bottom ps-foundation-section"
          id="foundation"
        >
          <div className="mx-wrap mx-split">
            <div>
              <Heading
                kicker="UNIFIED DATA FOUNDATION"
                title={
                  <>
                    Connect all your
                    <br />
                    hospitality data<span>.</span>
                  </>
                }
                copy="Bring together data from across your operations, POS, PMS, finance, procurement, labor and more, into a single, clean foundation."
              />
              <Link
                className="mx-button mx-small-button"
                href="/solutions#operation-types"
              >
                Explore data sources →
              </Link>
            </div>
            <DataFoundation />
          </div>
        </section>
        <section className="mx-section mx-light" id="operating-state">
          <div className="mx-wrap mx-split">
            <div>
              <Heading
                kicker="REAL-TIME OPERATING STATE"
                title={
                  <>
                    See the full picture.
                    <br />
                    Not just a data point<span>.</span>
                  </>
                }
                copy="RADR continuously monitors your operations, connects the dots, and shows what’s happening across every location, in real time."
              />
              <Link className="mx-button mx-small-button" href="/contact">
                Explore operating state →
              </Link>
            </div>
            <OperatingTable />
          </div>
        </section>
        <section
          className="mx-section mx-dark mx-insight-section"
          id="intelligence"
        >
          <div className="mx-wrap mx-split">
            <div>
              <Heading
                kicker="FROM INSIGHT TO ACTION"
                title={
                  <>
                    Create better
                    <br />
                    decisions, faster<span>.</span>
                  </>
                }
                copy="RADR identifies what matters, explains why, and recommends the best next steps, so your team can move from reactive to in control."
              />
              <Link className="mx-button mx-small-button" href="#decisions">
                See how it works →
              </Link>
            </div>
            <InsightPanel />
          </div>
        </section>
        <section className="mx-section mx-light" id="decisions">
          <div className="mx-wrap mx-value-proof">
            <Heading
              kicker="VERIFY REAL BUSINESS VALUE"
              title={
                <>
                  Prove what’s working<span>.</span>
                </>
              }
              copy="Track your actions against clear evidence and outcomes. A potential opportunity is not a verified result."
            />
            <div className="mx-proof-chart">
              <p>
                <Glyph name="check" size={17} /> Value verification ·
                illustrative
              </p>
              <strong>$28K</strong>
              <span>Modeled opportunity</span>
              <Sparkline />
              <div className="mx-proof-status">
                <span>
                  Observed <b>Pending</b>
                </span>
                <span>
                  Verified <b>$0</b>
                </span>
              </div>
            </div>
            <div className="mx-proof-photo">
              <OperatingCanvas variant="portfolio" />
              <div>
                <strong>
                  From location performance
                  <br />
                  to portfolio impact.
                </strong>
                <p>Keep the context behind the outcome.</p>
              </div>
            </div>
          </div>
          <div className="mx-wrap mx-roles">
            <Heading
              kicker="BUILT FOR EVERY ROLE"
              title={
                <>
                  The right view for
                  <br />
                  every leader<span>.</span>
                </>
              }
            />
            <div className="mx-role-cards">
              {[
                [
                  "Operators",
                  "Run great shifts and stronger locations.",
                  "gear",
                ],
                ["Finance", "Track performance and profitability.", "document"],
                ["Procurement", "Control costs and reduce variance.", "box"],
                ["Labor", "Optimize staffing and productivity.", "labor"],
                ["Leadership", "See the big picture and plan ahead.", "chart"],
              ].map(([name, copy, icon]) => (
                <article key={name}>
                  <Glyph name={icon} />
                  <h3>{name}</h3>
                  <p>{copy}</p>
                  <RolePreview role={name} />
                </article>
              ))}
            </div>
          </div>
          <p className="mx-wrap mx-example-disclosure">
            Product interfaces are illustrative. Data connections and advanced
            capabilities are scoped and confirmed for each operation.
          </p>
        </section>
        <MockupBottomCTA />
      </div>
    </PageShell>
  );
}

const solutionAreas = [
  {
    id: "labor",
    title: "Labor",
    icon: "labor",
    copy: "Right-size staffing, improve productivity, and understand costs in context.",
  },
  {
    id: "pricing-yield",
    title: "Pricing & Yield",
    icon: "chart",
    copy: "Review menu and room pricing with demand, mix, channel fees and evidence.",
  },
  {
    id: "guest-experience",
    title: "Guest Experience",
    icon: "heart",
    copy: "Understand guest signals and the operating context behind each experience.",
  },
  {
    id: "procurement",
    title: "Procurement",
    icon: "box",
    copy: "Compare supplier pricing, agreements and discrepancies worth investigating.",
  },
  {
    id: "reconciliation",
    title: "Reconciliation",
    icon: "document",
    copy: "Keep track of differences, credits and outstanding value for review.",
  },
  {
    id: "operations",
    title: "Operations",
    icon: "gear",
    copy: "Unify the operating picture and see what needs attention next.",
  },
];
export function MockupSolutions() {
  return (
    <PageShell>
      <OperationProvider>
        <div className="mx-page ps-page">
          <SolutionsStory />
          <RouteChapterBand />
          <OperationSelector compact />
          <section className="mx-section mx-light">
            <div className="mx-wrap mx-split">
              <Heading
                kicker="SOLUTION AREAS"
                title={
                  <>
                    Every decision.
                    <br />A clearer path forward<span>.</span>
                  </>
                }
                copy="RADR connects the important parts of your operation and puts the evidence behind the next step in view."
              />
              <div className="mx-solution-grid">
                {solutionAreas.map((area) => (
                  <article key={area.id} id={area.id}>
                    <Glyph name={area.icon} />
                    <h3>{area.title}</h3>
                    <p>{area.copy}</p>
                    <Link href={`/contact?interest=${area.id}`}>
                      Explore {area.title.toLowerCase()} →
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="mx-section mx-dark">
            <div className="mx-wrap mx-split">
              <div>
                <Heading
                  kicker="FROM SIGNALS TO DECISIONS"
                  title={
                    <>
                      See it. Understand it.
                      <br />
                      Take the right action<span>.</span>
                    </>
                  }
                  copy="RADR connects your data, adds context, and recommends a next step, with your team in control."
                />
                <Link className="mx-button mx-button-outline" href="/how">
                  See how it works →
                </Link>
              </div>
              <MotionScene
                className="mx-decision-flow"
                label="Signals to verified value"
              >
                <svg
                  className="mx-solution-streams"
                  viewBox="0 0 800 360"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <g key={i}>
                      <path
                        d={`M60 ${130 + i * 30}C170 ${130 + i * 30} 210 255 300 255S500 ${170 + i * 20} 760 ${170 + i * 20}`}
                        stroke="#71d8bd"
                        strokeOpacity=".25"
                        fill="none"
                      />
                      <path
                        className="mx-data-packet"
                        d={`M60 ${130 + i * 30}C170 ${130 + i * 30} 210 255 300 255S500 ${170 + i * 20} 760 ${170 + i * 20}`}
                        pathLength="100"
                        style={{ animationDelay: `${i * -0.5}s` }}
                      />
                    </g>
                  ))}
                </svg>
                {[
                  ["Signals", "Connect evidence across your systems.", "data"],
                  [
                    "Intelligence",
                    "Understand what matters in context.",
                    "spark",
                  ],
                  ["Decisions", "Review a clear next step.", "check"],
                  ["Value", "Track the outcome and verify impact.", "chart"],
                ].map(([title, copy, icon], i) => (
                  <article key={title}>
                    <Glyph name={icon} />
                    <h3>
                      {i + 1}. {title}
                    </h3>
                    <p>{copy}</p>
                    {i === 0 ? (
                      <div className="mx-flow-systems">
                        POS
                        <br />
                        PMS
                        <br />
                        Finance
                        <br />
                        Procurement
                        <br />
                        Labor
                      </div>
                    ) : i === 1 ? (
                      <div className="mx-flow-logo">
                        <Image
                          src="/brand/radr-wordmark-balanced-white.svg"
                          alt="RADR"
                          width={95}
                          height={22}
                        />
                        <small>Operating state</small>
                      </div>
                    ) : i === 2 ? (
                      <div className="mx-flow-note">
                        <b>Recommended action</b>
                        <p>Review staffing for dinner service</p>
                        <span>✓ Demand context</span>
                        <span>✓ Historical performance</span>
                        <span>✓ Human approval</span>
                      </div>
                    ) : (
                      <div className="mx-flow-note">
                        <b>Potential impact</b>
                        <span>Expected opportunity</span>
                        <strong>Requires review</strong>
                        <span>Verified value</span>
                        <strong>$0</strong>
                      </div>
                    )}
                  </article>
                ))}
              </MotionScene>
            </div>
            <p className="mx-wrap mx-example-disclosure">
              Illustrative operating model. Capabilities and integrations are
              confirmed during scoping.
            </p>
          </section>
          <OperationSelector />
          <MockupBottomCTA />
        </div>
      </OperationProvider>
    </PageShell>
  );
}

export function MockupPricing() {
  const plans = [
    {
      name: pricingConfig.free.name,
      subtitle: "Get started with RADR",
      copy: "A focused plan to explore the operation at a single property or small team.",
      price: pricingConfig.free.priceLabel,
      cta: "Start a pilot",
      features: [
        "1 property / location",
        "Core operating intelligence",
        "Standard integrations (scoped)",
        "Interactive dashboards",
        "Email support",
      ],
      ideal: "Independent hotels, single properties and teams exploring RADR.",
    },
    {
      name: pricingConfig.control.name,
      subtitle: "Built for growing operators",
      copy: "Advanced intelligence and broader visibility for multi-property groups.",
      price: pricingConfig.control.priceLabel,
      cta: "Book a demo",
      features: [
        "Up to 10 properties",
        "Core and advanced modules (scoped)",
        "Multi-property benchmarking (planned)",
        "Custom reports and exports (scoped)",
        "Role-based access (scoped)",
        "Priority support",
      ],
      ideal: "Regional groups and multi-property operators.",
    },
    {
      name: pricingConfig.scale.name,
      subtitle: "Tailored for global hospitality",
      copy: "A customized plan for complex operations with unique needs.",
      price: "Custom",
      cta: "Talk to sales",
      features: [
        "Portfolio scope tailored to your group",
        "Platform access (scoped)",
        "Custom integrations and data sources",
        "Dedicated success contact",
        "Custom modeling and reporting",
        "Onboarding and training",
        "Support arrangements by agreement",
      ],
      ideal: "Global hotel groups, brands and complex operations.",
    },
  ];
  return (
    <PageShell>
      <div className="mx-page ps-page">
        <MockHero
          kind="pricing"
          title={
            <>
              Intelligence
              <br />
              for every stage
              <br />
              of your operation<span>.</span>
            </>
          }
          copy="A clear plan for your operating scope. Compare what’s included, understand the investment and choose the right starting point."
        >
          <PlanPortrait />
        </MockHero>
        <section className="mx-section mx-pricing-section" id="plans">
          <div className="mx-wrap">
            <div className="mx-pricing-heading">
              <Heading
                kicker="PLANS FOR EVERY AMBITION"
                title={
                  <>
                    Simple, transparent
                    <br />
                    pricing<span>.</span>
                  </>
                }
              />
              <p>
                Whether you’re getting started or operating a global portfolio,
                RADR gives you a clearer operating picture and a practical path
                forward.
              </p>
            </div>
            <div className="mx-pricing-cards">
              {plans.map((plan, i) => (
                <article
                  key={plan.name}
                  className={i === 1 ? "mx-plan-featured" : ""}
                >
                  {i === 1 && (
                    <span className="mx-popular">● MOST POPULAR</span>
                  )}
                  <h3>{plan.name}</h3>
                  <h4>{plan.subtitle}</h4>
                  <p>{plan.copy}</p>
                  <div className="mx-price">
                    <strong>{plan.price}</strong>
                    {i < 2 && <span>/ month</span>}
                    <small>
                      {i < 2
                        ? "Billed annually"
                        : "Tailored to your organization"}
                    </small>
                  </div>
                  <Link
                    className="mx-button"
                    href={`/contact?plan=${plan.name.toLowerCase()}`}
                  >
                    {plan.cta} →
                  </Link>
                  <p className="mx-kicker">INCLUDES</p>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Glyph name="check" size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mx-plan-ideal">
                    <p className="mx-kicker">IDEAL FOR</p>
                    <p>
                      <Glyph
                        name={i === 0 ? "hotel" : i === 1 ? "labor" : "group"}
                      />
                      {plan.ideal}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mx-plan-note">
              Plan scope, feature availability and integrations are confirmed
              before agreement. Advanced capabilities may be in development.
              Online billing is not active.
            </p>
          </div>
        </section>
        <section className="mx-section mx-light">
          <div className="mx-wrap">
            <div className="mx-pricing-heading">
              <Heading
                kicker="MORE THAN SOFTWARE"
                title={
                  <>
                    Everything you need
                    <br />
                    to see value, fast<span>.</span>
                  </>
                }
              />
              <p>
                Connect the operation, understand the evidence, and build a
                practical starting point with your team.
              </p>
            </div>
            <div className="mx-service-grid">
              {[
                [
                  "Implementation",
                  "Guided setup tailored to your operation, with a clear plan and timeline.",
                  "box",
                ],
                [
                  "Integrations",
                  "Connect your existing systems with availability and scope agreed up front.",
                  "data",
                ],
                [
                  "Value modeling",
                  "Identify where to investigate and model potential impact transparently.",
                  "chart",
                ],
                [
                  "Ongoing support",
                  "Support and training arrangements tailored to your plan and agreement.",
                  "labor",
                ],
              ].map(([title, copy, icon]) => (
                <article key={title}>
                  <Glyph name={icon} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-section mx-dark mx-pricing-faq" id="faq">
          <div className="mx-wrap mx-faq-grid">
            <Heading
              kicker="FREQUENTLY ASKED QUESTIONS"
              title={
                <>
                  Common questions,
                  <br />
                  clear answers<span>.</span>
                </>
              }
            />
            <div>
              {faqItems.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
              <Link className="mx-button mx-button-outline" href="/contact">
                Still have questions? Contact us →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function MockupCompany() {
  return (
    <PageShell>
      <div className="mx-page ps-page">
        <MockHero
          kind="company"
          title={
            <>
              A more intelligent,
              <br />
              more human
              <br />
              hospitality industry<span>.</span>
            </>
          }
          copy="RADR exists to give hospitality operators the clarity to make better decisions, turning data into better experiences for every guest, every stay, every day."
        >
          <BrandPortrait />
        </MockHero>
        <section className="mx-section mx-light" id="mission">
          <div className="mx-wrap mx-mission-grid">
            <Heading
              kicker="OUR MISSION"
              title={
                <>
                  Turn hospitality data
                  <br />
                  into better decisions<span>.</span>
                </>
              }
              copy="We build a decision layer for hospitality, connecting data across operations, surfacing what matters, and helping teams act with clarity and confidence."
            />
            <div className="mx-mission-photo">
              <OperatingCanvas variant="operations" />
            </div>
            <ul className="mx-mission-benefits">
              {[
                ["Clearer insights", "chart"],
                ["Smarter operations", "gear"],
                ["Stronger teams", "labor"],
                ["Better guest experiences", "heart"],
              ].map(([title, icon]) => (
                <li key={title}>
                  <Glyph name={icon} size={19} />
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="mx-section mx-dark" id="approach">
          <div className="mx-wrap mx-split">
            <div>
              <Heading
                kicker="OUR POINT OF VIEW"
                title={
                  <>
                    Great hospitality
                    <br />
                    is a series of decisions<span>.</span>
                  </>
                }
                copy="Behind every memorable stay are decisions about people, resources, timing and experience. Better context helps teams make better decisions, and create more meaningful hospitality."
              />
              <Link className="mx-button mx-small-button" href="/how">
                Explore our approach →
              </Link>
            </div>
            <MotionScene
              className="mx-infinity"
              label="People data and better decisions"
            >
              <span>
                DATA
                <br />
                <small>A clearer view of what’s happening</small>
                <br />
                <br />
                PEOPLE
                <br />
                <small>Empowering teams to take action</small>
              </span>
              <svg viewBox="0 0 450 240" aria-hidden="true">
                <defs>
                  <linearGradient id="mx-infinity-color">
                    <stop stopColor="#2d9fc9" />
                    <stop offset=".45" stopColor="#a4f4c0" />
                    <stop offset="1" stopColor="#16b194" />
                  </linearGradient>
                  <filter id="mx-glow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>
                <path
                  d="M225 120C120-50 15 15 35 120S145 285 225 120 420-45 415 120 320 285 225 120Z"
                  fill="none"
                  stroke="url(#mx-infinity-color)"
                  strokeWidth="12"
                  opacity=".45"
                  filter="url(#mx-glow)"
                />
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d="M225 120C120-50 15 15 35 120S145 285 225 120 420-45 415 120 320 285 225 120Z"
                    fill="none"
                    stroke="url(#mx-infinity-color)"
                    strokeWidth={i === 0 ? 2 : 0.7}
                    transform={`translate(0 ${i * 5})`}
                  />
                ))}
                <path
                  className="mx-infinity-packet"
                  d="M225 120C120-50 15 15 35 120S145 285 225 120 420-45 415 120 320 285 225 120Z"
                  pathLength="100"
                  fill="none"
                  stroke="#c8ffe6"
                  strokeWidth="3"
                />
              </svg>
              <span>
                DECISIONS
                <br />
                <small>Turning insight into action</small>
                <br />
                <br />
                BETTER EXPERIENCES
                <br />
                <small>For guests, teams and business</small>
              </span>
            </MotionScene>
          </div>
        </section>
        <section className="mx-section mx-light">
          <div className="mx-wrap mx-split">
            <Heading
              kicker="WHY IT MATTERS"
              title={
                <>
                  Hospitality is more complex
                  <br />
                  than ever<span>.</span>
                </>
              }
              copy="From labor and supply costs to evolving guest expectations, operators navigate constant change. Data is everywhere, but often disconnected. RADR brings the picture together."
            />
            <div className="mx-company-cards">
              {[
                [
                  "More data. More complexity.",
                  "Disparate systems make the full picture hard to see.",
                  "/images/radr-restaurant.webp",
                ],
                [
                  "Higher expectations.",
                  "Guests expect seamless, personal experiences.",
                  "/images/radr-coastal-architecture.webp",
                ],
                [
                  "Faster decisions.",
                  "Teams need context to stay ahead.",
                  "/images/radr-pavilion-new.webp",
                ],
              ].map(([title, copy, image]) => (
                <article key={title}>
                  <div>
                    <Image
                      src={image}
                      fill
                      sizes="(max-width:700px) 90vw, 260px"
                      alt="Hospitality architecture and natural materials"
                    />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-global-photo">
          <div className="mx-wrap">
            <Heading
              kicker="A GLOBAL DESIGN OUTLOOK"
              title={
                <>
                  Built for a global industry.
                  <br />
                  Designed for what’s next<span>.</span>
                </>
              }
              copy="Designed around the realities of modern hospitality: diverse operations, brands and markets. A flexible operating picture that can grow with your needs."
            />
            <div className="mx-global-tags">
              <span>◯ BUILT FOR GLOBAL HOSPITALITY</span>
              <span>◇ FLEXIBLE BY DESIGN</span>
              <span>＋ YOUR NEXT OPPORTUNITY IS IN THE DETAILS.</span>
            </div>
          </div>
        </section>
        <section className="mx-section mx-light" id="values">
          <div className="mx-wrap mx-philosophy">
            <Heading
              kicker="OUR PHILOSOPHY"
              title={
                <>
                  Technology should amplify
                  <br />
                  what makes hospitality human<span>.</span>
                </>
              }
              copy="Technology should remove friction, not replace the human touch. empowering teams to focus on creating exceptional guest experiences."
            />
            <div className="mx-philosophy-image">
              <OperatingCanvas variant="people" />
            </div>
            <blockquote>
              “Hospitality has always been about people. Our job is to make it
              easier for them to do extraordinary things.”
              <cite>Our product philosophy</cite>
            </blockquote>
            <div className="mx-company-values">
              <p className="mx-kicker">OUR VALUES</p>
              {[
                ["Customer obsessed", "Keep the operator’s needs in view."],
                ["Make it real", "Turn ideas into useful work."],
                ["Think long term", "Build for what’s next."],
                ["Stronger together", "Make context available to the team."],
                ["More human hospitality", "Keep people at the center."],
              ].map(([title, copy]) => (
                <div key={title}>
                  <Glyph name="heart" size={15} />
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <MockupBottomCTA />
      </div>
    </PageShell>
  );
}
export function MockupCalculatorPage() {
  return (
    <div className="rp-site mx-page">
      <main>
        <MockupCalculator />
        <RouteChapterBand />
        <section className="mx-global-photo">
          <div className="mx-wrap">
            <Heading
              kicker="FROM INSIGHTS TO IMPACT"
              title={
                <>
                  Different operations.
                  <br />
                  Same intelligence layer<span>.</span>
                </>
              }
              copy="Whether you run a single restaurant, a global hotel group, or a mixed portfolio. explore where to investigate next, with your team in control."
            />
            <Buttons />
          </div>
        </section>
      </main>
      <MockupFooter />
    </div>
  );
}
