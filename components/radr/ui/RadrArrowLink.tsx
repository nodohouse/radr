import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Marketing text→arrow drilldown. Shared by /en and /app.
 */
export function RadrArrowLink({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`radr-arrow-link ${className}`.trim()}
      onClick={onClick}
    >
      {children}
      <span aria-hidden="true"> →</span>
    </Link>
  );
}
