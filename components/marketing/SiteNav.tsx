"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RadrWordmark } from "./RadrWordmark";

const links = [
  { href: "/#product", id: "product", label: "Product", match: "/" },
  { href: "/how", id: "how", label: "How it works", match: "/how" },
  { href: "/solutions", id: "solutions", label: "Solutions", match: "/solutions" },
  { href: "/pricing", id: "pricing", label: "Pricing", match: "/pricing" },
  { href: "/company", id: "company", label: "Company", match: "/company" },
] as const;

type Props = { variant?: "home" | "pricing" };

export function SiteNav({ variant }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("product");

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(window.scrollY > 16);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/how")) {
      setActiveId("how");
      return;
    }
    if (pathname.startsWith("/solutions")) {
      setActiveId("solutions");
      return;
    }
    if (pathname.startsWith("/company") || pathname.startsWith("/security") || pathname.startsWith("/contact")) {
      setActiveId("company");
      return;
    }
    if (variant === "pricing" || pathname === "/pricing") {
      setActiveId("pricing");
      return;
    }

    if (!isHome) {
      setActiveId("product");
      return;
    }

    const ids = [
      "product",
      "difference",
      "coverage",
      "how",
      "group",
      "system",
      "pricing-teaser",
    ];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));

    const activeIo = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        const id = best?.target.id;
        if (!id) return;
        if (id === "product" || id === "difference") setActiveId("product");
        else if (id === "how") setActiveId("how");
        else if (id === "coverage" || id === "group" || id === "system") {
          setActiveId("solutions");
        } else if (id === "pricing-teaser") setActiveId("pricing");
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.12] },
    );

    nodes.forEach((n) => activeIo.observe(n));
    return () => activeIo.disconnect();
  }, [pathname, variant, isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="rx-nav"
      data-theme="dark"
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div className="rx-nav-bar">
        <Link href="/" className="rx-nav-brand" aria-label="RADR home">
          <RadrWordmark size="nav" />
        </Link>
        <nav className="rx-nav-center" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rx-nav-link"
              data-active={activeId === l.id ? "true" : "false"}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="rx-nav-right">
          <Link href="/login" className="rx-nav-signin">
            Sign in
          </Link>
          <Link href="/signup" className="rx-nav-cta">
            See RADR <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="rx-nav-menu"
            aria-expanded={open}
            aria-controls="rx-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div
        id="rx-drawer"
        className="rx-nav-drawer"
        hidden={!open}
        data-open={open ? "true" : "false"}
      >
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
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
