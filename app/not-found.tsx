import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { DeltaGlyph } from "@/components/marketing/primitives/DeltaGlyph";

export const metadata: Metadata = {
  title: "Signal lost",
  description: "This page is off the RADR.",
};

export default function NotFound() {
  return (
    <div className="radr">
      <SiteNav />
      <main className="rx-404" data-nav-theme="dark">
        <div className="rx-shell rx-404-inner">
          <p className="rx-kicker">404</p>
          <div className="rx-404-glyph" aria-hidden="true">
            <DeltaGlyph size={88} living active />
          </div>
          <h1 className="rx-404-title">Signal lost.</h1>
          <p className="rx-404-lead">This page is off the RADR.</p>
          <Link href="/" className="rx-btn rx-btn-primary">
            Return home <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
