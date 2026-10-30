import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { contactEmail } from "@/components/marketing/config/company";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../kinetic.css";
import "../../home.css";

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

const LOOKS_FOR = [
  "Supplier / AP variance",
  "Reconciliation gaps",
  "Cost variance drivers",
  "Procurement dispersion",
  "Perishable revenue clocks",
] as const;

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
            <h1 className="rx-page-title">Talk to RADR</h1>
            <p className="rx-lead rx-lead-short">
              Tell us about your estate. We will scope access and pricing
              honestly.
            </p>
          </div>
        </section>

        <section className="rx-contact rx-contact--mineral" data-nav-theme="light">
          <div className="rx-shell rx-contact-split">
            <aside className="rx-contact-rail">
              <p className="rx-rec-k">Where value often leaks</p>
              <ul>
                {LOOKS_FOR.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="rx-rec-muted" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
                Start where the economics are clearest. Expand as Verified Value
                proves the Decision layer.
              </p>
            </aside>
            <div>
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
