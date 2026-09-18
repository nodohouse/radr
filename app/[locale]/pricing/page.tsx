import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter as PublicFooter } from "@/components/marketing/SiteFooter";
import { SiteNav as PublicNavbar } from "@/components/marketing/SiteNav";
import { FeatureCompare } from "@/components/marketing/pricing/FeatureCompare";
import { PricingExpansion } from "@/components/marketing/pricing/PricingExpansion";
import { PricingFaq } from "@/components/marketing/pricing/PricingFaq";
import { PricingHowWorks } from "@/components/marketing/pricing/PricingHowWorks";
import { PricingResponsibilityTrack } from "@/components/marketing/pricing/PricingResponsibilityTrack";
import { PricingTiers } from "@/components/marketing/pricing/PricingTiers";
import { pricingConfig } from "@/components/marketing/pricing/config";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "@/app/pricing.css";
import "@/app/kinetic.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/pricing"),
    openGraph: {
      type: "website",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://radrup.com/${locale}/pricing`,
    },
  };
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  return (
    <div className="radr px-page">
      <PublicNavbar variant="pricing" />
      <main>
        <section className="px-hero" data-nav-theme="light">
          <div className="px-hero-glow" aria-hidden="true" />
          <div className="rx-shell px-hero-inner">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="px-hero-title">
              <span className="px-hero-title-main">{t("heroTitleLine1")}</span>
              <span className="px-hero-title-sub">{t("heroTitleLine2")}</span>
            </h1>
            <p className="px-hero-lead">{t("heroLead")}</p>
            <p className="px-hero-support">{t("heroSupport")}</p>
          </div>
        </section>

        <PricingHowWorks />
        <PricingResponsibilityTrack />
        <PricingTiers />
        <FeatureCompare defaultCollapsed />
        <PricingExpansion />
        <PricingFaq />

        <section className="px-final" data-nav-theme="light">
          <div className="rx-shell">
            <h2 className="px-final-title">{t("ready")}</h2>
            <p className="px-final-small">{t("readyLead")}</p>
            <div className="px-hero-ctas">
              <Link
                href={pricingConfig.talkHref}
                className="rx-btn rx-btn-primary"
              >
                {t("readyCta")} <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={pricingConfig.demoHref}
                className="rx-btn rx-btn-ghost"
              >
                {t("readySecondary")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
