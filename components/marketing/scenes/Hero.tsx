"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";

/**
 * Recover-first hero — D0 commercial wedge.
 * No Wait-12 / hotel / seating above the fold.
 */
export function Hero() {
  const t = useTranslations("homepage.hero");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover"
      id="product"
      data-nav-theme="light"
    >
      <div className="rx-shell rx-he-recover-frame">
        <div className="rx-he-recover-copy">
          <p className="rx-he-recover-kicker">{t("kicker")}</p>
          <h1 className="rx-he-recover-title">{t("title")}</h1>
          <p className="rx-he-recover-sub">{t("sub")}</p>
          <p className="rx-he-recover-support">{t("support")}</p>

          <div className="rx-he-ctas">
            <Link href="/contact?intent=recover-pilot" className="rx-btn rx-btn-primary">
              {t("ctaPrimary")} <span aria-hidden="true">→</span>
            </Link>
            <NextLink
              href="/app/lab/control-center?seed=recover"
              className="rx-btn rx-btn-ghost"
            >
              {t("ctaSecondary")}
            </NextLink>
          </div>
        </div>

        <aside className="rx-he-recover-card" aria-label={t("card.aria")}>
          <p className="rx-he-recover-card-k">{t("card.kicker")}</p>
          <p className="rx-he-recover-card-id">{t("card.id")}</p>
          <h2 className="rx-he-recover-card-title">{t("card.title")}</h2>
          <p className="rx-he-recover-card-euro">
            <strong>{t("card.euro")}</strong>
            <span data-grade="Verified">{t("card.grade")}</span>
          </p>
          <p className="rx-he-recover-card-because">{t("card.because")}</p>
          <ol className="rx-he-recover-chain">
            <li>{t("card.step1")}</li>
            <li>{t("card.step2")}</li>
            <li>{t("card.step3")}</li>
            <li>{t("card.step4")}</li>
            <li>{t("card.step5")}</li>
          </ol>
          <p className="rx-he-recover-card-note">{t("card.note")}</p>
        </aside>
      </div>
    </section>
  );
}
