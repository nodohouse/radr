import { ImageResponse } from "next/og";

export const alt = "RADR · Nothing off the RADR.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG share: near-black, A-mark wordmark, slogan. */
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          <span>R</span>
          <svg width="72" height="90" viewBox="0 0 80 100" fill="none">
            <path
              d="M29 12 L10 90"
              stroke="#FFFFFF"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M51 12 L70 90"
              stroke="#FFFFFF"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="40" cy="56" r="7.25" fill="#00D978" />
          </svg>
          <span>DR</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(245,242,235,0.5)",
          }}
        >
          Nothing off the RADR.
        </div>
      </div>
    ),
    { ...size },
  );
}
