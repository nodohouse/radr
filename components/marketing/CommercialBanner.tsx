/**
 * Slim commercial announcement — not a product signal ticker.
 */

import { Link } from "@/i18n/navigation";

export function CommercialBanner() {
  return (
    <div className="rx-commercial-banner" role="note">
      <p className="rx-commercial-banner-inner">
        <span>14-day recovery pilot</span>
        <span aria-hidden="true">·</span>
        <span>Start with exports</span>
        <span aria-hidden="true">·</span>
        <span>No rip-and-replace</span>
        <span aria-hidden="true">·</span>
        <span>Value verified downstream</span>
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
