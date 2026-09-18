"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Hero } from "@/components/marketing/scenes/Hero";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";

/**
 * Margin Recovery homepage — customer-facing story.
 * Hero → one recovery → what we find → why finding isn’t enough → stack →
 * pilot → subtle platform bridge → FAQ → close CTA.
 */
export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block rx-rec-story">
            <p className="rx-rec-k">{t("story.kicker")}</p>
            <h2 className="rx-rec-h">{t("story.title")}</h2>
            <p className="rx-rec-p">{t("story.lead")}</p>

            <div className="rx-rec-story-flow">
              <article className="rx-rec-beat">
                <p className="rx-rec-beat-k">{t("story.leakK")}</p>
                <ul className="rx-rec-beat-facts">
                  <li>{t("story.leakInvoice")}</li>
                  <li>{t("story.leakContract")}</li>
                  <li>{t("story.leakQty")}</li>
                </ul>
                <p className="rx-rec-beat-euro">{t("story.leakEuro")}</p>
              </article>

              <article className="rx-rec-beat">
                <p className="rx-rec-beat-k">{t("story.checksK")}</p>
                <ul className="rx-rec-beat-facts rx-rec-checks">
                  <li>{t("story.c1")}</li>
                  <li>{t("story.c2")}</li>
                  <li>{t("story.c3")}</li>
                  <li>{t("story.c4")}</li>
                  <li>{t("story.c5")}</li>
                  <li>{t("story.c6")}</li>
                </ul>
              </article>

              <article className="rx-rec-beat">
                <p className="rx-rec-beat-k">{t("story.decisionK")}</p>
                <h3 className="rx-rec-beat-h">{t("story.decisionTitle")}</h3>
                <p className="rx-rec-beat-p">{t("story.decisionBecause")}</p>
              </article>

              <article className="rx-rec-beat">
                <p className="rx-rec-beat-k">{t("story.actionK")}</p>
                <p className="rx-rec-beat-p">{t("story.actionBody")}</p>
              </article>

              <article className="rx-rec-beat">
                <p className="rx-rec-beat-k">{t("story.outcomeK")}</p>
                <p className="rx-rec-beat-p">{t("story.outcomeBody")}</p>
              </article>

              <article className="rx-rec-beat rx-rec-beat-verified">
                <p className="rx-rec-beat-k">{t("story.verifiedK")}</p>
                <p className="rx-rec-beat-euro">{t("story.verifiedEuro")}</p>
                <p className="rx-rec-beat-p">{t("story.verifiedBody")}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("finds.kicker")}</p>
            <h2 className="rx-rec-h">{t("finds.title")}</h2>
            <p className="rx-rec-p">{t("finds.lead")}</p>
            <ul className="rx-rec-finds">
              <li>{t("finds.i1")}</li>
              <li>{t("finds.i2")}</li>
              <li>{t("finds.i3")}</li>
              <li>{t("finds.i4")}</li>
              <li>{t("finds.i5")}</li>
              <li>{t("finds.i6")}</li>
              <li>{t("finds.i7")}</li>
              <li>{t("finds.i8")}</li>
              <li>{t("finds.i9")}</li>
              <li>{t("finds.i10")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("loop.kicker")}</p>
            <h2 className="rx-rec-h">{t("loop.title")}</h2>
            <p className="rx-rec-p">{t("loop.lead")}</p>
            <p className="rx-rec-path">{t("loop.body")}</p>
            <p className="rx-rec-p">{t("loop.close")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("stack.kicker")}</p>
            <h2 className="rx-rec-h">{t("stack.title")}</h2>
            <p className="rx-rec-p">{t("stack.lead")}</p>
            <p className="rx-rec-p">{t("stack.body")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("pilot.kicker")}</p>
            <h2 className="rx-rec-h">{t("pilot.title")}</h2>
            <p className="rx-rec-p">{t("pilot.lead")}</p>
            <ul className="rx-rec-list">
              <li>{t("pilot.i1")}</li>
              <li>{t("pilot.i2")}</li>
              <li>{t("pilot.i3")}</li>
              <li>{t("pilot.i4")}</li>
            </ul>
            <p className="rx-rec-k rx-rec-deliver-k">{t("pilot.deliverK")}</p>
            <ul className="rx-rec-list">
              <li>{t("pilot.d1")}</li>
              <li>{t("pilot.d2")}</li>
              <li>{t("pilot.d3")}</li>
              <li>{t("pilot.d4")}</li>
              <li>{t("pilot.d5")}</li>
            </ul>
            <Link
              href="/contact?intent=margin-recovery-pilot"
              className="rx-btn rx-btn-primary"
            >
              {t("pilot.cta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("expansion.kicker")}</p>
            <h2 className="rx-rec-h">{t("expansion.title")}</h2>
            <p className="rx-rec-p">{t("expansion.lead")}</p>
            <p className="rx-rec-p">{t("expansion.body")}</p>
            <Link href="/product" className="rx-btn rx-btn-ghost">
              {t("expansion.cta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light" id="faq">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("faq.kicker")}</p>
            <h2 className="rx-rec-h">{t("faq.title")}</h2>
            <dl className="rx-rec-faq">
              <div>
                <dt>{t("faq.q1")}</dt>
                <dd>{t("faq.a1")}</dd>
              </div>
              <div>
                <dt>{t("faq.q2")}</dt>
                <dd>{t("faq.a2")}</dd>
              </div>
              <div>
                <dt>{t("faq.q3")}</dt>
                <dd>{t("faq.a3")}</dd>
              </div>
              <div>
                <dt>{t("faq.q4")}</dt>
                <dd>{t("faq.a4")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-brand" data-nav-theme="light">
        <div className="rx-shell rx-rec-brand-frame">
          <NothingOffTheRadr size="close" />
          <div className="rx-rec-brand-copy">
            <h2 className="rx-rec-h">{t("footer.title")}</h2>
            <p className="rx-rec-p">{t("footer.body")}</p>
            <div className="rx-he-ctas">
              <Link
                href="/contact?intent=margin-recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {t("footer.cta")} <span aria-hidden="true">→</span>
              </Link>
              <NextLink
                href="/app/lab/control-center?seed=recover"
                className="rx-btn rx-btn-ghost"
              >
                {t("footer.secondary")}
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
