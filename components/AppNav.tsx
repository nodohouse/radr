"use client";

/**
 * @deprecated Dual-app chrome. Product users land on ProductShell (`/app`).
 * Legacy `(app)` routes redirect; do not remount this nav for product work.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RadrLogo } from "@/components/marketing/RadrLogo";

const links = [
  { href: "/app", label: "CONTROL", match: "/app" },
  { href: "/app/findings", label: "CASES", match: "/app/findings" },
  { href: "/app/value", label: "MONEY", match: "/app/value" },
  { href: "/app/controls", label: "CONTROLS", match: "/app/controls" },
  { href: "/app/data", label: "SOURCES", match: "/app/data" },
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
          <Link href="/app" aria-label="RADR home">
            <RadrLogo size="lg" variant="luminous" />
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Adaptive operational decision system for hospitality.
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
          <Link href="/app/data" className="hover:text-[var(--ink)]">
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
