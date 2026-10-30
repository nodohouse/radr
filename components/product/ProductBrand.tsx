import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";

/** One approved immutable master across the product, including Ask RADR. */
export function ProductBrand({ width = 132, className = "", decorative = false }: { width?: number; className?: string; decorative?: boolean }) {
  return <FrozenRadrLogo variant="wordmark" theme="light" width={width} className={`product-brand ${className}`} decorative={decorative} priority />;
}
