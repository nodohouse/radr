/**
 * Curated monochrome provider wordmarks for the signal-intake scene.
 * Typographic / geometric marks — not unofficial brand asset dumps.
 * Prefer calm visual weight over logo soup.
 */

type Props = {
  id: string;
  name: string;
  className?: string;
};

/** Short display for chips when full wordmark is too long */
export function providerShort(id: string, name: string): string {
  const map: Record<string, string> = {
    toast: "Toast",
    "lightspeed-restaurant": "Lightspeed",
    square: "Square",
    opentable: "OpenTable",
    mews: "Mews",
    apaleo: "Apaleo",
    "oracle-opera-cloud": "OPERA",
    siteminder: "SiteMinder",
    guesty: "Guesty",
    hostaway: "Hostaway",
    xero: "Xero",
    stripe: "Stripe",
    mollie: "Mollie",
    "files-csv": "Files",
    "byod-warehouse": "Warehouse",
  };
  return map[id] ?? name.split(" ")[0]!;
}

export function ProviderWordmark({ id, name, className = "" }: Props) {
  const short = providerShort(id, name);
  return (
    <span
      className={`rx-pwm ${className}`.trim()}
      data-provider={id}
      aria-hidden="true"
    >
      <ProviderGlyph id={id} />
      <em>{short}</em>
    </span>
  );
}

function ProviderGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 32 32",
    width: 18,
    height: 18,
    fill: "none" as const,
    "aria-hidden": true as const,
  };
  const letter = (providerShort(id, id).slice(0, 1) || "?").toUpperCase();

  switch (id) {
    case "toast":
      return (
        <svg {...common}>
          <rect x="7" y="6" width="18" height="20" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 12h10M11 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "lightspeed-restaurant":
      return (
        <svg {...common}>
          <path d="M16 5 L27 27 H5 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "square":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "opentable":
      return (
        <svg {...common}>
          <ellipse cx="16" cy="16" rx="11" ry="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 9v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "mews":
      return (
        <svg {...common}>
          <path
            d="M6 22 V10 l5 8 5-8 5 8 5-8 v12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "apaleo":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="16" r="3.5" fill="currentColor" />
        </svg>
      );
    case "oracle-opera-cloud":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="22" height="12" rx="6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="16" r="2.2" fill="currentColor" />
        </svg>
      );
    case "siteminder":
      return (
        <svg {...common}>
          <path
            d="M8 22 L16 6 L24 22 Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "guesty":
      return (
        <svg {...common}>
          <path
            d="M6 20 V12 L16 6 L26 12 V20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 20v-5h8v5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "hostaway":
      return (
        <svg {...common}>
          <path
            d="M5 18h22M8 18V11l8-5 8 5v7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "xero":
      return (
        <svg {...common}>
          <path d="M9 9l14 14M23 9L9 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "stripe":
      return (
        <svg {...common}>
          <path
            d="M8 13c2.5-3 13-3 13 2s-10.5 5-13 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M16 8v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "mollie":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 16h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "files-csv":
      return (
        <svg {...common}>
          <path
            d="M10 6h8l6 6v14H10V6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M18 6v6h6M13 17h8M13 21h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6" />
          <text
            x="16"
            y="20.5"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            {letter}
          </text>
        </svg>
      );
  }
}
