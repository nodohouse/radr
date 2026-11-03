"use client";

import {
  CookiePreferences,
  CookieSettingsButton,
} from "@/components/privacy/CookiePreferences";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { TextSep } from "@/components/TextSep";
import { entryFont } from "@/components/onboarding/entryFont";
import "@/app/onboarding/onboarding.css";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Mineral light auth shell — atmospheric canvas + white card + signal green.
 * Login / signup / recovery.
 */
export function LightAuthShell({ title, subtitle, children }: Props) {
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
            <h2>{t("entryHeadline")}</h2>
            <p>{t("entryLead")}</p>
            <div className="ob-entry-graphic" aria-hidden="true">
              <div className="ob-entry-orbit">
                <FrozenRadrLogo
                  variant="mark"
                  theme="dark"
                  width={52}
                  decorative
                />
              </div>
              <span className="ob-entry-signal">
                <i />
                {t("entryEvidence")}
              </span>
              <div className="ob-entry-decision">
                <small>RADR</small>
                <strong>{t("entryDecision")}</strong>
                <svg viewBox="0 0 240 66" fill="none">
                  <path
                    d="M0 55C30 55 27 40 50 42S85 56 110 29 150 41 170 18 209 24 240 4"
                    stroke="#8ff2c4"
                    strokeWidth="2"
                  />
                  <path d="M0 58H240" stroke="#c5e7ed" strokeOpacity=".25" />
                </svg>
                <span>
                  {t("entryProof")}
                  <i />
                </span>
              </div>
            </div>
            <p className="ob-entry-trust">{t("entryTrust")}</p>
          </section>
          <div className="ob-auth-card">
            <header className="ob-auth-header">
              <p className="ob-auth-kicker">RADR</p>
              <h1 className="ob-auth-title">{title}</h1>
              {subtitle ? <p className="ob-auth-sub">{subtitle}</p> : null}
            </header>
            {children}
            <nav className="ob-auth-paths" aria-label={t("entryPaths")}>
              <Link href="/signup?intent=workspace">
                {t("entrySetup")}
                <span aria-hidden="true">→</span>
              </Link>
              <NextLink href="/app/enter">
                {t("entryPreview")}
                <span aria-hidden="true">→</span>
              </NextLink>
            </nav>
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
