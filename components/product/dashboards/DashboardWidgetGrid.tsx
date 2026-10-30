"use client";

/**
 * Dashboard view mode — 12-col grid placed by each widget's x / y / w / h.
 * Editing lives in DashboardBuilder (/app/dashboards/[id]/edit).
 */

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import type { DashboardWidget } from "@/lib/product/dashboards";
import { layoutWidgets, moduleTitle } from "@/lib/product/dashboards";
import { widgetHref } from "@/lib/product/dashboardBuilder";
import { DashboardModuleBody } from "@/components/product/dashboards/DashboardModule";
import "@/components/product/dashboards/dashboard-builder.css";

export function widgetDisplayTitle(widget: DashboardWidget): string {
  return widget.config?.title?.trim() || moduleTitle(widget.intelligenceModuleId);
}

export function placementStyle(w: DashboardWidget): CSSProperties {
  return {
    "--dbx-x": w.x + 1,
    "--dbx-y": w.y + 1,
    "--dbx-w": w.w,
    "--dbx-h": w.h,
  } as CSSProperties;
}

type Props = {
  widgets: DashboardWidget[];
};

export function DashboardWidgetGrid({ widgets }: Props) {
  const placed = useMemo(() => layoutWidgets(widgets), [widgets]);
  if (placed.length === 0) return null;

  return (
    <div className="rp-dgrid" data-testid="dashboard-grid">
      {placed.map((w) => {
        const href = widgetHref(w.intelligenceModuleId);
        return (
          <article
            key={w.id}
            className="rp-dash-widget rp-dgrid-item"
            data-size={w.size}
            data-module={w.intelligenceModuleId}
            style={placementStyle(w)}
          >
            <header>
              <strong>{widgetDisplayTitle(w)}</strong>
              {href ? <Link href={href}>Open →</Link> : null}
            </header>
            <div className="rp-dash-widget-live">
              <DashboardModuleBody widget={w} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
