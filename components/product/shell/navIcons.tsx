/** Simple outline icons for the product rail — 20×20 viewBox. */

import type { ReactNode } from "react";

type IconProps = { className?: string };

export function IconCenter({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconDecisions({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5.5h12M4 10h12M4 14.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconValue({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3.5l1.6 3.4 3.7.4-2.8 2.5.8 3.6L10 11.7 6.7 13.4l.8-3.6L4.7 7.3l3.7-.4L10 3.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLocations({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 17s5-4.2 5-8.2A5 5 0 0 0 5 8.8C5 12.8 10 17 10 17z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** House standards / BOH shelves — not a map pin. */
export function IconHouse({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 8.5h13M3.5 13h13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 8.5v4.5M13 8.5v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconMemory({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconIntelligence({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3.2 12.1 7.4l4.6.5-3.5 3.1.9 4.5L10 13.4 5.9 15.5l.9-4.5L3.3 7.9l4.6-.5L10 3.2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconConnections({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="14.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 10h4.5M13.2 6.5l-2.2 2.2M13.2 13.5l-2.2-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconHealth({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 11.5c0-3.2 2.5-5.8 6-5.8s6 2.6 6 5.8c0 3.4-2.8 5.8-6 7.2-3.2-1.4-6-3.8-6-7.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 11.2h4M10 9.2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 3.5v1.4M10 15.1v1.4M3.5 10h1.4M15.1 10h1.4M5.4 5.4l1 1M13.6 13.6l1 1M14.6 5.4l-1 1M6.4 13.6l-1 1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAsk({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.6 8.2a2.4 2.4 0 0 1 4.5.9c0 1.4-1.4 1.9-2.1 2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.85" fill="currentColor" />
    </svg>
  );
}

export function IconService({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 8h13M8 8v8M12 8v8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5.5h12M4 10h12M4 14.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconMargin({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 14.5 8.2 9.8l2.6 2.4L16 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5 9.6 6l3.7.4-2.8 2.5.8 3.4L8 10.6 4.7 12.3l.8-3.4L2.7 6.4 6.4 6 8 2.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDashboards({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3.5" width="5.5" height="5.5" rx="1.1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3.5" y="11" width="5.5" height="5.5" rx="1.1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="5.5" height="5.5" rx="1.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconLive({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 13.5V8.2L6.2 5.5L9.1 8.1L12.4 4.5L15 7.2V13.5H3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="13.2" cy="4.2" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function IconGuests({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.2" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.5 15.2c.6-2.2 2.2-3.4 3.5-3.4s2.9 1.2 3.5 3.4M11.2 14.8c.4-1.4 1.4-2.2 2.2-2.2s1.6.7 2 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconReports({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3.5h7.5L15.5 6.5V16.5H5V3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.5 9h5M7.5 12h5M7.5 15h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export const NAV_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  "control-center": IconCenter,
  decisions: IconDecisions,
  live: IconLive,
  value: IconValue,
  house: IconHouse,
  service: IconService,
  guests: IconGuests,
  reports: IconReports,
  locations: IconLocations,
  intelligence: IconIntelligence,
  memory: IconMemory,
  connections: IconConnections,
  "data-health": IconHealth,
  dashboards: IconDashboards,
  menu: IconMenu,
  margin: IconMargin,
  settings: IconSettings,
  ask: IconAsk,
};
