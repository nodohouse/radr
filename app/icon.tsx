import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Standalone rounded △ favicon — signal green on near-black. */
export default function Icon() {
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
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100">
          <path
            d="M50 14 L86 84 H14 Z"
            fill="none"
            stroke="#00F56A"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
