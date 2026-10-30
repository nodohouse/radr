/** Thin-line icons for the RADR gateway — decorative, aria-hidden by parent. */

const common = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ModuleIcon({ id }: { id: string }) {
  switch (id) {
    case "service":
    case "kitchen":
      return (
        <svg {...common}>
          <path d="M4 2.5v11M4 2.5c1.6 0 2.8 1.3 2.8 3.6S5.6 9.7 4 9.7M9.5 2.5v11M12 2.5v3.8a2.2 2.2 0 0 1-2.2 2.2" />
        </svg>
      );
    case "guests":
      return (
        <svg {...common}>
          <circle cx="8" cy="5.2" r="2.3" />
          <path d="M3.2 13c.6-2.4 2.3-3.6 4.8-3.6s4.2 1.2 4.8 3.6" />
        </svg>
      );
    case "labor":
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2" />
          <path d="M2.8 13c.4-2 1.8-3.1 3.2-3.1S9 11 9.4 13" />
          <circle cx="11" cy="5.5" r="1.6" />
          <path d="M9.8 13c.2-1.3 1-2.1 2-2.1" />
        </svg>
      );
    case "inventory":
      return (
        <svg {...common}>
          <path d="M2.5 4.5h11l-1.1 7a1.3 1.3 0 0 1-1.3 1H4.9a1.3 1.3 0 0 1-1.3-1L2.5 4.5Z" />
          <path d="M5.5 4.5 6.2 2.8h3.6l.7 1.7" />
        </svg>
      );
    case "decisions":
      return (
        <svg {...common}>
          <path d="M4 3.2h8v9.6H4z" />
          <path d="M6 6h4M6 8.4h4M6 10.8h2.4" />
        </svg>
      );
    case "rooms":
      return (
        <svg {...common}>
          <path d="M2.5 7.5h11v5H2.5z" />
          <path d="M3.5 7.5V5.2A1.7 1.7 0 0 1 5.2 3.5h5.6A1.7 1.7 0 0 1 12.5 5.2v2.3" />
          <path d="M2.5 12.5h11" />
        </svg>
      );
    case "revenue":
      return (
        <svg {...common}>
          <path d="M3 12V5M8 12V7.5M13 12V3.5" />
        </svg>
      );
    case "hk":
    case "housekeeping":
      return (
        <svg {...common}>
          <rect x="2.8" y="3.2" width="10.4" height="9.6" rx="1.4" />
          <path d="M5.2 6.5h5.6M5.2 9h3.8" />
        </svg>
      );
    case "distribution":
      return (
        <svg {...common}>
          <circle cx="4.5" cy="5" r="1.8" />
          <circle cx="11.5" cy="5" r="1.8" />
          <circle cx="8" cy="11.2" r="1.8" />
          <path d="M6 6 7.2 9.4M10 6 8.8 9.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.2" />
        </svg>
      );
  }
}

export function ForkKnifeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M8 4v20M8 4c3 0 5 2.4 5 6.5S11 17 8 17M16 4v20M20.5 4v7a3.5 3.5 0 0 1-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4 14h20v8H4zM5.5 14V10A3 3 0 0 1 8.5 7h11A3 3 0 0 1 22.5 10v4M4 22h20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 14s4.5-3.8 4.5-6.6A4.5 4.5 0 0 0 3.5 7.4C3.5 10.2 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="7.2" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 8h11M8 2.5c1.8 1.6 2.8 3.5 2.8 5.5S9.8 12 8 13.5C6.2 12 5.2 10.1 5.2 8S6.2 4.1 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M9 2.5 4.5 9h3.2L7 13.5 11.5 7H8.3L9 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
