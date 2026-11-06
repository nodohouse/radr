import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt =
  "RADR. Nothing off the RADR. The adaptive decision system for hospitality.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/radr-wordmark-master-v4-white.svg"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "68px 76px",
          color: "white",
          background: "linear-gradient(110deg, #081d62, #075fff)",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={`data:image/svg+xml;base64,${logo.toString("base64")}`}
          width={220}
          height={48}
          alt="RADR"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -5,
            lineHeight: 1.05,
          }}
        >
          <span>Nothing off</span>
          <span style={{ color: "#00f59a" }}>the RADR.</span>
        </div>
        <div style={{ display: "flex", fontSize: 27, color: "#e6f2ff" }}>
          The adaptive decision system for hospitality.
        </div>
      </div>
    ),
    size,
  );
}
