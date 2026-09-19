"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { VisualAsset } from "@/data/demo/visualAssets";

type Props = {
  asset: VisualAsset;
  priority?: boolean;
  overlay?: ReactNode;
  className?: string;
  aspect?: "21/9" | "16/9" | "4/3" | "3/2" | "1/1";
};

/**
 * Editorial operating scene — one physical context, not decorative collage.
 */
export function OperatingScene({
  asset,
  priority,
  overlay,
  className,
  aspect = "16/9",
}: Props) {
  return (
    <figure
      className={`rp-scene ${className ?? ""}`}
      data-crop={asset.crop ?? "center"}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes="(max-width: 768px) 100vw, 56vw"
        priority={priority}
        className="rp-scene-img"
      />
      <div className="rp-scene-veil" aria-hidden="true" />
      {overlay ? <figcaption className="rp-scene-overlay">{overlay}</figcaption> : null}
    </figure>
  );
}
