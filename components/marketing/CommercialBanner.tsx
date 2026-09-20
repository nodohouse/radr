/**
 * Slim commercial announcement — not a product signal ticker.
 * Site-wide, above primary nav. Distinct from hero proof rail.
 */

import { Link } from "@/i18n/navigation";

export function CommercialBanner() {
  return (
    <div className="rx-commercial-banner" role="note">
      <p className="rx-commercial-banner-inner">
        <span>14-day recovery pilot</span>
        <span aria-hidden="true" className="rx-commercial-banner-dot">
          ·
        </span>
        <span>Start with exports</span>
        <span
          aria-hidden="true"
          className="rx-commercial-banner-dot rx-commercial-banner-hide-sm"
        >
          ·
        </span>
        <span className="rx-commercial-banner-hide-sm">No rip-and-replace</span>
        <span
          aria-hidden="true"
          className="rx-commercial-banner-dot rx-commercial-banner-hide-sm"
        >
          ·
        </span>
        <span className="rx-commercial-banner-hide-sm">
          Value verified downstream
        </span>
        <Link
          href="/contact?intent=recovery-pilot"
          className="rx-commercial-banner-cta"
        >
          Scope a pilot <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
