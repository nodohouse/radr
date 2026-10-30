"use client";

import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import { heroEnter } from "@/lib/marketing/motion";
import { RevealOnView } from "@/components/marketing/motion/RevealOnView";
import { CompanyGlobalStory } from "@/components/marketing/v2030/CompanyGlobalStory";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import "@/app/marketing-2030.css";
import "@/app/company.css";
import "@/app/brand-takeover.css";

const PRINCIPLES = [
  {
    title: "Clarity over noise",
    body: "Turn complex evidence into clear Decisions. Not more charts.",
  },
  {
    title: "Human judgment first",
    body: "Augment operators. Never fake autonomous execution.",
  },
  {
    title: "Evidence before action",
    body: "Surface what matters with confidence, range, and freshness.",
  },
  {
    title: "Verified outcomes",
    body: "Expected ≠ Observed ≠ Verified. Memory only after enough evidence.",
  },
] as const;

const CORE_TODAY = [
  "Restaurants",
  "Hotels",
  "Multi-location groups",
] as const;

const EXTENDS_TO = [
  "Serviced apartments",
  "Resorts",
  "Bars / clubs",
  "Mixed hospitality",
] as const;

const TRUST = [
  {
    title: "Data ownership",
    body: "Your data stays yours. Tenant-scoped access. Public traffic uses TLS. See Trust & Security for the current control posture.",
  },
  {
    title: "Governed autonomy",
    body: "Policy · confidence · action risk, per Decision type. Material actions stay approval-gated unless you permit otherwise.",
  },
  {
    title: "Auditability",
    body: "Every material recommendation carries its evidence chain.",
  },
  {
    title: "Works above systems of record",
    body: "Integrate POS, PMS, labor, AP. Do not rebuild them.",
  },
] as const;

export function Company2030() {
  const reduced = useReducedMotion();

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup">
        <main>
          <section
            className="rx30-bleed rx30-bleed--page"
            data-nav-theme="light"
            aria-labelledby="rx30-co-title"
          >
            <SilkAtmosphere className="rx30-bleed-silk" />
            <motion.div
              className="rx30-shell rx30-bleed-copy rx30-bleed-copy--solo"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroEnter}
            >
              <p className="rx30-kicker">Company</p>
              <h1 id="rx30-co-title" className="rx30-bleed-h1">
                Built for a more intelligent, <em>human</em> hospitality
                industry.
              </h1>
              <p className="rx30-bleed-lead">
                Hospitality runs on extraordinary people. It deserves a Decision
                layer between the systems they already run. Not more software to
                manage.
              </p>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/security"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Trust & governance
                </Link>
              </div>
            </motion.div>
          </section>

          <section className="rx30-pain rx30-founder" data-nav-theme="light">
            <RevealOnView className="rx30-shell">
              <p className="rx30-kicker">Founder</p>
              <h2 className="rx30-h2 rx30-founder-quote">
                I thought I wanted to open a restaurant.
                <br />
                What I really wanted was to make hospitality work better.
              </h2>
              <p className="rx30-lead rx30-founder-body" style={{ marginTop: "1.25rem" }}>
                Hospitality already had software for sales, reservations,
                staffing, inventory, purchasing, payments and accounting. What it
                did not have was a system for the decisions between them: the
                ones that determine whether revenue becomes contribution, and
                whether anyone can prove afterward that the call worked.
              </p>
              <p className="rx30-lead rx30-founder-body" style={{ marginTop: "0.75rem" }}>
                RADR is that Decision layer.
              </p>
            </RevealOnView>
          </section>

          <section className="rx30-connect" data-nav-theme="light">
            <RevealOnView className="rx30-shell">
              <p className="rx30-kicker">Principles</p>
              <h2 className="rx30-h2">What we refuse to compromise.</h2>
              <div className="rx30-co-principles">
                {PRINCIPLES.map((p, i) => (
                  <article key={p.title} className="rx30-co-principle">
                    <em>{String(i + 1).padStart(2, "0")}</em>
                    <div>
                      <strong>{p.title}</strong>
                      <span>{p.body}</span>
                    </div>
                  </article>
                ))}
              </div>
            </RevealOnView>
          </section>

          <section className="rx30-pain" data-nav-theme="light">
            <RevealOnView className="rx30-shell">
              <p className="rx30-kicker">Where it landed</p>
              <h2 className="rx30-h2">Built for hospitality operations.</h2>
              <div className="rx30-co-formats">
                <div>
                  <p className="rx30-demo-label">Core today</p>
                  <ul className="rx30-co-format-list">
                    {CORE_TODAY.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="rx30-demo-label">Architecture extends to</p>
                  <ul className="rx30-co-format-list rx30-co-format-list--muted">
                    {EXTENDS_TO.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnView>
          </section>

          <CompanyGlobalStory />

          <section className="rx30-pain" data-nav-theme="light">
            <RevealOnView className="rx30-shell">
              <p className="rx30-kicker">Trust</p>
              <h2 className="rx30-h2">Responsible by design.</h2>
              <div className="rx30-pain-grid">
                {TRUST.map((t) => (
                  <article key={t.title}>
                    <strong>{t.title}</strong>
                    <span>{t.body}</span>
                  </article>
                ))}
              </div>
              <div className="rx30-ctas">
                <Link
                  href="/security"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Trust & Security <span aria-hidden="true">→</span>
                </Link>
              </div>
            </RevealOnView>
          </section>

          <section
            className="rx30-close rx30-close--saas"
            data-nav-theme="light"
          >
            <div className="rx30-shell rx30-close-inner">
              <h2 className="rx30-h2">Put your operation on RADR.</h2>
              <div className="rx30-ctas">
                <Link
                  href={CTAS.seeInActionHref}
                  className="rx30-btn rx30-btn-primary"
                >
                  See RADR in action <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/security"
                  className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                >
                  Trust & governance
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
