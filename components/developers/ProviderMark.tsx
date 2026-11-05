"use client";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { VendorLogo } from "@/components/product/connections/VendorLogo";
export function ProviderMark({
  id,
  name,
  size = 32,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  return (
    <span className="rx-dev-provider-mark">
      {id.startsWith("radr-") ? (
        <FrozenRadrLogo variant="mark" width={size * 0.75} />
      ) : id === "files-csv" ? (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <VendorLogo id={id} name={name} size={size} />
      )}
    </span>
  );
}
