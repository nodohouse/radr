import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { COMPANY, contactEmail } from "@/components/marketing/config/company";

export const metadata: Metadata = {
  title: "Contact — Put your operation on RADR",
  description:
    "Want to know what RADR would find in your operation? Tell us about your company and locations.",
};

export default function ContactPage() {
  const inbox = contactEmail();

  return (
    <div className="radr">
      <SiteNav />
      <main>
        <section className="rx-page-hero" data-nav-theme="dark">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">Contact</p>
            <h1 className="rx-page-title">
              Put your operation
              <br />
              on RADR.
            </h1>
            <p className="rx-lead-inv rx-lead-short">
              Want to know what RADR would find in your operation?
            </p>
          </div>
        </section>

        <section className="rx-contact" data-nav-theme="dark">
          <div className="rx-shell rx-contact-inner">
            <ContactForm />
            {inbox ? (
              <p className="rx-contact-alt">
                Prefer email?{" "}
                <a href={`mailto:${inbox}`}>{inbox}</a>
              </p>
            ) : (
              <p className="rx-contact-alt">
                Delivery uses a secure webhook when configured, or your mail
                client once a public {COMPANY.brandName} inbox is published.
                Messages are never silently discarded.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
