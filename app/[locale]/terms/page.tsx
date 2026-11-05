import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LegalPageShell,
  LegalSection,
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
    title: "Terms of use | RADR",
    description:
      "RADR website terms covering acceptable use, reports, illustrative demos, intellectual property, proposed scopes and customer agreements.",
    alternates: buildAlternatesForLocale(locale, "/terms"),
  };
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalPageShell
      kind="terms"
      kicker="RADR · Trust library"
      title="Terms of use"
      lead="Clear boundaries for website content, demos, developer examples and reports. Paid service terms require a separate agreement."
      notice={
        locale !== "en" ? (
          <p className="rx-legal-pending">
            This document is currently available in English. Reviewed
            translations are not yet published.
          </p>
        ) : undefined
      }
    >
      <LegalSection title="1. Scope and operating entity">
        <p>
          These terms concern use of radrup.com, marketing materials, developer
          documentation, public demos and requested reports. They are not a SaaS
          subscription agreement, service-level agreement or data processing
          agreement. A separately signed customer agreement must define paid
          scope, availability and delivery.
        </p>
        <p>
          RADR is the brand. The legal operating entity, registered details and
          contracting contact remain awaiting confirmation in the{" "}
          <Link href="/imprint">Imprint</Link>. These website terms are a
          working draft awaiting company and legal approval.
        </p>
      </LegalSection>
      <LegalSection title="2. Authorized and acceptable use">
        <p>
          Use the site lawfully and only use an account or workspace you are
          authorized to access. Keep credentials confidential and respect
          organization and location permissions. You must not bypass access
          controls, probe another customer’s records, distribute malicious
          material, impersonate others, interfere with availability, or submit
          content you have no right to disclose.
        </p>
        <p>
          Do not submit real guest, employee, payment-card, identity or health
          information to public demos. Use synthetic data for demonstrations.
          The demo is not a production booking, property management, payment,
          staffing or safety system.
        </p>
      </LegalSection>
      <LegalSection title="3. Content and intellectual property">
        <p>
          RADR branding, approved logos, site design and original content are
          owned by or licensed to their respective rights holders. Access does
          not transfer ownership or grant a right to imply a partnership,
          endorsement or certification.
        </p>
        <p>
          You may read and use the website and legitimately requested reports
          for internal evaluation and business reference, subject to applicable
          law and any license accompanying the material. Do not resell reports,
          remove attribution, publish a misleading version or reuse branding
          commercially without permission. Third-party trademarks and linked
          sources remain their owners’ property.
        </p>
      </LegalSection>
      <LegalSection title="4. Product status and integrations">
        <p>
          Descriptions and interactive screens show a mixture of implemented
          code, synthetic demonstrations and proposed capabilities. A provider
          logo, proposed API, package comparison or governance preview is not a
          promise of live integration, provider authorization or a production
          entitlement.
        </p>
        <p>
          Commercial adapters and autonomous external execution are not
          currently production-ready. Public API, SDK, webhook and MCP examples
          may be proposed interfaces. Check{" "}
          <Link href="/developers">developer documentation</Link> and obtain
          written confirmation of the exact service before relying on it.
        </p>
      </LegalSection>
      <LegalSection title="5. Estimates, recommendations and decisions">
        <p>
          Illustrative money figures, forecasts, scenarios, confidence scores
          and calculator ranges are modeled examples, not customer results or
          guaranteed savings. Expected, observed and verified value represent
          different evidence states. A demo label of verified value refers to
          its illustrative evidence chain, not an independent assurance of real
          economic performance.
        </p>
        <p>
          Outputs may be incomplete, inaccurate or affected by changing
          conditions and source quality. Operators remain responsible for
          decisions, approvals and appropriate human review, especially for
          guest safety, allergies, employment, financial commitments and
          irreversible actions.
        </p>
        <p>
          RADR provides operational decision support, not investment, legal,
          tax, medical or regulated professional advice. No specific recovery,
          revenue increase or commercial result is guaranteed.
        </p>
      </LegalSection>
      <LegalSection title="6. Documents, inputs and confidentiality">
        <p>
          Only upload or submit information you are authorized to use for the
          relevant purpose. You retain applicable rights in your submissions;
          these website terms do not grant RADR an unrestricted license to
          commercialize your confidential information. Any customer-data
          processing rights and confidentiality commitments belong in the
          applicable customer agreement and data processing agreement.
        </p>
        <p>
          Public contact forms and demos should not be used as a channel for
          confidential security evidence, production credentials or highly
          sensitive records. If a secure transfer is needed, first arrange an
          appropriate channel with the team.
        </p>
      </LegalSection>
      <LegalSection title="7. Reports, inquiries and communications">
        <p>
          Requested reports may require business contact details. Optional sales
          follow-up, newsletter updates and optional cookie choices are
          separate. Report access is granted only after the request is
          successfully delivered to the configured receiving service. A delivery
          error is not confirmation that a request was received.
        </p>
        <p>
          Report downloads are for evaluation and reference. Source dates,
          methodology, assumptions and limitations remain relevant; report
          content is not a substitute for reviewing your own operational
          evidence.
        </p>
        <p>
          Cookies and processing are described in the{" "}
          <Link href="/privacy">Privacy policy</Link> and{" "}
          <Link href="/cookies">Cookies &amp; storage</Link>.
        </p>
      </LegalSection>
      <LegalSection title="8. Pricing and customer agreements">
        <p>
          Recovery Pilot, Expand and Enterprise describe proposed engagement
          scopes for discussion. Pricing is by custom quote; no monthly rate is
          published. The website is not an offer to supply every displayed
          capability immediately.
        </p>
        <p>
          A written customer agreement must specify the contracting parties,
          fees, taxes, billing, term, renewal, cancellation, refunds if any,
          support, delivery milestones, security responsibilities, data
          processing and service availability. Those terms are not invented or
          implied by this website.
        </p>
      </LegalSection>
      <LegalSection title="9. Availability, changes and external links">
        <p>
          The site may change, be interrupted or be unavailable during
          maintenance. No website uptime or support-response commitment is made
          here. Existing customer rights under a signed agreement are unaffected
          by website copy changes.
        </p>
        <p>
          Third-party websites, articles, software and provider services have
          their own terms and privacy practices. Linking or showing a logo does
          not establish a commercial relationship. Check the source before
          relying on external information.
        </p>
      </LegalSection>
      <LegalSection title="10. Responsibility and liability">
        <p>
          Information is provided for business evaluation with reasonable care
          but may contain errors. Nothing here excludes liability, consumer
          protections or statutory rights that cannot lawfully be excluded.
        </p>
        <p>
          The allocation of customer-service risk, warranties, indemnities and
          any liability limits must be addressed in a valid applicable
          agreement. This draft does not invent a liability cap or override
          mandatory local protections. Detailed website liability provisions
          remain subject to legal review.
        </p>
      </LegalSection>
      <LegalSection title="11. Law, disputes and updates">
        <p>
          Governing law:{" "}
          {displayOrPending(COMPANY.governingLaw, "awaiting confirmation")}.
          Dispute venue:{" "}
          {displayOrPending(COMPANY.disputeVenue, "awaiting confirmation")}.
        </p>
        <p>
          Mandatory rights and competent authorities depend on the relevant
          jurisdiction. No arbitration agreement, exclusive forum or waiver is
          asserted without confirmed company details and legal review.
        </p>
        <p>
          Material changes will be reflected with an updated content-review
          date. A customer contract can only be changed according to its own
          terms, not merely by changing a website page.
        </p>
      </LegalSection>
      <LegalSection title="12. Contact and related notices">
        <p>
          Questions about website use can be directed through the available{" "}
          <Link href="/contact?intent=legal">contact form</Link>; a dedicated
          legal inbox remains to be published. See the{" "}
          <Link href="/imprint">Imprint</Link>,{" "}
          <Link href="/privacy">Privacy policy</Link> and{" "}
          <Link href="/security">Trust &amp; security</Link> alongside these
          terms.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
