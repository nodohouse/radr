import Link from "next/link";
import type { ReactNode } from "react";
import { ReferenceNav } from "./ReferenceNav";
import "./marketing-pages.css";
import { MockupFooter as MarketingFooter } from "./MockupFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="rp-site">
      <div className="rp-nav-wrap">
        <ReferenceNav />
      </div>
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  image = "architecture",
  compact = false,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
  image?: "architecture" | "pavilion";
  compact?: boolean;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section
      className={`rp-hero ${compact ? "rp-hero-compact" : ""}`}
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(3,26,29,.96),rgba(3,26,29,.65) 48%,rgba(3,26,29,.15)),url('/images/radr-coastal-${image}.webp')`,
      }}
    >
      <div
        className={`rp-container rp-hero-grid ${children ? "" : "rp-hero-single"}`}
      >
        <div>
          <p className="rp-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="rp-lead">{description}</p>
          <div className="rp-hero-links">
            <Link
              className="rh-button"
              href={
                primaryHref ?? (eyebrow === "PRICING" ? "#plans" : "/contact")
              }
            >
              {primaryLabel ??
                (eyebrow === "PRICING" ? "Explore the plans" : "Book a demo")}
              <Arrow />
            </Link>
            <Link
              className="rp-text-link"
              href={
                secondaryHref ??
                (eyebrow === "PLATFORM" ? "#workflow" : "/#product")
              }
            >
              {secondaryLabel ??
                (eyebrow === "PLATFORM"
                  ? "See how it works"
                  : "See RADR in action")}
              <Arrow />
            </Link>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
export function Arrow() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="rp-section-heading">
      <p className="rp-kicker">{kicker}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function MarketingCTA({
  title = "A clearer picture starts here.",
  description = "A focused walkthrough, tailored to your operation, your systems and your next decisions.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rp-cta">
      <div className="rp-container">
        <p className="rp-kicker">NOTHING OFF THE RADR.</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href="/contact" className="rh-button">
          Book a demo
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
export { MockupFooter as MarketingFooter } from "./MockupFooter";
