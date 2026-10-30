/**
 * Slim commercial announcement — not a product signal ticker.
 * Site-wide, above primary nav. Distinct from hero proof rail.
 */

import { Link } from "@/i18n/navigation";

export function CommercialBanner() {
  return (
    <div className="rx-commercial-banner" role="note">
      <p className="rx-commercial-banner-inner">
        <span>Decision intelligence for hospitality</span>
        <span aria-hidden="true" className="rx-commercial-banner-dot">
          ·
        </span>
        <span>Above the stack you already run</span>
        <span
          aria-hidden="true"
          className="rx-commercial-banner-dot rx-commercial-banner-hide-sm"
        >
          ·
        </span>
        <span className="rx-commercial-banner-hide-sm">No rip-and-replace</span>
        <Link
          href="/signup"
          className="rx-commercial-banner-cta"
        >
          Get started <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
