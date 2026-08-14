import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050705",
          borderRadius: 36,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100">
          <path
            d="M50 14 L86 84 H14 Z"
            fill="none"
            stroke="#00F56A"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
