import Link from "next/link";
import { COMPANY, contactEmail } from "./config/company";

/** Public identity is sourced only from confirmed company configuration. */
export function LegalIdentity() {
  const email = contactEmail();
  return (
    <div className="mx-legal-identity">
      <strong>{COMPANY.legalName || COMPANY.brandName}</strong>
      {!COMPANY.legalName && <p>Legal entity details to be confirmed.</p>}
      <dl>
        <div>
          <dt>Registered office</dt>
          <dd>
            {COMPANY.addressLines.length
              ? COMPANY.addressLines.join(", ")
              : "To be added"}
          </dd>
        </div>
        <div>
          <dt>Company registration</dt>
          <dd>
            {[COMPANY.commercialRegister, COMPANY.registrationNumber]
              .filter(Boolean)
              .join(" · ") || "To be added"}
          </dd>
        </div>
        <div>
          <dt>VAT / Tax information</dt>
          <dd>{COMPANY.vatId || "To be added"}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            {email ? (
              <a href={`mailto:${email}`}>{email}</a>
            ) : (
              <>
                Contact details to be confirmed.{" "}
                <Link href="/contact">Contact RADR →</Link>
              </>
            )}
          </dd>
        </div>
        {COMPANY.managingDirector && (
          <div>
            <dt>Legal representative</dt>
            <dd>{COMPANY.managingDirector}</dd>
          </div>
        )}
        {COMPANY.country && (
          <div>
            <dt>Registration jurisdiction</dt>
            <dd>{COMPANY.country}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
