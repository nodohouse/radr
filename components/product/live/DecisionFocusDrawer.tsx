"use client";

/**
 * DecisionFocusDrawer — Live surface uses DecisionPeek portal.
 */

import { DecisionPeek } from "@/components/product/control-center/DecisionPeek";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import "@/components/product/control-center/decision-peek.css";

type Props = {
  decisionId: string | null;
  row?: NeedsYouRow | null;
  onClose: () => void;
};

export function DecisionFocusDrawer({ decisionId, row, onClose }: Props) {
  return (
    <DecisionPeek decisionId={decisionId} row={row} onClose={onClose} />
  );
}
