import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LegalConvenienceNotice,
  LegalPageShell,
  LegalPending,
  LegalSection,
} from "@/components/marketing/LegalPageShell";
import {
  COMPANY,
  displayOrPending,
  hasValue,
  isLegalEntityComplete,
} from "@/components/marketing/config/company";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("privacyPageTitle"),
    description: t("metaPrivacyDescription"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const showDevWarn =
    process.env.NODE_ENV === "development" && !isLegalEntityComplete();
  const notice =
    locale !== "en" ? (
      <LegalConvenienceNotice
        message={t("convenienceNotice")}
        linkLabel={t("officialEn")}
        href="/privacy"
      />
    ) : null;

  return (
    <LegalPageShell
      kicker={t("privacyKicker")}
      title={t("privacyPageTitle")}
      lead={`This notice explains what information RADR handles on the website and product. It is a professional draft. Entity-specific details marked below require confirmation before this is treated as final.`}
      updated={
        COMPANY.privacyUpdated
          ? t("lastUpdated", { date: COMPANY.privacyUpdated })
          : undefined
      }
      draftLabel={t("draftNotice")}
      notice={notice}
    >

      {showDevWarn ? (
        <LegalPending>
          <strong>Development notice:</strong> legal entity fields in{" "}
          <code>company.ts</code> are incomplete. Do not treat placeholder
          values as published facts.
        </LegalPending>
      ) : null}

      <LegalSection title="1. Controller / company responsible">
        <p>
          The controller for personal data processed through RADR will be the
          legal entity operating the service.
        </p>
        <dl className="rx-legal-dl">
          <div>
            <dt>Legal name</dt>
            <dd>{displayOrPending(COMPANY.legalName)}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              {hasValue(COMPANY.addressLines)
                ? COMPANY.addressLines.join(", ")
                : "To be published"}
            </dd>
          </div>
          <div>
            <dt>Privacy contact</dt>
            <dd>
              {hasValue(COMPANY.privacyEmail || COMPANY.email)
                ? COMPANY.privacyEmail || COMPANY.email
                : "To be published"}
            </dd>
          </div>
        </dl>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>Depending on how you use RADR, we may process:</p>
        <ul>
          <li>
            <strong>Account data</strong>: name, work email, authentication
            credentials (handled by Better Auth; passwords are not stored in
            plaintext).
          </li>
          <li>
            <strong>Organization data</strong>: company / group details
            provided during onboarding (for example country, locations).
          </li>
          <li>
            <strong>Business documents</strong>: PDFs and images you upload
            (invoices and related files) for product features.
          </li>
          <li>
            <strong>Contact inquiries</strong>: work email, company, location
            count, and optional message submitted via the contact form.
          </li>
          <li>
            <strong>Technical logs</strong>: standard server logs needed to
            operate and secure the service (for example request metadata).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Website analytics">
        <p>
          The public marketing site does <strong>not</strong> currently load
          third-party analytics, advertising pixels, or marketing trackers.
        </p>
        <p>
          If analytics are introduced later, this policy will be updated and,
          where required, consent will be collected before non-essential
          tracking loads.
        </p>
      </LegalSection>

      <LegalSection title="4. Contact and demo requests">
        <p>
          When you submit the contact form, we use the details you provide to
          respond to your inquiry. Delivery uses a configured webhook and/or
          email inbox when available; submissions are not silently discarded.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>
          Essential cookies may be used for authenticated product sessions
          (Better Auth session cookies).
        </p>
        <p>
          The marketing website does not set non-essential analytics or
          advertising cookies at this time. Because of that, no cookie consent
          banner is shown for marketing tracking.
        </p>
      </LegalSection>

      <LegalSection title="6. Hosting and storage">
        <p>
          Application hosting depends on the deployment environment operated by
          RADR. Document files are stored using a private storage driver:
        </p>
        <ul>
          <li>
            <strong>Local private storage</strong> in development (filesystem
            under the application data directory), or
          </li>
          <li>
            <strong>Private S3-compatible object storage</strong> when
            configured for production.
          </li>
        </ul>
        <p>
          Account and operational data are stored in a Postgres database when
          the product backend is configured.
        </p>
      </LegalSection>

      <LegalSection title="7. Data processors">
        <p>
          Depending on configuration, RADR may use infrastructure providers for
          authentication, database, and object storage. A confirmed
          subprocessor list will be published here once the production stack is
          finalized.
        </p>
        <LegalPending>
          Subprocessor list: pending production confirmation. Do not assume
          specific cloud vendors from this draft alone.
        </LegalPending>
      </LegalSection>

      <LegalSection title="8. Retention">
        <p>
          We retain account and document data for as long as needed to provide
          the service and meet legal obligations.
        </p>
        <LegalPending>
          Retention periods by data type: pending counsel confirmation.
        </LegalPending>
      </LegalSection>

      <LegalSection title="9. Data security">
        <p>
          Access to documents and organization data requires authentication and
          server-side authorization checks. See also the{" "}
          <Link href="/security">Security</Link> page for controls that are
          live versus in development.
        </p>
        <p>
          No security measure is perfect. We do not claim certifications (SOC
          2, ISO, etc.) on this site unless independently verified and listed
          with scope and date.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          If personal data is transferred internationally, appropriate
          safeguards will be described here once the production hosting regions
          and processors are confirmed.
        </p>
        <LegalPending>
          Transfer mechanisms: pending production / counsel confirmation.
        </LegalPending>
      </LegalSection>

      <LegalSection title="11. Your rights">
        <p>
          Depending on applicable law (including GDPR where it applies), you may
          have rights to access, rectify, erase, restrict, or object to certain
          processing, and to data portability. You may also have the right to
          lodge a complaint with a supervisory authority.
        </p>
        <p>
          To exercise rights, contact the privacy contact listed above once
          published.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Privacy questions:{" "}
          {hasValue(COMPANY.privacyEmail || COMPANY.email) ? (
            <a href={`mailto:${COMPANY.privacyEmail || COMPANY.email}`}>
              {COMPANY.privacyEmail || COMPANY.email}
            </a>
          ) : (
            <>
              use <Link href="/contact">Contact</Link> until a dedicated privacy
              inbox is published.
            </>
          )}
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to this policy">
        <p>
          We may update this notice as the product and legal entity details
          mature. Material changes will be reflected on this page with an
          updated date.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
