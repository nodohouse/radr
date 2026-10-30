"use client";

/** Right rail — properties for the selected widget (or the dashboard itself). */

import Link from "next/link";
import type { DashboardWidget, RadrDashboard } from "@/lib/product/dashboards";
import { moduleTitle } from "@/lib/product/dashboards";
import {
  WIDTH_PRESETS,
  categoryOfModule,
  constraintsForModule,
  widgetHref,
} from "@/lib/product/dashboardBuilder";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  GRID_COLS,
  MAX_H,
  MIN_H,
} from "@/lib/product/dashboardLayout";
import {
  COMPARISON_OPTIONS,
  PERIOD_OPTIONS,
  SCOPE_OPTIONS,
  allowedVisualizations,
  chartRecommendation,
  effectiveVisualization,
  recommendedVisualization,
  visualizationLabel,
  type WidgetComparison,
  type WidgetConfigFields,
  type WidgetPeriodMode,
  type WidgetScopeMode,
  type WidgetVisualization,
} from "@/lib/product/dashboardWidgetConfig";

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <div className="rp-dbx-field">
      <span id={`${testId}-l`}>{label}</span>
      <div className="rp-dbx-stepper" role="group" aria-labelledby={`${testId}-l`}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <output data-testid={testId}>{value}</output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function BuilderProperties({
  dashboard,
  widget,
  onRename,
  onDescribe,
  onTitle,
  onText,
  onConfig,
  onResize,
  onMove,
  onDuplicate,
  onRemove,
  onDeselect,
}: {
  dashboard: RadrDashboard;
  widget: DashboardWidget | null;
  onRename: (name: string) => void;
  onDescribe: (description: string) => void;
  onTitle: (id: string, title: string) => void;
  onText: (id: string, text: string) => void;
  onConfig: (id: string, patch: WidgetConfigFields, key: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onDeselect: () => void;
}) {
  const { isHotel } = useDemoOrg();
  if (!widget) {
    return (
      <aside className="rp-dbx-panel rp-dbx-props" aria-label="Properties">
        <div className="rp-dbx-panel-head">
          <h2>Inspector</h2>
          <p>Select a widget on the canvas to configure it.</p>
        </div>
        <label className="rp-dbx-field rp-dbx-field-text">
          <span>Name</span>
          <input
            value={dashboard.name}
            onChange={(e) => onRename(e.target.value)}
            aria-label="Dashboard name"
          />
        </label>
        <label className="rp-dbx-field rp-dbx-field-text">
          <span>Description</span>
          <textarea
            rows={3}
            value={dashboard.description}
            onChange={(e) => onDescribe(e.target.value)}
          />
        </label>
        <dl className="rp-dbx-facts">
          <div>
            <dt>Widgets</dt>
            <dd>{dashboard.widgets.length}</dd>
          </div>
        </dl>
        <p className="rp-dbx-hint">
          Drag the header to move · pull an edge or corner to resize · arrow
          keys nudge, Shift + arrows resize, Delete removes.
        </p>
      </aside>
    );
  }

  const base = moduleTitle(widget.intelligenceModuleId);
  const href = widgetHref(widget.intelligenceModuleId);
  const isText = widget.intelligenceModuleId === "builder_text";
  const constraints = constraintsForModule(widget.intelligenceModuleId);
  const minW = constraints.minW;
  const minH = constraints.minH;
  const maxH = constraints.maxH ?? MAX_H;
  const vizOptions = allowedVisualizations(widget.intelligenceModuleId);
  const viz = effectiveVisualization(
    widget.intelligenceModuleId,
    widget.config,
  );
  const tip = chartRecommendation(widget.intelligenceModuleId, viz);
  const cfg = widget.config ?? {};

  const patch = (partial: WidgetConfigFields, key: string) =>
    onConfig(widget.id, partial, key);

  return (
    <aside
      className="rp-dbx-panel rp-dbx-props"
      aria-label="Widget properties"
      data-testid="widget-properties"
    >
      <div className="rp-dbx-panel-head">
        <p className="rp-dbx-kicker">
          {categoryOfModule(
            widget.intelligenceModuleId,
            isHotel ? "hotel" : "restaurant",
          )}
        </p>
        <h2>{cfg.title?.trim() || base}</h2>
        <button type="button" className="rp-dbx-link" onClick={onDeselect}>
          ← Dashboard settings
        </button>
      </div>

      <section className="rp-dbx-section" aria-label="Widget">
        <h3>Widget</h3>
        <label className="rp-dbx-field rp-dbx-field-text">
          <span>Title</span>
          <input
            value={cfg.title ?? ""}
            placeholder={base}
            onChange={(e) => onTitle(widget.id, e.target.value)}
            data-testid="prop-title"
          />
        </label>
        <p className="rp-dbx-hint" style={{ margin: 0 }}>
          Metric · <strong>{base}</strong>
        </p>
      </section>

      {isText ? (
        <label className="rp-dbx-field rp-dbx-field-text">
          <span>Note</span>
          <textarea
            rows={5}
            value={cfg.text ?? ""}
            placeholder="Tonight: two private events, kitchen short one cook…"
            onChange={(e) => onText(widget.id, e.target.value)}
          />
        </label>
      ) : null}

      {!isText ? (
        <section className="rp-dbx-section" aria-label="Visualization">
          <h3>Visualization</h3>
          <div
            className="rp-dbx-presets rp-dbx-viz"
            role="group"
            aria-label="Chart type"
          >
            {vizOptions.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={viz === v}
                data-viz={v}
                onClick={() =>
                  patch({ visualization: v as WidgetVisualization }, `viz:${widget.id}`)
                }
              >
                {visualizationLabel(v)}
              </button>
            ))}
          </div>
          {tip ? (
            <div className="rp-dbx-reco" data-chart-reco="true">
              <strong>RADR suggests</strong>
              <p>{tip}</p>
              <button
                type="button"
                className="rp-dbx-link"
                data-apply-reco="true"
                onClick={() =>
                  patch(
                    {
                      visualization: recommendedVisualization(
                        widget.intelligenceModuleId,
                      ),
                    },
                    `viz-rec:${widget.id}`,
                  )
                }
              >
                Apply recommendation
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isText ? (
        <section className="rp-dbx-section" aria-label="Context">
          <h3>Context</h3>
          <label className="rp-dbx-field rp-dbx-field-text">
            <span>Scope</span>
            <select
              value={cfg.scopeMode ?? "inherit"}
              data-testid="prop-scope"
              onChange={(e) =>
                patch(
                  { scopeMode: e.target.value as WidgetScopeMode },
                  `scope:${widget.id}`,
                )
              }
            >
              {SCOPE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id === "all" && isHotel
                    ? "All properties"
                    : o.id === "location" && isHotel
                      ? "Current property"
                      : o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rp-dbx-field rp-dbx-field-text">
            <span>Period</span>
            <select
              value={cfg.periodMode ?? "inherit"}
              data-testid="prop-period"
              onChange={(e) =>
                patch(
                  { periodMode: e.target.value as WidgetPeriodMode },
                  `period:${widget.id}`,
                )
              }
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rp-dbx-field rp-dbx-field-text">
            <span>Comparison</span>
            <select
              value={cfg.comparison ?? "forecast"}
              data-testid="prop-comparison"
              onChange={(e) =>
                patch(
                  { comparison: e.target.value as WidgetComparison },
                  `cmp:${widget.id}`,
                )
              }
            >
              {COMPARISON_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {!isText ? (
        <section className="rp-dbx-section" aria-label="Display">
          <h3>Display</h3>
          <label className="rp-dbx-check">
            <input
              type="checkbox"
              checked={cfg.showVariance !== false}
              data-testid="prop-variance"
              onChange={(e) =>
                patch(
                  { showVariance: e.target.checked },
                  `var:${widget.id}`,
                )
              }
            />
            <span>Show variance %</span>
          </label>
          <label className="rp-dbx-check">
            <input
              type="checkbox"
              checked={Boolean(cfg.showLive)}
              data-testid="prop-live"
              onChange={(e) =>
                patch({ showLive: e.target.checked }, `live:${widget.id}`)
              }
            />
            <span>Show LIVE indicator</span>
          </label>
          <label className="rp-dbx-check">
            <input
              type="checkbox"
              checked={Boolean(cfg.compact)}
              data-testid="prop-compact"
              onChange={(e) =>
                patch({ compact: e.target.checked }, `cmpct:${widget.id}`)
              }
            />
            <span>Compact density</span>
          </label>
        </section>
      ) : null}

      <section className="rp-dbx-section" aria-label="Layout">
        <h3>Layout</h3>
        <div className="rp-dbx-field">
          <span>Size</span>
          <div className="rp-dbx-presets" role="group" aria-label="Width preset">
            {WIDTH_PRESETS.filter((p) => p.w >= minW).map((p) => (
              <button
                key={p.label}
                type="button"
                aria-pressed={widget.w === p.w}
                onClick={() => onResize(widget.id, p.w, widget.h)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rp-dbx-grid2">
          <Stepper
            label="Width"
            testId="prop-w"
            value={widget.w}
            min={minW}
            max={GRID_COLS}
            onChange={(v) => onResize(widget.id, v, widget.h)}
          />
          <Stepper
            label="Height"
            testId="prop-h"
            value={widget.h}
            min={Math.max(MIN_H, minH)}
            max={maxH}
            onChange={(v) => onResize(widget.id, widget.w, v)}
          />
          <Stepper
            label="Column"
            testId="prop-x"
            value={widget.x + 1}
            min={1}
            max={GRID_COLS - widget.w + 1}
            onChange={(v) => onMove(widget.id, v - 1, widget.y)}
          />
          <Stepper
            label="Row"
            testId="prop-y"
            value={widget.y + 1}
            min={1}
            max={99}
            onChange={(v) => onMove(widget.id, widget.x, v - 1)}
          />
        </div>
      </section>

      <div className="rp-dbx-actions">
        <button type="button" onClick={() => onDuplicate(widget.id)}>
          Duplicate
        </button>
        <button
          type="button"
          className="rp-dbx-danger"
          data-testid="remove-widget"
          onClick={() => onRemove(widget.id)}
        >
          Remove
        </button>
      </div>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noreferrer"
          className="rp-dbx-link"
        >
          Open module ↗
        </Link>
      ) : null}
    </aside>
  );
}
