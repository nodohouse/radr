/**
 * Curated monochrome provider wordmarks for the signal-intake scene.
 * Typographic marks with brand-faithful glyphs — not a partner wall.
 * Official partnership is not claimed; capability states live in the catalog.
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
    personio: "Personio",
    netsuite: "NetSuite",
    adyen: "Adyen",
    "uber-eats": "Uber Eats",
    deliveroo: "Deliveroo",
    "booking-connectivity": "Booking.com",
    "open-meteo": "Open-Meteo",
    predicthq: "PredictHQ",
    ticketmaster: "Ticketmaster",
    "google-stack": "Google",
    "google-business-profile": "GBP",
    "google-analytics-4": "GA4",
    "google-search-console": "GSC",
    "google-places": "Places",
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
    width: 16,
    height: 16,
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "toast":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="5"
            width="20"
            height="22"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M11 12.5h10M11 17h7M11 21.5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "lightspeed-restaurant":
      return (
        <svg {...common}>
          <path
            d="M16 4 L28 28 H4 Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M16 12v10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "square":
      return (
        <svg {...common}>
          <rect
            x="6"
            y="6"
            width="20"
            height="20"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <rect
            x="11"
            y="11"
            width="10"
            height="10"
            rx="1.5"
            fill="currentColor"
          />
        </svg>
      );
    case "opentable":
      return (
        <svg {...common}>
          <ellipse
            cx="16"
            cy="16"
            rx="12"
            ry="7.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M16 8.5v15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mews":
      return (
        <svg {...common}>
          <path
            d="M5 24 V9 l5.5 9 5.5-9 5.5 9 5.5-9 v15"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "apaleo":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="16" cy="16" r="3.2" fill="currentColor" />
        </svg>
      );
    case "oracle-opera-cloud":
      return (
        <svg {...common}>
          <rect
            x="4"
            y="10"
            width="24"
            height="12"
            rx="6"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <circle cx="11" cy="16" r="2.4" fill="currentColor" />
        </svg>
      );
    case "siteminder":
      return (
        <svg {...common}>
          <path
            d="M7 24 L16 5 L25 24 Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 16.5h9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "guesty":
      return (
        <svg {...common}>
          <path
            d="M5 22 V12 L16 5 L27 12 V22"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12 22v-6h8v6"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "hostaway":
      return (
        <svg {...common}>
          <path
            d="M4 20h24M7 20V12l9-6 9 6v8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "xero":
      return (
        <svg {...common}>
          <path
            d="M8 8l16 16M24 8L8 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "stripe":
      return (
        <svg {...common}>
          <path
            d="M7 13.5c3-4 15-4 15 2.5s-12 6-15 2.5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mollie":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M10 16h12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "files-csv":
      return (
        <svg {...common}>
          <path
            d="M9 5h9l7 7v15H9V5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M18 5v7h7M12 17h8M12 21h6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "google-stack":
    case "google-business-profile":
    case "google-analytics-4":
    case "google-search-console":
    case "google-places":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M16 6v20M6 16h20"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "adyen":
      return (
        <svg {...common}>
          <path
            d="M7 13.5c3-4 15-4 15 2.5s-12 6-15 2.5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "open-meteo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M16 18h8a4 4 0 0 0 0-8 6 6 0 0 0-11-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "predicthq":
    case "ticketmaster":
      return (
        <svg {...common}>
          <rect
            x="7"
            y="9"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M11 9V7h10v2M12 14h8M12 18h5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect
            x="6"
            y="6"
            width="20"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}
