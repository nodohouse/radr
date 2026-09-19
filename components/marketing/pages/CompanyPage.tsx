"use client";

/**
 * Company — editorial hospitality emotion.
 * Unique imagery only. Solid panels for readability. No fabricated documentary.
 */

import type { ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "motion/react";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { useInView } from "@/components/marketing/motion/useInView";
import { CTAS } from "@/lib/marketing/brand";
import { marketingImage } from "@/lib/marketing/publicImagery";
import "@/app/company.css";
import "@/app/kinetic.css";

const BELIEFS = [
  { n: "01", title: "Humans provide the hospitality." },
  { n: "02", title: "Claim only what you can prove." },
  { n: "03", title: "The operation should learn." },
] as const;

const ENVS = [
  { id: "companyRestaurant" as const, label: "Restaurants & F&B" },
  { id: "companyHotel" as const, label: "Hotels & Resorts" },
  { id: "companyApartments" as const, label: "Serviced apartments" },
  { id: "companyGroup" as const, label: "Groups" },
];

function CoReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });

  // Readability P0: never leave body copy at opacity 0 if IO misses.
  // Animate only as enhancement once in view.
  return (
    <motion.div
      ref={ref}
      className={`rx-co2-reveal ${className}`.trim()}
      initial={false}
      animate={
        reduced || inView
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: 8 }
      }
      transition={{
        duration: 0.45,
        delay: reduced ? 0 : delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function CompanyPage() {
  const hero = marketingImage("companyHero");
  const founder = marketingImage("companyFounderStory");

  return (
    <div className="radr radr-mineral rx-co2">
      <PublicNavbar />
      <main>
        <section
          className="rx-co2-photo-hero rx-co2-photo-hero-split"
          data-nav-theme="light"
        >
          <div className="rx-shell rx-co2-photo-hero-grid">
            <div className="rx-co2-photo-hero-frame">
              <Image
                src={hero.src}
                alt={hero.alt}
                width={hero.nativeWidth}
                height={hero.nativeHeight}
                priority
                sizes={`(max-width: 900px) 92vw, ${hero.cssMax}px`}
                quality={90}
                className="rx-co2-photo-hero-img"
                style={{ objectPosition: `${hero.focalX} ${hero.focalY}` }}
              />
            </div>
            <div className="rx-co2-photo-hero-copy">
              <h1>
                Hospitality deserves better judgment, not more software.
              </h1>
            </div>
          </div>
        </section>

        <section className="rx-co2-founder-ed" data-nav-theme="light">
          <div className="rx-shell rx-co2-founder-grid">
            <CoReveal className="rx-co2-founder-photo-wrap">
              <div className="rx-co2-founder-photo">
                <Image
                  src={founder.src}
                  alt={founder.alt}
                  fill
                  sizes={`(max-width: 900px) 92vw, ${founder.cssMax}px`}
                  className="rx-co2-founder-img"
                  style={{
                    objectPosition: `${founder.focalX} ${founder.focalY}`,
                  }}
                />
              </div>
            </CoReveal>
            <CoReveal delay={80} className="rx-co2-founder-copy">
              <blockquote>
                “I thought I wanted to open a restaurant.
                <br />
                What I really wanted was to make hospitality work better.”
              </blockquote>
              <p className="rx-co2-founder-name">
                Daniel Do
                <span>Founder</span>
              </p>
              <p className="rx-co2-founder-bio">
                I grew up around hospitality. My family runs a food business. I
                spent years wanting to open a restaurant — until the operation
                made something obvious.
              </p>
              <p className="rx-co2-founder-bio">
                Hospitality already had software for sales, reservations,
                staffing, inventory, purchasing, payments and accounting. What
                it did not have was a system for the decisions between them —
                the ones that determine whether revenue becomes contribution,
                and whether anyone can prove afterward that the call worked.
              </p>
              <p className="rx-co2-founder-bio">
                RADR is that Decision layer.
              </p>
            </CoReveal>
          </div>
        </section>

        <section
          className="rx-co2-environments"
          data-nav-theme="light"
        >
          <div className="rx-shell">
            <CoReveal>
              <p className="rx-co2-env-kicker">Where it landed</p>
              <p className="rx-co2-env-lead">
                The restaurant dream stayed personal. The work opened to every
                hospitality environment where small decisions become economic
                outcomes.
              </p>
              <ul className="rx-co2-env-unique" aria-label="Hospitality environments">
                {ENVS.map((env) => {
                  const img = marketingImage(env.id);
                  return (
                    <li key={env.id}>
                      <figure>
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={img.nativeWidth}
                          height={img.nativeHeight}
                          sizes={`(max-width: 700px) 45vw, ${img.cssMax}px`}
                          style={{
                            objectPosition: `${img.focalX} ${img.focalY}`,
                          }}
                          loading="lazy"
                          quality={85}
                        />
                        <figcaption>{env.label}</figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </CoReveal>
          </div>
        </section>

        <section className="rx-co2-why-now" data-nav-theme="light">
          <div className="rx-shell">
            <CoReveal>
              <p className="rx-co2-why-now-h">
                Systems of record store facts. RADR stores judgment.
              </p>
              <p className="rx-co2-why-now-sub">
                Commercial entry is margin recovery and reconciliation — where
                economics can be proven first. The Decision Gap is the longer
                reason the product exists.
              </p>
              <div className="rx-co-gap-diagram" aria-hidden="true">
                <span>POS</span>
                <span>Reservations</span>
                <span>Labor</span>
                <span>Inventory</span>
                <span>Accounting</span>
                <em>Decision Gap</em>
                <strong>RADR</strong>
              </div>
              <div className="rx-co2-gtm-bridge">
                <Link href="/solutions" className="rx-btn rx-btn-ghost">
                  Where value leaks <span aria-hidden="true">→</span>
                </Link>
              </div>
            </CoReveal>
          </div>
        </section>

        <section className="rx-co2-beliefs-ed" data-nav-theme="light">
          <div className="rx-shell">
            <ul className="rx-co2-belief-giant">
              {BELIEFS.map((b, i) => (
                <li key={b.n}>
                  <CoReveal delay={i * 90}>
                    <em>{b.n}</em>
                    <strong>{b.title}</strong>
                  </CoReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="rx-co2-essay"
          data-nav-theme="light"
          id="why-we-exist"
        >
          <div className="rx-shell">
            <CoReveal>
              <p className="rx-kicker">From the company</p>
              <h2 className="rx-co2-essay-title">Why we exist</h2>
              <p className="rx-co2-essay-lead">
                A longer field essay on the Decision Gap — what systems record,
                what operations decide, and why hospitality still loses money
                between the two.
              </p>
              <div className="rx-co2-essay-card">
                <p className="rx-co2-essay-meta">
                  <span>14 min read</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime="2026-09-17">2026-09-17</time>
                </p>
                <h3 className="rx-co2-essay-card-title">
                  The Decision Gap: why RADR exists
                </h3>
                <p className="rx-co2-essay-card-body">
                  Hospitality digitized records before it digitized judgment.
                  This is the gap RADR is built for.
                </p>
                <div className="rx-ctas rx-co2-essay-ctas">
                  <Link
                    href="/blog/the-decision-gap"
                    className="rx-btn rx-btn-primary"
                  >
                    Read the essay <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/blog" className="rx-btn rx-btn-ghost">
                    All writing
                  </Link>
                </div>
              </div>
            </CoReveal>
          </div>
        </section>

        <section className="rx-co2-close" data-nav-theme="light">
          <div className="rx-shell">
            <CoReveal>
              <p className="rx-co2-close-h">
                One restaurant started the question.
                <br />
                Hospitality became the answer.
              </p>
              <div className="rx-ctas rx-co2-hero-ctas">
                <Link
                  href="/contact?intent=recovery-pilot"
                  className="rx-btn rx-btn-primary"
                >
                  {CTAS.primaryProduct} <span aria-hidden="true">→</span>
                </Link>
                <Link href="/why" className="rx-btn rx-btn-ghost">
                  Why RADR
                </Link>
              </div>
            </CoReveal>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
