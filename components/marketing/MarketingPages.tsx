import Image from "next/image";
import Link from "next/link";
import {
  PageShell,
  PageHero,
  SectionHeading,
  MarketingCTA,
  Arrow,
} from "./MarketingShell";
import {
  SolutionExplorer,
  OpportunityCalculator,
} from "./MarketingInteractions";
import {
  ConnectSystems,
  DecisionPreview,
  Hospitality,
} from "./ReferenceSections";
import {
  pricingConfig,
  compareRows,
  faqItems,
  statusLabel,
} from "./pricing/config";
import { TRUST_CONTROLS } from "./config/trust";
import { ContactForm } from "./ContactForm";
import { contactEmail } from "./config/company";

const stages = [
  {
    name: "Detect",
    title: "Find the difference.",
    copy: "Compare what happened with what should have happened.",
  },
  {
    name: "Explain",
    title: "Understand why.",
    copy: "Trace the issue back to its source and put the potential impact in context.",
  },
  {
    name: "Act",
    title: "Choose the next step.",
    copy: "Review a recommendation with the supporting evidence attached.",
  },
  {
    name: "Learn",
    title: "Keep the knowledge.",
    copy: "Turn resolved patterns into controls for the next decision.",
  },
  {
    name: "Verify",
    title: "Close the loop.",
    copy: "Check what actually changed before calling the value realized.",
  },
];

export function PlatformPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="PLATFORM"
        title={
          <>
            One operating picture.
            <br />
            Every next decision.
          </>
        }
        description="Connect the evidence. Understand the difference. Bring your team to the next decision with a clearer picture of the operation."
      >
        <div className="rp-operating-card">
          <div className="rp-card-top">
            <Image
              src="/brand/radr-wordmark-clean-monochrome-black.svg"
              alt="RADR"
              width={95}
              height={23}
            />
            <span className="rp-status">Product concept</span>
          </div>
          <p className="rp-kicker">YOUR OPERATING PICTURE</p>
          <h2>
            Context changes
            <br />
            the decision.
          </h2>
          <div className="rp-operating-rows">
            {[
              {
                number: "01",
                title: "Evidence",
                text: "One place for the supporting facts",
                status: "Connected",
              },
              {
                number: "02",
                title: "Decision",
                text: "The next step, with a human in control",
                status: "Review",
              },
              {
                number: "03",
                title: "Outcome",
                text: "Track what happened after the action",
                status: "Verify",
              },
            ].map((row) => (
              <div key={row.number}>
                <span>{row.number}</span>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.text}</p>
                </div>
                <small>{row.status}</small>
              </div>
            ))}
          </div>
          <p className="rp-small">
            Illustrative interface · capabilities are expanding.
          </p>
        </div>
      </PageHero>
      <section className="rp-section rp-ivory" id="workflow">
        <div className="rp-container">
          <SectionHeading
            kicker="FROM SIGNAL TO OUTCOME"
            title={
              <>
                A decision has a lifecycle.
                <br />
                Keep the whole picture.
              </>
            }
            description="The operating model behind RADR: evidence first, a human decision next, and verification at the end."
          />
          <div className="rp-workflow">
            {stages.map((stage, i) => (
              <article key={stage.name}>
                <span className="rp-step-number">0{i + 1}</span>
                <p className="rp-kicker">{stage.name.toUpperCase()}</p>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DecisionPreview />
      <ConnectSystems />
      <section className="rp-section rp-ivory">
        <div className="rp-container rp-editorial-grid">
          <SectionHeading
            kicker="BUILT WITH CLARITY"
            title={
              <>
                Know what’s live.
                <br />
                Know what’s next.
              </>
            }
          />
          <div className="rp-editorial-list">
            <article>
              <span className="rp-status">Available now</span>
              <h3>A foundation for your evidence.</h3>
              <p>
                Document upload, private storage, organization isolation and
                authenticated document access.
              </p>
            </article>
            <article>
              <span className="rp-status rp-status-muted">
                Early access / in development
              </span>
              <h3>A growing intelligence layer.</h3>
              <p>
                Margin checks, cases, money-owed tracking, procurement controls
                and reconciliation expand as capabilities mature.
              </p>
              <Link href="/pricing#compare" className="rp-text-link">
                See availability by plan <Arrow />
              </Link>
            </article>
          </div>
        </div>
      </section>
      <MarketingCTA title="Bring your next decision into focus." />
    </PageShell>
  );
}

export function NewSolutionsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="SOLUTIONS"
        title={
          <>
            Different operations.
            <br />
            One connected view.
          </>
        }
        description="From what you buy to what you’re owed, RADR brings operating context to the differences worth your attention."
        image="pavilion"
      >
        <div className="rp-sol-hero">
          <span className="rp-kicker">BUILT FIRST FOR HOSPITALITY</span>
          <div>
            <span>01</span>
            <strong>Restaurants</strong>
            <p>Food cost. Suppliers. Labor. Revenue.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Hotels & groups</strong>
            <p>Rooms. F&B. Productivity. The whole operation.</p>
          </div>
          <Link href="#areas" className="rp-text-link">
            Explore the operating areas <Arrow />
          </Link>
        </div>
      </PageHero>
      <Hospitality />
      <SolutionExplorer />
      <section className="rp-section rp-ivory">
        <div className="rp-container rp-editorial-grid">
          <SectionHeading
            kicker="FROM ONE LOCATION TO THE GROUP"
            title={
              <>
                Local context.
                <br />A wider perspective.
              </>
            }
            description="The same question can look different in every location. Keep the context that makes each decision useful."
          />
          <div className="rp-numbered-list">
            {[
              {
                t: "Start where the evidence is.",
                d: "Bring the documents and agreements behind the operation into view.",
              },
              {
                t: "Keep the owner in control.",
                d: "Put recommendations in front of the people who understand the local context.",
              },
              {
                t: "Build on what you learn.",
                d: "Use resolved issues to inform the next review, rather than losing the knowledge.",
              },
            ].map((item, i) => (
              <article key={item.t}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{item.t}</h3>
                  <p>{item.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingCTA
        title="Start with your operation."
        description="Tell us what you run, which systems you use, and where you want more clarity."
      />
    </PageShell>
  );
}

const beliefs = [
  {
    title: "The small things aren’t small.",
    copy: "A small difference on one transaction can become a meaningful gap across an operation.",
  },
  {
    title: "Show the money.",
    copy: "Connect a finding to its potential financial impact, with the assumptions visible.",
  },
  {
    title: "Don’t just alert.",
    copy: "Explain the context. Make the next step clear. Keep a human in control.",
  },
  {
    title: "Don’t fix the same thing twice.",
    copy: "Every resolution should make the next decision better informed.",
  },
  {
    title: "Prove the value.",
    copy: "A potential opportunity and a verified outcome are different. Keep that distinction clear.",
  },
];
export function NewCompanyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="COMPANY"
        title={
          <>
            A clearer picture.
            <br />A more human industry.
          </>
        }
        description="Hospitality is built around people. We believe operating intelligence should give those people more context, more control and more room to focus on what matters."
        image="pavilion"
      />
      <section className="rp-section rp-ivory">
        <div className="rp-container rp-editorial-grid">
          <SectionHeading
            kicker="WHY WE EXIST"
            title={
              <>
                The gaps are real.
                <br />
                The picture is incomplete.
              </>
            }
          />
          <div className="rp-editorial-copy">
            <p>
              Complex operations run across dozens of systems, teams and
              decisions. Procurement sees one part. Finance sees another.
              Operations feels the consequences.
            </p>
            <p>
              Too often, the difference between those views belongs to nobody.
            </p>
            <p>
              RADR exists to connect that context — built first for hospitality,
              with a longer-term vision of clearer decisions across complex
              operations.
            </p>
            <Link href="/how" className="rp-text-link">
              Meet the platform <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <section className="rp-company-photo">
        <div className="rp-container">
          <p className="rp-kicker">INTELLIGENCE WITH A PURPOSE</p>
          <h2>
            More clarity for the people
            <br />
            behind every experience.
          </h2>
        </div>
      </section>
      <section className="rp-section rp-ivory">
        <div className="rp-container rp-editorial-grid">
          <SectionHeading
            kicker="WHAT WE BELIEVE"
            title={
              <>
                A few principles.
                <br />
                Every decision.
              </>
            }
          />
          <div className="rp-numbered-list">
            {beliefs.map((belief, i) => (
              <article key={belief.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{belief.title}</h3>
                  <p>{belief.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rp-section rp-dark">
        <div className="rp-container">
          <SectionHeading
            kicker="TRUST, WITHOUT THE THEATER"
            title={
              <>
                Evidence matters.
                <br />
                So does how it’s handled.
              </>
            }
            description="Clear boundaries and honest availability, from document access to what is still in development."
          />
          <div className="rp-trust-grid">
            {TRUST_CONTROLS.map((control) => (
              <article key={control.label}>
                <span
                  className={`rp-status ${control.status !== "LIVE" ? "rp-status-muted" : ""}`}
                >
                  {control.status === "LIVE"
                    ? "Available now"
                    : "In development"}
                </span>
                <h3>{control.label}</h3>
                <p>{control.detail}</p>
              </article>
            ))}
          </div>
          <Link href="/security" className="rp-text-link">
            Read about security <Arrow />
          </Link>
        </div>
      </section>
      <MarketingCTA title="A conversation worth having." />
    </PageShell>
  );
}

export function NewPricingPage() {
  const { free, control, scale } = pricingConfig;
  const plans = [
    {
      name: free.name,
      price: free.priceLabel,
      unit: "to get started",
      purpose: "Explore the foundation.",
      href: free.cta.href,
      cta: free.cta.label,
      features: [
        "1 location · 1 user",
        `${free.documentLimit} documents total`,
        "Private document storage",
        `${free.historyDays}-day history`,
        "Basic checks · in development",
      ],
    },
    {
      name: control.name,
      price: control.priceLabel,
      unit: control.unit,
      purpose: "Build operating control.",
      href: control.cta.href,
      cta: control.cta.label,
      features: [
        "Everything in Free",
        "Team access · in development",
        "Cases & decisions · early access",
        "Procurement controls · coming next",
        "Reconciliation · coming next",
      ],
    },
    {
      name: scale.name,
      price: scale.priceLabel,
      unit: "for your group",
      purpose: "See across the operation.",
      href: "/contact",
      cta: scale.cta.label,
      features: [
        "Everything in Control",
        "Dedicated onboarding",
        "Multi-location view · coming next",
        "Group workflows · coming next",
        "Advanced integrations · coming next",
      ],
    },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="PRICING"
        title={
          <>
            Start with clarity.
            <br />
            Scale with confidence.
          </>
        }
        description="Explore the foundation for free. Understand the plan for your location. Talk with us about the wider group."
        image="pavilion"
      >
        <div className="rp-pricing-hero-card">
          <p className="rp-kicker">YOUR FIRST STEP</p>
          <strong>
            {free.priceLabel}
            <span>to explore</span>
          </strong>
          <div className="rp-pricing-hero-detail">
            <span>1 location</span>
            <span>1 user</span>
            <span>10 documents</span>
          </div>
          <p>
            No credit card required.
            <br />
            Start with your evidence.
          </p>
          <Link href={free.cta.href} className="rh-button">
            Start free <Arrow />
          </Link>
        </div>
      </PageHero>
      <section className="rp-section rp-ivory" id="plans">
        <div className="rp-container">
          <SectionHeading
            kicker="A PLAN FOR THE OPERATION"
            title="Try. Run. Scale."
            description="A clear starting point, with capability availability made explicit."
          />
          {!pricingConfig.billingLive && (
            <p className="rp-pricing-note">
              Planned pricing · paid billing is not active. Early-access and
              upcoming capabilities are labeled below.
            </p>
          )}
          <div className="rp-plan-grid">
            {plans.map((plan, i) => (
              <article
                className={`rp-plan ${i === 1 ? "rp-plan-featured" : ""}`}
                key={plan.name}
              >
                <p className="rp-kicker">{plan.name}</p>
                <h3>{plan.purpose}</h3>
                <div className="rp-plan-price">
                  {plan.price}
                  <span>{plan.unit}</span>
                </div>
                <Link href={plan.href} className="rh-button">
                  {plan.cta}
                  <Arrow />
                </Link>
                <ul className="rp-check-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rp-section rp-ivory rp-compare-section" id="compare">
        <div className="rp-container">
          <SectionHeading
            kicker="WHAT’S INCLUDED"
            title="Clarity, down to the details."
          />
          <div className="rp-comparison">
            <table>
              <caption className="sr-only">
                RADR plan capabilities and current availability
              </caption>
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  <th scope="col">Free</th>
                  <th scope="col">Control</th>
                  <th scope="col">Scale</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {(["free", "control", "scale"] as const).map((plan) => (
                      <td key={plan}>
                        <span
                          className={`rp-availability rp-availability-${row[plan]}`}
                        >
                          {statusLabel(row[plan])}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/value-calculator" className="rp-text-link">
            Explore a value scenario <Arrow />
          </Link>
        </div>
      </section>
      <section className="rp-section rp-soft">
        <div className="rp-container rp-faq-layout">
          <SectionHeading
            kicker="A FEW GOOD QUESTIONS"
            title={
              <>
                Before you
                <br />
                get started.
              </>
            }
          />
          <div className="rp-faq">
            {faqItems.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <MarketingCTA
        title="Find the right starting point."
        description="One restaurant or a global group — let’s talk about the operation you want to understand."
      />
    </PageShell>
  );
}

export function CalculatorPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="VALUE CALCULATOR"
        primaryHref="#calculator"
        primaryLabel="Build your scenario"
        title={
          <>
            A little context.
            <br />A clearer opportunity.
          </>
        }
        description="Explore how a change in one operating area could add up. Your inputs, your assumptions, an open calculation."
        compact
      />
      <OpportunityCalculator />
      <section className="rp-section rp-soft">
        <div className="rp-container rp-editorial-grid">
          <SectionHeading
            kicker="A STARTING POINT, NOT A PROMISE"
            title={
              <>
                Model the question.
                <br />
                Then test the evidence.
              </>
            }
          />
          <div className="rp-numbered-list">
            {[
              {
                t: "Choose one area.",
                d: "Keep procurement, labor and revenue scenarios separate to avoid counting the same opportunity twice.",
              },
              {
                t: "Make assumptions visible.",
                d: "The improvement percentage is yours to choose. RADR does not infer a guaranteed saving from these inputs.",
              },
              {
                t: "Validate with real context.",
                d: "A model is a conversation starter. Actual results depend on evidence, decisions and verified outcomes.",
              },
            ].map((item, i) => (
              <article key={item.t}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{item.t}</h3>
                  <p>{item.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <MarketingCTA title="Put the numbers in context." />
    </PageShell>
  );
}

export function NewContactPage() {
  const inbox = contactEmail();
  return (
    <PageShell>
      <PageHero
        eyebrow="BOOK A DEMO"
        primaryHref="#inquiry"
        primaryLabel="Introduce your operation"
        secondaryHref="/how"
        secondaryLabel="Meet the platform"
        title={
          <>
            Your operation.
            <br />
            In sharper focus.
          </>
        }
        description="A focused conversation about your systems, your priorities and the decisions you want to make with more confidence."
        image="pavilion"
        compact
      />
      <section className="rp-section rp-ivory">
        <div className="rp-container rp-contact-layout" id="inquiry">
          <div>
            <SectionHeading
              kicker="LET’S TALK"
              title={
                <>
                  A walkthrough.
                  <br />
                  Built around you.
                </>
              }
              description="Tell us a little about your operation and what you want to understand first."
            />
            <div className="rp-contact-steps">
              {[
                "Your operation and priorities",
                "The evidence behind the decisions",
                "A practical starting point",
              ].map((title, i) => (
                <div key={title}>
                  <span>0{i + 1}</span>
                  <p>{title}</p>
                </div>
              ))}
            </div>
            {inbox && (
              <a className="rp-text-link" href={`mailto:${inbox}`}>
                Prefer email? {inbox}
                <Arrow />
              </a>
            )}
          </div>
          <div className="rp-contact-card">
            <p className="rp-kicker">INTRODUCE YOUR OPERATION</p>
            <ContactForm />
            <p className="rp-contact-privacy">
              By sending your inquiry, you agree to our{" "}
              <Link href="/privacy">Privacy Policy</Link>. We use these details
              to respond to your request.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
