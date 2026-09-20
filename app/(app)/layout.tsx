/**
 * Legacy authenticated shell - retired.
 * Product chrome lives in ProductShell under /app.
 * Pages in this tree only redirect; do not remount AppNav.
 */
export default function LegacyAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
