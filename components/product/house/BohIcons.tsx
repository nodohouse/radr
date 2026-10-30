/** Inline BOH icons — ref-parity, no emoji. */

type IconProps = { className?: string; size?: number };

export function IconSpark({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 16l4-5 3 3 5-7 6 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBox({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 8.5L12 4l9 4.5v9L12 22 3 17.5v-9z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12v10M3 8.5l9 3.5 9-3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconAlert({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5L22 20H2L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4.5M12 17.2v.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconTruck({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 7h12v9H2V7zM14 10h4.5L21 13.5V16h-7v-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="17.5" r="1.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconBars({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 18V10M10 18V6M16 18v-7M22 18V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMic({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 11a6 6 0 0012 0M12 17v3M9 20h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCamera({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 8.5h3l1.5-2.5h7L16 8.5h5V18a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V8.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconDoc({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 3v4h4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconManual({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 4h8v16H8z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8h4M10 12h4M10 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlay({ className, size = 14 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" />
    </svg>
  );
}

export function IconChef({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 10c-2 0-3.5-1.4-3.5-3.2S6 3.5 8 3.5c.4 0 .8.1 1.2.2C10 2.6 11 2 12 2s2 .6 2.8 1.7c.4-.1.8-.2 1.2-.2 2 0 3.5 1.5 3.5 3.3S18 10 16 10H8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10v10h8V10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconInfo({ className, size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v6M12 7.5v.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ className, size = 28 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClock({ className, size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function channelIcon(
  channel: "voice" | "camera" | "document" | "manual" | "note",
  props?: IconProps,
) {
  const ch = channel === "note" ? "manual" : channel;
  if (ch === "voice") return <IconMic {...props} />;
  if (ch === "camera") return <IconCamera {...props} />;
  if (ch === "document") return <IconDoc {...props} />;
  return <IconManual {...props} />;
}
