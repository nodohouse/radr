"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import type { RadrDashboard } from "@/lib/product/dashboards";

export type SaveStatus =
  | "saved"
  | "saving"
  | "unsaved"
  | "error"
  | "offline";

type Props = {
  dashboard: RadrDashboard;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  previewing: boolean;
  isDefault: boolean;
  isPinned: boolean;
  scopeLabel: string;
  period: DashPeriod;
  onBack: () => void;
  onRename: (name: string) => void;
  onPeriod: (p: DashPeriod) => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoArrange: () => void;
  onPreview: () => void;
  onSave: () => void;
  onShare: () => void;
  onTogglePin: () => void;
  onToggleDefault: () => void;
  onOpenView: () => void;
  onDuplicate: () => void;
};

const PERIODS: { id: DashPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "wtd", label: "WTD" },
  { id: "mtd", label: "MTD" },
  { id: "ytd", label: "YTD" },
];

export function BuilderTopBar({
  dashboard,
  saveStatus,
  canUndo,
  canRedo,
  previewing,
  isDefault,
  isPinned,
  scopeLabel,
  period,
  onBack,
  onRename,
  onPeriod,
  onUndo,
  onRedo,
  onAutoArrange,
  onPreview,
  onSave,
  onShare,
  onTogglePin,
  onToggleDefault,
  onOpenView,
  onDuplicate,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "unsaved"
        ? "Unsaved"
        : saveStatus === "error"
          ? "Error saving"
          : saveStatus === "offline"
            ? "Offline"
            : "Saved";

  return (
    <header className="rp-dbx-bar" data-builder-topbar="true">
      <div className="rp-dbx-bar-left">
        <button type="button" className="rp-dbx-link" onClick={onBack}>
          ← Dashboards
        </button>
        <input
          className="rp-dbx-name"
          value={dashboard.name}
          aria-label="Dashboard name"
          onChange={(e) => onRename(e.target.value)}
          onBlur={() => {
            if (!dashboard.name.trim()) onRename("Untitled dashboard");
          }}
        />
        <span className="rp-dbx-chip" title="Scope follows the app header">
          {scopeLabel}
        </span>
        <select
          className="rp-dbx-period"
          value={period}
          aria-label="Period"
          onChange={(e) => onPeriod(e.target.value as DashPeriod)}
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span
          className="rp-dbx-status"
          data-status={saveStatus}
          role="status"
          aria-live="polite"
        >
          {statusLabel}
        </span>
      </div>

      <div className="rp-dbx-bar-right">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          data-testid="builder-undo"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (⇧⌘Z)"
          data-testid="builder-redo"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={onAutoArrange}
          disabled={previewing}
          title="Auto arrange widgets"
          data-testid="builder-auto-arrange"
        >
          Auto arrange
        </button>
        <span className="rp-dbx-sep" aria-hidden />
        <button
          type="button"
          aria-pressed={previewing}
          onClick={onPreview}
          data-testid="builder-preview"
        >
          {previewing ? "Edit" : "Preview"}
        </button>
        <button type="button" onClick={onShare} data-testid="builder-share">
          Share
        </button>
        <button
          type="button"
          className="rp-dbx-primary"
          onClick={onSave}
          disabled={saveStatus === "saving"}
          title="Save (⌘S)"
          data-testid="builder-save"
        >
          Save
        </button>
        <div className="rp-dbx-more" ref={menuRef}>
          <button
            type="button"
            className="rp-dbx-more-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            aria-label="More actions"
            data-testid="builder-more"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ···
          </button>
          {menuOpen ? (
            <div id={menuId} className="rp-dbx-more-pop" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePin();
                }}
              >
                {isPinned ? "Unpin from nav" : "Pin to nav"}
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="builder-default"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleDefault();
                }}
              >
                {isDefault ? "Clear default landing" : "Set as default"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                Duplicate dashboard
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="builder-done"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenView();
                }}
              >
                Open dashboard
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
