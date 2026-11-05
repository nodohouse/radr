"use client";

import Image from "next/image";
import { MARKETING_IMAGES } from "@/lib/marketing/publicImagery";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { HomePlaybookFeature } from "@/components/marketing/reports/HomePlaybookFeature";
import { ScrollTabletShowcase } from "./ScrollTabletShowcase";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";
import { PUBLIC_LOOP } from "@/lib/marketing/publicCanon";
import { CTAS } from "@/lib/marketing/brand";

const forks = [
  {
    name: "Keep seating",
    title: "More covers. More pressure.",
    body: "Accept the next wave now. The kitchen remains the constraint, with greater service risk.",
    result: "Baseline",
    detail: "No incremental protected value assumed.",
  },
  {
    name: "Pace 12 minutes",
    title: "A little space. A better service.",
    body: "Pace the next seating wave so the kitchen can absorb demand. Review the trade-off before approving.",
    result: venue.expectedFormatted,
    detail: "Expected protected tonight · 82% confidence",
  },
];

export function Homepage2030() {
  const [fork, setFork] = useState(1);
  return (
    <div className="rm-home">
      <section className="rm-hero rm-shell" data-nav-theme="light">
        <div className="rm-hero-copy">
          <p className="rm-eyebrow">
            <span /> THE ADAPTIVE DECISION SYSTEM FOR HOSPITALITY
          </p>
          <h1>
            See what matters.
            <br />
            <em>Make your move.</em>
          </h1>
          <p className="rm-lead">
            Your systems know the numbers. RADR connects them to the next
            decision, so you can protect the night, the margin, and the guest
            experience.
          </p>
          <div className="rm-ctas">
            <Link href="/demo" className="rm-button">
              Explore the product <span>→</span>
            </Link>
            <Link
              href={CTAS.primarySalesHref}
              className="rm-button rm-button-secondary"
            >
              Talk to RADR →
            </Link>
          </div>
          <p className="rm-caption rm-hospitality-scope">
            Restaurants · Hotels · Hospitality groups
          </p>
          <p className="rm-caption">
            Interactive demo with synthetic operating data.
            <br />
            Commercial connectors and autonomous execution are planned.
          </p>
        </div>
        <ScrollTabletShowcase />
        <div className="rm-loop" aria-label="The RADR decision loop">
          {PUBLIC_LOOP.map((step, i) => (
            <span key={step.id}>
              <small>0{i + 1}</small>
              {step.label}
              {i < 5 && <b aria-hidden>→</b>}
            </span>
          ))}
        </div>
      </section>
      <section className="rm-section rm-shell" data-nav-theme="light">
        <div className="rm-section-head">
          <div>
            <p className="rm-eyebrow">01 / SINCE YOUR LAST CHECK</p>
            <h2>
              The whole picture.
              <br />
              Without the whole morning.
            </h2>
          </div>
          <p>
            Attention is a scarce resource. Start with the decision that needs
            you, then see what changed and what the evidence supports.
          </p>
        </div>
        <div className="rm-update-grid">
          <article className="rm-panel rm-update-main">
            <span className="rm-tag">NEEDS YOU · {venue.decisionId}</span>
            <h3>Twelve minutes can change tonight.</h3>
            <p>
              {venue.situation} Review seating pace before the next wave
              arrives.
            </p>
            <Link href="/product?surface=control">Open the Brief →</Link>
          </article>
          <article className="rm-panel">
            <span className="rm-eyebrow">AFTER THE DECISION</span>
            <strong className="rm-number">{venue.verifiedFormatted}</strong>
            <h3>Protected tonight.</h3>
            <p>
              Illustrative completed-service outcome for {venue.decisionId}.
              Expected and verified value stay separate.
            </p>
            <Link href="/product/value">Follow the proof →</Link>
          </article>
          <article className="rm-panel">
            <span className="rm-eyebrow">ONE OPERATING PICTURE</span>
            <h3>Guest experience meets economics.</h3>
            <p>
              Service pressure, labor, demand, and margin belong in the same
              conversation.
            </p>
            <Link href="/industries">Restaurants, hotels & groups →</Link>
          </article>
        </div>
      </section>
      <section
        className="rm-section rm-shell"
        id="simulate"
        data-nav-theme="light"
      >
        <div className="rm-fork">
          <div className="rm-fork-copy">
            <p className="rm-eyebrow">02 / SIMULATE ONE FORK</p>
            <h2>
              Before you act,
              <br />
              see the trade-off.
            </h2>
            <p className="rm-lead">
              Same restaurant. Same dinner rush. Two possible next moves.
            </p>
            <div
              className="rm-fork-tabs"
              role="tablist"
              aria-label="Compare seating options"
            >
              {forks.map((option, i) => (
                <button
                  key={option.name}
                  role="tab"
                  aria-selected={fork === i}
                  aria-controls="fork-result"
                  id={`fork-${i}`}
                  onClick={() => setFork(i)}
                >
                  {option.name}
                  <span>{i === 1 ? "Recommended" : "Alternative"}</span>
                </button>
              ))}
            </div>
            <p className="rm-caption">
              Illustrative demo, not a promise of results. This demo does not
              execute actions in connected systems.
            </p>
          </div>
          <div
            className="rm-fork-result"
            id="fork-result"
            role="tabpanel"
            aria-labelledby={`fork-${fork}`}
            aria-live="polite"
          >
            <Image
              src={MARKETING_IMAGES.homeRestaurantEconomics.src}
              alt={MARKETING_IMAGES.homeRestaurantEconomics.alt}
              loading="eager"
              width={1152}
              height={864}
              sizes="(max-width:720px) 100vw, 550px"
            />
            <div>
              <span className="rm-tag">
                {venue.displayName} · {venue.decisionId}
              </span>
              <h3>{forks[fork].title}</h3>
              <p>{forks[fork].body}</p>
              <strong>{forks[fork].result}</strong>
              <small>{forks[fork].detail}</small>
              <Link href="/product/futures">Inside a Decision →</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="rm-section rm-shell" data-nav-theme="light">
        <div className="rm-section-head">
          <div>
            <p className="rm-eyebrow">
              03 / THE CONNECTION IS THE INTELLIGENCE
            </p>
            <h2>
              One hidden signal.
              <br />
              Three parts of the business.
            </h2>
          </div>
          <p>
            A bestselling dish can have a healthy margin and still consume too
            much kitchen capacity at peak. RADR connects buying, preparation
            time, and service demand.
          </p>
        </div>
        <div className="rm-hidden-signal">
          <div className="rm-signal-image">
            <Image
              src={MARKETING_IMAGES.homeFoodPressure.src}
              alt={MARKETING_IMAGES.homeFoodPressure.alt}
              fill
              loading="eager"
              sizes="(max-width:720px) 100vw, 480px"
            />
            <span>BUY × LABOR × SELL</span>
          </div>
          <article className="rm-panel">
            <p className="rm-eyebrow">ILLUSTRATIVE INTELLIGENCE · D-7110</p>
            <h3>
              Your bestseller.
              <br />A hidden service constraint.
            </h3>
            <div className="rm-evidence-chain">
              <span>Supplier evidence</span>
              <b>→</b>
              <span>Preparation effort</span>
              <b>→</b>
              <span>Service economics</span>
            </div>
            <p>
              D-7110 connects dish contribution with cold-station minutes and
              ticket times. Compare keeping the mix with featuring a faster
              alternative during the peak.
            </p>
            <Link href="/product?surface=intelligence" className="rm-button">
              Explore Intelligence →
            </Link>
          </article>
        </div>
      </section>
      <HomePlaybookFeature />
      <section className="rm-close rm-shell" data-nav-theme="light">
        <p className="rm-eyebrow">
          LESS TIME RECONSTRUCTING. MORE TIME DECIDING.
        </p>
        <h2>
          Great hospitality.
          <br />
          <em>Better decisions behind it.</em>
        </h2>
        <div className="rm-ctas">
          <Link href="/demo" className="rm-button">
            Step inside RADR →
          </Link>
          <Link
            href="/value-calculator"
            className="rm-button rm-button-secondary"
          >
            Model your value →
          </Link>
        </div>
        <p className="rm-caption">
          Explore a clearly labeled demo. No connected system required.
        </p>
      </section>
    </div>
  );
}
