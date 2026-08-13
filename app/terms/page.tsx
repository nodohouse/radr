import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

export default function TermsPage() {
  return (
    <div>
      <SiteNav />
      <main className="site-wrap py-12 sm:py-16">
        <p className="site-kicker">Legal</p>
        <h1 className="site-editorial mt-3 text-4xl sm:text-5xl">Terms</h1>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
          Placeholder terms page. Not a binding agreement. Legal entity details
          and counsel review are required before this becomes enforceable.
        </p>

        <div className="mt-10 max-w-2xl space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Early access</h2>
            <p className="text-[var(--ink-muted)]">
              RADR is under active development. Creating an account does not
              automatically create a paid subscription. Billing checkout is not
              implemented yet.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Your responsibility</h2>
            <p className="text-[var(--ink-muted)]">
              RADR is designed to help restaurants review documents. Final
              business decisions remain with the restaurant.
            </p>
          </section>

          <section className="space-y-2 rounded-none border border-dashed border-[var(--warn)] bg-[#fff8f0] p-4">
            <h2 className="text-lg font-semibold text-[var(--warn)]">
              Missing factual / legal items
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
              <li>Legal entity name and registered address — TODO</li>
              <li>Governing law / venue — TODO</li>
              <li>Limitation of liability language — TODO</li>
              <li>Acceptable use / prohibited content — TODO</li>
              <li>Service availability commitments — TODO</li>
            </ul>
          </section>

          <Link href="/privacy" className="prep-btn prep-btn-ghost">
            Privacy →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
