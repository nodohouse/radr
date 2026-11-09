"use client";

import {
  CookiePreferences,
  CookieSettingsButton,
} from "@/components/privacy/CookiePreferences";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { TextSep } from "@/components/TextSep";
import { entryFont } from "@/components/onboarding/entryFont";
import { AuthEntryShowcase } from "@/components/AuthEntryShowcase";
import "@/app/onboarding/onboarding.css";
import "@/app/onboarding/entry-preview.css";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showPaths?: boolean;
};

/**
 * Mineral light auth shell — atmospheric canvas + white card + signal green.
 * Login / signup / recovery.
 */
export function LightAuthShell({
  title,
  subtitle,
  children,
  showPaths = true,
}: Props) {
  const tNav = useTranslations("navigation");
  const t = useTranslations("auth");

  return (
    <div
      className={`${entryFont.variable} ob-root ob-auth`}
      data-nav-theme="light"
    >
      <CookiePreferences />
      <div className="ob-auth-atm" aria-hidden="true">
        <div className="ob-auth-atm-glow ob-auth-atm-glow--a" />
        <div className="ob-auth-atm-glow ob-auth-atm-glow--b" />
        <div className="ob-auth-atm-veil" />
        <div className="ob-auth-atm-grid" />
        <div className="ob-auth-atm-delta" />
      </div>

      <div className="ob-auth-stage">
        <header className="ob-auth-brand">
          <Link href="/" aria-label={tNav("homeAria")} className="ob-auth-mark">
            <FrozenRadrLogo variant="mark" width={48} priority />
          </Link>
          <p className="ob-auth-brand-line">Verified Decision Intelligence</p>
        </header>

        <main className="ob-auth-layout">
          <section className="ob-entry-story" aria-label={t("entryEyebrow")}>
            <span className="ob-entry-eyebrow">{t("entryEyebrow")}</span>
            <h2>
              {t("entryHeadline")}
              <em>{t("entryHeadlineAccent")}</em>
            </h2>
            <p>{t("entryLead")}</p>
            <AuthEntryShowcase />
            <p className="ob-entry-trust">{t("entryTrust")}</p>
          </section>
          <div className="ob-auth-card">
            <header className="ob-auth-header">
              <p className="ob-auth-kicker">RADR</p>
              <h1 className="ob-auth-title">{title}</h1>
              {subtitle ? <p className="ob-auth-sub">{subtitle}</p> : null}
            </header>
            {children}
            {showPaths ? (
              <nav className="ob-auth-paths" aria-label={t("entryPaths")}>
                <Link href="/signup?intent=workspace">
                  {t("entrySetup")}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/demo">
                  {t("entryPreview")}
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
            ) : null}
          </div>
        </main>

        <footer className="ob-auth-legal">
          <CookieSettingsButton />
          <TextSep />
          <Link href="/privacy">{tNav("privacy")}</Link>
          <TextSep />
          <Link href="/terms">{tNav("terms")}</Link>
        </footer>
      </div>
    </div>
  );
}
