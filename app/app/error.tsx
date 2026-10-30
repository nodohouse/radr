"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Product-shell error boundary — keep /app failures out of global-error.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[radr:/app]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
        color: "#e8ebe9",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.12em",
            fontSize: "0.72rem",
            color: "#8a928c",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Something went wrong
        </p>
        <p style={{ color: "#aeb6b0", maxWidth: "28rem", margin: "0.85rem auto 1.25rem" }}>
          Retry this view, or return to Control Center.
        </p>
        {error?.digest ? (
          <p
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.68rem",
              color: "#6a726c",
              margin: "0 0 1rem",
            }}
          >
            ref {error.digest}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "0.65rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#00d978",
              color: "#08100c",
              border: 0,
              padding: "0.65rem 1rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "0.4rem",
            }}
          >
            Retry
          </button>
          <Link
            href="/app"
            style={{
              color: "#e8ebe9",
              border: "1px solid rgba(232,235,233,0.22)",
              padding: "0.65rem 1rem",
              textDecoration: "none",
              borderRadius: "0.4rem",
            }}
          >
            Control Center
          </Link>
        </div>
      </div>
    </div>
  );
}
