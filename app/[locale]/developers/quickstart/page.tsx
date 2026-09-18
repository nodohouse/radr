import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { QuickstartEventExamples } from "@/components/developers/QuickstartEventExamples";
import { DevelopersShell } from "@/components/developers/DevelopersShell";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developers" });
  return {
    title: t("quickstart.metaTitle"),
    description: t("quickstart.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers/quickstart"),
  };
}

export default async function DevelopersQuickstartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const steps = t.raw("quickstart.steps") as Array<{ title: string; body: string }>;

  return (
    <DevelopersShell activeHref="/developers/quickstart">
      <header className="rx-dev-page-hero">
        <div className="rx-dev-block-head">
          <p className="rx-kicker">{t("quickstart.kicker")}</p>
          <span className="rx-dev-badge">{t("badge.sandboxComing")}</span>
        </div>
        <h1 className="rx-page-title">{t("quickstart.title")}</h1>
      </header>

      <section className="rx-dev-quick-split">
        <div className="rx-dev-quick-copy">
          <ol className="rx-dev-steps rx-dev-steps-lg">
            {steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="rx-dev-proposed">{t("quickstart.proposedApi")}</p>
          <QuickstartEventExamples />
          <p className="rx-dev-fine">{t("quickstart.typedMapsNote")}</p>
          <p className="rx-dev-fine">
            <Link href="/developers/api#advanced-ingestion">
              {t("quickstart.advancedIngestionLink")}
            </Link>
          </p>
        </div>
      </section>

      <div className="rx-dev-cta">
        <Link className="rx-btn rx-btn-primary" href="/developers#integrations">
          {t("quickstart.browse")} <span aria-hidden>→</span>
        </Link>
        <Link className="rx-btn rx-btn-ghost" href="/developers/api">
          {t("quickstart.apiPreview")} <span aria-hidden>→</span>
        </Link>
        <Link className="rx-btn rx-btn-ghost" href="/developers/connectors">
          {t("quickstart.buildConnector")} <span aria-hidden>→</span>
        </Link>
      </div>
    </DevelopersShell>
  );
}
