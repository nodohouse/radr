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
  hasValue,
} from "@/components/marketing/config/company";
import { CookieSettingsButton } from "@/components/privacy/CookiePreferences";
import { buildAlternatesForLocale } from "@/i18n/seo";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy policy | RADR",
    description:
      "RADR privacy notice covering accounts, inquiries, documents, AI processing, recipients, storage, rights and current readiness.",
    alternates: buildAlternatesForLocale(locale, "/privacy"),
  };
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalPageShell
      kind="privacy"
      kicker="RADR · Trust library"
      title="Privacy policy"
      lead="A clear account of what RADR handles, why it is used, what choices you have and what still needs confirmation."
      notice={
        locale !== "en" ? (
          <p className="rx-legal-pending">
            This document is currently available in English. Reviewed
            translations are not yet published.
          </p>
        ) : undefined
      }
    >
      <LegalSection title="1. Who is responsible">
        <p>
          This notice covers radrup.com, its marketing pages, report requests
          and the RADR product where enabled. RADR is the brand; the operating
          legal entity and its registered details are awaiting confirmation.
        </p>
        <LegalPending>
          Company identity, registered address and a dedicated privacy inbox
          have not been confirmed. This notice is a substantive working draft
          and is not presented as a finalized legal notice.
        </LegalPending>
        <dl className="rx-legal-dl">
          <div>
            <dt>Operating entity</dt>
            <dd>
              {displayOrPending(COMPANY.legalName, "Awaiting confirmation")}
            </dd>
          </div>
          <div>
            <dt>Registered address</dt>
            <dd>
              {hasValue(COMPANY.addressLines)
                ? COMPANY.addressLines.join(", ")
                : "Awaiting confirmation"}
            </dd>
          </div>
          <div>
            <dt>Privacy contact</dt>
            <dd>
              {COMPANY.privacyEmail ||
                COMPANY.email ||
                "Dedicated inbox awaiting confirmation"}
            </dd>
          </div>
        </dl>
        <p>
          For an available inquiry route, see{" "}
          <Link href="/contact?intent=privacy">Contact</Link>. The form confirms
          delivery only when its receiving service is configured and accepts the
          request. Do not rely on an unsuccessful submission as a delivered
          request.
        </p>
      </LegalSection>
      <LegalSection title="2. Website visitors and product customers">
        <p>
          For website inquiries, account administration and RADR’s own service
          security, the operating entity determines how information is used. For
          personal data an organization supplies to an enabled customer
          workspace, RADR may act as a processor under that organization’s
          instructions and an agreed data processing agreement. The customer
          remains responsible for its own guest and staff privacy notices,
          lawful collection and access permissions.
        </p>
        <p>
          The public product demo uses synthetic operational data. A demo’s
          guest names, room states, reservations and economic examples are not
          evidence of real customer processing or live integrations.
        </p>
      </LegalSection>
      <LegalSection title="3. What information is processed">
        <ul>
          <li>
            <strong>Inquiries:</strong> business contact details, organization,
            role, location count, interests and the message you choose to
            submit.
          </li>
          <li>
            <strong>Report requests:</strong> name, work email, company, role,
            location count, optional sales follow-up and optional updates
            choices.
          </li>
          <li>
            <strong>Accounts and organizations:</strong> account name, email,
            authentication records, organization membership, role and onboarding
            information where account services are enabled.
          </li>
          <li>
            <strong>Documents and imports:</strong> files and their metadata,
            and contract or invoice CSV records you upload. Documents can
            contain supplier, employee or other third-party details.
          </li>
          <li>
            <strong>Operational context:</strong> authorized workspace records,
            evidence, decisions, notes and outcomes where the relevant product
            feature is enabled. Commercial provider adapters are not currently
            production-ready.
          </li>
          <li>
            <strong>Technical information:</strong> request metadata,
            device/browser information, timestamps, error and security logs
            processed by the application or hosting infrastructure.
          </li>
          <li>
            <strong>Browser storage:</strong> consent choices, language,
            authentication and requested product preferences. See the{" "}
            <Link href="/cookies">storage inventory</Link>.
          </li>
        </ul>
        <p>
          Do not put payment-card numbers, identity documents, medical histories
          or other sensitive personal information into demo prompts, notes or
          uploads. Allergy information can reveal health data; any future real
          guest-data use needs an appropriate legal basis, access rules and
          safeguards before activation.
        </p>
      </LegalSection>
      <LegalSection title="4. Purposes and legal bases">
        <p>
          Where the GDPR or similar rules apply, a lawful basis must fit the
          actual processing. The intended purposes and bases are:
        </p>
        <ul>
          <li>
            <strong>
              Responding to an inquiry or delivering a requested report:
            </strong>{" "}
            steps requested before a contract, performance of an applicable
            contract, or a legitimate interest in responding to business
            contacts, depending on the relationship.
          </li>
          <li>
            <strong>Operating an enabled account or workspace:</strong> contract
            performance with the customer; for individual business users,
            legitimate interests in administering authorized access or the
            customer’s instructions where RADR is a processor.
          </li>
          <li>
            <strong>
              Service security, abuse prevention and troubleshooting:
            </strong>{" "}
            legitimate interests in protecting systems and users, with
            applicable legal obligations where relevant.
          </li>
          <li>
            <strong>Optional newsletter or promotional updates:</strong> consent
            where required, collected separately from report delivery or sales
            contact.
          </li>
          <li>
            <strong>Optional non-essential tracking:</strong> consent before
            activation where required. No third-party analytics or advertising
            tracker is currently installed.
          </li>
          <li>
            <strong>Legal requests, accounting and dispute handling:</strong>{" "}
            applicable legal obligations or legitimate interests, as relevant to
            the record.
          </li>
        </ul>
        <p>
          These bases are a proposed mapping for legal review, not a claim that
          every activity is active. Consent can be withdrawn without affecting
          processing that was lawful before withdrawal.
        </p>
      </LegalSection>
      <LegalSection title="5. Contact, report and marketing choices">
        <p>
          The current demo introduction is a visual form preview. Its name,
          email, company, role and location-count fields stay on that page;
          they are not saved or transmitted to RADR or a CRM. Only the selected
          fictional hotel or restaurant is sent to open the demo. A signed,
          HTTP-only cookie grants eight hours of fictional demo access. This
          does not create an account or grant access to a real workspace.
        </p>
        <p>
          Report access requires delivery of the request to the configured
          lead-handling service. If delivery is unavailable or fails, the form
          reports the failure and does not unlock a download. A successful
          request creates a signed download cookie lasting 30 minutes; the
          cookie contains the report identifier and expiry, not your contact
          details.
        </p>
        <p>
          A sales follow-up and article/newsletter updates are separate,
          optional choices. Neither is required to receive the playbook. Email
          marketing preferences are separate from cookie preferences. Cookie
          settings do not unsubscribe you from email; a marketing email must
          provide an unsubscribe method when that service is enabled.
        </p>
        <p>
          We do not describe a form as delivered, an email as subscribed, or a
          preference as saved if that operation failed.
        </p>
      </LegalSection>
      <LegalSection title="6. Cookies and browser storage">
        <p>
          Optional analytics and marketing choices default to off. Accept,
          reject and individual preferences are available in Cookie settings.
          You can withdraw optional choices at any time, on this device and
          browser.
        </p>
        <CookieSettingsButton />
        <p>
          The consent record is stored in local storage, not an authentication
          cookie. Its choice is valid for 180 days; the underlying record may
          remain until overwritten or cleared. Rejection does not disable
          essential authentication, language routing or a download you
          requested.
        </p>
        <p>
          The website does not currently load third-party analytics, advertising
          pixels or advertising cookies. Accepting optional categories does not
          install a tracker. A future materially different tracking setup needs
          updated disclosures and a new appropriate choice before it is enabled.
        </p>
        <p>
          See <Link href="/cookies">Cookies &amp; storage</Link> for names,
          providers, purposes, lifetimes and browser controls.
        </p>
      </LegalSection>
      <LegalSection title="7. Recipients, hosting and integrations">
        <p>
          Information may be handled by the authorized customer organization,
          RADR personnel who need it for the service, configured infrastructure
          providers, a configured inquiry/report delivery recipient, or
          authorities where legally required. Providers must be assessed for the
          actual service and contractual role before real customer deployment.
        </p>
        <p>
          This preview is hosted on Vercel. Better Auth is authentication
          software used by the application, not a separate hosted identity
          provider in this implementation. Account data uses the configured
          database. Uploaded files use a private local filesystem or an
          S3-compatible driver, depending on deployment configuration.
        </p>
        <p>
          A complete production subprocessor list, processing locations and
          contractual safeguards remain to be confirmed. A provider logo in the
          integration catalog does not mean RADR has an active connection or
          sends it your information.
        </p>
        <p>
          See the{" "}
          <Link href="/security#section-6-providers-and-data-processing-readiness">
            provider readiness summary
          </Link>
          . We do not sell personal information or operate a third-party
          advertising tracking integration on the current website. Production
          contractual commitments require an agreed data processing agreement.
        </p>
      </LegalSection>
      <LegalSection title="8. AI and model-assisted features">
        <p>
          Ask RADR has a demo/tool-analysis path and an optional
          server-configured OpenAI-compatible language-model path. If that path
          is enabled, prompt and conversational content supplied to it can be
          transmitted to the configured model endpoint for intent classification
          and tool selection. It is not automatically active because you visit
          the website.
        </p>
        <p>
          Do not assume a no-training commitment, zero-retention setting,
          regional processing guarantee or particular AI processor agreement
          without confirmation for the enabled deployment. Those terms, data
          categories and safeguards must be reviewed before confidential or
          personal customer data is used with a model provider.
        </p>
        <p>
          Website demos do not perform autonomous writes to commercial systems.
          Model-assisted recommendations and forecasts require human assessment;
          this notice does not assert that a production high-impact automated
          decision process is enabled.
        </p>
      </LegalSection>
      <LegalSection title="9. Retention and deletion">
        <p>
          Records should be kept only for their purpose, contractual obligations
          and applicable legal requirements. Final production schedules are not
          yet approved; we do not publish invented deletion deadlines.
        </p>
        <ul>
          <li>
            <strong>Inquiries and leads:</strong> reviewed while handling the
            request and any agreed follow-up. An approved retention limit and
            receiving-provider deletion process are still required.
          </li>
          <li>
            <strong>Accounts, workspace records and uploaded documents:</strong>{" "}
            subject to the customer agreement and instructions; offboarding,
            deletion and backup-expiry terms need confirmation before live
            customer onboarding.
          </li>
          <li>
            <strong>Technical and security logs:</strong> retention depends on
            the application and infrastructure configuration. An approved
            log-retention schedule is pending.
          </li>
          <li>
            <strong>Browser records:</strong> specific validity and lifetimes
            are listed in <Link href="/cookies">the inventory</Link>. Clearing
            your browser does not delete server-held account or lead records.
          </li>
        </ul>
        <p>
          Legal holds and mandatory record-keeping may limit deletion where
          applicable. Backup deletion timing, export formats and offboarding
          assistance must be specified in the relevant agreement.
        </p>
      </LegalSection>
      <LegalSection title="10. Security and international transfers">
        <p>
          Application code implements authentication, organization and location
          checks, upload validation, private file access patterns and browser
          security headers. These controls reduce risk; they do not constitute a
          certification or a guarantee that no incident can occur. Read{" "}
          <Link href="/security">Trust &amp; security</Link> for current
          controls and known readiness gaps.
        </p>
        <p>
          Do not assume EU-only, US-only or other fixed data residency.
          Production regions, international transfers, applicable adequacy
          decisions or contractual transfer mechanisms, and any required
          transfer assessments must be confirmed for the actual processor chain
          before regulated live use.
        </p>
      </LegalSection>
      <LegalSection title="11. Your rights and requests">
        <p>
          Depending on applicable law, you may request access, correction,
          deletion, restriction, portability or objection to certain processing;
          withdraw consent; and complain to the competent supervisory authority.
          Under the GDPR, applicable requests generally require a response
          within one month, subject to lawful extensions and exceptions. Other
          jurisdictions have their own rules.
        </p>
        <p>
          Where applicable law provides these rights, you may also object to
          direct marketing, request human review of a solely automated decision
          with legal or similarly significant effects, or use an authorized
          agent. The public synthetic demo is not a live automated decision
          process about guests or staff.
        </p>
        <p>
          Applicable US state privacy laws may provide rights to know the
          categories of information processed, correct or delete information,
          obtain a copy, opt out of targeted advertising or a legally defined
          sale or sharing, and appeal a denied request. Exercising applicable
          privacy rights must not result in unlawful discrimination. The current
          website has no third-party advertising tracker; it does not claim an
          automatic Global Privacy Control integration. Your jurisdiction and
          RADR’s actual processing determine which additional requirements
          apply.
        </p>
        <p>
          For customer-controlled guest or staff data, contact the hospitality
          organization first. RADR should assist that organization under its
          processing agreement rather than disclose another organization’s
          records directly.
        </p>
        <p>
          Use the published privacy contact once confirmed, or the available{" "}
          <Link href="/contact?intent=privacy">contact form</Link>. Specify your
          request and relationship to RADR without sending unnecessary sensitive
          information. We may need proportionate identity or authority
          verification before disclosing or changing records. A failed or
          unavailable contact form does not constitute receipt.
        </p>
      </LegalSection>
      <LegalSection title="12. Children, required information and changes">
        <p>
          RADR is a business service for authorized professional users, not a
          service directed at children. Account and inquiry fields marked
          required are needed for the relevant request; optional fields and
          optional consent remain separate. Without necessary information, the
          requested feature may not proceed.
        </p>
        <p>
          Material changes to processing should be reflected here before the
          changed activity is introduced. The content-review date records this
          implementation review, not company verification or legal sign-off. An
          approved legal notice and reviewed translations remain pending.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
