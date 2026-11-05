import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LegalPageShell,
  LegalSection,
  LegalPending,
} from "@/components/marketing/LegalPageShell";
import { buildAlternatesForLocale } from "@/i18n/seo";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Trust & security | RADR",
    description:
      "RADR current security controls, identity, private storage, AI boundaries, provider readiness and incident-reporting limitations.",
    alternates: buildAlternatesForLocale(locale, "/security"),
  };
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalPageShell
      kind="security"
      kicker="RADR · Trust library"
      title="Trust & security"
      lead="Trust starts with a clear boundary between implemented controls, synthetic demonstrations and the work needed for production assurance."
      notice={
        locale !== "en" ? (
          <p className="rx-legal-pending">
            This document is currently available in English. Reviewed
            translations are not yet published.
          </p>
        ) : undefined
      }
    >
      <LegalSection title="1. Current posture, clearly labeled">
        <p>
          RADR is the adaptive decision system for hospitality. The public
          product environment uses synthetic data. This page separates controls
          present in the source from production operating commitments that still
          need validation. A control implemented in code is not an independent
          audit or proof of every deployment’s configuration.
        </p>
        <div className="rt-status-grid">
          <div className="rt-status-card">
            <span>Implemented in application code</span>
            <h3>Access and input controls</h3>
            <p>
              Session authentication, organization and location authorization
              checks, request validation and constrained upload paths.
            </p>
          </div>
          <div className="rt-status-card">
            <span>Current public site</span>
            <h3>Essential storage, optional choice</h3>
            <p>
              No installed third-party advertising or analytics trackers.
              Browser storage and individual choices are documented.
            </p>
          </div>
          <div className="rt-status-card" data-state="pending">
            <span>Requires deployment verification</span>
            <h3>Production operational assurance</h3>
            <p>
              Processor contracts, regions, backup and restore evidence,
              retention, incident ownership and monitoring coverage.
            </p>
          </div>
          <div className="rt-status-card" data-state="pending">
            <span>Not claimed</span>
            <h3>Formal certification or guaranteed SLA</h3>
            <p>
              No SOC 2, ISO 27001 certification, independent penetration-test
              attestation or published uptime commitment.
            </p>
          </div>
        </div>
      </LegalSection>
      <LegalSection title="2. Identity and access">
        <ul>
          <li>
            <strong>Authentication:</strong> Better Auth uses the configured
            application database. Passwords are handled by the authentication
            library rather than stored in plaintext by application code.
          </li>
          <li>
            <strong>Password policy:</strong> configured minimum 10 and maximum
            128 characters. This alone is not a claim of complete identity
            security.
          </li>
          <li>
            <strong>Sessions:</strong> configured lifetime up to seven days,
            one-day refresh age and five-minute cookie cache. Production session
            cookies use HttpOnly, Secure and SameSite=Lax settings.
          </li>
          <li>
            <strong>Authorization:</strong> server-side organization membership
            and location checks protect the corresponding APIs. Selecting a
            workspace or possessing an organization cookie is not authorization
            by itself.
          </li>
          <li>
            <strong>Request protection:</strong> trusted-origin settings and
            same-origin checks apply to relevant mutation routes. Authentication
            endpoints have configured request limits.
          </li>
        </ul>
        <p>
          SSO/SAML, enforced MFA, SCIM provisioning and a customer identity
          certification are not claimed as available. Account creation and
          recovery depend on deployment readiness. Password-recovery email
          delivery is not implemented for customer production use and fails
          rather than claiming an email was sent.
        </p>
      </LegalSection>
      <LegalSection title="3. Browser and transport protections">
        <p>
          The hosted preview is served over HTTPS. Application response-header
          configuration includes HSTS on production builds, framing
          restrictions, content-type sniffing protection, a referrer policy and
          a permissions policy that disables browser camera, microphone,
          geolocation and payment access.
        </p>
        <p>
          A Content Security Policy is configured, but currently allows inline
          scripts/styles and script evaluation for the existing application. It
          must not be described as a nonce-based or fully strict CSP. Headers
          and TLS still need to be checked on each customer-facing deployment.
        </p>
        <p>
          Website footage and camera/voice product concepts do not imply that
          the current public website can capture a guest or staff member’s
          camera or microphone.
        </p>
      </LegalSection>
      <LegalSection title="4. Documents, storage and data boundaries">
        <p>
          Document upload routes require authentication and authorization,
          restrict file formats and check configured size/count limits. The
          document path supports PDF, JPEG and PNG, up to 15 MiB per file and
          ten files per request, subject to lower hosting payload limits. The
          onboarding CSV path accepts one UTF-8 contract or invoice file up to 1
          MiB with schema validation.
        </p>
        <p>
          Storage uses the configured private local filesystem or S3-compatible
          driver. Document retrieval follows application access checks and
          private-storage patterns. File validation is not a malware-scanning or
          content-safety certification; no production antivirus pipeline is
          asserted here.
        </p>
        <p>
          Database/provider encryption at rest, key ownership, regional
          restrictions, backup retention and deletion guarantees depend on the
          final production stack. They are not inferred from a logo or an
          S3-compatible API. Confirm the actual provider controls and agreements
          before live customer processing.
        </p>
        <p>
          See{" "}
          <Link href="/developers/api#implemented-uploads">
            developer documentation
          </Link>{" "}
          for current upload contracts and limits.
        </p>
      </LegalSection>
      <LegalSection title="5. Decision governance and AI boundaries">
        <p>
          RADR separates expected, observed and verified value. Synthetic
          examples show the intended evidence trail; real Verified Value needs
          supporting downstream evidence. A confidence score is a modeled
          assessment, not a security certification.
        </p>
        <p>
          Commercial connectors and autonomous external writes are not
          production-ready. Public API, SDK, webhook and MCP examples are
          proposed unless explicitly labeled implemented. The current demo does
          not change a live POS, PMS or booking system.
        </p>
        <p>
          Ask RADR can use demo/tool analysis and an optional server-configured
          OpenAI-compatible model endpoint. A configured model path can transmit
          prompt content to that endpoint for intent classification or tool
          selection. Provider terms, retention, training settings, data
          categories and international transfers need review before confidential
          or personal customer content is used.
        </p>
        <p>
          The intended governance model uses policy, confidence and action risk
          to decide when a human must review. Production execution would require
          approved permissions, explicit action boundaries, auditability and an
          operational override. These are readiness requirements, not a claim
          that autonomous execution is enabled.
        </p>
      </LegalSection>
      <LegalSection title="6. Providers and data processing readiness">
        <dl className="rx-legal-dl">
          <div>
            <dt>Application hosting</dt>
            <dd>
              This preview is hosted on Vercel. Production regions, contractual
              role and deployment configuration require confirmation.
            </dd>
          </div>
          <div>
            <dt>Authentication</dt>
            <dd>
              Better Auth is application software connected to the configured
              database, not a separately contracted hosted identity service in
              this implementation.
            </dd>
          </div>
          <div>
            <dt>Database &amp; files</dt>
            <dd>
              Configured application database and private local/S3-compatible
              storage. Final production providers, locations, retention and key
              management are not published as confirmed.
            </dd>
          </div>
          <div>
            <dt>Contact &amp; report delivery</dt>
            <dd>
              A configured webhook or delivery recipient is required. Forms
              report unavailable or failed delivery; they must not silently
              claim a successful lead submission.
            </dd>
          </div>
          <div>
            <dt>Optional model provider</dt>
            <dd>
              Server-configured OpenAI-compatible endpoint, only if enabled.
              Provider agreement and processing settings must be assessed for
              the actual deployment.
            </dd>
          </div>
        </dl>
        <LegalPending>
          A production subprocessor schedule, data processing agreement,
          applicable transfer safeguards and reviewed retention/offboarding
          terms are still required before live customer deployment. This is a
          readiness summary, not a finalized subprocessor register.
        </LegalPending>
      </LegalSection>
      <LegalSection title="7. Monitoring, resilience and incident readiness">
        <p>
          Application code includes error handling and request-throttling
          controls. The current custom rate limiter is process-local; it is not
          a durable, globally coordinated abuse-prevention service. Production
          scaling needs an appropriate shared limiter and monitoring design.
        </p>
        <p>
          We do not publish an unverified backup frequency, recovery point
          objective, recovery time objective, 24/7 security coverage or
          guaranteed incident response time. Named incident ownership,
          escalation channels, customer notification duties, restore testing and
          monitoring evidence must be agreed and operationally verified.
        </p>
        <p>
          Where a personal-data incident occurs, the responsible organization
          and RADR’s contractual role determine the legal assessment and
          notification obligations. A website statement does not replace those
          procedures or a processor agreement.
        </p>
      </LegalSection>
      <LegalSection title="8. Report a security concern">
        <p>
          Use the available{" "}
          <Link href="/contact?intent=security">security inquiry route</Link> to
          request a secure reporting channel. A dedicated security inbox and
          monitored vulnerability-disclosure process have not been confirmed. An
          unsuccessful form submission is not a received report; no
          response-time promise is made here.
        </p>
        <p>
          Initially include a concise description, affected public URL and
          non-sensitive reproduction steps. Do not submit credentials, exploit
          payloads, guest records or sensitive evidence through a public form.
          Arrange a secure channel before sharing confidential details.
        </p>
        <p>
          Only test systems you are authorized to test. This page does not grant
          penetration-testing permission or establish a bug-bounty, reward or
          legal safe-harbor program.
        </p>
      </LegalSection>
      <LegalSection title="9. Your deployment review">
        <p>
          Before using real customer data, review the operating entity,
          processor agreement, deployment regions, identity controls, data
          scope, provider permissions, recovery and incident procedures,
          retention and deletion, and the specific features being enabled.
          Record the evidence for that deployment rather than relying on demo
          behavior.
        </p>
        <p>
          For a technical review, start with{" "}
          <Link href="/developers">developer documentation</Link>, the{" "}
          <Link href="/developers#integrations">
            integration availability catalog
          </Link>{" "}
          and the <Link href="/privacy">Privacy policy</Link>. Contracts and
          verified operational evidence determine any commitments beyond the
          implementation described here.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
