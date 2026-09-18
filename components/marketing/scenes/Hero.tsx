"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { MarginResponseCard } from "@/components/marketing/scenes/home/MarginResponseCard";

/**
 * Margin & Recovery Intelligence hero — Round 2.
 * One Decision card (not Control Center soup). Sprinkle below fold only.
 */
export function Hero() {
  const t = useTranslations("homepage.hero");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin"
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
            <Link
              href="/contact?intent=margin-recovery-pilot"
              className="rx-btn rx-btn-primary"
            >
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

        <MarginResponseCard />
      </div>
    </section>
  );
}
