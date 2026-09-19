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
    title: t("termsPageTitle"),
    description: t("metaTermsDescription"),
  };
}

export default async function TermsPage({ params }: Props) {
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
        href="/terms"
      />
    ) : null;

  return (
    <LegalPageShell
      kicker={t("termsKicker")}
      title={t("termsPageTitle")}
      lead={`These are website-level terms for visiting radrup.com and related marketing pages. They are not a customer SaaS subscription agreement. Entity-specific clauses require counsel confirmation.`}
      updated={
        COMPANY.termsUpdated
          ? t("lastUpdated", { date: COMPANY.termsUpdated })
          : undefined
      }
      draftLabel={t("draftNotice")}
      notice={notice}
    >

      {showDevWarn ? (
        <LegalPending>
          <strong>Development notice:</strong> governing-law and entity fields
          in <code>company.ts</code> are incomplete.
        </LegalPending>
      ) : null}

      <LegalSection title="1. Website use">
        <p>
          By using this website you agree to these terms. If you do not agree,
          do not use the site.
        </p>
        <p>
          The site provides information about {COMPANY.brandName} — an adaptive
          operational decision system for hospitality — and may link to product
          sign-in or signup flows.
        </p>
      </LegalSection>

      <LegalSection title="2. Intellectual property">
        <p>
          The {COMPANY.brandName} name, wordmark, △ mark, copy, design, and
          other site content are owned by the operating entity (or used under
          license) and are protected by applicable IP laws. You may not copy,
          scrape, or reuse branding or content for commercial purposes without
          permission.
        </p>
      </LegalSection>

      <LegalSection title="3. Information accuracy">
        <p>
          We aim to keep information accurate and current, but the site may
          contain errors or outdated details. Features described may be in
          development.
        </p>
      </LegalSection>

      <LegalSection title="4. Demo and illustrative values">
        <p>
          Product demos, example findings, and monetary figures shown on the
          marketing site (for example sample deltas and annual exposures) are{" "}
          <strong>illustrative</strong>. They are not a promise of results for
          your operation.
        </p>
      </LegalSection>

      <LegalSection title="5. No financial guarantee">
        <p>
          {COMPANY.brandName} does not guarantee cost savings, recoveries, or
          revenue outcomes. Business decisions remain yours.
        </p>
      </LegalSection>

      <LegalSection title="5A. Model-based outputs">
        <p>
          {COMPANY.brandName} may provide forecasts, estimates, scenarios,
          rankings and operational recommendations based on available customer
          and third-party data.
        </p>
        <p>
          Such outputs are probabilistic and may be incomplete, inaccurate or
          affected by events not represented in the available data. Forecasts,
          expected value, predicted outcomes and recommendations are not
          guarantees of future results.
        </p>
        <p>
          {COMPANY.brandName} provides operational decision-support software and
          does not provide investment, legal, tax or regulated financial advice.
          Customers remain responsible for decisions made using the service and
          should apply appropriate human judgment, particularly for material,
          safety-sensitive, employment-related or irreversible actions.
        </p>
        <LegalPending>
          Model-based outputs clause: subject to counsel review.
        </LegalPending>
      </LegalSection>

      <LegalSection title="6. External links">
        <p>
          The site may link to third-party sites (including social profiles when
          published). We are not responsible for third-party content or
          practices.
        </p>
      </LegalSection>

      <LegalSection title="7. Liability">
        <p>
          To the fullest extent permitted by law, {COMPANY.brandName} and its
          operators are not liable for indirect, incidental, or consequential
          damages arising from use of this website. Nothing in these terms
          excludes liability that cannot be excluded under applicable law.
        </p>
        <LegalPending>
          Detailed limitation-of-liability language: pending counsel review.
        </LegalPending>
      </LegalSection>

      <LegalSection title="8. Governing law">
        <p>
          Governing law: {displayOrPending(COMPANY.governingLaw)}.
          <br />
          Dispute venue: {displayOrPending(COMPANY.disputeVenue)}.
        </p>
        <LegalPending>
          Governing law and venue: pending company / counsel confirmation.
        </LegalPending>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Questions about these terms:{" "}
          {hasValue(COMPANY.email) ? (
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          ) : (
            <>
              <Link href="/contact">Contact</Link>
            </>
          )}
          .
        </p>
        <p>
          Related: <Link href="/privacy">Privacy Policy</Link> ·{" "}
          <Link href="/imprint">Imprint</Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
