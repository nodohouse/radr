"use client";

import type { ReactNode } from "react";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";

type Props = {
  /** @deprecated Photos removed — SaaS radiant only */
  photoSrc?: string;
  children: ReactNode;
  className?: string;
};

/** Shared page hero: green→blue silk + content. No lifestyle photography. */
export function CinematicHeroShell({
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`rx30-hero rx30-hero--cine ${className}`.trim()}
      data-nav-theme="light"
      style={{ minHeight: "72vh" }}
    >
      <div className="rx30-hero-bg" aria-hidden="true">
        <SilkAtmosphere />
      </div>
      <div
        className="rx30-shell"
        style={{ position: "relative", zIndex: 2, padding: "4.5rem 0 3.5rem" }}
      >
        {children}
      </div>
    </section>
  );
}
