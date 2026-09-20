"use client";

/**
 * FloorMoment — compact home / platform depth beat.
 */

import { FloorLive } from "./FloorLive";

export function FloorMoment({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rx-floor-moment" data-compact="true">
        <p className="rx-rec-k">RADR Floor</p>
        <h2 className="rx-rec-h">From finance to the floor.</h2>
        <FloorLive compact />
      </div>
    );
  }

  return <FloorLive />;
}
