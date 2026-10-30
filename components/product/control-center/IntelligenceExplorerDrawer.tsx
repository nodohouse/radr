"use client";

/**
 * Intelligence Explorer — depth-1 drawer.
 * Clicking a driver (depth ≥2) promotes to Focus Mode via onPromoteDepth.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { IntelligenceNodeView } from "@/components/product/intelligence/IntelligenceNodeView";
import {
  contributionNodeFromBridge,
  getIntelligenceNode,
  rootNodeIdForMetric,
} from "@/lib/radr/intelligence/graph";
import "@/components/product/control-center/decision-peek.css";
import "@/components/product/control-center/intel-explorer.css";
import "@/components/product/intelligence/intel-node.css";

type Props = {
  metricId: string | null;
  /** Controlled node when Focus and drawer share state */
  nodeId?: string | null;
  onClose: () => void;
  onOpenDecision?: (id: string) => void;
  /** Depth ≥2: close drawer and open Focus with this node */
  onPromoteDepth?: (nodeId: string) => void;
  onNodeChange?: (nodeId: string) => void;
  triggerRef?: RefObject<HTMLElement | null>;
};

function resolveRoot(metricId: string) {
  const id = rootNodeIdForMetric(metricId);
  if (id === "contribution") return contributionNodeFromBridge();
  return getIntelligenceNode(id) ?? contributionNodeFromBridge();
}

export function IntelligenceExplorerDrawer({
  metricId,
  nodeId: controlledNodeId,
  onClose,
  onOpenDecision,
  onPromoteDepth,
  onNodeChange,
  triggerRef,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const open = Boolean(metricId);
  const [localNodeId, setLocalNodeId] = useState<string | null>(null);

  const activeId =
    controlledNodeId ??
    localNodeId ??
    (metricId ? rootNodeIdForMetric(metricId) : null);

  const handleClose = useCallback(() => {
    onClose();
    setLocalNodeId(null);
    requestAnimationFrame(() => {
      triggerRef?.current?.focus?.();
    });
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (metricId) {
      const root = rootNodeIdForMetric(metricId);
      setLocalNodeId(root);
      onNodeChange?.(root);
    }
  }, [metricId, onNodeChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const shell = document.querySelector<HTMLElement>(
      ".rp-cc4-root, [data-depth='command']",
    );
    if (shell) {
      shell.setAttribute("aria-hidden", "true");
      shell.setAttribute("inert", "");
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (shell) {
        shell.removeAttribute("aria-hidden");
        shell.removeAttribute("inert");
      }
    };
  }, [open, handleClose]);

  if (!open || typeof document === "undefined" || !metricId || !activeId) {
    return null;
  }

  const node =
    activeId === "contribution"
      ? contributionNodeFromBridge()
      : getIntelligenceNode(activeId) ?? resolveRoot(metricId);

  const depth = node.parentId ? 2 : 1;

  const navigate = (nextId: string) => {
    const next = getIntelligenceNode(nextId);
    if (!next) return;
    // Any non-root node → Focus Mode (no nested drawer).
    // Roots (contribution / labor) stay in the drawer.
    if (next.parentId != null && onPromoteDepth) {
      onPromoteDepth(nextId);
      return;
    }
    setLocalNodeId(nextId);
    onNodeChange?.(nextId);
  };

  const nodeBody = (
    <IntelligenceNodeView
      node={node}
      surface="drawer"
      showEvidence={node.kind === "vendor"}
      onNavigate={navigate}
      onOpenDecision={onOpenDecision}
    />
  );

  const portal: ReactNode = (
    <div className="rp-peek rp-iex" data-open="true" data-depth={depth}>
      <button
        type="button"
        className="rp-peek-scrim"
        aria-label="Close intelligence explorer"
        onClick={handleClose}
      />
      <aside
        ref={panelRef}
        className="rp-peek-panel rp-iex-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="rp-peek-head">
          <div>
            <p className="rp-peek-id">Intelligence</p>
            <h2 id={titleId} className="rp-peek-verb">
              {node.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="rp-peek-x"
            aria-label="Close"
            onClick={handleClose}
          >
            ×
          </button>
        </header>
        {nodeBody}
      </aside>
    </div>
  );

  return createPortal(portal, document.body);
}
