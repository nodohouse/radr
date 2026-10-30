import type { ReactNode } from "react";

/**
 * Shared marketing / product eyebrow — IBM Plex Mono · uppercase · tracked.
 */
export function RadrEyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`radr-eyebrow ${className}`.trim()} data-eyebrow="true">
      {children}
    </p>
  );
}
