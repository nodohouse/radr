"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RadrLogo } from "@/components/marketing/RadrLogo";

const links = [
  { href: "/home", label: "CONTROL", match: "/home" },
  { href: "/cases", label: "CASES", match: "/cases" },
  { href: "/money", label: "MONEY", match: "/money" },
  { href: "/controls", label: "CONTROLS", match: "/controls" },
  { href: "/sources", label: "SOURCES", match: "/sources" },
] as const;

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="prep-nav-desktop">
        <div>
          <Link href="/home" aria-label="RADR home">
            <RadrLogo size="lg" />
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Continuous margin intelligence.
          </p>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Product">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="prep-nav-link"
              data-active={isActive(pathname, link.match)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 text-sm text-[var(--ink-muted)]">
          <Link href="/documents" className="hover:text-[var(--ink)]">
            Evidence
          </Link>
        </div>
      </aside>

      <nav className="prep-nav-mobile" aria-label="Product">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="prep-nav-link"
            data-active={isActive(pathname, link.match)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
