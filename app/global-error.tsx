"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Generic app error boundary — RADR visual language, no redesign.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#08100c",
          color: "#f7faf8",
          fontFamily: "Instrument Sans, system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.12em",
              fontSize: "0.75rem",
              color: "#626a65",
              textTransform: "uppercase",
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontWeight: 500, fontSize: "1.75rem", margin: "0.75rem 0" }}>
            RADR could not finish this request.
          </h1>
          <p style={{ color: "#626a65", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
            Retry the page, or return home. If it continues, contact us.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#00d978",
                color: "#08100c",
                border: 0,
                padding: "0.7rem 1.1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <Link
              href="/en"
              style={{
                color: "#f7faf8",
                border: "1px solid rgba(247,250,248,0.25)",
                padding: "0.7rem 1.1rem",
                textDecoration: "none",
              }}
            >
              Go home
            </Link>
            <Link
              href="/en/contact"
              style={{
                color: "#f7faf8",
                border: "1px solid rgba(247,250,248,0.25)",
                padding: "0.7rem 1.1rem",
                textDecoration: "none",
              }}
            >
              Contact
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
