"use client";

/**
 * Causal / relationship diagram for Decision "Why now" —
 * one relationship visual, not a metric tile soup.
 */

type Node = {
  id: string;
  label: string;
  value: string;
  tone?: "risk" | "watch" | "ok" | "signal";
};

type Stage = {
  id: string;
  label?: string;
  nodes: Node[];
};

type Props = {
  /** Multi-stage causal chain (preferred for Peak). */
  stages?: Stage[];
  /** Legacy flat nodes — still used by Supplier. */
  nodes?: Node[];
  edges?: { from: string; to: string }[];
  footer?: string;
  /** Closing exposure callout on the final arrow. */
  exposure?: { label: string; value: string };
};

export function WhyNowCausal({
  stages,
  nodes,
  edges,
  footer,
  exposure,
}: Props) {
  if (stages?.length) {
    return (
      <div className="rp-causal-viz rp-causal-chain" aria-label="Why now">
        <ol className="rp-causal-stages">
          {stages.map((stage, i) => (
            <li key={stage.id} className="rp-causal-stage">
              {stage.label ? (
                <p className="rp-causal-stage-label">{stage.label}</p>
              ) : null}
              <ul className="rp-causal-stage-nodes">
                {stage.nodes.map((n) => (
                  <li key={n.id} data-tone={n.tone ?? "signal"}>
                    <em>{n.label}</em>
                    <strong>{n.value}</strong>
                  </li>
                ))}
              </ul>
              {i < stages.length - 1 ? (
                <span className="rp-causal-arrow" aria-hidden="true">
                  ↓
                </span>
              ) : exposure ? (
                <span className="rp-causal-arrow rp-causal-arrow-end" aria-hidden="true">
                  ↓
                </span>
              ) : null}
            </li>
          ))}
          {exposure ? (
            <li className="rp-causal-stage rp-causal-exposure" data-tone="ok">
              <p className="rp-causal-stage-label">{exposure.label}</p>
              <strong>{exposure.value}</strong>
            </li>
          ) : null}
        </ol>
        {footer ? <p className="rp-causal-foot">{footer}</p> : null}
      </div>
    );
  }

  const flat = nodes ?? [];
  return (
    <div className="rp-causal-viz" aria-label="Why now">
      <ul className="rp-causal-nodes">
        {flat.map((n) => (
          <li key={n.id} data-tone={n.tone}>
            <em>{n.label}</em>
            <strong>{n.value}</strong>
          </li>
        ))}
      </ul>
      {edges?.length ? (
        <p className="rp-causal-flow" aria-hidden="true">
          {edges.map((e, i) => {
            const from = flat.find((n) => n.id === e.from);
            const to = flat.find((n) => n.id === e.to);
            if (!from || !to) return null;
            return (
              <span key={`${e.from}-${e.to}-${i}`}>
                {from.value}
                <span>→</span>
                {to.value}
              </span>
            );
          })}
        </p>
      ) : null}
      {footer ? <p className="rp-causal-foot">{footer}</p> : null}
    </div>
  );
}

/** D-1911 — one causal relationship, not eight equal tiles. */
export const PEAK_WHY_NOW = {
  stages: [
    {
      id: "drivers",
      label: "Demand",
      nodes: [
        { id: "inbound", label: "Inbound", value: "38", tone: "watch" as const },
        { id: "delivery", label: "Delivery", value: "+31%", tone: "risk" as const },
        { id: "walkins", label: "Walk-ins", value: "2", tone: "watch" as const },
      ],
    },
    {
      id: "kitchen",
      label: "Kitchen",
      nodes: [
        {
          id: "load",
          label: "Load",
          value: "92 → 97%",
          tone: "risk" as const,
        },
      ],
    },
    {
      id: "service",
      label: "Service",
      nodes: [
        { id: "ticket", label: "Ticket time", value: "rising", tone: "watch" as const },
        {
          id: "turns",
          label: "Second turns",
          value: "at risk",
          tone: "risk" as const,
        },
      ],
    },
  ],
  exposure: { label: "At stake", value: "€620" },
  footer: "Empty tables are not free capacity when kitchen ≥90% and inbound is already forming.",
};

export const SUPPLIER_WHY_NOW = {
  nodes: [
    { id: "contract", label: "Contract", value: "€6.80/L", tone: "ok" as const },
    { id: "invoice", label: "Invoice", value: "€7.45/L", tone: "risk" as const },
    { id: "qty", label: "Delivery", value: "420 L" },
    { id: "var", label: "Variance", value: "€273", tone: "risk" as const },
    { id: "usage", label: "Usage", value: "+4%", tone: "watch" as const },
    { id: "contrib", label: "Dish contrib", value: "−13.2%", tone: "risk" as const },
  ],
  edges: [
    { from: "contract", to: "var" },
    { from: "invoice", to: "var" },
    { from: "qty", to: "var" },
    { from: "var", to: "contrib" },
    { from: "usage", to: "contrib" },
  ],
  footer: "Price effect and usage effect are separate",
};
