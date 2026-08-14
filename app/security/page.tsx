import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { TRUST_CONTROLS } from "@/components/marketing/config/trust";

export const metadata: Metadata = {
  title: "Security — Built for sensitive commercial data",
  description:
    "How RADR handles documents, access, and application security — only controls that actually exist.",
};

const CATEGORIES = [
  "DATA",
  "ACCESS",
  "INFRASTRUCTURE",
  "APPLICATION",
  "DOCUMENTS",
] as const;

export default function SecurityPage() {
  return (
    <div className="radr">
      <SiteNav />
      <main>
        <section className="rx-page-hero" data-nav-theme="dark">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">Security</p>
            <h1 className="rx-page-title">
              Built for sensitive
              <br />
              commercial data.
            </h1>
            <p className="rx-lead-inv rx-lead-short">
              Hospitality margins depend on contracts, invoices, labor and
              revenue data. RADR only claims controls that are actually in
              place.
            </p>
          </div>
        </section>

        <section className="rx-sec" data-nav-theme="dark">
          <div className="rx-shell rx-sec-inner">
            {CATEGORIES.map((cat) => {
              const items = TRUST_CONTROLS.filter((t) => t.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="rx-sec-block">
                  <p className="rx-sec-cat">{cat}</p>
                  <ul className="rx-sec-list">
                    {items.map((t) => (
                      <li key={t.label}>
                        <div className="rx-sec-row">
                          <h2>{t.label}</h2>
                          <em data-status={t.status === "LIVE" ? "on" : "dev"}>
                            {t.status}
                          </em>
                        </div>
                        <p>{t.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="rx-sec-note">
              No SOC 2, ISO, or GDPR certification claims are made here. When
              certifications exist, they will be listed with dates and scope.
            </p>
            <p className="rx-sec-note">
              Questions about data handling?{" "}
              <Link href="/privacy">Privacy Policy</Link>
              {" · "}
              <Link href="/contact">Contact</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
