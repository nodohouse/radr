"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { RADRLogo } from "@/components/radr/RADRLogo";
import { TextSep } from "@/components/TextSep";
import "@/app/onboarding/onboarding.css";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Mineral light auth shell - canvas + white card + signal green.
 * Login / signup / recovery.
 */
export function LightAuthShell({ title, subtitle, children }: Props) {
  const tNav = useTranslations("navigation");

  return (
    <div className="ob-root ob-auth" data-nav-theme="light">
      <div className="ob-auth-atm" aria-hidden="true">
        <div className="ob-auth-atm-glow" />
        <div className="ob-auth-atm-grid" />
      </div>

      <div className="ob-auth-stage">
        <Link href="/" aria-label={tNav("homeAria")} className="ob-auth-mark">
          <RADRLogo size="md" variant="plain" surface="light" />
        </Link>

        <main className="ob-auth-card">
          <header className="ob-auth-header">
            <p className="ob-auth-kicker">RADR</p>
            <h1 className="ob-auth-title">{title}</h1>
            {subtitle ? <p className="ob-auth-sub">{subtitle}</p> : null}
          </header>
          {children}
        </main>

        <footer className="ob-auth-legal">
          <Link href="/privacy">{tNav("privacy")}</Link>
          <TextSep />
          <Link href="/terms">{tNav("terms")}</Link>
        </footer>
      </div>
    </div>
  );
}
