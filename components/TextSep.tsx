/**
 * Semantic text separator for inline metadata.
 * Prefer this over CSS `gap` alone so screen readers and copy/paste
 * do not jam labels, values, venues, and statuses together.
 *
 * Default: comma between peers. Pass ": " between label and value.
 * Use `srOnly` when the visual stack must stay gap-only but the
 * accessibility tree needs a break.
 */
export function TextSep({
  children = ", ",
  className = "rx-text-sep",
  srOnly = false,
}: {
  children?: string;
  className?: string;
  srOnly?: boolean;
}) {
  return (
    <span className={srOnly ? "sr-only" : className}>{children}</span>
  );
}
