import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { RadrLogo } from "@/components/marketing/RadrLogo";

export default function NotFound() {
  return (
    <div className="radr">
      <SiteNav variant="pricing" />
      <main className="radr-section">
        <div className="radr-shell">
          <p className="radr-kicker">404</p>
          <RadrLogo size="md" as="p" />
          <h1 className="radr-h2" style={{ marginTop: "1rem" }}>
            Off the RADR.
          </h1>
          <p className="radr-lead">That page isn&apos;t here. The rest of RADR still is.</p>
          <div className="radr-ctas">
            <Link href="/" className="radr-btn radr-btn-primary">
              Back home <span aria-hidden="true">→</span>
            </Link>
            <Link href="/pricing" className="radr-btn radr-btn-ghost-dark">
              Pricing
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
