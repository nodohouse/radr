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

      <section className="rx-dev-block" id="implemented-uploads">
        <h2>Implemented workspace upload routes</h2>
        <p>
          These session-authenticated application routes are separate from the
          proposed public /v1 API. Workspace membership and upload permission
          are required. A public demo does not grant upload access.
        </p>
        <div
          className="rx-dev-table-wrap"
          role="region"
          aria-label="Implemented upload routes"
          tabIndex={0}
        >
          <table className="rx-dev-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Accepted input</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>POST /api/documents/upload</code>
                </td>
                <td>
                  Multipart file/files, organizationId, optional locationId and
                  documentType. PDF/JPEG/PNG, 15 MB per file, at most 10 files.
                </td>
                <td>
                  Private document storage and an UPLOADED record. Upload is not
                  proof of extraction or a verified outcome.
                </td>
              </tr>
              <tr>
                <td>
                  <code>POST /api/onboarding/upload</code>
                </td>
                <td>
                  Multipart file and documentType: CONTRACT or INVOICE. UTF-8
                  CSV, up to 1 MB. Workspace scope comes from the session.
                </td>
                <td>
                  Validated CSV document and row count for the onboarding
                  analysis path.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="rx-dev-fine">
          These are application validation limits; hosting request limits may be
          lower. Without a valid session these routes return 401. Permission,
          format and size checks may reject the upload. Their current error
          responses are separate from the proposed public API error envelope
          below.
        </p>
        <Link href="/developers/connectors#csv">
          Read the exact formats and sample schemas →
        </Link>
      </section>
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
        <p className="rx-dev-fine">
          The .invalid host is deliberately non-routable. The RADR class below
          is interface pseudocode, not a package you can install today. Use the
          quickstart for a runnable local example.
        </p>
        <a
          className="rx-btn rx-btn-ghost"
          href="/developers/radr-v1-preview.yaml"
          download
        >
          Download proposed OpenAPI specification ↓
        </a>
        <CodeBlock
          language="bash"
          code={`curl https://api.example.invalid/v1/locations \\
  -H "Authorization: Bearer $RADR_API_KEY" \\
  -H "Accept: application/json"`}
        />
        <CodeBlock
          language="typescript"
          code={`// Interface proposal only. No published SDK package.
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
// Proposed typed methods would map onto this proposed event layer.
await radr.events.ingest({
  type: "reservation.created",
  location: "demo-soho-new-york",
  observedAt: "2026-08-24T20:00:00-04:00",
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
        <p className="rx-dev-fine">
          The list describes broader proposed scope. The downloadable
          specification is partial and declares its own paths; neither is a
          shipped service contract.
        </p>
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
