"use client";

/**
 * DecisionPreviewDrawer — thin wrapper → DecisionPeek portal.
 * Kept for import compatibility. Pass decisionId so peek opens
 * even when the row is not in the current Needs You list.
 */

import type { RefObject } from "react";
import { DecisionPeek } from "./DecisionPeek";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import "./decision-peek.css";

export function DecisionPreviewDrawer({
  decisionId,
  row,
  onClose,
  triggerRef,
}: {
  decisionId?: string | null;
  row: NeedsYouRow | null;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <DecisionPeek
      decisionId={decisionId ?? row?.id ?? null}
      row={row}
      onClose={onClose}
      triggerRef={triggerRef}
    />
  );
}
