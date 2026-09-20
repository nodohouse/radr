import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  HOMEPAGE_DEMO,
  formatHomepageUsd,
} from "@/components/marketing/data/homepageDemo";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "product.chapters.ask",
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/product/ask"),
  };
}

export default async function AskChapterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product.chapters.ask");
  const demo = HOMEPAGE_DEMO;
  const labor = demo.findings.labor;
  const prompts = demo.askExamples.slice(0, 5);

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
            <header className="rx-ch-sec-head">
              <h2>{t("panelTitle")}</h2>
              <p>{t("panelLead")}</p>
            </header>

            <div className="rx-ch-ask">
              <ul className="rx-ch-ask-prompts" aria-label={t("promptsLabel")}>
                {prompts.map((q, i) => (
                  <li key={q} data-on={i === 0 ? "true" : undefined}>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>

              <div
                className="rx-ch-frame rx-ch-ask-answer"
                aria-label={t("frameLabel")}
              >
                <div className="rx-ch-chrome">
                  <span className="rx-ch-chrome-left">
                    <i aria-hidden="true" />
                    {t("chrome")}
                  </span>
                  <span>{demo.org.name}</span>
                </div>
                <div className="rx-ch-body">
                  <p className="rx-ch-ask-q">
                    {t("questionLabel")}{" "}
                    <strong>{prompts[0]}</strong>
                  </p>
                  <p className="rx-ch-ask-lead">{t("answerLead")}</p>
                  <p className="rx-ch-ask-body">
                    {t("answerBody", {
                      location: demo.locations.labor.label,
                      peakStart: labor.peakStart,
                      peakEnd: labor.peakEnd,
                    })}
                  </p>
                  <div className="rx-ch-ask-money">
                    <div>
                      <strong>{formatHomepageUsd(labor.amount)}</strong>
                      <em> {t("atRisk")}</em>
                    </div>
                  </div>
                  <p className="rx-ch-ask-next">
                    <span>{t("preparedLabel")}</span>
                    {labor.action}
                  </p>
                </div>
              </div>
            </div>

            <p className="rx-ch-note">{t("honestyNote")}</p>
            <p className="rx-ch-links">
              <Link href="/product/findings">{t("linkFindings")}</Link>
              <Link href="/product/actions">{t("linkActions")}</Link>
              <Link href="/product">{t("linkArchitecture")}</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
