"use client";

import type { LiveRecoveryEvent } from "@/lib/radr/activeRevenue";

type Props = {
  events: LiveRecoveryEvent[];
  onSelect?: (opportunityId: string) => void;
};

/**
 * Compact LIVE NOW feed - important operating events only.
 */
export function LiveRecoveryFeed({ events, onSelect }: Props) {
  if (events.length === 0) return null;
  return (
    <section className="rp-lrr-live" aria-label="Live now">
      <p className="rp-ari-kicker">Live now</p>
      <ul className="rp-lrr-live-list">
        {events.slice(0, 5).map((e) => (
          <li key={e.id} data-tone={e.tone}>
            <time dateTime={e.at}>{e.at}</time>
            {e.opportunityId && onSelect ? (
              <button
                type="button"
                className="rp-lrr-live-btn"
                onClick={() => onSelect(e.opportunityId!)}
              >
                {e.label}
              </button>
            ) : (
              <span>{e.label}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
