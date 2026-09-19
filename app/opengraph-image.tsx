import { ImageResponse } from "next/og";

export const alt = "RADR · Nothing off the RADR.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Simple OG share image: near-black, large △, wordmark, slogan. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050705",
          color: "#F5F2EB",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 100 100">
          <path
            d="M50 12 L88 86 H12 Z"
            fill="none"
            stroke="#00F56A"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 72,
            fontWeight: 650,
            letterSpacing: "0.12em",
            display: "flex",
            alignItems: "center",
          }}
        >
          RADR
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(245,242,235,0.55)",
          }}
        >
          Nothing off the RADR.
        </div>
      </div>
    ),
    { ...size },
  );
}
