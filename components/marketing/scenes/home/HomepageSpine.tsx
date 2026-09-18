"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Hero } from "@/components/marketing/scenes/Hero";
import { ValueLeakMap } from "@/components/marketing/scenes/home/ValueLeakMap";
import { RecoveryStoryObject } from "@/components/marketing/scenes/home/RecoveryStoryObject";
import { ProgressionLadder } from "@/components/marketing/scenes/home/ProgressionLadder";
import type { ProblemFamily, ProgressionStage } from "@/lib/radr/problemFamilies";

/**
 * Homepage — category-defining recovery story.
 * Hero → leak map → recovery object → how RADR thinks → progression →
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

  const progTitles = {
    RECOVER: t("progression.RECOVER.title"),
    PREVENT: t("progression.PREVENT.title"),
    OPTIMIZE: t("progression.OPTIMIZE.title"),
    AUTOPILOT: t("progression.AUTOPILOT.title"),
  } as Record<ProgressionStage, string>;
  const progBodies = {
    RECOVER: t("progression.RECOVER.body"),
    PREVENT: t("progression.PREVENT.body"),
    OPTIMIZE: t("progression.OPTIMIZE.body"),
    AUTOPILOT: t("progression.AUTOPILOT.body"),
  } as Record<ProgressionStage, string>;

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <ValueLeakMap
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
            maturityPlanned={t("families.maturityPlanned")}
          />
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <RecoveryStoryObject
            kicker={t("story.kicker")}
            title={t("story.title")}
            lead={t("story.lead")}
          />
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
            <ul className="rx-rec-punch">
              <li>{t("thinks.examples.0")}</li>
              <li>{t("thinks.examples.1")}</li>
              <li>{t("thinks.examples.2")}</li>
              <li>{t("thinks.examples.3")}</li>
              <li>{t("thinks.examples.4")}</li>
            </ul>
            <p className="rx-rec-p">{t("thinks.close")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <ProgressionLadder
            kicker={t("progression.kicker")}
            title={t("progression.title")}
            lead={t("progression.lead")}
            titles={progTitles}
            bodies={progBodies}
          />
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
