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
    title: t("api.metaTitle"),
    description: t("api.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/developers/api"),
  };
}

function withCodeEnv(body: string) {
  const marker = "NEXT_PUBLIC_*";
  const i = body.indexOf(marker);
  if (i === -1) return body;
  return (
    <>
      {body.slice(0, i)}
      <code>{marker}</code>
      {body.slice(i + marker.length)}
    </>
  );
}

export default async function DevelopersApiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const resources = t.raw("api.resources") as string[];

  return (
    <DevelopersShell activeHref="/developers/api">
      <header className="rx-dev-page-hero">
        <div className="rx-dev-block-head">
          <p className="rx-kicker">{t("api.kicker")}</p>
          <span className="rx-dev-badge">{t("badge.designPreview")}</span>
        </div>
        <h1 className="rx-page-title">{t("api.title")}</h1>
        <p className="rx-lead-inv rx-lead-short">{t("api.lead")}</p>
      </header>

      <section className="rx-dev-block" id="authentication">
        <h2>{t("api.authTitle")}</h2>
        <p>{withCodeEnv(t("api.authBody"))}</p>
        <CodeBlock
          language="env"
          code={`RADR_ENV=sandbox
RADR_API_BASE_URL=https://api.example.invalid
RADR_API_KEY=radr_test_your_test_api_key`}
        />
      </section>

      <section className="rx-dev-block" id="examples">
        <h2>{t("api.exampleTitle")}</h2>
        <CodeBlock
          language="bash"
          code={`curl https://api.example.invalid/v1/locations \\
  -H "Authorization: Bearer $RADR_API_KEY" \\
  -H "Accept: application/json"`}
        />
        <CodeBlock
          language="typescript"
          code={`// Technical Preview · typed SDK (preferred Quickstart path)
const radr = new RADR({
  baseUrl: process.env.RADR_API_BASE_URL,
  apiKey: process.env.RADR_API_KEY,
})

const locations = await radr.locations.list()
`}
        />
      </section>

      <section className="rx-dev-block" id="advanced-ingestion">
        <h2>{t("api.advancedIngestTitle")}</h2>
        <p>{t("api.advancedIngestBody")}</p>
        <CodeBlock
          language="typescript"
          code={`// Technical Preview · generic event ingestion (lower-level)
// Typed SDK methods such as radr.reservations.create(...) map onto this layer.
await radr.events.ingest({
  type: "reservation.created",
  location: "berlin-mitte",
  observedAt: "2026-08-24T20:00:00+02:00",
  payload: {
    partySize: 4,
    channel: "direct",
  },
})
// EVENT → NORMALIZED OPERATING STATE → FINDING → DECISION
// → SCENARIO / FUTURES → ACTION → OUTCOME → VERIFIED VALUE → MEMORY`}
        />
      </section>

      <section className="rx-dev-block">
        <h2>{t("api.resourcesTitle")}</h2>
        <ul className="rx-dev-bullets">
          {resources.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="rx-dev-fine">
          Spec: <code>openapi/radr-v1.yaml</code> · Docs:{" "}
          <code>docs/platform/API_DESIGN.md</code>
        </p>
      </section>

      <section className="rx-dev-block" id="errors">
        <h2>{t("api.errorsTitle")}</h2>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Location does not exist or is not accessible.",
    "request_id": "req_example"
  }
}`}
        />
      </section>

      <section className="rx-dev-block" id="data-model">
        <h2>{t("api.dataModelTitle")}</h2>
        <p>
          {t("api.dataModelBody")} See{" "}
          <code>docs/platform/NORMALIZED_DATA_MODEL.md</code>.
        </p>
      </section>

      <p className="rx-home-linkrow">
        <Link href="/developers/webhooks">{t("api.webhooksLink")}</Link>
        {" · "}
        <Link href="/developers/connectors">{t("api.connectorLink")}</Link>
      </p>
    </DevelopersShell>
  );
}
