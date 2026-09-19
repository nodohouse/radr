import {
  footerSocialLinks,
  type SocialNetwork,
} from "./config/socialLinks";

function Icon({ id }: { id: SocialNetwork }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
    focusable: false as const,
  };

  if (id === "linkedin") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V24H.24V8.25zM8.34 8.25h4.33v2.14h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.01 5.42 6.93V24h-4.52v-7.43c0-1.77-.03-4.05-2.47-4.05-2.47 0-2.85 1.93-2.85 3.92V24H8.34V8.25z"
        />
      </svg>
    );
  }

  if (id === "instagram") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.9 3.9 0 0 1-1.38-.9 3.9 3.9 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.91.04-1.4.19-1.73.32-.44.17-.75.37-1.08.7-.33.33-.53.64-.7 1.08-.13.33-.28.82-.32 1.73-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.91.19 1.4.32 1.73.17.44.37.75.7 1.08.33.33.64.53 1.08.7.33.13.82.28 1.73.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.91-.04 1.4-.19 1.73-.32.44-.17.75-.37 1.08-.7.33-.33.53-.64.7-1.08.13-.33.28-.82.32-1.73.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.91-.19-1.4-.32-1.73a2.3 2.3 0 0 0-.7-1.08 2.3 2.3 0 0 0-1.08-.7c-.33-.13-.82-.28-1.73-.32-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68zm6.94-.98a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56z"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.78 7.75L23.25 22h-6.55l-5.13-6.7L5.7 22H2.58l7.25-8.28L.75 2h6.7l4.63 6.14L18.9 2zm-1.15 18h1.82L6.35 3.9H4.4L17.75 20z"
      />
    </svg>
  );
}

type Props = {
  withLabels?: boolean;
  className?: string;
};

/**
 * Footer socials: LinkedIn + Instagram always visible.
 * Real href only when configured; otherwise non-linking (no invented URLs).
 */
export function SocialIcons({ withLabels = true, className = "" }: Props) {
  const links = footerSocialLinks();
  if (links.length === 0) return null;

  return (
    <ul
      className={`rx-social ${withLabels ? "" : "rx-social--icons"} ${className}`.trim()}
    >
      {links.map((link) => {
        const inner = (
          <>
            <span className="rx-social-icon">
              <Icon id={link.id} />
            </span>
            {withLabels ? (
              <span className="rx-social-label">
                {link.label}
                {link.href ? <span aria-hidden="true"> ↗</span> : null}
              </span>
            ) : null}
          </>
        );

        return (
          <li key={link.id}>
            {link.href ? (
              <a
                href={link.href}
                className="rx-social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} (opens in a new tab)`}
              >
                {inner}
              </a>
            ) : (
              <span
                className="rx-social-link rx-social-link--pending"
                role="img"
                title={`${link.label}: URL not configured yet`}
                aria-label={`${link.label}: coming soon`}
              >
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
