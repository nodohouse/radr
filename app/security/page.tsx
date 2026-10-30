import type { Metadata } from "next";
import Link from "next/link";
import {
  PageShell,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingShell";
import { TRUST_CONTROLS } from "@/components/marketing/config/trust";
export const metadata: Metadata = {
  title: "Security. Built for sensitive commercial data",
  description:
    "How RADR handles documents, access and application security. Honest controls and availability.",
};
export default function SecurityPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="SECURITY"
        title={
          <>
            Built for sensitive
            <br />
            commercial data.
          </>
        }
        description="Contracts, invoices and operating data deserve clear boundaries. Here is what exists today, and what is still being built."
        compact
      />
      <section className="rp-section rp-ivory">
        <div className="rp-container">
          <SectionHeading
            kicker="CONTROLS, WITH CONTEXT"
            title="Trust starts with specifics."
          />
          <div className="rp-trust-grid">
            {TRUST_CONTROLS.map((control) => (
              <article key={control.label}>
                <span
                  className={`rp-status ${control.status !== "LIVE" ? "rp-status-muted" : ""}`}
                >
                  {control.status === "LIVE"
                    ? "Available now"
                    : "In development"}
                </span>
                <h3>{control.label}</h3>
                <p>{control.detail}</p>
              </article>
            ))}
          </div>
          <p className="rp-security-note">
            No SOC 2, ISO, or GDPR certification claims are made here. When
            certifications exist, they will be listed with dates and scope.
          </p>
          <p className="rp-security-note">
            Questions about data handling?{" "}
            <Link href="/privacy">Read the Privacy Policy</Link> or{" "}
            <Link href="/contact">contact us</Link>.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
