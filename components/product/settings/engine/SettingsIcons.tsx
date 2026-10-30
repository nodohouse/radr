/** Compact line icons — glyphs optically centered in a 20×20 viewBox. */

import type { ReactNode } from "react";

type IconProps = { className?: string };

function Glyph({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.6 12.6 16.25 16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconOrg({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect
        x="4"
        y="7.25"
        width="12"
        height="7.5"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.25 7.25V6a2.75 2.75 0 0 1 5.5 0v1.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Glyph>
  );
}

export function IconLocations({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path
        d="M10 15.75s4.5-3.4 4.5-6.5a4.5 4.5 0 1 0-9 0c0 3.1 4.5 6.5 4.5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="9" r="1.45" stroke="currentColor" strokeWidth="1.5" />
    </Glyph>
  );
}

export function IconContext({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.75 10h12.5M10 3.75c1.8 1.7 2.7 3.8 2.7 6.25S11.8 14.55 10 16.25M10 3.75C8.2 5.45 7.3 7.55 7.3 10s.9 4.55 2.7 6.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Glyph>
  );
}

export function IconForecast({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path
        d="M3.5 13.5 7.75 9.25l2.75 2.75L16.5 6.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.25 6.25h4.25v4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

export function IconWorkforce({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="7.25" cy="7.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.5" cy="8.25" r="1.85" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.25 15.25c.55-2.1 2.15-3.1 4-3.1s3.4 1 4 3.1M12 12.4c1-.4 2.1-.5 3.15.15 1.15.7 1.85 1.85 2.1 2.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconAccess({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect
        x="5"
        y="8.5"
        width="10"
        height="6.75"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 8.5V7a2.5 2.5 0 0 1 5 0v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Glyph>
  );
}

export function IconPolicies({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path
        d="M5.75 4.25h5.75L14.25 7v8.75H5.75z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 10h4.5M7.75 12.5h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconAutonomy({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3.5v2M10 14.5v2M3.5 10h2M14.5 10h2M5.4 5.4l1.4 1.4M13.2 13.2l1.4 1.4M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconAttention({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path
        d="M10 4.25 16.25 15.25H3.75z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.25v3.25M10 13.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconNotifications({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path
        d="M5.5 13.75V9a4.5 4.5 0 0 1 9 0v4.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 13.75h12M8.75 15.35a1.25 1.25 0 0 0 2.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconIntegrations({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3.75" y="3.75" width="5.25" height="5.25" rx="1.1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3.75" width="5.25" height="5.25" rx="1.1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.75" y="11" width="5.25" height="5.25" rx="1.1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.6 11v5.25M11 13.6h5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconAudit({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M5.5 4h9v12h-9z" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 7.25h5M7.5 10h5M7.5 12.75h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.75V10l2.25 1.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export function IconCurrency({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.35 7.6c-.45-.6-1.15-.85-2.2-.85-1.55 0-2.6.85-2.6 2.15s1 1.9 2.6 2.15 2.6.85 2.6 2.15-1 2.15-2.6 2.15c-1.05 0-1.85-.35-2.3-.95M10 5.5v1.1M10 13.4v1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

export const NAV_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  organization: IconOrg,
  locations: IconLocations,
  context: IconContext,
  forecasting: IconForecast,
  workforce: IconWorkforce,
  access: IconAccess,
  policies: IconPolicies,
  autonomy: IconAutonomy,
  attention: IconAttention,
  notifications: IconNotifications,
  integrations: IconIntegrations,
  audit: IconAudit,
};
