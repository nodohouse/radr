import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

export default function PrivacyPage() {
  return (
    <div>
      <SiteNav />
      <main className="site-wrap py-12 sm:py-16">
        <p className="site-kicker">Legal</p>
        <h1 className="site-editorial mt-3 text-4xl sm:text-5xl">Privacy</h1>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
          Placeholder privacy notice. Not legal advice. Factual and legal details
          marked below are incomplete until counsel and entity details are
          supplied.
        </p>

        <div className="mt-10 max-w-2xl space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">What RADR handles</h2>
            <p className="text-[var(--ink-muted)]">
              RADR processes restaurant business financial documents (for example
              invoices and related files) and basic account data (name, email,
              authentication credentials hashed by the auth provider).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Data minimization</h2>
            <p className="text-[var(--ink-muted)]">
              We collect only what is needed to operate the product. Uploaded
              documents are not sent to analytics tools. Document names and
              contents are not exposed to unnecessary third-party tracking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Storage and access</h2>
            <p className="text-[var(--ink-muted)]">
              Documents are stored in private object storage (or a private local
              store in development). Access requires authentication and
              organization membership checks on the server.
            </p>
          </section>

          <section className="space-y-2 rounded-none border border-dashed border-[var(--warn)] bg-[#fff8f0] p-4">
            <h2 className="text-lg font-semibold text-[var(--warn)]">
              Missing factual / legal items
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
              <li>Legal entity name and registered address — TODO</li>
              <li>Data controller / processor roles — TODO</li>
              <li>Contact email for privacy requests — TODO</li>
              <li>Retention periods by document type — TODO</li>
              <li>Subprocessors list — TODO</li>
              <li>Governing law / dispute venue — TODO</li>
              <li>DPA / GDPR article mapping — TODO</li>
            </ul>
          </section>

          <Link href="/terms" className="prep-btn prep-btn-ghost">
            Terms →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
