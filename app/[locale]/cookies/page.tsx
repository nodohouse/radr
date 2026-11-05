import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/LegalPageShell";
import { CookieSettingsButton } from "@/components/privacy/CookiePreferences";
import { CookieInventory } from "@/components/privacy/CookieInventory";
import { buildAlternatesForLocale } from "@/i18n/seo";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Cookies & storage | RADR",
    description:
      "RADR cookie and browser storage inventory, providers, purposes, lifetimes, consent controls and withdrawal instructions.",
    alternates: buildAlternatesForLocale(locale, "/cookies"),
  };
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LegalPageShell
      kind="cookies"
      kicker="RADR · Trust library"
      title="Cookies & storage"
      lead="The names, purposes and lifetimes behind your settings. Optional tracking stays off unless you make a valid choice."
      notice={
        locale !== "en" ? (
          <p className="rx-legal-pending">
            This document is currently available in English. Reviewed
            translations are not yet published.
          </p>
        ) : undefined
      }
    >
      <LegalSection title="1. Your choice comes first">
        <p>
          Optional analytics and marketing choices start off. Reject optional,
          accept optional, or save individual choices in Cookie settings.
          Essential sign-in, language and requested-download storage is separate
          from optional tracking.
        </p>
        <CookieSettingsButton />
        <p>
          The current public site installs no third-party analytics or
          advertising trackers. Accepting optional categories does not add one.
          Category descriptions are not a blanket permission to introduce new
          vendors, purposes or tracking later.
        </p>
      </LegalSection>
      <LegalSection title="2. Cookies and other storage">
        <p>
          Cookies are small values sent with requests to their scoped website
          paths. Local storage stays in your browser and is not automatically
          attached to every request. Session storage belongs to a browser-tab
          session. All three can be relevant to privacy even though only one is
          technically a cookie.
        </p>
        <p>
          HttpOnly cookies cannot be read by normal page JavaScript. Secure
          cookies are sent over HTTPS; SameSite settings help limit cross-site
          requests. These attributes reduce specific risks but are not proof of
          complete security. Clearing browser storage does not erase account or
          lead records held by a server.
        </p>
      </LegalSection>
      <LegalSection title="3. Current storage inventory">
        <CookieInventory />
        <p>
          Authentication cookies may have a <code>__Secure-</code> prefix on
          production HTTPS deployments. Authentication-library flow cookies can
          vary with the enabled flow. Infrastructure, Vercel deployment
          protection or browser tooling may add their own security storage;
          those are not optional RADR advertising cookies. Production
          deployment-specific additions still need review.
        </p>
      </LegalSection>
      <LegalSection title="4. Categories and third parties">
        <dl className="rx-legal-dl">
          <div>
            <dt>Essential / requested features</dt>
            <dd>
              Authentication, server-validated workspace selection, locale
              routing and report access. Set where needed for the feature you
              request, independently of optional tracking consent.
            </dd>
          </div>
          <div>
            <dt>Functional preferences</dt>
            <dd>
              Local product choices such as a requested saved layout, favorites
              or dismissed guidance. Used by the feature you interact with, not
              for cross-site advertising.
            </dd>
          </div>
          <div>
            <dt>Analytics</dt>
            <dd>
              No third-party analytics provider or analytics cookie currently
              installed. The calculator can emit local analytics events only
              when the saved analytics choice permits it; no external collector
              is installed by that choice.
            </dd>
          </div>
          <div>
            <dt>Marketing</dt>
            <dd>
              No advertising pixel, advertising cookie or third-party marketing
              tracker currently installed. This preference is separate from
              email updates or a request for sales contact.
            </dd>
          </div>
        </dl>
        <p>
          If non-essential functionality or a third-party service is added, its
          purpose, provider, storage and duration must be disclosed and the
          required consent collected before it runs.
        </p>
      </LegalSection>
      <LegalSection title="5. Saving, changing and withdrawing">
        <p>
          Your choice is stored on this browser under{" "}
          <code>radr.cookie-preferences.v1</code>. It is valid for 180 days. The
          preference record can remain locally after validity ends until
          overwritten or cleared; the application treats an expired, invalid or
          missing record as no optional consent and asks again.
        </p>
        <p>
          Reopen Cookie settings in the footer or sign-in page, turn a category
          off and save, or choose Reject optional. A new saved choice takes
          effect for future optional events on this browser. It does not reverse
          previous lawful processing. Browser profiles and other devices have
          independent records.
        </p>
        <p>
          Closing the panel without saving is remembered for this tab. This
          dismissal never grants optional consent. It keeps the previous saved
          choice, or essential-only operation if there is none. A browser
          storage failure leaves optional tracking off and displays an error. No
          successful save is reported when the browser refuses it.
        </p>
      </LegalSection>
      <LegalSection title="6. Browser controls and limitations">
        <p>
          You can delete cookies, local storage and session storage in your
          browser’s site-data settings for this domain, block storage, or use a
          private browsing session. Clearing site data may sign you out, reset
          the language or remove locally saved demo layouts and preferences. It
          does not submit a server-side deletion request.
        </p>
        <p>
          The current website does not advertise an automatic Global Privacy
          Control or Do Not Track integration. Use the explicit cookie choices
          here for RADR preferences. No third-party advertising tracker is
          currently present. If a future deployment introduces regulated
          advertising or sharing, applicable opt-out signals need appropriate
          implementation before that activity starts.
        </p>
      </LegalSection>
      <LegalSection title="7. Review and contact">
        <p>
          This inventory was checked against application code on 5 November
          2026. It documents configured lifetimes rather than guaranteeing that
          every cookie is set in every deployment. The operating entity and
          dedicated privacy contact remain awaiting confirmation.
        </p>
        <p>
          Read the <Link href="/privacy">Privacy policy</Link> for processing
          purposes, retention and rights, or use the available{" "}
          <Link href="/contact?intent=privacy">contact route</Link>. A form
          reports whether delivery is available and successful.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
