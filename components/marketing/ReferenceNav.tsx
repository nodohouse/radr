"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import "./reference-hero.css";

const links = [
  { href: "/how", label: "Platform" },
  { href: "/solutions", label: "Solutions" },
  { href: "/value-calculator", label: "Value Calculator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/company", label: "Company" },
];

export function ReferenceNav() {
  const pathname = usePathname();
  const light = pathname === "/value-calculator";
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <header className="rh-header" data-tone={light ? "light" : "dark"}>
      <Link href="/en" aria-label="RADR home" className="rh-brand">
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
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="rh-header-actions">
        <details className="rh-mobile-menu" ref={menu}>
          <summary>Menu</summary>
          <div className="rh-mobile-links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={closeMenu}>
              Sign in
            </Link>
          </div>
        </details>
        <span className="rh-language" aria-label="Language: English">
          EN
        </span>
        <Link className="rh-signin" href="/login">
          Sign in
        </Link>
        <Link className="rh-button rh-nav-demo" href="/contact">
          Book a demo <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
