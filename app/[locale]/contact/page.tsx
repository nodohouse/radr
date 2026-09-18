import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { contactEmail } from "@/components/marketing/config/company";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("contactTitle"),
    description: t("contactLead"),
    alternates: buildAlternatesForLocale(locale, "/contact"),
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { plan: planRaw } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("company");
  const inbox = contactEmail();
  const selectedPlan =
    planRaw === "pilot" || planRaw === "core" || planRaw === "control"
      ? planRaw
      : undefined;

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">{t("contactTitle")}</p>
            <h1 className="rx-page-title">
              {t("contactHeroTitleLine1")}
              <br />
              {t("contactHeroTitleLine2")}
            </h1>
            <p className="rx-lead rx-lead-short">{t("contactHeroLead")}</p>
          </div>
        </section>

        <section className="rx-contact rx-contact--mineral" data-nav-theme="light">
          <div className="rx-shell rx-contact-inner">
            <Suspense fallback={null}>
              <ContactForm selectedPlan={selectedPlan} />
            </Suspense>
            {inbox ? (
              <p className="rx-contact-alt">
                {t("preferEmail")}{" "}
                <a href={`mailto:${inbox}`}>{inbox}</a>
              </p>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
