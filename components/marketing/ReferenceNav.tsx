"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Glyph } from "./MockupVisuals";
import "./reference-hero.css";
import "./reference-nav.css";
import "./premium-interactions.css";

const links = [
  { href: "/how", label: "Platform" },
  { href: "/solutions", label: "Solutions" },
  { href: "/value-calculator", label: "Value Calculator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/company", label: "Company" },
];

const menus = {
  Platform: {
    title: "One connected operating picture.",
    description: "From scattered signals to decisions your team can act on.",
    href: "/how",
    label: "Explore the platform",
    items: [
      [
        "Data foundation",
        "Connect your hospitality systems",
        "/how#foundation",
        "data",
      ],
      [
        "Operating state",
        "See what is happening across locations",
        "/how#operating-state",
        "chart",
      ],
      [
        "Intelligence",
        "Understand what matters and why",
        "/how#intelligence",
        "spark",
      ],
      [
        "Decisions & value",
        "Act with evidence. Verify the result.",
        "/how#decisions",
        "check",
      ],
    ],
  },
  Solutions: {
    title: "A clearer path forward.",
    description:
      "Explore the decisions that move your hospitality operation forward.",
    href: "/solutions",
    label: "Explore all solutions",
    items: [
      ["Labor", "Align staffing with real demand", "/solutions#labor", "labor"],
      [
        "Pricing & yield",
        "Understand revenue opportunities",
        "/solutions#pricing-yield",
        "chart",
      ],
      [
        "Guest experience",
        "Connect guest signals to operations",
        "/solutions#guest-experience",
        "heart",
      ],
      [
        "Procurement",
        "Put supplier costs in context",
        "/solutions#procurement",
        "box",
      ],
      [
        "Reconciliation",
        "Review discrepancies and credits",
        "/solutions#reconciliation",
        "document",
      ],
      [
        "Operations",
        "Bring the whole picture together",
        "/solutions#operations",
        "gear",
      ],
    ],
  },
  Company: {
    title: "More intelligent. More human.",
    description: "Technology that helps people create better hospitality.",
    href: "/company",
    label: "Meet RADR",
    items: [
      ["Our mission", "Why we are building RADR", "/company#mission", "spark"],
      [
        "Our approach",
        "Better data. Clearer decisions.",
        "/company#approach",
        "data",
      ],
      ["Our values", "What guides our work", "/company#values", "heart"],
      ["Contact", "Let’s talk about your operation", "/contact", "labor"],
    ],
  },
};
type MenuName = keyof typeof menus;

export function ReferenceNav() {
  const pathname = usePathname();
  const light = pathname === "/value-calculator";
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<MenuName | "mobile" | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPending = () => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
  };
  const close = () => {
    cancelPending();
    setOpen(null);
  };
  const hoverMenu = (name: MenuName) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    cancelPending();
    pending.current = setTimeout(() => {
      setOpen(name);
      pending.current = null;
    }, 90);
  };
  useEffect(() => {
    const resize = () => {
      if (pending.current) clearTimeout(pending.current);
      pending.current = null;
      setOpen(null);
    };
    const outside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) resize();
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      if (pending.current) clearTimeout(pending.current);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, []);
  const menuLinks = (name: MenuName) =>
    menus[name].items.map(([title, detail, href, icon]) => (
      <Link href={href} key={href} onClick={close} className="rn-item">
        <span className="rn-icon">
          <Glyph name={icon} />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </span>
        <span className="rn-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    ));
  return (
    <header
      ref={header}
      className="rh-header rn-header"
      data-tone={light ? "light" : "dark"}
      onPointerEnter={cancelPending}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelPending();
        pending.current = setTimeout(() => {
          if (!header.current?.querySelector(":focus-visible")) setOpen(null);
          pending.current = null;
        }, 200);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          header.current
            ?.querySelector<HTMLButtonElement>(`button[aria-expanded="true"]`)
            ?.focus();
          close();
        }
      }}
    >
      <Link
        href="/en"
        aria-label="RADR home"
        className="rh-brand"
        onClick={close}
      >
        <Image
          src={
            light
              ? "/brand/radr-wordmark-clean-monochrome-black.svg"
              : "/brand/radr-wordmark-clean-white.svg"
          }
          alt="RADR"
          width={145}
          height={33}
          priority
        />
      </Link>
      <nav aria-label="Primary navigation">
        {links.map((link) =>
          link.label in menus ? (
            <button
              key={link.href}
              type="button"
              className="rn-trigger"
              data-active={pathname === link.href}
              aria-expanded={open === link.label}
              aria-controls="rn-dropdown"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse")
                  hoverMenu(link.label as MenuName);
              }}
              onClick={() => {
                cancelPending();
                setOpen(open === link.label ? null : (link.label as MenuName));
              }}
            >
              {link.label}
              <span aria-hidden="true" className="rn-chevron">
                ⌄
              </span>
            </button>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={close}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") close();
              }}
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>
      <div className="rh-header-actions">
        <button
          className="rn-mobile-toggle"
          type="button"
          aria-expanded={open === "mobile"}
          aria-controls="rn-dropdown"
          onClick={() => setOpen(open === "mobile" ? null : "mobile")}
        >
          {open === "mobile" ? "Close" : "Menu"}
          <span aria-hidden="true">{open === "mobile" ? "−" : "+"}</span>
        </button>
        <span className="rh-language" aria-label="Language: English">
          EN
        </span>
        <Link className="rh-signin" href="/login" onClick={close}>
          Sign in
        </Link>
        <Link className="rh-button rh-nav-demo" href="/contact" onClick={close}>
          Book a demo <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        id="rn-dropdown"
        className="rn-dropdown"
        hidden={!open}
        onPointerEnter={cancelPending}
      >
        {open && open !== "mobile" && (
          <>
            <div className="rn-feature">
              <span className="rn-eyebrow">
                DISCOVER RADR / {open.toUpperCase()}
              </span>
              <h2>{menus[open].title}</h2>
              <p>{menus[open].description}</p>
              <Link href={menus[open].href} onClick={close}>
                {menus[open].label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="rn-items">{menuLinks(open)}</div>
            <div className="rn-bottom">
              <Link href="/value-calculator" onClick={close}>
                Estimate your opportunity <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact" onClick={close}>
                See RADR in action <span aria-hidden="true">→</span>
              </Link>
            </div>
          </>
        )}
        {open === "mobile" && (
          <div className="rn-mobile-content">
            {(Object.keys(menus) as MenuName[]).map((name) => (
              <details key={name}>
                <summary>
                  {name}
                  <span aria-hidden="true">+</span>
                </summary>
                <Link
                  className="rn-mobile-overview"
                  href={menus[name].href}
                  onClick={close}
                >
                  {menus[name].label} →
                </Link>
                {menuLinks(name)}
              </details>
            ))}
            <Link href="/value-calculator" onClick={close}>
              Value Calculator <span aria-hidden="true">→</span>
            </Link>
            <Link href="/pricing" onClick={close}>
              Pricing <span aria-hidden="true">→</span>
            </Link>
            <Link href="/login" onClick={close}>
              Sign in <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
