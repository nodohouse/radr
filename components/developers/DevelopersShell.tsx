"use client";

import { entryFont } from "@/components/onboarding/entryFont";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import "./developers-premium.css";
import { CTAS } from "@/lib/marketing/brand";

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
      { href: "/developers/mcp", labelKey: "mcp" },
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

function isActive(href: string, pathname: string, hash: string): boolean {
  const cleanHash = hash.replace(/^#/, "");
  const namedSection = DEV_NAV.some((section) =>
    section.items.some((item) => item.href === `${pathname}#${cleanHash}`),
  );
  const [base = "", itemHash = ""] = href.split("#");

  if (href === "/developers") {
    return pathname === "/developers" && (!cleanHash || !namedSection);
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
    return !cleanHash || !namedSection;
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
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contents, setContents] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    const headings = [...(contentRef.current?.querySelectorAll("h2") || [])];
    setContents(
      headings.map((node, i) => {
        if (!node.id)
          node.id = `section-${i + 1}-${node.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`;
        return { id: node.id, title: node.textContent || "" };
      }),
    );
  }, [pathname, children]);

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
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const opener = menuRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab") return;
      const nodes = [
        ...(drawerRef.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled)",
        ) || []),
      ].filter((n) => n.getClientRects().length && n.tabIndex >= 0);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  const brand = (
    <Link
      href="/developers"
      className="rx-dev-lockup"
      onClick={() => setOpen(false)}
    >
      <FrozenRadrLogo variant="mark" width={32} />
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
    <div className={`radr rx-dev-root ${entryFont.variable}`}>
      <header className="rx-dev-top" inert={open}>
        <div className="rx-dev-top-inner">
          <div className="rx-dev-top-left">
            <button
              type="button"
              className="rx-dev-menu-btn"
              ref={menuRef}
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
            <Link href={CTAS.seeInActionHref} className="rx-dev-top-cta">
              {tCommon("seeRadr")} →
            </Link>
          </nav>
        </div>
      </header>

      <div className="rx-dev-shell">
        <aside
          className="rx-dev-side"
          aria-label="Developer documentation"
          inert={open}
        >
          {navSections}
        </aside>

        {open ? (
          <div
            className="rx-dev-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Developer documentation navigation"
            ref={drawerRef}
          >
            <button
              type="button"
              className="rx-dev-drawer-scrim"
              tabIndex={-1}
              aria-label={tNav("close")}
              onClick={() => setOpen(false)}
            />
            <aside id={panelId} className="rx-dev-drawer-panel">
              <div className="rx-dev-drawer-head">
                {brand}
                <button
                  ref={closeRef}
                  className="rx-dev-drawer-close"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  {tNav("close")}
                </button>
              </div>
              {navSections}
            </aside>
          </div>
        ) : null}

        <main className="rx-dev-main" inert={open}>
          <div className="rx-dev-main-inner">
            <div className="rx-dev-availability">
              <span>Developer preview</span>
              <p>
                Files work in an authenticated workspace. The reference adapter
                runs locally. Public API, SDK, webhook delivery and MCP examples
                are proposed interfaces.
              </p>
              <Link href="/developers/quickstart">Start with what works →</Link>
            </div>
            <nav className="rx-dev-toc" aria-label="On this page">
              <span>On this page</span>
              {contents.map((item) => (
                <a href={`#${item.id}`} key={item.id}>
                  {item.title}
                </a>
              ))}
            </nav>
            <div ref={contentRef}>{children}</div>
          </div>
        </main>
      </div>

      <footer className="rx-dev-foot" inert={open}>
        <div className="rx-dev-foot-inner">
          <p className="rx-dev-foot-brand">
            <FrozenRadrLogo variant="mark" theme="dark" width={30} priority />
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
