"use client";

/**
 * Marketing integration mark — monochrome default, brand tint on hover.
 * Never implies partnership. Assets from /public/vendors/.
 */

import {
  vendorSlugFor,
} from "@/components/product/connections/VendorLogo";
import type { MarqueeItem } from "@/lib/marketing/integrationMarquee";

type Props = {
  item: MarqueeItem;
  active?: boolean;
  onActivate?: (id: string | null) => void;
  size?: number;
};

export function IntegrationLogo({
  item,
  active = false,
  onActivate,
  size = 28,
}: Props) {
  const slug = vendorSlugFor(item.id) ?? vendorSlugFor(item.name);
  const initials = item.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      className="rx30-ilog"
      data-active={active ? "true" : undefined}
      style={{ ["--ilog-brand" as string]: item.brandColor }}
      aria-label={`${item.name} · ${item.category}`}
      aria-expanded={active}
      onMouseEnter={() => onActivate?.(item.id)}
      onMouseLeave={() => onActivate?.(null)}
      onFocus={() => onActivate?.(item.id)}
      onBlur={() => onActivate?.(null)}
      onClick={() => onActivate?.(active ? null : item.id)}
    >
      <span className="rx30-ilog-mark" aria-hidden="true">
        {slug ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/vendors/${slug}.svg`}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <em className="rx30-ilog-fb">{initials}</em>
        )}
      </span>
      <span className="rx30-ilog-name">{item.name}</span>
    </button>
  );
}
