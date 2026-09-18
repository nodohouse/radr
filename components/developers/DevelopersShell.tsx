"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState, type ReactNode } from "react";
import NextLink from "next/link";
import { Link, usePathname } from "@/i18n/navigation";
import { RadrWordmark } from "@/components/radr/RadrWordmark";

export type DevNavSection = {
  titleKey: string;
  items: { href: string; labelKey: string }[];
};

/** Structural nav - labels come from developers.nav */
export const DEV_NAV: DevNavSection[] = [
  {
    titleKey: "getStarted",
    items: [
      { href: "/developers", labelKey: "overview" },
      { href: "/developers/quickstart", labelKey: "quickstart" },
    ],
  },
  {
    titleKey: "platform",
    items: [
      { href: "/developers#integrations", labelKey: "integrations" },
      { href: "/developers/api", labelKey: "api" },
      { href: "/developers/webhooks", labelKey: "webhooks" },
      { href: "/developers/api#data-model", labelKey: "dataModel" },
      { href: "/developers/api#authentication", labelKey: "authentication" },
      { href: "/developers/api#errors", labelKey: "errors" },
    ],
  },
  {
    titleKey: "build",
    items: [
      { href: "/developers/connectors", labelKey: "customConnector" },
      { href: "/developers/connectors#csv", labelKey: "csv" },
      { href: "/developers/connectors#warehouse", labelKey: "warehouse" },
      { href: "/developers/api#examples", labelKey: "examples" },
    ],
  },
  {
    titleKey: "reference",
    items: [
      { href: "/developers#security", labelKey: "security" },
      { href: "/security", labelKey: "trust" },
      { href: "/contact", labelKey: "contact" },
    ],
  },
];

function isActive(
  href: string,
  pathname: string,
  hash: string,
): boolean {
  const cleanHash = hash.replace(/^#/, "");
  const [base = "", itemHash = ""] = href.split("#");

  if (href === "/developers") {
    return pathname === "/developers" && !cleanHash;
  }

  if (href === "/developers#integrations") {
    if (pathname.startsWith("/developers/integrations")) return true;
    return pathname === "/developers" && cleanHash === "integrations";
  }

  if (base === "/developers" && itemHash) {
    return pathname === "/developers" && cleanHash === itemHash;
  }

  if (base.startsWith("/developers/")) {
    const onRoute = pathname === base || pathname.startsWith(`${base}/`);
    if (!onRoute) return false;
    if (itemHash) return cleanHash === itemHash;
    return !cleanHash;
  }

  return false;
}

type Props = {
  children: ReactNode;
  activeHref?: string;
};

export function DevelopersShell({
  children,
  activeHref = "/developers",
}: Props) {
  const t = useTranslations("developers");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const pathname = usePathname() ?? "/developers";
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);

  /** Deep-link: scroll hash targets into view on load and hash changes. */
  useEffect(() => {
    const id = (hash || window.location.hash).replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (typeof el.focus === "function") {
      const prev = el.getAttribute("tabindex");
      if (prev === null) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      if (prev === null) el.removeAttribute("tabindex");
    }
  }, [pathname, hash]);

  const effectiveHash =
    hash ||
    (typeof activeHref === "string" && activeHref.includes("#")
      ? `#${activeHref.split("#")[1]}`
      : "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const brand = (
    <Link
      href="/developers"
      className="rx-dev-lockup"
      onClick={() => setOpen(false)}
    >
      <RadrWordmark
        size="nav"
        variant="plain"
        surface="light"
        compact
        className="rx-dev-lockup-wm"
      />
      <span className="rx-dev-lockup-sep" aria-hidden>
        /
      </span>
      <span className="rx-dev-lockup-label">{t("brandLabel")}</span>
    </Link>
  );

  const navSections = DEV_NAV.map((section) => (
    <div key={section.titleKey} className="rx-dev-side-sec">
      <p className="rx-dev-side-title">{t(`nav.${section.titleKey}`)}</p>
      <ul>
        {section.items.map((item) => {
          const active = isActive(item.href, pathname, effectiveHash);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                data-active={active ? "true" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  setOpen(false);
                  const nextHash = item.href.includes("#")
                    ? `#${item.href.split("#")[1]}`
                    : "";
                  window.setTimeout(() => {
                    setHash(window.location.hash || nextHash);
                  }, 0);
                }}
              >
                {t(`nav.${item.labelKey}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ));

  return (
    <div className="radr rx-dev-root">
      <header className="rx-dev-top">
        <div className="rx-dev-top-inner">
          <div className="rx-dev-top-left">
            <button
              type="button"
              className="rx-dev-menu-btn"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              {tNav("menu")}
            </button>
            {brand}
          </div>
          <nav className="rx-dev-top-right" aria-label="Developer utility">
            <Link href="/">{tCommon("mainSite")}</Link>
            <Link href="/login">{tCommon("signIn")}</Link>
            <NextLink href="/app" className="rx-dev-top-cta">
              {tCommon("seeRadr")} →
            </NextLink>
          </nav>
        </div>
      </header>

      <div className="rx-dev-shell">
        <aside className="rx-dev-side" aria-label="Developer documentation">
          {navSections}
        </aside>

        {open ? (
          <div className="rx-dev-drawer" role="dialog" aria-modal="true">
            <button
              type="button"
              className="rx-dev-drawer-scrim"
              aria-label={tNav("close")}
              onClick={() => setOpen(false)}
            />
            <aside id={panelId} className="rx-dev-drawer-panel">
              <div className="rx-dev-side-brand">{brand}</div>
              {navSections}
            </aside>
          </div>
        ) : null}

        <div className="rx-dev-main">
          <div className="rx-dev-main-inner">{children}</div>
        </div>
      </div>

      <footer className="rx-dev-foot">
        <div className="rx-dev-foot-inner">
          <p className="rx-dev-foot-brand">
            <RadrWordmark
              size="nav"
              variant="plain"
              surface="light"
              compact
              className="rx-dev-lockup-wm"
            />
            <span className="rx-dev-lockup-sep" aria-hidden>
              /
            </span>
            <span className="rx-dev-lockup-label">{t("brandLabel")}</span>
          </p>
          <nav aria-label="Developer footer">
            <Link href="/">{tCommon("mainSite")}</Link>
            <Link href="/security">{tNav("security")}</Link>
            <Link href="/contact">{tNav("contact")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
