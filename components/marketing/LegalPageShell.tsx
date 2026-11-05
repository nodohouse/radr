import { Children, isValidElement, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { PRIVACY_REVIEW_DATE } from "@/lib/privacy/disclosures";
import "@/app/trust-legal.css";

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  updated?: string;
  draftLabel?: string;
  notice?: ReactNode;
  children: ReactNode;
  kind?: "security" | "privacy" | "terms" | "imprint" | "cookies";
};
export function legalSectionId(title: string) {
  return (
    "section-" +
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}
const PAGES = [
  { href: "/security", name: "Trust & security", kind: "security" },
  { href: "/privacy", name: "Privacy", kind: "privacy" },
  { href: "/cookies", name: "Cookies & storage", kind: "cookies" },
  { href: "/terms", name: "Terms", kind: "terms" },
  { href: "/imprint", name: "Imprint", kind: "imprint" },
] as const;
/** Shared server-rendered trust library. Content review is distinct from legal sign-off. */
export function LegalPageShell({
  kicker,
  title,
  lead,
  updated,
  notice,
  children,
  kind,
}: Props) {
  const sections = Children.toArray(children)
    .filter(isValidElement<{ title?: string }>)
    .map((child) => child.props.title)
    .filter((title): title is string => typeof title === "string");
  return (
    <div className="radr radr-legal">
      <SiteNav />
      <main className="rx-legal" data-nav-theme="light">
        <header className="rt-hero">
          <div className="rx-shell">
            <p className="rt-eyebrow">{kicker}</p>
            <h1>{title}</h1>
            {lead ? <p className="rt-lead">{lead}</p> : null}
            <div className="rt-review">
              <span>Content reviewed · {PRIVACY_REVIEW_DATE}</span>
              <span>
                {kind === "security"
                  ? "Current controls & readiness"
                  : "Company details & legal approval pending"}
              </span>
            </div>
            {updated ? <p>{updated}</p> : null}
            {notice}
          </div>
        </header>
        <nav
          className="rt-page-nav rx-shell"
          aria-label="Trust and legal library"
        >
          {PAGES.map((page) => (
            <Link
              key={page.kind}
              href={page.href}
              aria-current={kind === page.kind ? "page" : undefined}
            >
              {page.name}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
        <div className="rx-shell rt-layout">
          <aside className="rt-toc">
            <p>On this page</p>
            <nav aria-label="On this page">
              {sections.map((title) => (
                <a key={title} href={`#${legalSectionId(title)}`}>
                  {title.replace(/^\d+[A-Za-z]?\.\s*/, "")}
                </a>
              ))}
            </nav>
            <div className="rt-help">
              <strong>Need a closer look?</strong>
              <p>
                Ask about data handling, current controls or your organization’s
                requirements.
              </p>
              <Link href="/contact?intent=security">Contact RADR →</Link>
            </div>
          </aside>
          <article className="rx-legal-body">
            {children}
            <div className="rt-document-end">
              <strong>One connected trust library.</strong>
              <p>
                Read the related notices alongside this page. A website
                description does not replace an agreed customer contract or data
                processing agreement.
              </p>
              <Link href="/security">Trust & security →</Link>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={legalSectionId(title)} className="rx-legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function LegalPending({ children }: { children: ReactNode }) {
  return (
    <aside className="rx-legal-pending" role="note">
      {children}
    </aside>
  );
}
export function LegalConvenienceNotice({
  message,
  linkLabel,
  href,
}: {
  message: string;
  linkLabel: string;
  href: "/privacy" | "/terms" | "/imprint";
}) {
  return (
    <aside className="rx-legal-pending" role="note">
      <p>
        <strong>{message}</strong>
      </p>
      <p>
        <Link href={href} locale="en">
          {linkLabel}
        </Link>
      </p>
    </aside>
  );
}
