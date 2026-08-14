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
  title: "Imprint — Legal Notice | RADR",
  description:
    "Legal notice / imprint for RADR (radrup.com). Entity details published once confirmed.",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rx-imprint-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ImprintPage() {
  const complete = isLegalEntityComplete();
  const showDevWarn = process.env.NODE_ENV === "development" && !complete;

  return (
    <LegalPageShell
      kicker="Legal / Imprint"
      title="Imprint"
      lead="Legal notice for radrup.com. Required company details are published here only when confirmed — nothing below is invented."
      updated={COMPANY.imprintUpdated || undefined}
    >
      {showDevWarn ? (
        <LegalPending>
          <strong>Development notice:</strong> fill{" "}
          <code>components/marketing/config/company.ts</code> before treating
          this page as launch-ready.
        </LegalPending>
      ) : null}

      {!complete ? (
        <LegalPending>
          Legal entity information is not yet published. Placeholder labels
          below will be replaced with confirmed company details — they are not
          fabricated values.
        </LegalPending>
      ) : null}

      <LegalSection title="Company information">
        <dl className="rx-legal-dl">
          <Row
            label="Legal company name"
            value={displayOrPending(COMPANY.legalName)}
          />
          <Row
            label="Legal form"
            value={displayOrPending(COMPANY.legalForm)}
          />
          <Row
            label="Registered address"
            value={
              hasValue(COMPANY.addressLines)
                ? COMPANY.addressLines.join(", ")
                : "To be published"
            }
          />
          <Row label="Country" value={displayOrPending(COMPANY.country)} />
          <Row
            label="Managing director(s)"
            value={displayOrPending(COMPANY.managingDirector)}
          />
          <Row
            label="Commercial register"
            value={displayOrPending(COMPANY.commercialRegister)}
          />
          <Row
            label="Registration number"
            value={displayOrPending(COMPANY.registrationNumber)}
          />
          <Row label="VAT ID" value={displayOrPending(COMPANY.vatId)} />
          <Row
            label="Responsible person"
            value={displayOrPending(COMPANY.responsiblePerson)}
          />
          <Row
            label="Contact email"
            value={displayOrPending(COMPANY.email)}
          />
          <Row label="Website" value={COMPANY.domain} />
        </dl>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For general inquiries use{" "}
          <Link href="/contact">Contact</Link>
          {hasValue(COMPANY.email) ? (
            <>
              {" "}
              or{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </>
          ) : null}
          .
        </p>
      </LegalSection>

      <LegalSection title="Related">
        <p>
          <Link href="/privacy">Privacy Policy</Link> ·{" "}
          <Link href="/terms">Terms of Use</Link> ·{" "}
          <Link href="/security">Security</Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
