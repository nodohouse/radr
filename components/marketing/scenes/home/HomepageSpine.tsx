"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Hero } from "@/components/marketing/scenes/Hero";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";

/**
 * Margin & Recovery homepage spine.
 * Shared left edge across hero copy + body sections.
 */
export function HomepageSpine() {
  const t = useTranslations("homepage.recover");

  return (
    <div className="rx-home-spine">
      <Hero />

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("problem.kicker")}</p>
            <h2 className="rx-rec-h">{t("problem.title")}</h2>
            <p className="rx-rec-p">{t("problem.body")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-sec-band" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("how.kicker")}</p>
            <h2 className="rx-rec-h">{t("how.title")}</h2>
            <ol className="rx-rec-steps">
              <li>
                <strong>{t("how.s1t")}</strong>
                <span>{t("how.s1d")}</span>
              </li>
              <li>
                <strong>{t("how.s2t")}</strong>
                <span>{t("how.s2d")}</span>
              </li>
              <li>
                <strong>{t("how.s3t")}</strong>
                <span>{t("how.s3d")}</span>
              </li>
            </ol>
            <p className="rx-rec-stop">{t("how.stop")}</p>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("pilot.kicker")}</p>
            <h2 className="rx-rec-h">{t("pilot.title")}</h2>
            <ul className="rx-rec-list">
              <li>{t("pilot.i1")}</li>
              <li>{t("pilot.i2")}</li>
              <li>{t("pilot.i3")}</li>
              <li>{t("pilot.i4")}</li>
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
            <p className="rx-rec-k">{t("foils.kicker")}</p>
            <h2 className="rx-rec-h">{t("foils.title")}</h2>
            <ul className="rx-rec-foils">
              <li>{t("foils.f1")}</li>
              <li>{t("foils.f2")}</li>
              <li>{t("foils.f3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-rec-block">
            <p className="rx-rec-k">{t("vision.kicker")}</p>
            <details className="rx-rec-vision">
              <summary>{t("vision.summary")}</summary>
              <p>{t("vision.body")}</p>
            </details>
          </div>
        </div>
      </section>

      <section className="rx-rec-sec rx-rec-brand" data-nav-theme="light">
        <div className="rx-shell rx-rec-brand-frame">
          <NothingOffTheRadr />
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
