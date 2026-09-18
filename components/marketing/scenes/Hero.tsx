"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { MarginResponseCard } from "@/components/marketing/scenes/home/MarginResponseCard";
import { NothingOffTheRadr } from "@/components/marketing/scenes/home/NothingOffTheRadr";

/**
 * Brand stack hero:
 * H0 NOTHING OFF THE R△DR → H1 Monday money → CTAs → Decision card
 */
export function Hero() {
  const t = useTranslations("homepage.hero");

  return (
    <section
      className="rx-he rx-he-light rx-he-recover rx-he-margin"
      id="product"
      data-nav-theme="light"
      aria-label={t("ariaLabel")}
    >
      <div className="rx-shell rx-he-recover-frame">
        <div className="rx-he-recover-copy">
          <NothingOffTheRadr size="display" className="rx-he-h0" />
          <h1 className="rx-he-recover-title">{t("title")}</h1>
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
