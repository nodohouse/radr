/**
 * Standalone A-mark — approved soft master-v4 SVG only.
 * Prefer `FrozenRadrLogo variant="mark"` / `RadrMarkNode` for new code.
 */

export type AMarkTone = "brand" | "mono" | "inherit";

type Props = {
  className?: string;
  tone?: AMarkTone;
  micro?: boolean;
  title?: string;
};

function srcFromTone(tone: Props["tone"]): string {
  if (tone === "mono") return "/brand/radr-mark-master-v4-mono-black.svg";
  return "/brand/radr-mark-master-v4.svg";
}

export function RadrAMark({
  className = "",
  tone = "inherit",
  title,
}: Props) {
  const decorative = !title;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- frozen brand SVG verbatim
    <img
      src={srcFromTone(tone)}
      alt={decorative ? "" : title || "RADR"}
      aria-hidden={decorative ? true : undefined}
      className={`radr-a-mark ${className}`.trim()}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "contain",
        objectPosition: "center center",
      }}
      draggable={false}
      decoding="async"
    />
  );
}

export { RadrAMark as RadrDeltaGlyph };
