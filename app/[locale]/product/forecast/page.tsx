import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { ShowDontExplain } from "@/components/marketing/product/ShowDontExplain";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "product.chapters.forecast",
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/product/forecast"),
  };
}

export default async function ForecastChapterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product.chapters.forecast");

  return (
    <div className="radr rx-ch">
      <SiteNav />
      <main>
        <section className="rx-ch-hero" data-nav-theme="light">
          <div className="rx-shell rx-ch-hero-inner">
            <p className="rx-ch-kicker">{t("kicker")}</p>
            <h1 className="rx-ch-title">{t("title")}</h1>
            <p className="rx-ch-lead">{t("lead")}</p>
            <div className="rx-ch-ctas">
              <NextLink href="/app" className="rx-ch-cta">
                {t("cta")} →
              </NextLink>
              <Link href="/contact" className="rx-ch-cta-ghost">
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        <section className="rx-ch-sec" data-nav-theme="light">
          <div className="rx-shell">
            <ShowDontExplain title={t("boardTitle")} lead={t("boardLead")} />

            <p className="rx-ch-note">
              {t("demoNote")}{" "}
              <NextLink href="/app/forecast">{t("demoLink")}</NextLink>
            </p>

            <p className="rx-ch-links">
              <Link href="/product/actions">{t("linkActions")}</Link>
              <Link href="/product/control-center">{t("linkControl")}</Link>
              <Link href="/product">{t("linkArchitecture")}</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
