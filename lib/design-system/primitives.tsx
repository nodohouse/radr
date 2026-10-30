/**
 * Shared brand primitives — enforce /en → /app inheritance.
 * Prefer these over ad-hoc type/color choices on new surfaces.
 */

import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";

type Tone = "default" | "muted" | "inverse" | "brand" | "warning" | "critical" | "verified";

const toneColor: Record<Tone, string> = {
  default: "var(--color-text)",
  muted: "var(--color-text-secondary)",
  inverse: "var(--color-text-inverse)",
  brand: "var(--color-brand-deep)",
  warning: "var(--semantic-warning)",
  critical: "var(--semantic-negative)",
  verified: "var(--semantic-verified)",
};

export function RadrDisplay({
  children,
  className = "",
  as: Tag = "h1",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p";
  style?: CSSProperties;
}) {
  return (
    <Tag
      className={`radr-display ${className}`.trim()}
      style={{
        margin: 0,
        fontFamily: "var(--font-brand)",
        fontSize: "var(--fs-display)",
        fontWeight: 600,
        lineHeight: "var(--lh-display)",
        letterSpacing: "var(--tracking-display, -0.04em)",
        color: "var(--color-text)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function RadrHeading({
  children,
  className = "",
  level = 2,
}: {
  children: ReactNode;
  className?: string;
  level?: 2 | 3 | 4;
}) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag
      className={`radr-heading ${className}`.trim()}
      style={{
        margin: 0,
        fontFamily: "var(--font-brand)",
        fontSize: "var(--fs-section)",
        fontWeight: 550,
        lineHeight: "var(--lh-section)",
        letterSpacing: "var(--tracking-tight, -0.03em)",
        color: "var(--color-text)",
      }}
    >
      {children}
    </Tag>
  );
}

export function RadrBody({
  children,
  className = "",
  muted = false,
  ...rest
}: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return (
    <p
      className={`radr-body ${className}`.trim()}
      style={{
        margin: 0,
        fontFamily: "var(--font-ui)",
        fontSize: "var(--fs-body)",
        fontWeight: 400,
        lineHeight: "var(--lh-body)",
        color: muted ? "var(--color-text-secondary)" : "var(--color-text)",
      }}
      {...rest}
    >
      {children}
    </p>
  );
}

export function RadrMetric({
  children,
  className = "",
  tone = "default",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const sizes = {
    sm: "var(--fs-body-sm)",
    md: "var(--fs-key-value)",
    lg: "var(--fs-hero-metric)",
    hero: "var(--fs-display)",
  };
  return (
    <span
      className={`radr-metric ${className}`.trim()}
      data-num="true"
      style={{
        fontFamily: "var(--font-number)",
        fontSize: sizes[size],
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        lineHeight: "var(--lh-metric)",
        color: toneColor[tone],
      }}
    >
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "secondary" | "tertiary" | "destructive";

export function RadrButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const styles: Record<BtnVariant, CSSProperties> = {
    primary: {
      background: "var(--color-text)",
      color: "var(--color-text-inverse)",
      border: "0",
    },
    secondary: {
      background: "transparent",
      color: "var(--color-text)",
      border: "1px solid var(--color-border-strong)",
    },
    tertiary: {
      background: "transparent",
      color: "var(--color-text)",
      border: "0",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
    },
    destructive: {
      background: "var(--semantic-negative)",
      color: "#fff",
      border: "0",
    },
  };
  return (
    <button
      type="button"
      className={`radr-btn radr-btn-${variant} ${className}`.trim()}
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.875rem",
        fontWeight: 550,
        letterSpacing: "-0.01em",
        borderRadius: "var(--radius-pill)",
        padding: "0.7rem 1.35rem",
        cursor: "pointer",
        ...styles[variant],
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function RadrDivider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`radr-divider ${className}`.trim()}
      style={{
        border: 0,
        borderTop: "1px solid var(--color-hairline)",
        margin: "1.25rem 0",
      }}
    />
  );
}

export function RadrSurface({
  children,
  className = "",
  raised = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { raised?: boolean }) {
  return (
    <div
      className={`radr-surface ${className}`.trim()}
      style={{
        background: raised
          ? "var(--color-surface)"
          : "color-mix(in srgb, #f7faf8 70%, transparent)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid transparent",
        padding: "var(--space-5)",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function RadrStatus({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
}) {
  return (
    <span
      className={`radr-status ${className}`.trim()}
      data-status
      style={{
        fontFamily: "var(--type-mono)",
        fontSize: "var(--fs-status)",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: toneColor[tone],
      }}
    >
      {children}
    </span>
  );
}

export function RadrLink({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`radr-link ${className}`.trim()}
      style={{
        color: "var(--color-text)",
        fontWeight: 550,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        textDecorationColor: "rgba(10,13,11,0.28)",
      }}
    >
      {children}
    </a>
  );
}

export function RadrTooltip({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <span title={label} style={{ cursor: "help" }}>
      {children}
    </span>
  );
}
