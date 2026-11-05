import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LegalPageShell,
  LegalSection,
  LegalPending,
} from "@/components/marketing/LegalPageShell";
import {
  COMPANY,
  displayOrPending,
} from "@/components/marketing/config/company";
import { buildAlternatesForLocale } from "@/i18n/seo";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Imprint | RADR",
    description:
      "RADR legal identity and publication status, registration details awaiting confirmation, contact limitations and related notices.",
    alternates: buildAlternatesForLocale(locale, "/imprint"),
  };
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalPageShell
      kind="imprint"
      kicker="RADR · Trust library"
      title="Imprint"
      lead="Company identity and publication details, shown only when confirmed. RADR’s registered entity information is not yet ready for publication."
      notice={
        locale !== "en" ? (
          <p className="rx-legal-pending">
            This document is currently available in English. Reviewed
            translations are not yet published.
          </p>
        ) : undefined
      }
    >
      <LegalSection title="1. Publication status">
        <p>
          RADR is the brand used on radrup.com. The registered operating entity
          and company-specific legal details are not ready for publication. This
          page deliberately leaves those facts unconfirmed rather than
          presenting invented company information.
        </p>
        <LegalPending>
          This Imprint is not complete for a legal launch. Registered entity,
          address, contact and applicable registration disclosures must be
          supplied and reviewed before it can be finalized. A content-review
          date is not company verification or legal approval.
        </LegalPending>
      </LegalSection>
      <LegalSection title="2. Company and registration details">
        <dl className="rx-legal-dl">
          {[
            ["Brand", COMPANY.brandName],
            ["Website", COMPANY.domain],
            ["Registered legal name", COMPANY.legalName],
            ["Legal form", COMPANY.legalForm],
            ["Registered address", COMPANY.addressLines.join(", ")],
            ["Country of registration", COMPANY.country],
            ["Authorized representative", COMPANY.managingDirector],
            ["Register / registration authority", COMPANY.commercialRegister],
            ["Registration number", COMPANY.registrationNumber],
            ["VAT identification, if applicable", COMPANY.vatId],
            [
              "Editorially responsible person, if required",
              COMPANY.responsiblePerson,
            ],
            ["Public business contact", COMPANY.email],
            ["Privacy contact", COMPANY.privacyEmail],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{displayOrPending(value || "", "Awaiting confirmation")}</dd>
            </div>
          ))}
        </dl>
        <p>
          Whether a register, VAT identification, supervisory authority,
          professional-body disclosure, editorial contact or other
          jurisdiction-specific statement is required depends on the confirmed
          entity, activities and applicable law. An unfilled item is not a
          statement that the requirement does not apply.
        </p>
      </LegalSection>
      <LegalSection title="3. Contact and delivery">
        <p>
          General inquiries can use the available{" "}
          <Link href="/contact">contact form</Link>. Its receiving service must
          be configured before submission can be confirmed. A delivery failure
          is not a received inquiry. Dedicated business, privacy and security
          contacts remain to be confirmed.
        </p>
        <p>
          The form does not substitute for a legally required published business
          address or direct contact detail. Do not send confidential records
          through an unarranged public inquiry channel.
        </p>
      </LegalSection>
      <LegalSection title="4. Legal scope and related notices">
        <p>
          Read the <Link href="/terms">Terms of use</Link> for website and demo
          scope, the <Link href="/privacy">Privacy policy</Link> for data
          handling, <Link href="/cookies">Cookies &amp; storage</Link> for
          browser records, and{" "}
          <Link href="/security">Trust &amp; security</Link> for implementation
          and readiness.
        </p>
        <p>
          Governing law and dispute venue are awaiting confirmation. No
          jurisdiction-specific dispute-resolution membership, regulated-service
          authorization or legal certification is asserted by this draft.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
