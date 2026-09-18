"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "./config/company";
import { RadrWordmark } from "./RadrWordmark";
import { SocialIcons } from "./SocialIcons";
import { CATEGORY } from "@/lib/marketing/brand";

/** Quiet global footer — one company, one category. */
export function SiteFooter() {
  const t = useTranslations("navigation");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();

  const PLATFORM = [
    { href: "/product" as const, label: t("product") },
    { href: "/product/decisions" as const, label: "Decisions" },
    { href: "/product/control-center" as const, label: t("controlCenter") },
    { href: "/product/futures" as const, label: "RADR Futures" },
    { href: "/product/actions" as const, label: "Prepared Actions" },
    { href: "/product/value" as const, label: tc("verifiedValue") },
    { href: "/product/memory" as const, label: "Operating Memory" },
  ];

  const INTELLIGENCE = [
    { href: "/solutions" as const, label: t("solutions") },
    { href: "/solutions/buy" as const, label: "BUY" },
    { href: "/solutions/labor" as const, label: "LABOR" },
    { href: "/solutions/sell" as const, label: "SELL" },
    { href: "/solutions/recover" as const, label: "RECOVER" },
    { href: "/industries" as const, label: t("industries") },
  ];

  const COMPANY_LINKS = [
    { href: "/company" as const, label: t("about") },
    { href: "/why" as const, label: t("why") },
    { href: "/blog" as const, label: t("blog") },
    { href: "/contact" as const, label: t("contact") },
    { href: "/developers" as const, label: t("developers") },
  ];

  const TRUST_LEGAL = [
    { href: "/security" as const, label: t("security") },
    { href: "/privacy" as const, label: t("privacy") },
    { href: "/terms" as const, label: t("terms") },
    { href: "/imprint" as const, label: t("imprint") },
  ];

  const COLUMNS = [
    { key: "platform", title: t("footerProduct"), items: PLATFORM },
    { key: "intelligence", title: t("solutions"), items: INTELLIGENCE },
    { key: "company", title: t("footerCompany"), items: COMPANY_LINKS },
    { key: "trust", title: t("footerLegal"), items: TRUST_LEGAL },
  ] as const;

  return (
    <footer className="rx-footer" data-nav-theme="dark">
      <div className="rx-footer-bg" aria-hidden="true">
        <div className="rx-footer-atm" />
      </div>

      <div className="rx-shell rx-footer-content">
        <div className="rx-footer-top">
          <div className="rx-footer-brand">
            <Link href="/" aria-label={t("homeAria")} className="rx-footer-home">
              <RadrWordmark
                size="footer"
                variant="plain"
                surface="dark"
                className="rx-footer-mark"
              />
            </Link>
            <p className="rx-footer-slogan">{tc("slogan")}</p>
            <p className="rx-footer-tag">{CATEGORY.primary}</p>
          </div>

          <div className="rx-footer-cols">
            {COLUMNS.map((col) => (
              <nav
                key={col.key}
                className="rx-footer-col"
                aria-label={col.title}
              >
                <p className="rx-footer-col-title">{col.title}</p>
                <ul>
                  {col.items.map((l) => (
                    <li key={`${col.key}-${l.href}`}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="rx-footer-bottom">
          <div className="rx-footer-bottom-row">
            <SocialIcons withLabels={false} className="rx-footer-socials" />
          </div>
          <div className="rx-footer-meta">
            <p className="rx-footer-copy">{tc("copyright", { year })}</p>
            <p className="rx-footer-domain">{COMPANY.domain}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
