import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/developers/CodeBlock";
import { DevelopersShell } from "@/components/developers/DevelopersShell";
import { Link } from "@/i18n/navigation";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developers" });
  return {
    title: t("webhooks.metaTitle"),
    description: t("webhooks.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers/webhooks"),
  };
}

const OUTBOUND_EVENTS = [
  "finding.created",
  "decision.detected",
  "decision.recommended",
  "decision.approved",
  "action.prepared",
  "action.executed",
  "outcome.observed",
  "value.verified",
  "memory.updated",
] as const;

export default async function DevelopersWebhooksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const inboundSteps = t.raw("webhooks.inboundSteps") as string[];

  return (
    <DevelopersShell activeHref="/developers/webhooks">
      <header className="rx-dev-page-hero">
        <div className="rx-dev-block-head">
          <p className="rx-kicker">{t("webhooks.kicker")}</p>
          <span className="rx-dev-badge">{t("badge.designPreview")}</span>
        </div>
        <h1 className="rx-page-title">{t("webhooks.title")}</h1>
        <p className="rx-lead-inv rx-lead-short">{t("webhooks.lead")}</p>
      </header>

      <section className="rx-dev-block">
        <h2>{t("webhooks.inboundTitle")}</h2>
        <ol className="rx-dev-steps">
          {inboundSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="rx-dev-fine">{t("webhooks.inboundFine")}</p>
      </section>

      <section className="rx-dev-block">
        <h2>{t("webhooks.outboundTitle")}</h2>
        <p className="rx-dev-fine">{t("webhooks.outboundProposed")}</p>
        <ul className="rx-dev-bullets">
          {OUTBOUND_EVENTS.map((event) => (
            <li key={event}>
              <code>{event}</code>
            </li>
          ))}
        </ul>
        <CodeBlock
          language="json"
          code={`{
  "id": "evt_example",
  "type": "finding.created",
  "created_at": "2026-08-24T18:02:00Z",
  "data": {}
}`}
        />
        <p className="rx-dev-fine">{t("webhooks.outboundFine")}</p>
      </section>

      <p className="rx-home-linkrow">
        <Link href="/developers/api">{t("webhooks.apiLink")}</Link>
        {" · "}
        <Link href="/developers">{t("webhooks.overviewLink")}</Link>
      </p>
    </DevelopersShell>
  );
}
