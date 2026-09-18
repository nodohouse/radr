"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

/**
 * Locale-scoped error UI — keep calm, no redesign.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main className="rx-404" data-nav-theme="light">
        <div className="rx-shell rx-404-inner">
          <p className="rx-kicker">Error</p>
          <h1 className="rx-404-title">Something interrupted this page.</h1>
          <p className="rx-404-lead">
            Retry, return home, or contact us if it keeps happening.
          </p>
          <div className="rx-ch-ctas" style={{ justifyContent: "center" }}>
            <button type="button" className="rx-btn rx-btn-primary" onClick={reset}>
              Retry <span aria-hidden="true">→</span>
            </button>
            <Link href="/" className="rx-btn rx-btn-ghost">
              Go home
            </Link>
            <Link href="/contact" className="rx-btn rx-btn-ghost">
              Contact
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
