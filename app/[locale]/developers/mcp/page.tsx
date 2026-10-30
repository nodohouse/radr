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
    title: t("mcp.metaTitle"),
    description: t("mcp.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers/mcp"),
  };
}

const EXAMPLE_CALL = `radr.get_decisions({
  scope: "europe",
  state: "needs_you",
  min_exposure: 2000
})`;

const EXAMPLE_RESPONSE = `{
  "tool": "get_decisions",
  "version": "2026.09.preview",
  "preview": true,
  "label": "COMING TO DEVELOPER PREVIEW",
  "evidenceState": "OBSERVED",
  "data": {
    "count": 2,
    "decisions": [
      {
        "displayId": "D-1911",
        "title": "Peak capacity collision",
        "status": "RECOMMENDED",
        "expectedContributionImpact": 620
      }
    ]
  }
}`;

export default async function DevelopersMcpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const what = t.raw("mcp.what") as string[];

  return (
    <DevelopersShell activeHref="/developers/mcp">
      <header className="rx-dev-page-hero">
        <p className="rx-kicker">{t("mcp.kicker")}</p>
        <p className="rx-dev-badge">{t("mcp.badge")}</p>
        <h1 className="rx-page-title">{t("mcp.title")}</h1>
        <p className="rx-lead rx-lead-short">{t("mcp.lead")}</p>
      </header>

      <section className="rx-dev-block">
        <h2 className="rx-display rx-display-sm">{t("mcp.whatTitle")}</h2>
        <ul className="rx-dev-list">
          {what.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rx-dev-block">
        <h2 className="rx-display rx-display-sm">{t("mcp.governanceTitle")}</h2>
        <p className="rx-lead rx-lead-short">{t("mcp.governance")}</p>
      </section>

      <section className="rx-dev-block">
        <h2 className="rx-display rx-display-sm">{t("mcp.exampleTitle")}</h2>
        <p className="rx-sec-note">{t("mcp.exampleNote")}</p>
        <CodeBlock code={EXAMPLE_CALL} language="typescript" />
        <h3 className="rx-dev-h3">{t("mcp.responseTitle")}</h3>
        <CodeBlock code={EXAMPLE_RESPONSE} language="json" />
      </section>

      <p className="rx-dev-footer-links">
        <Link href="/developers/api">{t("mcp.backApi")} →</Link>
      </p>
    </DevelopersShell>
  );
}
