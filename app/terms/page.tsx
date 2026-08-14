import type { Metadata } from "next";
import Link from "next/link";
import {
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

export const metadata: Metadata = {
  title: "Terms of Use — RADR",
  description:
    "Website terms of use for radrup.com — illustrative demos, IP, liability limits, and contact.",
};

export default function TermsPage() {
  const showDevWarn =
    process.env.NODE_ENV === "development" && !isLegalEntityComplete();

  return (
    <LegalPageShell
      kicker="Legal / Terms"
      title="Terms of Use"
      lead="These are website-level terms for visiting radrup.com and related marketing pages. They are not a customer SaaS subscription agreement. Entity-specific clauses require counsel confirmation."
      updated={COMPANY.termsUpdated || undefined}
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
          The site provides information about {COMPANY.brandName} — continuous
          margin intelligence — and may link to product sign-in or signup flows.
          Hospitality is the first market where we demonstrate the product.
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
          Detailed limitation-of-liability language — pending counsel review.
        </LegalPending>
      </LegalSection>

      <LegalSection title="8. Governing law">
        <p>
          Governing law: {displayOrPending(COMPANY.governingLaw)}.
          <br />
          Dispute venue: {displayOrPending(COMPANY.disputeVenue)}.
        </p>
        <LegalPending>
          Governing law and venue — pending company / counsel confirmation.
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
