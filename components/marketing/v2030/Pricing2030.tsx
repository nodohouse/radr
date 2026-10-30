"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { heroEnter } from "@/lib/marketing/motion";
import { pricingConfig } from "@/components/marketing/pricing/config";
import { FeatureCompare } from "@/components/marketing/pricing/FeatureCompare";
import { PricingFaq } from "@/components/marketing/pricing/PricingFaq";
import { RevealOnView } from "@/components/marketing/motion/RevealOnView";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import "@/app/marketing-2030.css";
import "@/app/pricing.css";
import "@/app/kinetic.css";
import "@/app/brand-takeover.css";

const JOURNEY = [
  {
    id: "start",
    step: "Start",
    name: "Start",
    bestFor: "Prove one clear economic problem",
    scope: "2–3 locations · focused Decision class",
    unlocks: "Evidence packages · Verified Value trail · go / no-go",
    commercial: "Scoped with you · paid from day one",
    featured: false,
  },
  {
    id: "expand",
    step: "Operating Intelligence",
    name: "Operating Intelligence",
    bestFor: "Make RADR the Decision layer across the estate",
    scope: "More locations · more systems · broader operating surface",
    unlocks: "Control Center · Decisions · Futures · Value · Memory",
    commercial: "Priced by estate + scope + responsibility",
    featured: true,
  },
  {
    id: "scale",
    step: "Enterprise",
    name: "Enterprise",
    bestFor: "Group scale with governed execution",
    scope: "Multi-entity · multi-currency · portfolio view",
    unlocks: "Policies · approvals · advanced controls · dedicated success",
    commercial: "Portfolio / group pricing",
    featured: false,
  },
] as const;

const PILOT_STEPS = [
  {
    title: "Connect core systems",
    body: "Securely link key evidence sources.",
  },
  {
    title: "Configure operating context",
    body: "Align to structure, brands, and priorities.",
  },
  {
    title: "Review first opportunities",
    body: "Material Decisions with economics and confidence.",
  },
] as const;

function JourneyRail() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(reduced);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) {
      setOn(true);
      setActive(JOURNEY.length - 1);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!on || reduced) return;
    const timers = JOURNEY.map((_, i) =>
      window.setTimeout(() => setActive(i), 180 + i * 220),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [on, reduced]);

  return (
    <div
      ref={ref}
      className="rx30-journey-wrap"
      data-on={on ? "true" : undefined}
    >
      <div className="rx30-journey-line" aria-hidden="true">
        <i style={{ width: on ? `${((active + 1) / JOURNEY.length) * 100}%` : "0%" }} />
      </div>
      <div className="rx30-journey rx30-journey--aligned">
        {JOURNEY.map((j, i) => (
          <article
            key={j.id}
            data-featured={j.featured ? "true" : undefined}
            data-on={i <= active ? "true" : undefined}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            tabIndex={0}
          >
            <em>{j.step}</em>
            <h3>{j.name}</h3>
            <dl className="rx30-price-stage">
              <div>
                <dt>Best for</dt>
                <dd>{j.bestFor}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>{j.scope}</dd>
              </div>
              <div>
                <dt>What you unlock</dt>
                <dd>{j.unlocks}</dd>
              </div>
              <div>
                <dt>Commercial</dt>
                <dd>{j.commercial}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Pricing2030() {
  const reduced = useReducedMotion();

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page"
            data-nav-theme="light"
            aria-labelledby="rx30-price-title"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <div className="rx30-shell rx30-bleed-copy rx30-bleed-copy--solo">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={heroEnter}
              >
                <p className="rx30-kicker">Pricing</p>
                <h1 id="rx30-price-title" className="rx30-bleed-h1">
                  Simple access to a complex <em>operating layer.</em>
                </h1>
                <p className="rx30-bleed-lead">
                  Pricing scales with estate size, connected systems, operating
                  scope, and Decision responsibility.
                </p>
                <div className="rx30-ctas">
                  <Link
                    href={CTAS.primaryProductHref}
                    className="rx30-btn rx30-btn-primary"
                  >
                    Get started <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href={pricingConfig.talkHref}
                    className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                  >
                    Talk to RADR
                  </Link>
                </div>
                <p className="rx30-price-quiet">
                  Not sure where to start?{" "}
                  <Link href="/value-calculator">Build your Value Map</Link>
                </p>
              </motion.div>
            </div>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <div className="rx30-shell">
              <p className="rx30-kicker">Journey</p>
              <h2 className="rx30-h2">How the commercial relationship expands</h2>
              <JourneyRail />
            </div>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <RevealOnView className="rx30-shell">
              <p className="rx30-kicker">How pilots start</p>
              <h2 className="rx30-h2">Three steps. Honest scope.</h2>
              <div className="rx30-flow-grid rx30-flow-grid--3">
                {PILOT_STEPS.map((s, i) => (
                  <article key={s.title}>
                    <em>{String(i + 1).padStart(2, "0")}</em>
                    <strong>{s.title}</strong>
                    <span>{s.body}</span>
                  </article>
                ))}
              </div>
            </RevealOnView>
          </section>

          <FeatureCompare defaultCollapsed />
          <PricingFaq />

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">Not sure where to start?</h2>
              <p className="rx30-lead" style={{ margin: "0.75rem auto 0" }}>
                Build your Value Map, or talk through your operating model with
                RADR.
              </p>
              <div className="rx30-ctas">
                <Link
                  href="/value-calculator"
                  className="rx30-btn rx30-btn-primary"
                >
                  Build my Value Map <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={pricingConfig.talkHref}
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Talk to RADR
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
