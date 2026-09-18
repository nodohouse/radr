"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Hero } from "@/components/marketing/scenes/Hero";
import { ProblemFamiliesRail } from "@/components/marketing/scenes/home/ProblemFamiliesRail";
import { PROGRESSION } from "@/lib/radr/problemFamilies";
import type { ProblemFamily } from "@/lib/radr/problemFamilies";

/**
 * Homepage — recover value that fragmented hospitality operations lose.
 * Hero → five leaks → one story → how RADR thinks → recover→prevent →
 * stack → pilot → platform → FAQ → close.
 */
export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

  const familyKeys: ProblemFamily[] = [
    "SUPPLIER_AP",
    "RECONCILIATION",
    "COST_VARIANCE",
    "PROCUREMENT",
    "PERISHABLE_REVENUE",
  ];

  const labels = Object.fromEntries(
    familyKeys.map((id) => [id, t(`families.${id}.label`)]),
  ) as Record<ProblemFamily, string>;
  const leaks = Object.fromEntries(
    familyKeys.map((id) => [id, t(`families.${id}.leaks`)]),
  ) as Record<ProblemFamily, string>;
  const does = Object.fromEntries(
    familyKeys.map((id) => [id, t(`families.${id}.does`)]),
  ) as Record<ProblemFamily, string>;
  const verifies = Object.fromEntries(
    familyKeys.map((id) => [id, t(`families.${id}.verifies`)]),
  ) as Record<ProblemFamily, string>;

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <ProblemFamiliesRail
            kicker={t("families.kicker")}
            title={t("families.title")}
            lead={t("families.lead")}
            labels={labels}
            leaks={leaks}
            does={does}
            verifies={verifies}
            whatLeaks={t("families.whatLeaks")}
            whatDoes={t("families.whatDoes")}
            whatVerifies={t("families.whatVerifies")}
            maturityPilot={t("families.maturityPilot")}
            maturityExpansion={t("families.maturityExpansion")}
          />
        </div>
      </section>

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
            <p className="rx-rec-k">{t("thinks.kicker")}</p>
            <h2 className="rx-rec-h">{t("thinks.title")}</h2>
            <p className="rx-rec-path">{t("thinks.flow")}</p>
            <p className="rx-rec-p">{t("thinks.lead")}</p>
            <p className="rx-rec-diff">{t("thinks.diff")}</p>
            <p className="rx-rec-p">{t("thinks.close")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("progression.kicker")}</p>
            <h2 className="rx-rec-h">{t("progression.title")}</h2>
            <p className="rx-rec-p">{t("progression.lead")}</p>
            <ol className="rx-rec-progress">
              {PROGRESSION.map((step) => (
                <li key={step.stage}>
                  <strong>{t(`progression.${step.stage}.title`)}</strong>
                  <span>{t(`progression.${step.stage}.body`)}</span>
                </li>
              ))}
            </ol>
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
            <p className="rx-rec-k rx-rec-deliver-k">{t("stack.integrationsK")}</p>
            <ul className="rx-rec-finds">
              <li>{t("stack.i1")}</li>
              <li>{t("stack.i2")}</li>
              <li>{t("stack.i3")}</li>
              <li>{t("stack.i4")}</li>
              <li>{t("stack.i5")}</li>
            </ul>
            <p className="rx-rec-p rx-rec-muted">{t("stack.statesNote")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("pilot.kicker")}</p>
            <h2 className="rx-rec-h">{t("pilot.title")}</h2>
            <p className="rx-rec-p">{t("pilot.lead")}</p>
            <p className="rx-rec-p">{t("pilot.scope")}</p>
            <ul className="rx-rec-list">
              <li>{t("pilot.opt1")}</li>
              <li>{t("pilot.opt2")}</li>
              <li>{t("pilot.opt3")}</li>
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
              href="/contact?intent=recovery-pilot"
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
        <div className="rx-shell">
          <div className="rx-rec-brand-copy">
            <p className="rx-rec-brand-line">{t("footer.brand")}</p>
            <h2 className="rx-rec-h">{t("footer.title")}</h2>
            <p className="rx-rec-p">{t("footer.body")}</p>
            <div className="rx-he-ctas">
              <Link
                href="/contact?intent=recovery-pilot"
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
