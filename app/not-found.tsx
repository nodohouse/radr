import type { Metadata } from "next";
import Link from "next/link";

/**
 * Root 404 fallback (English, no next-intl provider).
 * Localized 404: app/[locale]/not-found.tsx
 */
export const metadata: Metadata = {
  title: "Nothing here · RADR",
  description: "Nothing here on the RADR.",
};

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#070807",
          color: "#f5f2eb",
          fontFamily:
            "var(--font-body), Source Sans 3, system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <main style={{ textAlign: "center", maxWidth: "28rem" }}>
          <p
            style={{
              margin: "0 0 0.75rem",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(245,242,235,0.45)",
            }}
          >
            Nothing here on the RADR
          </p>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem" }}>
            Signal lost.
          </h1>
          <p style={{ margin: "0 0 1.5rem", color: "rgba(245,242,235,0.7)" }}>
            This page is off the map.
          </p>
          <Link
            href="/en"
            style={{
              color: "#00f56a",
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            Return home →
          </Link>
        </main>
      </body>
    </html>
  );
}
