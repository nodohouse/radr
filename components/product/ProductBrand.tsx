import Image from "next/image";

/** Exact website artwork, including the approved green focal dot. */
export function ProductBrand({ width = 132, className = "", decorative = false }: { width?: number; className?: string; decorative?: boolean }) {
  return <Image className={`product-brand ${className}`} src="/brand/radr-website-color.svg" alt={decorative ? "" : "RADR"} width={width} height={Math.round(width * 45 / 255)} style={{ width, height: "auto", objectFit: "contain", flexShrink: 0 }} priority />;
}
