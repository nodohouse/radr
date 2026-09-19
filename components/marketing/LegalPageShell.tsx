import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  updated?: string;
  draftLabel?: string;
  notice?: ReactNode;
  children: ReactNode;
};

/** Shared chrome for Privacy / Terms / Imprint: readable, fast, on-brand. */
export function LegalPageShell({
  kicker,
  title,
  lead,
  updated,
  draftLabel,
  notice,
  children,
}: Props) {
  return (
    <div className="radr">
      <SiteNav />
      <main className="rx-legal" data-nav-theme="light">
        <div className="rx-shell rx-legal-inner">
          <header className="rx-legal-header">
            <p className="rx-kicker">{kicker}</p>
            <h1 className="rx-legal-title">{title}</h1>
            {lead ? <p className="rx-legal-lead">{lead}</p> : null}
            {notice}
            {updated ? (
              <p className="rx-legal-updated">{updated}</p>
            ) : (
              <p className="rx-legal-updated">
                {draftLabel ??
                  "Draft for review. Not yet finalized by counsel."}
              </p>
            )}
          </header>
          <div className="rx-legal-body">{children}</div>
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
    <section className="rx-legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function LegalPending({ children }: { children: ReactNode }) {
  return <aside className="rx-legal-pending">{children}</aside>;
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
