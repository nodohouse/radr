"use client";

/**
 * RoleProjectionStrip — Same RADR. Different person.
 * Compact home section — not a Floor page clone.
 */

import { Link } from "@/i18n/navigation";
import { RoleProjection } from "./RoleProjection";

export function RoleProjectionStrip() {
  return (
    <div className="rx-role-strip">
      <p className="rx-rec-k">Across the operation</p>
      <h2 className="rx-rec-h">Same RADR. Different person.</h2>
      <RoleProjection />
      <Link href="/product/floor" className="rx-btn rx-btn-ghost">
        Explore RADR Floor <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
