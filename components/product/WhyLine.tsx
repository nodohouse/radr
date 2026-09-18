type Props = {
  why?: string | null;
  className?: string;
  /** Use span when nested inside buttons / flex rows. */
  as?: "p" | "span";
};

/**
 * Quiet causal reading - the reason that earns attention.
 * No “Why” badge. A soft signal filament + one calm sentence.
 */
export function WhyLine({ why, className, as = "p" }: Props) {
  const text = polishWhy(why);
  if (!text) return null;
  const Tag = as;
  return (
    <Tag
      className={className ? `rp-why ${className}` : "rp-why"}
      aria-label={text}
    >
      <span className="rp-why-filament" aria-hidden="true" />
      <span className="rp-why-copy">{text}</span>
    </Tag>
  );
}

/** Strip schoolroom prefixes and keep one clean sentence. */
function polishWhy(why?: string | null): string | null {
  let text = why?.trim() ?? "";
  if (!text) return null;
  text = text
    .replace(/^(why(\s+it\s+matters)?|because|reason)\s*[: - --]\s*/i, "")
    .replace(/^(owner|floor|kitchen|finance)\s+altitude\s*:\s*/i, "")
    .trim();
  if (!text) return null;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
