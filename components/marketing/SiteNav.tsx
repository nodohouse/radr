"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RadrWordmark } from "./RadrWordmark";

const links = [
  { href: "/#product", id: "product", label: "Product" },
  { href: "/#how", id: "how", label: "How it works" },
  { href: "/#coverage", id: "coverage", label: "Solutions" },
  { href: "/pricing", id: "pricing", label: "Pricing" },
  { href: "/security", id: "company", label: "Company" },
] as const;

type Props = {
  variant?: "home" | "pricing";
};

export function SiteNav({ variant }: Props) {
  const pathname = usePathname();
  const isPricing = variant === "pricing" || pathname === "/pricing";
  const isCompany = pathname === "/security";
  const isMarketingSub = isPricing || isCompany;
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    isMarketingSub ? "light" : "dark",
  );
  const [activeId, setActiveId] = useState(
    isCompany ? "company" : isPricing ? "pricing" : "product",
  );

  useEffect(() => {
    if (isCompany) {
      setTheme("light");
      setActiveId("company");
      return;
    }
    if (isPricing) {
      setTheme("light");
      setActiveId("pricing");
      return;
    }
    const ids = [
      "product",
      "mission",
      "difference",
      "coverage",
      "signals",
      "group",
      "how",
      "system",
      "pricing-teaser",
    ];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));

    const themeIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const dark = e.target.getAttribute("data-nav-theme") === "dark";
          const sectionDark =
            e.target.classList.contains("radr-hero") ||
            e.target.classList.contains("radr-section-dark") ||
            e.target.classList.contains("radr-section-ink") ||
            e.target.classList.contains("radr-mission") ||
            e.target.classList.contains("radr-final");
          setTheme(dark || sectionDark ? "dark" : "light");
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 },
    );

    const activeIo = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        const id = best?.target.id;
        if (!id) return;
        if (
          id === "product" ||
          id === "mission" ||
          id === "difference" ||
          id === "signals"
        ) {
          setActiveId("product");
        } else if (id === "how" || id === "system") {
          setActiveId("how");
        } else if (id === "coverage" || id === "group") {
          setActiveId("coverage");
        } else if (id === "pricing-teaser") {
          setActiveId("pricing");
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.15] },
    );

    document
      .querySelectorAll(
        "[data-nav-theme], .radr-hero, .radr-section-dark, .radr-section-ink, .radr-final, .radr-section, .radr-mission",
      )
      .forEach((n) => themeIo.observe(n));
    nodes.forEach((n) => activeIo.observe(n));
    return () => {
      themeIo.disconnect();
      activeIo.disconnect();
    };
  }, [isCompany, isPricing]);

  return (
    <header className="radr-nav" data-theme={theme}>
      <div className="radr-nav-inner">
        <Link href="/" aria-label="RADR home" className="radr-nav-brand">
          <RadrWordmark size="nav" />
        </Link>
        <nav className="radr-nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="radr-nav-link"
              data-active={activeId === link.id ? "true" : "false"}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="radr-nav-actions">
          <Link href="/login" className="radr-nav-login">
            Sign in
          </Link>
          <Link href="/signup" className="radr-nav-cta">
            See RADR{" "}
            <span className="radr-nav-cta-arrow" aria-hidden="true">
              →
            </span>
            <span className="radr-nav-cta-delta" aria-hidden="true">
              △
            </span>
          </Link>
          <button
            type="button"
            className="radr-nav-menu"
            aria-expanded={open}
            aria-controls="radr-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div
        id="radr-mobile-nav"
        className="radr-nav-drawer"
        data-open={open ? "true" : "false"}
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/login" onClick={() => setOpen(false)}>
          Sign in
        </Link>
        <Link href="/signup" onClick={() => setOpen(false)}>
          See RADR →
        </Link>
      </div>
    </header>
  );
}
