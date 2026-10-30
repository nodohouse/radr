"use client";

/**
 * Homepage — mockup fidelity spine.
 * Hero → Decision Gap → Connect → Signals → Product → Hospitality → Value → Close.
 */

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CTAS } from "@/lib/marketing/brand";
import { heroEnter } from "@/lib/marketing/motion";
import { HeadlineRadr } from "@/components/brand/HeadlineRadr";
import { RadrAtmosphere } from "@/components/marketing/v2030/RadrAtmosphere";
import {
  DecisionGapContinue,
  HeroProductTheater,
  type HeroVertical,
} from "@/components/marketing/v2030/HeroProductTheater";
import { SignalConvergence } from "@/components/marketing/v2030/SignalConvergence";
import { HomeProductProof } from "@/components/marketing/v2030/HomeProductProof";
import { HomeRestaurantHotel } from "@/components/marketing/v2030/HomeRestaurantHotel";
import { HomeValueMap } from "@/components/marketing/v2030/HomeValueMap";
import { HomeCloseCta } from "@/components/marketing/v2030/HomeCloseCta";
import { IntegrationLogoMarquee } from "@/components/marketing/v2030/integrations/IntegrationLogoMarquee";
import "@/app/marketing-2030.css";
import "@/app/value-calculator.css";
import "@/app/homepage-hero.css";
import "@/app/brand-takeover.css";
import "@/app/homepage-premium.css";
import "@/app/homepage-mockup.css";

export function Homepage2030() {
  const reduced = useReducedMotion();
  const [vertical, setVertical] = useState<HeroVertical>("restaurant");
  const gapRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const stageOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);
  const stageY = useTransform(scrollYProgress, [0, 0.55], [0, -28]);
  const stageScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  function scrollToHow() {
    gapRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="rx30 rx30--mockup rx30--board rx30--premium rx30--fidelity">
      <RadrAtmosphere />

      <section
        ref={heroRef}
        className="rx30-bleed rx30-bleed--hero-story rx30-bleed--premium rx-chapter"
        data-nav-theme="light"
        aria-labelledby="rx30-hero-title"
      >
        <div className="rx30-shell rx30-bleed-grid rx30-bleed-grid--story rx30-bleed-grid--fidelity">
          <motion.div
            className="rx30-bleed-copy"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={heroEnter}
          >
            <p className="rx30-kicker">Hospitality Operating Intelligence</p>
            <h1
              id="rx30-hero-title"
              className="rx30-bleed-h1 rx30-bleed-h1--slogan rx30-bleed-h1--mark"
            >
              <span className="rx30-h1-line">NOTHING OFF</span>
              <span className="rx30-h1-line">
                THE <HeadlineRadr />
                <span className="rx30-period">.</span>
              </span>
            </h1>
            <p className="rx30-bleed-lead rx30-bleed-lead--canon rx30-bleed-lead--lines">
              <span>RADR sits above the systems hospitality already runs,</span>
              <span>turns live operating signals into decisions,</span>
              <span>and proves what those decisions are worth.</span>
            </p>
            <div className="rx30-ctas">
              <Link
                href={CTAS.primarySalesHref}
                className="rx30-btn rx30-btn-primary"
              >
                Book a demo <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid rx30-btn-ghost--how"
                onClick={scrollToHow}
              >
                <span className="rx30-play" aria-hidden />
                See how it works
              </button>
            </div>
          </motion.div>

          <motion.div
            className="rx30-bleed-stage rx30-bleed-stage--story"
            style={
              reduced
                ? undefined
                : { opacity: stageOpacity, y: stageY, scale: stageScale }
            }
          >
            <HeroProductTheater vertical="restaurant" />
          </motion.div>
        </div>
      </section>

      <div className="rx-story-bridge rx-story-bridge--hero-gap" aria-hidden>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path
            d="M200 0 C280 40 360 60 480 48 C620 32 740 8 900 20"
            fill="none"
            stroke="rgba(47,127,232,0.45)"
            strokeWidth="1.5"
          />
          <path
            d="M520 8 C640 50 760 70 980 40"
            fill="none"
            stroke="rgba(0,230,118,0.4)"
            strokeWidth="1.35"
          />
        </svg>
      </div>

      <section
        ref={gapRef}
        id="decision-gap"
        className="rx-gap-story rx-gap-story--premium rx-chapter"
        aria-labelledby="rx30-pain-title"
      >
        <div className="rx30-shell rx-gap-story-grid">
          <div className="rx-gap-story-copy">
            <p className="rx30-kicker">The Decision Gap</p>
            <h2 id="rx30-pain-title" className="rx30-h2">
              Hospitality already has the data.
              <br />
              <span className="rx30-h2-accent">The gap is the decision.</span>
            </h2>
            <p className="rx30-lead">
              Reservations, POS, PMS, labor, payments and accounting each hold
              part of the picture. RADR connects those signals. Then helps
              teams decide what happens next.
            </p>
            <div className="rx-hpt-switch rx-hpt-switch--gap" role="group">
              <button
                type="button"
                data-on={vertical === "restaurant" ? "true" : undefined}
                onClick={() => setVertical("restaurant")}
              >
                Restaurants
              </button>
              <button
                type="button"
                data-on={vertical === "hotel" ? "true" : undefined}
                onClick={() => setVertical("hotel")}
              >
                Hotels
              </button>
            </div>
            <p className="rx-gap-one">
              One RADR. Different hospitality operations.
            </p>
          </div>
          <DecisionGapContinue vertical={vertical} />
        </div>
      </section>

      <div className="rx-story-bridge rx-story-bridge--gap-connect" aria-hidden />

      <section
        className="rx30-connect rx30-connect--premium rx-chapter"
        aria-labelledby="rx30-connect-title"
      >
        <div className="rx30-shell">
          <p className="rx30-kicker">Connect</p>
          <h2 id="rx30-connect-title" className="rx30-h2 rx30-h2--balance">
            Works above the systems hospitality already runs.
          </h2>
          <p className="rx30-lead rx30-lead--connect">
            Each system sees a fragment. RADR combines them into one operating
            context. Then a Decision.
          </p>
          <IntegrationLogoMarquee converge />
        </div>
      </section>

      <SignalConvergence />

      <HomeProductProof />

      <HomeRestaurantHotel />

      <div className="rx-home-value-ramp" aria-hidden />

      <section
        className="rx-home-value rx-chapter"
        aria-labelledby="vc-home-cta-title"
      >
        <div className="rx30-shell rx-home-value-inner">
          <div className="rx-home-value-copy">
            <p className="rx30-kicker">Value Calculator</p>
            <h2 id="vc-home-cta-title" className="rx30-h2 rx-home-value-h2">
              What is your operation
              <br />
              leaving behind?
            </h2>
            <p className="rx30-lead">
              Model where value may be hiding across labor, procurement, revenue
              and operations. Then see what may be worth investigating first.
            </p>
            <div className="rx30-ctas">
              <Link
                href="/value-calculator"
                className="rx30-btn rx30-btn-primary"
              >
                Build my Value Map <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="vc-home-cta-micro">
              Explore your modeled opportunity.
            </p>
          </div>
          <HomeValueMap />
        </div>
      </section>

      <HomeCloseCta />
    </div>
  );
}
