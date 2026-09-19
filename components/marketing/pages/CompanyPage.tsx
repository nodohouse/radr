"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "motion/react";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { useInView } from "@/components/marketing/motion/useInView";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/company.css";
import "@/app/kinetic.css";

const BELIEFS = [
  {
    n: "01",
    title: "Humans provide the hospitality.",
  },
  {
    n: "02",
    title: "Claim only what you can prove.",
  },
  {
    n: "03",
    title: "The operation should learn.",
  },
] as const;

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
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`rx-co2-reveal ${className}`.trim()}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{
        duration: 0.65,
        delay: reduced ? 0 : delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Company — editorial hospitality emotion.
 * Hero photo → founder → why now → beliefs → close.
 */
export function CompanyPage() {
  return (
    <div className="radr radr-mineral rx-co2">
      <PublicNavbar />
      <main>
        <section className="rx-co2-photo-hero rx-co2-photo-hero-split" data-nav-theme="light">
          <div className="rx-shell rx-co2-photo-hero-grid">
            <div className="rx-co2-photo-hero-frame">
              <Image
                src="/demo/facilities/berlin-dining.jpg"
                alt="Active restaurant dining room during service"
                width={1152}
                height={864}
                priority
                sizes="(max-width: 900px) 92vw, 520px"
                quality={90}
                className="rx-co2-photo-hero-img"
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
                  src="/demo/facilities/berlin-bar.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 48vw"
                  className="rx-co2-founder-img"
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
                staffing, inventory, purchasing, payments and accounting. What it
                did not have was a system for the decisions between them — the
                ones that determine whether revenue becomes contribution, and
                whether anyone can prove afterward that the call worked.
              </p>
              <p className="rx-co2-founder-bio">
                RADR is that Decision layer.
              </p>
            </CoReveal>
          </div>
        </section>

        <section className="rx-co-states" data-nav-theme="light" aria-label="Founder thesis">
          {[
            "The software wasn’t the problem.",
            "The decisions between the systems were.",
          ].map((line, i) => (
            <div key={line} className="rx-co-state">
              <div className="rx-shell">
                <CoReveal delay={i * 40}>
                  <p>{line}</p>
                </CoReveal>
              </div>
            </div>
          ))}
        </section>

        <div className="rx-co-hosp-strip" aria-hidden="true">
          {(
            [
              ["/demo/facilities/berlin-dining.jpg", "Dining room"],
              ["/demo/facilities/berlin-bar.jpg", "Service"],
              ["/demo/facilities/canal-deluxe-king.jpg", "Hotel"],
              ["/demo/facilities/lisbon-studio.jpg", "Apartments"],
              ["/demo/facilities/lisbon-onebed.jpg", "Front desk"],
            ] as const
          ).map(([src, cap]) => (
            <figure key={cap}>
              <Image src={src} alt="" fill sizes="42vw" />
              <figcaption>{cap}</figcaption>
            </figure>
          ))}
        </div>

        <section className="rx-co2-environments" data-nav-theme="light">
          <div className="rx-shell">
            <CoReveal>
              <div className="rx-co2-env-grid">
                <ul className="rx-co2-env-photos" aria-hidden="true">
                  <li>
                    <Image
                      src="/demo/facilities/berlin-dining.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 900px) 33vw, 12rem"
                      className="rx-co2-env-img"
                    />
                  </li>
                  <li>
                    <Image
                      src="/demo/facilities/canal-deluxe-king.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 900px) 33vw, 12rem"
                      className="rx-co2-env-img"
                    />
                  </li>
                  <li>
                    <Image
                      src="/demo/facilities/lisbon-studio.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 900px) 33vw, 12rem"
                      className="rx-co2-env-img"
                    />
                  </li>
                </ul>
                <div className="rx-co2-env-copy">
                  <p className="rx-co2-env-kicker">Where it landed</p>
                  <p className="rx-co2-env-lead">
                    The restaurant dream stayed personal. The work opened to
                    every hospitality environment where small decisions become
                    economic outcomes — dining rooms, full hotels, serviced
                    apartments with nights that expire.
                  </p>
                  <p className="rx-co2-env-note">
                    Same judgment problem. Different floors, channels, and
                    clocks.
                  </p>
                  <ul className="rx-co-tax" aria-label="Hospitality environments">
                    <li>Restaurants &amp; F&amp;B</li>
                    <li>Hotels &amp; Resorts</li>
                    <li>Serviced Apartments</li>
                    <li>Groups</li>
                  </ul>
                </div>
              </div>
            </CoReveal>
          </div>
        </section>

        <section className="rx-co2-why-now" data-nav-theme="light">
          <div className="rx-shell">
            <CoReveal>
              <p className="rx-co2-why-now-h">
                Hospitality has more software than ever.
                <br />
                The decisions are still human, fragmented, and hard to verify.
              </p>
              <p className="rx-co2-why-now-sub">
                That is the Decision Gap RADR is built for.
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
                <p className="rx-intel-k">Where we start</p>
                <h3>Prove the economics first.</h3>
                <p>
                  The first place RADR starts is where the economics can be
                  proven: value that is leaking, stuck, or about to expire.
                </p>
                <p>
                  <strong>Recovery is the beginning, not the limit.</strong>
                </p>
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

        <section className="rx-co2-essay" data-nav-theme="light" id="why-we-exist">
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
                  <span>18 min read</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime="2026-09-17">2026-09-17</time>
                </p>
                <h3 className="rx-co2-essay-card-title">
                  The Decision Gap: why RADR exists
                </h3>
                <p className="rx-co2-essay-card-body">
                  Hospitality has more software than ever. Profitability is not
                  the default. Operators spend hours reconciling data while
                  perishable value expires. This is the gap RADR is built for.
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
              <p className="rx-co2-close-q">
                RADR exists to help hospitality operations see what matters, act
                while the outcome can still change, and learn from what happened.
              </p>
              <div className="rx-ctas rx-co2-hero-ctas">
                <NextLink href="/demo" className="rx-btn rx-btn-primary">
                  {CTAS.primaryProduct} <span aria-hidden="true">→</span>
                </NextLink>
                <Link href="/contact" className="rx-btn rx-btn-ghost">
                  {CTAS.primarySales}
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
